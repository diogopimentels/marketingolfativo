import axios from 'axios';
import crypto from 'crypto';

export default async function handler(req, res) {
    // 1. Configuração Manual de CORS (Essencial para Mobile/Produção)
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    // Responder imediatamente a preflight requests
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { email, eventId, userAgent, nomeCompleto, telefone, nomeMarca, temMarca } = req.body;

        // --- Lógica 1: Facebook CAPI ---
        try {
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
            console.log('✅ FB CAPI Enviado');
        } catch (err) { console.error('Erro FB:', err.message); }

        // --- Lógica 2: CRM Agendor (Mover lógica do frontend para cá) ---
        // Adicione aqui a chamada ao Agendor usando process.env.AGENDOR_TOKEN se necessário,
        // ou apenas mantenha o log por enquanto. A ideia é centralizar tudo aqui.
        console.log('Dados recebidos para Agendor:', { nomeCompleto, email, telefone, nomeMarca, temMarca });

        return res.status(200).json({ success: true });
    } catch (error) {
        console.error('Erro Backend:', error);
        return res.status(500).json({ error: error.message });
    }
}
