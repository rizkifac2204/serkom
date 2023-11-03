import db from "libs/db";
import Handler from "middlewares/Handler";
import bcrypt from "bcryptjs";
import getLogger from "middlewares/getLogger";
import { prepareAndSendMessage, WaTextWelcomeAdmin } from "libs/whatsapp";

async function processWhatsapp(level, telp_awal, telp_admin, res) {
  return new Promise(async (resolve) => {
    const required = process.env.WHATSAPP_REQUIRED;
    try {
      let confirmKirim = true;
      const cekPernahWhatsapp = await db("list_nomor_whatsapp")
        .where("nomor", telp_admin)
        .andWhere("sumber", "Form Profile")
        .first();

      if (level !== 0) {
        if (telp_awal === telp_admin && cekPernahWhatsapp) confirmKirim = false;

        await prepareAndSendMessage(
          required,
          confirmKirim,
          telp_admin,
          WaTextWelcomeAdmin()
        );

        if (telp_awal === telp_admin) {
          if (!cekPernahWhatsapp)
            await db("list_nomor_whatsapp").insert({
              nomor: telp_admin,
              sumber: "Form Profile",
            });
        } else {
          // hapus nomor lama
          await db("list_nomor_whatsapp").where("nomor", telp_awal).del();
          // insert nomor baru
          await db("list_nomor_whatsapp").insert({
            nomor: telp_admin,
            sumber: "Form Profile",
          });
        }
      }
      resolve(true);
    } catch (error) {
      if (required) {
        return res
          .status(500)
          .json({ message: error?.message || "Terjadi Kesalahan ..." });
      } else {
        resolve(false);
        getLogger.error(error);
      }
    }
  });
}

export default Handler()
  .get(async (req, res) => {
    try {
      const result = await db
        .select(
          "admin.*",
          "bawaslu.level_bawaslu",
          "bawaslu.nama_bawaslu",
          "level.level",
          "provinsi.provinsi"
        )
        .from("admin")
        .innerJoin("bawaslu", "admin.bawaslu_id", "bawaslu.id")
        .innerJoin("level", "bawaslu.level_bawaslu", "level.id")
        .leftJoin("provinsi", "bawaslu.provinsi_id", "provinsi.id")
        .orderBy("bawaslu.level_bawaslu")
        .where("admin.id", req.session.user.id)
        .first();

      if (!result) return res.status(404).json({ message: "Tidak Ditemukan" });

      res.json(result);
    } catch (error) {
      getLogger.error(error);
      res.status(500).json({ message: "Terjadi Kesalahan..." });
    }
  })
  .put(async (req, res) => {
    try {
      const { id, level } = req.session.user;
      const {
        nama_admin,
        telp_admin,
        telp_awal,
        email_admin,
        alamat_admin,
        username,
        password,
        passwordConfirm,
      } = req.body;

      const cek = await db("admin").where("id", id).first();
      if (!cek)
        return res.status(401).json({ message: "User Tidak Terdeteksi" });

      // // jika password tidak sama
      const match = await bcrypt.compare(passwordConfirm, cek.password);
      if (!match)
        return res.status(401).json({ message: "Password Anda Salah" });

      //cek jika ada email yang sama
      const cekEmailSama = await db("admin")
        .where("id", "!=", id)
        .andWhere("email_admin", email_admin)
        .first();
      if (cekEmailSama)
        return res.status(401).json({
          message:
            "Email yang anda masukan sudah di pakai user lain, silakan masukan email pengganti",
        });

      await processWhatsapp(level, telp_awal, telp_admin, res);

      const proses = await db("admin").where("id", id).update({
        nama_admin,
        telp_admin,
        email_admin,
        alamat_admin,
        username,
        updated_at: db.fn.now(),
      });

      // failed
      if (!proses) return req.status(400).json({ message: "Gagal Proses" });

      res.json({ message: "Berhasil Mengubah Data Profile" });
    } catch (error) {
      console.log(error);
      // getLogger.error(error);
      res.status(500).json({ message: error?.message || "Terjadi Kesalahan" });
    }
  });
