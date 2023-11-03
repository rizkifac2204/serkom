import db from "libs/db";
import PublicHandler from "middlewares/PublicHandler";

export default PublicHandler().get(async (req, res) => {
  const {
    bawaslu,
    bawaslu_id,
    sifat,
    jenis,
    ringkasan,
    tahun,
    no_sk,
    penanggung_jawab,
    bentuk,
  } = req.query;

  const data = await db
    .select("dip.*", "bawaslu.nama_bawaslu")
    .from("dip")
    .leftJoin("bawaslu", "bawaslu.id", "dip.bawaslu_id")
    .where((builder) => {
      builder.where(true);
      if (bawaslu_id) builder.andWhere("dip.bawaslu_id", "=", bawaslu_id);
      if (sifat) builder.andWhere("dip.sifat", "like", `%${sifat}%`);
      if (jenis) builder.andWhere("dip.jenis_informasi", "like", `%${jenis}%`);
      if (ringkasan)
        builder.andWhere("dip.ringkasan", "like", `%${ringkasan}%`);
      if (tahun) builder.andWhere("dip.tahun_pembuatan", "like", `%${tahun}%`);
      if (no_sk) builder.andWhere("dip.no_sk", "like", `%${no_sk}%`);
      if (penanggung_jawab)
        builder.andWhere(
          "dip.penanggung_jawab",
          "like",
          `%${penanggung_jawab}%`
        );
      if (bentuk)
        builder.andWhere("dip.bentuk_informasi", "like", `%${bentuk}%`);
      if (bawaslu)
        builder.andWhere("bawaslu.nama_bawaslu", "like", `%${bawaslu}%`);
    })
    .orderBy("dip.sifat", "desc");

  if (data.length === 0)
    return res.status(200).json({
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
    count: result.length,
    result: result,
  });
});
