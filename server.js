require("dotenv").config();
const express = require("express");

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    ok: true,
    service: "WA Chatbot ATR/BPN Kota Batu"
  });
});

app.post("/webhook", (req, res) => {
  const pesan = req.body?.message || "";

  console.log("Pesan masuk:", pesan);

  res.json({
    reply: "Halo 👋 ini bot ATR/BPN Kota Batu"
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server jalan di port", PORT);
});
