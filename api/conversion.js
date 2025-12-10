import axios from 'axios';
import crypto from 'crypto';

// Função auxiliar para limpar telefone (deixa apenas números)
function cleanPhone(phone) {
    if (!phone) return null;
    const cleaned = phone.replace(/\D/g, ''); // Remove tudo que não é número
    return cleaned;
}

export default async function handler(req, res) {
    // Configuração CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    try {
        const { email, eventId, userAgent, nomeCompleto, telefone, nomeMarca, temMarca, newsletter } = req.body;

        console.log("🚀 Processando Lead:", email);

        // 1. FACEBOOK CAPI
        try {
            if (process.env.FB_PIXEL_ID && process.env.FB_ACCESS_TOKEN) {
                const emailHash = crypto.createHash('sha256').update(email.toLowerCase().trim()).digest('hex');
                await axios.post(
                    `https://graph.facebook.com/v18.0/${process.env.FB_PIXEL_ID}/events?access_token=${process.env.FB_ACCESS_TOKEN}`,
                    {
                        data: [{
                            event_name: 'Lead',
                            event_time: Math.floor(Date.now() / 1000),
                            event_id: eventId,
                            user_data: { em: [emailHash], client_user_agent: userAgent, client_ip_address: req.headers['x-forwarded-for'] || '0.0.0.0' },
                            action_source: 'website',
                        }]
                    }
                );
            }
        } catch (e) { console.error('⚠️ Erro Face:', e.message); }

        // 2. AGENDOR CRM
        try {
            const rawToken = process.env.AGENDOR_TOKEN || "";
            const cleanToken = rawToken.replace(/['"]+/g, '').trim();
            const telefoneLimpo = cleanPhone(telefone);

            if (cleanToken) {
                // Payload corrigido para API V3
                const payload = {
                    email: email,
                    name: nomeCompleto,
                    contact: {
                        email: email,
                        // CORREÇÃO CRÍTICA: Os campos V3 são mobile_phone e work_phone
                        mobile_phone: telefoneLimpo,
                        work_phone: telefoneLimpo
                    },
                    role: nomeMarca,
                    description: `Marca: ${nomeMarca} | Segmento: ${temMarca} | Newsletter: ${newsletter ? 'Sim' : 'Não'} | Origem: LP`
                };

                console.log("📤 Enviando payload Agendor:", JSON.stringify(payload));

                await axios.post(
                    'https://api.agendor.com.br/v3/people/upsert',
                    payload,
                    {
                        headers: { 'Authorization': `Token ${cleanToken}`, 'Content-Type': 'application/json' }
                    }
                );
                console.log("✅ Agendor Sucesso: Dados salvos!");
            }
        } catch (agendorError) {
            // Log detalhado para sabermos o motivo da recusa
            const motivo = agendorError.response?.data?.errors || agendorError.response?.data || agendorError.message;
            console.error("❌ Agendor Recusou:", JSON.stringify(motivo));
        }

        // Retorna sucesso para o usuário baixar o ebook
        return res.status(200).json({ success: true });

    } catch (fatalError) {
        console.error("🔥 Erro Fatal:", fatalError);
        return res.status(500).json({ error: "Erro interno" });
    }
}
