import { AssignmentsGridInterface } from "./config";
import { QuoteDataInterface } from "./upload_file";

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
