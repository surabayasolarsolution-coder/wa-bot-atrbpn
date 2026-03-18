const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const TOKEN = process.env.FONNTE_TOKEN;
const repliedMessages = new Set();

app.get("/", (req, res) => {
  res.send("Bot WhatsApp aktif 🚀");
});

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/webhook", (req, res) => {
  res.status(200).send("Webhook aktif");
});

app.post("/webhook", async (req, res) => {
  try {
    const body = req.body || {};

    console.log("Webhook masuk:", JSON.stringify(body, null, 2));

    const pesan = String(body.pesan || body.message || body.text || "")
      .trim()
      .toLowerCase();

    const sender = body.sender || body.pengirim || body.from || body.number;
    const messageId = body.id || body.senderid || `${sender}-${pesan}-${body.timestamp || Date.now()}`;
    const isGroup = body.isgroup === true || body.isgroup === "true";

    if (!sender || isGroup) {
      return res.sendStatus(200);
    }

    if (repliedMessages.has(messageId)) {
      console.log("Pesan duplikat, skip:", messageId);
      return res.sendStatus(200);
    }

    repliedMessages.add(messageId);

    setTimeout(() => {
      repliedMessages.delete(messageId);
    }, 5 * 60 * 1000);

    let balasan = "Halo 👋, silakan ketik *menu*";

    if (pesan.includes("halo")) {
      balasan = "Halo 👋 Selamat datang di ATR/BPN Kota Batu";
    } else if (pesan === "menu") {
      balasan =
        "📋 *Menu Layanan ATR/BPN Kota Batu*\n\n" +
        "1. Informasi Sertifikat\n" +
        "2. Cek Berkas\n" +
        "3. Kontak Admin\n\n" +
        "Ketik angka *1*, *2*, atau *3*.";
    } else if (pesan === "1") {
      balasan =
        "📄 *Informasi Sertifikat*\n" +
        "Silakan kirim nomor berkas atau pertanyaan Anda terkait sertifikat.";
    } else if (pesan === "2") {
      balasan =
        "📂 *Cek Berkas*\n" +
        "Silakan kirim nomor berkas Anda untuk dilakukan pengecekan.";
    } else if (pesan === "3") {
      balasan =
        "☎️ *Kontak Admin*\n" +
        "Hubungi admin ATR/BPN Kota Batu di nomor: 08xxxxxxxxxx";
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
      }
    );

    console.log("Balasan terkirim:", response.data);
    res.sendStatus(200);
  } catch (err) {
    console.log("Error webhook:", err.response?.data || err.message);
    res.sendStatus(200);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server jalan di port ${PORT}`);
});
