import axios from 'axios';

interface AgendorData {
    nomeCompleto: string;
    email: string;
    telefone: string;
    nomeMarca: string;
    temMarca: string;
    newsletter: boolean;
}

export const submitToAgendor = async (data: AgendorData) => {
    try {
        // Assuming the backend runs on port 3001 locally
        const response = await axios.post('http://localhost:3002/api/lead', data);
        return response.data;
    } catch (error) {
        console.error('Error submitting to Agendor:', error);
        throw error;
    }
};
