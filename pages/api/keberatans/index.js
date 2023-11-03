import db from "libs/db";
import Handler from "middlewares/Handler";
import { conditionWillSpesific } from "middlewares/Condition";
import getLogger from "middlewares/getLogger";

export default Handler()
  .get(async (req, res) => {
    try {
      const result = await db
        .select(
          "permohonan_keberatan.id",
          "permohonan_keberatan.kasus_posisi",
          "permohonan_keberatan.created_at",
          "permohonan.tiket",
          "permohonan.no_registrasi"
        )
        .from("permohonan_keberatan")
        .innerJoin(
          "permohonan",
          "permohonan.id",
          "permohonan_keberatan.permohonan_id"
        )
        .modify((builder) =>
          conditionWillSpesific(db, builder, req.session.user, "permohonan")
        )
        .whereNull("permohonan.deleted_at");

      res.json(result);
    } catch (error) {
      getLogger.error(error);
      res.status(500).json({ message: "Terjadi Kesalahan..." });
    }
  })
  .delete(async (req, res) => {
    try {
      const arrID = req.body;
      const proses = await db("permohonan_keberatan")
        .whereIn("id", arrID)
        .del();

      if (!proses) return res.status(400).json({ message: "Gagal Hapus" });

      res.json({ message: "Berhasil Hapus", type: "success" });
    } catch (error) {
      getLogger.error(error);
      res.status(500).json({ message: "Terjadi Kesalahan..." });
    }
  });
