import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config({ path: './server/.env' });

async function getFunnelStages() {
    const token = process.env.AGENDOR_TOKEN;
    const funnelId = 813360; // FUNIL LP TERCEIRIZADA

    try {
        console.log(`Fetching stages for funnel ${funnelId}...`);
        // Try to get the funnel details which usually includes stages
        const response = await axios.get(`https://api.agendor.com.br/v3/funnels/${funnelId}`, {
            headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('Funnel:', response.data.data.name);
        if (response.data.data.stages) {
            response.data.data.stages.forEach(stage => {
                console.log(`- Stage: ${stage.name} (ID: ${stage.id})`);
            });
        } else {
            console.log('No stages found in funnel details.');
        }

    } catch (error) {
        console.error('Error:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        }
    }
}

getFunnelStages();
