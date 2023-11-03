import { useRouter } from "next/router";
import axios from "axios";
import { toast } from "react-toastify";
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
// ICONS
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import EditIcon from "@mui/icons-material/Edit";
//Component
import WaitLoadingComponent from "components/WaitLoadingComponent";

function DipDetail() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { id } = router.query;

  const domain =
    process.env.NODE_ENV === "development"
      ? "http://localhost:3000/api/services/file/public/dip/"
      : process.env.NEXT_PUBLIC_HOST + "/api/services/file/public/dip/";

  const {
    data: dip,
    isLoading,
    isError,
    error,
  } = useQuery({
    enabled: !!id,
    queryKey: ["dip", id],
    queryFn: ({ signal }) =>
      axios
        .get(`/api/dip/${id}`, { signal })
        .then((res) => res.data)
        .catch((err) => {
          throw new Error(err.response.data.message);
        }),
  });

  const handleDelete = () => {
    const ask = confirm("Yakin Hapus Data?");
    if (ask) {
      const toastProses = toast.loading("Tunggu Sebentar...", {
        autoClose: false,
      });
      axios
        .delete(`/api/dip/` + id)
        .then((res) => {
          toast.update(toastProses, {
            render: res.data.message,
            type: "success",
            isLoading: false,
            autoClose: 2000,
          });
          queryClient.invalidateQueries(["dips"]);
          router.push("/admin/dip");
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
  };

  const actions = [
    {
      icon: <EditIcon />,
      name: "Edit",
      action: () => router.push("/admin/dip/" + dip.id + "/edit"),
    },
    { icon: <DeleteIcon />, name: "Hapus", action: handleDelete },
  ];

  if (isError) {
    toast.error(error.message);
    setTimeout(() => router.push("/admin/dip"), 1000);
    return <></>;
  }
  if (isLoading) return <WaitLoadingComponent loading={isLoading} />;

  return (
    <Card>
      <Typography
        variant="h5"
        component="div"
        gutterBottom
        sx={{ bgcolor: "background.paper", p: 2 }}
      >
        DETAIL DAFTAR INFORMASI PUBLIK
      </Typography>
      <CardContent>
        <Grid container>
          <Grid item xs={4}>
            Bawaslu
          </Grid>
          <Grid item xs={8}>
            : {dip.nama_bawaslu}
          </Grid>

          <Grid item xs={4}>
            Sifat
          </Grid>
          <Grid item xs={8}>
            : {dip.sifat}
          </Grid>

          <Grid item xs={4}>
            Jenis Informasi
          </Grid>
          <Grid item xs={8}>
            : {dip.jenis_informasi}
          </Grid>

          <Grid item xs={4}>
            Ringkasan
          </Grid>
          <Grid item xs={8}>
            : {dip.ringkasan}
          </Grid>

          <Grid item xs={4}>
            Tahun Pembuatan
          </Grid>
          <Grid item xs={8}>
            : {dip.tahun_pembuatan}
          </Grid>

          <Grid item xs={4}>
            Penanggung Jawab
          </Grid>
          <Grid item xs={8}>
            : {dip.penanggung_jawab}
          </Grid>

          <Grid item xs={4}>
            Bentuk Informasi
          </Grid>
          <Grid item xs={8}>
            : {dip.bentuk_informasi}
          </Grid>

          <Grid item xs={4}>
            File Informasi
          </Grid>
          <Grid item xs={8}>
            :{" "}
            {dip.file ? (
              <a
                target="_blank"
                rel="noreferrer"
                href={`${domain}/${dip.bawaslu_id}/${dip.file}`}
              >
                {dip.file}
              </a>
            ) : (
              "-"
            )}
          </Grid>

          <Grid item xs={4}>
            Link File
          </Grid>
          <Grid item xs={8}>
            :{" "}
            {dip.link ? (
              <a target="_blank" rel="noreferrer" href={dip.link}>
                {dip.link}
              </a>
            ) : (
              "-"
            )}
          </Grid>
        </Grid>
      </CardContent>
      <Box p={2}>
        <Typography variant="caption">
          Dibuat :{" "}
          {dip.created_at &&
            new Date(dip.created_at).toISOString().split("T")[0]}
        </Typography>
        <Box sx={{ transform: "translateZ(0px)", flexGrow: 1 }}>
          <SpeedDial
            ariaLabel="SpeedDial basic example"
            sx={{ position: "absolute", bottom: 0, right: 0 }}
            icon={<SpeedDialIcon />}
          >
            {actions.map((action) => (
              <SpeedDialAction
                key={action.name}
                icon={action.icon}
                tooltipTitle={action.name}
                onClick={action.action}
              />
            ))}
          </SpeedDial>
        </Box>
      </Box>
    </Card>
  );
}

DipDetail.auth = true;
DipDetail.breadcrumb = [
  {
    path: "/admin",
    title: "Home",
  },
  {
    path: "/admin/dip",
    title: "Daftar Informasi Publik",
  },
  {
    path: "/admin/dip/detail",
    title: "Detail",
  },
];
export default DipDetail;
