import { useMemo } from "react";
import { AppMultiSelect, AppSelect } from "../../components/AppSelect";
import { useSelector } from "react-redux";
import { QuoteDataInterface } from "../../types/upload_file";
import { ListRuleType } from "../../types/rulesets";

interface NameCode {
  name: string;
  code: string;
}

interface Props {
  onChange: (selection: ListRuleType) => void;
  fields: NameCode[];
  selection: ListRuleType;
}

const ListRule = ({ fields, onChange, selection }: Props) => {
  const quotes: QuoteDataInterface[] = useSelector(
    (state: any) => state.quotes
  );

  const val = useMemo(() => {
    const col = fields.find((f) => f.code === selection.field);
    return {
      code: selection.field,
      name: col?.name ?? selection.field,
    };
  }, [selection, fields]);

  const options = useMemo(() => {
    if (!quotes) return [];
    if (quotes.length === 0) return [];
    if (!selection.field) return [];

    const is_numeric = !isNaN(
      Number(quotes[0][selection.field as keyof QuoteDataInterface])
    );

    if (is_numeric) return [];

    const vals = Array.from(
      new Set(
        quotes.map((q) => q[selection.field as keyof QuoteDataInterface])
      ).values()
    )
      .filter((d) => d != null)
      .map((d) => {
        return {
          code: d,
          name: d,
        };
      }) as NameCode[];

    return vals.sort((a, b) => (a.name < b.name ? -1 : 1));
  }, [quotes, selection]);

  return (
    <div className="w-full grid grid-cols-8 gap-x-6 items-start">
      <div className="col-span-3">
        <AppSelect
          value={val}
          onChange={(e) => {
            onChange({
              ...selection,
              field: e.value.code,
              value: [],
            });
          }}
          options={fields}
          optionLabel="name"
          placeholder="Field"
          className="w-full border border-slate-300"
        />
      </div>
      <div className="col-span-5">
        <AppMultiSelect
          value={selection.value?.map((v) => ({ name: v, code: v }))}
          onChange={(e) => {
            onChange({
              ...selection,
              value: e.value.map((opt: NameCode) => opt.name),
            });
            // setSelectedOptions(e.value);
          }}
          options={options}
          optionLabel="name"
          placeholder="Select Options"
          maxSelectedLabels={3}
          display="chip"
        />
      </div>
    </div>
  );
};

export default ListRule;
