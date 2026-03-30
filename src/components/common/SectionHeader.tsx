"use client";
import React from "react";
import Icon from "./Icon";
import Search from "./Search";
import { useRouter } from "next/navigation";

type SectionHeaderProps = {
  title: string;
  setSearchQuery: (searchQuery: string) => void;
  onClickFilter?: () => void;
  extraContentRight?: React.ReactElement;
  extraContentLeft?: React.ReactElement;
  filterPopup?: boolean;
};

const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  setSearchQuery,
  onClickFilter,
  extraContentLeft,
  extraContentRight,
  filterPopup = true,
}) => {
  const router = useRouter();
  return (
    <div className="flex md:flex-row flex-col w-full gap-6 md:h-11 pt-6 md:pt-0 text-black justify-start md:justify-between items-start md:items-center body-2-regular">
      <div className="flex gap-2 items-center w-full">
        <Icon
          name="ArrowLeft"
          className="cursor-pointer"
          onClick={() => router.back()}
        />
        <h5 className="heading-5-bold">{title}</h5>
      </div>
      <div className="flex gap-4 w-full md:justify-end md:flex-row flex-col">
        <div className="flex w-full md:w-auto">{extraContentLeft}</div>
        <Search
          setSearchQuery={(value) => setSearchQuery(value)}
          className="w-full md:w-75!"
        />
        <div className="flex w-full md:w-auto gap-4">
          {filterPopup && (
            <button
              className="flex items-center p-4 h-11 rounded-lg border border-gray-400 gap-2 w-full md:w-auto justify-center"
              onClick={onClickFilter}
            >
              <Icon name="Filter" className="text-black" />
              <p>Filter</p>
            </button>
          )}
          {extraContentRight}
        </div>
      </div>
    </div>
  );
};

export default SectionHeader;
