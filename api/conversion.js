import axios from 'axios';
import crypto from 'crypto';

function cleanPhone(phone) {
    if (!phone) return null;
    return phone.replace(/\D/g, ''); // Remove tudo que não é número
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

        console.log("🚀 Lead Recebido:", email);

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

        // 2. AGENDOR CRM (BLINDADO - NÃO TRAVA O SITE)
        try {
            const rawToken = process.env.AGENDOR_TOKEN || "";
            const cleanToken = rawToken.replace(/['"]+/g, '').trim();
            const phoneClean = cleanPhone(telefone);

            if (cleanToken) {
                await axios.post(
                    'https://api.agendor.com.br/v3/people/upsert',
                    {
                        email: email,
                        name: nomeCompleto,
                        contact: {
                            email: email,
                            mobile: phoneClean, // Voltando para 'mobile' que é mais aceito
                            work: phoneClean
                        },
                        role: nomeMarca,
                        description: `Segmento: ${temMarca} | News: ${newsletter ? 'Sim' : 'Não'} | Origem: LP`
                    },
                    {
                        headers: { 'Authorization': `Token ${cleanToken}`, 'Content-Type': 'application/json' }
                    }
                );
                console.log("✅ Agendor Salvo!");
            }
        } catch (agendorError) {
            // O PULO DO GATO: Logamos o erro mas NÃO retornamos erro pro site
            console.error("⚠️ Agendor falhou mas o baile segue:", agendorError.response?.data || agendorError.message);
        }

        // 3. RETORNO DE SUCESSO (SEMPRE)
        // O usuário consegue baixar o ebook independente do que acontecer no CRM
        return res.status(200).json({ success: true, message: "Lead processado" });

    } catch (fatalError) {
        console.error("🔥 Erro Fatal:", fatalError);
        // Erro 500 só se o código quebrar muito feio (o que é difícil aqui)
        return res.status(500).json({ error: "Erro interno" });
    }
}
