const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const TOKEN = process.env.FONNTE_TOKEN;

// session sederhana per user
const sessions = {};
const processedMessages = new Set();

// helper kirim pesan
async function kirimPesan(target, message) {
  const formData = new URLSearchParams();
  formData.append("target", target);
  formData.append("message", message);

  return axios.post("https://api.fonnte.com/send", formData, {
    headers: {
      Authorization: TOKEN,
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });
}

app.get("/", (req, res) => {
  res.send("Bot ATR/BPN aktif 🚀");
});

app.post("/webhook", async (req, res) => {
  try {
    const body = req.body;

    console.log("WEBHOOK:", JSON.stringify(body, null, 2));

    const sender = body.sender || body.number;
    const pesan = String(body.message || body.pesan || "")
      .toLowerCase()
      .trim();

    const messageId =
      body.id || `${sender}-${pesan}-${body.timestamp || Date.now()}`;

    if (!sender) return res.sendStatus(200);

    // anti duplicate
    if (processedMessages.has(messageId)) {
      return res.sendStatus(200);
    }
    processedMessages.add(messageId);

    if (!sessions[sender]) {
      sessions[sender] = { step: "menu" };
    }

    let session = sessions[sender];
    let balasan = "";

    // ===== MENU UTAMA =====
    if (pesan === "menu" || pesan === "halo") {
      session.step = "menu";

      balasan =
        "👋 *ATR/BPN Kota Batu*\n\n" +
        "📋 *Menu Layanan:*\n" +
        "1. Informasi Sertifikat\n" +
        "2. Cek Status Berkas\n" +
        "3. Info Kantor\n" +
        "4. Pengaduan\n" +
        "5. Kontak Admin\n\n" +
        "Ketik angka menu";
    }

    // ===== MENU 1 =====
    else if (pesan === "1") {
      balasan =
        "📄 *Informasi Sertifikat*\n\n" +
        "- Fotokopi KTP\n" +
        "- KK\n" +
        "- Bukti kepemilikan tanah\n\n" +
        "Silakan datang ke kantor untuk proses lanjut.";
    }

    // ===== MENU 2 =====
    else if (pesan === "2") {
      session.step = "cek_berkas";

      balasan = "Silakan kirim *nomor berkas* Anda.\nContoh: BKS-2026-0001";
    }

    else if (session.step === "cek_berkas") {
      const nomor = pesan.toUpperCase();

      // simulasi database
      const dummy = {
        "BKS-2026-0001": "Sedang diproses",
        "BKS-2026-0002": "Selesai",
      };

      const status = dummy[nomor];

      if (status) {
        balasan =
          `📂 *Status Berkas*\n\nNomor: ${nomor}\nStatus: ${status}`;
      } else {
        balasan = "❌ Nomor berkas tidak ditemukan.";
      }

      session.step = "menu";
    }

    // ===== MENU 3 =====
    else if (pesan === "3") {
      balasan =
        "📍 *Kantor ATR/BPN Kota Batu*\n\n" +
        "Alamat: Jl. Contoh No.123\n" +
        "Jam: 08.00 - 15.00 WIB";
    }

    // ===== MENU 4 (PENGADUAN) =====
    else if (pesan === "4") {
      session.step = "aduan_nama";
      balasan = "Silakan kirim *nama Anda*:";
    }

    else if (session.step === "aduan_nama") {
      session.nama = pesan;
      session.step = "aduan_isi";

      balasan = "Tuliskan *isi pengaduan*:";
    }

    else if (session.step === "aduan_isi") {
      const tiket = "TIKET-" + Date.now();

      balasan =
        "✅ Pengaduan diterima\n\n" +
        `No Tiket: ${tiket}\n` +
        `Nama: ${session.nama}\n` +
        `Isi: ${pesan}`;

      session.step = "menu";
    }

    // ===== MENU 5 =====
    else if (pesan === "5") {
      balasan =
        "☎️ Hubungi admin:\n" +
        "08xxxxxxxxxx";
    }

    else {
      balasan = "Ketik *menu* untuk melihat layanan.";
    }

    await kirimPesan(sender, balasan);

    res.sendStatus(200);
  } catch (err) {
    console.log("ERROR:", err.response?.data || err.message);
    res.sendStatus(200);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server jalan di port", PORT);
});
