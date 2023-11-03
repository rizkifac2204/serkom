import { useState, useRef } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import { toast } from "react-toastify";
import { useReactToPrint } from "react-to-print";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// MUI
import LinearProgress from "@mui/material/LinearProgress";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import {
  DataGrid,
  GridActionsCellItem,
  GridLinkOperator,
} from "@mui/x-data-grid";
// ICONS
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import VisibilityIcon from "@mui/icons-material/Visibility";
import PrintIcon from "@mui/icons-material/Print";
import LocalLibraryIcon from "@mui/icons-material/LocalLibrary";
// Components
import { CustomToolbar } from "components/TableComponents";
import ResponseDialog from "components/Permohonan/ResponseDialog";
import DataPermohonan from "components/PrintPage/DataPermohonan";

function getFullReg(params) {
  return (
    <>
      <Typography>
        {params.row.no_registrasi}
        <br />
        <Typography variant="caption" color="primary">
          {params.row.tiket}
        </Typography>
      </Typography>
    </>
  );
}

async function deleteData(id) {
  if (id) {
    try {
      const res = await axios.delete(`/api/permohonan/${id}`);
      return res.data;
    } catch (err) {
      throw new Error(err?.response?.data?.message || "Terjadi Kesalahan");
    }
  }
}

async function deleteDataSeleted(selected) {
  try {
    const res = await axios.delete(`/api/permohonan/`, { data: selected });
    return res.data;
  } catch (err) {
    throw new Error(err?.response?.data?.message || "Terjadi Kesalahan");
  }
}

function Permohonan() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [pageSize, setPageSize] = useState(10);
  const [selected, setSelected] = useState([]);
  // proses response
  const [detail, setDetail] = useState({});
  const [openResponse, setOpenResponse] = useState(false);
  const [profileBawaslu, setProfileBawaslu] = useState({});
  const printRef = useRef();

  const {
    data: permohonans,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ["permohonans"],
    queryFn: ({ signal }) =>
      axios
        .get(`/api/permohonan`, { signal })
        .then((res) => res.data)
        .catch((err) => {
          throw new Error(err.response.data.message);
        }),
  });

  // call for response dan print
  function fetchProfileBawaslu(id, callback) {
    const toastProses = toast.loading("Menyiapkan Format...");
    axios
      .get(`/api/services/profileBawaslu?id=` + id)
      .then((res) => {
        setProfileBawaslu(res.data);
        toast.dismiss(toastProses);
        callback();
      })
      .catch((err) => {
        console.log(err);
        toast.update(toastProses, {
          render: "Terjadi Kesalahan",
          type: "error",
          isLoading: false,
          autoClose: 2000,
        });
      });
  }

  const { mutate: mutateDeleteSelected, isLoading: isLoadingDeleteSelected } =
    useMutation({
      mutationFn: deleteDataSeleted,
      onSuccess: (data) => {
        queryClient.invalidateQueries(["permohonans"]);
        toast.success(data.message || "Sukses");
      },
      onError: (err) => {
        console.log(err);
        toast.error(err.message);
      },
    });

  function handleDeleteSelected() {
    const ask = confirm("Yakin Hapus Data Terpilih?");
    if (ask) mutateDeleteSelected(selected);
  }

  const { mutate: mutateDelete, isLoading: isLoadingDelete } = useMutation({
    mutationFn: deleteData,
    onSuccess: (data) => {
      queryClient.invalidateQueries(["permohonans"]);
      toast.success(data.message || "Sukses");
    },
    onError: (err, variables) => {
      toast.error(err.message);
    },
  });
  function handleDeleteClick(id) {
    const ask = confirm("Yakin Hapus Data?");
    if (ask) mutateDelete(id);
  }

  const processPrint = useReactToPrint({
    content: () => printRef.current,
  });
  const handlePrintClick = (values) => {
    setTimeout(() => {
      setDetail((prev) => values);
      fetchProfileBawaslu(values.bawaslu_id, () => {
        // beri timeout 1/2 detik agar loading image terlbih dahulu
        setTimeout(() => {
          processPrint();
        }, 500);
      });
    });
  };

  const handleOpenResponse = () => {
    setOpenResponse(true);
  };
  const handleCloseResponse = () => {
    setOpenResponse(false);
  };

  const hanldeResponse = (values) => {
    setTimeout(() => {
      setDetail((prev) => values);
    });
    handleOpenResponse();
  };

  const columns = [
    {
      field: "no_registrasi",
      headerName: "Nomor Registrasi",
      width: 250,
      renderCell: getFullReg,
      valueFormatter: ({ value }) => `${value}`,
    },
    {
      field: "tiket",
      headerName: "Tiket",
      minWidth: 180,
      hide: true,
    },
    {
      field: "nama_bawaslu",
      headerName: "Kepada",
      minWidth: 250,
    },
    {
      field: "platform",
      headerName: "Platform",
      minWidth: 180,
      hide: true,
    },
    {
      field: "provinsi",
      headerName: "Provinsi",
      minWidth: 180,
      hide: true,
    },
    {
      field: "nama_pemohon",
      headerName: "Pemohon",
      minWidth: 180,
    },
    {
      field: "telp_pemohon",
      headerName: "Telp/HP",
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
      field: "tanggal_permohonan",
      headerName: "Tanggal",
      minWidth: 120,
      valueGetter: (params) => {
        var date = new Date(params.row.tanggal_permohonan);
        if (date instanceof Date && !isNaN(date.valueOf())) {
          return date.toISOString().split("T")[0];
        } else {
          return "-";
        }
      },
    },
    {
      field: "status_permohonan",
      headerName: "Status",
      minWidth: 150,
      flex: 1,
      editable: true,
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
            onClick={() => router.push("/admin/permohonan/" + values.id)}
          />,
          <GridActionsCellItem
            key="1"
            icon={<VisibilityIcon />}
            label="Detail"
            onClick={() => hanldeResponse(values.row)}
            showInMenu
          />,
          <GridActionsCellItem
            key="2"
            icon={<LocalLibraryIcon />}
            label="Tanggapi"
            onClick={() => hanldeResponse(values.row)}
            showInMenu
          />,
          <GridActionsCellItem
            key="3"
            icon={<PrintIcon />}
            label="Print"
            onClick={() => handlePrintClick(values.row)}
            showInMenu
          />,
          <GridActionsCellItem
            key="4"
            icon={<DeleteIcon />}
            label="Delete"
            onClick={() => handleDeleteClick(values.id)}
            showInMenu
          />,
        ];
      },
    },
  ];

  return (
    <>
      {(isFetching || isLoadingDelete || isLoadingDeleteSelected) && (
        <LinearProgress />
      )}
      <Card height={630}>
        <DataGrid
          loading={isLoading}
          autoHeight
          rows={permohonans ? permohonans : []}
          columns={columns}
          pageSize={pageSize}
          onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
          rowsPerPageOptions={[5, 10, 20, 50]}
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
      {/* COMPONEN */}
      <ResponseDialog
        open={openResponse}
        onClose={handleCloseResponse}
        fullScreen={true}
        detail={detail}
        invalidateQueries={() =>
          props.queryClient.invalidateQueries(["permohonans"])
        }
      />
      <DataPermohonan
        ref={printRef}
        detail={detail}
        profileBawaslu={profileBawaslu}
      />
    </>
  );
}

Permohonan.auth = true;
Permohonan.breadcrumb = [
  {
    path: "/admin",
    title: "Home",
  },
  {
    path: "/admin/permohonan",
    title: "Permohonan",
  },
];
export default Permohonan;
