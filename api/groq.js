// api/groq.js
export default async function handler(req, res) {
    // Разрешаем запросы с любого твоего домена GitHub Pages
    res.setHeader('Access-Control-Allow-Origin', 'https://sashasigmakrut.github.io');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    // Обработка предварительных запросов (OPTIONS)
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // Только POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { prompt, model, temperature } = req.body;

        // Проверяем ключ
        if (!process.env.GROQ_API_KEY) {
            console.error('GROQ_API_KEY not set');
            return res.status(500).json({ error: 'API key not configured' });
        }

        console.log('Sending request to Groq with model:', model);

        // Отправляем запрос к Groq
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: model || 'llama-3.3-70b-versatile',
                messages: [
                    {
                        role: 'system',
                        content: 'Ты — полезный ассистент, эксперт по написанию промптов. Отвечай подробно, понятно и с примерами. Используй русский язык.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: temperature || 0.7,
                max_tokens: 4000
            })
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error?.message || 'Groq API error');
        }

        res.status(200).json(data);
        
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ error: error.message });
    }
}