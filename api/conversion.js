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

        console.log("🚀 Iniciando Debug:", email);

        // 1. FACEBOOK (Ignora erro)
        try {
            if (process.env.FB_PIXEL_ID && process.env.FB_ACCESS_TOKEN) {
                const emailHash = crypto.createHash('sha256').update(email.toLowerCase().trim()).digest('hex');
                axios.post(
                    `https://graph.facebook.com/v18.0/${process.env.FB_PIXEL_ID}/events?access_token=${process.env.FB_ACCESS_TOKEN}`,
                    { data: [{ event_name: 'Lead', event_time: Math.floor(Date.now() / 1000), event_id: eventId, user_data: { em: [emailHash], client_user_agent: userAgent, client_ip_address: req.headers['x-forwarded-for'] || '0.0.0.0' }, action_source: 'website' }] }
                ).catch(e => console.error('Face erro:', e.message));
            }
        } catch (e) { }

        // 2. AGENDOR CRM
        const rawToken = process.env.AGENDOR_TOKEN || "";
        const cleanToken = rawToken.replace(/['"]+/g, '').trim();
        const phoneClean = cleanPhone(telefone);
        const authHeader = { headers: { 'Authorization': `Token ${cleanToken}` } };

        // A. UPSERT PESSOA
        console.log("👤 Criando Pessoa...");
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
            const msg = err.response?.data || err.message;
            return res.status(400).json({ error: "Erro ao criar Pessoa", details: msg });
        }

        if (!personId) return res.status(500).json({ error: "ID da pessoa não retornado." });

        // B. BUSCA FUNIL ID 813360
        console.log("🔎 Buscando Funil 813360...");
        let targetStageId = null;

        try {
            const funnelsRes = await axios.get('https://api.agendor.com.br/v3/funnels', {
                ...authHeader,
                params: { limit: 100, enabled: true }
            });

            const allFunnels = funnelsRes.data.data || [];

            // Procura ID convertendo pra string pra não ter erro de tipo
            const targetFunnel = allFunnels.find(f => String(f.id) === "813360");

            if (targetFunnel) {
                if (targetFunnel.stages && targetFunnel.stages.length > 0) {
                    targetStageId = targetFunnel.stages[0].id;
                    console.log(`✅ Funil 813360 Encontrado! Stage: ${targetStageId}`);
                } else {
                    return res.status(400).json({ error: "Funil 813360 encontrado, mas SEM ETAPAS cadastradas." });
                }
            } else {
                // SE NÃO ACHAR, DEVOLVE ERRO COM LISTA DO QUE TEM
                const idsDisponiveis = allFunnels.map(f => `${f.name} (${f.id})`);
                console.error("⛔ Funil 813360 não está na lista.");
                return res.status(400).json({
                    error: "Funil ID 813360 não encontrado (Verifique permissões do Token)",
                    disponiveis: idsDisponiveis
                });
            }
        } catch (err) {
            return res.status(400).json({ error: "Erro ao listar funis", details: err.message });
        }

        // C. CRIAR NEGÓCIO (Agora vai ou racha)
        try {
            console.log(`💼 Criando Deal para Pessoa ${personId} na Etapa ${targetStageId}...`);
            await axios.post(
                `https://api.agendor.com.br/v3/people/${personId}/deals`,
                {
                    title: `${nomeCompleto} | ${nomeMarca} | BAIXOU O EBOOK!`,
                    value: 0,
                    dealStage: targetStageId,
                    description: "Lead capturado via Landing Page."
                },
                authHeader
            );
            console.log("✅ SUCESSO ABSOLUTO!");
            return res.status(200).json({ success: true });

        } catch (dealErr) {
            // AQUI ESTÁ O OURO: O MOTIVO DO ERRO
            const msg = dealErr.response?.data || dealErr.message;
            console.error("❌ ERRO FATAL DEAL:", JSON.stringify(msg));
            return res.status(500).json({
                error: "O Agendor recusou a criação do Negócio",
                motivo_agendor: msg
            });
        }

    } catch (fatalError) {
        return res.status(500).json({ error: fatalError.message });
    }
}
