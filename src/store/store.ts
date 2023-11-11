import { configureStore } from "@reduxjs/toolkit";

import dataReducer from "./slices/data";

export const store = configureStore({
  reducer: {
    data: dataReducer,
  },
});
