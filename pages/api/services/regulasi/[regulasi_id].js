import db from "libs/db";
import PublicHandler from "middlewares/PublicHandler";

export default PublicHandler().get(async (req, res) => {
  const { regulasi_id } = req.query;
  const result = await db
    .select(`regulasi.*`, `regulasi_kategori.kategori`)
    .from("regulasi")
    .innerJoin(
      "regulasi_kategori",
      "regulasi.kategori_id",
      "regulasi_kategori.id"
    )
    .where("regulasi.id", regulasi_id)
    .first();

  if (!result) return res.status(403).json({ message: "Tidak Ditemukan" });

  const domain =
    process.env.NODE_ENV === "development"
      ? "http://localhost:3000"
      : process.env.HOST;

  result.berkas_url = `${domain}/api/services/file/public/regulasi/${result.berkas}`;
  res.json(result);
});
