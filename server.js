const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const TOKEN = "1js38VooEe2shQ7RAj89";
console.log("TOKEN ADA:", !!TOKEN);
console.log("TOKEN PANJANG:", TOKEN ? TOKEN.length : 0);
console.log("TOKEN PREVIEW:", TOKEN ? TOKEN.slice(0, 8) + "..." : "KOSONG");
console.log("TOKEN ADA:", !!TOKEN);
console.log("TOKEN PREVIEW:", TOKEN ? TOKEN.slice(0, 8) + "..." : "KOSONG");

app.get("/", (req, res) => {
  res.send("Bot WhatsApp aktif 🚀");
});

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    token: TOKEN ? "available" : "missing",
  });
});

app.get("/webhook", (req, res) => {
  res.status(200).send("Webhook aktif");
});

app.post("/webhook", async (req, res) => {
  try {
    console.log("=== WEBHOOK MASUK ===");
    console.log(JSON.stringify(req.body, null, 2));

    const body = req.body || {};

    const pesan = String(body.pesan || body.message || body.text || "")
      .trim()
      .toLowerCase();

    const sender = body.sender || body.pengirim || body.from || body.number;

    console.log("Pesan:", pesan);
    console.log("Dari:", sender);

    if (!sender) {
      console.log("Sender tidak ditemukan");
      return res.sendStatus(200);
    }

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

    console.log("RESPONSE FONNTE:", response.data);

    res.sendStatus(200);
  } catch (err) {
    console.log("ERROR:", err.response?.data || err.message);
    res.sendStatus(200);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server jalan di port ${PORT}`);
});
