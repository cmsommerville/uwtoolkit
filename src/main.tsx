import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import ReduxProvider from "./providers/ReduxProvider.tsx";
import { PrimeReactProvider } from "primereact/api";
import "primereact/resources/themes/soho-light/theme.css";

import { router } from "./router.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <PrimeReactProvider>
      <ReduxProvider>
        <RouterProvider router={router} />
      </ReduxProvider>
    </PrimeReactProvider>
  </React.StrictMode>
);
