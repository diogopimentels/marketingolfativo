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

        // 1. FACEBOOK
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

        if (cleanToken) {
            const authHeader = { headers: { 'Authorization': `Token ${cleanToken}` } };

            try {
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

                if (personId) {
                    // B. BUSCA DIRETA DO FUNIL (Para pegar as etapas)
                    console.log("🔎 Buscando detalhes do Funil 813360...");

                    const funnelRes = await axios.get('https://api.agendor.com.br/v3/funnels/813360', authHeader);
                    const funnelData = funnelRes.data.data || funnelRes.data;

                    if (funnelData && funnelData.stages && funnelData.stages.length > 0) {
                        const firstStageId = funnelData.stages[0].id;
                        console.log(`✅ Etapa encontrada: ${firstStageId}`);

                        // C. CRIAR NEGÓCIO
                        console.log("💼 Criando Negócio...");
                        await axios.post(
                            `https://api.agendor.com.br/v3/people/${personId}/deals`,
                            {
                                title: `${nomeCompleto} | ${nomeMarca} | BAIXOU O EBOOK!`,
                                value: 0,
                                dealStage: firstStageId, // Agora temos o ID real
                                description: "Lead capturado via Landing Page."
                            },
                            authHeader
                        );
                        console.log("✅ SUCESSO: Negócio criado no funil correto!");

                    } else {
                        console.error("⛔ Funil 813360 não retornou etapas. Verifique o ID.");
                    }
                }
            } catch (crmErr) {
                // Loga erro mas não trava o site
                console.error("⚠️ Erro CRM:", crmErr.response?.data || crmErr.message);
            }
        }

        // Retorna sucesso para o frontend liberar o download
        return res.status(200).json({ success: true });

    } catch (fatalError) {
        console.error("🔥 Fatal:", fatalError.message);
        return res.status(500).json({ error: fatalError.message });
    }
}
