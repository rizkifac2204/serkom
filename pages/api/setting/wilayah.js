import db from "libs/db";
import Handler from "middlewares/Handler";
import getLogger from "middlewares/getLogger";

export default Handler()
  .get(async (req, res) => {
    try {
      const data = await db("bawaslu")
        .where({ id: req.session.user.bawaslu_id })
        .first();
      res.json(data);
    } catch (error) {
      getLogger.error(error);
      res.status(500).json({ message: "Terjadi Kesalahan..." });
    }
  })
  .post(async (req, res) => {
    try {
      const { level, bawaslu_id } = req.session.user;
      const {
        id,
        nama_bawaslu,
        email_bawaslu,
        telp_bawaslu,
        alamat_bawaslu,
        kota_bawaslu,
        web_profile,
        web_ppid,
        facebook,
        twitter,
        youtube,
        instagram,
      } = req.body;
      let provinsi_id = bawaslu_id.substring(0, 2);

      const cek = await db("bawaslu").where({ id: bawaslu_id }).first();
      if (cek) {
        // proses update
        const update = await db("bawaslu").where({ id: bawaslu_id }).update({
          nama_bawaslu,
          email_bawaslu,
          telp_bawaslu,
          alamat_bawaslu,
          kota_bawaslu,
          web_profile,
          web_ppid,
          facebook,
          twitter,
          youtube,
          instagram,
        });

        // failed
        if (!update)
          return res.status(400).json({
            message: "Gagal Mengubah Data",
          });
      } else {
        // proses simpan
        const simpan = await db("bawaslu").insert({
          id: bawaslu_id,
          level_bawaslu: level,
          provinsi_id,
          nama_bawaslu,
          email_bawaslu,
          telp_bawaslu,
          alamat_bawaslu,
          kota_bawaslu,
          web_profile,
          web_ppid,
          facebook,
          twitter,
          youtube,
          instagram,
        });

        // failed
        if (!simpan)
          return res.status(400).json({
            message: "Gagal Menyimpan Data",
          });
      }

      // success
      res.json({ message: "Berhasil Menyimpan Data", type: "success" });
    } catch (error) {
      getLogger.error(error);
      res.status(500).json({ message: "Terjadi Kesalahan..." });
    }
  });
