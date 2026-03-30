"use client";

import Icon from "./Icon";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "react-datepicker/dist/react-datepicker.min.css";
import "../../styles/singleDatePickerStyles.css";
import { format } from "date-fns";
import React, { useState } from "react";
import Input from "../form/input/InputField";

type SingleDatePickerProps = {
  label: string;
  setSelectedDate: (date: Date | null) => void;
  selectedDate: Date | null;
};
export const SingleDatePicker: React.FC<SingleDatePickerProps> = ({
  label,
  setSelectedDate,
  selectedDate,
}) => {
  const [openCalendar, setOpenCalendar] = useState<boolean>(false);
  return (
    <div className="relative w-full">
      <div className="flex w-full flex-col">
        <label className="body-2-regular text-black pb-2" htmlFor="date">
          {label}
        </label>

        <DatePicker
          selected={selectedDate}
          onChange={setSelectedDate}
          showIcon={false}
          placeholderText="Pick a date"
          maxDate={new Date()}
          disabledKeyboardNavigation
          shouldCloseOnSelect={false}
          showYearDropdown
          dateFormatCalendar="MMMM"
          yearDropdownItemNumber={5}
          yearItemNumber={5}
          scrollableYearDropdown
          closeOnScroll
          dropdownMode="scroll"
          showMonthDropdown
          // fixedHeight
          dayClassName={(date) => {
            const formatted = format(date, "yyyy-MM-dd");
            return selectedDate &&
              formatted === format(selectedDate, "yyyy-MM-dd")
              ? "!bg-[#52C41A] !rounded-full"
              : "";
          }}
          onCalendarOpen={() => openCalendar}
          customInput={
            <Input
              className="body-2-regular"
              placeholder="Enter Amount"
              value={selectedDate?.toString()}
              onClick={() => setOpenCalendar(true)}
            />
          }
        />
      </div>

      <span className="absolute right-3 top-5 translate-y-5 cursor-pointer">
        <Icon name="Calendar" className="w-5 h-5 text-black" />
      </span>
    </div>
  );
};
