import db from "libs/db";
import PublicHandler from "middlewares/PublicHandler";

export default PublicHandler().get(async (req, res) => {
  const { limit, offset } = req.query;
  const total = await db("bawaslu").count("id as total").first();

  const data = await db
    .select("bawaslu.*", "provinsi.provinsi", "kabkota.kabkota")
    .from("bawaslu")
    .leftJoin("provinsi", "provinsi.id", "bawaslu.id")
    .leftJoin("kabkota", "kabkota.id", "bawaslu.id")
    .modify((builder) => {
      if (limit) builder.limit(limit);
      if (offset) builder.offset(offset);
    })
    .orderBy("bawaslu.id", "asc");

  if (data.length === 0)
    return res.status(200).json({
      total: total.total,
      count: 0,
      result: [],
    });

  res.json({
    total: total.total,
    count: data.length,
    result: data,
  });
});
