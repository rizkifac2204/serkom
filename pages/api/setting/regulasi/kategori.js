import db from "libs/db";
import Handler from "middlewares/Handler";
import getLogger from "middlewares/getLogger";

export default Handler()
  .get(async (req, res) => {
    try {
      const result = await db
        .select(`regulasi_kategori.*`)
        .from("regulasi_kategori")
        .orderBy("regulasi_kategori.id", "desc");
      res.json(result);
    } catch (error) {
      getLogger.error(error);
      res.status(500).json({ message: "Terjadi Kesalahan..." });
    }
  })
  .post(async (req, res) => {
    try {
      if (req.session.user.level !== 1)
        return res.status(401).json({
          message: "Anda Tidak Diizinkan Melakukan Aksi ini",
        });
      const { kategori } = req.body;

      const cek = await db
        .select("kategori")
        .from("regulasi_kategori")
        .where("kategori", kategori)
        .first();

      if (cek)
        return res.status(400).json({
          message: "Nama Kategori Sudah Terdaftar",
        });

      const simpan = await db("regulasi_kategori").insert({
        kategori,
      });

      // failed
      if (!simpan)
        return res.status(400).json({
          message: "Gagal Menyimpan Data",
        });

      // success
      res.json({ message: "Berhasil Menyimpan Data", type: "success" });
    } catch (error) {
      getLogger.error(error);
      res.status(500).json({ message: "Terjadi Kesalahan..." });
    }
  })
  .delete(async (req, res) => {
    try {
      if (req.session.user.level !== 1)
        return res.status(401).json({
          message: "Anda Tidak Diizinkan Melakukan Aksi ini",
        });
      const { id } = req.body;
      const proses = await db("regulasi_kategori").where("id", id).del();
      if (!proses) return res.status(400).json({ message: "Gagal Hapus" });
      res.json({ message: "Berhasil Hapus", type: "success" });
    } catch (error) {
      getLogger.error(error);
      res.status(500).json({ message: "Terjadi Kesalahan..." });
    }
  });
