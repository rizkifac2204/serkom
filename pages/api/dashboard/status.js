import db from "libs/db";
import Handler from "middlewares/Handler";
import { conditionWillSpesific } from "middlewares/Condition";
import getLogger from "middlewares/getLogger";

export default Handler().get(async (req, res) => {
  try {
    const result = await db
      .from("permohonan")
      .whereNull("permohonan.deleted_at")
      .modify((builder) =>
        conditionWillSpesific(db, builder, req.session.user, "permohonan")
      )
      .select("status_permohonan")
      .count({ jumlah: "id" })
      .groupBy("status_permohonan");
    res.json({
      message: "Success",
      result,
    });
  } catch (error) {
    getLogger.error(error);
    res.status(500).json({ message: "Terjadi Kesalahan..." });
  }
});
