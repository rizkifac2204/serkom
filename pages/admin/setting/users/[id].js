import { useRouter } from "next/router";
import axios from "axios";
import { toast } from "react-toastify";
import { useQuery, useQueryClient } from "@tanstack/react-query";
// MUI
import Grid from "@mui/material/Grid";
//Component
import WaitLoadingComponent from "components/WaitLoadingComponent";
import ProfileCard from "components/Userprofile/ProfileCard";
import UserUpdateForm from "components/Userprofile/UserUpdateForm";

function UsersDetail() {
  const router = useRouter();
  const { id } = router.query;
  const queryClient = useQueryClient();

  const {
    data: user,
    isLoading,
    isError,
    error,
  } = useQuery({
    enabled: !!id,
    queryKey: ["user", id],
    queryFn: ({ signal }) =>
      axios
        .get(`/api/setting/users/${id}`, { signal })
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
        .delete(`/api/setting/users/` + id)
        .then((res) => {
          queryClient.invalidateQueries(["users"]);
          toast.update(toastProses, {
            render: res.data.message,
            type: "success",
            isLoading: false,
            autoClose: 2000,
          });
          router.push("/admin/setting/users");
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

  if (isError) {
    toast.error(error.message);
    setTimeout(() => router.push("/admin/setting/users"), 1000);
    return <></>;
  }

  return (
    <Grid container spacing={1}>
      <Grid item xs={12} md={3}>
        <WaitLoadingComponent loading={isLoading} />
        {user && <ProfileCard profile={user} handleDelete={handleDelete} />}
      </Grid>
      <Grid item xs={12} md={9}>
        <WaitLoadingComponent loading={isLoading} />
        {user && (
          <UserUpdateForm
            profile={user}
            setDetail={() => queryClient.invalidateQueries(["user", id])}
          />
        )}
      </Grid>
    </Grid>
  );
}

UsersDetail.auth = true;
UsersDetail.breadcrumb = [
  {
    path: "/admin",
    title: "Home",
  },
  {
    path: "/admin/setting/users",
    title: "Users",
  },
  {
    path: "/admin/setting/users/detail",
    title: "Detail",
  },
];
export default UsersDetail;
