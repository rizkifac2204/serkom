import { useState, useContext, useEffect } from "react";
import AuthContext from "context/AuthContext";
// MUI
import Box from "@mui/material/Box";
import Alert from "@mui/material/Alert";
import Collapse from "@mui/material/Collapse";
import Button from "@mui/material/Button";

function AlertInfo() {
  const [open, setOpen] = useState(false);
  const { user: session } = useContext(AuthContext);

  function handleCloseAlert() {
    setOpen(false);
    // get localstorage
    const settingAlert = localStorage.getItem("settingAlert")
      ? JSON.parse(localStorage.getItem("settingAlert"))
      : {};
    // update localstorage
    localStorage.setItem(
      "settingAlert",
      JSON.stringify({ ...settingAlert, showAlertWhatsapp: false })
    );
  }

  useEffect(() => {
    const settingAlert = localStorage.getItem("settingAlert");
    if (settingAlert) {
      const setting = JSON.parse(settingAlert);
      const showAlertWhatsapp = setting.showAlertWhatsapp;
      if (showAlertWhatsapp) setOpen(true);
    } else {
      setOpen(true);
    }
  }, []);

  if (!open) return;
  return (
    <Box sx={{ width: "100%" }}>
      <Collapse in={open}>
        <Alert
          severity="info"
          variant="outlined"
          action={
            <Button
              size="small"
              variant="text"
              aria-label="close"
              color="inherit"
              onClick={() => handleCloseAlert()}
            >
              Jangan Tampilkan Lagi
            </Button>
          }
          sx={{ mb: 2 }}
        >
          Hai {session ? session.name : "Admin"}, Sekarang notifikasi whatsapp
          sudah bisa digunakan. Segera lakukan edit data pada formulir
          &quot;GANTI DATA PROFILE&quot; di halaman profile, dan masukan nomor
          yang terdaftar pada whatsapp untuk menerima notifikasi jika ada
          permohonan baru.
        </Alert>
      </Collapse>
    </Box>
  );
}

export default AlertInfo;
