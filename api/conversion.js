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

        console.log("🚀 Processando:", email);

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

        // 2. AGENDOR CRM (FLUXO DUPLO: PESSOA -> NEGÓCIO)
        try {
            const rawToken = process.env.AGENDOR_TOKEN || "";
            const cleanToken = rawToken.replace(/['"]+/g, '').trim();
            const phoneClean = cleanPhone(telefone);

            if (cleanToken) {
                // PASSO A: Criar/Atualizar Pessoa
                const personPayload = {
                    email: email,
                    name: nomeCompleto,
                    contact: {
                        email: email,
                        mobile: phoneClean, // Campo 'mobile' (V3 legacy) costuma ser mais seguro, ou 'mobile_phone'
                        work: phoneClean
                    },
                    role: nomeMarca,
                    description: `Segmento: ${temMarca} | News: ${newsletter ? 'Sim' : 'Não'} | Origem: LP`
                };

                console.log("👤 Criando Pessoa...");
                const personResponse = await axios.post(
                    'https://api.agendor.com.br/v3/people/upsert',
                    personPayload,
                    { headers: { 'Authorization': `Token ${cleanToken}` } }
                );

                // PASSO B: Criar Negócio (Se conseguiu o ID da pessoa)
                // O Agendor retorna os dados dentro de data.data.id
                const personId = personResponse.data?.data?.id;

                if (personId) {
                    console.log(`💼 Criando Negócio para ID: ${personId}`);

                    const dealTitle = `${nomeCompleto} | ${nomeMarca} | BAIXOU O EBOOK!`;

                    await axios.post(
                        `https://api.agendor.com.br/v3/people/${personId}/deals`,
                        {
                            title: dealTitle,
                            dealStage: 1, // 1 = Primeira etapa do funil (padrão)
                            value: 0
                        },
                        { headers: { 'Authorization': `Token ${cleanToken}` } }
                    );
                    console.log("✅ Negócio Criado com Sucesso!");
                } else {
                    console.warn("⚠️ Pessoa criada, mas ID não retornado. Negócio não criado.");
                }
            }
        } catch (agendorError) {
            // Logamos o erro mas não travamos o site
            console.error("⚠️ Erro CRM:", agendorError.response?.data || agendorError.message);
        }

        return res.status(200).json({ success: true, message: "Lead processado" });

    } catch (fatalError) {
        console.error("🔥 Erro Fatal:", fatalError);
        return res.status(500).json({ error: "Erro interno" });
    }
}
