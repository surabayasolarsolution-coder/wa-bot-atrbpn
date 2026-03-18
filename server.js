const axios = require("axios");

const TOKEN = process.env.FONNTE_TOKEN;

async function cekPesan() {
  try {
    const res = await axios.get("https://api.fonnte.com/get_inbox", {
      headers: {
        Authorization: TOKEN,
      },
    });

    const data = res.data;

    if (!data || !data.data) return;

    for (let msg of data.data) {
      const pesan = msg.text || "";
      const sender = msg.sender;

      console.log("Pesan masuk:", pesan);

      let balasan = "Halo 👋, silakan ketik menu";

      if (pesan.toLowerCase().includes("halo")) {
        balasan = "Halo 👋 Selamat datang di ATR/BPN Kota Batu";
      }

      await axios.post(
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
    }
  } catch (err) {
    console.log("Error:", err.message);
  }
}

// jalan tiap 5 detik
setInterval(cekPesan, 5000);

console.log("Bot polling aktif...");
