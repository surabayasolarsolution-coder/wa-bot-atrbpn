const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Bot aktif");
});

app.get("/webhook", (req, res) => {
  res.send("Webhook aktif");
});

app.post("/webhook", async (req, res) => {
  try {
    console.log("=== WEBHOOK MASUK ===");
    console.log(JSON.stringify(req.body, null, 2));

    const sender =
      req.body.sender ||
      req.body.from ||
      req.body.number ||
      req.body.data?.sender ||
      req.body.data?.from ||
      "";

    const message =
      req.body.message ||
      req.body.text ||
      req.body.body ||
      req.body.data?.message ||
      req.body.data?.text ||
      "";

    if (!sender) {
      console.log("Sender tidak ditemukan");
      return res.status(200).send("no sender");
    }

    let reply = "Halo 👋 ini bot ATR/BPN Kota Batu";

    const msg = String(message).toLowerCase().trim();
    if (["halo", "hallo", "hai", "hi"].includes(msg)) {
      reply =
        "Halo 👋 Selamat datang di ATR/BPN Kota Batu.\nKetik menu untuk pilihan layanan.";
    }

    const sendResult = await axios.post(
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

    console.log("Berhasil kirim:", sendResult.data);
    return res.status(200).send("ok");
  } catch (error) {
    console.error("WEBHOOK ERROR:");
    console.error(error.response?.data || error.message);
    return res.status(200).send("error handled");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server jalan di port", PORT);
});
