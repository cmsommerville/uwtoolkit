import { DateTime } from "luxon";
import { createSlice } from "@reduxjs/toolkit";
import {
  BrokerType,
  RulesetType,
  RuleAppliedDataInterface,
  Assignment,
  AssignmentGridCell,
  AssignmentsGridInterface,
  EligibleMapper,
  Underwriter,
  QuoteDataInterface,
} from "../../types/data";
import { applyRulesets } from "../../handlers/broker_handlers";

const initialState: {
  quotes: QuoteDataInterface[];
  rulesets: RulesetType[];
  brokers: BrokerType[];
  underwriters: Underwriter[];
  case_sizes: EligibleMapper[];
  rule_applied_data: RuleAppliedDataInterface[];
  assignments: AssignmentsGridInterface[];
} = {
  quotes: [],
  rulesets: [],
  brokers: [],
  underwriters: [],
  case_sizes: [],
  rule_applied_data: [],
  assignments: [],
};

const dataSlice = createSlice({
  name: "data",
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
    setCaseSizes: (state, action) => {
      return { ...state, case_sizes: [...action.payload] };
    },
    setQuoteData(state, action) {
      return { ...state, quotes: [...action.payload] };
    },
    setRulesets: (state, action) => {
      return { ...state, rulesets: [...action.payload] };
    },
    setUnderwriters: (state, action) => {
      return { ...state, underwriters: [...action.payload] };
    },
    calcRuleAppliedData(state, action) {
      const {
        quotes: input_quotes,
        rulesets: input_rulesets,
        assignments: input_assignments,
        case_sizes: input_case_sizes,
        config: input_config,
      } = action.payload;

      const quotes = input_quotes ? input_quotes : state.quotes;
      const rulesets = input_rulesets ? input_rulesets : state.rulesets;
      const assignments = input_assignments
        ? input_assignments
        : state.assignments;
      const case_sizes = input_case_sizes ? input_case_sizes : state.case_sizes;

      if (quotes && quotes.length === 0) return state;
      if (rulesets && rulesets.length === 0) return state;
      if (case_sizes && case_sizes.length === 0) return state;

      let _quotes = quotes;
      if (input_config) {
        _quotes = _quotes.filter((row: QuoteDataInterface) => {
          if (row.received_date == null) return false;
          const dt = DateTime.fromISO(row.received_date);
          return dt >= input_config.min_dt && dt <= input_config.max_dt;
        });
      }

      const data = applyRulesets(_quotes, rulesets);
      const rule_applied_data = applyCaseSize(data, case_sizes);

      const assignment_rows = aggregateRuleAppliedData(
        rule_applied_data,
        rulesets,
        case_sizes,
        assignments
      );
      return {
        ...state,
        assignments: assignment_rows,
        rule_applied_data,
      };
    },
    updateAssignment: (state, action) => {
      const {
        group,
        column,
        assignment,
        assignment_type,
      }: {
        group: string;
        column: string;
        assignment: Assignment[];
        assignment_type: "uw_assignments" | "supp_assignments";
      } = action.payload;
      let updateRow = state.assignments.find((row) => row.group === group);
      if (!updateRow) return state;

      updateRow = {
        ...updateRow,
        [column]: { ...updateRow[column], [assignment_type]: assignment },
      } as AssignmentsGridInterface;

      const a = [
        ...state.assignments.filter((row) => row.group !== group),
        updateRow,
      ].sort((a, b) => {
        if (a.group == null) return 1;
        if (b.group == null) return 1;
        if (a.group === "Non-Premier Broker") return 1;
        return a.group < b.group ? -1 : 1;
      });
      state = {
        ...state,
        assignments: a,
      };
      return state;
    },
  },
});

interface AssignmentObject {
  [k: string]: {
    [c: string]: AssignmentGridCell;
  };
}

const applyCaseSize = (
  rule_applied_data: Omit<RuleAppliedDataInterface, "case_size">[],
  eligible_mapper: EligibleMapper[]
): RuleAppliedDataInterface[] => {
  return rule_applied_data.map((row) => {
    const eligibles = row.eligibles;
    if (eligibles == null) return { ...row, case_size: undefined };
    const case_size_obj = eligible_mapper.find(
      (e) =>
        e.lower != null &&
        e.upper != null &&
        e.lower <= eligibles &&
        eligibles < e.upper
    );
    if (case_size_obj) return { ...row, case_size: case_size_obj.key };
    return { ...row, case_size: undefined };
  });
};

/**
 * This method loops over the rulesets and case size buckets to create a grid that contains every
 * combination of broker group and case size bucket. Even groups with no quotes will show up here.
 *
 * The default group can be overridden, but defaults to `Non-Premier Broker`
 * @param rulesets
 * @param case_size_buckets
 * @param old_assignments
 * @param default_group
 * @returns
 */
const createBaseGrid = (
  rulesets: RulesetType[],
  case_size_buckets: EligibleMapper[],
  old_assignments: AssignmentsGridInterface[] | null | undefined,
  default_group: string = "Non-Premier Broker"
): AssignmentObject => {
  const INITIAL_COUNTS = Object.fromEntries(
    case_size_buckets.map((b) => {
      return [
        b.key,
        {
          count: 0,
          uw_assignments: [],
          supp_assignments: [],
        } as AssignmentGridCell,
      ];
    })
  ) as {
    [k: string]: AssignmentGridCell;
  };

  // ensure that the default group exists in the list of rulesets
  const _rulesets = [...rulesets, { group: default_group }];

  return _rulesets.reduce((prev, ruleset) => {
    const group = ruleset.group;
    if (!group) return prev;

    const prev_assignments = old_assignments?.find((a) => a.group === group);
    // if group is falsy, skip the group
    if (group in prev) return prev;
    // if there is a previous assignment, zero the counts from the previous data
    // preserve the assignments
    if (prev_assignments) {
      const match_prev_assignments = Object.fromEntries(
        Object.entries(INITIAL_COUNTS).map(([key, assign_cell]) => {
          const prev = prev_assignments[key];
          if (prev) {
            return [
              key,
              {
                ...assign_cell,
                uw_assignments: [...prev.uw_assignments],
                supp_assignments: [...prev.supp_assignments],
              },
            ];
          }
          return [key, { ...assign_cell }];
        })
      );

      return { ...prev, [group]: { ...match_prev_assignments } };
    }
    // otherwise, use the initial counts
    return { ...prev, [group]: { ...INITIAL_COUNTS } };
  }, {} as AssignmentObject);
};

const aggregateRuleAppliedData = (
  rule_applied_data: RuleAppliedDataInterface[],
  rulesets: RulesetType[],
  case_sizes: EligibleMapper[],
  old_assignments: AssignmentsGridInterface[] | null | undefined
): AssignmentsGridInterface[] => {
  const grid_obj: AssignmentObject = createBaseGrid(
    rulesets,
    case_sizes,
    old_assignments
  );

  const assignment_obj = rule_applied_data.reduce((prev, row) => {
    const { group, case_size } = row;
    if (!group) return prev;
    if (!case_size) return prev;
    const curr = prev[group];

    return {
      ...prev,
      [group]: {
        ...curr,
        [case_size]: { ...curr[case_size], count: curr[case_size].count + 1 },
      },
    };
  }, grid_obj as AssignmentObject);

  return Object.entries(assignment_obj)
    .map(([group, case_size_objs]) => {
      return { ...case_size_objs, group: group };
    })
    .sort((a, b) => {
      if (a.group == null) return 1;
      if (b.group == null) return 1;
      if (a.group === "Non-Premier Broker") return 1;
      // if (b.group === "Non-Premier Broker") return 1;
      return a.group < b.group ? -1 : 1;
    }) as AssignmentsGridInterface[];
};

export const {
  calcRuleAppliedData,
  updateAssignment,
  setBrokers,
  setCaseSizes,
  setQuoteData,
  setRulesets,
  setUnderwriters,
} = dataSlice.actions;

export default dataSlice.reducer;
