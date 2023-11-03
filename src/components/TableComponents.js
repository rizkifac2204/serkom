// MUI
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
// ICON
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import HelpIcon from "@mui/icons-material/Help";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import {
  GridToolbarContainer,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridToolbarExport,
  GridToolbarDensitySelector,
  GridToolbarQuickFilter,
} from "@mui/x-data-grid";

const ButtonDeleteSelected = ({ selectedItem, handleDeleteSelected }) => {
  return (
    <Button
      variant="text"
      size="small"
      startIcon={<DeleteIcon />}
      disabled={selectedItem.length === 0}
      onClick={handleDeleteSelected}
    >
      Hapus {selectedItem.length} Data Terpilih
    </Button>
  );
};

const CsvHelper = () => {
  return (
    <Button
      sx={{ fontSize: 12 }}
      variant="text"
      size="small"
      startIcon={<HelpIcon />}
      onClick={() =>
        window.open(
          process.env.NEXT_PUBLIC_CSV_HELPER ||
            "https://www.adinstruments.com/support/knowledge-base/how-can-comma-separated-list-be-converted-cells-column-lt",
          "_blank"
        )
      }
    >
      Bantuan
    </Button>
  );
};

function CustomToolbar(props) {
  return (
    <GridToolbarContainer>
      <Grid container spacing={1} justify="space-between">
        <Grid item>
          <GridToolbarColumnsButton />
        </Grid>
        <Grid item>
          <GridToolbarFilterButton />
        </Grid>
        <Grid item>
          <GridToolbarDensitySelector />
        </Grid>
        <Grid item>
          <GridToolbarExport />
        </Grid>
        <Grid item>
          <CsvHelper />
        </Grid>
        <Grid item>
          <ButtonDeleteSelected
            selectedItem={props.selectedItem}
            handleDeleteSelected={props.handleDeleteSelected}
          />
        </Grid>
        <Grid item xs={12}>
          <GridToolbarQuickFilter
            quickFilterParser={(searchInput) =>
              searchInput
                .split(",")
                .map((value) => value.trim())
                .filter((value) => value !== "")
            }
          />
          {props.multiSearch && (
            <Tooltip title="Jika Lebih dari satu pencarian, gunakan tanda koma (,)">
              <IconButton size="small">
                <HelpIcon fontSize="inherit" />
              </IconButton>
            </Tooltip>
          )}
        </Grid>
      </Grid>
    </GridToolbarContainer>
  );
}

function CustomPublicToolbar(props) {
  return (
    <GridToolbarContainer>
      <Grid container spacing={1}>
        <Grid item>
          <GridToolbarColumnsButton sx={{ fontSize: 12 }} />
        </Grid>
        <Grid item>
          <GridToolbarDensitySelector sx={{ fontSize: 12 }} />
        </Grid>
        <Grid item>
          <GridToolbarExport sx={{ fontSize: 12 }} />
        </Grid>
        <Grid item sx={{ mr: 3 }}>
          <CsvHelper sx={{ fontSize: 12 }} />
        </Grid>
        <Grid sx={{ pt: 1, ml: 1 }}>
          <GridToolbarQuickFilter
            quickFilterParser={(searchInput) =>
              searchInput
                .split(",")
                .map((value) => value.trim())
                .filter((value) => value !== "")
            }
          />
          <Tooltip title="Jika Lebih dari satu pencarian, gunakan tanda koma (,)">
            <IconButton size="small">
              <HelpIcon fontSize="inherit" />
            </IconButton>
          </Tooltip>
        </Grid>
      </Grid>
    </GridToolbarContainer>
  );
}

export { CustomToolbar, CustomPublicToolbar };
