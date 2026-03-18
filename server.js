const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

const TOKEN = process.env.FONNTE_TOKEN;

// endpoint health check
app.get("/", (req, res) => {
  res.send("Bot WhatsApp aktif 🚀");
});

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// webhook dari Fonnte
app.post("/webhook", async (req, res) => {
  const body = req.body;

  console.log("Webhook masuk:", JSON.stringify(body, null, 2));

  if (!body || !body.data) return res.sendStatus(200);

  for (let msg of body.data) {
    // skip kalau bukan pesan masuk
    if (msg.isGroup) continue;
    if (msg.status) continue;

    const pesan = (msg.text || "").toLowerCase();
    const sender = msg.sender;

    let balasan = "Halo 👋, silakan ketik *menu*";

    if (pesan.includes("halo")) {
      balasan = "Halo 👋 Selamat datang di ATR/BPN Kota Batu";
    } else if (pesan.includes("menu")) {
      balasan =
        "📋 *Menu Layanan:*\n\n" +
        "1. Informasi Sertifikat\n" +
        "2. Cek Berkas\n" +
        "3. Kontak Admin\n\n" +
        "Ketik angka (1/2/3)";
    } else if (pesan === "1") {
      balasan = "Silakan kirim nomor berkas sertifikat Anda.";
    } else if (pesan === "2") {
      balasan = "Silakan kirim nomor berkas untuk pengecekan.";
    } else if (pesan === "3") {
      balasan = "Hubungi admin di 08xxxxxxxxxx";
    }

    try {
      const response = await axios.post(
        "https://api.fonnte.com/send",
        {
          target: sender,
          message: balasan,
        },
        {
          headers: {
            Authorization: TOKEN,
          },
        }
      );

      console.log("Balasan sukses:", response.data);
    } catch (err) {
      console.log("Gagal kirim:", err.response?.data || err.message);
    }
  }

  res.sendStatus(200);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server jalan di port", PORT);
});
