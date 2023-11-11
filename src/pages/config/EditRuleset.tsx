import { useState, useEffect, useMemo } from "react";
import ListRule from "./ListRule";
import { CASE_DATA_COLUMN_MAPPER } from "../../config";
import { v4 as uuid } from "uuid";
import {
  DocumentCheckIcon,
  PlusIcon,
  XCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import {
  ListRuleType,
  QuoteDataInterface,
  RulesetType,
} from "../../types/data";

const addRule = () => {
  return {
    key: uuid(),
    field: "broker" as keyof QuoteDataInterface,
    operator: "in" as const,
    value: undefined,
  };
};

const DEFAULT_RULESET: RulesetType = {
  key: "",
  group: "",
  rules: [],
};

interface EditRulesetProps {
  ruleset: RulesetType;
  onSave: (ruleset: RulesetType) => void;
  onCancel: () => void;
}

const EditRuleset = ({ ruleset, onSave, onCancel }: EditRulesetProps) => {
  const [localRuleset, setLocalRuleset] =
    useState<RulesetType>(DEFAULT_RULESET);

  const fields = useMemo(() => {
    return CASE_DATA_COLUMN_MAPPER.filter((item) => {
      return item.type === "text";
    }).map((item) => {
      return { name: item.label, code: item.key };
    });
  }, []);

  const localRuleUpdater = (rule: ListRuleType) => {
    setLocalRuleset((prev) => {
      if (!prev) return prev;
      const editedRuleIndex = prev.rules.findIndex((r) => r.key === rule.key);
      const rules = [...prev.rules];
      rules.splice(editedRuleIndex, 1, rule);
      return { ...prev, rules: [...rules] };
    });
  };

  const localGroupUpdater = (group: string) => {
    setLocalRuleset((prev) => {
      if (!prev) return prev;
      return { ...prev, group };
    });
  };

  const addNewRule = () => {
    setLocalRuleset((prev) => {
      if (!prev) return prev;
      return { ...prev, rules: [...prev.rules, addRule()] };
    });
  };

  const deleteRule = (key: string) => {
    setLocalRuleset((prev) => {
      if (!prev) return prev;
      return { ...prev, rules: prev.rules.filter((p) => p.key !== key) };
    });
  };

  const cancelHandler = () => {
    onCancel();
  };

  const isValidRuleset = useMemo(() => {
    if (!localRuleset) return false;
    if (!localRuleset.group) return false;

    return localRuleset.rules.reduce((prev, rule) => {
      if (!rule.field) return prev && false;
      if (!rule.operator) return prev && false;
      if (!rule.value) return prev && false;
      if (rule.value.length <= 0) return prev && false;
      return prev && true;
    }, true);
  }, [localRuleset]);

  const saveRuleset = () => {
    onSave(localRuleset);
  };

  useEffect(() => {
    setLocalRuleset({ ...ruleset });
  }, [ruleset]);

  return (
    <div>
      <div className="grid grid-cols-12 gap-x-8">
        <div className="col-span-3">
          <input
            name="group"
            id="group"
            className="px-4 block w-full rounded-md border border-slate-300 py-1.5 text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-primary-600 outline-none sm:text-xs sm:leading-6"
            placeholder="e.g. Marsh & McLennan"
            value={localRuleset.group}
            onChange={(e) => localGroupUpdater(e.target.value)}
          />
        </div>

        <div className="col-span-9 flex flex-col space-y-2">
          {localRuleset
            ? localRuleset.rules.map((r) => {
                return (
                  <div className="flex space-x-4 items-center" key={r.key}>
                    <ListRule
                      onChange={(selection) => localRuleUpdater(selection)}
                      fields={fields}
                      selection={r}
                    />
                    {localRuleset.rules.length <= 1 ? (
                      <div className="w-8 h-8"></div>
                    ) : (
                      <button
                        className="text-red-700 hover:text-red-500 transition duration-100"
                        onClick={() => deleteRule(r.key)}
                      >
                        <XCircleIcon className="w-6 h-6" />
                      </button>
                    )}
                  </div>
                );
              })
            : null}
        </div>
      </div>

      <div className="flex justify-between items-center">
        <button
          className="flex items-center bg-transparent ring-2 ring-primary-500 rounded px-2 py-1 shadow text-primary-500 hover:ring-primary-700 hover:text-primary-700 transition duration-100"
          onClick={addNewRule}
        >
          <PlusIcon className="w-5 h-5 mr-1" />
          <span>Add Rule</span>
        </button>
        <div className="flex justify-end items-end space-x-4 my-4 mr-12">
          <button
            className="flex items-center bg-primary-500 ring-2 ring-primary-500 rounded px-2 py-1 shadow text-white hover:bg-primary-600 hover:ring-primary-600 disabled:bg-slate-400 disabled:ring-slate-400 transition duration-100"
            disabled={!isValidRuleset}
            onClick={saveRuleset}
          >
            <DocumentCheckIcon className="w-5 h-5 mr-2" />
            <span>Save</span>
          </button>

          <button
            className="flex items-center bg-transparent ring-2 ring-slate-700 rounded px-2 py-1 shadow text-slate-700 hover:ring-slate-800 transition duration-100"
            onClick={cancelHandler}
          >
            <XMarkIcon className="w-5 h-5 mr-2" />
            <span>Cancel</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditRuleset;
