import db from "libs/db";
import Handler from "middlewares/Handler";
import { conditionWillSpesific } from "middlewares/Condition";
import getLogger from "middlewares/getLogger";

export default Handler().get(async (req, res) => {
  try {
    const result = await db
      .from("permohonan")
      .count("permohonan.id", { as: "jumlah" })
      .select("bawaslu.nama_bawaslu", "permohonan.status_permohonan")
      .leftJoin("bawaslu", "permohonan.bawaslu_id", "bawaslu.id")
      .modify((builder) =>
        conditionWillSpesific(db, builder, req.session.user, "permohonan")
      )
      .whereNull("permohonan.deleted_at")
      .where("status_permohonan", "Proses")
      .groupBy("permohonan.bawaslu_id")
      .orderBy("jumlah", "desc")
      .limit(5);

    // return hasil
    res.json({
      message: "Success",
      result,
    });
  } catch (error) {
    getLogger.error(error);
    res.status(500).json({ message: "Terjadi Kesalahan..." });
  }
});
