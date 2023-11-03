import db from "libs/db";
import Handler from "middlewares/Handler";
import sendingMail, { mailOption, TextPerubahanStatus } from "services/Email";
import { prepareAndSendMessage, WaTextPerubahanStatus } from "libs/whatsapp";
import { buatCurTime } from "middlewares/PublicCondition";
import getLogger from "middlewares/getLogger";

export default Handler()
  .get(async (req, res) => {
    try {
      const { id } = req.query;
      const data = await db
        .select(
          `permohonan_respon.*`,
          `permohonan_respon_tolak.id as tolak_id`,
          `permohonan_respon_tolak.tanggal_ditolak`,
          `permohonan_respon_tolak.dasar_pengecualian`,
          `permohonan_respon_tolak.pada_pasal`,
          `permohonan_respon_tolak.ket_konsekuensi`
        )
        .from("permohonan_respon")
        .leftJoin(
          `permohonan_respon_tolak`,
          `permohonan_respon.id`,
          `permohonan_respon_tolak.respon_id`
        )
        .where({ permohonan_id: id });

      res.json(data);
    } catch (error) {
      getLogger.error(error);
      res.status(500).json({ message: "Terjadi Kesalahan..." });
    }
  })
  .post(async (req, res) => {
    try {
      const {
        permohonan_id,
        email_pemohon,
        telp_pemohon,
        current_no_registrasi,
        no_registrasi,
        tiket,
        jenis_respon,
        status_permohonan,
        pesan,
        mailed,
        whatsapped,
        // final
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
      const tanggal = buatCurTime();
      const badan_publik =
        penguasaan_informasi === "Bawaslu"
          ? penguasaan_informasi
          : penguasaan_informasi_lain;

      // cek nomor registrasi sama
      const cekRegNumber = await db("permohonan")
        .where("no_registrasi", no_registrasi)
        .whereNot("id", permohonan_id)
        .first();

      var tolak_id = null;

      // Jika ada yang sama
      if (cekRegNumber)
        return res.status(400).json({
          message:
            "Nomor Registrasi yang anda masukan sudah terdaftar dalam sistem, silakan masukan nomor register pengganti",
        });

      // proses update nomor registrasi jika terjadi perubahan
      if (current_no_registrasi != no_registrasi) {
        await db("permohonan")
          .where("id", permohonan_id)
          .update("no_registrasi", no_registrasi);
      }

      // proses update status permohonan terkait respon yang baru
      await db("permohonan")
        .where("id", permohonan_id)
        .update("status_permohonan", status_permohonan);

      const dataForInsertRespon = {
        permohonan_id,
        jenis_respon,
        tanggal_respon: tanggal,
        pesan,
        penguasaan_informasi:
          status_permohonan === "Tidak Dapat Diberikan" ? "" : badan_publik,
        bentuk_fisik:
          status_permohonan === "Tidak Dapat Diberikan" ? "" : bentuk_fisik,
        ket_biaya:
          status_permohonan === "Tidak Dapat Diberikan" ? "" : ket_biaya,
        penjelasan_penghitaman:
          status_permohonan === "Diberikan Sebagian"
            ? penjelasan_penghitaman
            : "",
        jangka_waktu,
        mailed,
        whatsapped,
      };
      // proses simpan respon
      const insert = await db("permohonan_respon").insert(dataForInsertRespon);

      // failed
      if (!insert)
        return res.status(400).json({ message: "Gagal Menginput Response" });

      // cek apakah Tidak Dapat Diberikan, kalau iya insert ke tabel penolakan
      if (status_permohonan === "Tidak Dapat Diberikan") {
        const insertTolak = await db("permohonan_respon_tolak").insert({
          respon_id: insert,
          tanggal_ditolak: tanggal,
          dasar_pengecualian,
          pada_pasal,
          ket_konsekuensi,
        });

        // failed
        if (!insertTolak) {
          await db("permohonan_respon").where("id", insert).del();
          return res
            .status(400)
            .json({ message: "Gagal Menginput Response Penolakan" });
        }

        tolak_id = insertTolak;
      }

      // setting email
      const setMailOption = mailOption(
        email_pemohon,
        "Perubahan Status Permohonan Informasi",
        TextPerubahanStatus(
          tiket,
          email_pemohon,
          status_permohonan,
          no_registrasi,
          pesan
        )
      );

      // jika harus kirim email
      if (mailed) {
        await sendingMail(setMailOption).then(async (resolve) => {
          if (!resolve) {
            // ubah email tidak terkirim jika gagal
            await db("permohonan_respon").where("id", insert[0]).update({
              mailed: 0,
            });
          }
        });
      }
      // jika harus kirim whatsapp
      if (whatsapped) {
        const sendWhatsapp = await prepareAndSendMessage(
          false,
          true,
          telp_pemohon,
          WaTextPerubahanStatus(
            tiket,
            email_pemohon,
            status_permohonan,
            no_registrasi,
            pesan
          )
        );

        if (!sendWhatsapp) {
          await db("permohonan_respon").where("id", insert[0]).update({
            whatsapped: 0,
          });
        }
      }

      // data callback
      const dataCallback = {
        id: insert[0],
        permohonan_id,
        jenis_respon,
        tanggal_respon: tanggal,
        pesan,
        penguasaan_informasi: badan_publik,
        bentuk_fisik,
        ket_biaya,
        penjelasan_penghitaman,
        jangka_waktu,
        mailed,
        whatsapped,
        respon_id: insert,
        tanggal_ditolak: tanggal,
        dasar_pengecualian,
        pada_pasal,
        ket_konsekuensi,
        tolak_id,
      };

      // success
      res.json({
        message: "Berhasil Memproses Response",
        dataCallback,
        type: "success",
      });
    } catch (error) {
      getLogger.error(error);
      res.status(500).json({ message: "Terjadi Kesalahan..." });
    }
  });
