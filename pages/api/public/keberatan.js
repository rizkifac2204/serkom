import db from "libs/db";
import PublicHandler from "middlewares/PublicHandler";
import { buatCurTime, noWaAdmin } from "middlewares/PublicCondition";
import getLogger from "middlewares/getLogger";

export default PublicHandler()
  .get(async (req, res) => {
    try {
      const { nomor } = req.query;

      const data = await db
        .select(
          "permohonan.*",
          "bawaslu.nama_bawaslu",
          "bawaslu.email_bawaslu",
          "bawaslu.telp_bawaslu",
          "bawaslu.alamat_bawaslu",
          "bawaslu.kota_bawaslu",
          "pemohon.nama_pemohon",
          "pemohon.alamat_pemohon",
          "pemohon.pekerjaan_pemohon",
          "pemohon.telp_pemohon"
        )
        .from("permohonan")
        .innerJoin(
          "pemohon",
          "pemohon.email_pemohon",
          "permohonan.email_pemohon"
        )
        .leftJoin("bawaslu", "bawaslu.id", "permohonan.bawaslu_id")
        .where("permohonan.no_registrasi", nomor)
        .orWhere("permohonan.tiket", nomor)
        .whereNull("permohonan.deleted_at")
        .first();

      if (!data) return res.status(404).json({ message: "Tidak Ditemukan" });

      const getWhatsappAdmin = await db("admin")
        .select("telp_admin")
        .where("bawaslu_id", data.bawaslu_id)
        .first();
      const whatsappTujuanAdmin = noWaAdmin(
        data.bawaslu_id === 0
          ? "Bawaslu Republik Indonesia"
          : data.nama_bawaslu,
        getWhatsappAdmin.telp_admin
      );

      data.telp_admin = whatsappTujuanAdmin;

      res.json(data);
    } catch (error) {
      getLogger.error(error);
      res.status(500).json({ message: "Terjadi Kesalahan..." });
    }
  })
  .post(async (req, res) => {
    // proses simpan
    try {
      const {
        id,
        no_registrasi,
        tiket,
        email_pemohon,
        email_bawaslu,
        nama_bawaslu,
        alasan_a,
        alasan_b,
        alasan_c,
        alasan_d,
        alasan_e,
        alasan_f,
        alasan_g,
        kasus_posisi,
        telp_admin,
        telp_pemohon,
      } = req.body;
      const curtime = buatCurTime();

      const dataForInsert = {
        permohonan_id: id,
        alasan_a: alasan_a ? 1 : 0,
        alasan_b: alasan_b ? 1 : 0,
        alasan_c: alasan_c ? 1 : 0,
        alasan_d: alasan_d ? 1 : 0,
        alasan_e: alasan_e ? 1 : 0,
        alasan_f: alasan_f ? 1 : 0,
        alasan_g: alasan_g ? 1 : 0,
        kasus_posisi,
        tanggal_keberatan: curtime,
      };

      const proses = await db("permohonan_keberatan").insert(dataForInsert);

      // failed
      if (!proses) {
        return res.status(400).json({
          message: "Gagal Mengajukan Keberatan",
        });
      }

      // success
      res.json({
        message: "Berhasil Mengajukan Keberatan",
        currentData: dataForInsert,
        type: "success",
      });
    } catch (error) {
      getLogger.error(error);
      return res.status(400).json({
        message: "Gagal Mengajukan Keberatan",
      });
    }
  });
