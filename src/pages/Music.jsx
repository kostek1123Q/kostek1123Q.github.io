export default function Music() {
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">🎵 Odtwarzacz</h2>
      <audio controls className="w-full">
        <source src="/sample.mp3" type="audio/mpeg" />
        Twoja przeglądarka nie obsługuje odtwarzacza audio.
      </audio>
      <p className="mt-2 text-gray-600">Dodaj swoje pliki MP3 do folderu public</p>
    </div>
  );
}
