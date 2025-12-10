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

        console.log("🚀 Iniciando processamento:", email);

        // 1. FACEBOOK CAPI
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
        try {
            const rawToken = process.env.AGENDOR_TOKEN || "";
            const cleanToken = rawToken.replace(/['"]+/g, '').trim();
            const phoneClean = cleanPhone(telefone);

            if (cleanToken) {
                const authHeader = { headers: { 'Authorization': `Token ${cleanToken}` } };

                // A. UPSERT PESSOA
                console.log("👤 Upsert Pessoa...");
                const personResponse = await axios.post(
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

                const personId = personResponse.data?.data?.id || personResponse.data?.id;

                if (personId) {
                    // B. BUSCA DE FUNIL (COM TRAVA DE SEGURANÇA)
                    const funnelsRes = await axios.get('https://api.agendor.com.br/v3/funnels', {
                        ...authHeader,
                        params: { limit: 100, enabled: true }
                    });

                    const allFunnels = funnelsRes.data.data || [];

                    // Busca EXATA pelo nome visto no log (com trim para garantir)
                    const targetFunnel = allFunnels.find(f =>
                        f.name && f.name.trim() === "FUNIL LP TERCEIRIZADA"
                    );

                    if (targetFunnel && targetFunnel.stages && targetFunnel.stages.length > 0) {
                        const stageId = targetFunnel.stages[0].id;
                        console.log(`✅ Funil ALVO Localizado: "${targetFunnel.name}" (ID Etapa: ${stageId})`);

                        // C. CRIAR NEGÓCIO (Somente se temos o ID da etapa)
                        await axios.post(
                            `https://api.agendor.com.br/v3/people/${personId}/deals`,
                            {
                                title: `${nomeCompleto} | ${nomeMarca} | BAIXOU O EBOOK!`,
                                value: 0,
                                dealStage: stageId, // OBRIGATÓRIO PARA O FUNIL CERTO
                                description: "Lead capturado via Landing Page."
                            },
                            authHeader
                        );
                        console.log("✅ 💼 Negócio criado no Funil LP TERCEIRIZADA!");

                    } else {
                        // TRAVA DE SEGURANÇA:
                        // Se não achou o funil, NÃO cria negócio genérico (para não cair no Instagram).
                        // Apenas avisa no log para debug.
                        console.error("⛔ ABORTANDO CRIAÇÃO DE NEGÓCIO: Funil 'FUNIL LP TERCEIRIZADA' não encontrado ou sem etapas.");
                        console.error("Funis disponíveis:", JSON.stringify(allFunnels.map(f => f.name)));
                    }
                }
            }
        } catch (agendorError) {
            console.error("⚠️ Erro CRM:", agendorError.response?.data || agendorError.message);
        }

        return res.status(200).json({ success: true });

    } catch (fatalError) {
        console.error("🔥 Fatal:", fatalError.message);
        return res.status(500).json({ error: fatalError.message });
    }
}
