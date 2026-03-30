import React from "react";
import { TextField } from "@radix-ui/themes";
import Icon from "./Icon";
import clsx from "clsx";

type SearchProps = {
  placeholder?: string;
  setSearchQuery: (searchQuery: string) => void;
  className?: string;
};

const Search: React.FC<SearchProps> = ({
  placeholder = "Search...",
  setSearchQuery,
  className = "",
}) => {
  return (
    <TextField.Root
      onChange={(e) => setSearchQuery(e.target.value)}
      placeholder={placeholder}
      className={clsx(
        "flex body-2-regular bg-white border border-gray-400 rounded-lg justify-between p-2 h-11 md:w-75 w-full focus-within:border-gray-400 focus-within:ring-0 focus-within:outline-none [&_input]:outline-none [&_input]:border-none [&_input]:ring-0 [&_input:focus]:outline-none [&_input:focus]:ring-0 [&_input::placeholder]:text-black",
        className,
      )}
    >
      <TextField.Slot>
        <Icon name="Search" className="w-[22px] h-[22px]" />
      </TextField.Slot>
    </TextField.Root>
  );
};

export default Search;
