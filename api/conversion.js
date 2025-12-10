import axios from 'axios';
import crypto from 'crypto';

function cleanPhone(phone) {
    if (!phone) return null;
    return phone.replace(/\D/g, '');
}

export default async function handler(req, res) {
    // CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    try {
        const { email, eventId, userAgent, nomeCompleto, telefone, nomeMarca, temMarca, newsletter } = req.body;

        console.log("🚀 Processando:", email);

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

        // 2. AGENDOR CRM (NUCLEAR OPTION: ID 813360)
        try {
            const rawToken = process.env.AGENDOR_TOKEN || "";
            const cleanToken = rawToken.replace(/['"]+/g, '').trim();
            const phoneClean = cleanPhone(telefone);

            if (cleanToken) {
                const authHeader = { headers: { 'Authorization': `Token ${cleanToken}` } };

                // A. CRIAR PESSOA
                console.log("👤 Upsert Pessoa...");
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
                    // B. BUSCA DIRETA PELO ID 813360
                    // Precisamos buscar os estágios desse funil específico
                    console.log("🎯 Buscando estágios do Funil #813360...");

                    let targetStageId = null;

                    // Puxamos todos os funis (a API V3 não tem endpoint direto de stages sem listar funis as vezes, mas garantimos com a lista)
                    const funnelsRes = await axios.get('https://api.agendor.com.br/v3/funnels', {
                        ...authHeader,
                        params: { limit: 100, enabled: true }
                    });

                    // Encontra pelo ID numérico (converte para string pra garantir a comparação)
                    const targetFunnel = funnelsRes.data.data.find(f => String(f.id) === "813360");

                    if (targetFunnel && targetFunnel.stages && targetFunnel.stages.length > 0) {
                        targetStageId = targetFunnel.stages[0].id;
                        console.log(`✅ Funil #813360 Encontrado! Usando Etapa ID: ${targetStageId}`);

                        // C. CRIAR NEGÓCIO
                        await axios.post(
                            `https://api.agendor.com.br/v3/people/${personId}/deals`,
                            {
                                title: `${nomeCompleto} | ${nomeMarca} | BAIXOU O EBOOK!`,
                                value: 0,
                                dealStage: targetStageId, // ID DA ETAPA CORRETA
                                description: "Lead capturado via Landing Page."
                            },
                            authHeader
                        );
                        console.log("✅ 💼 Negócio Criado no Funil #813360!");

                    } else {
                        console.error("⛔ CRÍTICO: Funil ID 813360 não encontrado na lista retornada pela API.");
                        // Loga os IDs disponíveis para debug se der ruim
                        console.log("IDs Disponíveis:", funnelsRes.data.data.map(f => f.id));
                    }
                }
            }
        } catch (agendorError) {
            // Logamos o erro mas deixamos o usuário seguir
            console.error("⚠️ Erro CRM:", agendorError.response?.data || agendorError.message);
        }

        // Retorna SUCESSO sempre, para o usuário baixar o ebook
        return res.status(200).json({ success: true });

    } catch (fatalError) {
        console.error("🔥 Fatal:", fatalError.message);
        return res.status(500).json({ error: "Erro interno" });
    }
}
