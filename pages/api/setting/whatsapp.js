import Handler from "middlewares/Handler";
import getLogger from "middlewares/getLogger";
import {
  init,
  isSessionExists,
  getSession,
  formatPhone,
  isExists,
  sendMessage,
  deleteSession,
} from "libs/whatsapp";
const { Server } = require("socket.io");

const onConnection = (socket) => {
  socket.emit("statusWA", {
    status: "Check",
    message: `Memeriksa Status`,
  });
  init(socket);
};

export default Handler()
  .get(async (req, res) => {
    try {
      if (res.socket.server.io) {
        console.log("Socked Already Connected");
      } else {
        console.log("initializing...");
        const io = new Server(res.socket.server);
        res.socket.server.io = io;

        io.on("connection", onConnection);
      }

      return res.json({ message: "setting up", type: "info" });
    } catch (err) {
      getLogger.error(err);
      return res
        .status(400)
        .json({ message: "Terjadi Kesalahan Sistem", type: "error" });
    }
  })
  .post(async (req, res) => {
    try {
      let { number, message } = req.body;

      if (!number)
        return res.status(400).json({
          status: true,
          type: "error",
          message: "Nomor HP Tidak Terdeteksi",
        });

      if (!message)
        return res.status(400).json({
          status: true,
          type: "error",
          message: "Pesan Tidak Boleh Kosong",
        });

      const isWa = isSessionExists();
      const session = getSession();
      const formated = formatPhone(number);
      const exists = await isExists(session, formated);

      if (!number && !message)
        return res.status(400).json({
          message: `Mohon isi nomor dan pesan`,
          type: "error",
        });

      if (!isWa)
        return res.status(400).json({
          status: true,
          type: "error",
          message: "Whatsapp Tidak Dapat Digunakan",
        });

      if (!exists)
        return res.status(400).json({
          status: true,
          type: "error",
          message: "Nomor HP Tidak Tedaftar Whatsapp",
        });

      const sending = await sendMessage(session, formated, message, 0);

      if (sending) {
        return res.json({
          status: true,
          type: "success",
          message: "Mengirim Pesan Whatsapp",
        });
      } else {
        return res.json({
          status: true,
          type: "error",
          message: "Gagal Mengirim Pesan Whatsapp",
        });
      }
    } catch (err) {
      getLogger.error(err);
      console.log(err);
      return res
        .status(400)
        .json({ message: "Terjadi Kesalahan Sistem", type: "error" });
    }
  })
  .delete(async (req, res) => {
    try {
      deleteSession();
      return res.json({
        type: "success",
        message:
          "Berhasil Logout, Silakan Refresh Halaman Untuk Menerima QRCode Kembali",
      });
    } catch (err) {
      // getLogger.error(err);
      console.log(err);
      return res
        .status(400)
        .json({ message: "Terjadi Kesalahan Sistem", type: "error" });
    }
  });
