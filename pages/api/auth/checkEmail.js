import db from "libs/db";
import { setUserCookie } from "libs/auth";
import getLogger from "middlewares/getLogger";

const Handler = async (req, res) => {
  try {
    if (req.method !== "POST") {
      res.status(405).json({ message: "Method Not Allowed" });
      return;
    }

    const { email, image } = req.body;

    if (!email) {
      res.status(401).json({ message: "Not Detected" });
      return;
    }

    const checkUser = await db
      .select(`admin.*`, `bawaslu.level_bawaslu as level`)
      .from(`admin`)
      .innerJoin(`bawaslu`, `admin.bawaslu_id`, `bawaslu.id`)
      .where(`admin.email_admin`, email)
      .first();

    if (!checkUser) {
      res.status(401).json({ message: "Data User Tidak Ditemukan" });
      return;
    }

    const dataForJWT = {
      id: checkUser.id,
      level: checkUser.level,
      bawaslu_id: checkUser.bawaslu_id,
      email_admin: checkUser.email_admin,
      name: checkUser.nama_admin,
      image: image,
    };

    try {
      await setUserCookie(dataForJWT, res);
      return res
        .status(200)
        .json({ message: "Success Login", type: "success" });
    } catch (err) {
      return res.status(401).json({ message: err.message });
    }
  } catch (error) {
    getLogger.error(error);
    res.status(500).json({ message: "Terjadi Kesalahan..." });
  }
};

export default Handler;
