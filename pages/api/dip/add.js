import db from "libs/db";
import Handler from "middlewares/Handler";
import getLogger from "middlewares/getLogger";
import { Upload, DeleteUpload } from "services/UploadService";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default Handler()
  .post(Upload().single("file"), async (req, res) => {
    try {
      const { bawaslu_id } = req.session.user;
      const {
        sifat,
        jenis_informasi,
        ringkasan,
        tahun_pembuatan,
        penanggung_jawab,
        bentuk_informasi,
        link,
      } = req.body;

      if (!req.file && !link)
        return res.status(400).json({
          message: "Sisipkan link atau upload",
          type: "error",
        });

      const filename = req.file ? req.file.filename : null;

      const dataForInsert = {
        bawaslu_id,
        sifat,
        jenis_informasi,
        ringkasan,
        tahun_pembuatan,
        penanggung_jawab,
        bentuk_informasi,
        file: filename,
        link: link,
      };

      // proses simpan
      const proses = await db("dip").insert(dataForInsert);

      // failed
      if (!proses) {
        if (req.file) DeleteUpload(req.file.destination, req.file);
        return res.status(400).json({
          message: "Gagal Memasukan Data",
        });
      }

      // success
      res.json({ message: "Berhasil Menginput Data", type: "success" });
    } catch (error) {
      getLogger.error(error);
      res.status(500).json({ message: "Terjadi Kesalahan..." });
    }
  })
  .put(Upload().single("file"), async (req, res) => {
    try {
      const {
        id,
        bawaslu_id,
        sifat,
        jenis_informasi,
        ringkasan,
        tahun_pembuatan,
        penanggung_jawab,
        bentuk_informasi,
        nama_file,
        ganti_file,
        link,
      } = req.body;

      if (!req.file && !nama_file && !link)
        return res.status(400).json({
          message: "Sisipkan link atau upload",
          type: "error",
        });

      const filename = req.file
        ? req.file.filename
        : nama_file === "null"
        ? null
        : nama_file;

      const dataForEdit = {
        sifat,
        jenis_informasi,
        ringkasan,
        tahun_pembuatan,
        penanggung_jawab,
        bentuk_informasi,
        file: filename,
        link: link,
      };

      const proses = await db("dip").where("id", id).update(dataForEdit);

      // failed
      if (!proses) {
        if (req.file) DeleteUpload(req.file.destination, req.file);
        return res.status(400).json({
          message: "Gagal Memasukan Data",
        });
      }

      // success
      if (proses) {
        if (ganti_file == "true")
          DeleteUpload(`./public/dip/${bawaslu_id}`, nama_file);
      }

      res.json({ message: "Berhasil Edit Data", type: "success" });
    } catch (error) {
      getLogger.error(error);
      res.status(500).json({ message: "Terjadi Kesalahan..." });
    }
  });
