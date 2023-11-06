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
