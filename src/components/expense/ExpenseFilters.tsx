import { Category } from "../../types/expense";
import { Button } from "../ui/button";
import { Calendar } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../ui/popover";
import { Calendar as CalendarComponent } from "../ui/calendar";
import { format } from "date-fns";
import { cn } from "../../lib/utils";

interface ExpenseFiltersProps {
  categories: Category[];
  selectedCategory: string;
  selectedType: "all" | "fixed" | "variable";
  dateRange: { start: Date | undefined; end: Date | undefined };
  onCategoryChange: (value: string) => void;
  onTypeChange: (value: "all" | "fixed" | "variable") => void;
  onDateRangeChange: (range: {
    start: Date | undefined;
    end: Date | undefined;
  }) => void;
}

export function ExpenseFilters({
  categories,
  selectedCategory,
  selectedType,
  dateRange,
  onCategoryChange,
  onTypeChange,
  onDateRangeChange,
}: ExpenseFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <Select value={selectedType} onValueChange={onTypeChange}>
        <SelectTrigger className="w-full sm:w-[140px]">
          <SelectValue placeholder="Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          <SelectItem value="fixed">Fixed</SelectItem>
          <SelectItem value="variable">Variable</SelectItem>
        </SelectContent>
      </Select>

      <Select value={selectedCategory} onValueChange={onCategoryChange}>
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          {categories
            .filter(
              (cat) => selectedType === "all" || cat.type === selectedType
            )
            .map((cat) => (
              <SelectItem key={cat.id} value={cat.id.toString()}>
                {cat.name}
              </SelectItem>
            ))}
        </SelectContent>
      </Select>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full sm:w-[240px] justify-start text-left font-normal"
            )}
          >
            <Calendar className="mr-2 h-4 w-4" />
            {dateRange.start ? (
              dateRange.end ? (
                <>
                  {format(dateRange.start, "LLL dd")} -{" "}
                  {format(dateRange.end, "LLL dd, y")}
                </>
              ) : (
                format(dateRange.start, "LLL dd, y")
              )
            ) : (
              <span>Pick a date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <CalendarComponent
            mode="single"
            selected={dateRange.start}
            onSelect={(date) =>
              onDateRangeChange({ start: date, end: dateRange.end })
            }
            initialFocus
            required={false}
            className="pointer-events-auto"
          />
          <div className="p-3 border-t">
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                onDateRangeChange({ start: undefined, end: undefined })
              }
              className="w-full"
            >
              Clear
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
