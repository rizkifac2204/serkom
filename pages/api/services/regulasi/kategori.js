import db from "libs/db";
import PublicHandler from "middlewares/PublicHandler";

export default PublicHandler().get(async (req, res) => {
  const result = await db
    .select(`regulasi_kategori.*`)
    .from("regulasi_kategori")
    .orderBy("regulasi_kategori.id", "desc");
  res.json({
    count: result.length,
    result: result,
  });
});
