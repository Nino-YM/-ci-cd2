import { useState } from "react";

export default function App() {
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";

  async function send() {
    if (!prompt.trim()) return;
    const userMsg = { role: "user", text: prompt };
    setMessages((m) => [...m, userMsg]);
    setPrompt("");
    setLoading(true);

    try {
      const res = await fetch(`${apiUrl}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: userMsg.text }),
      });
      const data = await res.json();
      setMessages((m) => [...m, { role: "assistant", text: data.text || "(no text)" }]);
    } catch (e) {
      setMessages((m) => [...m, { role: "assistant", text: `Error: ${String(e)}` }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: 24, fontFamily: "sans-serif" }}>
      <h1>Gemini Chat</h1>

      <div style={{ border: "1px solid #ddd", padding: 16, borderRadius: 8, minHeight: 300 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ marginBottom: 12 }}>
            <b>{m.role}:</b> {m.text}
          </div>
        ))}
        {loading && <div><i>Thinking…</i></div>}
      </div>

      <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
        <input
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ask something…"
          style={{ flex: 1, padding: 10 }}
          onKeyDown={(e) => e.key === "Enter" && send()}
        />
        <button onClick={send} style={{ padding: "10px 16px" }}>Send</button>
      </div>
    </div>
  );
}
