import db from "libs/db";
import PublicHandler from "middlewares/PublicHandler";
import getLogger from "middlewares/getLogger";

export default PublicHandler().get(async (req, res) => {
  const table = req.query.slug[0];
  const id = req.query.slug[1];

  // cek kembali
  if (!["keberatan", "permohonan"].includes(table))
    return res.status(403).json({ message: "Terjadi Kesalahan" });

  try {
    if (table === "permohonan") {
      // ambil data permohonan
      const result = await db
        .select("permohonan.*", "pemohon.*", "bawaslu.nama_bawaslu")
        .from("permohonan")
        .innerJoin("bawaslu", "permohonan.bawaslu_id", "bawaslu.id")
        .innerJoin(
          "pemohon",
          "pemohon.email_pemohon",
          "permohonan.email_pemohon"
        )
        .whereNull("permohonan.deleted_at")
        .where("permohonan.no_registrasi", id)
        .orWhere("permohonan.tiket", id)
        .first();

      if (!result) return res.status(404).json({ message: "Tidak Ditemukan" });
      result.from = "Permohonan";
      res.json(result);
    } else {
      // ambil data keberatan
      const result = await db
        .select(
          "permohonan_keberatan.id",
          "permohonan_keberatan.kasus_posisi",
          "permohonan_keberatan.created_at",
          "permohonan_keberatan.tanggal_keberatan",
          "permohonan_keberatan.alasan_a",
          "permohonan_keberatan.alasan_b",
          "permohonan_keberatan.alasan_c",
          "permohonan_keberatan.alasan_d",
          "permohonan_keberatan.alasan_e",
          "permohonan_keberatan.alasan_f",
          "permohonan_keberatan.alasan_g",
          "permohonan.tiket",
          "permohonan.no_registrasi",
          "permohonan.bawaslu_id",
          "permohonan.rincian",
          "permohonan.tujuan",
          "permohonan.cara_terima",
          "permohonan.cara_dapat",
          "pemohon.nama_pemohon",
          "pemohon.pekerjaan_pemohon",
          "pemohon.telp_pemohon",
          "pemohon.email_pemohon",
          "pemohon.alamat_pemohon",
          "pemohon.identitas_pemohon"
        )
        .from("permohonan_keberatan")
        .innerJoin(
          "permohonan",
          "permohonan.id",
          "permohonan_keberatan.permohonan_id"
        )
        .innerJoin(
          "pemohon",
          "pemohon.email_pemohon",
          "permohonan.email_pemohon"
        )
        .whereNull("permohonan.deleted_at")
        .where("permohonan.no_registrasi", id)
        .orWhere("permohonan.tiket", id)
        .first();

      if (!result) return res.status(404).json({ message: "Tidak Ditemukan" });
      result.from = "Keberatan";
      res.json(result);
    }
  } catch (error) {
    getLogger.error(error);
    return res.status(404).json({ message: "Terjadi Kesalahan" });
  }
});
