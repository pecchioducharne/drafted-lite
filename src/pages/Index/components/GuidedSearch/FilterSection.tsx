
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { Check, ChevronDown, ChevronUp } from "lucide-react";

interface Filter {
  label: string;
  options: string[];
  multiSelect?: boolean;
}

interface FilterSectionProps {
  title: string;
  filters: Filter[];
}

const FilterSection = ({ title, filters }: FilterSectionProps) => {
  const [selectedValues, setSelectedValues] = useState<{ [key: string]: string[] }>({});
  const [openDropdowns, setOpenDropdowns] = useState<{ [key: string]: boolean }>({});

  const handleMultiSelectChange = (filterLabel: string, option: string) => {
    setSelectedValues((prev) => {
      const current = prev[filterLabel] || [];
      const newValues = current.includes(option)
        ? current.filter((value) => value !== option)
        : [...current, option];
      return { ...prev, [filterLabel]: newValues };
    });
  };

  const handleSingleSelectChange = (filterLabel: string, option: string) => {
    setSelectedValues((prev) => ({
      ...prev,
      [filterLabel]: [option],
    }));
  };

  const toggleDropdown = (filterLabel: string) => {
    setOpenDropdowns((prev) => ({
      ...prev,
      [filterLabel]: !prev[filterLabel],
    }));
  };

  const getSelectedValueDisplay = (filterLabel: string) => {
    const values = selectedValues[filterLabel] || [];
    if (values.length === 0) return `Select ${filterLabel}`;
    if (values.length === 1) return values[0];
    return `${values.length} ${filterLabel} selected`;
  };

  const renderFilter = (filter: Filter) => {
    // For Type filter (single select)
    if (filter.label === "Type") {
      return (
        <Select
          onValueChange={(value) => handleSingleSelectChange(filter.label, value)}
          value={(selectedValues[filter.label] || [])[0]}
        >
          <SelectTrigger className="w-full bg-white/50">
            <SelectValue placeholder={`Select ${filter.label}`}>
              {getSelectedValueDisplay(filter.label)}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {filter.options.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    // For all other filters (multi-select with collapsible)
    return (
      <Collapsible
        open={openDropdowns[filter.label]}
        onOpenChange={() => toggleDropdown(filter.label)}
        className="w-full"
      >
        <CollapsibleTrigger asChild>
          <Button
            variant="outline"
            className="w-full flex items-center justify-between bg-white/50"
          >
            <span>{getSelectedValueDisplay(filter.label)}</span>
            {openDropdowns[filter.label] ? (
              <ChevronUp className="h-4 w-4 opacity-50" />
            ) : (
              <ChevronDown className="h-4 w-4 opacity-50" />
            )}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="relative w-full border border-gray-200 rounded-md bg-white mt-1 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2">
          <div className="p-3 max-h-[200px] overflow-y-auto">
            {filter.options.map((option) => (
              <div
                key={option}
                className="flex items-center space-x-2 p-1 cursor-pointer hover:bg-gray-100 rounded"
                onClick={() => handleMultiSelectChange(filter.label, option)}
              >
                <div
                  className={`w-4 h-4 border rounded flex items-center justify-center ${
                    (selectedValues[filter.label] || []).includes(option)
                      ? "bg-blue-500 border-blue-500"
                      : "border-gray-300"
                  }`}
                >
                  {(selectedValues[filter.label] || []).includes(option) && (
                    <Check className="h-3 w-3 text-white" />
                  )}
                </div>
                <span className="text-sm">{option}</span>
              </div>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    );
  };

  return (
    <div>
      <h3 className="font-medium mb-4">{title}</h3>
      <div className="space-y-4">
        {filters.map((filter) => (
          <div key={filter.label}>
            <label className="text-sm text-gray-600 block mb-2">
              {filter.label}
            </label>
            {renderFilter(filter)}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FilterSection;

