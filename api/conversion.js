import axios from 'axios';
import crypto from 'crypto';

export default async function handler(req, res) {
    // CORS Padrão
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    try {
        const { email, eventId, userAgent, nomeCompleto, telefone, nomeMarca, temMarca, newsletter } = req.body;

        console.log("🚀 Lead Novo:", email);

        // 1. FACEBOOK CAPI (Prioridade 1)
        try {
            if (process.env.FB_PIXEL_ID && process.env.FB_ACCESS_TOKEN) {
                const emailHash = crypto.createHash('sha256').update(email.toLowerCase().trim()).digest('hex');
                await axios.post(
                    `https://graph.facebook.com/v18.0/${process.env.FB_PIXEL_ID}/events?access_token=${process.env.FB_ACCESS_TOKEN}`,
                    { data: [{ event_name: 'Lead', event_time: Math.floor(Date.now() / 1000), event_id: eventId, user_data: { em: [emailHash], client_user_agent: userAgent, client_ip_address: req.headers['x-forwarded-for'] || '0.0.0.0' }, action_source: 'website' }] }
                );
                console.log("✅ Facebook OK");
            }
        } catch (e) { console.error('Face ignorado:', e.message); }

        // 2. GOOGLE SHEETS (O "CSV" Automático)
        try {
            // URL do Script do Google que o usuário vai colocar na Vercel
            const sheetUrl = process.env.SHEET_WEBHOOK_URL;

            if (sheetUrl) {
                await axios.post(sheetUrl, {
                    email,
                    nomeCompleto,
                    telefone,
                    nomeMarca,
                    temMarca,
                    newsletter
                });
                console.log("✅ Salvo na Planilha!");
            } else {
                console.warn("⚠️ URL da Planilha não configurada (SHEET_WEBHOOK_URL)");
            }
        } catch (sheetError) {
            console.error("❌ Erro Planilha:", sheetError.message);
            // Não trava o site, só loga
        }

        // Sucesso garantido pro usuário
        return res.status(200).json({ success: true });

    } catch (fatalError) {
        console.error("🔥 Fatal:", fatalError);
        return res.status(500).json({ error: "Erro interno" });
    }
}
