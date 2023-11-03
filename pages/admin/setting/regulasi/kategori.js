import { useState, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useQuery, useQueryClient } from "@tanstack/react-query";
// MUI
import Card from "@mui/material/Card";
import Button from "@mui/material/Button";
import { DataGrid, GridActionsCellItem } from "@mui/x-data-grid";
// ICONS
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
// Components
import { CustomToolbar } from "components/TableComponents";
import RegulasiKategoriAddForm from "components/Regulasi/RegulasiKategoriAddForm";
import AuthContext from "context/AuthContext";

function RegulasiKategori() {
  const queryClient = useQueryClient();
  const { user } = useContext(AuthContext);
  const [pageSize, setPageSize] = useState(10);
  const [selected, setSelected] = useState([]);
  const [openForm, setOpenForm] = useState(false);

  const { data: kategoris, isLoading } = useQuery({
    queryKey: ["regulasis", "kategoris"],
    queryFn: ({ signal }) =>
      axios
        .get(`/api/setting/regulasi/kategori`, { signal })
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
        .delete(`/api/setting/regulasi/kategori`, { data: { id } })
        .then((res) => {
          setTimeout(() => {
            queryClient.invalidateQueries(["regulasis", "kategoris"]);
          });
          toast.update(toastProses, {
            render: res.data.message,
            type: "success",
            isLoading: false,
            autoClose: 2000,
          });
        })
        .catch((err) => {
          var msg = err.response.data.message || "Terjadi Kesalahan";
          if (msg.includes("a foreign key")) {
            msg =
              "Gagal, Harus Menghapus Regulasi Pada Kategori Tersebut Terlebih Dahulu";
          }
          toast.update(toastProses, {
            render: msg,
            type: "error",
            isLoading: false,
            autoClose: 2000,
          });
        });
    }
  };

  const columns = [
    {
      field: "kategori",
      headerName: "Kategori",
      minWidth: 200,
    },
    {
      hide: !(user && user.level === 1),
      field: "actions",
      type: "actions",
      headerName: "Actions",
      width: 200,
      cellClassName: "actions",
      getActions: (values) => {
        return [
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
    <>
      <Card>
        {user && user.level === 1 && (
          <Button
            variant="outlined"
            sx={{ mb: 2 }}
            onClick={() => setOpenForm(true)}
          >
            Tambah Kategori
          </Button>
        )}
        <DataGrid
          loading={isLoading}
          autoHeight
          rows={kategoris ? kategoris : []}
          columns={columns}
          pageSize={pageSize}
          onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
          rowsPerPageOptions={[5, 10, 20]}
          disableSelectionOnClick
          checkboxSelection
          disableMultipleSelection={true}
          isRowSelectable={() => false}
          onSelectionModelChange={(itm) => setSelected(itm)}
          components={{
            Toolbar: CustomToolbar,
          }}
          componentsProps={{
            toolbar: {
              selectedItem: [],
              handleDeleteSelected: () => {},
            },
          }}
        />
      </Card>

      <RegulasiKategoriAddForm
        open={openForm}
        onClose={() => setOpenForm(false)}
        fecthKategori={() =>
          queryClient.invalidateQueries(["regulasis", "kategoris"])
        }
      />
    </>
  );
}

RegulasiKategori.auth = true;
RegulasiKategori.breadcrumb = [
  {
    path: "/admin",
    title: "Home",
  },
  {
    path: "/admin/setting/regulasi",
    title: "Regulasi",
  },
  {
    path: "/admin/setting/regulasi/kategori",
    title: "Kategori",
  },
];
export default RegulasiKategori;
