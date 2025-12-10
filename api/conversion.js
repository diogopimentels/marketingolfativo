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

        // 1. FACEBOOK (Silent)
        try {
            if (process.env.FB_PIXEL_ID && process.env.FB_ACCESS_TOKEN) {
                const emailHash = crypto.createHash('sha256').update(email.toLowerCase().trim()).digest('hex');
                axios.post(
                    `https://graph.facebook.com/v18.0/${process.env.FB_PIXEL_ID}/events?access_token=${process.env.FB_ACCESS_TOKEN}`,
                    { data: [{ event_name: 'Lead', event_time: Math.floor(Date.now() / 1000), event_id: eventId, user_data: { em: [emailHash], client_user_agent: userAgent, client_ip_address: req.headers['x-forwarded-for'] || '0.0.0.0' }, action_source: 'website' }] }
                ).catch(() => { });
            }
        } catch (e) { }

        // 2. AGENDOR CRM
        const rawToken = process.env.AGENDOR_TOKEN || "";
        const cleanToken = rawToken.replace(/['"]+/g, '').trim();
        const phoneClean = cleanPhone(telefone);
        const authHeader = { headers: { 'Authorization': `Token ${cleanToken}` } };

        // A. UPSERT PESSOA
        console.log("👤 Upsert Pessoa...");
        let personId = null;
        try {
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
            personId = personRes.data?.data?.id || personRes.data?.id;
        } catch (err) {
            // Retorna erro se falhar na pessoa
            return res.status(400).json({ error: "Erro Pessoa", details: err.response?.data || err.message });
        }

        if (!personId) return res.status(500).json({ error: "ID Pessoa não retornado" });

        // B. BUSCA DETALHES FUNIL 813360
        console.log("🔎 Buscando Funil 813360...");
        let firstStageId = null;

        try {
            const funnelRes = await axios.get('https://api.agendor.com.br/v3/funnels/813360', authHeader);

            // LOG CRÍTICO PARA DEBUG:
            console.log("📦 Resposta Funil:", JSON.stringify(funnelRes.data));

            const funnelData = funnelRes.data.data || funnelRes.data;
            const stages = funnelData.stages || [];

            if (stages.length > 0) {
                firstStageId = stages[0].id;
                console.log(`✅ ID da Etapa: ${firstStageId}`);
            } else {
                return res.status(400).json({ error: "Funil 813360 sem etapas", raw_response: funnelRes.data });
            }
        } catch (err) {
            return res.status(400).json({ error: "Erro ao buscar Funil 813360", details: err.response?.data || err.message });
        }

        // C. CRIAR NEGÓCIO
        try {
            console.log(`💼 Criando Deal na etapa ${firstStageId}...`);
            await axios.post(
                `https://api.agendor.com.br/v3/people/${personId}/deals`,
                {
                    title: `${nomeCompleto} | ${nomeMarca} | BAIXOU O EBOOK!`,
                    value: 0,
                    dealStage: firstStageId,
                    description: "Lead capturado via Landing Page."
                },
                authHeader
            );
            console.log("✅ SUCESSO!");
            return res.status(200).json({ success: true });

        } catch (dealErr) {
            // EXPOE O ERRO FINAL
            const msg = dealErr.response?.data || dealErr.message;
            console.error("❌ ERRO DEAL:", JSON.stringify(msg));
            return res.status(400).json({ error: "Erro ao criar Negócio", details: msg });
        }

    } catch (fatalError) {
        return res.status(500).json({ error: fatalError.message });
    }
}
