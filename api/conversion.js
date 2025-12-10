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

        console.log("🚀 Processando Lead:", email);

        // 1. FACEBOOK CAPI
        try {
            if (process.env.FB_PIXEL_ID && process.env.FB_ACCESS_TOKEN) {
                const emailHash = crypto.createHash('sha256').update(email.toLowerCase().trim()).digest('hex');
                await axios.post(
                    `https://graph.facebook.com/v18.0/${process.env.FB_PIXEL_ID}/events?access_token=${process.env.FB_ACCESS_TOKEN}`,
                    {
                        data: [{
                            event_name: 'Lead',
                            event_time: Math.floor(Date.now() / 1000),
                            event_id: eventId,
                            user_data: { em: [emailHash], client_user_agent: userAgent, client_ip_address: req.headers['x-forwarded-for'] || '0.0.0.0' },
                            action_source: 'website',
                        }]
                    }
                );
            }
        } catch (e) { console.error('Erro Face:', e.message); }

        // 2. AGENDOR CRM
        try {
            const rawToken = process.env.AGENDOR_TOKEN || "";
            const cleanToken = rawToken.replace(/['"]+/g, '').trim();
            const phoneClean = cleanPhone(telefone);

            if (cleanToken) {
                const authHeader = { headers: { 'Authorization': `Token ${cleanToken}` } };

                // A. CRIAR PESSOA
                console.log("👤 Upsert Pessoa...");
                const personResponse = await axios.post(
                    'https://api.agendor.com.br/v3/people/upsert',
                    {
                        email: email,
                        name: nomeCompleto,
                        contact: { email: email, mobile_phone: phoneClean, work_phone: phoneClean },
                        role: nomeMarca,
                        description: `Segmento: ${temMarca} | Origem: LP`
                    },
                    authHeader
                );

                const personId = personResponse.data?.data?.id || personResponse.data?.id;

                if (personId) {
                    // B. BUSCAR FUNIL CORRETO (A Mágica acontece aqui)
                    let targetStageId = null;
                    try {
                        console.log("🔎 Buscando Funil 'TERCEIRIZADA'...");
                        const funnelsRes = await axios.get('https://api.agendor.com.br/v3/funnels', authHeader);

                        // Procura o funil pelo nome
                        const targetFunnel = funnelsRes.data.data.find(f =>
                            f.name && f.name.toUpperCase().includes("TERCEIRIZADA")
                        );

                        if (targetFunnel && targetFunnel.stages && targetFunnel.stages.length > 0) {
                            targetStageId = targetFunnel.stages[0].id;
                            console.log(`✅ Funil encontrado: ${targetFunnel.name} (Stage ID: ${targetStageId})`);
                        } else {
                            console.warn("⚠️ Funil 'TERCEIRIZADA' não encontrado. Usando padrão.");
                        }
                    } catch (funnelError) {
                        console.error("Erro ao buscar funis:", funnelError.message);
                    }

                    // C. CRIAR NEGÓCIO
                    const dealTitle = `${nomeCompleto} | ${nomeMarca} | BAIXOU O EBOOK!`;
                    const dealPayload = {
                        title: dealTitle,
                        value: 0,
                        description: "Lead capturado via Landing Page."
                    };

                    // Se achamos o funil certo, forçamos a etapa. Se não, vai pro padrão.
                    if (targetStageId) {
                        dealPayload.dealStage = targetStageId;
                    }

                    await axios.post(
                        `https://api.agendor.com.br/v3/people/${personId}/deals`,
                        dealPayload,
                        authHeader
                    );
                    console.log("✅ 💼 Negócio Criado no Funil Correto!");
                }
            }
        } catch (agendorError) {
            console.error("⚠️ Erro CRM:", agendorError.response?.data || agendorError.message);
        }

        return res.status(200).json({ success: true });

    } catch (fatalError) {
        console.error("🔥 Erro Fatal:", fatalError);
        return res.status(500).json({ error: "Erro interno" });
    }
}
