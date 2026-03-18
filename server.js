const express = require("express");
const axios = require("axios");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// sementara hardcode dulu untuk test
const TOKEN = "EryyxiDUJr2SUGQnWBZqDo8eqJRGh7ifFvkCCnB6jcrgpF2zSx";

app.get("/", (req, res) => {
  res.send("Bot aktif");
});

app.get("/webhook", (req, res) => {
  res.status(200).send("Webhook aktif");
});

app.post("/webhook", async (req, res) => {
  try {
    const body = req.body || {};
    console.log("WEBHOOK:", JSON.stringify(body, null, 2));

    const sender = body.sender || body.number || body.from;
    const pesan = String(body.message || body.pesan || "").trim().toLowerCase();
    const isGroup = body.isgroup === true || body.isgroup === "true";

    if (!sender || isGroup) {
      return res.sendStatus(200);
    }

    let balasan = "Halo 👋 Selamat datang di ATR/BPN Kota Batu";

    if (pesan === "menu") {
      balasan =
        "📋 *Menu Layanan*\n\n" +
        "1. Informasi Sertifikat\n" +
        "2. Cek Status Berkas\n" +
        "3. Info Kantor";
    }

    const formData = new URLSearchParams();
    formData.append("target", sender);
    formData.append("message", balasan);

    const response = await axios.post(
      "https://api.fonnte.com/send",
      formData,
      {
        headers: {
          Authorization: TOKEN,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        timeout: 30000,
      }
    );

    console.log("SEND RESPONSE:", response.data);
    return res.sendStatus(200);
  } catch (err) {
    console.log("ERROR:", err.response?.data || err.message);
    return res.sendStatus(200);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server jalan di port", PORT);
});
