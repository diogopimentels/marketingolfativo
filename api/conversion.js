import axios from 'axios';
import crypto from 'crypto';

function cleanPhone(phone) {
    if (!phone) return null;
    return phone.replace(/\D/g, '');
}

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    try {
        const { email, eventId, userAgent, nomeCompleto, telefone, nomeMarca, temMarca, newsletter } = req.body;

        console.log("🚀 Processando:", email);

        // 1. FACEBOOK (Ignora erro para focar no CRM)
        try {
            if (process.env.FB_PIXEL_ID && process.env.FB_ACCESS_TOKEN) {
                const emailHash = crypto.createHash('sha256').update(email.toLowerCase().trim()).digest('hex');
                await axios.post(
                    `https://graph.facebook.com/v18.0/${process.env.FB_PIXEL_ID}/events?access_token=${process.env.FB_ACCESS_TOKEN}`,
                    { data: [{ event_name: 'Lead', event_time: Math.floor(Date.now() / 1000), event_id: eventId, user_data: { em: [emailHash], client_user_agent: userAgent, client_ip_address: req.headers['x-forwarded-for'] || '0.0.0.0' }, action_source: 'website' }] }
                );
            }
        } catch (e) { console.error('Face ignorado:', e.message); }

        // 2. AGENDOR CRM
        const rawToken = process.env.AGENDOR_TOKEN || "";
        const cleanToken = rawToken.replace(/['"]+/g, '').trim();
        const phoneClean = cleanPhone(telefone);

        if (!cleanToken) throw new Error("Token Agendor ausente");

        const authHeader = { headers: { 'Authorization': `Token ${cleanToken}` } };

        // A. UPSERT PESSOA
        console.log("👤 Criando Pessoa...");
        const personRes = await axios.post(
            'https://api.agendor.com.br/v3/people/upsert',
            {
                email: email,
                name: nomeCompleto,
                contact: { email: email, mobile_phone: phoneClean, work_phone: phoneClean },
                role: nomeMarca,
                description: `Segmento: ${temMarca} | News: ${newsletter ? 'Sim' : 'Não'} | Origem: LP`
            },
            authHeader
        );

        const personId = personRes.data?.data?.id || personRes.data?.id;
        console.log("✅ Pessoa ID:", personId);

        if (personId) {
            // B. BUSCAR FUNIL
            console.log("🔎 Buscando Funil...");
            const funnelsRes = await axios.get('https://api.agendor.com.br/v3/funnels', {
                ...authHeader,
                params: { limit: 100, enabled: true }
            });

            const allFunnels = funnelsRes.data.data || [];
            const targetFunnel = allFunnels.find(f => {
                const name = (f.name || "").toUpperCase();
                return name.includes("LP TERCEIRIZADA");
            });

            let stageId = null;
            if (targetFunnel && targetFunnel.stages && targetFunnel.stages.length > 0) {
                stageId = targetFunnel.stages[0].id;
                console.log(`✅ Funil Encontrado: ${targetFunnel.name} (Stage ID: ${stageId})`);
            } else {
                console.warn("⚠️ Funil LP TERCEIRIZADA não achado. Usando padrão.");
            }

            // C. CRIAR NEGÓCIO (AQUI ESTÁ O DEBUG CRÍTICO)
            try {
                const dealPayload = {
                    title: `${nomeCompleto} | ${nomeMarca} | BAIXOU O EBOOK!`,
                    value: 0,
                    description: "Lead capturado via Landing Page.",
                    ...(stageId && { dealStage: stageId }) // Só envia se achou o ID
                };

                console.log("💼 Tentando criar negócio com payload:", JSON.stringify(dealPayload));

                await axios.post(
                    `https://api.agendor.com.br/v3/people/${personId}/deals`,
                    dealPayload,
                    authHeader
                );
                console.log("✅ Negócio criado!");

            } catch (dealError) {
                // AGORA VAMOS VER O ERRO!
                const msg = dealError.response?.data || dealError.message;
                console.error("❌ ERRO AO CRIAR DEAL:", JSON.stringify(msg));

                // Retorna 400 para o frontend mostrar o erro vermelho
                return res.status(400).json({
                    error: "Erro na criação do Negócio",
                    detalhes: msg
                });
            }
        }

        return res.status(200).json({ success: true });

    } catch (fatalError) {
        console.error("🔥 Fatal:", fatalError.message);
        return res.status(500).json({ error: fatalError.message });
    }
}
