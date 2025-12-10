import axios from 'axios';
import crypto from 'crypto';

function cleanPhone(phone) {
    if (!phone) return null;
    return phone.replace(/\D/g, '');
}

export default async function handler(req, res) {
    // Configuração CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    try {
        const { email, eventId, userAgent, nomeCompleto, telefone, nomeMarca, temMarca, newsletter } = req.body;

        console.log("🚀 Processando Lead:", email);

        // 1. FACEBOOK CAPI (Este a gente ignora erro pra não travar)
        try {
            if (process.env.FB_PIXEL_ID && process.env.FB_ACCESS_TOKEN) {
                const emailHash = crypto.createHash('sha256').update(email.toLowerCase().trim()).digest('hex');
                await axios.post(
                    `https://graph.facebook.com/v18.0/${process.env.FB_PIXEL_ID}/events?access_token=${process.env.FB_ACCESS_TOKEN}`,
                    { data: [{ event_name: 'Lead', event_time: Math.floor(Date.now() / 1000), event_id: eventId, user_data: { em: [emailHash], client_user_agent: userAgent, client_ip_address: req.headers['x-forwarded-for'] || '0.0.0.0' }, action_source: 'website' }] }
                );
            }
        } catch (e) { console.error('Face ignorado:', e.message); }

        // 2. AGENDOR CRM - MODO DEBUG ATIVADO
        const rawToken = process.env.AGENDOR_TOKEN || "";
        const cleanToken = rawToken.replace(/['"]+/g, '').trim();
        const phoneClean = cleanPhone(telefone);

        if (!cleanToken) {
            return res.status(500).json({ error: "Token do Agendor não configurado na Vercel" });
        }

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
        } catch (personError) {
            const msg = personError.response?.data || personError.message;
            console.error("❌ Erro ao criar Pessoa:", JSON.stringify(msg));
            return res.status(400).json({ error: "Erro ao criar Pessoa no Agendor", details: msg });
        }

        if (personId) {
            // B. BUSCA FUNIL (LP + TERCEIRIZADA)
            console.log("🔎 Buscando Funil...");
            let targetStageId = null;
            let targetFunnelName = "";

            try {
                const funnelsRes = await axios.get('https://api.agendor.com.br/v3/funnels', {
                    ...authHeader,
                    params: { limit: 100, enabled: true }
                });

                const allFunnels = funnelsRes.data.data || [];

                // BUSCA POR PALAVRAS-CHAVE
                const targetFunnel = allFunnels.find(f => {
                    const name = (f.name || "").toUpperCase();
                    return name.includes("LP") && name.includes("TERCEIRIZADA");
                });

                if (targetFunnel) {
                    if (targetFunnel.stages && targetFunnel.stages.length > 0) {
                        targetStageId = targetFunnel.stages[0].id;
                        targetFunnelName = targetFunnel.name;
                        console.log(`✅ Funil Encontrado: ${targetFunnel.name} (ID Etapa: ${targetStageId})`);
                    } else {
                        throw new Error(`Funil '${targetFunnel.name}' encontrado, mas não possui etapas cadastradas.`);
                    }
                } else {
                    // SE NÃO ACHAR, RETORNA ERRO COM A LISTA DISPONÍVEL
                    const nomes = allFunnels.map(f => f.name);
                    console.error("⛔ Funil LP TERCEIRIZADA não encontrado. Disponíveis:", JSON.stringify(nomes));
                    return res.status(400).json({
                        error: "Funil 'LP TERCEIRIZADA' não encontrado.",
                        disponiveis: nomes
                    });
                }
            } catch (funnelError) {
                console.error("❌ Erro na busca de funis:", funnelError.message);
                // Retorna erro explicito se falhar na busca
                return res.status(400).json({ error: "Erro ao buscar funis", details: funnelError.message });
            }

            // C. CRIAR NEGÓCIO (DEAL)
            console.log(`💼 Criando Negócio no funil: ${targetFunnelName}...`);

            try {
                await axios.post(
                    `https://api.agendor.com.br/v3/people/${personId}/deals`,
                    {
                        title: `${nomeCompleto} | ${nomeMarca} | BAIXOU O EBOOK!`,
                        value: 0,
                        dealStage: targetStageId, // ID OBRIGATÓRIO
                        description: "Lead capturado via Landing Page."
                    },
                    authHeader
                );
                console.log("✅ SUCESSO TOTAL: Negócio Criado!");
            } catch (dealError) {
                // AQUI VAI APARECER O MOTIVO REAL SE FALHAR
                const msg = dealError.response?.data || dealError.message;
                console.error("❌ ERRO AO CRIAR DEAL:", JSON.stringify(msg));
                return res.status(400).json({ error: "Erro ao criar Negócio", details: msg });
            }

        } else {
            return res.status(500).json({ error: "ID da pessoa não retornado pelo Agendor." });
        }

        return res.status(200).json({ success: true });

    } catch (fatalError) {
        console.error("🔥 Fatal:", fatalError);
        return res.status(500).json({ error: fatalError.message });
    }
}
