import { useState } from "react";

export default function SlotMachine() {
  const symbols = ["🍒", "🍋", "🔔", "⭐", "7️⃣"];
  const [slots, setSlots] = useState(["❓", "❓", "❓"]);
  const [result, setResult] = useState("");

  const spin = () => {
    const newSlots = [
      symbols[Math.floor(Math.random() * symbols.length)],
      symbols[Math.floor(Math.random() * symbols.length)],
      symbols[Math.floor(Math.random() * symbols.length)]
    ];
    setSlots(newSlots);

    if (newSlots[0] === newSlots[1] && newSlots[1] === newSlots[2]) {
      setResult("🎉 Wygrałeś!");
    } else {
      setResult("😢 Spróbuj ponownie");
    }
  };

  return (
    <div className="text-center">
      <div className="text-5xl mb-4">{slots.join(" ")}</div>
      <button
        onClick={spin}
        className="bg-green-500 text-white px-6 py-2 rounded"
      >
        Zakręć
      </button>
      <p className="mt-2">{result}</p>
    </div>
  );
}
