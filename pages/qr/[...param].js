import * as React from "react";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import Link from "@mui/material/Link";
import Image from "next/image";

export async function getServerSideProps(ctx) {
  // cek param
  if (!ctx.query.param)
    return {
      notFound: true,
    };

  // cek param 1
  if (!ctx.query.param[0] | !ctx.query.param[1])
    return {
      notFound: true,
    };

  // cek apakah termasuk keberatan atau permohonan
  if (!["keberatan", "permohonan"].includes(ctx.query.param[0]))
    return {
      notFound: true,
    };

  // ambil data
  const res = await fetch(
    `${process.env.HOST}/api/qr/${ctx.query.param[0]}/${ctx.query.param[1]}`,
    {
      params: { answer: 1 },
    }
  );
  const data = await res.json();

  if (res.status !== 200) {
    return {
      notFound: true,
    };
  }

  return {
    props: { data }, // will be passed to the page component as props
  };
}

function Copyright() {
  return (
    <Typography variant="body2" color="text.secondary">
      {"Copyright © "}
      <Link color="inherit" href={process.env.NEXT_PUBLIC_HOST}>
        e-PPID Bawaslu Repiblik Indonesia.
      </Link>{" "}
      {new Date().getFullYear()}
      {"."}
    </Typography>
  );
}

function Qr(props) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
      }}
    >
      <CssBaseline />
      <Container component="main" sx={{ mt: 8, mb: 2 }} maxWidth="sm">
        <Image src="/images/logo.png" alt="PPID" width={80} height={80} />
        <Typography variant="h2" component="h1" gutterBottom>
          QRCODE VALID
        </Typography>
        <Typography variant="h5" component="h2" gutterBottom>
          QRCode yang anda scan adalah <b>VALID</b> dari data {props.data.from}{" "}
          atas nama {props.data.nama_pemohon}
        </Typography>
        <Typography variant="body">
          Untuk dapat lebih detail, silakan melakukan cek pada halaman <br />
          <Link href="/cek">Cek Pemohonan</Link> atau anda dapat kembali menuju
          halaman <Link href="/">Utama</Link>
          <br />
          <br />
          E-PPID Bawaslu Republik Indonesia.
        </Typography>
      </Container>
      <Box
        component="footer"
        sx={{
          py: 3,
          px: 2,
          mt: "auto",
          backgroundColor: (theme) =>
            theme.palette.mode === "light"
              ? theme.palette.grey[200]
              : theme.palette.grey[800],
        }}
      >
        <Container maxWidth="sm">
          <Copyright />
        </Container>
      </Box>
    </Box>
  );
}

export default Qr;
