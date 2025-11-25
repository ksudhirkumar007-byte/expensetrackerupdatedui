import { Category } from "../../types/expense";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

interface ExpenseFiltersProps {
  categories: Category[];
  selectedCategory: string;
  selectedType: "all" | "fixed" | "variable";
  selectedMonth: string;
  onCategoryChange: (value: string) => void;
  onTypeChange: (value: "all" | "fixed" | "variable") => void;
  onMonthChange: (month: string) => void;
}

export function ExpenseFilters({
  categories,
  selectedCategory,
  selectedType,
  selectedMonth,
  onCategoryChange,
  onTypeChange,
  onMonthChange,
}: ExpenseFiltersProps) {
  const generateMonthOptions = () => {
    const options = [];
    const currentDate = new Date();
    for (let i = 0; i < 12; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const value = `${year}-${month}`;
      const label = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
      options.push({ value, label });
    }
    return options;
  };

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

      <Select value={selectedMonth} onValueChange={onMonthChange}>
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Month" />
        </SelectTrigger>
        <SelectContent>
          {generateMonthOptions().map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
