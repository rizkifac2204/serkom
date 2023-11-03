import { useRef, useState, useCallback } from "react";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
// MUI
import {
  DataGrid,
  GridActionsCellItem,
  GridLinkOperator,
} from "@mui/x-data-grid";
// ICONS
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import LinkIcon from "@mui/icons-material/Link";
// Components
import { CustomPublicToolbar } from "components/TableComponents";
import {
  TextFieldCustom,
  FormControlCustom,
  InputLabelCustom,
  SelectCustom,
  MenuItemCustom,
} from "components/PublicComponents/FieldCustom";

function prepareData(dips = [], search) {
  const items = dips.filter((item) => {
    if (search === "") {
      return item;
    } else if (item.ringkasan?.toLowerCase().includes(search)) {
      return item;
    }
  });
  return items;
}

const DipBerkala = () => {
  const [pageSize, setPageSize] = useState(10);
  const [filter, setFilter] = useState({
    unit: "",
    id_prov: "",
    id_kabkota: "",
  });
  const [search, setSearch] = useState("");
  const [provinsis, setProvinsis] = useState([]);
  const [kabkotas, setKabkotas] = useState([]);
  const formRef = useRef(null);
  const domain =
    process.env.NODE_ENV === "development"
      ? "http://localhost:3000/api/services/file/public/dip/"
      : process.env.NEXT_PUBLIC_HOST + "/api/services/file/public/dip/";

  // fetching wilayah
  const fetchProv = (cb) => {
    if (provinsis.length !== 0) {
      if (cb) cb();
      return;
    }
    axios
      .get(`/api/services/provinsis-selected`)
      .then((res) => {
        setProvinsis(() => res.data);
        if (cb) cb();
      })
      .catch((err) => {
        console.log(err);
      });
  };
  const fetchkabkota = (id, cb) => {
    axios
      .get(`/api/services/provinsis-selected/` + id)
      .then((res) => {
        setKabkotas(() => res.data.kabkota);
        if (cb) cb();
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const handleChangeFilter = (event) => {
    const { name, value } = event.target;
    const prepareFilter = { ...filter, [name]: value };
    var tempData = {};
    if (name === "unit") {
      tempData = { ...prepareFilter, id_kabkota: "", id_prov: "" };
    }
    if (name === "id_prov") {
      tempData = { ...prepareFilter, id_kabkota: "" };
    }
    setFilter((prev) => tempData);
  };

  const {
    data: dips,
    isLoading,
    isFetching,
  } = useQuery({
    enabled:
      filter.unit === "" ||
      filter.unit === "Bawaslu Republik Indonesia" ||
      Boolean(filter.unit === "Bawaslu Provinsi" && filter.id_prov) ||
      Boolean(filter.unit === "Bawaslu" && filter.id_kabkota),
    queryKey: ["public", "dips", "berkala", filter],
    queryFn: ({ signal }) =>
      axios
        .get(`/api/public/dip/berkala`, { signal, params: filter })
        .then((res) => {
          return res.data.map((item, index) => {
            return { ...item, nomor: index + 1 };
          });
        })
        .catch((err) => {
          throw new Error(err.response.data.message);
        }),
  });

  const curData = useCallback(() => {
    return prepareData(dips, search);
  }, [dips, search]);

  const columns = [
    {
      field: "nomor",
      headerName: "No",
      width: 30,
    },
    {
      field: "nama_bawaslu",
      headerName: "Bawaslu",
      flex: 1,
      minWidth: 180,
    },
    {
      field: "sifat",
      headerName: "Sifat",
      width: 150,
      hide: true,
    },
    {
      field: "jenis_informasi",
      headerName: "Jenis Informasi",
      width: 180,
    },
    {
      field: "bentuk_informasi",
      headerName: "Bentuk Informasi",
      hide: true,
    },
    {
      field: "tahun_pembuatan",
      headerName: "Tahun Pembuatan",
      width: 150,
    },
    {
      field: "penanggung_jawab",
      headerName: "Unit Penanggung Jawab",
      hide: true,
    },
    {
      field: "ringkasan",
      headerName: "Ringkasan",
      flex: 1,
      minWidth: 180,
    },
    {
      field: "file",
      type: "actions",
      headerName: "File",
      width: 200,
      cellClassName: "actions",
      getActions: (values) => {
        const arrReturn = [];
        if (values.row.file) {
          const link = `${domain}/${values.row.bawaslu_id}/${values.row.file}`;
          arrReturn.push(
            <GridActionsCellItem
              key="1"
              icon={<CloudDownloadIcon sx={{ fontSize: 18 }} />}
              label="File"
              onClick={() => window.open(link)}
            />
          );
        }
        if (values.row.link) {
          arrReturn.push(
            <GridActionsCellItem
              key="2"
              icon={<LinkIcon sx={{ fontSize: 20 }} />}
              label="Link"
              onClick={() => window.open(values.row.link)}
            />
          );
        }
        return arrReturn;
      },
    },
  ];

  return (
    <>
      <div id="dip-popup">
        <div className="background-top">
          <div className="item-title">
            <h2>
              <i className="fa fa-list-ul fa-4x" />
              <br />
              <span className="point">.DIP</span> Berkala
            </h2>
            <p>Informasi yang wajib diumumkan secara berkala</p>
          </div>
          {/* .item-title */}
          <button
            className="scroll-chevron"
            onClick={() => {
              formRef.current.scrollIntoView({
                behavior: "smooth",
                block: "start",
              });
            }}
          >
            <i className="fa fa-chevron-down fa-2x" />
          </button>
        </div>
        <div className="info-item" ref={formRef}>
          <div className="newsletter-block">
            {/* .block-left-newsletter */}
            <div className="col-xs-12 block-right-newsletter">
              <div id="subscribe">
                <h2>Daftar Informasi Publik Berkala.</h2>
                <p>
                  Informasi yang Wajib Disediakan dan Diumumkan Secara Berkala
                </p>
                <br />
                <div className="row">
                  <div className="col-xs-6 col-sm-4">
                    <FormControlCustom>
                      <InputLabelCustom>Bawaslu</InputLabelCustom>
                      <SelectCustom
                        name="unit"
                        value={filter.unit}
                        onChange={(e) => {
                          handleChangeFilter(e);
                          if (e.target.value !== "Bawaslu Republik Indonesia") {
                            fetchProv();
                          }
                        }}
                      >
                        <MenuItemCustom value="">Semua</MenuItemCustom>
                        <MenuItemCustom value="Bawaslu Republik Indonesia">
                          Bawaslu Republik Indonesia
                        </MenuItemCustom>
                        <MenuItemCustom value="Bawaslu Provinsi">
                          Bawaslu Provinsi
                        </MenuItemCustom>
                        <MenuItemCustom value="Bawaslu">
                          Bawaslu Kabupaten/Kota
                        </MenuItemCustom>
                      </SelectCustom>
                    </FormControlCustom>
                  </div>

                  {/* provinsi  */}
                  {filter.unit &&
                    filter.unit !== "Bawaslu Republik Indonesia" && (
                      <div className="col-xs-6 col-sm-4">
                        <FormControlCustom>
                          <InputLabelCustom>Provinsi</InputLabelCustom>
                          <SelectCustom
                            name="id_prov"
                            value={filter.id_prov}
                            onChange={(e) => {
                              handleChangeFilter(e);
                              if (filter.unit === "Bawaslu") {
                                fetchkabkota(e.target.value);
                              }
                            }}
                          >
                            <MenuItemCustom value="">--Pilih--</MenuItemCustom>
                            {provinsis.length !== 0 &&
                              provinsis.map((item, idx) => (
                                <MenuItemCustom key={idx} value={item.id}>
                                  {filter.unit === "Bawaslu Provinsi" &&
                                    "Bawaslu"}{" "}
                                  {item.provinsi}
                                </MenuItemCustom>
                              ))}
                          </SelectCustom>
                        </FormControlCustom>
                      </div>
                    )}

                  {/* kabkota  */}
                  {filter.unit && filter.unit === "Bawaslu" && (
                    <div className="col-xs-6 col-sm-4">
                      <FormControlCustom>
                        <InputLabelCustom>Kabupaten/Kota</InputLabelCustom>
                        <SelectCustom
                          name="id_kabkota"
                          value={filter.id_kabkota}
                          onChange={handleChangeFilter}
                        >
                          <MenuItemCustom value="">--Pilih--</MenuItemCustom>
                          {kabkotas.length !== 0 &&
                            kabkotas.map((item, idx) => (
                              <MenuItemCustom key={idx} value={item.id}>
                                BAWASLU {item.kabkota}
                              </MenuItemCustom>
                            ))}
                        </SelectCustom>
                      </FormControlCustom>
                    </div>
                  )}

                  <div className="col-xs-6 col-sm-4">
                    <TextFieldCustom
                      label="Cari Berdasarkan Ringkasan"
                      name="search"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                </div>
                <br />
                <br />
                <DataGrid
                  loading={isLoading || isFetching}
                  sx={{ fontSize: "1.3rem", mb: 10 }}
                  autoHeight
                  rows={curData()}
                  columns={columns}
                  pageSize={pageSize}
                  onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
                  rowsPerPageOptions={[5, 10, 20]}
                  components={{
                    Toolbar: CustomPublicToolbar,
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
              </div>
            </div>
            {/* .block-right-newsletter */}
            <div className="clear" />
            <div className="legal-info col-md-12">
              <div className="text-center">
                <p>
                  Pejabat Pengelola Informasi dan Dokumentasi Bawaslu
                  Terintegrasi
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

DipBerkala.public = true;
export default DipBerkala;
