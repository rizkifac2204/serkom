import db from "libs/db";
import Handler from "middlewares/Handler";
import bcrypt from "bcryptjs";
import { conditionFilterUser } from "middlewares/Condition";
import getLogger from "middlewares/getLogger";

export default Handler()
  .get(async (req, res) => {
    try {
      const { id } = req.query;

      const result = await db
        .select(
          "admin.*",
          "bawaslu.level_bawaslu",
          "bawaslu.nama_bawaslu",
          "level.level",
          "provinsi.provinsi",
          db.raw(
            `IF(${req.session.user.level} < bawaslu.level_bawaslu, true, false) as editable,
          IF(${req.session.user.id} = admin.id, true, false) as myself`
          )
        )
        .from("admin")
        .innerJoin("bawaslu", "admin.bawaslu_id", "bawaslu.id")
        .innerJoin("level", "bawaslu.level_bawaslu", "level.id")
        .leftJoin("provinsi", "bawaslu.provinsi_id", "provinsi.id")
        .modify((builder) => conditionFilterUser(builder, req.session.user))
        .orderBy("bawaslu.level_bawaslu")
        .where("admin.id", id)
        .first();

      res.json(result);
    } catch (error) {
      getLogger.error(error);
      res.status(500).json({ message: "Terjadi Kesalahan..." });
    }
  })
  .put(async (req, res) => {
    try {
      const {
        id,
        nama_admin,
        telp_admin,
        email_admin,
        alamat_admin,
        username,
        passwordBaru,
      } = req.body;

      // cek reg number sama
      const cek = await db("admin")
        .where("username", username)
        .whereNot("id", id)
        .first();
      // Jika ada yang sama
      if (cek)
        return res
          .status(400)
          .json({ message: "Mohon Ganti Username Pengganti", type: "error" });

      const salt = bcrypt.genSaltSync(10);
      const hashPasswordBaru = bcrypt.hashSync(passwordBaru, salt);

      const proses = await db("admin").where("id", id).update({
        nama_admin,
        telp_admin,
        email_admin,
        alamat_admin,
        username,
        password: hashPasswordBaru,
        updated_at: db.fn.now(),
      });

      // failed
      if (!proses) return req.status(400).json({ message: "Gagal Proses" });

      res.json({ message: "Berhasil Edit User", type: "success" });
    } catch (error) {
      getLogger.error(error);
      res.status(500).json({ message: "Terjadi Kesalahan..." });
    }
  })
  .delete(async (req, res) => {
    try {
      const { id } = req.query;
      const proses = await db("admin").where("id", id).del();

      if (!proses) return res.status(400).json({ message: "Gagal Hapus" });

      res.json({ message: "Berhasil Hapus", type: "success" });
    } catch (error) {
      getLogger.error(error);
      res.status(500).json({ message: "Terjadi Kesalahan..." });
    }
  });
