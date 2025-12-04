import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config({ path: './server/.env' });

async function debugDealCreation() {
    const token = process.env.AGENDOR_TOKEN;

    try {
        // 1. Create Person
        const personPayload = {
            name: "Debug Deal Direct",
            email: "debug.direct@example.com"
        };

        console.log('Creating Person...');
        const personResponse = await axios.post('https://api.agendor.com.br/v3/people', personPayload, {
            headers: { 'Authorization': `Token ${token}` }
        });
        const personId = personResponse.data.data.id;
        console.log('Person ID:', personId);

        // 2. Create Deal using POST /deals
        const dealPayload = {
            title: "Debug Deal Direct Funnel",
            dealStage: 3379125, // FUNIL LP TERCEIRIZADA
            person: {
                id: personId
            }
        };

        console.log('Creating Deal via POST /deals...');
        const dealResponse = await axios.post('https://api.agendor.com.br/v3/deals', dealPayload, {
            headers: { 'Authorization': `Token ${token}` }
        });

        console.log('Deal Response:', JSON.stringify(dealResponse.data, null, 2));

    } catch (error) {
        console.error('Error:', error.message);
        if (error.response) {
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        }
    }
}

debugDealCreation();
