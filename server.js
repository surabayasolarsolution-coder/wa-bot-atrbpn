const express = require("express");
const axios = require("axios");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// sementara hardcode dulu untuk test
const TOKEN = "1js38VooEe2shQ7RAj89";

function getReply(pesan) {
  const text = String(pesan || "").trim().toLowerCase();

  if (["halo", "hai", "hi", "menu", "start"].includes(text)) {
    return (
      "Halo 👋\n" +
      "Selamat datang di layanan informasi ATR/BPN Kota Batu.\n\n" +
      "Silakan pilih menu berikut:\n" +
      "1. Informasi Sertifikat\n" +
      "2. Cek Status Berkas\n" +
      "3. Info Kantor\n" +
      "4. Persyaratan Layanan\n" +
      "5. Jam Pelayanan\n" +
      "6. Kontak Admin\n\n" +
      "Ketik angka menu, misalnya: 1"
    );
  }

  if (text === "1") {
    return (
      "📄 *Informasi Sertifikat*\n\n" +
      "Layanan ini mencakup informasi umum terkait:\n" +
      "- Pendaftaran tanah\n" +
      "- Balik nama\n" +
      "- Pemecahan/penggabungan bidang\n" +
      "- Roya\n" +
      "- Hak tanggungan\n\n" +
      "Untuk informasi persyaratan, ketik: 4\n" +
      "Untuk kembali ke menu utama, ketik: menu"
    );
  }

  if (text === "2") {
    return (
      "📌 *Cek Status Berkas*\n\n" +
      "Untuk pengecekan status berkas, silakan siapkan:\n" +
      "- Nomor berkas\n" +
      "- Nama pemohon\n" +
      "- Jenis layanan\n\n" +
      "Silakan hubungi petugas/admin agar dapat dibantu pengecekannya.\n\n" +
      "Ketik 6 untuk kontak admin\n" +
      "Ketik menu untuk kembali"
    );
  }

  if (text === "3") {
    return (
      "🏢 *Info Kantor ATR/BPN Kota Batu*\n\n" +
      "Alamat:\n" +
      "Jl. Diponegoro No. ... Kota Batu\n\n" +
      "Untuk jam pelayanan ketik: 5\n" +
      "Untuk kembali ke menu utama ketik: menu"
    );
  }

  if (text === "4") {
    return (
      "📝 *Persyaratan Layanan*\n\n" +
      "Beberapa persyaratan tergantung jenis layanan, seperti:\n" +
      "- KTP/KK\n" +
      "- Sertifikat asli\n" +
      "- SPPT PBB\n" +
      "- Akta jual beli/akta hibah/akta waris\n" +
      "- Surat kuasa jika dikuasakan\n\n" +
      "Silakan sebutkan layanan yang ingin ditanyakan:\n" +
      "- balik nama\n" +
      "- roya\n" +
      "- pemecahan\n" +
      "- hak tanggungan\n\n" +
      "Ketik menu untuk kembali"
    );
  }

  if (text === "5") {
    return (
      "⏰ *Jam Pelayanan*\n\n" +
      "Senin - Jumat\n" +
      "08.00 - 15.00 WIB\n\n" +
      "Hari libur nasional dan cuti bersama tutup.\n\n" +
      "Ketik menu untuk kembali ke menu utama"
    );
  }

  if (text === "6") {
    return (
      "☎️ *Kontak Admin ATR/BPN Kota Batu*\n\n" +
      "Untuk bantuan lebih lanjut, silakan hubungi admin/petugas layanan:\n" +
      "[isi nomor admin resmi]\n" +
      "[isi email atau link bila ada]\n\n" +
      "Ketik menu untuk kembali"
    );
  }

  if (text.includes("balik nama")) {
    return (
      "📑 *Informasi Balik Nama*\n\n" +
      "Persyaratan umum biasanya meliputi:\n" +
      "- Sertifikat asli\n" +
      "- KTP dan KK para pihak\n" +
      "- Akta jual beli / akta peralihan hak\n" +
      "- SPPT PBB\n" +
      "- Bukti pelunasan BPHTB/PPh sesuai ketentuan\n\n" +
      "Untuk informasi lebih lanjut, hubungi admin.\n" +
      "Ketik menu untuk kembali"
    );
  }

  if (text.includes("roya")) {
    return (
      "📑 *Informasi Roya*\n\n" +
      "Persyaratan umum biasanya meliputi:\n" +
      "- Sertifikat asli\n" +
      "- Surat roya / pelunasan dari bank\n" +
      "- Identitas pemohon\n\n" +
      "Ketik menu untuk kembali"
    );
  }

  return (
    "Maaf, pesan belum dikenali.\n\n" +
    "Silakan ketik *menu* untuk melihat daftar layanan."
  );
}

app.get("/", (req, res) => {
  res.send("Bot aktif");
});

app.post("/webhook", async (req, res) => {
  try {
    const body = req.body || {};
    console.log("WEBHOOK:", JSON.stringify(body, null, 2));

    const sender = body.sender || body.number || body.from;
    const pesan = body.message || body.pesan || "";
    const isGroup = body.isgroup === true || body.isgroup === "true";

    if (!sender || isGroup) {
      return res.sendStatus(200);
    }

    const balasan = getReply(pesan);

    const formData = new URLSearchParams();
    formData.append("target", sender);
    formData.append("message", balasan);

    const response = await axios.post("https://api.fonnte.com/send", formData, {
      headers: {
        Authorization: TOKEN,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      timeout: 30000,
    });

    console.log("SEND RESPONSE:", response.data);
    return res.sendStatus(200);
  } catch (err) {
    console.log("ERROR:", err.response?.data || err.message);
    return res.sendStatus(200);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server jalan di port", PORT);
});
