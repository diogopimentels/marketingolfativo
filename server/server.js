import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';
import crypto from 'crypto';

console.log('Starting server...');

dotenv.config({ path: './server/.env' });

const app = express();
const PORT = 3002;

app.use(cors());
app.use(express.json());

app.post('/api/lead', async (req, res) => {
    console.log('Received request on /api/lead');
    try {
        const { nomeCompleto, email, telefone, nomeMarca, temMarca, newsletter } = req.body;

        // Validate required fields
        if (!nomeCompleto || !email || !telefone) {
            return res.status(400).json({ error: 'Campos obrigatórios faltando.' });
        }

        const agendorToken = process.env.AGENDOR_TOKEN;

        if (!agendorToken) {
            console.error('AGENDOR_TOKEN não configurado.');
            return res.status(500).json({ error: 'Erro interno de configuração.' });
        }

        // 1. Create Person
        const personPayload = {
            name: nomeCompleto,
            email: email,
            phones: [telefone],
            // Custom fields removed as they don't exist in Agendor
        };

        console.log('Criando Pessoa no Agendor:', JSON.stringify(personPayload, null, 2));

        const personResponse = await axios.post('https://api.agendor.com.br/v3/people', personPayload, {
            headers: {
                'Authorization': `Token ${agendorToken}`,
                'Content-Type': 'application/json'
            }
        });

        const personId = personResponse.data.data.id;
        console.log('Pessoa criada com ID:', personId);

        // 2. Create Deal associated with Person
        const description = `
        Dados do Formulário:
        - Nome da Marca: ${nomeMarca}
        - Segmento: ${temMarca}
        - Newsletter: ${newsletter ? "Sim" : "Não"}
        `;

        const dealPayload = {
            title: `Lead LP Marketing Olfativo — ${nomeMarca || 'Sem Marca'}`,
            funnel: 813360, // Funnel: FUNIL LP TERCEIRIZADA (Will default to first stage: OPORTUNIDADE)
            description: description
        };

        console.log('Criando Negócio no Agendor:', JSON.stringify(dealPayload, null, 2));

        const dealResponse = await axios.post(`https://api.agendor.com.br/v3/people/${personId}/deals`, dealPayload, {
            headers: {
                'Authorization': `Token ${agendorToken}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('Sucesso Agendor (Negócio):', dealResponse.data);
        return res.status(200).json({ success: true, data: dealResponse.data });

    } catch (error) {
        console.error('Erro ao enviar para Agendor:');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error('Message:', error.message);
        }

        return res.status(500).json({
            success: false,
            error: 'Erro ao processar solicitação.',
            details: error.response?.data || error.message
        });
    }
});

app.post('/api/facebook-conversion', async (req, res) => {
    try {
        const { email, eventId, userAgent } = req.body;
        const pixelId = process.env.FB_PIXEL_ID;
        const accessToken = process.env.FB_ACCESS_TOKEN;

        if (!pixelId || !accessToken) {
            console.error('FB_PIXEL_ID ou FB_ACCESS_TOKEN não configurados.');
            return res.status(500).json({ error: 'Configuração de servidor ausente.' });
        }

        // Hash email (SHA256)
        const hashEmail = (email) => {
            if (!email) return null;
            return crypto.createHash('sha256').update(email.trim().toLowerCase()).digest('hex');
        };

        const eventTime = Math.floor(Date.now() / 1000);
        const hashedEmail = hashEmail(email);

        const payload = {
            data: [
                {
                    event_name: 'Lead',
                    event_time: eventTime,
                    event_id: eventId,
                    action_source: 'website',
                    user_data: {
                        em: [hashedEmail],
                        client_user_agent: userAgent,
                        client_ip_address: req.ip
                    }
                }
            ]
        };

        await axios.post(
            `https://graph.facebook.com/v18.0/${pixelId}/events?access_token=${accessToken}`,
            payload
        );

        console.log('Evento CAPI enviado com sucesso.');
        res.status(200).json({ success: true });

    } catch (error) {
        console.error('Erro ao enviar evento CAPI:', error.response?.data || error.message);
        res.status(500).json({ error: 'Falha ao enviar evento.' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
