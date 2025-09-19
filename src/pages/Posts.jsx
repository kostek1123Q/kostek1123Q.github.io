import { useState, useEffect } from "react";

export default function Posts() {
  const [posts, setPosts] = useState([]);
  const [nick, setNick] = useState("");
  const [text, setText] = useState("");

  useEffect(() => {
    fetch("http://localhost:5000/posts")
      .then(res => res.json())
      .then(data => setPosts(data));
  }, []);

  const addPost = async () => {
    if (!nick || !text) return;
    const res = await fetch("http://localhost:5000/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nick, text })
    });
    const newPost = await res.json();
    setPosts(prev => [...prev, newPost]);
    setText("");
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">📝 Posty</h2>
      <div className="mb-4">
        <input
          placeholder="Nick"
          value={nick}
          onChange={(e) => setNick(e.target.value)}
          className="border p-2 mr-2"
        />
        <input
          placeholder="Treść posta"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="border p-2 mr-2 w-1/2"
        />
        <button
          onClick={addPost}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Dodaj
        </button>
      </div>
      <ul>
        {posts.map((p) => (
          <li key={p.id} className="border-b py-2">
            <b>{p.nick}</b>: {p.text} <span className="text-gray-500 text-sm">({new Date(p.date).toLocaleString()})</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
