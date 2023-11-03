export const buatTiket = (length, kepada, id_prov, id_kabkot) => {
  var firstCode = "";
  var result = "";
  var characters = "1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  if (kepada === "Bawaslu Provinsi") {
    firstCode = id_prov;
  } else if (kepada === "Bawaslu") {
    firstCode = id_kabkot;
  } else {
    firstCode = "01";
  }
  return firstCode + "-" + result;
};

export const buatCurTime = () => {
  var d = new Date(),
    dformat =
      [d.getMonth() + 1, d.getDate(), d.getFullYear()].join("-") +
      " " +
      [d.getHours(), d.getMinutes(), d.getSeconds()].join(":");
  return d;
};

export const buatIDWill = (kepada, id_prov, id_kabkot) => {
  var id_will = "";
  if (kepada === "Bawaslu Republik Indonesia") {
    id_will = 0;
  } else if (kepada === "Bawaslu Provinsi") {
    id_will = id_prov;
  } else {
    id_will = id_kabkot;
  }
  return id_will;
};

export function emailAdmin(kepada, email) {
  var email_master = process.env.EMAIL_MASTER
    ? process.env.EMAIL_MASTER
    : process.env.EMAIL_USER;
  if (kepada === "Bawaslu Republik Indonesia") return email_master;
  return email ? email : email_master;
}

// pakai nomor developer jika tidak ada env untuk nomor RI
export function noWaAdmin(kepada, telp) {
  var telp_master = process.env.WHATSAPP_TELP_MASTER
    ? process.env.WHATSAPP_TELP_MASTER
    : "085173220412";
  if (kepada === "Bawaslu Republik Indonesia") return telp_master;
  return telp ? telp : telp_master;
}
