import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';
import crypto from 'crypto';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Starting server...');

dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = 3002;

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use((req, res, next) => {
    console.log(`📨 Request recebido: [${req.method}] ${req.url} | IP: ${req.ip}`);
    next();
});
app.use(express.json());

// ROTA ÚNICA UNIFICADA (Idêntica à Vercel Function)
app.post('/api/conversion', async (req, res) => {
    console.log('Received request on /api/conversion');
    try {
        const { email, eventId, userAgent, nomeCompleto, telefone, nomeMarca, temMarca, newsletter } = req.body;

        // 1. FACEBOOK CAPI
        try {
            const pixelId = process.env.FB_PIXEL_ID;
            const accessToken = process.env.FB_ACCESS_TOKEN;

            if (pixelId && accessToken) {
                const emailHash = crypto.createHash('sha256').update(email.toLowerCase().trim()).digest('hex');
                await axios.post(
                    `https://graph.facebook.com/v18.0/${pixelId}/events?access_token=${accessToken}`,
                    { data: [{ event_name: 'Lead', event_time: Math.floor(Date.now() / 1000), event_id: eventId, user_data: { em: [emailHash], client_user_agent: userAgent, client_ip_address: req.ip || '0.0.0.0' }, action_source: 'website' }] }
                );
                console.log("✅ Facebook OK");
            }
        } catch (e) {
            console.error('Face ignorado:', e.message);
        }

        // 2. GOOGLE SHEETS (WEBHOOK)
        try {
            const sheetUrl = process.env.SHEET_WEBHOOK_URL;

            if (sheetUrl) {
                console.log("Enviando para planilha:", sheetUrl);
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
                console.warn("⚠️ SHEET_WEBHOOK_URL não definida no .env do servidor");
            }
        } catch (sheetError) {
            console.error("❌ Erro Planilha:", sheetError.message);
        }

        return res.status(200).json({ success: true });

    } catch (fatalError) {
        console.error("🔥 Fatal:", fatalError);
        return res.status(500).json({ error: "Erro interno no servidor local" });
    }
});

// Mantemos as rotas legadas por compatibilidade, se necessário, mas a principal agora é a de cima
app.post('/api/agendor', (req, res) => res.status(410).json({ error: "Use /api/conversion" }));
app.post('/api/facebook-conversion', (req, res) => res.status(410).json({ error: "Use /api/conversion" }));

if (process.argv[1] === __filename) {
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`🚀 Servidor rodando na porta ${PORT}`);
    });
}

export default app;
