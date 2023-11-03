import db from "libs/db";
import PublicHandler from "middlewares/PublicHandler";

export default PublicHandler().get(async (req, res) => {
  const { provinsi_id, provinsi, kabkota_id, kabkota } = req.query;
  const data = await db
    .select("bawaslu.*", "provinsi.provinsi", "kabkota.kabkota")
    .from("bawaslu")
    .leftJoin("provinsi", "provinsi.id", "bawaslu.id")
    .leftJoin("kabkota", "kabkota.id", "bawaslu.id")
    .where((builder) => {
      builder.where(true);
      if (provinsi_id)
        builder.andWhere("bawaslu.provinsi_id", "=", provinsi_id);
      if (kabkota_id) builder.andWhere("bawaslu.id", "=", kabkota_id);
      if (provinsi)
        builder.andWhere("provinsi.provinsi", "like", `%${provinsi}%`);
      if (kabkota) builder.andWhere("kabkota.kabkota", "like", `%${kabkota}%`);
    })
    .orderBy("bawaslu.id", "asc");

  if (data.length === 0)
    return res.status(200).json({
      count: 0,
      result: [],
    });

  res.json({
    count: data.length,
    result: data,
  });
});
