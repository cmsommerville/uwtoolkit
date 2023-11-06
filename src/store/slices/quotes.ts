import { createSlice } from "@reduxjs/toolkit";
import { QuoteDataInterface } from "../../types/upload_file";

const initialState: QuoteDataInterface[] = [];

const quoteDataSlice = createSlice({
  name: "quotes",
  initialState,
  reducers: {
    setQuoteData(state, action) {
      return [...action.payload];
    },
  },
});

export const { setQuoteData } = quoteDataSlice.actions;

export default quoteDataSlice.reducer;
