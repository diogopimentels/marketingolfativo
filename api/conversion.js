import axios from 'axios';
import crypto from 'crypto';

export default async function handler(req, res) {
    // CORS setup
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    try {
        const { email, eventId, userAgent, nomeCompleto, telefone, nomeMarca, temMarca, newsletter } = req.body;

        // 1. FACEBOOK (Mantemos try/catch para não travar se falhar)
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

        // 2. AGENDOR (Agora com Debug Crítico)
        let rawToken = process.env.AGENDOR_TOKEN || "";
        // Remove aspas duplas ou simples que podem ter vindo do .env
        const cleanToken = rawToken.replace(/['"]+/g, '').trim();

        if (!cleanToken) {
            throw new Error("Token do Agendor não encontrado nas variáveis de ambiente da Vercel!");
        }

        console.log("Enviando para Agendor:", { email, nomeCompleto });

        try {
            const response = await axios.post(
                'https://api.agendor.com.br/v3/people/upsert',
                {
                    email: email,
                    name: nomeCompleto,
                    contact: {
                        email: email,
                        mobile: telefone,
                        work: telefone
                    },
                    role: nomeMarca, // Usando cargo para guardar a marca
                    description: `Segmento: ${temMarca} | Newsletter: ${newsletter} | Origem: LP`
                },
                {
                    headers: {
                        'Authorization': `Token ${cleanToken}`, // Garante o formato correto
                        'Content-Type': 'application/json'
                    }
                }
            );
            console.log("✅ Sucesso Agendor:", response.status);
        } catch (agendorError) {
            // AQUI ESTÁ O SEGREDO: Pegamos a mensagem real do erro
            const errorData = agendorError.response?.data;
            const errorMessage = JSON.stringify(errorData || agendorError.message);

            console.error("❌ ERRO AGENDOR RETORNADO:", errorMessage);

            // Retornamos ERRO para o frontend mostrar o toast vermelho
            return res.status(400).json({
                error: "Falha no CRM Agendor",
                details: errorData || agendorError.message
            });
        }

        return res.status(200).json({ success: true });

    } catch (fatalError) {
        return res.status(500).json({ error: fatalError.message });
    }
}
