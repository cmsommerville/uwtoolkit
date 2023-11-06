import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import AppModal, { AppModalProps } from "../../components/AppModal";
import { updateAssignment } from "../../store/slices/derived_data";
import { Underwriter } from "../../types/config";
import { Assignment } from "../../types/config";
import { ArrowUpOnSquareIcon } from "@heroicons/react/24/outline";

interface Props extends Omit<AppModalProps, "children"> {
  group: string | undefined;
  column: string | undefined;
  underwriters: Underwriter[];
  assignments: Assignment[];
  assignment_type: "uw_assignments" | "supp_assignments" | undefined;
}

const MultipleAssignmentModal = (props: Props) => {
  const dispatch = useDispatch();
  const [localAssignments, setLocalAssignments] = useState<{
    [name: string]: number | string;
  }>({});
  const [errors, setErrors] = useState<{ [k: string]: string }>({});

  const onClose = (saved: boolean = false) => {
    setErrors({});
    props.onClose(saved);
  };

  const onSave = () => {
    const isValid = validateHundredPercent();
    if (isValid) {
      // handle save
      const assignment = formatAssignments(
        localAssignments,
        props.underwriters
      );
      dispatch(
        updateAssignment({
          group: props.group,
          column: props.column,
          assignment,
          assignment_type: props.assignment_type,
        })
      );
      onClose(true);
      return;
    }
    setErrors({ save: "Percentages must add to 100%" });
  };

  const changeHandler = (key: string, val: string) => {
    setLocalAssignments((prev) => {
      return { ...prev, [key]: val };
    });
  };

  const onBlurInputs = () => {
    setErrors({});
    validateNumeric();
  };

  const validateNumeric = () => {
    setLocalAssignments((prev) => {
      return Object.fromEntries(
        Object.entries(prev).map(([name, pct]) => {
          if (isNaN(parseFloat(String(pct)))) return [name, 0];
          const val = parseFloat(String(pct));

          if (val > 100) return [name, 0];
          if (val < 0) return [name, 0];

          return [name, val];
        })
      );
    });
  };

  const validateHundredPercent = () => {
    const sumPcts = Object.values(localAssignments).reduce((prev, curr) => {
      const num = Number(String(curr));
      if (isNaN(num)) return prev;
      return num + Number(prev);
    }, 0);

    if (sumPcts === 100) return true;
    return false;
  };

  useEffect(() => {
    setLocalAssignments(
      Object.fromEntries(
        [...props.underwriters]
          .sort((a, b) => {
            return a.name < b.name ? -1 : 1;
          })
          .map((u) => {
            const a = props.assignments.find(
              (row) => row.underwriter.name === u.name
            );
            return [u.name, a ? a.allocation_pct * 100 : 0];
          })
      )
    );
  }, [props.underwriters, props.assignments]);

  return (
    <AppModal
      open={props.open}
      onClose={onClose}
      className="flex flex-col items-center bg-white"
    >
      <div className="mb-8 bg-slate-100 w-full px-12 py-8">
        <h3 className="text-xl">Enter splits!</h3>
      </div>
      <div className="w-80 px-12 flex flex-col mb-8">
        {localAssignments
          ? Object.entries(localAssignments).map(([name, pct]) => {
              return (
                <div key={name} className="grid grid-cols-2 items-center">
                  <label htmlFor={`pct-${name}`} className="text-left">
                    {name}
                  </label>
                  <div className="relative rounded-md">
                    <input
                      type="input"
                      id={`pct-${name}`}
                      className="w-28 text-right block w-full rounded-md border-0 pl-4 pr-6 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      value={pct}
                      onChange={(e) => changeHandler(name, e.target.value)}
                      onBlur={(e) => onBlurInputs()}
                    />

                    <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-slate-300 text-xs">
                      %
                    </div>
                  </div>
                </div>
              );
            })
          : null}
        <div className="flex flex-col mt-4">
          <div className="flex justify-end">
            <button
              className="rounded-md py-1 px-2 flex items-center bg-primary-500 text-white ring-2 ring-primary-500 hover:ring-primary-600 hover:bg-primary-600 transition ease duration-100"
              onClick={onSave}
            >
              <ArrowUpOnSquareIcon className="w-5 h-5 mr-1" />
              Save
            </button>
          </div>
          <p
            className={`mt-2 text-sm text-red-600 ${
              errors.save ? "" : "invisible"
            }`}
            id="save-error"
          >
            {errors.save ?? ""}
          </p>
        </div>
      </div>
    </AppModal>
  );
};

const formatAssignments = (
  a: { [k: string]: string | number },
  underwriters: Underwriter[]
): Assignment[] => {
  return Object.entries(a)
    .map(([name, pct]) => {
      const uw = underwriters.find((u) => u.name === name) as Underwriter;
      return { underwriter: uw, allocation_pct: Number(pct) * 0.01 };
    })
    .filter((row) => row.allocation_pct > 0);
};

export default MultipleAssignmentModal;
