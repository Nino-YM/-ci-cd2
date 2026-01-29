const express = require("express");
const { GoogleGenAI } = require("@google/genai");

const app = express();
app.use(express.json());

const port = process.env.PORT || 3000;

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

        const ai = new GoogleGenAI({ apiKey });

        const result = await ai.models.generateContent({
            model: "gemini-2.5-flash-lite",
            contents: [{ role: "user", parts: [{ text: prompt }] }],
        });

        const text =
            result?.text ||
            result?.candidates?.[0]?.content?.parts?.map((p) => p.text).join("") ||
            null;

        res.json({ text, raw: result });
    } catch (err) {
        res.status(500).json({ error: String(err?.message || err) });
    }
});

app.listen(port, () => {
});
