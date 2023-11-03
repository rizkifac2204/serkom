import db from "libs/db";
import PublicHandler from "middlewares/PublicHandler";
import { emailAdmin, noWaAdmin } from "middlewares/PublicCondition";
import sendingMail, {
  mailOption,
  TextPermohonanBaruKepadaAdmin,
  TextPermohonanBaruKepadaPemohon,
} from "services/Email";
import {
  prepareAndSendMessage,
  WaTextPermohonanBaruKepadaAdmin,
  WaTextPermohonanBaruKepadaPemohon,
} from "libs/whatsapp";
import getLogger from "middlewares/getLogger";

export default PublicHandler().post(async (req, res) => {
  try {
    const { bawaslu_id, email_pemohon, tiket, telp_pemohon, kepada } = req.body;

    // setting whatsapp untuk admin
    const getWhatsappAdmin = await db("admin")
      .where("bawaslu_id", bawaslu_id)
      .first();
    const whatsappTujuanAdmin = noWaAdmin(kepada, getWhatsappAdmin.telp_admin);

    // setting email untuk admin
    const getEmailBawaslu = await db("bawaslu").where("id", bawaslu_id).first();
    const emailTujuanAdmin = emailAdmin(kepada, getEmailBawaslu.email_bawaslu);
    const setMailOptionAdmin = mailOption(
      emailTujuanAdmin,
      "Permohonan Informasi Baru",
      TextPermohonanBaruKepadaAdmin(tiket, email_pemohon)
    );

    // setting email untuk pemohon
    const setMailOptionPemohon = mailOption(
      email_pemohon,
      "Permohonan Informasi PPID Bawaslu",
      TextPermohonanBaruKepadaPemohon(tiket, email_pemohon)
    );

    // whatsapp kepada admin
    await prepareAndSendMessage(
      false,
      true,
      whatsappTujuanAdmin,
      WaTextPermohonanBaruKepadaAdmin(tiket, email_pemohon)
    );
    // whatsapp kepada pemohon
    await prepareAndSendMessage(
      false,
      true,
      telp_pemohon,
      WaTextPermohonanBaruKepadaPemohon(tiket, email_pemohon)
    );
    // email kepada admin
    await sendingMail(setMailOptionAdmin);
    // email kepada pemohon
    await sendingMail(setMailOptionPemohon);

    return res.json({
      message: "Sending Notif",
      type: "success",
    });
  } catch (error) {
    getLogger.error(error);
    return res.status(400).json({
      message: "Gagal Mengirim Survey",
    });
  }
});
