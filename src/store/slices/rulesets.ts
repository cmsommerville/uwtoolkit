import { createSlice } from "@reduxjs/toolkit";
import { RulesetType } from "../../types/rulesets";

const initialState: RulesetType[] = [];

const rulesetDataSlice = createSlice({
  name: "rulesets",
  initialState,
  reducers: {
    saveRulesets: (state, action) => {
      return [...action.payload];
    },
  },
});

export const { saveRulesets } = rulesetDataSlice.actions;

export default rulesetDataSlice.reducer;
