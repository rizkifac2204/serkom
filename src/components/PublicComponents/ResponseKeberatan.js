import Button from "@mui/material/Button";
import SendIcon from "@mui/icons-material/Send";

function ResponseKeberatan({ curData, handlePrint, reset }) {
  return (
    <>
      <div className="first-block">
        <div className="container">
          <div className="col-md-12">
            <h2>Sukses</h2>
            <h3>Berhasil Mengirim Pengajuan Keberatan</h3>
          </div>
        </div>
      </div>
      <div className="container info-block">
        <div className="col-xs-12 col-sm-12 col-lg-8">
          <h3>
            Terima<span className="point">kasih</span>
            <br />
            <small>{curData.nama_pemohon}</small>
          </h3>
          <p>
            Email yang anda terima dapat digunakan sebagai bukti Pengajuan
            Keberatan. Atau anda bisa cetak Bukti{" "}
            <a onClick={() => handlePrint()} role="button">
              Disini
            </a>
          </p>
          <br />
          <Button
            size="large"
            variant="outlined"
            endIcon={<SendIcon />}
            onClick={reset}
          >
            Ajukan Keberatan Kembali
          </Button>
        </div>
        <div className="col-xs-12 col-sm-12 col-lg-4">
          <img
            alt=""
            className="img-responsive img-right-about"
            src="/images/icon.png"
          />
          <p className="on-right">
            Terimakasih
            <br />
            Bawaslu Terbuka, Bawaslu Terpercaya
          </p>
        </div>
      </div>
    </>
  );
}

export default ResponseKeberatan;
