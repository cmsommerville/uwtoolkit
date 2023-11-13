import { forwardRef } from "react";
import { RulesetType } from "../../types/data";
import { CASE_DATA_COLUMN_MAPPER } from "../../config";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface DisplayRulesetProps {
  ruleset: RulesetType;
  onEdit: (ruleset: RulesetType) => void;
  onDelete: (ruleset: RulesetType) => void;
  children: React.ReactNode;
}

const DisplayRuleset = forwardRef<HTMLDivElement, DisplayRulesetProps>(
  ({ ruleset, onDelete, onEdit, ...props }, ref) => {
    const listDisplayHandler = (values: string[] | undefined) => {
      if (!values) return "";
      if (values.length === 1) return values.join("");
      if (values.length === 2) return values.join(" and ");
      const last_value = values[values.length - 1];
      const other_values = values.slice(0, -1);
      return other_values.join(", ") + ", and " + last_value;
    };

    const fieldDisplayHandler = (field: string | undefined) => {
      const opt = CASE_DATA_COLUMN_MAPPER.find((opt) => opt.key === field);
      if (opt) return opt.label;
      return field;
    };

    if (!ruleset.group) {
      return (
        <div
          ref={ref}
          className="relative w-full flex justify-between items-center px-4 py-4 bg-slate-50 shadow rounded-md"
          {...props}
        >
          <div className="">
            <button
              className=" font-semibold text-primary-500 hover:text-primary-700 transition duration-100"
              onClick={() => onEdit(ruleset)}
            >
              Click to add a Premier Broker!
            </button>
          </div>
          <button
            className="absolute top-1 right-1 text-slate-500 hover:text-slate-900 transition duration-100"
            onClick={() => {
              onDelete(ruleset);
            }}
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className="relative w-full flex justify-between items-center px-4 py-4 bg-slate-50 shadow rounded-md"
        {...props}
      >
        <div className="grid grid-cols-5 space-x-4 w-full">
          <div className="flex items-center space-x-2">
            {/* <div className="h-4 w-4 text-slate-400">
              <SixDotsIcon />
            </div> */}
            {props.children}
            <h3 className="text-slate-600 text-md font-semibold">
              <button
                className="text-primary-500 hover:text-primary-700 transition duration-100"
                onClick={() => {
                  console.log(ruleset);
                  onEdit(ruleset);
                }}
              >
                {ruleset.group}
              </button>
            </h3>
          </div>
          <div className="col-span-4 flex flex-col space-y-1">
            {ruleset.rules.map((rule) => {
              return (
                <p key={rule.key} className="text-slate-400 text-sm">
                  {fieldDisplayHandler(rule.field)} equal to{" "}
                  <span className="font-semibold">
                    {listDisplayHandler(rule.value)}
                  </span>
                </p>
              );
            })}
          </div>
        </div>

        <button
          className="absolute top-1 right-1 text-slate-500 hover:text-slate-900 transition duration-100"
          onClick={() => onDelete(ruleset)}
        >
          <XMarkIcon className="w-4 h-4" />
        </button>
      </div>
    );
  }
);

export default DisplayRuleset;
