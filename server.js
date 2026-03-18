const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("WA Bot ATR/BPN Kota Batu aktif");
});

app.post("/webhook", async (req, res) => {
  console.log("Webhook masuk:", req.body);

  const message = req.body.message || "";
  const sender = req.body.sender;

  let reply = "Halo 👋, silakan pilih layanan:\n1. Info Sertifikat\n2. Cek Berkas\n3. Pengaduan";

  if (message.toLowerCase().includes("halo")) {
    reply = "Halo 👋 Selamat datang di ATR/BPN Kota Batu.\nKetik menu untuk pilihan layanan.";
  }

  try {
    await axios.post(
      "https://api.fonnte.com/send",
      {
        target: sender,
        message: reply,
      },
      {
        headers: {
          Authorization: process.env.FONNTE_TOKEN,
        },
      }
    );
  } catch (err) {
    console.error("Gagal kirim:", err.message);
  }

  res.sendStatus(200);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server jalan di port", PORT);
});
