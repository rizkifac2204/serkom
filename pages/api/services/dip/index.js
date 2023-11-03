import db from "libs/db";
import PublicHandler from "middlewares/PublicHandler";

export default PublicHandler().get(async (req, res) => {
  const { limit, offset } = req.query;
  const total = await db("dip").count("id as total").first();

  const data = await db
    .select("dip.*", "bawaslu.nama_bawaslu")
    .from("dip")
    .leftJoin("bawaslu", "bawaslu.id", "dip.bawaslu_id")
    .orderBy("dip.sifat", "desc")
    .modify((builder) => {
      if (limit) builder.limit(limit);
      if (offset) builder.offset(offset);
    });

  if (data.length === 0)
    return res.status(200).json({
      total: total.total,
      count: 0,
      result: [],
    });

  const domain =
    process.env.NODE_ENV === "development"
      ? "http://localhost:3000"
      : process.env.HOST;

  const result = data.map((v) => ({
    ...v,
    berkas_url: `${domain}/api/services/file/public/dip/${v.bawaslu_id}/${v.file}`,
  }));

  res.json({
    total: total.total,
    count: result.length,
    result: result,
  });
});
