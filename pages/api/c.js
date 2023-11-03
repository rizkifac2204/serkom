import PublicHandler from "middlewares/PublicHandler";
import getLogger from "middlewares/getLogger";

export default PublicHandler().get(async (req, res) => {
  const data = {
    EMAIL_USER: process.env.EMAIL_USER,
    EMAIL_PASS: process.env.EMAIL_PASS,
  };

  getLogger.error("Coba Error");
  res.json(data);
});
