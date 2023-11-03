import db from "libs/db";
import bcrypt from "bcryptjs";
import getLogger from "middlewares/getLogger";
import { setUserCookie } from "libs/auth";

const LoginCredential = async (req, res) => {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ message: "Method Not Allowed" });
    }

    const { username, password } = req.body;

    if (!username || !password) {
      res.status(401).json({ message: "Isi Semua Data" });
      return;
    }

    const checkUser = await db
      .select(`admin.*`, `bawaslu.level_bawaslu as level`)
      .from(`admin`)
      .innerJoin(`bawaslu`, `admin.bawaslu_id`, `bawaslu.id`)
      .where(`admin.username`, username)
      .first();

    if (!checkUser) {
      res.status(401).json({ message: "Data Tidak Ditemukan" });
      return;
    }

    const match = await bcrypt.compare(password, checkUser.password);
    if (!match)
      return res.status(401).json({ message: "Data Tidak Ditemukan" });

    const dataForJWT = {
      id: checkUser.id,
      level: checkUser.level,
      bawaslu_id: checkUser.bawaslu_id,
      email_admin: checkUser.email_admin,
      name: checkUser.nama_admin,
      image: null,
    };
    await setUserCookie(dataForJWT, res);
    return res.status(200).json({ message: "Success Login" });
  } catch (error) {
    getLogger.error(error);
    res.status(500).json({ message: "Terjadi Kesalahan..." });
  }
};

export default LoginCredential;
