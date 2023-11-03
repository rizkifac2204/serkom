import db from "libs/db";
import PublicHandler from "middlewares/PublicHandler";

export default PublicHandler().get(async (req, res) => {
  const { dip_id } = req.query;
  const result = await db
    .select(`dip.*`, `bawaslu.nama_bawaslu`)
    .from("dip")
    .leftJoin("bawaslu", "bawaslu.id", "dip.bawaslu_id")
    .where("dip.id", dip_id)
    .first();

  if (!result) return res.status(403).json({ message: "Tidak Ditemukan" });

  const domain =
    process.env.NODE_ENV === "development"
      ? "http://localhost:3000"
      : process.env.HOST;

  result.berkas_url = `${domain}/api/services/file/public/dip/${result.bawaslu_id}/${result.file}`;
  res.json(result);
});
