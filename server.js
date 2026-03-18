const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const TOKEN = process.env.FONNTE_TOKEN;

if (!TOKEN) {
  console.error("FONNTE_TOKEN belum di-set di environment variable");
}

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
    const body = req.body;

    console.log("=== WEBHOOK MASUK ===");
    console.log(JSON.stringify(body, null, 2));

    let messages = [];

    if (Array.isArray(body?.data)) {
      messages = body.data;
    } else if (body && typeof body === "object") {
      messages = [body];
    }

    if (messages.length === 0) {
      console.log("Tidak ada pesan yang bisa diproses");
      return res.sendStatus(200);
    }

    for (const msg of messages) {
      const rawText = msg.text || msg.message || msg.chat || "";
      const pesan = String(rawText).trim().toLowerCase();

      const sender =
        msg.sender ||
        msg.from ||
        msg.number ||
        msg.phone ||
        msg.whatsapp;

      console.log("Pesan terdeteksi:", pesan);
      console.log("Sender terdeteksi:", sender);

      if (!sender) {
        console.log("Skip: sender tidak ditemukan");
        continue;
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

      console.log("Balasan yang akan dikirim:", balasan);

      try {
        const formData = new URLSearchParams();
        formData.append("target", sender);
        formData.append("message", balasan);

        const sendResponse = await axios.post(
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

        console.log("=== RESPONSE FONNTE SEND ===");
        console.log(JSON.stringify(sendResponse.data, null, 2));
      } catch (sendErr) {
        console.log("=== ERROR KIRIM KE FONNTE ===");
        console.log("Message:", sendErr.message);

        if (sendErr.response) {
          console.log("Status:", sendErr.response.status);
          console.log(
            "Data:",
            JSON.stringify(sendErr.response.data, null, 2)
          );
        }
      }
    }

    return res.sendStatus(200);
  } catch (err) {
    console.log("=== ERROR WEBHOOK ===");
    console.log(err.message);
    return res.sendStatus(200);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server jalan di port ${PORT}`);
});
