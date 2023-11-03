import { NextResponse } from "next/server";
import { verifyAuth } from "libs/auth";

export const config = {
  matcher: ["/(admin.*)", "/login"],
};

export default async function middleware(req, res) {
  const { pathname, origin } = req.nextUrl;

  const token = req.cookies.get(process.env.JWT_NAME)?.value;
  const verifiedToken = await verifyAuth(token, res).catch((err) => {
    // console.log(err);
  });

  if (pathname.startsWith("/login")) {
    if (verifiedToken) return NextResponse.redirect(`${origin}/admin`);
  }
  if (pathname.startsWith("/admin")) {
    if (!verifiedToken) return NextResponse.redirect(`${origin}/login`);

    if (pathname === "/admin/setting")
      return NextResponse.redirect(`${origin}/admin/setting/wilayah`);

    if (pathname === "/admin/setting/regulasi/add" && verifiedToken.level !== 1)
      return NextResponse.redirect(`${origin}/admin/setting/regulasi`);

    if (pathname === "/admin/setting/whatsapp" && verifiedToken.level !== 1)
      return NextResponse.redirect(`${origin}/admin/setting/regulasi`);

    if (pathname === "/admin/setting/users/add" && verifiedToken.level === 3)
      return NextResponse.redirect(`${origin}/admin/setting/users`);
  }

  return NextResponse.next();
}
