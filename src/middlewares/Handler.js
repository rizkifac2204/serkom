import nextConnect from "next-connect";
import cookie from "cookie";
import getLogger from "./getLogger";
import { verifyAuth } from "libs/auth";

export default function Handler() {
  return nextConnect({
    onError: (err, req, res, next) => {
      console.error(err.stack);
      getLogger.error(err);
      res.status(500).json({ message: err.toString(), type: "error" });
    },
    onNoMatch: (req, res) => {
      res.status(404).json({ message: "Not found", type: "error" });
    },
  }).use(async (req, res, next) => {
    try {
      const cookiess = cookie.parse(req.headers.cookie || "");
      const token = cookiess[process.env.JWT_NAME];
      const verifiedToken = await verifyAuth(token, res).catch((err) => {
        // console.log(err);
      });
      if (!verifiedToken) {
        return res.status(401).json({ message: "Akses Tidak Dikenal" });
      } else {
        req.session = {
          user: verifiedToken,
        };
      }
      next();
    } catch (err) {
      getLogger.error(err);
      return res.status(401).json({ message: "Akses Tidak Dikenal" });
    }
  });
}
