import { useState } from "react";
import axios from "axios";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
// MUI
import LinearProgress from "@mui/material/LinearProgress";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import CardActions from "@mui/material/CardActions";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Grid from "@mui/material/Grid";
// ICON
import PeopleIcon from "@mui/icons-material/People";
import PanToolIcon from "@mui/icons-material/PanTool";
import DynamicFormIcon from "@mui/icons-material/DynamicForm";
import WifiIcon from "@mui/icons-material/Wifi";
import SettingsSuggestIcon from "@mui/icons-material/SettingsSuggest";
import DataSaverOnIcon from "@mui/icons-material/DataSaverOn";

// Components
import {
  DashboardCollapse,
  TableBelumRespon,
} from "components/Dashboard/DashboardComponent";
import AlertInfo from "components/Dashboard/AlertInfo";

const ExpandMore = styled((props) => {
  const { expand, ...other } = props;
  return <IconButton {...other} />;
})(({ theme, expand }) => ({
  transform: !expand ? "rotate(0deg)" : "rotate(180deg)",
  marginLeft: "auto",
  transition: theme.transitions.create("transform", {
    duration: theme.transitions.duration.shortest,
  }),
}));

function Index() {
  const [expandedOnline, setExpandedOnline] = useState(false);
  const [expandedOffline, setExpandedOffline] = useState(false);

  const handleExpandOnlineClick = () => {
    setExpandedOnline(!expandedOnline);
  };
  const handleExpandOfflineClick = () => {
    setExpandedOffline(!expandedOffline);
  };

  const { data: main, isFetching: isFetchingMain } = useQuery({
    queryKey: ["dashboard", "main"],
    queryFn: ({ signal }) =>
      axios
        .get(`/api/dashboard/main`, { signal })
        .then((res) => res.data)
        .catch((err) => {
          throw new Error(err.response.data.message);
        }),
  });

  const { data: status, isFetching: isFetchingStatus } = useQuery({
    queryKey: ["dashboard", "status"],
    queryFn: ({ signal }) =>
      axios
        .get(`/api/dashboard/status`, { signal })
        .then((res) => res.data)
        .catch((err) => {
          throw new Error(err.response.data.message);
        }),
  });

  const { data: unresponse, isFetching: isFetchingUnresponse } = useQuery({
    queryKey: ["dashboard", "unresponse"],
    queryFn: ({ signal }) =>
      axios
        .get(`/api/dashboard/belumRespon`, { signal })
        .then((res) => res.data)
        .catch((err) => {
          throw new Error(err.response.data.message);
        }),
  });

  return (
    <>
      {isFetchingMain || isFetchingStatus || isFetchingUnresponse ? (
        <LinearProgress />
      ) : null}

      <Grid container spacing={2}>
        <Grid item xs={12}>
          <AlertInfo />
        </Grid>

        <Grid item xs={12} sm={6} md={4} lg={3}>
          <Card
            sx={{
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <Box>
              <CardContent>
                <Typography component="div" variant="h5">
                  {main?.jumlahUser}
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                  Pengguna
                </Typography>
              </CardContent>
              <CardActions>
                <Link href="/admin/setting/users">
                  <SettingsSuggestIcon
                    color="secondary"
                    sx={{ cursor: "pointer" }}
                  />
                </Link>
              </CardActions>
            </Box>
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                alignContent: "center",
              }}
            >
              <PeopleIcon color="info" sx={{ fontSize: 120 }} />
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4} lg={3}>
          <Card
            sx={{
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <Box>
              <CardContent>
                <Typography component="div" variant="h5">
                  {main?.jumlahDip}
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                  DIP
                </Typography>
              </CardContent>
              <CardActions>
                <Link href="/admin/dip">
                  <SettingsSuggestIcon
                    color="secondary"
                    sx={{ cursor: "pointer" }}
                  />
                </Link>
              </CardActions>
            </Box>
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                alignContent: "center",
              }}
            >
              <DataSaverOnIcon color="primary" sx={{ fontSize: 120 }} />
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4} lg={3}>
          <Card
            sx={{
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <Box>
              <CardContent>
                <Typography component="div" variant="h5">
                  {main?.jumlahSurvey}
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                  Survey
                </Typography>
              </CardContent>
              <CardActions>
                <Link href="/admin/survey">
                  <SettingsSuggestIcon
                    color="secondary"
                    sx={{ cursor: "pointer" }}
                  />
                </Link>
              </CardActions>
            </Box>
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                alignContent: "center",
              }}
            >
              <DynamicFormIcon color="warning" sx={{ fontSize: 120 }} />
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4} lg={3}>
          <Card
            sx={{
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <Box>
              <CardContent>
                <Typography component="div" variant="h5">
                  {main?.jumlahKeberatan}
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                  Keberatan
                </Typography>
              </CardContent>
              <CardActions>
                <Link href="/admin/keberatan">
                  <SettingsSuggestIcon
                    color="secondary"
                    sx={{ cursor: "pointer" }}
                  />
                </Link>
              </CardActions>
            </Box>
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                alignContent: "center",
              }}
            >
              <PanToolIcon color="error" sx={{ fontSize: 120 }} />
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card
            sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
          >
            <Box>
              <CardContent>
                <Typography component="div" variant="h5">
                  {main?.jumlahPermohonan}
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                  Permohonan
                </Typography>
              </CardContent>
              <CardActions disableSpacing>
                <Link href="/admin/permohonan">
                  <SettingsSuggestIcon
                    color="secondary"
                    sx={{ cursor: "pointer" }}
                  />
                </Link>
                <ExpandMore
                  expand={expandedOnline}
                  onClick={handleExpandOnlineClick}
                  aria-expanded={expandedOnline}
                  aria-label="show more"
                >
                  <ExpandMoreIcon />
                </ExpandMore>
              </CardActions>
            </Box>
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                alignContent: "center",
              }}
            >
              <WifiIcon color="success" sx={{ fontSize: 120 }} />
            </Box>
          </Card>
          <DashboardCollapse
            expanded={expandedOnline}
            arr={status?.result}
            jumlah={main?.jumlahPermohonan}
          />
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography
                sx={{ fontSize: 14 }}
                color="text.secondary"
                gutterBottom
              >
                Bawaslu Dengan Jumlah Permohonan Proses Terbanyak
              </Typography>
              <TableBelumRespon arr={unresponse ? unresponse : []} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </>
  );
}

Index.auth = true;
Index.breadcrumb = [
  {
    path: "/admin",
    title: "Home",
  },
];
export default Index;
