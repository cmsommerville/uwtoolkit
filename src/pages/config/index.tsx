"use client";
import RulesetList from "./RulesetList";
import AppPanel from "../../components/AppPanel";

const Config = () => {
  return (
    <div className="grid grid-cols-4 gap-8">
      <AppPanel className="col-span-3 h-min">
        <RulesetList />
      </AppPanel>

      <div className="flex flex-col space-y-8">
        <AppPanel className="lg:px-8 lg:py-8 space-y-6">
          <div className="space-y-3">
            <h3 className="text-slate-600">
              Click to the left to add new Premier Broker rulesets!
            </h3>
          </div>

          <p className="text-slate-400 text-sm">
            For each row, you can add complex rules or keep it simple. For
            example, you might want to create a rule called "Captives" that has
            brokers equal to "BeneRe" and the Captive indicator equal to "Y".
          </p>
          <p className="text-slate-400 text-sm">
            If more than one ruleset can apply to a quote, the first will be
            applied. Reorder the rules by dragging by their handles.
          </p>
        </AppPanel>
      </div>
    </div>
  );
};

export default Config;
