import { useState, useEffect } from "react";
import { io } from "socket.io-client";

const socket = io("https://globalchatpl.onrender.com"); // <-- podmień na swój backend

export default function App() {
  const [messages, setMessages] = useState([]);
  const [msg, setMsg] = useState("");
  const [nick, setNick] = useState("");

  useEffect(() => {
    socket.on("chatMessage", (data) => setMessages((prev) => [...prev, data]));
    return () => socket.off("chatMessage");
  }, []);

  const sendMessage = () => {
    if (!nick || !msg) return;
    socket.emit("chatMessage", { nick, text: msg });
    setMsg("");
  };

  return (
    <div style={{ maxWidth: "600px", margin: "40px auto", fontFamily: "sans-serif" }}>
      <h1 style={{ textAlign: "center" }}>🌍 GlobalChat.pl</h1>

      <div style={{ marginBottom: "10px" }}>
        <input
          placeholder="Twój nick"
          value={nick}
          onChange={(e) => setNick(e.target.value)}
          style={{ width: "100%", padding: "8px", marginBottom: "5px" }}
        />
        <input
          placeholder="Wiadomość..."
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          style={{ width: "80%", padding: "8px" }}
        />
        <button onClick={sendMessage} style={{ padding: "8px 12px", marginLeft: "5px" }}>
          Wyślij
        </button>
      </div>

      <div style={{ border: "1px solid #ccc", padding: "10px", height: "300px", overflowY: "auto" }}>
        {messages.map((m, i) => (
          <div key={i}><b>{m.nick}:</b> {m.text}</div>
        ))}
      </div>
    </div>
  );
}
