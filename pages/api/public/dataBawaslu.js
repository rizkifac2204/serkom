import db from "libs/db";
import PublicHandler from "middlewares/PublicHandler";
import getLogger from "middlewares/getLogger";

export default PublicHandler().get(async (req, res) => {
  try {
    const data = await db
      .select("bawaslu.*", "provinsi.provinsi", "kabkota.kabkota")
      .from("bawaslu")
      .leftJoin("provinsi", "provinsi.id", "bawaslu.id")
      .leftJoin("kabkota", "kabkota.id", "bawaslu.id")
      .orderBy("bawaslu.id", "asc");

    if (!data) return res.status(404).json({ message: "Terjadi Kesalahan" });

    res.json(data);
  } catch (error) {
    getLogger.error(error);
    res.status(500).json({ message: "Terjadi Kesalahan..." });
  }
});
