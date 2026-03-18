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
    console.log("Webhook masuk:", JSON.stringify(req.body, null, 2));

    const from =
      req.body.sender ||
      req.body.from ||
      req.body.number ||
      req.body.device ||
      "";

    const message =
      req.body.message ||
      req.body.text ||
      req.body.body ||
      "";

    if (!from || !message) {
      return res.status(200).json({
        ok: false,
        info: "Pesan atau pengirim tidak terbaca",
        body: req.body
      });
    }

    let reply = "Halo 👋 ini bot ATR/BPN Kota Batu";

    const lower = String(message).toLowerCase().trim();

    if (["halo", "hallo", "hai", "hi"].includes(lower)) {
      reply = `Halo 👋
Selamat datang di layanan ATR/BPN Kota Batu

Menu:
1. Informasi layanan
2. Persyaratan berkas
3. Cek status permohonan
4. Jam layanan
5. Lokasi kantor`;
    }

    await axios.post(
      "https://api.fonnte.com/send",
      {
        target: from,
        message: reply
      },
      {
        headers: {
          Authorization: process.env.FONNTE_TOKEN
        }
      }
    );

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("ERROR WEBHOOK:", error.response?.data || error.message);
    return res.status(200).json({
      ok: false,
      error: error.response?.data || error.message
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server jalan di port", PORT);
});
