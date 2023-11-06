import { createBrowserRouter } from "react-router-dom";
import RootLayout from "./components/RootLayout";
import App from "./App";
import Assignments from "./pages/assignments";
import QuoteData from "./pages/quotes";
import Config from "./pages/config";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      {
        path: "app",
        element: <App />,
      },
      {
        path: "assignments",
        element: <Assignments />,
      },
      {
        path: "config",
        element: <Config />,
      },
      {
        path: "quotes",
        element: <QuoteData />,
      },
    ],
  },
]);
