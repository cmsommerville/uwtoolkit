import { configureStore } from "@reduxjs/toolkit";

import quoteDataReducer from "./slices/quotes";
import configDataReducer from "./slices/config";
import rulesetDataReducer from "./slices/rulesets";
import derivedDataReducer from "./slices/derived_data";

export const store = configureStore({
  reducer: {
    quotes: quoteDataReducer,
    config: configDataReducer,
    rulesets: rulesetDataReducer,
    derived: derivedDataReducer,
  },
});
