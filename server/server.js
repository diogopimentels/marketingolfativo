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
    console.log(`📨 Request recebido: [${req.method}] ${req.url}`);
    next();
});
app.use(express.json());

// ROTA ÚNICA UNIFICADA
app.post('/api/conversion', async (req, res) => {
    console.log('Received request on /api/conversion');
    try {
        const { email, eventId, userAgent, nomeCompleto, telefone, nomeMarca, temMarca, newsletter } = req.body;
        console.log("🚀 NOVO LEAD:", email);

        // 1. FACEBOOK CAPI
        const pixelId = process.env.FB_PIXEL_ID;
        const accessToken = process.env.FB_ACCESS_TOKEN;

        if (pixelId && accessToken) {
            const emailHash = crypto.createHash('sha256').update(email.toLowerCase().trim()).digest('hex');
            // Não await pra não travar localmente
            axios.post(
                `https://graph.facebook.com/v18.0/${pixelId}/events?access_token=${accessToken}`,
                { data: [{ event_name: 'Lead', event_time: Math.floor(Date.now() / 1000), event_id: eventId, user_data: { em: [emailHash], client_user_agent: userAgent, client_ip_address: req.ip || '0.0.0.0' }, action_source: 'website' }] }
            ).catch(e => console.error("Erro FB Local:", e.message));
        }

        // 2. GOOGLE SHEETS (VIA GET)
        const sheetUrl = process.env.SHEET_WEBHOOK_URL;

        if (sheetUrl) {
            console.log("📤 Enviando para Planilha (GET)...");
            try {
                await axios.get(sheetUrl, {
                    params: {
                        email,
                        nomeCompleto,
                        telefone,
                        nomeMarca,
                        temMarca,
                        newsletter: newsletter ? "Sim" : "Não"
                    }
                });
                console.log("✅ Planilha Sucesso!");
            } catch (sheetError) {
                console.error("❌ Erro Planilha:", sheetError.message);
            }
        } else {
            console.warn("⚠️ SHEET_WEBHOOK_URL não definida no .env do servidor local");
        }

        return res.status(200).json({ success: true });

    } catch (fatalError) {
        console.error("🔥 Fatal:", fatalError);
        return res.status(500).json({ error: "Erro interno no servidor local" });
    }
});

if (process.argv[1] === __filename) {
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`🚀 Servidor rodando na porta ${PORT}`);
    });
}

export default app;
