import axios from 'axios';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config({ path: './server/.env' });

async function listFunnels() {
    const token = process.env.AGENDOR_TOKEN;

    try {
        console.log('Fetching funnels...');
        const response = await axios.get('https://api.agendor.com.br/v3/funnels', {
            headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json'
            }
        });

        let output = `Funnels found: ${response.data.data.length}\n`;
        response.data.data.forEach(funnel => {
            output += `\nFunnel: ${funnel.name} (ID: ${funnel.id})\n`;
            if (funnel.stages) {
                funnel.stages.forEach(stage => {
                    output += `  - Stage: ${stage.name} (ID: ${stage.id})\n`;
                });
            }
        });

        fs.writeFileSync('./server/funnels.txt', output);
        console.log('Funnels saved to server/funnels.txt');

    } catch (error) {
        console.error('Error:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        }
    }
}

listFunnels();
