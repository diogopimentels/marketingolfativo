import axios from 'axios';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config({ path: './server/.env' });

async function debugVariations() {
    const token = process.env.AGENDOR_TOKEN;
    let logOutput = "";

    function log(message) {
        console.log(message);
        logOutput += message + "\n";
    }

    try {
        // 1. Create Person
        const personPayload = {
            name: "Debug Variations Person 2",
            email: `debug.variations2.${Date.now()}@example.com`
        };

        log('Creating Person...');
        const personResponse = await axios.post('https://api.agendor.com.br/v3/people', personPayload, {
            headers: { 'Authorization': `Token ${token}` }
        });
        const personId = personResponse.data.data.id;
        log(`Person ID: ${personId}`);

        // Variation 1: dealStage as integer
        await testPayload(token, personId, "Var 1 (dealStage int)", {
            title: "Var 1",
            dealStage: 3379125
        }, log);

        // Variation 2: funnel as integer
        await testPayload(token, personId, "Var 2 (funnel int + desc)", {
            title: "Var 2",
            funnel: 813360,
            description: "Testing description field"
        }, log);

        fs.writeFileSync('server/variations-result.txt', logOutput);
        console.log('Results saved to server/variations-result.txt');

    } catch (error) {
        log(`Error: ${error.message}`);
        fs.writeFileSync('server/variations-result.txt', logOutput);
    }
}

async function testPayload(token, personId, name, payload, log) {
    try {
        log(`Testing ${name}...`);
        const response = await axios.post(`https://api.agendor.com.br/v3/people/${personId}/deals`, payload, {
            headers: { 'Authorization': `Token ${token}` }
        });
        const stage = response.data.data.dealStage;
        log(`  Result Stage ID: ${stage.id} (${stage.name}) - Funnel: ${stage.funnel.name}`);
    } catch (error) {
        log(`  Error ${name}: ${JSON.stringify(error.response?.data?.errors || error.message)}`);
    }
}

debugVariations();
