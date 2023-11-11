export interface ColumnMapperInterface {
  excelColumn: string;
  key: string;
  label: string;
  type: string;
  parser: (
    val: string | number | null | undefined
  ) => string | number | null | undefined;
}

export interface ReadExcelDataConfigInterface {
  startRow?: number;
  startColumn?: string;
}

export interface QuoteDataInterface {
  id: number;
  vortex_id: string;
  group_name: string;
  broker: string;
  eligibles: number | null | undefined;
  received_date: string | null | undefined;
}

export interface Assignment {
  underwriter: Underwriter;
  allocation_pct: number;
}

export interface AssignmentGridCell {
  uw_assignments: Assignment[];
  supp_assignments: Assignment[];
  count: number;
}

export interface GenericAssignmentGridCell {
  assignments: Assignment[];
  count: number;
}

export interface AssignmentsGridInterface {
  group: string | null | undefined;
  [k: string]: AssignmentGridCell;
}

export interface GenericAssignmentsGridInterface {
  group: string | null | undefined;
  [k: string]: GenericAssignmentGridCell;
}

export interface EligibleMapper {
  uuid: string;
  key: string;
  lower: number | null | undefined;
  upper: number | null | undefined;
}

export interface Underwriter {
  uuid: string;
  name: string;
  color: string;
  type: string;
}

export type ListRuleType = {
  key: string;
  field: keyof QuoteDataInterface | undefined;
  operator: "in";
  value: string[] | undefined;
};

export type NumberRuleType = {
  key: string;
  field: keyof QuoteDataInterface;
  operator: "eq" | "ne" | "lt" | "le" | "gt" | "ge";
  value: number;
};

export type RulesetType = {
  key: string;
  group: string | undefined;
  rules: ListRuleType[];
};

export interface RuleAppliedDataInterface extends QuoteDataInterface {
  group: string;
  case_size: keyof Omit<AssignmentsGridInterface, "group"> | undefined;
}

export type BrokerType = {
  name: string;
  reviewed: "Y" | "N";
};
