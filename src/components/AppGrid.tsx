"use client";
import { CSSProperties } from "react";
import { AgGridReact, AgGridReactProps } from "ag-grid-react"; // the AG Grid React Component
import { GRID_COLUMN_TYPES } from "./app_grid_config";
import "ag-grid-community/styles/ag-grid.css"; // Core grid CSS, always needed
import "ag-grid-community/styles/ag-theme-alpine.css"; // Optional theme CSS
import "./AppGrid.css";

interface Props extends AgGridReactProps {
  style?: CSSProperties;
}

export default function AppGrid({
  defaultColDef,
  columnTypes,
  className,
  style,
  ...props
}: Props) {
  return (
    <div className={`ag-theme-alpine ${className}`} style={style}>
      <AgGridReact
        defaultColDef={{
          sortable: true,
          filter: true,
          resizable: true,
          ...defaultColDef,
        }}
        columnTypes={{ ...GRID_COLUMN_TYPES, ...columnTypes }}
        {...props}
      />
    </div>
  );
}
