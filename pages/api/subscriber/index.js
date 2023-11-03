import db from "libs/db";
import Handler from "middlewares/Handler";
import getLogger from "middlewares/getLogger";
// khusus subscriber instansi masing2

export default Handler()
  .get(async (req, res) => {
    try {
      const result = await db
        .select("subscriber.*", "bawaslu.nama_bawaslu")
        .from("subscriber")
        .leftJoin("bawaslu", "bawaslu.id", "subscriber.bawaslu_id")
        .modify((builder) => {
          if (req.session.user.level === 1) {
            builder.where(`subscriber.bawaslu_id`, "=", `0`);
          }
          if (req.session.user.level === 2) {
            builder.where(
              `subscriber.bawaslu_id`,
              "=",
              `${req.session.user.bawaslu_id}`
            );
          }
          if (req.session.user.level === 3) {
            builder.where(
              `subscriber.bawaslu_id`,
              "=",
              req.session.user.bawaslu_id
            );
          }
        })
        .orderBy("subscriber.created_at", "desc");

      res.json(result);
    } catch (error) {
      getLogger.error(error);
      res.status(500).json({ message: "Terjadi Kesalahan..." });
    }
  })
  .post(async (req, res) => {
    try {
      const { bawaslu_id } = req.session.user;
      const { nama_subscriber, email_subscriber } = req.body;

      // proses simpan
      const proses = await db("subscriber").insert([
        {
          nama_subscriber,
          email_subscriber,
          bawaslu_id,
        },
      ]);

      // failed
      if (!proses)
        return res.status(400).json({
          message: "Gagal Memasukan Data",
        });

      // success
      res.json({ message: "Berhasil Menginput Data", type: "success" });
    } catch (error) {
      getLogger.error(error);
      res.status(500).json({ message: "Terjadi Kesalahan..." });
    }
  })
  // delete one by one
  .put(async (req, res) => {
    try {
      const { id } = req.body;
      const proses = await db("subscriber").where("id", id).del();

      if (!proses) return res.status(400).json({ message: "Gagal Hapus" });

      res.json({ message: "Berhasil Hapus", type: "success" });
    } catch (error) {
      getLogger.error(error);
      res.status(500).json({ message: "Terjadi Kesalahan..." });
    }
  })
  // proses hapus data terpilih
  .delete(async (req, res) => {
    try {
      const arrID = req.body;
      const proses = await db("subscriber").whereIn("id", arrID).del();

      if (!proses) return res.status(400).json({ message: "Gagal Hapus" });

      res.json({ message: "Sukses Menghapus Data Terpilih", type: "success" });
    } catch (error) {
      getLogger.error(error);
      res.status(500).json({ message: "Terjadi Kesalahan..." });
    }
  });
