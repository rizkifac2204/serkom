import db from "libs/db";
import PublicHandler from "middlewares/PublicHandler";

export default PublicHandler().get(async (req, res) => {
  const { bawaslu_id } = req.query;
  const result = await db
    .select("bawaslu.*", "provinsi.provinsi", "kabkota.kabkota")
    .from("bawaslu")
    .leftJoin("provinsi", "provinsi.id", "bawaslu.id")
    .leftJoin("kabkota", "kabkota.id", "bawaslu.id")
    .where("bawaslu.id", bawaslu_id)
    .first();

  if (!result) return res.status(403).json({ message: "Tidak Ditemukan" });

  res.json(result);
});
