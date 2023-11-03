import { useEffect } from "react";
import { useFormik } from "formik";
import * as yup from "yup";
import { toast } from "react-toastify";
import axios from "axios";
// MUI
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";

const handleSubmit = (values, props, setSubmitting) => {
  const toastProses = toast.loading("Tunggu Sebentar...", { autoClose: false });
  axios
    .post(`/api/setting/regulasi/kategori`, values)
    .then((res) => {
      props.fecthKategori();
      setTimeout(() => props.onClose(), 1000);
      toast.update(toastProses, {
        render: res.data.message,
        type: res.data.type,
        isLoading: false,
        autoClose: 2000,
      });
    })
    .catch((err) => {
      console.log(err.response.data);
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
  kategori: yup.string().required("Harus Diisi"),
});

function RegulasiKategoriAddForm(props) {
  const formik = useFormik({
    initialValues: {
      kategori: "",
    },
    enableReinitialize: true,
    validationSchema: validationSchema,
    onSubmit: (values, { setSubmitting }) =>
      handleSubmit(values, props, setSubmitting),
  });

  useEffect(() => {
    if (props.open) formik.resetForm();
  }, [props.open]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Dialog
      open={props.open}
      onClose={props.onClose}
      fullScreen={props.fullScreen}
    >
      <form onSubmit={formik.handleSubmit}>
        <DialogTitle>Tambah Kategori Regulasi Baru</DialogTitle>
        <DialogContent>
          <TextField
            sx={{ mb: 3 }}
            fullWidth
            required
            margin="normal"
            label="Nama Kategori"
            name="kategori"
            value={formik.values.kategori}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.kategori && Boolean(formik.errors.kategori)}
            helperText={formik.touched.kategori && formik.errors.kategori}
          />
        </DialogContent>
        <DialogActions>
          <Button disabled={formik.isSubmitting} type="submit">
            Simpan dan Tutup
          </Button>
          <Button onClick={props.onClose} type="button">
            Tutup
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default RegulasiKategoriAddForm;
