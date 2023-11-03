import { rmSync } from "fs";
import getLogger from "middlewares/getLogger";
import pino from "pino";
// const https = require("https");
// const {
//   default: makeWASocket,
//   DisconnectReason,
//   useMultiFileAuthState,
//   fetchLatestBaileysVersion,
//   delay,
//   makeCacheableSignalKeyStore,
// } = require("@whiskeysockets/baileys");
import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  delay,
  makeCacheableSignalKeyStore,
} from "@whiskeysockets/baileys";
const msgRetryCounterMap = {};
const sessionName = "mainId";
const sessions = new Map();
// const useStore = !process.argv.includes("--no-store");
// const doReplies = !process.argv.includes("--no-reply");

// function capital(textSound) {
//   const arr = textSound.split(" ");
//   for (var i = 0; i < arr.length; i++) {
//     arr[i] = arr[i].charAt(0).toUpperCase() + arr[i].slice(1);
//   }
//   const str = arr.join(" ");
//   return str;
// }

const sessionDir = ".auth_info_baileys";

// simpan chats pada memory dan simpan pada file json
const logger = pino({ level: "trace" });

const CreateSession = async (io, sessionId) => {
  const { state, saveCreds: saveState } = await useMultiFileAuthState(
    sessionDir
  );

  const { version, isLatest } = await fetchLatestBaileysVersion();

  // nanti kita oprek kenapa sangaht banyak logger YGY

  const sock = makeWASocket({
    version,
    logger,
    // auth: state,
    auth: {
      creds: state.creds,
      /** caching makes the store faster to send/recv messages */
      keys: makeCacheableSignalKeyStore(state.keys, logger),
    },
    msgRetryCounterMap,
    generateHighQualityLinkPreview: true,
    // implement to handle retries
    // off penyimpanan
    // getMessage: async (key) => {
    //   if (store) {
    //     const msg = await store.loadMessage(key.remoteJid, key.id);
    //     return msg?.message || undefined;
    //   }

    //   // only if store is present
    //   return {
    //     conversation: "hello",
    //   };
    // },
  });

  sessions.set(sessionId, { ...sock, store: "store" });

  sock.ev.process(async (events) => {
    if (events["connection.update"]) {
      const update = events["connection.update"];
      const { connection, lastDisconnect } = update;

      // buat variable stauscode dan shouldreconnect di luar connection check
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

      if (connection === "close") {
        if (shouldReconnect) {
          // ignore sementara 440
          if (statusCode && statusCode !== 440) {
            console.log("reconnect");
            CreateSession(io, sessionId);
          }
        } else {
          // delete store
          deleteSession();
          io.emit("statusWA", {
            status: "Connection closed",
            message: `Kamu sudah tidak terhubung, refresh halaman untuk menerima QRCode`,
          });
        }
      }

      if (update.qr) {
        io.emit("statusWA", {
          status: "Scan",
          message: `QR code Diterima, Silakan Lakukan Scan`,
          qr: update.qr,
        });
      }

      if (update.isNewLogin) {
        io.emit("statusWA", {
          status: "Ready",
          message: `Selamat Datang, halaman akan di Refresh untuk menyelesaikan Proses`,
          info: sock.authState.creds,
          isNewLogin: true,
        });
      }

      if (update.isOnline) {
        io.emit("statusWA", {
          status: "Ready",
          message: `Whatsapp sudah bisa digunakan`,
          info: sock.authState.creds,
        });

        // await sock.sendMessage("6285694630595@s.whatsapp.net", { text: "p" });
      }

      // console.log("\x1b[36m%s\x1b[0m", update);
    }

    // credentials updated -- save them
    if (events["creds.update"]) {
      await saveState();
    }

    if (events.call) {
      // console.log("recv call event", events.call);
    }

    if (events["messaging-history.set"]) {
      // const { chats, contacts, messages, isLatest } =
      //   events["messaging-history.set"];
      // console.log(
      //   `recv ${chats.length} chats, ${contacts.length} contacts, ${messages.length} msgs (is latest: ${isLatest})`
      // );
    }

    if (events["messages.update"]) {
      // messages updated like status delivered, message deleted etc.
      // console.log(events["messages.update"]);
    }

    if (events["message-receipt.update"]) {
      // console.log(events["message-receipt.update"]);
    }

    if (events["messages.reaction"]) {
      // console.log(events["messages.reaction"]);
    }

    if (events["presence.update"]) {
      // console.log(events["presence.update"]);
    }

    if (events["chats.update"]) {
      // console.log(events["chats.update"]);
    }

    if (events["contacts.update"]) {
      // for (const contact of events["contacts.update"]) {
      //   if (typeof contact.imgUrl !== "undefined") {
      //     const newUrl =
      //       contact.imgUrl === null
      //         ? null
      //         : await sock.profilePictureUrl(contact.id);
      //     console.log(`contact ${contact.id} has a new profile pic: ${newUrl}`);
      //   }
      // }
    }

    if (events["chats.delete"]) {
      // console.log("chats deleted ", events["chats.delete"]);
    }
  });

  // active it if wanna bot
  // sock.ev.on("messages.upsert", async ({ messages, type }) => {
  //   if (type === "notify") {
  //     if (!messages[0].key.fromMe && doReplies) {
  //       //tentukan jenis pesan berbentuk text
  //       const oriMessage = messages[0].message.conversation;

  //       //tentukan jenis pesan apakah bentuk list
  //       const responseList = messages[0].message.listResponseMessage;

  //       //tentukan jenis pesan apakah bentuk button
  //       const responseButton = messages[0].message.buttonsResponseMessage;

  //       //nowa dari pengirim pesan sebagai id
  //       const noWa = messages[0].key.remoteJid;

  //       await sock.readMessages([messages[0].key]);

  //       //kecilkan semua pesan yang masuk lowercase
  //       const pesan = oriMessage.toLowerCase();

  //       if (pesan === "halo") {
  //         await sock.sendMessage(
  //           noWa,
  //           {
  //             text: "Halo, ini adalah layanan e-PPID Bawaslu Terintegrasi. Untuk Informasi lebih lanjut silakan kunjungi www.eppid.bawaslu.go.id",
  //           },
  //           { quoted: messages[0] }
  //         );
  //       }

  //       if (pesan === "duck") {
  //         await sock.sendMessage(
  //           noWa,
  //           {
  //             text: "Hai, ini layanan pesan Bot. Anda dapat melanjutkan contoh layanan dengan mengetik pilihan sebagai berikut\n\nbtn\nimg\nsound",
  //           },
  //           { quoted: messages[0] }
  //         );
  //       }

  //       if (pesan === "btn") {
  //         const buttons = [
  //           {
  //             buttonId: "id1",
  //             buttonText: { displayText: "Info 1!" },
  //             type: 1,
  //           },
  //           {
  //             buttonId: "id2",
  //             buttonText: { displayText: "Info 2!" },
  //             type: 1,
  //           },
  //           {
  //             buttonId: "id3",
  //             buttonText: { displayText: "Info 3" },
  //             type: 1,
  //           },
  //         ];
  //         const buttonMessage = {
  //           text: "Hai, ini layanan yang bisa kamu pilih",
  //           footer: "Duck",
  //           buttons: buttons,
  //           headerType: 1,
  //         };
  //         await sock.sendMessage(noWa, buttonMessage);
  //       }

  //       if (responseButton) {
  //         if (responseButton.selectedButtonId == "id1") {
  //           await sock.sendMessage(noWa, {
  //             text: "anda memilih ID tombol ke 1",
  //           });
  //         } else if (responseButton.selectedButtonId == "id2") {
  //           await sock.sendMessage(noWa, {
  //             text: "anda memilih ID tombol ke 2",
  //           });
  //         } else if (responseButton.selectedButtonId == "id3") {
  //           await sock.sendMessage(noWa, {
  //             text: "anda memilih ID tombol ke 3",
  //           });
  //         } else {
  //           await sock.sendMessage(noWa, {
  //             text: "Pesan tombol invalid",
  //           });
  //         }
  //       }

  //       if (pesan === "img") {
  //         await sock.sendMessage(noWa, {
  //           image: {
  //             url: "https://picsum.photos/200/300",
  //           },
  //           caption: "Duck",
  //         });
  //       }

  //       if (pesan === "sound") {
  //         const textsound = capital(
  //           "ini adalah pesan suara dari Robot Whastapp"
  //         );

  //         let API_URL =
  //           "https://texttospeech.responsivevoice.org/v1/text:synthesize?text=" +
  //           textsound +
  //           "&lang=id&engine=g3&name=&pitch=0.5&rate=0.5&volume=1&key=0POmS5Y2&gender=male";
  //         var file = createWriteStream("./sound.mp3");
  //         const request = https.get(API_URL, async function (response) {
  //           await response.pipe(file);
  //           response.on("end", async function () {
  //             await sock.sendMessage(noWa, {
  //               audio: {
  //                 url: "sound.mp3",
  //                 caption: textsound,
  //               },
  //               mimetype: "audio/mp4",
  //             });
  //           });
  //         });
  //       }
  //     }
  //   }
  // });

  return sock;
};

const deleteSession = () => {
  rmSync(sessionDir, { force: true, recursive: true });
  sessions.delete(sessionName);
};

const isSessionExists = () => {
  return sessions.has(sessionName);
};

const getSession = () => {
  return sessions.get(sessionName) ?? null;
};

const formatPhone = (phone) => {
  let formatted = phone.replace(/\D/g, "");

  // Menghilangkan angka 0 di depan diganti dengan 62
  if (formatted.startsWith("0")) {
    formatted = "62" + formatted.substr(1);
  }
  // handle jika dimulai langsung dari angka 8 bukan nol (input number)
  if (formatted.startsWith("8")) {
    formatted = "62" + formatted;
  }

  if (!formatted.endsWith("@s.whatsapp.net")) {
    formatted = formatted + "@s.whatsapp.net";
  }

  return formatted;
};

const isExists = async (session, jid, isGroup = false) => {
  try {
    let result;

    if (isGroup) {
      result = await session.groupMetadata(jid);

      return Boolean(result.id);
    }

    [result] = await session.onWhatsApp(jid);

    return result.exists;
  } catch {
    return false;
  }
};

const sendMessage = async (session, receiver, message, delayMs = 1000) => {
  try {
    await delay(parseInt(delayMs));

    return await session.sendMessage(receiver, { text: message });
  } catch (e) {
    getLogger.error(e);
    return Promise.reject(null); // eslint-disable-line prefer-promise-reject-errors
  }
};

const init = (io) => {
  CreateSession(io, sessionName);
};

export {
  init,
  isSessionExists,
  getSession,
  formatPhone,
  deleteSession,
  isExists,
  sendMessage,
};

// Require adalah untuk menetapkan apakah mengirim whatsapp diperlukan atau tidak
// jika diperlukan maka setiap proses akan dibatalkan jika gagal memproses wahtsapp
// jika tidak, maka setaip error hanya disimpan pada Logger

export function WaTextWelcomeAdmin() {
  return `Halo Administrator Bawaslu, Nomor Anda akan dikirim notifikasi jika terdapat Permohonan Informasi Baru. Terimakasih sudah mendaftarkan Nomor Whatsapp pada Aplikasi E-PPID Bawaslu Terintegrasi.
  
Ini adalah pesan otomatis dari sistem.
Ketik OK dan balas jika anda menerima pesan ini.`;
}

export const WaTextPerubahanStatus = (
  tiket_number,
  email,
  status,
  reg_number,
  response
) => {
  return `Salam Awas.
   
Permohonan Informasi yang anda ajukan kepada PPID Bawaslu dengan data :
   
Tiket : ${tiket_number}
Email : ${email}
    
Telah ditanggapi oleh Admin. Status aktif pada Permohonan Informasi tersebut sekarang adalah :
   
${status}

No Registrasi : ${reg_number}
Pesan Admin   : ${response}
   
Atau anda dapat melihat detail permohonan anda pada link berikut :
${process.env.NEXT_PUBLIC_HOST}/cek?email=${email}&ticket=${tiket_number}

Ini adalah pesan otomatis dari sistem.
Ketik OK dan balas jika anda menerima pesan ini.
   
Terimakasih
Bawaslu Terbuka, Pemilu Terpercaya
--PPID Bawaslu`;
};

export const WaTextPermohonanBaruKepadaAdmin = (tiket_number, email) => {
  return `Permohonan Informasi Baru.
  
Hai Bapak/Ibu Admin PPID, Anda menerima 1 (Satu) Permintaan Permohonan Informasi baru dari :
  
Email       : ${email}
Nomor Tiket : ${tiket_number}

Silakan Login Website PPID bawaslu kemudian pilih Menu Permohonan Informasi - Online Untuk Melihat Rincian Permohonan Informasi.

Ini adalah pesan otomatis dari sistem.
Ketik OK dan balas jika anda menerima pesan ini.`;
};

export const WaTextPermohonanBaruKepadaPemohon = (tiket_number, email) => {
  return `Salam Awas.

Permohonan informasi Anda telah kami terima. Terima kasih telah menyampaikan permohonan informasi ke PPID Bawaslu.
Setelah diregistrasi, kami akan mengirimkan pemberitahuan tertulis dalam jangka waktu sesuai PERKI 1 2021.
Anda dapat melakukan pengecekan informasi yang anda lakukan dengan mengunjungi halaman Cek Pemohonan di Website PPID dan mengisi form dengan data sebagai berikut :

Tiket : ${tiket_number}
Email : ${email}
    
Atau anda dapat melihat detail permohonan anda pada link berikut :
${process.env.NEXT_PUBLIC_HOST}/cek?email=${email}&ticket=${tiket_number}

Ini adalah pesan otomatis dari sistem.
Ketik OK dan balas jika anda menerima pesan ini.`;
};

export const WaTextKeberatanKepadaAdmin = (
  reg_number,
  email = "Tidak Diketahui",
  tiket = "Tidak Diketahui"
) => {
  return `Pengajuan Keberatan.

Hai Admin PPID, Ada Pengajuan Keberatan dari Nomor Registrasi ${reg_number} / ${tiket} dengan email ${email}.
Silakan Buka Website ppid bawaslu dan Login Sebagai Dengan Data Yang Sudah Diberikan Untuk Melihat Rincian Pengajuan Keberatan.

Ini adalah pesan otomatis dari sistem.
Ketik OK dan balas jika anda menerima pesan ini.`;
};

export const WaTextKeberatanKepadaPemohon = (
  reg_number,
  tiket = "Tidak Diketahui"
) => {
  return `Salam Awas.

Pengajuan Keberatan Anda telah kami terima.
Pengajuan Keberatan yang anda ajukan akan segera kami tindak lanjut.
PPID Bawaslu akan segera menghubungi melalui Nomor Telp atau Email sesuai data Permohonan dengan Nomor Registrasi ${reg_number} / ${tiket}.

Ini adalah pesan otomatis dari sistem.
Ketik OK dan balas jika anda menerima pesan ini.`;
};

function requireWhatsapp(require, messageError) {
  if (require) throw new Error(messageError);
  return false;
}

export async function prepareAndSendMessage(
  require = false,
  confirmKirim = true,
  receiver,
  msg,
  delayMs = 1000
) {
  try {
    if (!receiver) return requireWhatsapp(require, "Nomor Tidak Terdeteksi");
    if (!msg) return requireWhatsapp(require, "Pesan Tidak Boleh Kosong");
    if (!confirmKirim) return true;

    const cekIsSessionExists = isSessionExists();
    if (!cekIsSessionExists)
      return requireWhatsapp(require, "Whatsapp Tidak Dapat Digunakan");

    const cekGetSession = getSession();
    const formatedPhone = formatPhone(receiver);
    const cekIsExists = await cekGetSession.onWhatsApp(formatedPhone);

    if (!cekIsExists)
      return requireWhatsapp(require, "Nomor Tidak Terdaftar Whatsapp");

    await delay(parseInt(delayMs));
    return await cekGetSession.sendMessage(formatedPhone, { text: msg });
  } catch (error) {
    getLogger.error(error);
    requireWhatsapp(require, error);
  }
}
