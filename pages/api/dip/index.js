import db from "libs/db";
import Handler from "middlewares/Handler";
import { conditionWillSpesific } from "middlewares/Condition";
import getLogger from "middlewares/getLogger";
import { DeleteUpload } from "services/UploadService";

export default Handler()
  .get(async (req, res) => {
    try {
      const result = await db
        .select("dip.*", "bawaslu.nama_bawaslu", "divisi.nama_divisi")
        .from("dip")
        .leftJoin("bawaslu", "bawaslu.id", "dip.bawaslu_id")
        .leftJoin("divisi", "divisi.id", "dip.divisi_id")
        .modify((builder) =>
          conditionWillSpesific(db, builder, req.session.user, "dip")
        )
        .orderBy("dip.created_at", "desc");

      res.json(result);
    } catch (error) {
      getLogger.error(error);
      res.status(500).json({ message: "Terjadi Kesalahan..." });
    }
  })
  .delete(async (req, res) => {
    try {
      const arrID = req.body;

      // get detail untuk ambil nama file
      const cek = await db
        .select("file", "bawaslu_id")
        .from("dip")
        .whereIn("id", arrID);

      const proses = await db("dip").whereIn("id", arrID).del();

      if (!proses) return res.status(400).json({ message: "Gagal Hapus" });

      if (cek.length !== 0) {
        cek.map((item) => {
          DeleteUpload(`./public/dip/${item.bawaslu_id}`, item.file);
        });
      }

      res.json({ message: "Sukses Menghapus Data Terpilih", type: "success" });
    } catch (error) {
      getLogger.error(error);
      res.status(500).json({ message: "Terjadi Kesalahan..." });
    }
  });
