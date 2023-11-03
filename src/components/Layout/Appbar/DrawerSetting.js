import { useRef, useState, useContext } from "react";
import Drawer from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import CloseIcon from "@mui/icons-material/Close";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import LogoutIcon from "@mui/icons-material/Logout";
import { red } from "@mui/material/colors";
import IconButton from "@mui/material/IconButton";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import CircleIcon from "@mui/icons-material/Circle";
import Switch from "@mui/material/Switch";
import { styled } from "@mui/material/styles";
import FormControlLabel from "@mui/material/FormControlLabel";
import OpenInFullIcon from "@mui/icons-material/OpenInFull";
import CloseFullscreenIcon from "@mui/icons-material/CloseFullscreen";
import Link from "next/link";
import AuthContext from "context/AuthContext";
import Popover from "@mui/material/Popover";
import Badge from "@mui/material/Badge";
import Tooltip from "@mui/material/Tooltip";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import { useWhatsappContext } from "context/whatsappContext";

const MaterialUISwitch = styled(Switch)(({ theme }) => ({
  width: 62,
  height: 34,
  padding: 7,
  "& .MuiSwitch-switchBase": {
    margin: 1,
    padding: 0,
    transform: "translateX(6px)",
    "&.Mui-checked": {
      color: "#fff",
      transform: "translateX(22px)",
      "& .MuiSwitch-thumb:before": {
        backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 20 20"><path fill="${encodeURIComponent(
          "#fff"
        )}" d="M4.2 2.5l-.7 1.8-1.8.7 1.8.7.7 1.8.6-1.8L6.7 5l-1.9-.7-.6-1.8zm15 8.3a6.7 6.7 0 11-6.6-6.6 5.8 5.8 0 006.6 6.6z"/></svg>')`,
      },
      "& + .MuiSwitch-track": {
        opacity: 1,
        backgroundColor: theme.palette.mode === "dark" ? "#8796A5" : "#aab4be",
      },
    },
  },
  "& .MuiSwitch-thumb": {
    backgroundColor:
      theme.palette.mode === "dark"
        ? theme.palette.primary.main
        : theme.palette.secondary.main,
    width: 32,
    height: 32,
    "&:before": {
      content: "''",
      position: "absolute",
      width: "100%",
      height: "100%",
      left: 0,
      top: 0,
      backgroundRepeat: "no-repeat",
      backgroundPosition: "center",
      backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 20 20"><path fill="${encodeURIComponent(
        "#fff"
      )}" d="M9.305 1.667V3.75h1.389V1.667h-1.39zm-4.707 1.95l-.982.982L5.09 6.072l.982-.982-1.473-1.473zm10.802 0L13.927 5.09l.982.982 1.473-1.473-.982-.982zM10 5.139a4.872 4.872 0 00-4.862 4.86A4.872 4.872 0 0010 14.862 4.872 4.872 0 0014.86 10 4.872 4.872 0 0010 5.139zm0 1.389A3.462 3.462 0 0113.471 10a3.462 3.462 0 01-3.473 3.472A3.462 3.462 0 016.527 10 3.462 3.462 0 0110 6.528zM1.665 9.305v1.39h2.083v-1.39H1.666zm14.583 0v1.39h2.084v-1.39h-2.084zM5.09 13.928L3.616 15.4l.982.982 1.473-1.473-.982-.982zm9.82 0l-.982.982 1.473 1.473.982-.982-1.473-1.473zM9.305 16.25v2.083h1.389V16.25h-1.39z"/></svg>')`,
    },
  },
  "& .MuiSwitch-track": {
    opacity: 1,
    backgroundColor: theme.palette.mode === "dark" ? "#8796A5" : "#aab4be",
    borderRadius: 20 / 2,
  },
}));

const primaryColor = {
  info: "#0288d1",
  success: "#2e7d32",
  warning: "#ed6c02",
  error: "#d32f2f",
};
const secondaryColors = {
  info: "#0288d1",
  success: "#2e7d32",
  warning: "#ed6c02",
  error: "#d32f2f",
};

function DrawerSetting(props) {
  const { whatsapp } = useWhatsappContext();
  const { logout } = useContext(AuthContext);

  const ref = useRef(null);
  const [isOpen, setOpen] = useState(false);
  const handleOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  const color = whatsapp && whatsapp.status === "Ready" ? "success" : "error";

  return (
    <Drawer
      variant="persistent"
      anchor={"right"}
      open={props.open}
      sx={{
        "& .MuiDrawer-paper": {
          width: 300,
          pt: 4,
          pb: 1,
          px: 3,
          borderRadius: "8px",
          boxShadow: 2,
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          mb: 2,
        }}
      >
        <Box>
          <Typography variant="h5">Pengaturan</Typography>
          <Typography variant="body2" color="text.secondary">
            Profile dan Tampilan
          </Typography>
        </Box>
        <Box>
          <CloseIcon
            sx={{ fontSize: 12, cursor: "pointer" }}
            onClick={props.toggleDrawerSetting}
          />
        </Box>
      </Box>

      <Divider />

      <Stack spacing={2} my={3}>
        <Button
          component={Link}
          href="/admin/profile"
          variant="outlined"
          size="small"
          startIcon={<ManageAccountsIcon />}
        >
          Profile
        </Button>

        <Button
          variant="outlined"
          size="small"
          startIcon={<LogoutIcon />}
          onClick={logout}
        >
          Logout
        </Button>
      </Stack>

      <Divider />

      <Box my={3}>
        <Typography variant="subtitle1">Pengaturan</Typography>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <Box>
            <Typography variant="caption" display="block">
              Warna Utama
            </Typography>
            <IconButton
              color="inherit"
              size="small"
              sx={{ color: "#0097a7" }}
              onClick={() => props.changePrimaryColor("#0097a7")}
            >
              <CircleIcon />
            </IconButton>
            {Object.keys(primaryColor).map((key, idx) => (
              <IconButton
                key={idx}
                color={key}
                size="small"
                onClick={() => props.changePrimaryColor(primaryColor[key])}
              >
                <CircleIcon />
              </IconButton>
            ))}
          </Box>
          <Box>
            <Typography variant="caption" display="block">
              Warna Secondary
            </Typography>
            <IconButton
              color="inherit"
              size="small"
              sx={{ color: red[800] }}
              onClick={() => props.changeSecondaryColor(red[800])}
            >
              <CircleIcon />
            </IconButton>
            {Object.keys(secondaryColors).map((key, idx) => (
              <IconButton
                key={idx}
                color={key}
                size="small"
                onClick={() => props.changeSecondaryColor(secondaryColors[key])}
              >
                <CircleIcon />
              </IconButton>
            ))}
          </Box>
        </Box>
      </Box>

      <Divider />

      <Box
        sx={{
          my: 2,
          display: "flex",
        }}
      >
        <Tooltip arrow title="Whatsapp">
          <IconButton
            color="primary"
            ref={ref}
            size="small"
            onClick={handleOpen}
          >
            <Badge color={color} variant="dot">
              <WhatsAppIcon />
            </Badge>
          </IconButton>
        </Tooltip>
        <Typography variant="caption" display="block" sx={{ ml: 1 }}>
          {whatsapp.message}
        </Typography>
      </Box>

      <Popover
        anchorEl={ref.current}
        onClose={handleClose}
        open={isOpen}
        anchorOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <Box
          sx={{ p: 2 }}
          display="flex"
          alignItems="center"
          justifyContent="space-between"
        >
          <Typography variant="body">Whatsapp Notifikasi</Typography>
        </Box>
        <Divider />
        <Box flex="1" sx={{ p: 2 }}>
          <Box display="flex" justifyContent="space-between">
            <Typography>Status</Typography>
            <Typography
              variant="caption"
              color={color}
              sx={{ textTransform: "none" }}
            >
              {whatsapp.status}
            </Typography>
          </Box>
          <Typography component="span" variant="body2" color="text.secondary">
            {whatsapp.message} <br />
            <i>
              <small>
                (Jika Whatsapp Tidak Aktif, Notifikasi Whatsapp Tidak Akan{" "}
                <br />
                Diterima Admin Maupun Pemohon)
              </small>
            </i>
          </Typography>
        </Box>
      </Popover>

      <Divider />

      <Box my={3} sx={{ display: "flex", justifyContent: "space-between" }}>
        <FormControlLabel
          control={
            <MaterialUISwitch
              onChange={() => props.changeMode()}
              sx={{ m: 1 }}
              checked={props.darkMode}
            />
          }
          label="Theme"
        />

        {props.handleFullScreen.active ? (
          <IconButton
            color="primary"
            onClick={() => props.handleFullScreen.exit()}
          >
            <CloseFullscreenIcon sx={{ fontSize: 25 }} />
          </IconButton>
        ) : (
          <IconButton
            color="primary"
            onClick={() => props.handleFullScreen.enter()}
          >
            <OpenInFullIcon sx={{ fontSize: 25 }} />
          </IconButton>
        )}
      </Box>
    </Drawer>
  );
}

export default DrawerSetting;
