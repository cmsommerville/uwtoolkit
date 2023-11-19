"use client";
import { useState, useEffect, useMemo } from "react";
import { Switch } from "@headlessui/react";
// import "ag-grid-enterprise";
import AppGrid from "../../components/AppGrid";
import AppPanel from "../../components/AppPanel";
import MultipleAssignmentModal from "./MultipleAssignmentModal";
import CaseDistribution from "./CaseDistribution";
import ConfigSlideover from "./ConfigSlideover";
import {
  ColDef,
  GridApi,
  ITooltipParams,
  ValueFormatterParams,
} from "ag-grid-community";
import { useSelector, useDispatch } from "react-redux";
import { db } from "../../store/local_storage";
import { updateAssignment } from "../../store/slices/data";
import {
  Assignment,
  AssignmentsGridInterface,
  EligibleMapper,
  GenericAssignmentsGridInterface,
  Underwriter,
} from "../../types/data";
import { KEY_ASSIGNMENTS } from "../../store/constants";

const AssignmentCellRenderer = (params: any) => {
  if (!params.value) return params.valueFormatted;
  const { assignments }: { assignments: Assignment[] } = params.value;
  const { underwriters }: { underwriters: Underwriter[] } = params.context;

  if (!Array.isArray(assignments)) return params.valueFormatted;
  if (assignments.length === 0) return params.valueFormatted;
  if (assignments.length > 1)
    return (
      <>
        {assignments.map((a) => {
          const uw = underwriters.find((u) => u.uuid === a.uuid);
          return (
            <span
              key={a.uuid}
              style={{
                borderLeft: `${10 / assignments.length}px`,
                borderColor: uw ? uw.color : "#ddd",
                borderStyle: "solid",
              }}
            ></span>
          );
        })}
        <span
          style={{
            paddingLeft: "8px",
          }}
        >
          {params.valueFormatted}
        </span>
      </>
    );

  const uw = underwriters.find((u) => u.uuid === assignments[0].uuid);
  return (
    <span
      style={{
        borderLeft: "10px",
        borderColor: uw ? uw.color : "#ddd",
        borderStyle: "solid",
        paddingLeft: "8px",
      }}
    >
      {params.valueFormatted}
    </span>
  );
};

interface MultipleModalContext {
  group: string | undefined;
  column: string | undefined;
  assignments: Assignment[];
  assignment_type: "uw_assignments" | "supp_assignments" | undefined;
}

const toggleAssignments = (
  showUnderwriters: boolean,
  assignments: AssignmentsGridInterface[]
): GenericAssignmentsGridInterface[] => {
  const a = assignments;

  // console.log(a);
  return a.map((a) => {
    const filtered_a = Object.fromEntries(
      Object.entries(a).map(([key, val]) => {
        if (key === "group") return [key, val];
        const { uw_assignments, supp_assignments, count } = val;
        if (showUnderwriters)
          return [key, { count, assignments: uw_assignments }];
        return [key, { count, assignments: supp_assignments }];
      })
    );

    return { ...filtered_a };
  });
};

const Assignments = () => {
  const dispatch = useDispatch();
  const assignments: AssignmentsGridInterface[] = useSelector(
    (state: any) => state.data.assignments
  );
  const underwriters: Underwriter[] = useSelector(
    (state: any) => state.data.underwriters
  );
  const case_sizes: EligibleMapper[] = useSelector(
    (state: any) => state.data.case_sizes
  );

  const [multAssignmentContext, setMultAssignmentContext] =
    useState<MultipleModalContext>({
      group: undefined,
      column: undefined,
      assignments: [],
      assignment_type: undefined,
    });
  const [isPristineState, setIsPristineState] = useState(true);
  const [toggleUWContext, setToggleUWContext] = useState(true);

  const [gridApi, setGridApi] = useState<GridApi>();

  const genericAssignments = useMemo(() => {
    return toggleAssignments(toggleUWContext, assignments);
  }, [assignments, toggleUWContext]);

  const underwriterType = toggleUWContext ? "underwriter" : "support";

  const filteredUnderwriters = useMemo(() => {
    return underwriters.filter(
      (u) => u.type === (toggleUWContext ? "underwriter" : "support")
    );
  }, [underwriters, toggleUWContext]);

  const underwritersWithMultiple = useMemo(() => {
    return [
      ...filteredUnderwriters,
      { name: "Multiple", color: "#f00", uuid: "", type: "" },
    ];
  }, [filteredUnderwriters]);

  const SELECT_UNDERWRITER_COL_DEFS: ColDef = useMemo(() => {
    return {
      editable: true,
      wrapText: true,
      valueFormatter: valueFormatter_AssignmentCell,
      valueParser: (params) => {
        return params.newValue;
      },
      tooltipValueGetter: (params) => {
        return valueFormatter_AssignmentCell(params, true);
      },
      comparator: (a: any, b: any) => {
        const val_a = formatter(a, underwritersWithMultiple);
        const val_b = formatter(b, underwritersWithMultiple);

        if (val_a == null) return 1;
        if (val_b == null) return 1;
        return val_a < val_b ? -1 : 1;
      },
      valueSetter: (params) => {
        const column = params.column.getColId();
        const { group } = params.data;
        const { dispatch } = params.context;

        let assignment: Assignment[] = [];
        const assignment_type = params.context.toggleUWContext
          ? "uw_assignments"
          : "supp_assignments";
        if (Array.isArray(params.newValue)) {
          assignment = params.newValue;
        } else if (params.newValue.name === "Multiple") {
          const { assignments: oldAssignment } = params.oldValue;
          params.context.setMultAssignmentContext({
            group,
            column,
            assignments: oldAssignment,
            assignment_type,
          });
          return false;
        } else if (params.newValue) {
          assignment = [{ uuid: params.newValue.uuid, allocation_pct: 1 }];
        }

        dispatch(
          updateAssignment({ group, column, assignment, assignment_type })
        );
        params.context.setIsPristineState(false);

        return true;
      },
      flex: 1,
      cellEditor: "agSelectCellEditor",
      cellRenderer: AssignmentCellRenderer,
      cellEditorParams: {
        values: underwritersWithMultiple,
        filterList: true,
        searchType: "match",
        allowTyping: true,
      },
    };
  }, [underwritersWithMultiple]);

  const ASSIGNMENT_COLUMN_DEFS: ColDef[] = useMemo(() => {
    if (!case_sizes) return [];
    if (case_sizes.length === 0) return [];
    return [
      {
        field: "group",
        headerName: "Broker Group",
        flex: 1.5,
      },
      ...case_sizes.map((c) => {
        return {
          ...SELECT_UNDERWRITER_COL_DEFS,
          field: c.key,
          headerName: headerNameHandler(c),
          flex: 1,
        };
      }),
    ];
  }, [SELECT_UNDERWRITER_COL_DEFS, case_sizes]);

  const saveToIndexedDB = async () => {
    try {
      await db.setItem(KEY_ASSIGNMENTS, assignments);
      setIsPristineState(true);
    } catch (err) {
      console.log(err);
    }
  };

  const closeMultAssignmentModal = (saved: boolean = false) => {
    if (saved) {
      setIsPristineState(false);
    }
    setMultAssignmentContext({
      group: undefined,
      column: undefined,
      assignments: [],
      assignment_type: undefined,
    });
  };

  useEffect(() => {
    if (!gridApi) return;
    if (!genericAssignments) return;
    gridApi.setRowData(genericAssignments);
  }, [gridApi, genericAssignments]);

  return (
    <AppPanel>
      <div className="relative grid grid-cols-12 gap-x-8 gap-y-2">
        <MultipleAssignmentModal
          group={multAssignmentContext.group}
          column={multAssignmentContext.column}
          underwriters={filteredUnderwriters}
          assignments={multAssignmentContext.assignments}
          assignment_type={multAssignmentContext.assignment_type}
          open={!!multAssignmentContext.group}
          onClose={closeMultAssignmentModal}
        />

        <div className="col-span-9 flex justify-between">
          <h3 className="text-slate-600 text-xl tracking font-light">
            {toggleUWContext
              ? "Underwriter Assignments"
              : "Support Assignments"}
          </h3>
          <div className="flex space-x-12">
            <Switch.Group as="div" className="flex items-center">
              <Switch.Label as="span" className="mr-3 text-sm">
                <span className="font-medium text-slate-900">
                  Show Underwriters
                </span>{" "}
              </Switch.Label>
              <Switch
                checked={toggleUWContext}
                onChange={(val) => {
                  setToggleUWContext(val);
                  if (gridApi) {
                    gridApi.redrawRows();
                  }
                }}
                className={
                  (toggleUWContext ? "bg-primary-600" : "bg-slate-200") +
                  " relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2"
                }
              >
                <span
                  aria-hidden="true"
                  className={
                    (toggleUWContext ? "translate-x-5" : "translate-x-0") +
                    " pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                  }
                />
              </Switch>
            </Switch.Group>
          </div>
        </div>
        <div className="col-span-3 flex justify-between space-x-6 items-center">
          <ConfigSlideover className="z-10 right-0 top-0 text-slate-400 w-6 h-6" />
          <button
            className="flex items-center py-1.5 px-2 rounded bg-primary-500 ring-2 ring-primary-500 text-white hover:bg-primary-700 hover:ring-primary-700 disabled:bg-slate-500 disabled:ring-slate-500 transition duration-100 shadow"
            onClick={saveToIndexedDB}
            disabled={isPristineState}
          >
            <span>Save</span>
          </button>
        </div>
        <div className="col-span-9 relative">
          <AppGrid
            className="col-span-4"
            style={{ height: "500px" }}
            onGridReady={(params) => {
              setGridApi(params.api);
            }}
            gridOptions={{
              copyHeadersToClipboard: false,
              singleClickEdit: true,
            }}
            context={{
              dispatch,
              setIsPristineState,
              setMultAssignmentContext,
              toggleUWContext,
              underwriters,
            }}
            columnDefs={ASSIGNMENT_COLUMN_DEFS}
            animateRows={true}
          />
        </div>
        <div className="col-span-3 space-y-6">
          <CaseDistribution
            assignments={genericAssignments}
            type={underwriterType}
            underwriters={underwriters}
          />
        </div>
      </div>
    </AppPanel>
  );
};

const headerNameHandler = (case_size: EligibleMapper) => {
  if (case_size.lower == null) return "Unknown";
  if (case_size.upper == null) return "Unknown";
  if (case_size.lower <= 0) return `< ${case_size.upper}`;
  if (case_size.upper >= 9999999) return `\u{2265} ${case_size.lower}`;
  return `${case_size.lower} - ${case_size.upper - 1}`;
};

const formatter = (val: any, underwriters: Underwriter[]) => {
  if (!val) return null;
  const { assignments } = val;
  if (!assignments) {
    return val.name;
  }
  if (!Array.isArray(assignments)) return null;
  if (assignments.length === 0) return null;

  return assignments
    .map((assignment: Assignment) => {
      const uw = underwriters.find((u) => u.uuid === assignment.uuid);

      return `${uw ? uw.name : ""} (${(assignment.allocation_pct * 100).toFixed(
        0
      )}%)`;
    })
    .join(" / ");
};

const valueFormatter_AssignmentCell = (
  params: ValueFormatterParams | ITooltipParams,
  showPercent: boolean = false
) => {
  if (!params.value) return "-";
  const { assignments } = params.value;
  if (!assignments) {
    return params.value.name;
  }
  if (!Array.isArray(assignments)) return "-";
  if (assignments.length === 0) return "-";

  const underwriters: Underwriter[] = params.context.underwriters;

  return assignments
    .map((assignment: Assignment) => {
      const uw = underwriters.find((u) => u.uuid === assignment.uuid);
      if (!uw) return "";
      if (showPercent)
        return `${uw.name} (${(assignment.allocation_pct * 100).toFixed(0)}%)`;

      return uw.name;
    })
    .join(" / ");
};

export default Assignments;
