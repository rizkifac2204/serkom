import axios from "axios";
import { toast } from "react-toastify";
import { useFormik } from "formik";
import * as yup from "yup";
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
// ICONS
import AddTaskIcon from "@mui/icons-material/AddTask";

const handleSubmit = (values, setSubmitting, queryClient) => {
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
    .post(`/api/setting/regulasi/add`, form, {
      headers: {
        "content-type": "multipart/form-data",
        destinationfile: "regulasi",
      },
      onUploadProgress: (event) => {
        console.log(
          `Current progress:`,
          Math.round((event.loaded * 100) / event.total)
        );
      },
    })
    .then((res) => {
      queryClient.invalidateQueries(["regulasis"]);
      toast.update(toastProses, {
        render: res.data.message,
        type: "success",
        isLoading: false,
        autoClose: 2000,
      });
    })
    .catch((err) => {
      console.log(err);
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
  kategori_id: yup.string().required("Harus Diisi"),
  nomor: yup.number().required("Harus Diisi"),
  judul: yup.string().required("Harus Diisi"),
  tentang: yup.string().required("Harus Diisi"),
  file: yup.mixed().required("Harus Upload"),
});

function RegulasiAdd() {
  const queryClient = useQueryClient();
  const initialValues = {
    kategori_id: "",
    nomor: "",
    judul: "",
    tentang: "",
    file: null,
  };

  const { data: kategoris } = useQuery({
    queryKey: ["regulasis", "kategoris"],
    queryFn: ({ signal }) =>
      axios
        .get(`/api/setting/regulasi/kategori`, { signal })
        .then((res) => res.data)
        .catch((err) => {
          throw new Error(err.response.data.message);
        }),
  });

  const formik = useFormik({
    initialValues: initialValues,
    validationSchema: validationSchema,
    enableReinitialize: true,
    onSubmit: (values, { setSubmitting }) =>
      handleSubmit(values, setSubmitting, queryClient),
  });

  return (
    <Card>
      <CardContent>
        <Typography sx={{ fontSize: 14 }} gutterBottom>
          Tambah Data Regulasi
        </Typography>
        <Box>
          <form onSubmit={formik.handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <FormControl
                  fullWidth
                  sx={{ mt: 2 }}
                  error={
                    formik.touched.kategori_id &&
                    Boolean(formik.errors.kategori_id)
                  }
                >
                  <InputLabel>Kategori *</InputLabel>
                  <Select
                    name="kategori_id"
                    label="Kategori Regulasi *"
                    value={formik.values.kategori_id}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  >
                    <MenuItem value="">Pilih</MenuItem>
                    {kategoris &&
                      kategoris.length !== 0 &&
                      kategoris.map((item) => {
                        return (
                          <MenuItem key={item.id} value={item.id}>
                            {item.kategori}
                          </MenuItem>
                        );
                      })}
                  </Select>
                  <FormHelperText>
                    {formik.touched.kategori_id && formik.errors.kategori_id}
                  </FormHelperText>
                </FormControl>

                <TextField
                  fullWidth
                  required
                  type={`number`}
                  margin="normal"
                  label="Nomor Urut"
                  name="nomor"
                  value={formik.values.nomor}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.nomor && Boolean(formik.errors.nomor)}
                  helperText={formik.touched.nomor && formik.errors.nomor}
                />

                <TextField
                  fullWidth
                  required
                  margin="normal"
                  label="Judul"
                  name="judul"
                  value={formik.values.judul}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.judul && Boolean(formik.errors.judul)}
                  helperText={formik.touched.judul && formik.errors.judul}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  required
                  multiline
                  rows={4}
                  margin="normal"
                  label="Tentang"
                  name="tentang"
                  value={formik.values.tentang}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.tentang && Boolean(formik.errors.tentang)
                  }
                  helperText={formik.touched.tentang && formik.errors.tentang}
                />

                <input
                  style={{ marginBottom: 2 }}
                  type="file"
                  id="file"
                  name="file"
                  onBlur={formik.handleBlur}
                  onChange={(event) => {
                    formik.setFieldValue("file", event.currentTarget.files[0]);
                  }}
                />
                <FormHelperText style={{ color: "red" }}>
                  {formik.touched.file && formik.errors.file}
                </FormHelperText>

                <Button
                  disabled={formik.isSubmitting}
                  sx={{ mt: 1 }}
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

RegulasiAdd.auth = true;
RegulasiAdd.breadcrumb = [
  {
    path: "/admin",
    title: "Home",
  },
  {
    path: "/admin/setting/regulasi",
    title: "Regulasi",
  },
  {
    path: "/admin/setting/regulasi/add",
    title: "Tambah Regulasi",
  },
];
export default RegulasiAdd;
