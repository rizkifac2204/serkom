import db from "libs/db";
import Handler from "middlewares/Handler";
import { conditionWillSpesific } from "middlewares/Condition";
import getLogger from "middlewares/getLogger";
import { DeleteUpload } from "services/UploadService";

export default Handler()
  .get(async (req, res) => {
    try {
      const { id } = req.query;

      const result = await db
        .select("dip.*", "bawaslu.nama_bawaslu", "divisi.nama_divisi")
        .from("dip")
        .leftJoin("bawaslu", "bawaslu.id", "dip.bawaslu_id")
        .leftJoin("divisi", "divisi.id", "dip.divisi_id")
        .modify((builder) =>
          conditionWillSpesific(db, builder, req.session.user, "dip")
        )
        .where("dip.id", id)
        .first();

      if (!result) return res.status(404).json({ message: "Tidak Ditemukan" });

      res.json(result);
    } catch (error) {
      getLogger.error(error);
      res.status(500).json({ message: "Terjadi Kesalahan..." });
    }
  })
  .delete(async (req, res) => {
    try {
      const { id } = req.query;

      // get detail untuk ambil nama file
      const cek = await db
        .select("file", "bawaslu_id")
        .from("dip")
        .where("id", id)
        .first();

      const proses = await db("dip").where("id", id).del();

      if (!proses) return res.status(400).json({ message: "Gagal Hapus" });

      if (cek) DeleteUpload(`./public/dip/${cek.bawaslu_id}`, cek.file);

      res.json({ message: "Berhasil Hapus", type: "success" });
    } catch (error) {
      getLogger.error(error);
      res.status(500).json({ message: "Terjadi Kesalahan..." });
    }
  });
