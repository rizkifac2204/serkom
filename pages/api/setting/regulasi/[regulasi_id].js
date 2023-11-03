import db from "libs/db";
import Handler from "middlewares/Handler";
import { DeleteUpload } from "services/UploadService";
import getLogger from "middlewares/getLogger";

export default Handler()
  .get(async (req, res) => {
    try {
      const { regulasi_id } = req.query;
      const result = await db
        .select(`regulasi.*`, `regulasi_kategori.kategori`)
        .from("regulasi")
        .innerJoin(
          "regulasi_kategori",
          "regulasi.kategori_id",
          "regulasi_kategori.id"
        )
        .where("regulasi.id", regulasi_id);
      res.json(result);
    } catch (error) {
      getLogger.error(error);
      res.status(500).json({ message: "Terjadi Kesalahan..." });
    }
  })
  .delete(async (req, res) => {
    if (req.session.user.level !== 1)
      return res.status(401).json({
        message: "Anda Tidak Diizinkan Melakukan Aksi ini",
      });
    const { regulasi_id } = req.query;

    try {
      const cek = await db
        .select("berkas")
        .from("regulasi")
        .where("id", regulasi_id)
        .first();

      const proses = await db("regulasi").where("id", regulasi_id).del();

      if (!proses) return res.status(400).json({ message: "Gagal Hapus" });

      DeleteUpload("./public/regulasi", cek.berkas);

      res.json({ message: "Berhasil Hapus", type: "success" });
    } catch (error) {
      getLogger.error(error);
      return res.status(400).json({
        message: "Gagal Proses, Kesalahan Sistem",
      });
    }
  });
