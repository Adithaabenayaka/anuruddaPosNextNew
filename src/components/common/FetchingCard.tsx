import React from "react";

type CardItem = {
  label: string;
  value: React.ReactNode;
};

interface FetchingCardProps {
  lArray: CardItem[];
  rArray: CardItem[];
}

const FetchingCard: React.FC<FetchingCardProps> = ({ lArray, rArray }) => {
  return (
    <div className="border border-[#7B7B7B] w-full h-[172px rounded-lg p-6 flex flex-col gap-y-3">
      {/* Desktop */}
      <div className="hidden lg:flex xlg:hidden dxl:flex h-full">
        {/* Left column */}
        <div className="w-full">
          {lArray.map((item, index) => (
            <div
              key={index}
              className={`flex items-center justify-between text-[14px] leading-5 ${
                index !== lArray.length - 1
                  ? "border-b border-b-[#DADADA] pb-4"
                  : "pt-4"
              } ${index !== 0 && index !== lArray.length - 1 ? "py-4" : ""}`}
            >
              <div>{item.label}</div>
              <div>{item.value}</div>
            </div>
          ))}
        </div>

        <div className="w-px border border-[#9F9F9F] h-auto mx-6" />

        {/* Right column */}
        <div className="w-full">
          {rArray.map((item, index) => (
            <div
              key={index}
              className={`flex items-center justify-between text-[14px] leading-5 ${
                index !== rArray.length - 1
                  ? "border-b border-b-[#DADADA] pb-4"
                  : "pt-4"
              } ${index !== 0 && index !== rArray.length - 1 ? "py-4" : ""}`}
            >
              <div>{item.label}</div>
              <div>{item.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* tab */}
      <div className="lg:hidden xlg:flex dxl:hidden flex-col h-full">
        {[...lArray, ...rArray].map((item, index, arr) => (
          <div
            key={index}
            className={`flex items-center justify-between text-[14px] leading-5 ${
              index === 0
                ? "border-b border-b-[#DADADA] pb-4"
                : index !== arr.length - 1
                  ? "border-b border-b-[#DADADA] pb-4 pt-4"
                  : "pt-4"
            }`}
          >
            <div>{item.label}</div>
            <div>{item.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FetchingCard;
