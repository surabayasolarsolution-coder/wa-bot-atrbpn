require("dotenv").config();
const express = require("express");
const axios = require("axios");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.json({
    ok: true,
    service: "WA Chatbot ATR/BPN Kota Batu"
  });
});

app.post("/webhook", async (req, res) => {
  try {
    console.log("BODY MASUK:", JSON.stringify(req.body, null, 2));

    const sender =
      req.body.sender ||
      req.body.number ||
      req.body.from ||
      "";

    const message =
      req.body.message ||
      req.body.text ||
      req.body.body ||
      "";

    if (!sender) {
      return res.status(200).json({
        ok: false,
        info: "sender tidak ditemukan",
        body: req.body
      });
    }

    let reply = "Halo 👋 ini bot ATR/BPN Kota Batu";

    const msg = String(message).trim().toLowerCase();

    if (["halo", "hallo", "hai", "hi"].includes(msg)) {
      reply = `Halo 👋
Selamat datang di layanan ATR/BPN Kota Batu

Silakan pilih:
1. Informasi layanan
2. Persyaratan berkas
3. Cek status permohonan
4. Jam layanan
5. Lokasi kantor`;
    }

    await axios.post(
      "https://api.fonnte.com/send",
      {
        target: sender,
        message: reply
      },
      {
        headers: {
          Authorization: process.env.FONNTE_TOKEN
        }
      }
    );

    return res.status(200).json({ ok: true, sender, message });
  } catch (err) {
    console.error("WEBHOOK ERROR:", err.response?.data || err.message);
    return res.status(200).json({
      ok: false,
      error: err.response?.data || err.message
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server jalan di port", PORT);
});
