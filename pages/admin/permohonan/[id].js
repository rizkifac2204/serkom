import { useRouter } from "next/router";
import { useState, useRef } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useReactToPrint } from "react-to-print";
import { useQuery, useQueryClient } from "@tanstack/react-query";
// MUI
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import SpeedDial from "@mui/material/SpeedDial";
import SpeedDialIcon from "@mui/material/SpeedDialIcon";
import SpeedDialAction from "@mui/material/SpeedDialAction";
import LinearProgress from "@mui/material/LinearProgress";
// ICONS
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import PrintIcon from "@mui/icons-material/Print";
import LocalLibraryIcon from "@mui/icons-material/LocalLibrary";
import FileCopyIcon from "@mui/icons-material/FileCopy";
//Component
import WaitLoadingComponent from "components/WaitLoadingComponent";
import { FormatedDate, WithDynamicImage } from "components/Attributes";
import DataPermohonan from "components/PrintPage/DataPermohonan";
import BuktiPermohonan from "components/PrintPage/BuktiPermohonan";
import ResponseDialog from "components/Permohonan/ResponseDialog";
import ResponseCard from "components/Permohonan/ResponseCard";

function PermohonanDetail() {
  const router = useRouter();
  const { id } = router.query;
  const queryClient = useQueryClient();
  const [openResponse, setOpenResponse] = useState(false);
  const [profileBawaslu, setProfileBawaslu] = useState({});

  const printRef = useRef();
  const printBuktiRef = useRef();

  const {
    data: permohonan,
    isLoading,
    isError,
    error,
  } = useQuery({
    enabled: !!id,
    queryKey: ["permohonan", id],
    queryFn: ({ signal }) =>
      axios
        .get(`/api/permohonan/${id}`, { signal })
        .then((res) => res.data)
        .catch((err) => {
          throw new Error(err.response.data.message);
        }),
  });

  const {
    data: responses,
    isLoading: isLoadingResponses,
    isFetching: isFetchingResponses,
  } = useQuery({
    enabled: !!id,
    queryKey: ["permohonan", id, "responses"],
    queryFn: ({ signal }) =>
      axios
        .get(`/api/permohonan/${id}/responses`, { signal })
        .then((res) => res.data)
        .catch((err) => {
          throw new Error(err.response.data.message);
        }),
  });

  // ACTION NORMAL
  function handleDelete() {
    const ask = confirm("Yakin Hapus Data?");
    if (ask) {
      const toastProses = toast.loading("Tunggu Sebentar...", {
        autoClose: false,
      });
      axios
        .delete(`/api/permohonan/` + id)
        .then((res) => {
          toast.update(toastProses, {
            render: res.data.message,
            type: "success",
            isLoading: false,
            autoClose: 2000,
          });
          queryClient.invalidateQueries(["permohonans"]);
          router.push("/admin/permohonan");
        })
        .catch((err) => {
          toast.update(toastProses, {
            render: err.response.data.message,
            type: "error",
            isLoading: false,
            autoClose: 2000,
          });
        });
    }
  }
  function fetchProfileBawaslu(callback) {
    const toastProses = toast.loading("Menyiapkan Format...");
    axios
      .get(`/api/services/profileBawaslu?id=` + permohonan.bawaslu_id)
      .then((res) => {
        setProfileBawaslu(res.data);
        toast.dismiss(toastProses);
        callback();
      })
      .catch((err) => {
        console.log(err);
        toast.update(toastProses, {
          render: "Terjadi Kesalahan",
          type: "error",
          isLoading: false,
          autoClose: 2000,
        });
      });
  }
  // PRINT
  const handlePrint = (param) => {
    const isNotReady = Object.keys(profileBawaslu).length === 0;
    if (isNotReady)
      return fetchProfileBawaslu(() => {
        param === "bukti" ? processPrintBukti() : processPrint();
      });
    param === "bukti" ? processPrintBukti() : processPrint();
  };
  const processPrint = useReactToPrint({
    content: () => printRef.current,
  });
  const processPrintBukti = useReactToPrint({
    content: () => printBuktiRef.current,
  });
  // RESPONSE
  function handleResponse() {
    setOpenResponse(true);
  }
  function handleCloseResponse() {
    setOpenResponse(false);
  }
  const actions = [
    { icon: <LocalLibraryIcon />, name: "Tanggapi", action: handleResponse },
    {
      icon: <FileCopyIcon />,
      name: "Print Bukti Permohonan",
      action: () => handlePrint("bukti"),
    },
    {
      icon: <PrintIcon />,
      name: "Print Data Permohonan",
      action: () => handlePrint("data"),
    },
    { icon: <DeleteIcon />, name: "Hapus", action: handleDelete },
  ];

  if (isError) {
    toast.error(error.message);
    setTimeout(() => router.push("/admin/permohonan"), 1000);
    return <></>;
  }
  if (isLoading) return <WaitLoadingComponent loading={isLoading} />;

  return (
    <>
      <Card sx={{ mb: 2 }}>
        <Typography
          variant="h5"
          component="div"
          gutterBottom
          sx={{ bgcolor: "background.paper", p: 2 }}
        >
          Detail Permohonan {permohonan.no_registrasi}
        </Typography>
        <CardContent>
          <Grid container spacing={2}>
            <Grid
              item
              xs={12}
              md={3}
              sx={{
                position: "relative",
                minHeight: 200,
              }}
            >
              <WithDynamicImage
                altText={permohonan.nama_pemohon}
                image={permohonan.identitas_pemohon}
              />
            </Grid>
            <Grid item xs={12} md={9}>
              <Grid container>
                <Grid item xs={4}>
                  Nomor Registrasi / Tiket
                </Grid>
                <Grid item xs={8}>
                  : {permohonan.no_registrasi} /{" "}
                  <Typography variant="caption" color="primary">
                    {permohonan.tiket}
                  </Typography>
                </Grid>

                <Grid item xs={4}>
                  Kepada
                </Grid>
                <Grid item xs={8}>
                  : {permohonan.nama_bawaslu}
                </Grid>

                <Grid item xs={4}>
                  Tanggal
                </Grid>
                <Grid item xs={8}>
                  : <FormatedDate tanggal={permohonan.tanggal_permohonan} />
                </Grid>

                <Grid item xs={4}>
                  Nama
                </Grid>
                <Grid item xs={8}>
                  : {permohonan.nama_pemohon}
                </Grid>

                <Grid item xs={4}>
                  Pekerjaan
                </Grid>
                <Grid item xs={8}>
                  : {permohonan.pekerjaan_pemohon}
                </Grid>

                <Grid item xs={4}>
                  Pendidikan
                </Grid>
                <Grid item xs={8}>
                  : {permohonan.pendidikan_pemohon}
                </Grid>

                <Grid item xs={4}>
                  Telp/Hp
                </Grid>
                <Grid item xs={8}>
                  : {permohonan.telp_pemohon}
                </Grid>

                <Grid item xs={4}>
                  Email
                </Grid>
                <Grid item xs={8}>
                  : {permohonan.email_pemohon}
                </Grid>

                <Grid item xs={4}>
                  Alamat
                </Grid>
                <Grid item xs={8}>
                  : {permohonan.alamat_pemohon}
                </Grid>

                <Grid item xs={4}>
                  Rincian Informasi
                </Grid>
                <Grid item xs={8}>
                  : {permohonan.rincian}
                </Grid>

                <Grid item xs={4}>
                  Tujuan Informasi
                </Grid>
                <Grid item xs={8}>
                  : {permohonan.tujuan}
                </Grid>

                <Grid item xs={4}>
                  Cara Terima Informasi
                </Grid>
                <Grid item xs={8}>
                  : {permohonan.cara_terima}
                </Grid>

                <Grid item xs={4}>
                  Cara Dapat Informasi
                </Grid>
                <Grid item xs={8}>
                  : {permohonan.cara_dapat}
                </Grid>

                <Grid item xs={4}>
                  Status Permohonan
                </Grid>
                <Grid item xs={8}>
                  : {permohonan.status_permohonan}
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </CardContent>
        <Box p={2}>
          <Typography variant="caption">
            Dibuat :{" "}
            {permohonan.created_at &&
              new Date(permohonan.created_at).toISOString().split("T")[0]}
          </Typography>

          <Box sx={{ transform: "translateZ(0px)", flexGrow: 1 }}>
            <SpeedDial
              ariaLabel="SpeedDial"
              sx={{ position: "absolute", bottom: 0, right: 0 }}
              icon={<SpeedDialIcon />}
            >
              {actions.map((action) => (
                <SpeedDialAction
                  key={action.name}
                  icon={action.icon}
                  tooltipTitle={action.name}
                  onClick={action.action}
                  FabProps={
                    {
                      // disabled: Boolean(
                      //   action.name === "Print Bukti Permohonan" &&
                      //     !permohonan.no_registrasi
                      // ),
                    }
                  }
                />
              ))}
            </SpeedDial>
          </Box>
        </Box>
      </Card>

      {(isLoadingResponses || isFetchingResponses) && <LinearProgress />}
      <Grid container spacing={2}>
        {responses &&
          responses.length !== 0 &&
          responses.map((respon) => (
            <ResponseCard
              key={respon.id}
              data={respon}
              invalidateQueries={() =>
                queryClient.invalidateQueries(["permohonan", id, "responses"])
              }
            />
          ))}
      </Grid>

      <ResponseDialog
        open={openResponse}
        onClose={handleCloseResponse}
        fullScreen={true}
        detail={permohonan}
        invalidateQueries={() => {
          queryClient.invalidateQueries(["permohonan", id, "responses"]);
          queryClient.invalidateQueries(["permohonan", id]);
        }}
      />

      <DataPermohonan
        ref={printRef}
        detail={permohonan}
        profileBawaslu={profileBawaslu}
      />
      <BuktiPermohonan
        ref={printBuktiRef}
        detail={permohonan}
        profileBawaslu={profileBawaslu}
      />
    </>
  );
}

PermohonanDetail.auth = true;
PermohonanDetail.breadcrumb = [
  {
    path: "/admin",
    title: "Home",
  },
  {
    path: "/admin/permohonan",
    title: "Permohonan",
  },
  {
    path: "/admin/permohonan",
    title: "Detail",
  },
];
export default PermohonanDetail;
