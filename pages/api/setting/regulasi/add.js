import db from "libs/db";
import Handler from "middlewares/Handler";
import { Upload, DeleteUpload } from "services/UploadService";
import getLogger from "middlewares/getLogger";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default Handler().post(Upload().single("file"), async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({
        message: "Terjadi Kesalahan, File Upload Tidak Ditemukan",
        type: "error",
      });

    const { filename } = req.file;
    const { kategori_id, nomor, judul, tentang } = req.body;

    // hanya admin yang boleh input
    if (req.session.user.level !== 1) {
      DeleteUpload("./public/regulasi", filename);
      return res.status(401).json({
        message: "Anda Tidak Diizinkan Melakukan Aksi ini",
      });
    }

    const dataForInsert = {
      kategori_id,
      nomor,
      judul,
      tentang,
      berkas: filename,
    };

    const cek = await db
      .select("*")
      .from("regulasi")
      .where("kategori_id", kategori_id)
      .andWhere("nomor", nomor);
    if (cek.length !== 0) {
      DeleteUpload("./public/regulasi", filename);
      return res.status(400).json({
        message: `Nomor ${nomor} pada kategori tersebut sudah terdata`,
      });
    }

    const proses = await db("regulasi").insert(dataForInsert);

    // failed
    if (!proses) {
      DeleteUpload("./public/regulasi", filename);
      return res.status(400).json({ message: "Gagal memproses data" });
    }

    res.json({ file: filename, message: "Berhasil menyimpan data Regulasi" });
  } catch (error) {
    getLogger.error(error);
    res.status(500).json({ message: "Terjadi Kesalahan..." });
  }
});
