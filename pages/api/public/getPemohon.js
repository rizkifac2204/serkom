import db from "libs/db";
import PublicHandler from "middlewares/PublicHandler";
import getLogger from "middlewares/getLogger";

export default PublicHandler().post(async (req, res) => {
  try {
    const { email_pemohon } = req.body;

    const data = await db
      .select("*")
      .from("pemohon")
      .where("email_pemohon", email_pemohon)
      .first();

    if (!data) return res.status(404).json({ message: "Tidak Ditemukan" });
    res.json(data);
  } catch (error) {
    getLogger.error(error);
    res.status(500).json({ message: "Terjadi Kesalahan..." });
  }
});
