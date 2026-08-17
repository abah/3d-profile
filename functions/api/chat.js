const CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400'
};

const SYSTEM_PROMPT = `Kamu adalah MC virtual Merdeka Talk untuk HUT Republik Indonesia ke-81 (17 Agustus 2026).
Jawab dalam Bahasa Indonesia, hangat, patriotik tapi tidak berlebihan.
Fokus: sejarah kemerdekaan, Pancasila, budaya Nusantara, capaian teknologi Indonesia, dan trivia HUT RI.
Jawaban maksimal 3 paragraf pendek.`;

function json(data, status = 200) {
    return new Response(JSON.stringify(data), {
        status,
        headers: { ...CORS, 'Content-Type': 'application/json' }
    });
}

export async function onRequestOptions() {
    return new Response(null, { headers: CORS });
}

export async function onRequestPost(context) {
    const { request, env } = context;

    if (!env.GEMINI_API_KEY) {
        return json({ error: 'GEMINI_API_KEY belum dikonfigurasi', useLocal: true }, 503);
    }

    let body;
    try {
        body = await request.json();
    } catch {
        return json({ error: 'Invalid JSON body' }, 400);
    }

    const query = (body.query || '').trim();
    if (!query) {
        return json({ error: 'Query kosong' }, 400);
    }

    const model = env.GEMINI_MODEL || 'gemini-2.0-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${env.GEMINI_API_KEY}`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: `${SYSTEM_PROMPT}\n\nPertanyaan pengguna: ${query}` }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 512
                }
            })
        });

        if (!response.ok) {
            const detail = await response.text();
            console.error('Gemini error:', response.status, detail);
            return json({ error: 'Gemini API gagal', useLocal: true }, 502);
        }

        const data = await response.json();
        const answer = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!answer) {
            return json({ error: 'Respons AI kosong', useLocal: true }, 502);
        }

        return json({ answer, source: 'gemini' });
    } catch (err) {
        console.error('Chat proxy error:', err);
        return json({ error: 'Server error', useLocal: true }, 500);
    }
}
