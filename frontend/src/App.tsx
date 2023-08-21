import { useState, useEffect } from "react";
import Routes from "./routes";
import "react-toastify/dist/ReactToastify.css";

import { Localization, ptBR } from '@mui/material/locale';
import { ThemeProvider, createTheme } from "@mui/material";

const App = () => {
  const [locale, setLocale] = useState<Localization>(ptBR);

  const theme = createTheme(
    {
      palette: {
        primary: { main: "#538cfb" },
      },
    },
    locale
  );

  useEffect(() => {
    const i18nlocale = localStorage.getItem("i18nextLng") ?? "ptBR";
    const browserLocale = i18nlocale.substring(0, 2) + i18nlocale.substring(3, 5);
    if (browserLocale === "ptBR") 
      setLocale(ptBR);
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <Routes />
    </ThemeProvider>
  );
};

export default App;
