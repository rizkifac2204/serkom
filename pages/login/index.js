import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useFormik } from "formik";
import * as yup from "yup";
import { toast } from "react-toastify";
import axios from "axios";
// MUI
import Image from "next/image";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
// untuk password
import FormControl from "@mui/material/FormControl";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputLabel from "@mui/material/InputLabel";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import FormHelperText from "@mui/material/FormHelperText";

// ICONS
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";

// COMPONENTS
import GoogleSignInButton from "components/Auth/SignIn";

export default function Login(props) {
  const [error, setError] = useState(null);
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const validationSchema = yup.object({
    username: yup.string("Masukan Username").required("Harus Diisi"),
    password: yup.string("Masukan password").required("Password Harus Diisi"),
  });

  const handleSubmit = (values, setSubmitting) => {
    const toastProses = toast.loading("Tunggu Sebentar...", {
      autoClose: false,
    });
    axios
      .post(`/api/auth/loginCredential`, values)
      .then((res) => {
        toast.update(toastProses, {
          render: res.data.message,
          type: "success",
          isLoading: false,
          autoClose: 2000,
        });
        router.push("/admin");
      })
      .catch((err) => {
        console.log(err.response);
        let tempMassage = "Gagal Login";
        if (err.response.status == 404) {
          tempMassage = "Hubungi admin untuk gantikan password";
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

  const formik = useFormik({
    initialValues: {
      username: "",
      password: "",
    },
    validationSchema: validationSchema,
    onSubmit: (values, { setSubmitting }) =>
      handleSubmit(values, setSubmitting),
  });

  const getQueryRouter = router.query;
  useEffect(() => {
    const getError = getQueryRouter.error;
    if (getError) setError(getError);
  }, [getQueryRouter]);

  return (
    <>
      <Grid container component="main" sx={{ height: "100vh" }}>
        <Grid item xs={false} sm={4} md={7}>
          <div
            style={{
              height: "100vh",
              position: "relative",
            }}
          >
            <Image
              src="/images/bg.jpg"
              alt="PPID"
              quality={100}
              priority
              fill
              sizes="(max-width: 768px) 100vw,
              (max-width: 1200px) 50vw,
              33vw"
            />
          </div>
        </Grid>
        <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
          <Box
            sx={{
              my: 8,
              mx: 4,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Box sx={{ m: 1 }}>
              <Image src="/images/logo.png" width={50} height={50} alt="PPID" />
            </Box>
            <Typography component="h1" variant="h5">
              Sign in PPID Bawaslu
            </Typography>
            {error &&
              (error == "CredentialsSignin" ? (
                <Alert severity="error">
                  Salah Memasukan Username/Password
                </Alert>
              ) : (
                <Alert severity="error">{error}</Alert>
              ))}
            <Box sx={{ mt: 1 }}>
              <form onSubmit={formik.handleSubmit}>
                <TextField
                  margin="normal"
                  fullWidth
                  label="Username"
                  name="username"
                  autoComplete="username"
                  value={formik.values.username}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.username && Boolean(formik.errors.username)
                  }
                  helperText={formik.touched.username && formik.errors.username}
                />
                <FormControl fullWidth sx={{ mt: 2 }}>
                  <InputLabel htmlFor="auth-login-password">
                    Password
                  </InputLabel>
                  <OutlinedInput
                    label="Password"
                    name="password"
                    value={formik.values.password}
                    id="auth-login-password"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    type={showPassword ? "text" : "password"}
                    error={
                      formik.touched.password && Boolean(formik.errors.password)
                    }
                    endAdornment={
                      <InputAdornment position="end">
                        <IconButton
                          edge="end"
                          onClick={() => setShowPassword(!showPassword)}
                          aria-label="toggle password visibility"
                        >
                          {showPassword ? (
                            <VisibilityOutlinedIcon />
                          ) : (
                            <VisibilityOffOutlinedIcon />
                          )}
                        </IconButton>
                      </InputAdornment>
                    }
                  />
                  <FormHelperText error>
                    {formik.touched.password && formik.errors.password}
                  </FormHelperText>
                </FormControl>
                <Button
                  type="submit"
                  disabled={formik.isSubmitting}
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3, mb: 2 }}
                >
                  Sign In
                </Button>
              </form>
              <Grid container>
                <Grid item xs>
                  <Button variant="text" onClick={() => router.push("/")}>
                    HOME
                  </Button>
                </Grid>
                <GoogleSignInButton />
              </Grid>
              <br />
              <br />
              <Typography
                sx={{ pt: 3 }}
                variant="body2"
                color="text.secondary"
                align="center"
                {...props}
              >
                {"Copyright © "}
                <a
                  href="https://bawaslu.go.id/"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  Bawaslu Repiblik Indonesia
                </a>{" "}
                {new Date().getFullYear()}
                {"."}
              </Typography>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </>
  );
}
