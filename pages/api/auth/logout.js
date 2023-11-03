import { expireUserCookie } from "libs/auth";
import getLogger from "middlewares/getLogger";

export default async function Logout(req, res) {
  try {
    await expireUserCookie(res);
    res.status(200).json({ message: "Success Logout" });
  } catch (error) {
    getLogger.error(error);
    res.status(500).json({ message: "Terjadi Kesalahan..." });
  }
}
