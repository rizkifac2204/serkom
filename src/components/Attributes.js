import QRCode from "qrcode";
import { useEffect, useState } from "react";
import Image from "next/image";
import axios from "axios";
import defaultImage from "../../public/images/no-file.png";

function namaBulan(bulan, singkat = false) {
  switch (bulan) {
    case 0:
      bulan = singkat ? "Jan" : "Januari";
      break;
    case 1:
      bulan = singkat ? "Feb" : "Februari";
      break;
    case 2:
      bulan = singkat ? "Mar" : "Maret";
      break;
    case 3:
      bulan = singkat ? "Apr" : "April";
      break;
    case 4:
      bulan = singkat ? "Mei" : "Mei";
      break;
    case 5:
      bulan = singkat ? "Jun" : "Juni";
      break;
    case 6:
      bulan = singkat ? "Jul" : "Juli";
      break;
    case 7:
      bulan = singkat ? "Agu" : "Agustus";
      break;
    case 8:
      bulan = singkat ? "Sep" : "September";
      break;
    case 9:
      bulan = singkat ? "Okt" : "Oktober";
      break;
    case 10:
      bulan = singkat ? "Nov" : "November";
      break;
    case 11:
      bulan = singkat ? "Des" : "Desember";
      break;
  }
  return bulan;
}

function namaHari(hari) {
  switch (hari) {
    case 0:
      hari = "Minggu";
      break;
    case 1:
      hari = "Senin";
      break;
    case 2:
      hari = "Selasa";
      break;
    case 3:
      hari = "Rabu";
      break;
    case 4:
      hari = "Kamis";
      break;
    case 5:
      hari = "Jumat";
      break;
    case 6:
      hari = "Sabtu";
      break;
  }
  return hari;
}

export function SetQRCode({ text }) {
  const [src, setSrc] = useState("");
  useEffect(() => {
    if (!text) return;
    QRCode.toDataURL(text).then((data) => {
      setSrc(data);
    });
    return () => {
      "cleanup";
    };
  }, [text]);
  return (
    <div>
      <img src={src} alt="QrCode"></img>
    </div>
  );
}

export function CurrentDate() {
  const today = new Date();
  const dd = String(today.getDate()).padStart(2, "0");
  const mm = String(today.getMonth() + 1).padStart(2, "0"); //January is 0!
  const yyyy = today.getFullYear();
  return dd + "/" + mm + "/" + yyyy;
}

export function FormatedDate({ tanggal }) {
  if (!tanggal) return;
  var date = new Date(tanggal);
  if (date instanceof Date && !isNaN(date.valueOf())) {
    return date.toISOString().split("T")[0];
  } else {
    return "-";
  }
}

export function NumberWithCommas({ number }) {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export function WithDynamicImage({ image, altText = "Pemohon" }) {
  const [initImage, setInitImage] = useState(defaultImage);

  useEffect(() => {
    if (!image) return;
    let mounted = true;
    const url = `/api/services/file/public/upload/${image}`;
    if (mounted)
      axios
        .get(url, {
          responseType: "arraybuffer",
        })
        .then((res) => {
          const buffer64 = Buffer.from(res.data, "binary").toString("base64");
          setInitImage(
            `data:${res.headers["content-type"]};base64, ${buffer64}`
          );
        })
        .catch((err) => {
          console.log(err.response);
        });

    return function cleanup() {
      mounted = false;
    };
  }, [image]);

  return (
    <Image
      src={initImage}
      alt={altText}
      priority
      width="0"
      height="0"
      sizes="100vw"
      style={{ width: "100%", height: "auto" }}
    />
  );
}

export function formatedDateFromEpoch(epoch, hari = false) {
  epoch = new Date(epoch * 1000);
  var tahun = epoch.getFullYear();
  var bulan = namaBulan(epoch.getMonth(), true);
  var tanggal = epoch.getDate();
  const pukul =
    ("0" + epoch.getHours()).slice(-2) +
    ":" +
    ("0" + epoch.getMinutes()).slice(-2);
  const showhari = hari ? `${namaHari(epoch.getDay())}, ` : "";
  return showhari + tanggal + " " + bulan + " " + tahun + " - " + pukul;
}
