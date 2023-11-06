import { createSlice } from "@reduxjs/toolkit";
import { BrokerType } from "../../types/rulesets";
import { Underwriter } from "../../types/config";
import { EligibleMapper } from "../../types/config";

const initialState: {
  brokers: BrokerType[];
  underwriters: Underwriter[];
  case_sizes: EligibleMapper[];
} = { brokers: [], underwriters: [], case_sizes: [] };

const configDataSlice = createSlice({
  name: "config",
  initialState,
  reducers: {
    setBrokers: (state, action) => {
      return {
        ...state,
        brokers: action.payload.sort((a: BrokerType, b: BrokerType) =>
          a.name < b.name ? -1 : 1
        ),
      };
    },
    setUnderwriters: (state, action) => {
      return { ...state, underwriters: [...action.payload] };
    },
    setCaseSizes: (state, action) => {
      return { ...state, case_sizes: [...action.payload] };
    },
  },
});

export const { setBrokers, setCaseSizes, setUnderwriters } =
  configDataSlice.actions;

export default configDataSlice.reducer;
