import axios from "axios";
import { toast } from "react-toastify";
import { useFormik } from "formik";
import * as yup from "yup";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
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
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
// ICONS
import EditIcon from "@mui/icons-material/Edit";

const handleSubmit = (values, setSubmitting, path, router) => {
  const form = new FormData();
  for (var key in values) {
    // if (key === "file") {
    //   form.append(key, values[key], values[key].name);
    // } else {
    form.append(key, values[key]);
    // }
  }
  const toastProses = toast.loading("Tunggu Sebentar...", { autoClose: false });
  axios
    .put(`/api/dip/add`, form, {
      headers: {
        "content-type": "multipart/form-data",
        destinationfile: path,
      },
    })
    .then((res) => {
      toast.update(toastProses, {
        render: res.data.message,
        type: "success",
        isLoading: false,
        autoClose: 2000,
      });
      setTimeout(() => {
        router.push(`/admin/dip/${values.id}`);
      }, 2000);
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
  ganti_file: yup.boolean("").required("Harus Dipilih"),
  nama_file: yup.string("").nullable(),
  id: yup.number().required("Harus Diisi"),
  sifat: yup.string().required("Harus Diisi"),
  jenis_informasi: yup.string().required("Harus Diisi"),
  ringkasan: yup.string().required("Harus Diisi"),
  tahun_pembuatan: yup.number().required("Harus Diisi"),
  penanggung_jawab: yup.string().required("Harus Diisi"),
  bentuk_informasi: yup.string().required("Harus Diisi"),
  link: yup.string().url("Masukan Link atau URL yang valid").nullable(),
  file: yup
    .mixed()
    .test(
      "FILE_SIZE",
      "Ukuran File Tidak Boleh Melebihi 10mb.",
      (value) => !value || (value && value.size <= 10485760) // 10 mb
    )
    .when(["nama_file", "ganti_file"], {
      is: (nama_file, ganti_file) => !nama_file || ganti_file,
      then: yup.mixed().required("Harus Upload Ulang"),
    }),
});

function DipEdit() {
  const router = useRouter();
  const { id } = router.query;
  const domain =
    process.env.NODE_ENV === "development"
      ? "http://localhost:3000/api/services/file/public/dip/"
      : process.env.NEXT_PUBLIC_HOST + "/api/services/file/public/dip/";
  const [bawasluId, setBawasluId] = useState(0);
  const [initialValues, setInitialValues] = useState({
    ganti_file: false,
    id: "",
    sifat: "",
    jenis_informasi: "",
    ringkasan: "",
    tahun_pembuatan: "",
    penanggung_jawab: "",
    bentuk_informasi: "",
    nama_file: "",
    link: "",
  });

  useEffect(() => {
    if (id) {
      const fetchDetail = () => {
        axios
          .get(`/api/dip/` + id)
          .then((res) => {
            const data = res.data;
            Object.assign(data, { nama_file: data.file })["file"];
            delete data["file"];
            setInitialValues((prev) => data);
            setBawasluId(res.data.bawaslu_id);
          })
          .catch((err) => {
            toast.error(err.response.data.message);
            setTimeout(() => router.push("/admin/dip"), 2000);
          });
      };
      fetchDetail();
    }
  }, [id, router]);

  const formik = useFormik({
    initialValues: {
      ...initialValues,
      ganti_file: false,
    },
    validationSchema: validationSchema,
    enableReinitialize: true,
    onSubmit: (values, { setSubmitting }) =>
      handleSubmit(values, setSubmitting, `dip/${bawasluId}`, router),
  });

  return (
    <Card>
      <CardContent>
        <Typography sx={{ fontSize: 14 }} gutterBottom>
          Edit Daftar Informasi Publik
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
                  label="Ringkasan Isi Materi"
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
                  label="Tahun Pembuatan"
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
                  margin="normal"
                  label="URL File"
                  name="link"
                  value={formik.values?.link || ""}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.link && Boolean(formik.errors.link)}
                  helperText={formik.touched.link && formik.errors.link}
                />

                <FormGroup>
                  <FormControlLabel
                    control={
                      <Checkbox
                        name="ganti_file"
                        checked={formik.values.ganti_file}
                        onChange={(e) => {
                          formik.setFieldValue("ganti_file", e.target.checked);
                        }}
                      />
                    }
                    label=" Upload Ulang"
                  />
                </FormGroup>

                <FormHelperText>{formik.errors.file}</FormHelperText>

                {formik.values.ganti_file ? (
                  <TextField
                    required={formik.values.ganti_file}
                    fullWidth
                    type="file"
                    id="file"
                    margin="normal"
                    label="Upload File"
                    name="file"
                    InputLabelProps={{ shrink: true }}
                    onBlur={formik.handleBlur}
                    onChange={(event) => {
                      formik.setFieldValue(
                        "file",
                        event.currentTarget.files[0]
                      );
                    }}
                    error={Boolean(formik.errors.file)}
                    helperText={formik.errors.file}
                  />
                ) : (
                  <>
                    file :
                    {formik.values.nama_file ? (
                      <a
                        target="_blank"
                        rel="noreferrer"
                        href={`${domain}/${bawasluId}/${formik.values.nama_file}`}
                      >
                        {formik.values.nama_file}
                      </a>
                    ) : (
                      "Tidak ada file"
                    )}
                  </>
                )}
              </Grid>

              <Grid item>
                <Button
                  disabled={formik.isSubmitting}
                  type="submit"
                  variant="contained"
                  endIcon={<EditIcon />}
                >
                  Update
                </Button>
              </Grid>
            </Grid>
          </form>
        </Box>
      </CardContent>
    </Card>
  );
}

DipEdit.auth = true;
DipEdit.breadcrumb = [
  {
    path: "/admin",
    title: "Home",
  },
  {
    path: "/admin/dip",
    title: "Daftar Informasi Publik",
  },
  {
    path: "/admin/dip/getID",
    title: "Detail",
  },
  {
    path: "/admin/dip",
    title: "Edit DIP",
  },
];
export default DipEdit;
