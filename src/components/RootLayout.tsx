import AppHeader from "./AppHeader";
import { Outlet } from "react-router-dom";
import LoadIndexedDBProvider from "../providers/LoadIndexedDBProvider";
import "../index.css";
import "primereact/resources/themes/soho-light/theme.css";

export default function RootLayout() {
  return (
    <LoadIndexedDBProvider>
      <AppHeader></AppHeader>
      <div className="py-4">
        <main className="mx-auto max-w-7xl">
          <Outlet />
        </main>
      </div>
    </LoadIndexedDBProvider>
  );
}
