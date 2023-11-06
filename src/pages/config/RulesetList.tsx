import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import EditRuleset from "./EditRuleset";
import DisplayRuleset from "./DisplayRuleset";
import { RulesetType } from "../../types/rulesets";
import { PlusIcon } from "@heroicons/react/24/outline";
import { v4 as uuid } from "uuid";
import { saveRulesets } from "../../store/slices/rulesets";
import { setRuleAppliedData } from "../../store/slices/derived_data";
import { db } from "../../store/local_storage";
import { KEY_RULESETS } from "../../store/constants";

const RulesetList = () => {
  const dispatch = useDispatch();
  const storeRulesets = useSelector((state: any) => state.rulesets);
  const quotes = useSelector((state: any) => state.quotes);
  const case_sizes = useSelector((state: any) => state.config.case_sizes);

  const [rulesetList, setRulesetList] = useState<RulesetType[]>([add()]);
  const [editingKey, setEditingKey] = useState<string>();

  const addRuleset = () => {
    const newRuleset = add();
    setEditingKey(newRuleset.key);
    setRulesetList((prev) => [...prev, newRuleset]);
  };

  const deleteRuleset = (ruleset: RulesetType) => {
    setRulesetList((prev) => {
      const newRulesetList = prev.filter((r) => r.key !== ruleset.key);
      dispatch(saveRulesets(newRulesetList));
      dispatch(
        setRuleAppliedData({
          quotes,
          rulesets: newRulesetList,
          assignments: undefined,
          case_sizes,
        })
      );
      db.setItem(KEY_RULESETS, newRulesetList);
      return newRulesetList;
    });
  };

  const cancelHandler = (ruleset: RulesetType) => {
    if (ruleset && !ruleset.group) {
      deleteRuleset(ruleset);
    }
    setEditingKey(undefined);
  };

  const saveRulesetHandler = (ruleset: RulesetType) => {
    const editedIndex = rulesetList.findIndex((r) => r.key === ruleset.key);
    const _rulesets = [...rulesetList];
    _rulesets.splice(editedIndex, 1, ruleset);

    dispatch(saveRulesets(_rulesets));
    dispatch(
      setRuleAppliedData({
        quotes,
        rulesets: _rulesets,
        assignments: undefined,
        case_sizes,
      })
    );

    setRulesetList(_rulesets);
    db.setItem(KEY_RULESETS, _rulesets);
    setEditingKey(undefined);
  };

  useEffect(() => {
    if (!storeRulesets.length) return;
    setRulesetList(storeRulesets);
  }, [storeRulesets]);

  return (
    <div className="relative">
      {editingKey ? null : (
        <button
          className="z-20 absolute -bottom-12 -right-12 w-12 h-12 p-3 flex justify-center items-center rounded-full bg-primary-500 ring-2 ring-primary-500 text-white hover:bg-primary-700 hover:ring-primary-700 transition duration-100 shadow"
          onClick={addRuleset}
        >
          <PlusIcon className="" />
        </button>
      )}

      <div className="space-y-4">
        {rulesetList.map((ruleset) => {
          if (editingKey === ruleset.key) {
            return (
              <EditRuleset
                key={ruleset.key}
                ruleset={ruleset}
                onSave={saveRulesetHandler}
                onCancel={() => cancelHandler(ruleset)}
              />
            );
          }
          return (
            <DisplayRuleset
              key={ruleset.key}
              ruleset={ruleset}
              onEdit={(ruleset) => setEditingKey(ruleset.key)}
              onDelete={deleteRuleset}
            />
          );
        })}
      </div>
    </div>
  );
};

const add = (): RulesetType => {
  return {
    key: uuid(),
    group: undefined,
    rules: [
      {
        key: uuid(),
        field: undefined,
        operator: "in" as const,
        value: undefined,
      },
    ],
  };
};

export default RulesetList;
