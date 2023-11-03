import db from "libs/db";
import Handler from "middlewares/Handler";
import { conditionWillSpesific, buatTiketByAdmin } from "middlewares/Condition";
import getLogger from "middlewares/getLogger";

export default Handler()
  .get(async (req, res) => {
    try {
      const result = await db
        .select(
          "permohonan.*",
          "pemohon.*",
          "bawaslu.nama_bawaslu",
          "bawaslu.level_bawaslu",
          "provinsi.provinsi"
        )
        .from("permohonan")
        .innerJoin("bawaslu", "permohonan.bawaslu_id", "bawaslu.id")
        .innerJoin(
          "pemohon",
          "pemohon.email_pemohon",
          "permohonan.email_pemohon"
        )
        .leftJoin("provinsi", "provinsi.id", "bawaslu.provinsi_id")
        .modify((builder) =>
          conditionWillSpesific(db, builder, req.session.user, "permohonan")
        )
        .whereNull("permohonan.deleted_at")
        .orderBy("permohonan.created_at", "desc");

      res.json(result);
    } catch (error) {
      getLogger.error(error);
      res.status(500).json({ message: "Terjadi Kesalahan..." });
    }
  })
  .post(async (req, res) => {
    try {
      const { level, bawaslu_id } = req.session.user;
      const {
        no_registrasi,
        tanggal_permohonan,
        platform,
        nama_pemohon,
        pekerjaan_pemohon,
        pendidikan_pemohon,
        telp_pemohon,
        email_pemohon,
        alamat_pemohon,
        rincian,
        tujuan,
        cara_dapat,
        cara_terima,
        status_permohonan,
        jenis_respon,
        // finall
        jangka_waktu,
        // diberikan / sebagian
        bentuk_fisik,
        ket_biaya,
        // sebagian
        penjelasan_penghitaman,
        // tidak dapat diberikan
        penguasaan_informasi,
        penguasaan_informasi_lain,
        dasar_pengecualian,
        pada_pasal,
        ket_konsekuensi,
      } = req.body;
      const tiket = buatTiketByAdmin(6, level, bawaslu_id);
      const badan_publik =
        penguasaan_informasi === "Bawaslu"
          ? penguasaan_informasi
          : penguasaan_informasi_lain;

      // cek reg number sama
      const cek = await db("permohonan")
        .where("no_registrasi", no_registrasi)
        .first();
      // Jika ada yang sama
      if (cek)
        return res.status(400).json({
          message:
            "Nomor Registrasi yang anda masukan sudah terdaftar dalam sistem, silakan masukan nomor register pengganti",
        });

      // proses manajemen data pemohon
      const cekDataPemohon = await db("pemohon")
        .where({ email_pemohon: email_pemohon })
        .first();
      if (cekDataPemohon) {
        // proses update
        const update = await db("pemohon")
          .where({ email_pemohon: email_pemohon })
          .update({
            nama_pemohon,
            telp_pemohon,
            pekerjaan_pemohon,
            pendidikan_pemohon,
            alamat_pemohon,
          });

        // failed
        if (!update)
          return res.status(400).json({
            message: "Gagal Proses Input Pemohon",
          });
      } else {
        // proses simpan
        const simpan = await db("pemohon").insert({
          email_pemohon,
          nama_pemohon,
          telp_pemohon,
          pendidikan_pemohon,
          pekerjaan_pemohon,
          alamat_pemohon,
        });

        // failed
        if (!simpan)
          return res.status(400).json({
            message: "Gagal Menyimpan Data Pemohon",
          });
      }

      // proses simpan permohonan
      const dataForInsertPermohonan = {
        bawaslu_id,
        email_pemohon,
        tiket,
        no_registrasi,
        tanggal_permohonan,
        platform,
        rincian,
        tujuan,
        cara_terima,
        cara_dapat,
        status_permohonan,
      };
      const prosesInsertPermohonan = await db("permohonan").insert(
        dataForInsertPermohonan
      );

      // failed
      if (!prosesInsertPermohonan)
        return res.status(400).json({
          message: "Gagal Memasukan Data",
        });

      // proses simpan Respon
      const dataForInsertRespon = {
        permohonan_id: prosesInsertPermohonan,
        jenis_respon,
        tanggal_respon: tanggal_permohonan,
        penguasaan_informasi:
          status_permohonan === "Tidak Dapat Diberikan" ? badan_publik : "",
        bentuk_fisik:
          status_permohonan === "Tidak Dapat Diberikan" ? "" : bentuk_fisik,
        ket_biaya:
          status_permohonan === "Tidak Dapat Diberikan" ? "" : ket_biaya,
        penjelasan_penghitaman:
          status_permohonan === "Diberikan Sebagian"
            ? penjelasan_penghitaman
            : "",
        jangka_waktu,
        mailed: false,
      };
      const prosesInsertRespon = await db("permohonan_respon").insert(
        dataForInsertRespon
      );

      // failed
      if (!prosesInsertRespon) {
        await db("permohonan").where("id", prosesInsertPermohonan).del();
        return res.status(400).json({ message: "Gagal Menginput Response" });
      }

      // cek apakah Tidak Dapat Diberikan, kalau iya insert ke tabel penolakan
      if (status_permohonan === "Tidak Dapat Diberikan") {
        const insertTolak = await db("permohonan_respon_tolak").insert({
          respon_id: prosesInsertRespon,
          tanggal_ditolak: tanggal_permohonan,
          dasar_pengecualian,
          pada_pasal,
          ket_konsekuensi,
        });

        // failed
        if (!insertTolak) {
          await db("permohonan_respon").where("id", prosesInsertRespon).del();
          return res
            .status(400)
            .json({ message: "Gagal Menginput Response Penolakan" });
        }
      }

      // success
      res.json({ message: "Berhasil Menginput Data", type: "success" });
    } catch (error) {
      getLogger.error(error);
      res.status(500).json({ message: "Terjadi Kesalahan..." });
    }
  })
  .delete(async (req, res) => {
    try {
      const arrID = req.body;
      const proses = await db("permohonan")
        .whereIn("id", arrID)
        .update("deleted_at", db.fn.now());

      if (!proses) return res.status(400).json({ message: "Gagal Hapus" });

      res.json({ message: "Memindahkan Ke Sampah", type: "success" });
    } catch (error) {
      getLogger.error(error);
      res.status(500).json({ message: "Terjadi Kesalahan..." });
    }
  });
