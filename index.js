const fs = require('fs');
const path = require('path');
const pino = require('pino');
const qrcode = require('qrcode-terminal');
const { Sticker, StickerTypes } = require('wa-sticker-formatter');

// ====== FOLDER PENYIMPANAN ======
const VID_DIR = './videos';
const AUD_DIR = './audios';
const TMP_DIR = './tmp';
[VID_DIR, AUD_DIR, TMP_DIR].forEach(d => { if (!fs.existsSync(d)) fs.mkdirSync(d); });

const cooldown = new Set();
const cleanName = (s) => (s || '').toLowerCase().replace(/[^a-z0-9_-]/g, '');

const AUDIO_MIME = {
    '.mp3': 'audio/mpeg',
    '.ogg': 'audio/ogg; codecs=opus',
    '.m4a': 'audio/mp4'
};

function findAudio(name) {
    for (const ext of Object.keys(AUDIO_MIME)) {
        const p = path.join(AUD_DIR, name + ext);
        if (fs.existsSync(p)) return { file: p, mimetype: AUDIO_MIME[ext] };
    }
    return null;
}

async function startBot() {
    const {
        makeWASocket,
        useMultiFileAuthState,
        DisconnectReason,
        fetchLatestBaileysVersion,
        downloadMediaMessage,
        proto
    } = await import('@whiskeysockets/baileys');

    // Patch Baileys untuk Sound Sticker
    const { sendSoundSticker, installSoundStickerCodec } = await import('wa-sound-sticker');
    installSoundStickerCodec(proto);

    const { state, saveCreds } = await useMultiFileAuthState('auth_info');
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        auth: state,
        logger: pino({ level: 'silent' }),
        browser: ['Bot Stiker', 'Chrome', '1.0.0']
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;
        if (qr) {
            console.log('\nScan QR ini pakai WhatsApp (Menu Perangkat Tertaut):');
            qrcode.generate(qr, { small: true });
        }
        if (connection === 'close') {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) {
                console.log('Koneksi putus, nyambungin ulang...');
                startBot();
            }
        } else if (connection === 'open') {
            console.log('\n=========================================');
            console.log('[ONLINE] Bot siap! Pesan user aman, teks bot auto-clean.');
            console.log('=========================================\n');
        }
    });

    sock.ev.on('messages.upsert', async ({ messages }) => {
        const msg = messages[0];
        if (!msg.message) return;

        const remoteJid = msg.key.remoteJid;
        const text = (
            msg.message.conversation ||
            msg.message.extendedTextMessage?.text ||
            msg.message.imageMessage?.caption ||
            msg.message.videoMessage?.caption ||
            ''
        ).trim();

        const args = text.split(/\s+/);
        const command = args[0].toLowerCase();
        const quotedMsg = msg.message.extendedTextMessage?.contextInfo?.quotedMessage;

        // Helper kirim teks dari bot yang otomatis terhapus setelah 15 detik biar nggak nyampah
        const kirimTeksSementara = async (isiTeks, detik = 15) => {
            try {
                const sent = await sock.sendMessage(remoteJid, { text: isiTeks });
                if (sent?.key) {
                    setTimeout(async () => {
                        try {
                            await sock.sendMessage(remoteJid, { delete: sent.key });
                        } catch (_) {}
                    }, detik * 1000);
                }
            } catch (_) {}
        };

        // Anti-spam cooldown 5 detik per user
        const sender = msg.key.participant || remoteJid;
        if (command.startsWith('.')) {
            if (cooldown.has(sender)) return;
            cooldown.add(sender);
            setTimeout(() => cooldown.delete(sender), 5000);
        }

        // 1. MENU BOT (Teks bot otomatis kehapus setelah 20 detik, pesan .menu lo tetap ada)
        if (command === '.menu' || command === '#menu') {
            const menuText = `╭──「 *BOT STIKER* 」
│ • *.ss* — Video jadi stiker bersuara
│ • *.ssa nama* — Gambar/video + audio
│ • *.s* — Gambar/video jadi stiker biasa
│ • *.curi* / *.hasilcuri* — Kloning stiker
│ • *.addvid* / *.v* / *.listv*
│ • *.addaudio* / *.a* / *.lista*
╰───────────────────`;
            await kirimTeksSementara(menuText, 20);
        }

        // 2. STIKER BIASA (Cuma kirim stiker, pesan lo tetap ada)
        else if (command === '.s' || command === '.stiker') {
            try {
                const targetMsg = quotedMsg ? { message: quotedMsg } : msg;
                const isImage = !!targetMsg.message?.imageMessage;
                const isVideo = !!targetMsg.message?.videoMessage;
                if (!isImage && !isVideo) return;

                const buffer = await downloadMediaMessage(targetMsg, 'buffer', {});
                const sticker = new Sticker(buffer, {
                    pack: 'Bot Stiker',
                    author: 'Bot',
                    type: StickerTypes.FULL,
                    quality: 60
                });
                await sock.sendMessage(remoteJid, await sticker.toMessage());
            } catch (err) {
                console.error('Error bikin stiker:', err);
            }
        }

        // 3. STIKER SUARA ASLI (Cuma kirim stiker tanpa teks apapun, pesan .ss lo tetap ada)
        else if (command === '.ss' || command === '.ssa') {
            let tmp;
            try {
                const target = quotedMsg ? { message: quotedMsg } : msg;
                const isVideo = !!target.message?.videoMessage;
                const isImage = !!target.message?.imageMessage;

                if (!isVideo && !isImage) return;

                const opts = { packName: 'Bot Stiker', publisher: 'Bot', emojis: ['🔊'], fit: 'cover' };

                if (command === '.ss') {
                    if (!isVideo) return;
                    opts.useVideoAudio = true;
                } else {
                    const name = cleanName(args[1]);
                    const found = name && findAudio(name);
                    if (!found) return;
                    opts.audioPath = found.file;
                }

                const buffer = await downloadMediaMessage(target, 'buffer', {});
                tmp = path.join(TMP_DIR, `${Date.now()}${isVideo ? '.mp4' : '.jpg'}`);
                fs.writeFileSync(tmp, buffer);
                opts.filePath = tmp;

                await sendSoundSticker(sock, remoteJid, opts);
            } catch (err) {
                console.error('Gagal bikin stiker suara:', err);
            } finally {
                if (tmp && fs.existsSync(tmp)) fs.unlinkSync(tmp);
            }
        }

        // 4. CURI STIKER (Silent, tanpa teks)
        else if (command === '.curi') {
            try {
                if (!quotedMsg?.stickerMessage) return;
                const buffer = await downloadMediaMessage({ message: quotedMsg }, 'buffer', {});
                fs.writeFileSync('./stiker_curian.webp', buffer);
            } catch (err) {
                console.error('Gagal curi stiker:', err);
            }
        }

        // 5. TEMBAK STIKER HASIL CURIAN
        else if (command === '.hasilcuri') {
            try {
                if (!fs.existsSync('./stiker_curian.webp')) return;
                await sock.sendMessage(remoteJid, {
                    sticker: fs.readFileSync('./stiker_curian.webp')
                });
            } catch (err) {
                console.error('Gagal kirim hasil curi:', err);
            }
        }

        // 6. SIMPEN VIDEO (Silent, tanpa teks)
        else if (command === '.addvid') {
            try {
                const name = cleanName(args[1]);
                const target = quotedMsg ? { message: quotedMsg } : msg;
                if (!name || !target.message?.videoMessage) return;

                const buffer = await downloadMediaMessage(target, 'buffer', {});
                fs.writeFileSync(path.join(VID_DIR, `${name}.mp4`), buffer);
            } catch (err) {
                console.error('Gagal simpen video:', err);
            }
        }

        // 7. KIRIM VIDEO
        else if (command === '.v') {
            try {
                const name = cleanName(args[1]);
                const file = path.join(VID_DIR, `${name}.mp4`);
                if (!name || !fs.existsSync(file)) return;

                await sock.sendMessage(remoteJid, {
                    video: fs.readFileSync(file),
                    mimetype: 'video/mp4'
                });
            } catch (err) {
                console.error('Gagal kirim video:', err);
            }
        }

        // 8. DAFTAR VIDEO (Teks bot auto-hapus 15 detik)
        else if (command === '.listv') {
            const list = fs.readdirSync(VID_DIR)
                .filter(f => f.endsWith('.mp4'))
                .map(f => `• ${f.replace('.mp4', '')}`)
                .join('\n');
            if (list) await kirimTeksSementara(`*[ VIDEO ]*\n${list}`, 15);
        }

        // 9. SIMPEN AUDIO (Silent, tanpa teks)
        else if (command === '.addaudio') {
            try {
                const name = cleanName(args[1]);
                const target = quotedMsg ? { message: quotedMsg } : msg;
                const audioMsg = target.message?.audioMessage;
                if (!name || !audioMsg) return;

                const mime = audioMsg.mimetype || '';
                const ext = mime.includes('ogg') ? '.ogg' : mime.includes('mpeg') ? '.mp3' : '.m4a';
                const buffer = await downloadMediaMessage(target, 'buffer', {});
                fs.writeFileSync(path.join(AUD_DIR, `${name}${ext}`), buffer);
            } catch (err) {
                console.error('Gagal simpen audio:', err);
            }
        }

        // 10. KIRIM AUDIO
        else if (command === '.a') {
            try {
                const name = cleanName(args[1]);
                const found = name && findAudio(name);
                if (!found) return;

                await sock.sendMessage(remoteJid, {
                    audio: fs.readFileSync(found.file),
                    mimetype: found.mimetype,
                    ptt: false
                });
            } catch (err) {
                console.error('Gagal kirim audio:', err);
            }
        }

        // 11. DAFTAR AUDIO (Teks bot auto-hapus 15 detik)
        else if (command === '.lista') {
            const list = fs.readdirSync(AUD_DIR)
                .map(f => `• ${path.parse(f).name}`)
                .join('\n');
            if (list) await kirimTeksSementara(`*[ AUDIO ]*\n${list}`, 15);
        }
    });
}

startBot();