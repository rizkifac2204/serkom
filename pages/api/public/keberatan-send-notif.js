import PublicHandler from "middlewares/PublicHandler";
import sendingMail, {
  mailOption,
  TextKeberatanKepadaAdmin,
  TextKeberatanKepadaPemohon,
} from "services/Email";
import {
  prepareAndSendMessage,
  WaTextKeberatanKepadaAdmin,
  WaTextKeberatanKepadaPemohon,
} from "libs/whatsapp";
import { emailAdmin } from "middlewares/PublicCondition";
import getLogger from "middlewares/getLogger";

export default PublicHandler().post(async (req, res) => {
  // proses simpan
  try {
    const {
      no_registrasi,
      tiket,
      email_pemohon,
      email_bawaslu,
      nama_bawaslu,
      telp_admin,
      telp_pemohon,
    } = req.body;

    // setting email untuk pemohon
    const setMailOptionPemohon = mailOption(
      email_pemohon,
      "Pengajuan Keberatan PPID Bawaslu",
      TextKeberatanKepadaPemohon(no_registrasi, tiket)
    );

    // setting email untuk admin
    const emailadmintujuan = emailAdmin(nama_bawaslu, email_bawaslu);
    const setMailOptionAdmin = mailOption(
      emailadmintujuan,
      "Pengajuan Keberatan Permohonan Informasi Baru",
      TextKeberatanKepadaAdmin(no_registrasi, email_pemohon, tiket)
    );

    // whatsapp kepada admin
    await prepareAndSendMessage(
      false,
      true,
      telp_admin,
      WaTextKeberatanKepadaAdmin(no_registrasi, email_pemohon, tiket)
    );
    // whatsapp kepada pemohon
    await prepareAndSendMessage(
      false,
      true,
      telp_pemohon,
      WaTextKeberatanKepadaPemohon(no_registrasi, tiket)
    );
    // email kepada pemohon
    await sendingMail(setMailOptionAdmin);
    // email kepada pemohon
    await sendingMail(setMailOptionPemohon);

    // success
    res.json({
      message: "Sending Notif",
      type: "success",
    });
  } catch (error) {
    getLogger.error(error);
    return res.status(400).json({
      message: "Gagal Mengajukan Keberatan",
    });
  }
});
