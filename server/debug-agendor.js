import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config({ path: './server/.env' });

async function debug() {
    const token = process.env.AGENDOR_TOKEN;
    console.log('Token:', token ? 'Found' : 'Missing');

    const payload = {
        name: "Debug Person",
        email: "debug@example.com"
    };

    try {
        console.log('Sending request to https://api.agendor.com.br/v3/people');
        const response = await axios.post('https://api.agendor.com.br/v3/people', payload, {
            headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json'
            }
        });
        console.log('Success Person:', response.data);
        const personId = response.data.data.id;
        console.log('Person ID:', personId);

        const dealPayload = {
            title: "Debug Deal",
            dealStatus: 1
        };

        console.log(`Sending request to https://api.agendor.com.br/v3/people/${personId}/deals`);
        const dealResponse = await axios.post(`https://api.agendor.com.br/v3/people/${personId}/deals`, dealPayload, {
            headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json'
            }
        });
        console.log('Success Deal:', dealResponse.data);

    } catch (error) {
        console.error('Error:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        }
    }
}

debug();
