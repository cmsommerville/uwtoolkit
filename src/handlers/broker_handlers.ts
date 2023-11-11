import {
  BrokerType,
  QuoteDataInterface,
  RulesetType,
  RuleAppliedDataInterface,
} from "../types/data";

/**
 *
 * @param data
 * @param rulesets
 * @param default_broker
 * @returns Returns the original data with the grouped broker names
 */
export const applyRulesets = (
  data: QuoteDataInterface[],
  rulesets: RulesetType[],
  default_broker: string = "Non-Premier Broker"
) => {
  const rule_applied_ids: Set<number> = new Set();
  let rule_applied_data: Omit<RuleAppliedDataInterface, "case_size">[] = [];

  // loop over the rulesets and apply to data rows in bulk
  // keep track of the ids that you assign by rule
  rulesets
    .filter((ruleset) => ruleset.group != null)
    .forEach((ruleset) => {
      const new_rows = data
        .filter((d) => {
          return ruleset.rules.reduce((prev, rule) => {
            if (!rule.field) return prev && false;
            if (rule.value == null) return prev && false;

            const field = d[rule.field];
            if (field == null) return prev && false;

            if (rule.operator === "in")
              return prev && !!rule.value.includes(String(field));
            const numField = Number(field);
            if (isNaN(numField)) return prev && false;

            // if (rule.operator === "eq") return prev && numField === rule.value;
            // if (rule.operator === "ne") return prev && numField !== rule.value;
            // if (rule.operator === "lt") return prev && numField < rule.value;
            // if (rule.operator === "le") return prev && numField <= rule.value;
            // if (rule.operator === "gt") return prev && numField > rule.value;
            // if (rule.operator === "ge") return prev && numField >= rule.value;
            return prev && false;
          }, true);
        })
        .map((row) => ({ ...row, group: ruleset.group as string }));

      rule_applied_data = [...rule_applied_data, ...new_rows];
      new_rows.forEach((item) => rule_applied_ids.add(item.id));
    });

  // find the rows that were unassigned by a rule and give them the default
  const missing_rows = data
    .filter((d) => {
      return !rule_applied_ids.has(d.id);
    })
    .map((row) => ({ ...row, group: default_broker }));
  rule_applied_data = [...rule_applied_data, ...missing_rows];
  return rule_applied_data;
};

/**
 *
 * @param data
 * @param oldBrokers
 * @returns Returns an array of BrokerTypes indicating whether any new brokers are encountered
 */
export const newBrokerAnalyzer = (
  data: QuoteDataInterface[],
  oldBrokers: BrokerType[] | null | undefined
): BrokerType[] => {
  const newBrokers = Array.from(new Set(data.map((d) => d.broker)).values());
  if (!oldBrokers) {
    return newBrokers.map((broker) => {
      return {
        name: broker,
        reviewed: "N",
      };
    });
  }

  const _oldBrokers = oldBrokers.map((broker) => broker.name);
  return newBrokers.map((broker) => {
    return { name: broker, reviewed: _oldBrokers.includes(broker) ? "Y" : "N" };
  });
};
