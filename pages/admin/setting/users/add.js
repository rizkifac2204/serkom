import axios from "axios";
import { toast } from "react-toastify";
import { useFormik } from "formik";
import * as yup from "yup";
import { useEffect, useState, useContext } from "react";
import AuthContext from "context/AuthContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
// MUI
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import FormHelperText from "@mui/material/FormHelperText";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import InputLabel from "@mui/material/InputLabel";
import LinearProgress from "@mui/material/LinearProgress";
// ICONS
import AddTaskIcon from "@mui/icons-material/AddTask";

const handleSubmit = (values, setSubmitting, queryClient) => {
  const toastProses = toast.loading("Tunggu Sebentar...", { autoClose: false });
  axios
    .post(`/api/setting/users`, values)
    .then((res) => {
      queryClient.invalidateQueries(["users"]);
      toast.update(toastProses, {
        render: res.data.message,
        type: "success",
        isLoading: false,
        autoClose: 2000,
      });
    })
    .catch((err) => {
      console.log(err.response);
      let tempMassage = "Gagal Proses";
      if (err.response.status == 404) {
        tempMassage =
          "Mohon Maaf, Hilangkan atau ganti spesial karakter pada inputan anda";
      }
      const msg = err.response.data.message
        ? err.response.data.message
        : tempMassage;
      toast.update(toastProses, {
        render: msg,
        type: "error",
        isLoading: false,
        autoClose: 2000,
      });
    })
    .then(() => {
      setSubmitting(false);
    });
};

const validationSchema = yup.object({
  level_bawaslu: yup.number().required("Harus Diisi"),
  nama_admin: yup.string().required("Harus Diisi"),
  provinsi_id: yup.number().when("level_bawaslu", {
    is: (level_bawaslu) => level_bawaslu > 1,
    then: yup.number().required("Harus diisi"),
    otherwise: yup.number(),
  }),
  kabkota_id: yup.number().when("level_bawaslu", {
    is: (level_bawaslu) => level_bawaslu > 2,
    then: yup.number().required("Harus diisi"),
    otherwise: yup.number(),
  }),
  username: yup.string().required("Harus Diisi"),
  password: yup.string().required("Password Harus Diisi"),
  passwordConfirm: yup
    .string()
    .required("Konfirmasi Password Harus Diisi")
    .oneOf([yup.ref("password"), null], "Passwords Tidak Sama"),
});

function UsersAdd() {
  const queryClient = useQueryClient();
  const { user: session } = useContext(AuthContext);

  const [provinsis, setProvinsis] = useState([]);
  const [kabkotas, setKabkotas] = useState([]);

  const { data: levels, isLoading: isLoadingLevels } = useQuery({
    queryKey: ["services", "levels"],
    queryFn: ({ signal }) =>
      axios
        .get(`/api/services/levels`, { signal })
        .then((res) => res.data)
        .catch((err) => {
          throw new Error(err.response.data.message);
        }),
  });

  const fetchProv = () => {
    axios
      .get(`/api/services/provinsis`)
      .then((res) => {
        const prov = res.data.filter((item) => {
          if (session.level !== 1) return item.id === session.bawaslu_id;
          return item;
        });
        setProvinsis(() => prov);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const fetchKabkota = (id) => {
    axios
      .get(`/api/services/provinsis/` + id)
      .then((res) => {
        setKabkotas(res.data.kabkota);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const formik = useFormik({
    initialValues: {
      level_bawaslu: "",
      nama_admin: "",
      telp_admin: "",
      email_admin: "",
      alamat_admin: "",
      provinsi_id: "",
      kabkota_id: "",
      username: "",
      password: "",
      passwordConfirm: "",
    },
    validationSchema: validationSchema,
    enableReinitialize: true,
    onSubmit: (values, { setSubmitting }) =>
      handleSubmit(values, setSubmitting, queryClient),
  });

  useEffect(() => {
    if (!formik.values.level_bawaslu) return;
    formik.setFieldValue("provinsi_id", "");
    formik.setFieldValue("kabkota_id", "");
    if (formik.values.level_bawaslu > 1 && provinsis.length === 0) fetchProv();
  }, [formik.values.level_bawaslu]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    formik.setFieldValue("kabkota_id", "");
    if (!formik.values.provinsi_id) return;
    if (formik.values.level_bawaslu === 3)
      fetchKabkota(formik.values.provinsi_id);
  }, [formik.values.provinsi_id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!session) return <LinearProgress />;
  return (
    <Card>
      <CardContent>
        <Typography sx={{ fontSize: 14 }} gutterBottom>
          Tambah User Baru
        </Typography>

        <Box>
          <form onSubmit={formik.handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <FormControl
                  fullWidth
                  sx={{ mt: 2 }}
                  error={
                    formik.touched.level_bawaslu &&
                    Boolean(formik.errors.level_bawaslu)
                  }
                >
                  <InputLabel>Level *</InputLabel>
                  <Select
                    name="level_bawaslu"
                    label="Level *"
                    value={formik.values.level_bawaslu}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  >
                    <MenuItem value="">Pilih</MenuItem>
                    {levels &&
                      levels.length !== 0 &&
                      levels
                        .filter((item) => {
                          if (session.level === 3) return;
                          if (session.level === 2) return item.id === 3;
                          return item.id > session.level;
                        })
                        .map((item) => {
                          return (
                            <MenuItem key={item.id} value={item.id}>
                              {item.level}
                            </MenuItem>
                          );
                        })}
                  </Select>
                  <FormHelperText>
                    {formik.touched.level_bawaslu &&
                      formik.errors.level_bawaslu}
                  </FormHelperText>
                </FormControl>

                <TextField
                  fullWidth
                  required
                  margin="normal"
                  label="Nama"
                  name="nama_admin"
                  value={formik.values.nama_admin}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.nama_admin &&
                    Boolean(formik.errors.nama_admin)
                  }
                  helperText={
                    formik.touched.nama_admin && formik.errors.nama_admin
                  }
                />
                <TextField
                  fullWidth
                  margin="normal"
                  label="Telp/HP"
                  name="telp_admin"
                  value={formik.values.telp_admin}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.telp_admin &&
                    Boolean(formik.errors.telp_admin)
                  }
                  helperText={
                    formik.touched.telp_admin && formik.errors.telp_admin
                  }
                />
                <TextField
                  fullWidth
                  type="email"
                  margin="normal"
                  label="Email"
                  name="email_admin"
                  value={formik.values.email_admin}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.email_admin &&
                    Boolean(formik.errors.email_admin)
                  }
                  helperText={
                    formik.touched.email_admin && formik.errors.email_admin
                  }
                />
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  margin="normal"
                  label="Alamat"
                  name="alamat_admin"
                  value={formik.values.alamat_admin}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.alamat_admin &&
                    Boolean(formik.errors.alamat_admin)
                  }
                  helperText={
                    formik.touched.alamat_admin && formik.errors.alamat_admin
                  }
                />
              </Grid>

              <Grid item xs={12} md={6}>
                {formik.values.level_bawaslu > 1 && (
                  <FormControl
                    fullWidth
                    sx={{ mt: 2 }}
                    error={
                      formik.touched.provinsi_id &&
                      Boolean(formik.errors.provinsi_id)
                    }
                  >
                    <InputLabel>Provinsi *</InputLabel>
                    <Select
                      name="provinsi_id"
                      label="Provinsi *"
                      value={formik.values.provinsi_id}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    >
                      <MenuItem value="">--Pilih--</MenuItem>
                      {provinsis.length !== 0 &&
                        provinsis.map((item, idx) => (
                          <MenuItem key={idx} value={item.id}>
                            {item.provinsi}
                          </MenuItem>
                        ))}
                    </Select>
                    <FormHelperText>
                      {formik.touched.provinsi_id && formik.errors.provinsi_id}
                    </FormHelperText>
                  </FormControl>
                )}

                {formik.values.level_bawaslu === 3 && (
                  <FormControl
                    fullWidth
                    sx={{ mt: 2 }}
                    error={
                      formik.touched.kabkota_id &&
                      Boolean(formik.errors.kabkota_id)
                    }
                  >
                    <InputLabel>Kabupaten/Kota *</InputLabel>
                    <Select
                      name="kabkota_id"
                      label="Kabupaten/Kota *"
                      value={formik.values.kabkota_id}
                      onChange={formik.handleChange}
                    >
                      {kabkotas.length !== 0 &&
                        kabkotas.map((item) => (
                          <MenuItem key={item.id} value={item.id}>
                            {item.kabkota}
                          </MenuItem>
                        ))}
                    </Select>
                    <FormHelperText>
                      {formik.touched.kabkota_id && formik.errors.kabkota_id}
                    </FormHelperText>
                  </FormControl>
                )}

                <TextField
                  fullWidth
                  required
                  margin="normal"
                  label="Username"
                  name="username"
                  value={formik.values.username}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.username && Boolean(formik.errors.username)
                  }
                  helperText={formik.touched.username && formik.errors.username}
                />

                <TextField
                  fullWidth
                  margin="normal"
                  required
                  type="password"
                  label="Password"
                  name="password"
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.password && Boolean(formik.errors.password)
                  }
                  helperText={formik.touched.password && formik.errors.password}
                />

                <TextField
                  fullWidth
                  margin="normal"
                  required
                  type="password"
                  label="Konfirmasi Password"
                  name="passwordConfirm"
                  value={formik.values.passwordConfirm}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.passwordConfirm &&
                    Boolean(formik.errors.passwordConfirm)
                  }
                  helperText={
                    formik.touched.passwordConfirm &&
                    formik.errors.passwordConfirm
                  }
                />
              </Grid>

              <Grid item>
                <Button
                  disabled={formik.isSubmitting}
                  type="submit"
                  variant="contained"
                  endIcon={<AddTaskIcon />}
                >
                  Simpan
                </Button>
              </Grid>
            </Grid>
          </form>
        </Box>
      </CardContent>
    </Card>
  );
}

UsersAdd.auth = true;
UsersAdd.breadcrumb = [
  {
    path: "/admin",
    title: "Home",
  },
  {
    path: "/admin/setting/users",
    title: "Users",
  },
  {
    path: "/admin/setting/users/add",
    title: "Tambah Users",
  },
];
export default UsersAdd;
