import db from "libs/db";
import Handler from "middlewares/Handler";
import { DeleteUpload } from "services/UploadService";
import getLogger from "middlewares/getLogger";

export default Handler()
  .get(async (req, res) => {
    try {
      const result = await db
        .select(`regulasi.*`, `regulasi_kategori.kategori`)
        .from("regulasi")
        .innerJoin(
          "regulasi_kategori",
          "regulasi.kategori_id",
          "regulasi_kategori.id"
        )
        .orderBy("regulasi.kategori_id", "asc")
        .orderBy("regulasi.nomor", "asc");
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
    const arrID = req.body;

    try {
      const cek = await db
        .select("berkas")
        .from("regulasi")
        .whereIn("id", arrID);
      const files = cek.map((v) => {
        return v.berkas;
      });

      const proses = await db("regulasi").whereIn("id", arrID).del();

      if (!proses) return res.status(400).json({ message: "Gagal Hapus" });

      DeleteUpload("./public/regulasi", files);

      res.json({
        message: "Berhasil Menghapus Data Terpilih",
        type: "success",
      });
    } catch (error) {
      getLogger.error(error);
      return res.status(400).json({ message: "Terjadi Kesalahan Sistem" });
    }
  });
