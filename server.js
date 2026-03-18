const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const TOKEN = process.env.FONNTE_TOKEN;

const sessions = {};
const processedMessages = new Set();

async function kirimPesan(target, message) {
  const formData = new URLSearchParams();
  formData.append("target", target);
  formData.append("message", message);

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

  console.log("RESPONSE FONNTE:", response.data);
  return response.data;
}

app.get("/", (req, res) => {
  res.send("Bot ATR/BPN aktif 🚀");
});

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    token: !!TOKEN,
  });
});

app.get("/webhook", (req, res) => {
  res.status(200).send("Webhook aktif");
});

app.post("/webhook", async (req, res) => {
  try {
    const body = req.body || {};
    console.log("WEBHOOK MASUK:", JSON.stringify(body, null, 2));

    const sender = body.sender || body.number || body.from || body.pengirim;
    const pesan = String(body.message || body.pesan || "")
      .trim()
      .toLowerCase();

    const isGroup = body.isgroup === true || body.isgroup === "true";

    const messageId =
      body.id ||
      body.senderid ||
      `${sender}-${pesan}-${body.timestamp || Date.now()}`;

    if (!sender) {
      console.log("Sender tidak ditemukan");
      return res.sendStatus(200);
    }

    if (isGroup) {
      console.log("Pesan grup, skip");
      return res.sendStatus(200);
    }

    if (processedMessages.has(messageId)) {
      console.log("Pesan duplikat, skip:", messageId);
      return res.sendStatus(200);
    }

    processedMessages.add(messageId);
    setTimeout(() => processedMessages.delete(messageId), 5 * 60 * 1000);

    if (!sessions[sender]) {
      sessions[sender] = { step: "menu" };
    }

    const session = sessions[sender];
    let balasan = "";

    if (pesan === "halo" || pesan === "hai" || pesan === "menu") {
      session.step = "menu";
      balasan =
        "👋 *ATR/BPN Kota Batu*\n\n" +
        "📋 *Menu Layanan:*\n" +
        "1. Informasi Sertifikat\n" +
        "2. Cek Status Berkas\n" +
        "3. Info Kantor\n" +
        "4. Pengaduan\n" +
        "5. Kontak Admin\n\n" +
        "Ketik angka menu.";
    } else if (pesan === "1") {
      session.step = "menu";
      balasan =
        "📄 *Informasi Sertifikat*\n\n" +
        "- Fotokopi KTP\n" +
        "- Fotokopi KK\n" +
        "- Bukti kepemilikan tanah\n" +
        "- Dokumen pendukung lainnya sesuai layanan\n\n" +
        "Ketik *menu* untuk kembali.";
    } else if (pesan === "2") {
      session.step = "cek_berkas";
      balasan =
        "📂 Silakan kirim *nomor berkas* Anda.\n" +
        "Contoh: *BKS-2026-0001*";
    } else if (session.step === "cek_berkas") {
      const nomor = pesan.toUpperCase();

      const dummy = {
        "BKS-2026-0001": "Sedang diproses",
        "BKS-2026-0002": "Selesai",
        "BKS-2026-0003": "Menunggu verifikasi",
      };

      const status = dummy[nomor];

      if (status) {
        balasan =
          `📂 *Status Berkas*\n\n` +
          `Nomor: ${nomor}\n` +
          `Status: ${status}\n\n` +
          `Ketik *menu* untuk kembali.`;
      } else {
        balasan =
          `❌ Nomor berkas *${nomor}* tidak ditemukan.\n` +
          `Periksa lagi nomor berkas Anda atau ketik *menu*.`;
      }

      session.step = "menu";
    } else if (pesan === "3") {
      session.step = "menu";
      balasan =
        "📍 *Info Kantor ATR/BPN Kota Batu*\n\n" +
        "Alamat: Jl. Contoh No.123\n" +
        "Jam Layanan: 08.00 - 15.00 WIB\n\n" +
        "Ketik *menu* untuk kembali.";
    } else if (pesan === "4") {
      session.step = "aduan_nama";
      balasan = "📝 Silakan kirim *nama Anda* untuk pengaduan.";
    } else if (session.step === "aduan_nama") {
      session.nama = body.message || body.pesan || "";
      session.step = "aduan_isi";
      balasan = "Tuliskan *isi pengaduan* Anda.";
    } else if (session.step === "aduan_isi") {
      const isiAduan = body.message || body.pesan || "";
      const tiket = "TIKET-" + Date.now();

      balasan =
        "✅ *Pengaduan diterima*\n\n" +
        `No Tiket: ${tiket}\n` +
        `Nama: ${session.nama}\n` +
        `Isi: ${isiAduan}\n\n` +
        "Petugas akan menindaklanjuti. Ketik *menu* untuk kembali.";

      session.step = "menu";
      delete session.nama;
    } else if (pesan === "5") {
      session.step = "menu";
      balasan =
        "☎️ *Kontak Admin*\n" +
        "Hubungi admin di: 08xxxxxxxxxx\n\n" +
        "Ketik *menu* untuk kembali.";
    } else {
      balasan = "Silakan ketik *menu* untuk melihat layanan.";
    }

    console.log("BALASAN:", balasan);

    await kirimPesan(sender, balasan);

    return res.sendStatus(200);
  } catch (err) {
    console.log("ERROR WEBHOOK:", err.response?.data || err.message);
    return res.sendStatus(200);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server jalan di port", PORT);
});
