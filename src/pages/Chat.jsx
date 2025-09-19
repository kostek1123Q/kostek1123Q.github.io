import { useState, useEffect } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000"); // zmień na backend w Render

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [msg, setMsg] = useState("");
  const [nick, setNick] = useState("");

  useEffect(() => {
    socket.on("chatMessage", (data) => {
      setMessages((prev) => [...prev, data]);
    });
    return () => socket.off("chatMessage");
  }, []);

  const sendMessage = () => {
    if (msg.trim() && nick) {
      socket.emit("chatMessage", { nick, text: msg });
      setMsg("");
    }
  };

  return (
    <div>
      <input
        placeholder="Twój nick"
        value={nick}
        onChange={(e) => setNick(e.target.value)}
        className="border p-2 mb-2 w-full"
      />
      <div className="h-64 border overflow-y-auto mb-2 p-2 bg-gray-100">
        {messages.map((m, i) => (
          <div key={i}><b>{m.nick}:</b> {m.text}</div>
        ))}
      </div>
      <input
        placeholder="Wiadomość..."
        value={msg}
        onChange={(e) => setMsg(e.target.value)}
        className="border p-2 w-3/4"
      />
      <button
        onClick={sendMessage}
        className="bg-blue-500 text-white px-4 py-2 ml-2 rounded"
      >
        Wyślij
      </button>
    </div>
  );
}
