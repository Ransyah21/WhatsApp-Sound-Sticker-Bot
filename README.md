<div align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:128C7E,100:25D366&height=180&section=header&text=WA%20Sound%20Sticker%20Bot&fontSize=38&fontColor=ffffff&animation=fadeIn&fontAlignY=35&desc=Silent%20Auto-Clean%20WhatsApp%20Bot%20with%20Baileys%20v7&descAlignY=58&descSize=16" width="100%" />

  <a href="https://git.io/typing-svg">
    <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&size=16&pause=1000&color=25D366&center=true&vCenter=true&width=550&lines=Convert+Video+to+Sound+Sticker+(.ss);Silent+Mode+Anti-Spam+Group+Chat;Powered+by+Baileys+v7+and+FFmpeg" alt="Typing SVG" />
  </a>

  <p>
    <img src="https://img.shields.io/badge/Node.js-20%2B-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" />
    <img src="https://img.shields.io/badge/Baileys-v7-25D366?style=for-the-badge&logo=whatsapp&logoColor=white" />
    <img src="https://img.shields.io/badge/FFmpeg-Required-007808?style=for-the-badge&logo=ffmpeg&logoColor=white" />
    <img src="https://img.shields.io/badge/Mode-Silent%20Clean-111111?style=for-the-badge" />
  </p>
</div>

---

## ✨ Fitur Utama
- 🔊 **Sound Sticker Generator (`.ss` & `.ssa`)** — Ubah video pendek bersuara atau gabungkan foto/video + audio lokal jadi stiker bergerak bersuara.
- 🖼️ **Standard Sticker Maker (`.s`)** — Konversi gambar/video jadi stiker WhatsApp biasa.
- 🥷 **Sticker Cloner (`.curi` & `.hasilcuri`)** — Simpan stiker dari chat/grup dan tembak ulang kapan saja.
- 📁 **Local Media Vault (`.addvid`, `.addaudio`)** — Simpan koleksi video & audio/VN ke folder lokal biar gampang dipanggil ulang.
- 🧹 **Silent & Auto-Clean Mode** — Anti-nyampah pesan error di grup, teks menu otomatis terhapus dalam 15–20 detik, plus *cooldown* anti-spam 5 detik.

---

## 🛠️ Persiapan Sistem (Wajib Sebelum Install)
Pastikan perangkat sudah terpasang 3 komponen berikut:
1. **Node.js** (v20 atau terbaru)
2. **Git** *(Wajib ada karena modul `wa-sound-sticker` diambil langsung dari GitHub)*
3. **FFmpeg & FFprobe** *(Wajib terdaftar di System PATH)*
   - **Windows:** `winget install Gyan.FFmpeg`
   - **Linux (Ubuntu/Debian):** `sudo apt update && sudo apt install ffmpeg git -y`

---

## 🚀 Cara Install & Jalanin (Setelah Download ZIP)

1. **Ekstrak File ZIP** ke folder pilihan kamu, lalu buka terminal (CMD / PowerShell / Terminal) di dalam folder tersebut.
2. **Install Semua Modul:**
   ```bash
   npm install
   ```
   *(Jika modul `wa-sound-sticker` gagal terpasang otomatis, jalankan: `npm install github:alkhrzmy/wa-sound-sticker`)*
3. **Jalankan Bot:**
   ```bash
   node index.js
   ```
4. **Scan QR Code** yang muncul di terminal lewat menu **Perangkat Tertaut** di WhatsApp HP kamu hingga muncul status **`[ONLINE] Bot siap!`**.

---

## 🎮 Daftar Perintah WhatsApp

| Kategori | Perintah | Cara Pakai |
| :--- | :--- | :--- |
| **Menu** | `.menu` | Tampilkan daftar perintah (auto-hapus 20 detik) |
| **Stiker Suara** | `.ss` | Kirim/reply video pendek (maks. 8 detik) jadi stiker bersuara |
| | `.ssa <nama>` | Reply foto/video pakai audio tersimpan jadi stiker bersuara |
| **Stiker Biasa** | `.s` / `.stiker` | Kirim/reply gambar atau video jadi stiker standar |
| **Kloning** | `.curi` | Reply stiker orang lain untuk disimpan |
| | `.hasilcuri` | Kirim ulang stiker terakhir hasil `.curi` |
| **Koleksi Audio** | `.addaudio <nama>` | Reply audio/VN untuk disimpan ke folder `./audios` |
| | `.a <nama>` | Kirim audio tersimpan |
| | `.lista` | Lihat daftar audio tersimpan |
| **Koleksi Video** | `.addvid <nama>` | Reply video untuk disimpan ke folder `./videos` |
| | `.v <nama>` | Kirim video tersimpan |
| | `.listv` | Lihat daftar video tersimpan |

<details>
<summary><b>📦 Lihat Daftar Modul & Library (Klik untuk buka)</b></summary>

- `@whiskeysockets/baileys` (v7) — Core engine koneksi WhatsApp Web Multi-Device
- `wa-sound-sticker` — Patching codec & pengiriman stiker bersuara
- `wa-sticker-formatter` — Konversi gambar/video ke WebP standar
- `sharp` — Pemrosesan & resizing gambar cepat
- `pino` & `qrcode-terminal` — Logger ringan & penampil QR di terminal
</details>

---

## ⚠️ Catatan Keamanan
- **Jangan pernah upload folder `auth_info/`** ke publik karena berisi sesi login akun WhatsApp kamu.
- Gunakan nomor WhatsApp cadangan jika bot dipakai secara publik di banyak grup.

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:128C7E,100:25D366&height=100&section=footer" width="100%" />
