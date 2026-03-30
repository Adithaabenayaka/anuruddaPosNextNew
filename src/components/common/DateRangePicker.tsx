import React, { useEffect, useRef, useState } from "react";
import Icon from "./Icon";
import { formatDateRangeDisplay } from "@/utils/formatDateTimeUtils";
import { DateRange, Range } from "react-date-range";
import "react-date-range/dist/theme/default.css";
import "react-date-range/dist/styles.css";
import clsx from "clsx";

type DateRangePickerProps = {
  label?: string;
  customInputClassName?: string;
  placeHolder?: string;
  dateRange: Range[];
  setDateRange: (dateRange: Range[]) => void;
};

const DateRangePicker: React.FC<DateRangePickerProps> = ({
  label,
  customInputClassName = "",
  placeHolder = "Select date range",
  dateRange,
  setDateRange,
}) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex flex-col gap-2 w-full">
      {label && <label className="body-2-bold">{label}</label>}

      <div className="relative w-full" ref={wrapperRef}>
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className={clsx(
            `flex gap-2 w-full items-center justify-between rounded-md border border-gray-600 p-3 body-2-regular bg-white h-12 ${customInputClassName}`,
          )}
        >
          <span className="text-left text-gray-700">
            {formatDateRangeDisplay(dateRange) || placeHolder}
          </span>
          <Icon name="Calendar" className="w-5 h-5 text-blue-800" />
        </button>

        {open && (
          <div className="absolute left-0 top-full z-50 bg-white border shadow-lg rounded-md">
            <DateRange
              editableDateInputs={true}
              onChange={(item) => setDateRange([item?.selection])}
              moveRangeOnFirstSelection={false}
              ranges={dateRange}
              maxDate={new Date()}
              rangeColors={["#8BD766"]}
              showMonthAndYearPickers={false}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default DateRangePicker;
