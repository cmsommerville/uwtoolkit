import { useState, useEffect, forwardRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import EditRuleset from "./EditRuleset";
import DisplayRuleset from "./DisplayRuleset";
import { RulesetType } from "../../types/data";
import { PlusIcon } from "@heroicons/react/24/outline";
import { v4 as uuid } from "uuid";
import { calcRuleAppliedData, setRulesets } from "../../store/slices/data";
import { db } from "../../store/local_storage";
import { KEY_RULESETS } from "../../store/constants";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import SixDotsIcon from "../../icons/drag-dots-svgrepo-com.svg?react";

const RulesetList = () => {
  const dispatch = useDispatch();
  const storeRulesets = useSelector((state: any) => state.data.rulesets);

  const [rulesetList, setRulesetList] = useState<RulesetType[]>([add()]);
  const [editingKey, setEditingKey] = useState<string>();

  const addRuleset = () => {
    const newRuleset = add();
    setEditingKey(newRuleset.key);
    setRulesetList((prev) => [...prev, newRuleset]);
  };

  const reorderRuleset = (draggable: any) => {
    setRulesetList((prev) => {
      if (!draggable.destination) return prev;
      if (!draggable.source) return prev;
      const p = [...prev];
      const [draggedItem] = p.splice(draggable.source.index, 1);
      p.splice(draggable.destination.index, 0, draggedItem);
      return [...p];
    });
  };

  const deleteRuleset = (ruleset: RulesetType) => {
    setRulesetList((prev) => {
      const tmpRulesetList = prev.filter((r) => r.key !== ruleset.key);
      const newRulesetList =
        tmpRulesetList.length === 0 ? prev : tmpRulesetList;
      dispatch(setRulesets(newRulesetList));
      dispatch(
        calcRuleAppliedData({
          rulesets: newRulesetList,
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

    dispatch(setRulesets(_rulesets));
    dispatch(
      calcRuleAppliedData({
        rulesets: _rulesets,
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
          className="z-20 absolute -bottom-16 -right-16 w-12 h-12 p-3 flex justify-center items-center rounded-full bg-primary-500 ring-2 ring-primary-500 text-white hover:bg-primary-700 hover:ring-primary-700 transition duration-100 shadow"
          onClick={addRuleset}
        >
          <PlusIcon className="" />
        </button>
      )}

      <DragDropContext onDragEnd={reorderRuleset}>
        <Droppable droppableId="ruleset-list">
          {(provided) => {
            return (
              <div
                className="space-y-4"
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                {rulesetList.map((ruleset, ix) => {
                  if (editingKey === ruleset.key) {
                    return (
                      <EditRuleset
                        ruleset={ruleset}
                        onSave={saveRulesetHandler}
                        onCancel={() => cancelHandler(ruleset)}
                      />
                    );
                  }

                  return (
                    <Draggable
                      key={ruleset.key}
                      draggableId={ruleset.key ?? "xasdfa"}
                      index={ix}
                    >
                      {(prov) => {
                        return (
                          <DisplayRuleset
                            ruleset={ruleset}
                            onEdit={(ruleset) => setEditingKey(ruleset.key)}
                            onDelete={deleteRuleset}
                            ref={prov.innerRef}
                            {...prov.draggableProps}
                          >
                            <div
                              className="h-4 w-4 text-slate-400"
                              {...prov.dragHandleProps}
                            >
                              <SixDotsIcon />
                            </div>
                          </DisplayRuleset>
                        );
                      }}
                    </Draggable>
                  );
                })}
                {provided.placeholder}
              </div>
            );
          }}
        </Droppable>
      </DragDropContext>
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
        field: "broker",
        operator: "in" as const,
        value: undefined,
      },
    ],
  };
};

export default RulesetList;
