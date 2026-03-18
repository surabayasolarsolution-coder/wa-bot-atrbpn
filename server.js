app.post("/webhook", async (req, res) => {
  const body = req.body;

  console.log("ISI BODY:", JSON.stringify(body, null, 2));

  let messages = [];

  if (body.data) {
    messages = body.data;
  } else {
    messages = [body];
  }

  for (let msg of messages) {
    const pesan = (msg.text || "").toLowerCase();
    const sender = msg.sender || msg.from;

    if (!sender) continue;

    console.log("Pesan:", pesan, "Dari:", sender);

    let balasan = "Halo 👋, silakan ketik *menu*";

    if (pesan.includes("halo")) {
      balasan = "Halo 👋 Selamat datang di ATR/BPN Kota Batu";
    }

    try {
      const response = await axios.post(
        "https://api.fonnte.com/send",
        {
          target: sender,
          message: balasan,
        },
        {
          headers: {
            Authorization: process.env.FONNTE_TOKEN,
          },
        }
      );

      console.log("Balasan sukses:", response.data);
    } catch (err) {
      console.log("ERROR KIRIM:", err.response?.data || err.message);
    }
  }

  res.sendStatus(200);
});
