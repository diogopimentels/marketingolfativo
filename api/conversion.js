import axios from 'axios';
import crypto from 'crypto';

// Função para limpar telefone (Agendor odeia formatação)
function cleanPhone(phone) {
    if (!phone) return "";
    return phone.replace(/\D/g, ''); // Remove ( ) - e espaços
}

export default async function handler(req, res) {
    // CORS Setup
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    try {
        const { email, eventId, userAgent, nomeCompleto, telefone, nomeMarca, temMarca, newsletter } = req.body;

        console.log("🚀 Recebido:", email);

        // 1. FACEBOOK (Mantemos o try/catch aqui pq o Face não é o foco do erro agora)
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

        // 2. AGENDOR CRM (SEM TRY/CATCH SILENCIOSO)
        // Se der erro aqui, VAI dar erro no frontend e mostrar o motivo.
        const rawToken = process.env.AGENDOR_TOKEN || "";
        const cleanToken = rawToken.replace(/['"]+/g, '').trim();

        if (!cleanToken) {
            throw new Error("Token do Agendor não configurado na Vercel");
        }

        const phoneClean = cleanPhone(telefone);

        // Payload oficial V3 Agendor
        const agendorPayload = {
            email: email, // Identificador único
            name: nomeCompleto,
            contact: {
                email: email,
                mobile_phone: phoneClean, // V3 pede mobile_phone
                work_phone: phoneClean
            },
            // Usamos 'role' (Cargo) para a marca, pois criar Organization exige outro endpoint
            role: nomeMarca,
            description: `Segmento: ${temMarca} | News: ${newsletter ? 'Sim' : 'Não'}`
        };

        console.log("📤 Enviando pro Agendor:", JSON.stringify(agendorPayload));

        try {
            const response = await axios.post(
                'https://api.agendor.com.br/v3/people/upsert',
                agendorPayload,
                {
                    headers: {
                        'Authorization': `Token ${cleanToken}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            console.log("✅ Agendor Sucesso:", response.status);
        } catch (agendorError) {
            // CAPTURA O ERRO REAL DO AGENDOR
            const errorResponse = agendorError.response?.data;
            console.error("❌ ERRO FATAL AGENDOR:", JSON.stringify(errorResponse));

            // DEVOLVE O ERRO PRO FRONTEND (Não engole mais!)
            return res.status(400).json({
                error: "Agendor Recusou",
                details: errorResponse || agendorError.message
            });
        }

        return res.status(200).json({ success: true });

    } catch (fatalError) {
        console.error("🔥 Erro Servidor:", fatalError);
        return res.status(500).json({ error: fatalError.message });
    }
}
