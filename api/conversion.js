import axios from 'axios';
import crypto from 'crypto';

export default async function handler(req, res) {
    // 1. Configuração de CORS (Essencial para Produção/Mobile)
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        // Extraindo dados vindos do Frontend
        const {
            email,
            eventId,
            userAgent,
            nomeCompleto,
            telefone,
            nomeMarca,
            temMarca,
            newsletter
        } = req.body;

        console.log("🚀 Recebido lead:", email);

        // =====================================
        // 1. FACEBOOK CAPI (Prioridade de Rastreamento)
        // =====================================
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
                            user_data: {
                                em: [emailHash],
                                client_user_agent: userAgent,
                                client_ip_address: req.headers['x-forwarded-for'] || '0.0.0.0'
                            },
                            action_source: 'website',
                        }]
                    }
                );
                console.log('✅ FB CAPI Enviado');
            }
        } catch (err) {
            console.error('⚠️ Erro FB CAPI:', err.message);
        }

        // =====================================
        // 2. AGENDOR CRM (Lógica Implementada)
        // =====================================
        try {
            if (process.env.AGENDOR_TOKEN) {
                // Montamos a descrição com os dados extras para não perder nada
                const descricaoLead = `
          Empresa/Marca: ${nomeMarca}
          Segmento: ${temMarca}
          Newsletter: ${newsletter ? 'Sim' : 'Não'}
          Origem: Landing Page Marketing Olfativo
        `.trim();

                // Endpoint Upsert: Cria ou Atualiza baseado no email (evita duplicatas)
                await axios.post(
                    'https://api.agendor.com.br/v3/people/upsert',
                    {
                        email: email, // Chave única para o upsert
                        name: nomeCompleto,
                        contact: {
                            email: email,
                            mobile: telefone, // Salva no campo de celular
                            work: telefone    // Salva também no comercial por garantia
                        },
                        // Como criar organização exige ID, salvamos o nome da marca no cargo ou descrição para facilitar
                        role: nomeMarca,
                        description: descricaoLead
                    },
                    {
                        headers: {
                            'Authorization': `Token ${process.env.AGENDOR_TOKEN}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );
                console.log("✅ Agendor Enviado com Sucesso!");
            } else {
                console.warn("⚠️ Token do Agendor não configurado na Vercel.");
            }
        } catch (crmError) {
            // Logamos o erro detalhado do Agendor para debug
            console.error("❌ Erro Agendor:", crmError.response?.data || crmError.message);
        }

        // Retorna sucesso para o frontend liberar o download
        return res.status(200).json({ success: true });

    } catch (error) {
        console.error('🔥 Erro Crítico Backend:', error);
        return res.status(500).json({ error: error.message });
    }
}
