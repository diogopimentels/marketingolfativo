import axios from 'axios';

async function test() {
    try {
        const response = await axios.post('http://localhost:3002/api/lead', {});
        console.log('Success:', response.data);
    } catch (error) {
        console.error('Error Status:', error.response?.status);
        console.error('Error Data:', JSON.stringify(error.response?.data, null, 2));
    }
}

test();
