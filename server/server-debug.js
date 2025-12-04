import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config({ path: './server/.env' });

const app = express();
const PORT = 3002; // Different port

app.use(cors());
app.use(express.json());

app.post('/api/lead', async (req, res) => {
    console.log('Received request');
    const token = process.env.AGENDOR_TOKEN;

    const payload = {
        name: "Debug Server Person",
        email: "debug-server@example.com"
    };

    try {
        console.log('Sending request to Agendor...');
        const response = await axios.post('https://api.agendor.com.br/v3/people', payload, {
            headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json'
            }
        });
        console.log('Success Person:', response.data);

        const personId = response.data.data.id;

        const dealPayload = {
            title: "Debug Server Deal",
            dealStatus: 1
        };

        const dealResponse = await axios.post(`https://api.agendor.com.br/v3/people/${personId}/deals`, dealPayload, {
            headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json'
            }
        });
        console.log('Success Deal:', dealResponse.data);

        res.json({ success: true, data: dealResponse.data });

    } catch (error) {
        console.error('Error:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        }
        res.status(500).json({ error: error.message, details: error.response?.data });
    }
});

app.listen(PORT, () => {
    console.log(`Debug Server running on port ${PORT}`);
});
