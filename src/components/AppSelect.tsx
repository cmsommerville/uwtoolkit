import { MultiSelect, MultiSelectProps } from "primereact/multiselect";
import { Dropdown, DropdownProps } from "primereact/dropdown";

import "./AppSelect.css";

export const AppSelect = (props: DropdownProps) => {
  return <Dropdown {...props} />;
};

export const AppMultiSelect = (props: MultiSelectProps) => {
  return (
    <MultiSelect
      maxSelectedLabels={3}
      display="chip"
      className="w-full"
      {...props}
    />
  );
};
