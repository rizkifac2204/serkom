import db from "libs/db";
import Handler from "middlewares/Handler";
import getLogger from "middlewares/getLogger";

export default Handler()
  .get(async (req, res) => {
    try {
      const result = await db("divisi").orderBy("nama_divisi", "desc");
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
      const { nama_divisi } = req.body;

      const cek = await db
        .select("nama_divisi")
        .from("divisi")
        .where("nama_divisi", nama_divisi)
        .first();

      if (cek)
        return res.status(400).json({
          message: "Nama Divisi Sudah Terdaftar",
        });

      const simpan = await db("divisi").insert({
        nama_divisi,
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
  // delete one by one
  .delete(async (req, res) => {
    if (req.session.user.level !== 1)
      return res.status(401).json({
        message: "Anda Tidak Diizinkan Melakukan Aksi ini",
      });
    const { id } = req.body;

    try {
      const proses = await db("divisi").where("id", id).del();
      if (!proses) return res.status(400).json({ message: "Gagal Hapus" });
      res.json({ message: "Berhasil Hapus", type: "success" });
    } catch (error) {
      getLogger.error(error);
      return res.status(400).json({
        message: "Gagal Proses, Data DIP terdeteksi",
      });
    }
  })
  // delete selected
  .put(async (req, res) => {
    if (req.session.user.level !== 1)
      return res.status(401).json({
        message: "Anda Tidak Diizinkan Melakukan Aksi ini",
      });
    const { data } = req.body;

    try {
      const proses = await db("divisi").whereIn("id", data).del();
      if (!proses) return res.status(400).json({ message: "Gagal Hapus" });
      res.json({ message: "Berhasil Hapus", type: "success" });
    } catch (error) {
      getLogger.error(error);
      return res.status(400).json({
        message: "Gagal Proses, Data DIP terdeteksi",
      });
    }
  });
