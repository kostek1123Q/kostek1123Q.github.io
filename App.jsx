import { useState } from "react";
import Chat from "./pages/Chat";
import Casino from "./pages/Casino";
import Music from "./pages/Music";
import Posts from "./pages/Posts";

export default function App() {
  const [page, setPage] = useState("chat");

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-blue-600 text-white p-4 text-xl font-bold">
        🌍 GlobalChat.pl
      </header>

      <nav className="bg-gray-200 flex justify-around p-2">
        <button onClick={() => setPage("chat")}>💬 Czat</button>
        <button onClick={() => setPage("casino")}>🎰 Kasyno</button>
        <button onClick={() => setPage("music")}>🎵 Muzyka</button>
        <button onClick={() => setPage("posts")}>📝 Posty</button>
      </nav>

      <main className="flex-1 p-4">
        {page === "chat" && <Chat />}
        {page === "casino" && <Casino />}
        {page === "music" && <Music />}
        {page === "posts" && <Posts />}
      </main>
    </div>
  );
}
