import { createBrowserRouter } from "react-router-dom";
import RootLayout from "./components/RootLayout";
import Assignments from "./pages/assignments";
import QuoteData from "./pages/quotes";
import Config from "./pages/config";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      {
        element: <Assignments />,
        index: true,
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
