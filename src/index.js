const express = require("express");
const cors = require("cors");
const { GoogleGenAI } = require("@google/genai");

const app = express();
const port = process.env.PORT || 3000;

app.use(
    cors({
        origin: ["http://localhost:5173", "http://localhost:4173"],
        methods: ["GET", "POST", "OPTIONS"],
        allowedHeaders: ["Content-Type"],
    })
);

app.options(/.*/, cors());


app.use(express.json());

function extractText(result) {
    if (!result) return null;

    // Cas fréquent: result.response.text() (SDK GenAI)
    try {
        if (result.response && typeof result.response.text === "function") {
            const t = result.response.text();
            if (t) return t;
        }
    } catch (_) { }

    // Autres variantes: result.text() ou result.text
    try {
        if (typeof result.text === "function") {
            const t = result.text();
            if (t) return t;
        }
    } catch (_) { }
    if (typeof result.text === "string" && result.text) return result.text;

    // Candidates dans response
    const partsA = result?.response?.candidates?.[0]?.content?.parts;
    if (Array.isArray(partsA)) {
        const t = partsA.map((p) => p?.text).filter(Boolean).join("");
        if (t) return t;
    }

    // Candidates direct
    const partsB = result?.candidates?.[0]?.content?.parts;
    if (Array.isArray(partsB)) {
        const t = partsB.map((p) => p?.text).filter(Boolean).join("");
        if (t) return t;
    }

    // Fallback: parfois c’est dans output_text / outputText selon wrappers
    if (typeof result.output_text === "string" && result.output_text) return result.output_text;
    if (typeof result.outputText === "string" && result.outputText) return result.outputText;

    return null;
}


app.get("/", (req, res) => {
    res.json({ ok: true, service: "gemini-api" });
});

app.post("/generate", async (req, res) => {
    try {
        const apiKey = process.env.GOOGLE_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ error: "Missing GOOGLE_API_KEY env var" });
        }

        const prompt = req.body?.prompt;
        if (!prompt || typeof prompt !== "string") {
            return res.status(400).json({ error: "Body must contain { prompt: string }" });
        }

        if (process.env.MOCK === "1") {
            return res.json({ text: `mock: ${prompt}`, raw: null });
        }

        const ai = new GoogleGenAI({ apiKey });

        const result = await ai.models.generateContent({
            model: "gemini-2.5-flash-lite",
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            config: {
                responseMimeType: "text/plain",
            },
        });


        const text = extractText(result);

        res.json({ text, raw: result });
    } catch (err) {
        res.status(500).json({ error: String(err?.message || err) });
    }
});

app.listen(port, () => {
    console.log(`API listening on http://localhost:${port}`);
});
