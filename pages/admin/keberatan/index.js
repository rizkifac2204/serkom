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
// Components
import { CustomToolbar } from "components/TableComponents";

function Keberatan() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [pageSize, setPageSize] = useState(10);
  const [selected, setSelected] = useState([]);

  const { data: keberatans, isLoading } = useQuery({
    queryKey: ["keberatans"],
    queryFn: ({ signal }) =>
      axios
        .get(`/api/keberatans`, { signal })
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
        .delete(`/api/keberatans/` + id)
        .then((res) => {
          setTimeout(() => {
            queryClient.invalidateQueries(["keberatans"]);
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
        .delete(`/api/keberatans/`, { data: selected })
        .then((res) => {
          setTimeout(() => {
            queryClient.invalidateQueries(["keberatans"]);
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

  const columns = [
    {
      field: "no_registrasi",
      headerName: "Nomor Registrasi",
      width: 180,
    },
    {
      field: "tiket",
      headerName: "Nomor Tiket",
      width: 180,
    },
    {
      field: "kasus_posisi",
      headerName: "Kasus Posisi",
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
            key="0"
            icon={<VisibilityIcon />}
            label="Detail"
            onClick={() => router.push("/admin/keberatan/" + values.id)}
          />,
          <GridActionsCellItem
            key="3"
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
        rows={keberatans ? keberatans : []}
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
            multiSearch: true,
          },
        }}
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
  );
}

Keberatan.auth = true;
Keberatan.breadcrumb = [
  {
    path: "/admin",
    title: "Home",
  },
  {
    path: "/admin/keberatan",
    title: "Keberatan",
  },
];
export default Keberatan;
