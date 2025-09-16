export default async function handler(req, res) {
  const API_KEY = "453422s5k208ojj4mztv8p"; // API key kamu

  try {
    const response = await fetch(`https://doodapi.com/api/file/list?key=${API_KEY}`);
    const data = await response.json();

    res.setHeader("Access-Control-Allow-Origin", "*"); // biar frontend bisa fetch
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: "Gagal ambil data dari Doodstream" });
  }
}
