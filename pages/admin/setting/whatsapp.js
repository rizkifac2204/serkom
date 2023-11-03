import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import QRCode from "qrcode";
// MUI
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import { CardActionArea, CardActions } from "@mui/material";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
// Components
import { useWhatsappContext } from "context/whatsappContext";
import { formatedDateFromEpoch } from "components/Attributes";

function Whatsapp() {
  const { whatsapp } = useWhatsappContext();
  const [src, setSrc] = useState("");

  const numberRef = useRef();
  const messageRef = useRef();

  function generateQRCode(string) {
    QRCode.toDataURL(string).then((data) => {
      setSrc(data);
    });
  }

  function reloadPage() {
    setTimeout(() => {
      window.location.reload();
    }, 5000);
  }

  useEffect(() => {
    if (whatsapp.qr) generateQRCode(whatsapp.qr);
    if (whatsapp.isNewLogin) reloadPage();
    return () => {
      "cleanup";
    };
  }, [whatsapp]);

  function kirimWhatsapp(e) {
    const post = {
      number: numberRef.current.value,
      message: messageRef.current.value,
    };
    axios
      .post(`/api/setting/whatsapp`, post)
      .then((res) => {
        toast.success(res.data.message);
      })
      .catch((err) => {
        toast(err.response.data.message, { type: err.response.data.type });
      });
  }

  function logoutWhatsapp() {
    axios
      .delete(`/api/setting/whatsapp`)
      .then((res) => {
        toast.success(res.data.message);
        reloadPage();
      })
      .catch((err) => {
        console.log(err);
        toast(err.response.data.message, { type: err.response.data.type });
      });
  }

  return (
    <>
      <Alert severity="info" sx={{ mb: 2 }}>
        Perhatian
        <ul>
          <li>Halaman Ini Tersedia Hanya Untuk Admin/Bawaslu RI</li>
          <li>
            Nomor Whatsapp yang didaftarkan akan menjadi Nomor yang mengirim
            pesan kepada Pemohon dan Admin Bawaslu Provinsi dan Kabupaten/Kota
          </li>
          <li>
            Untuk menghindari pemblokiran (Banned/dianggap spam) oleh Pihak
            Whatsapp, Mohon gunakan nomor whatsapp yang sudah Verified (Centang
            Hijau)
          </li>
          <li>
            Jika nomor belum didaftarkan, Pemohon maupun Admin hanya mendapatkan
            Email sebagai Notifikasi
          </li>
        </ul>
      </Alert>
      <Grid container spacing={1}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardActionArea>
              <CardMedia
                component="img"
                image={
                  whatsapp?.status === "Scan" ? src : "/images/whatsapp.png"
                }
                alt="Whatsapp Active"
              />
              <CardContent>
                <Typography gutterBottom variant="h5" component="div">
                  {whatsapp.status}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {whatsapp.message}
                </Typography>
              </CardContent>
            </CardActionArea>
            {whatsapp.status === "Ready" ? (
              <CardActions>
                <Button
                  size="small"
                  color="primary"
                  sx={{ marginLeft: "auto" }}
                  onClick={logoutWhatsapp}
                >
                  Logout
                </Button>
              </CardActions>
            ) : null}
          </Card>
        </Grid>
        {whatsapp.info ? (
          <Grid item xs={12} md={8}>
            <Card sx={{ p: 2 }}>
              <ul>
                <li>Nama : {whatsapp.info?.me?.name}</li>
                <li>Nomor : {whatsapp.info?.me?.id.split(":")[0]}</li>
                <li>Paltform : {whatsapp.info?.platform}</li>
                <li>
                  lastAccountSyncTimestamp :{" "}
                  {formatedDateFromEpoch(
                    whatsapp.info?.lastAccountSyncTimestamp,
                    true
                  )}
                </li>
              </ul>

              {whatsapp.status === "Ready" ? (
                <>
                  Formulir Kirim Whatsapp
                  <Box sx={{ display: "flex", my: 2 }}>
                    <TextField
                      label="Nomor Whatsapp"
                      variant="outlined"
                      name="number"
                      size="small"
                      placeholder="Nomor WA"
                      inputRef={numberRef}
                      sx={{ mr: 2 }}
                    />
                    <TextField
                      label="Pesan"
                      variant="outlined"
                      name="message"
                      size="small"
                      placeholder="Pesan"
                      inputRef={messageRef}
                      fullWidth
                      multiline
                      rows={5}
                    />
                  </Box>
                  <Button onClick={kirimWhatsapp}>Kirim</Button>
                </>
              ) : null}
            </Card>
          </Grid>
        ) : null}
      </Grid>
    </>
  );
}

Whatsapp.auth = true;
Whatsapp.breadcrumb = [
  {
    path: "/admin",
    title: "Home",
  },
  {
    path: "/admin/setting/whatsapp",
    title: "Whatsapp",
  },
];
export default Whatsapp;
