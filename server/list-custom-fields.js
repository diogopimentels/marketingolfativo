import axios from 'axios';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config({ path: './server/.env' });

async function listCustomFields() {
    const token = process.env.AGENDOR_TOKEN;

    try {
        console.log('Fetching custom fields for DEALS...');
        const response = await axios.get('https://api.agendor.com.br/v3/custom_fields/deals', {
            headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json'
            }
        });

        let output = `Custom Fields found: ${response.data.data.length}\n`;
        response.data.data.forEach(field => {
            output += `\nField: ${field.name} (ID: ${field.id}, Type: ${field.type})\n`;
            if (field.options) {
                field.options.forEach(opt => {
                    output += `  - Option: ${opt.name} (ID: ${opt.id})\n`;
                });
            }
        });

        fs.writeFileSync('./server/custom-fields.txt', output);
        console.log('Custom fields saved to server/custom-fields.txt');

    } catch (error) {
        console.error('Error:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        }
    }
}

listCustomFields();
