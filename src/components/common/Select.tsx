import React from "react";
import ReactSelect, { StylesConfig } from "react-select";

interface Option {
  value: string;
  label: string;
}

interface SelectProps {
  options: Option[];
  placeholder?: string;
  onChange: (value: string) => void;
  className?: string;
  defaultValue?: string;
  value?: string;
  error?: string;
}

const customStyles: StylesConfig<Option, false> = {
  placeholder: (base, state) => ({
    ...base,
    color: state.isDisabled ? "#9ca3af" : "#7B7B7B",
    fontSize: "14px",
    fontFamily: "Plus Jakarta Sans, sans-serif",
  }),
  control: (base, state) => ({
    ...base,
    height: "48px",
    backgroundColor: "#FFFFFF",
    color: "#7B7B7B",
    borderColor: "#7B7B7B",
    boxShadow: state.isFocused ? "0 0 0 3px rgba(70, 95, 255, 0.1)" : "none",
    borderRadius: "8px",
    transition: "border-color 0.2s, box-shadow 0.2s",
    "&:hover": {
      borderColor: "#7B7B7B",
    },
    cursor: "pointer",
    fontFamily: "Plus Jakarta Sans, sans-serif",
    fontSize: "14px",
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected
      ? "#3A8B13"
      : state.isFocused
        ? "#EEF9E8"
        : "white",
    color: state.isSelected ? "white" : "#1A1A1A",
    ":hover": {
      backgroundColor: state.isSelected ? "#2D6C0F" : "#EEF9E8",
    },
    fontFamily: "Plus Jakarta Sans, sans-serif",
    fontSize: "14px",
    cursor: "pointer",
  }),
  input: (base) => ({
    ...base,
    fontSize: "14px",
    fontFamily: "Plus Jakarta Sans, sans-serif",
  }),
  singleValue: (base) => ({
    ...base,
    fontSize: "14px",
    fontFamily: "Plus Jakarta Sans, sans-serif",
    color: "#1A1A1A",
  }),
  indicatorSeparator: () => ({
    display: "none",
  }),
  dropdownIndicator: (base) => ({
    ...base,
    color: "#1A1A1A",
    svg: {
      width: "24px",
      height: "24px",
    },
    cursor: "pointer",
  }),
  menuPortal: (base) => ({
    ...base,
    zIndex: 9999,
  }),
};

const Select: React.FC<SelectProps> = ({
  options,
  placeholder = "Select an option",
  onChange,
  className = "",
  defaultValue = "",
  value,
  error,
}) => {
  const selectedOption =
    value !== undefined
      ? options.find((o) => o.value === value)
      : options.find((o) => o.value === defaultValue);

  return (
    <div className={`w-full ${className}`}>
      <ReactSelect
        options={options}
        placeholder={placeholder}
        styles={customStyles}
        value={selectedOption || null}
        onChange={(selected) => {
          if (selected) onChange(selected.value);
        }}
        isSearchable={false}
        classNamePrefix="react-select"
        menuPortalTarget={typeof window !== "undefined" ? document.body : null}
        menuPosition="fixed"
      />
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-500">{error}</p>
      )}
    </div>
  );
};

export default Select;
