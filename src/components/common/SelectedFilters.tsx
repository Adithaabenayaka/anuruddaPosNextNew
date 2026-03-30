import React from "react";
import Icon from "./Icon";
import { getLabel } from "@/utils/labelMappingUtils";
import { formatValue } from "@/utils/formatKeyUtils";

type SelectedFiltersProps<T> = {
  params: T;
  removeFilter: (key: keyof T) => void;
  labelMapping?: Record<string, string>;
};

const SelectedFilters = <T extends object>({
  params,
  removeFilter,
  labelMapping,
}: SelectedFiltersProps<T>) => {
  const activeFilters = Object.entries(params)
    .filter(
      ([, value]) => value !== undefined && value !== null && value !== "",
    )
    .map(([key, value]) => ({
      label: key,
      value: Array.isArray(value) ? value.join(", ") : String(value),
    }));

  if (activeFilters.length === 0) return null;

  return (
    <div className="flex gap-3 flex-1 flex-row overflow-x-auto custom-scrollbar w-full overflow-y-hidden">
      {activeFilters.map((filter) => (
        <div
          key={filter.label}
          className="flex w-fit items-center justify-between gap-2 h-8 bg-white p-2 rounded-lg"
        >
          <p className="flex body-3-regular text-gray-700 w-full items-center gap-1 whitespace-nowrap">
            <span>
              {labelMapping?.[filter?.label] ?? formatValue(filter?.label)}
            </span>
            <span>:</span>
            <span className="body-3-bold">{getLabel(filter.value)}</span>
          </p>
          <button
            type="button"
            aria-label="remove filter"
            onClick={() => removeFilter(filter.label as keyof T)}
          >
            <Icon
              name="CloseCircle"
              className="cursor-pointer w-4 h-4 text-gray-700 hover:text-green-700 transition-colors"
            />
          </button>
        </div>
      ))}
    </div>
  );
};

export default SelectedFilters;
