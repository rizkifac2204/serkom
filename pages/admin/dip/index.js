import { useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import { toast } from "react-toastify";
import { useQuery, useQueryClient } from "@tanstack/react-query";
// MUI
import Card from "@mui/material/Card";
import { DataGrid, GridActionsCellItem } from "@mui/x-data-grid";
// ICONS
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import LinkIcon from "@mui/icons-material/Link";
// Components
import { CustomToolbar } from "components/TableComponents";

function Dip() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [pageSize, setPageSize] = useState(10);
  const [selected, setSelected] = useState([]);
  const domain =
    process.env.NODE_ENV === "development"
      ? "http://localhost:3000/api/services/file/public/dip/"
      : process.env.NEXT_PUBLIC_HOST + "/api/services/file/public/dip/";

  const { data: dips, isLoading } = useQuery({
    queryKey: ["dips"],
    queryFn: ({ signal }) =>
      axios
        .get(`/api/dip`, { signal })
        .then((res) => res.data)
        .catch((err) => {
          throw new Error(err.response.data.message);
        }),
  });

  const handleDelete = (id) => {
    const ask = confirm("Yakin Hapus Data?");
    if (ask) {
      const toastProses = toast.loading("Tunggu Sebentar...", {
        autoClose: false,
      });
      axios
        .delete(`/api/dip/` + id)
        .then((res) => {
          setTimeout(() => {
            queryClient.invalidateQueries(["dips"]);
          });
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
        });
    }
  };
  const handleDeleteSelected = () => {
    const ask = confirm("Yakin Hapus Data Terpilih?");
    if (ask) {
      const toastProses = toast.loading("Tunggu Sebentar...", {
        autoClose: false,
      });
      axios
        .delete(`/api/dip/`, { data: selected })
        .then((res) => {
          setTimeout(() => {
            queryClient.invalidateQueries(["dips"]);
          });
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
        });
    }
  };

  const handleClickFile = (values) => {
    const link = `${domain}/${values.bawaslu_id}/${values.file}`;
    if (values.file) {
      window.open(link);
    }
  };

  const columns = [
    {
      field: "nama_bawaslu",
      headerName: "Bawaslu",
      flex: 1,
      minWidth: 180,
    },
    {
      field: "sifat",
      headerName: "Sifat",
      width: 180,
    },
    {
      field: "jenis_informasi",
      headerName: "Jenis Informasi",
      width: 180,
    },
    {
      field: "ringkasan",
      headerName: "Ringkasan",
      flex: 1,
      minWidth: 180,
    },
    {
      field: "created_at",
      headerName: "Tanggal",
      width: 120,
      valueGetter: (params) => {
        return new Date(params.row.created_at).toISOString().split("T")[0];
      },
      hide: true,
    },
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      width: 200,
      cellClassName: "actions",
      getActions: (values) => {
        return [
          <GridActionsCellItem
            key="3"
            icon={
              <DescriptionOutlinedIcon
                color={values.row.file ? "primary" : "disabled"}
              />
            }
            label="File"
            onClick={() => handleClickFile(values.row)}
          />,
          <GridActionsCellItem
            key="4"
            icon={<LinkIcon color={values.row.link ? "primary" : "disabled"} />}
            label="Link"
            onClick={() => {
              if (values.row.link) {
                window.open(values.row.link);
              }
            }}
          />,
          <GridActionsCellItem
            key="0"
            icon={<VisibilityIcon />}
            label="Detail"
            onClick={() => router.push("/admin/dip/" + values.id)}
          />,
          <GridActionsCellItem
            key="1"
            icon={<EditIcon />}
            label="Edit"
            onClick={() => router.push("/admin/dip/" + values.id + "/edit")}
          />,
          <GridActionsCellItem
            key="2"
            icon={<DeleteIcon />}
            label="Delete"
            onClick={() => handleDelete(values.id)}
          />,
        ];
      },
    },
  ];

  return (
    <Card>
      <DataGrid
        loading={isLoading}
        autoHeight
        rows={dips ? dips : []}
        columns={columns}
        pageSize={pageSize}
        onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
        rowsPerPageOptions={[5, 10, 20]}
        checkboxSelection
        disableSelectionOnClick
        onSelectionModelChange={(itm) => setSelected(itm)}
        components={{
          Toolbar: CustomToolbar,
        }}
        componentsProps={{
          toolbar: {
            selectedItem: selected,
            handleDeleteSelected: handleDeleteSelected,
          },
        }}
      />
    </Card>
  );
}

Dip.auth = true;
Dip.breadcrumb = [
  {
    path: "/admin",
    title: "Home",
  },
  {
    path: "/admin/dip",
    title: "Daftar Informasi Publik",
  },
];
export default Dip;
