import axios from 'axios';
import crypto from 'crypto';

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

        console.log("🚀 Processando Lead:", email);

        // 1. FACEBOOK CAPI (Independente)
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
        } catch (e) { console.error('⚠️ Erro Face:', e.message); }

        // 2. AGENDOR CRM (Try/Catch Silencioso)
        try {
            const rawToken = process.env.AGENDOR_TOKEN || "";
            const cleanToken = rawToken.replace(/['"]+/g, '').trim();

            if (cleanToken) {
                await axios.post(
                    'https://api.agendor.com.br/v3/people/upsert',
                    {
                        email: email,
                        name: nomeCompleto,
                        contact: {
                            email: email,
                            mobile: telefone, // O Agendor pode validar formato aqui
                            work: telefone
                        },
                        role: nomeMarca,
                        description: `Segmento: ${temMarca} | Newsletter: ${newsletter ? 'Sim' : 'Não'} | Origem: LP`
                    },
                    {
                        headers: { 'Authorization': `Token ${cleanToken}`, 'Content-Type': 'application/json' }
                    }
                );
                console.log("✅ Agendor Sucesso");
            }
        } catch (agendorError) {
            // IMPORTANTE: Apenas logamos o erro, NÃO retornamos 400.
            // Isso garante que o usuário consiga baixar o ebook mesmo se o telefone estiver errado.
            console.error("⚠️ Agendor Recusou (Dados Inválidos ou Token):", agendorError.response?.data || agendorError.message);
        }

        // 3. RETORNO DE SUCESSO (Sempre)
        // O usuário sempre recebe OK para prosseguir com o download
        return res.status(200).json({ success: true, message: "Processado (com ou sem CRM)" });

    } catch (fatalError) {
        console.error("🔥 Erro Fatal:", fatalError);
        return res.status(500).json({ error: "Erro interno" });
    }
}
