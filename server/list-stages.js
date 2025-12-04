import axios from 'axios';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config({ path: './server/.env' });

async function listStages() {
    const token = process.env.AGENDOR_TOKEN;

    try {
        console.log('Fetching deal stages...');
        const response = await axios.get('https://api.agendor.com.br/v3/deal_stages', {
            headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json'
            }
        });

        let output = `Stages found: ${response.data.data.length}\n`;
        response.data.data.forEach(stage => {
            output += `\nStage: ${stage.name} (ID: ${stage.id}) - Funnel ID: ${stage.funnel.id} (${stage.funnel.name})\n`;
        });

        fs.writeFileSync('./server/stages.txt', output);
        console.log('Stages saved to server/stages.txt');

    } catch (error) {
        console.error('Error:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        }
    }
}

listStages();
