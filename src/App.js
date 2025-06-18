import React, { useState } from "react";

export default function ClaimsChat() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { role: "user", content: input }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch(
        "https://claimsopenaiv1.openai.azure.com/openai/deployments/gpt-4o/chat/completions?api-version=2025-01-01-preview",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "api-key": process.env.REACT_APP_OPENAI_KEY,
          },
          body: JSON.stringify({
            messages: [
              {
                role: "system",
                content: `You are a Claims Review Assistant. Always respond in a professional, concise tone.

You receive three lines of input describing a claim. Your role is to:
1. Identify the patient and condition
2. Ask helpful clarifying questions
3. Guide the user on next steps (e.g., required forms, supporting documentation)

Do not generate fictional medical advice. Only assist based on the claim context provided.`,
              },
              ...newMessages,
            ],
          }),
        }
      );

      const data = await response.json();
      const reply = data.choices[0].message.content;
      setMessages([...newMessages, { role: "assistant", content: reply }]);
    } catch (error) {
      setMessages([
        ...newMessages,
        { role: "assistant", content: "Error contacting agent." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "700px", margin: "0 auto", padding: "1rem" }}>
      <h1>Claims Review Chat</h1>
      <div
        style={{
          height: "300px",
          overflowY: "scroll",
          border: "1px solid #ccc",
          padding: "0.5rem",
          marginBottom: "1rem",
        }}
      >
        {messages.map((msg, index) => (
          <div key={index}>
            <strong>{msg.role === "user" ? "You" : "Agent"}:</strong> {msg.content}
          </div>
        ))}
        {loading && <div>Agent is typing...</div>}
      </div>
      <div style={{ display: "flex", gap: "0.5rem" }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter your claim info..."
          style={{ flex: 1, padding: "0.5rem" }}
        />
        <button onClick={handleSend} style={{ padding: "0.5rem 1rem" }}>
          Send
        </button>
      </div>
    </div>
  );
}
