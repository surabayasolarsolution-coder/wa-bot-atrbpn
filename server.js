const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

const TOKEN = process.env.FONNTE_TOKEN;

// halaman utama
app.get("/", (req, res) => {
  res.send("Bot WhatsApp aktif 🚀");
});

// health check
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// webhook GET supaya mudah dites dari browser/Fonnte
app.get("/webhook", (req, res) => {
  res.status(200).send("Webhook aktif");
});

// webhook POST dari Fonnte
app.post("/webhook", async (req, res) => {
  const body = req.body;

  console.log("ISI BODY:", JSON.stringify(body, null, 2));

  let messages = [];

  if (Array.isArray(body?.data)) {
    messages = body.data;
  } else if (body) {
    messages = [body];
  }

  for (const msg of messages) {
    const pesan = String(msg.text || msg.message || "").toLowerCase().trim();
    const sender = msg.sender || msg.from || msg.number;

    if (!sender) {
      console.log("Sender tidak ditemukan, skip");
      continue;
    }

    console.log("Pesan:", pesan, "Dari:", sender);

    let balasan = "Halo 👋, silakan ketik *menu*";

    if (pesan.includes("halo")) {
      balasan = "Halo 👋 Selamat datang di ATR/BPN Kota Batu";
    } else if (pesan.includes("menu")) {
      balasan =
        "📋 *Menu Layanan:*\n\n" +
        "1. Informasi Sertifikat\n" +
        "2. Cek Berkas\n" +
        "3. Kontak Admin\n\n" +
        "Ketik angka 1/2/3";
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
      console.log("ERROR KIRIM:", err.response?.data || err.message);
    }
  }

  res.sendStatus(200);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server jalan di port ${PORT}`);
});
