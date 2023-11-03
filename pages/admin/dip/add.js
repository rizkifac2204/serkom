import axios from "axios";
import { toast } from "react-toastify";
import { useFormik } from "formik";
import * as yup from "yup";
import { useState, useContext } from "react";
import { useQueryClient } from "@tanstack/react-query";
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
// ICONS
import AddTaskIcon from "@mui/icons-material/AddTask";

import AuthContext from "context/AuthContext";

const handleSubmit = (values, setSubmitting, path, queryClient) => {
  const form = new FormData();
  for (var key in values) {
    // if (key === "file") {
    //   form.append(key, values[key], values[key].name);
    // } else {
    form.append(key, values[key]);
    // }
  }
  // Display the key/value pairs
  // for (var pair of form.entries()) {
  //   console.log(pair[0] + ", " + pair[1]);
  // }
  const toastProses = toast.loading("Tunggu Sebentar...", { autoClose: false });
  axios
    .post(`/api/dip/add`, form, {
      headers: {
        "content-type": "multipart/form-data",
        destinationfile: path,
      },
    })
    .then((res) => {
      queryClient.invalidateQueries(["dips"]);
      toast.update(toastProses, {
        render: res.data.message,
        type: "success",
        isLoading: false,
        autoClose: 2000,
      });
    })
    .catch((err) => {
      toast.update(toastProses, {
        render: err.response.data.message,
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
  sifat: yup.string().required("Harus Diisi"),
  jenis_informasi: yup.string().required("Harus Diisi"),
  ringkasan: yup.string().required("Harus Diisi"),
  tahun_pembuatan: yup.number().required("Harus Diisi"),
  penanggung_jawab: yup.string().required("Harus Diisi"),
  bentuk_informasi: yup.string().required("Harus Diisi"),
  link: yup.string().url("Masukan Link atau URL yang valid"),
  file: yup.mixed().test(
    "FILE_SIZE",
    "Ukuran File Tidak Boleh Melebihi 10mb.",
    (value) => !value || (value && value.size <= 10485760) // 10 mb
  ),
});

function DipAdd() {
  const queryClient = useQueryClient();
  const { user } = useContext(AuthContext);
  const [initialValues, setInitialValues] = useState({
    sifat: "",
    jenis_informasi: "",
    ringkasan: "",
    tahun_pembuatan: "",
    penanggung_jawab: "",
    bentuk_informasi: "",
    link: "",
  });

  const formik = useFormik({
    initialValues: initialValues,
    validationSchema: validationSchema,
    enableReinitialize: true,
    onSubmit: (values, { setSubmitting }) =>
      handleSubmit(
        values,
        setSubmitting,
        `dip/${user.bawaslu_id}`,
        queryClient
      ),
  });

  return (
    <Card>
      <CardContent>
        <Typography sx={{ fontSize: 14 }} gutterBottom>
          Tambah Daftar Informasi Publik
        </Typography>
        <Box>
          <form onSubmit={formik.handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <FormControl
                  fullWidth
                  sx={{ mt: 2.6 }}
                  error={formik.touched.sifat && Boolean(formik.errors.sifat)}
                >
                  <InputLabel>Sifat *</InputLabel>
                  <Select
                    name="sifat"
                    label="Sifat *"
                    value={formik.values.sifat}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  >
                    <MenuItem value="">Pilih</MenuItem>
                    <MenuItem value="Berkala">Berkala</MenuItem>
                    <MenuItem value="Serta Merta">Serta Merta</MenuItem>
                    <MenuItem value="Setiap Saat">Setiap Saat</MenuItem>
                    <MenuItem value="Dikecualikan">Dikecualikan</MenuItem>
                  </Select>
                  <FormHelperText>
                    {formik.touched.sifat && formik.errors.sifat}
                  </FormHelperText>
                </FormControl>

                <FormControl
                  fullWidth
                  sx={{ mt: 2.6, mb: 0.8 }}
                  error={
                    formik.touched.jenis_informasi &&
                    Boolean(formik.errors.jenis_informasi)
                  }
                >
                  <InputLabel>Jenis Informasi *</InputLabel>
                  <Select
                    name="jenis_informasi"
                    label="Jenis Informasi *"
                    value={formik.values.jenis_informasi}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  >
                    <MenuItem value="">Pilih</MenuItem>
                    <MenuItem value="Kelembagaan">Kelembagaan</MenuItem>
                    <MenuItem value="Informasi Pemilu">
                      Informasi Pemilu
                    </MenuItem>
                  </Select>
                  <FormHelperText>
                    {formik.touched.jenis_informasi &&
                      formik.errors.jenis_informasi}
                  </FormHelperText>
                </FormControl>

                <TextField
                  fullWidth
                  required
                  margin="normal"
                  label="Ringkasan Isi Informasi"
                  name="ringkasan"
                  value={formik.values.ringkasan}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.ringkasan && Boolean(formik.errors.ringkasan)
                  }
                  helperText={
                    formik.touched.ringkasan && formik.errors.ringkasan
                  }
                />

                <TextField
                  fullWidth
                  required
                  type="number"
                  margin="normal"
                  label="Tahun Pembuatan Informasi"
                  name="tahun_pembuatan"
                  value={formik.values.tahun_pembuatan}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.tahun_pembuatan &&
                    Boolean(formik.errors.tahun_pembuatan)
                  }
                  helperText={
                    formik.touched.tahun_pembuatan &&
                    formik.errors.tahun_pembuatan
                  }
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl
                  fullWidth
                  sx={{ mt: 2 }}
                  error={
                    formik.touched.bentuk_informasi &&
                    Boolean(formik.errors.bentuk_informasi)
                  }
                >
                  <InputLabel>Bentuk Informasi *</InputLabel>
                  <Select
                    name="bentuk_informasi"
                    label="Bentuk Informasi *"
                    value={formik.values.bentuk_informasi}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  >
                    <MenuItem value="">Pilih</MenuItem>
                    <MenuItem value="Soft copy">Soft copy</MenuItem>
                    <MenuItem value="Hard copy">Hard copy</MenuItem>
                  </Select>
                  <FormHelperText>
                    {formik.touched.bentuk_informasi &&
                      formik.errors.bentuk_informasi}
                  </FormHelperText>
                </FormControl>

                <TextField
                  fullWidth
                  required
                  margin="normal"
                  label="Unit Yang Bertanggung Jawab Atas Informasi"
                  name="penanggung_jawab"
                  value={formik.values.penanggung_jawab}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.penanggung_jawab &&
                    Boolean(formik.errors.penanggung_jawab)
                  }
                  helperText={
                    formik.touched.penanggung_jawab &&
                    formik.errors.penanggung_jawab
                  }
                />

                <TextField
                  fullWidth
                  type="file"
                  id="file"
                  margin="normal"
                  label="Upload File"
                  name="file"
                  InputLabelProps={{ shrink: true }}
                  onBlur={formik.handleBlur}
                  onChange={(event) => {
                    formik.setFieldValue("file", event.currentTarget.files[0]);
                  }}
                  error={Boolean(formik.errors.file)}
                  helperText={formik.errors.file}
                />

                <TextField
                  fullWidth
                  margin="normal"
                  label="URL File"
                  name="link"
                  value={formik.values.link}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.link && Boolean(formik.errors.link)}
                  helperText={formik.touched.link && formik.errors.link}
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

DipAdd.auth = true;
DipAdd.breadcrumb = [
  {
    path: "/admin",
    title: "Home",
  },
  {
    path: "/admin/dip",
    title: "Daftar Informasi Publik",
  },
  {
    path: "/admin/dip/add",
    title: "Tambah DIP",
  },
];
export default DipAdd;
