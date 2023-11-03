import { createContext, useState, useEffect, useContext } from "react";
import io from "socket.io-client";
let socket;

const WhatsappContext = createContext();
export function useWhatsappContext() {
  const context = useContext(WhatsappContext);
  return context;
}

export const WhatsappContextProvider = ({ children }) => {
  const [whatsapp, setWhatsapp] = useState({
    status: "Wait",
    message: "Menghubungkan ...",
    qr: null,
    info: null,
  });

  const socketInitializer = async () => {
    await fetch("/api/setting/whatsapp");
    socket = io();

    socket.on("connect", () => {
      socket.emit("checkInfo", {});
    });

    socket.on("statusWA", (status) => {
      setWhatsapp((prev) => status);
    });
  };

  useEffect(() => {
    socketInitializer();
  }, []);

  const context = { whatsapp };

  return (
    <WhatsappContext.Provider value={context}>
      {children}
    </WhatsappContext.Provider>
  );
};

export default WhatsappContext;
