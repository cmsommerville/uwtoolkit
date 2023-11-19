import { useState, useMemo, useEffect } from "react";
import { useDispatch } from "react-redux";
import { v4 as uuid } from "uuid";
import AppGrid from "../../components/AppGrid";
import { GenericAssignmentsGridInterface, Underwriter } from "../../types/data";
import { ColDef } from "ag-grid-community";
import { CheckIcon, PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { calcRuleAppliedData, setUnderwriters } from "../../store/slices/data";
import { db } from "../../store/local_storage";
import { KEY_UNDERWRITERS } from "../../store/constants";
import "./CaseDistribution.css";

interface Props {
  assignments: GenericAssignmentsGridInterface[];
  underwriters: Underwriter[];
  type: string;
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
    Object.entries(vals).forEach(([_case_size, assignment_cell]) => {
      const count = assignment_cell.count;
      total_count += count;

      // if no assignment, add count to the unassigned group
      if (assignment_cell.assignments.length === 0) {
        underwriter_counts[DEFAULT_UNASSIGNED_NAME] += count;
      }
      // loop over the assignments and multiply count by percent split
      assignment_cell.assignments.forEach((assignment) => {
        const uw = underwriters.find((u) => u.uuid === assignment.uuid);
        if (!uw) return;
        underwriter_counts[uw.name] += assignment.allocation_pct * count;
      });
    });
  });

  return Object.entries(underwriter_counts)
    .map(([k, v]) => {
      const uw = underwriters.find((u) => u.name === k) as Underwriter;
      return {
        uuid: uw ? uw.uuid : "",
        type: uw ? uw.type : "",
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

const initUW = (type: string) => {
  return {
    uuid: uuid(),
    name: "",
    color: "#dddddd",
    type: type,
  };
};

interface AddUnderwriterProps {
  onClose: () => void;
  type: string;
  uw: Underwriter;
  underwriters: Underwriter[];
}

const AddUnderwriter = ({
  onClose,
  type,
  uw,
  underwriters,
}: AddUnderwriterProps) => {
  const dispatch = useDispatch();
  const [localUw, setUW] = useState<Underwriter>(initUW(type));

  const changeHandler = (key: keyof Underwriter, value: string) => {
    setUW((prev) => ({ ...prev, [key]: value }));
  };

  const deleteHandler = () => {
    const newUnderwriterList = [
      ...underwriters.filter((u) => u.uuid !== localUw.uuid),
    ];
    dispatch(setUnderwriters(newUnderwriterList));
    db.setItem(KEY_UNDERWRITERS, newUnderwriterList);
    onClose();
  };

  const saveHandler = () => {
    if (!localUw.name) return;
    const newUnderwriterList = [
      ...underwriters.filter((u) => u.uuid !== localUw.uuid),
      localUw,
    ];

    dispatch(setUnderwriters(newUnderwriterList));
    db.setItem(KEY_UNDERWRITERS, newUnderwriterList);
    onClose();
  };

  useEffect(() => {
    setUW(uw);
  }, [uw]);

  return (
    <div key={localUw.uuid} className="flex items-center space-x-2">
      <div className="my-1 relative w-full ">
        <input
          type="input"
          className="block w-full rounded-md border-0 pl-4 pr-10 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
          placeholder="e.g. Sally"
          value={localUw.name}
          onChange={(e) => changeHandler("name", e.target.value)}
        />

        <input
          type="color"
          className="input-color-rounded absolute inset-y-0 bg-transparent right-1 flex items-center cursor-pointer"
          value={localUw.color}
          onChange={(e) => changeHandler("color", e.target.value)}
        />
      </div>
      <div className="flex justify-center items-center space-x-1">
        <CheckIcon
          className="h-5 w-5 rounded-full p-0.5 cursor-pointer bg-primary-500 border border-primary-500 text-white hover:bg-primary-600 hover:border-primary-600 transition duration-100 ease"
          onClick={saveHandler}
        />
        <XMarkIcon
          className="h-5 w-5 rounded-full p-0.5 cursor-pointer bg-transparent border border-slate-500 text-slate-500 hover:text-rose-500 hover:border-rose-500 transition duration-100 ease"
          onClick={deleteHandler}
        />
      </div>
    </div>
  );
};

const CaseDistribution = ({ assignments, underwriters, type }: Props) => {
  const dispatch = useDispatch();
  const [newUw, setNewUW] = useState<Underwriter>();

  const filteredUnderwriters = useMemo(() => {
    return underwriters.filter((u) => u.type === type);
  }, [underwriters, type]);

  const uw_counts = useMemo(() => {
    return countByUnderwriter(assignments, filteredUnderwriters);
  }, [assignments, filteredUnderwriters]);

  const CASE_DISTRIBUTION_COL_DEFS: ColDef[] = useMemo(() => {
    return [
      {
        field: "name",
        headerName: type === "underwriter" ? "Underwriter" : "Support",
        flex: 3,
        cellRenderer: UnderwriterRenderer,
      },
      {
        field: "pct",
        headerName: "%",
        flex: 3,
        cellRenderer: CountCellRenderer,
      },
    ];
  }, [type]);

  return (
    <div className="relative">
      <AppGrid
        style={{ height: "500px" }}
        gridOptions={{
          copyHeadersToClipboard: false,
        }}
        rowData={uw_counts}
        columnDefs={CASE_DISTRIBUTION_COL_DEFS}
        animateRows={true}
        onRowDoubleClicked={(params) => {
          const { count, pct, ...uw } = params.data;
          setNewUW(uw);
        }}
      />

      {!newUw ? (
        <button
          className="z-10 absolute -bottom-2 -right-2 w-8 h-8 p-1.5 flex justify-center items-center rounded-full bg-primary-500 ring-2 ring-primary-500 text-white hover:bg-primary-700 hover:ring-primary-700 transition duration-100 shadow"
          onClick={() => setNewUW(initUW(type))}
        >
          <PlusIcon className="" />
        </button>
      ) : (
        <div className="absolute bottom-0 w-full p-2 bg-primary-50 rounded-b border border-t-0 border-slate-400 overflow-hidden">
          <AddUnderwriter
            type={type}
            onClose={() => {
              dispatch(calcRuleAppliedData({}));
              setNewUW(undefined);
            }}
            uw={newUw}
            underwriters={underwriters}
          />
        </div>
      )}
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

export default CaseDistribution;
