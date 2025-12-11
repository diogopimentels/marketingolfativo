import axios from 'axios';
import crypto from 'crypto';

export default async function handler(req, res) {
    // CORS: Libera geral para não travar o front
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    try {
        const { email, eventId, userAgent, nomeCompleto, telefone, nomeMarca, temMarca, newsletter } = req.body;

        console.log("🚀 NOVO LEAD:", email);

        // 1. FACEBOOK API (Não espera terminar pra não atrasar o user)
        if (process.env.FB_PIXEL_ID && process.env.FB_ACCESS_TOKEN) {
            const emailHash = crypto.createHash('sha256').update(email.toLowerCase().trim()).digest('hex');
            axios.post(
                `https://graph.facebook.com/v18.0/${process.env.FB_PIXEL_ID}/events?access_token=${process.env.FB_ACCESS_TOKEN}`,
                { data: [{ event_name: 'Lead', event_time: Math.floor(Date.now() / 1000), event_id: eventId, user_data: { em: [emailHash], client_user_agent: userAgent, client_ip_address: req.headers['x-forwarded-for'] || '0.0.0.0' }, action_source: 'website' }] }
            ).catch(e => console.error('⚠️ Face Erro:', e.message));
        }

        // 2. GOOGLE SHEETS (Via GET para garantir entrega)
        const sheetUrl = process.env.SHEET_WEBHOOK_URL;

        if (sheetUrl) {
            console.log("📤 Enviando para Planilha...");
            try {
                await axios.get(sheetUrl, {
                    params: {
                        email: email,
                        nomeCompleto: nomeCompleto,
                        telefone: telefone,
                        nomeMarca: nomeMarca,
                        temMarca: temMarca,
                        newsletter: newsletter ? "Sim" : "Não"
                    }
                });
                console.log("✅ Planilha Sucesso!");
            } catch (sheetError) {
                console.error("❌ Erro Planilha:", sheetError.message);
                // Não retorna erro pro front, deixa o usuário baixar o ebook
            }
        } else {
            console.error("❌ ERRO: Variável SHEET_WEBHOOK_URL não definida na Vercel.");
        }

        // Retorna sucesso IMEDIATO para o download iniciar
        return res.status(200).json({ success: true });

    } catch (fatalError) {
        console.error("🔥 Fatal:", fatalError);
        return res.status(500).json({ error: "Erro interno" });
    }
}
