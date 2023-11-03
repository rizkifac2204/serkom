import { useState } from "react";
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
import DetailSurvey from "components/Survey/DetailSurvey";

function Survey() {
  const queryClient = useQueryClient();
  const [pageSize, setPageSize] = useState(10);
  const [selected, setSelected] = useState([]);
  const [detail, setDetail] = useState({});
  const [openDetail, setOpenDetail] = useState(false);

  const { data: surveys, isLoading } = useQuery({
    queryKey: ["surveys"],
    queryFn: ({ signal }) =>
      axios
        .get(`/api/surveys`, { signal })
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
        .delete(`/api/surveys/` + id)
        .then((res) => {
          setTimeout(() => {
            queryClient.invalidateQueries(["surveys"]);
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
        .delete(`/api/surveys/`, { data: selected })
        .then((res) => {
          setTimeout(() => {
            queryClient.invalidateQueries(["surveys"]);
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

  const handleCloseDetail = () => {
    setOpenDetail(false);
  };
  const showDetail = (values) => {
    setTimeout(() => {
      setDetail((prev) => values);
    });
    setOpenDetail(true);
  };

  const columns = [
    {
      field: "nama_bawaslu",
      headerName: "Kepada",
      minWidth: 300,
    },
    {
      field: "provinsi",
      headerName: "Provinsi",
      minWidth: 180,
      hide: true,
    },
    {
      field: "nama_pemohon",
      headerName: "Nama",
      minWidth: 180,
      flex: 1,
    },
    {
      field: "pendidikan_pemohon",
      headerName: "Pendidikan",
      minWidth: 130,
      hide: true,
    },
    {
      field: "email_pemohon",
      headerName: "Email",
      minWidth: 130,
      hide: true,
    },
    {
      field: "pekerjaan_pemohon",
      headerName: "Pekerjaan",
      minWidth: 130,
      hide: true,
    },
    {
      field: "alamat_pemohon",
      headerName: "Alamat",
      minWidth: 150,
      hide: true,
    },
    {
      field: "q1",
      headerName: "Pertanyaan 1",
      minWidth: 130,
      hide: true,
    },
    {
      field: "q2",
      headerName: "Pertanyaan 2",
      minWidth: 130,
      hide: true,
    },
    {
      field: "q3",
      headerName: "Pertanyaan 3",
      minWidth: 130,
      hide: true,
    },
    {
      field: "q4",
      headerName: "Pertanyaan 4",
      minWidth: 130,
      hide: true,
    },
    {
      field: "q5",
      headerName: "Pertanyaan 5",
      minWidth: 130,
      hide: true,
    },
    {
      field: "q6",
      headerName: "Pertanyaan 6",
      minWidth: 130,
      hide: true,
    },
    {
      field: "q7",
      headerName: "Pertanyaan 7",
      minWidth: 130,
      hide: true,
    },
    {
      field: "q8",
      headerName: "Pertanyaan 8",
      minWidth: 130,
      hide: true,
    },
    {
      field: "q9",
      headerName: "Pertanyaan 9",
      minWidth: 130,
      hide: true,
    },
    {
      field: "q10",
      headerName: "Pertanyaan 10",
      minWidth: 130,
      hide: true,
    },
    {
      field: "saran",
      headerName: "Saran",
      minWidth: 130,
      hide: true,
    },
    {
      field: "created_at",
      headerName: "Tanggal",
      minWidth: 120,
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
            onClick={() => showDetail(values.row)}
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
    <>
      <Card>
        <DataGrid
          loading={isLoading}
          autoHeight
          rows={surveys ? surveys : []}
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

      <DetailSurvey
        open={openDetail}
        onClose={handleCloseDetail}
        fullScreen={true}
        detail={detail}
      />
    </>
  );
}

Survey.auth = true;
Survey.breadcrumb = [
  {
    path: "/admin",
    title: "Home",
  },
  {
    path: "/admin/survey",
    title: "Survey",
  },
];
export default Survey;
