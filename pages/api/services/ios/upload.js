import db from "libs/db";
import PublicHandler from "middlewares/PublicHandler";
import { UploadFromExternal, DeleteUpload } from "services/UploadService";
// const fs = require("fs"); // import * as fs from "fs";
// const path = require("path");
// const sharp = require("sharp");
import getLogger from "middlewares/getLogger";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default PublicHandler()
  .get(async (req, res) => {
    res.json({ message: "available / accepted", type: "success" });
  })
  .post(UploadFromExternal().single("file"), async (req, res) => {
    try {
      // cek if upload
      if (!req.file)
        return res.status(400).json({
          message: "File Identitas Tidak Ditemukan atau Tidak Sesuai",
          type: "error",
        });

      // // kompress belum digunakan
      // if (req.file) {
      //   await sharp(req.file.path)
      //     .resize({ width: 500 })
      //     .jpeg({ quality: 90 })
      //     .toFile(
      //       path.resolve(req.file.destination, `${req.file.filename}`)
      //     );
      //   fs.unlinkSync(req.file.path);
      // }

      // get data
      const { email } = req.body;
      const filename = req.file ? `${req.file.filename}` : null;

      if (!email) {
        DeleteUpload("./public/upload", filename);
        return res.status(400).json({
          message: `Email Tidak Terdeteksi`,
          type: "error",
        });
      }

      // cek data user
      const cekDataPemohon = await db("pemohon")
        .where({ email_pemohon: email })
        .first();

      // if user not found
      if (!cekDataPemohon)
        return res.status(400).json({
          message: `User Dengan Email ${email} Tidak Ditemukan`,
          type: "error",
        });

      // proses update
      const update = await db("pemohon")
        .where({ email_pemohon: email })
        .update({
          identitas_pemohon: filename,
        });

      // jika gagal, hapus file upload dan return response
      if (!update) {
        DeleteUpload("./public/upload", filename);
        return res.status(400).json({
          message: "Gagal Proses",
          type: "error",
        });
      }

      // jika berhasil, hapus file lama
      if (update)
        DeleteUpload("./public/upload", cekDataPemohon.identitas_pemohon);

      res.json({
        message: "Berhasil Upload",
        type: "success",
      });
    } catch (error) {
      getLogger.error(error);
      return res.status(400).json({
        message: "Terjadi Kesalahan Tak Terduga",
        type: "error",
      });
    }
  });
