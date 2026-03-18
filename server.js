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

    console.log("SENDER:", sender);
    console.log("MESSAGE:", message);

    if (!sender) {
      console.log("❌ sender kosong");
      return res.status(200).send("no sender");
    }

    const reply = "Halo 👋 dari bot Railway";

    const response = await axios.post(
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

    console.log("✅ BERHASIL KIRIM:", response.data);

    res.status(200).send("ok");
  } catch (error) {
    console.log("❌ ERROR KIRIM:");
    console.log(error.response?.data || error.message);

    res.status(200).send("error");
  }
});
