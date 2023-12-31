import {
  forwardRef,
  Fragment,
  useState,
  useEffect,
  useMemo,
  LegacyRef,
} from "react";
import { Menu, Transition } from "@headlessui/react";
import ListRule from "./ListRule";
import { CASE_DATA_COLUMN_MAPPER } from "../../config";
import { v4 as uuid } from "uuid";
import {
  DocumentCheckIcon,
  ChevronDownIcon,
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

const EditRuleset = forwardRef(
  (
    { ruleset, onSave, onCancel }: EditRulesetProps,
    ref: LegacyRef<HTMLDivElement>
  ) => {
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

    const dropdown_options: DropdownOptionProps[] = [
      {
        name: "Cancel",
        icon: <XMarkIcon />,
        onClick: cancelHandler,
      },
      {
        name: "Add Rule",
        icon: <PlusIcon />,
        onClick: addNewRule,
      },
    ];

    useEffect(() => {
      setLocalRuleset({ ...ruleset });
    }, [ruleset]);

    return (
      <div
        ref={ref}
        className="flex justify-between items-start px-4 py-4 bg-slate-50 shadow rounded-md "
      >
        <div className="pl-4 flex flex-col">
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
                            className="text-slate-500 hover:text-red-500 transition duration-100"
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

          <div className="relative w-full flex flex-row justify-end items-center">
            <div className="flex justify-end items-end space-x-4 my-4 mr-12">
              <button
                className="flex items-center bg-primary-500 ring-2 ring-primary-500 rounded px-2 py-1 shadow text-white hover:bg-primary-600 hover:ring-primary-600 disabled:bg-slate-400 disabled:ring-slate-400 transition duration-100"
                disabled={!isValidRuleset}
                onClick={saveRuleset}
              >
                <DocumentCheckIcon className="w-5 h-5 mr-2" />
                <span>Save</span>
              </button>

              <Dropdown options={dropdown_options} />
            </div>
          </div>
        </div>
      </div>
    );
  }
);

interface DropdownOptionProps {
  name: string;
  icon: React.ReactNode;
  onClick: () => void;
}

interface DropdownProps {
  options: DropdownOptionProps[];
}

const Dropdown = ({ options }: DropdownProps) => {
  return (
    <div className="text-right">
      <Menu as="div" className="relative inline-block text-left">
        <div>
          <Menu.Button className="flex items-center bg-transparent ring-2 ring-slate-700 rounded px-2 py-1 shadow text-slate-700 hover:ring-slate-800 transition duration-100">
            Options
            <ChevronDownIcon
              className="ml-2 -mr-1 h-5 w-5"
              aria-hidden="true"
            />
          </Menu.Button>
        </div>
        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items className="absolute z-20 right-0 mt-2 w-36 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none">
            <div className="px-1 py-1 ">
              {options.map((item) => {
                return (
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        className={`${
                          active ? "bg-primary-500 text-white" : "text-gray-900"
                        } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                        onClick={item.onClick}
                      >
                        {active ? (
                          <div className="flex items-center space-x-2">
                            <div className="w-5 h-5">{item.icon}</div>
                            <span>{item.name}</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <div className="w-5 h-5">{item.icon}</div>
                            <span>{item.name}</span>
                          </div>
                        )}
                      </button>
                    )}
                  </Menu.Item>
                );
              })}
            </div>
          </Menu.Items>
        </Transition>
      </Menu>
    </div>
  );
};

export default EditRuleset;
