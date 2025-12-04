import axios from 'axios';
import fs from 'fs';

async function test() {
    try {
        const response = await axios.post('http://localhost:3002/api/lead', {
            nomeCompleto: "Teste Node",
            email: "teste@node.com",
            telefone: "11999999999",
            nomeMarca: "Marca Node",
            temMarca: "Confecção",
            newsletter: true
        });
        console.log('Success. Writing to server/response.json');
        fs.writeFileSync('server/response.json', JSON.stringify(response.data, null, 2));
    } catch (error) {
        console.error('Error Status:', error.response?.status);
        console.error('Error Data:', JSON.stringify(error.response?.data, null, 2));
    }
}

test();
