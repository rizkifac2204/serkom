import { useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import { toast } from "react-toastify";
import { useQuery, useQueryClient } from "@tanstack/react-query";
// MUI
import Card from "@mui/material/Card";
import {
  DataGrid,
  GridActionsCellItem,
  GridLinkOperator,
} from "@mui/x-data-grid";
// ICONS
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import VisibilityIcon from "@mui/icons-material/Visibility";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
// Components
import { CustomToolbar } from "components/TableComponents";

function Users() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [pageSize, setPageSize] = useState(10);
  const [selected, setSelected] = useState([]);

  const { data: users, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: ({ signal }) =>
      axios
        .get(`/api/setting/users`, { signal })
        .then((res) => res.data)
        .catch((err) => {
          throw new Error(err.response.data.message);
        }),
  });

  const handleDeleteSelected = () => {
    const ask = confirm("Yakin Hapus Data Terpilih?");
    if (ask) {
      const toastProses = toast.loading("Tunggu Sebentar...", {
        autoClose: false,
      });
      axios
        .delete(`/api/setting/users/`, { data: selected })
        .then((res) => {
          setTimeout(() => {
            queryClient.invalidateQueries(["users"]);
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
  const handleDeleteClick = (id) => {
    const ask = confirm("Yakin Hapus Data?");
    if (ask) {
      const toastProses = toast.loading("Tunggu Sebentar...", {
        autoClose: false,
      });
      axios
        .delete(`/api/setting/users/` + id)
        .then((res) => {
          setTimeout(() => {
            queryClient.invalidateQueries(["users"]);
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

  const actionColumn = (values) => {
    if (values.row.myself) {
      return [
        <GridActionsCellItem
          key="0"
          icon={<ManageAccountsIcon />}
          label="Profile"
          onClick={() => router.push("/admin/profile")}
        />,
      ];
    }
    if (values.row.editable) {
      return [
        <GridActionsCellItem
          key="1"
          icon={<ManageAccountsIcon />}
          label="Detail dan Edit"
          onClick={() => router.push("/admin/setting/users/" + values.id)}
        />,
        <GridActionsCellItem
          key="2"
          icon={<DeleteIcon />}
          label="Delete"
          onClick={() => handleDeleteClick(values.id)}
        />,
      ];
    } else {
      return [
        <GridActionsCellItem
          key="0"
          icon={<VisibilityIcon />}
          label="Detail"
          onClick={() => router.push("/admin/setting/users/" + values.id)}
        />,
      ];
    }
  };

  const columns = [
    {
      field: "level",
      headerName: "Sebagai",
      minWidth: 180,
    },
    {
      field: "nama_bawaslu",
      headerName: "Bawaslu",
      minWidth: 220,
    },
    {
      field: "provinsi",
      headerName: "Provinsi",
      minWidth: 180,
      hide: true,
    },
    {
      field: "nama_admin",
      headerName: "Nama",
      minWidth: 180,
      flex: 1,
    },
    {
      field: "telp_admin",
      headerName: "Telp/HP",
      minWidth: 180,
    },
    {
      field: "email_admin",
      headerName: "Email",
      minWidth: 180,
      hide: true,
    },
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      width: 200,
      cellClassName: "actions",
      getActions: (values) => actionColumn(values),
    },
  ];

  return (
    <>
      <Card height={630}>
        <DataGrid
          loading={isLoading}
          autoHeight
          rows={users ? users : []}
          columns={columns}
          pageSize={pageSize}
          onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
          rowsPerPageOptions={[5, 10, 20, 50]}
          checkboxSelection
          isRowSelectable={(params) => Boolean(params.row.editable)}
          disableSelectionOnClick
          onSelectionModelChange={(itm) => setSelected(itm)}
          components={{
            Toolbar: CustomToolbar,
          }}
          componentsProps={{
            toolbar: {
              selectedItem: selected,
              handleDeleteSelected: handleDeleteSelected,
              multiSearch: true,
            },
          }}
          columnBuffer={8}
          initialState={{
            filter: {
              filterModel: {
                items: [],
                quickFilterLogicOperator: GridLinkOperator.Or,
              },
            },
          }}
        />
      </Card>
    </>
  );
}

Users.auth = true;
Users.breadcrumb = [
  {
    path: "/admin",
    title: "Home",
  },
  {
    path: "/admin/setting/users",
    title: "Users",
  },
];
export default Users;
