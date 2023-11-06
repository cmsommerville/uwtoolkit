import { useMemo } from "react";
import AppGrid from "../../components/AppGrid";
import {
  GenericAssignmentsGridInterface,
  Underwriter,
} from "../../types/config";
import { ColDef } from "ag-grid-community";

interface Props {
  assignments: GenericAssignmentsGridInterface[];
  underwriters: Underwriter[];
}

const countByUnderwriter = (
  assignments: GenericAssignmentsGridInterface[],
  underwriters: Underwriter[]
) => {
  const DEFAULT_UNASSIGNED_NAME = "Unassigned";
  const underwriter_counts = Object.fromEntries(
    underwriters.map((u) => [u.name, 0])
  );
  let total_count = 0;

  underwriter_counts[DEFAULT_UNASSIGNED_NAME] = 0;

  // loop over the assignment rows
  assignments.forEach((row) => {
    const { group, ...vals } = row;

    // loop over the case size columns
    Object.entries(vals).forEach(([case_size, assignment_cell]) => {
      const count = assignment_cell.count;
      total_count += count;

      // if no assignment, add count to the unassigned group
      if (assignment_cell.assignments.length === 0) {
        underwriter_counts[DEFAULT_UNASSIGNED_NAME] += count;
      }
      // loop over the assignments and multiply count by percent split
      assignment_cell.assignments.forEach((assignment) => {
        underwriter_counts[assignment.underwriter.name] +=
          assignment.allocation_pct * count;
      });
    });
  });

  return Object.entries(underwriter_counts)
    .map(([k, v]) => {
      const uw = underwriters.find((u) => u.name === k) as Underwriter;
      return {
        name: k,
        color: uw ? uw.color : "#ddd",
        count: v,
        pct: v / total_count,
      };
    })
    .sort((a, b) => {
      if (a.name === DEFAULT_UNASSIGNED_NAME) return 1;
      return a.name < b.name ? -1 : 1;
    });
};

const CaseDistribution = ({ assignments, underwriters }: Props) => {
  const uw_counts = useMemo(() => {
    return countByUnderwriter(assignments, underwriters);
  }, [assignments, underwriters]);

  return (
    <div>
      <AppGrid
        style={{ height: "500px" }}
        gridOptions={{
          copyHeadersToClipboard: false,
        }}
        rowData={uw_counts}
        columnDefs={CASE_DISTRIBUTION_COL_DEFS}
        animateRows={true}
      />
    </div>
  );
};

const CountCellRenderer = (params: any) => {
  return (
    <span className="flex justify-between items-center">
      <span className="inline-block">{(params.value * 100).toFixed(0)}%</span>
      <span className="inline-block text-xs text-slate-400">
        ({params.data.count.toFixed(0)})
      </span>
    </span>
  );
};

const UnderwriterRenderer = (params: any) => {
  return (
    <span
      style={{
        borderLeft: "10px",
        borderColor: params.data.color,
        borderStyle: "solid",
        paddingLeft: "8px",
      }}
    >
      {params.value}
    </span>
  );
};

const CASE_DISTRIBUTION_COL_DEFS: ColDef[] = [
  {
    field: "name",
    headerName: "Underwriter",
    flex: 1,
    cellRenderer: UnderwriterRenderer,
  },
  {
    field: "pct",
    headerName: "%",
    flex: 1,
    cellRenderer: CountCellRenderer,
  },
];

export default CaseDistribution;
