import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import axios from "axios";
import Image from "next/image";
import { toast } from "react-toastify";
import DOMPurify from "isomorphic-dompurify";
import { useQuery, useQueryClient } from "@tanstack/react-query";
// MUI
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Avatar from "@mui/material/Avatar";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Tooltip from "@mui/material/Tooltip";
import Box from "@mui/material/Box";
import SpeedDial from "@mui/material/SpeedDial";
import SpeedDialIcon from "@mui/material/SpeedDialIcon";
import SpeedDialAction from "@mui/material/SpeedDialAction";
// ICON
import VisibilityIcon from "@mui/icons-material/Visibility";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
// Component
import WaitLoadingComponent from "components/WaitLoadingComponent";
import { FormatedDate } from "components/Attributes";

function EmailDetail() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { id } = router.query;
  const [list, setList] = useState("");

  const {
    data: email,
    isLoading,
    isError,
    error,
  } = useQuery({
    enabled: !!id,
    queryKey: ["email", id],
    queryFn: ({ signal }) =>
      axios
        .get(`/api/subscriber/email/${id}`, { signal })
        .then((res) => res.data)
        .catch((err) => {
          throw new Error(err.response.data.message);
        }),
  });

  useEffect(() => {
    if (!email?.listPenerima) return;
    const penerima = email.listPenerima.map((item) => {
      return item.email_subscriber;
    });
    const text = penerima.join(", ");
    setList(text);
  }, [email]);

  const handleDelete = () => {
    const ask = confirm("Yakin Hapus Data?");
    if (ask) {
      const toastProses = toast.loading("Tunggu Sebentar...", {
        autoClose: false,
      });
      axios
        .delete(`/api/subscriber/email/${id}`)
        .then((res) => {
          queryClient.invalidateQueries(["emails"]);
          toast.update(toastProses, {
            render: res.data.message,
            type: "success",
            isLoading: false,
            autoClose: 2000,
          });
          router.push("/admin/subscriber/email");
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
    { icon: <DeleteIcon />, name: "Hapus", action: handleDelete },
  ];

  if (isError) {
    toast.error(error.message);
    setTimeout(() => router.push("/admin/subscriber/email"), 1000);
    return <></>;
  }
  if (isLoading) return <WaitLoadingComponent loading={isLoading} />;

  return (
    <Card>
      <CardContent>
        <Grid container>
          <Grid item>
            <Avatar sx={{ m: 1, bgcolor: "white" }} src="/images/logo.png" />
          </Grid>
          <Grid item>
            <Typography variant="h4">{email.subjek}</Typography>
            <Accordion>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1a-content"
                id="panel1a-header"
              >
                <Typography variant="caption">PPID</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <TableContainer component={Paper}>
                  <Table sx={{}} aria-label="simple table">
                    <TableBody>
                      <TableRow>
                        <TableCell>Dari</TableCell>
                        <TableCell>: PPID Bawaslu</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Pengirim</TableCell>
                        <TableCell>: {email.nama_bawaslu}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Status</TableCell>
                        <TableCell>
                          : {Boolean(email.status) ? "Terkirim" : "Draft"}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Tanggal</TableCell>
                        <TableCell>
                          :{" "}
                          {email.sended_at ? (
                            <FormatedDate tanggal={email.sended_at} />
                          ) : (
                            "-"
                          )}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Subjek</TableCell>
                        <TableCell>: {email.subjek}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Penerima</TableCell>
                        {email.penerima === "All" ? (
                          <TableCell>: Semua Subscriber</TableCell>
                        ) : (
                          <TableCell>
                            :
                            <Tooltip title={list}>
                              <VisibilityIcon fontSize="small" />
                            </Tooltip>
                          </TableCell>
                        )}
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </AccordionDetails>
            </Accordion>

            <div
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(email.isi),
              }}
            ></div>
          </Grid>
        </Grid>
      </CardContent>
      <Box p={2}>
        <Typography variant="caption">
          Dibuat :{" "}
          {email.created_at &&
            new Date(email.created_at).toISOString().split("T")[0]}
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

EmailDetail.auth = true;
EmailDetail.breadcrumb = [
  {
    path: "/admin",
    title: "Home",
  },
  {
    path: "/admin/subscriber",
    title: "Subscriber",
  },
  {
    path: "/admin/subscriber/email",
    title: "Email",
  },
  {
    path: "/admin/subscriber/email",
    title: "Detail",
  },
];
export default EmailDetail;
