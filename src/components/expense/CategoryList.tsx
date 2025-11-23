import { Category } from "../../types/expense";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";
import { Badge } from "../ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { CategoryManager } from "./CategoryManager";

interface CategoryListProps {
  categories: Category[];
  onDeleteCategory: (id: number) => void;
  onUpdateCategory: (args: { id: number; data: any }) => void;
  onBulkUpdateMonth: (month: string) => void;
  isBulkUpdating: boolean;
  selectedType?: "all" | "fixed" | "variable";
  onTypeChange?: (type: "all" | "fixed" | "variable") => void;
}

export function CategoryList({
  categories,
  onDeleteCategory,
  onUpdateCategory,
  onBulkUpdateMonth,
  isBulkUpdating,
  selectedType = "all",
  onTypeChange,
}: CategoryListProps) {
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string>("");

  const filteredCategories = categories.filter((cat) => 
    selectedType === "all" || cat.type === selectedType
  );

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const handleBulkUpdate = () => {
    if (selectedMonth) {
      onBulkUpdateMonth(selectedMonth);
    }
  };

  return (
    <>
     
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Categories</CardTitle>
            {onTypeChange && (
              <Select value={selectedType} onValueChange={onTypeChange}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="fixed">Fixed</SelectItem>
                  <SelectItem value="variable">Variable</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Budget</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCategories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    {categories.length === 0 ? "No categories yet. Add one to get started!" : "No categories match the selected filter."}
                  </TableCell>
                </TableRow>
              ) : (
                filteredCategories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell>
                      <Badge variant={category.type === "fixed" ? "secondary" : "outline"}>
                        {category.type}
                      </Badge>
                    </TableCell>
                    <TableCell>₹{category.budget.toFixed(2)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditingCategory(category)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Category</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{category.name}"? This action
                                cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => onDeleteCategory(category.id)}
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
         <Card className="mb-4">
        <CardHeader>
          <CardTitle>Bulk Update Month</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger>
                  <SelectValue placeholder="Select month" />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month) => (
                    <SelectItem key={month} value={month}>
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button 
              onClick={handleBulkUpdate} 
              disabled={!selectedMonth || isBulkUpdating}
            >
              {isBulkUpdating ? "Updating..." : "Update All Categories"}
            </Button>
          </div>
        </CardContent>
      </Card>
      {editingCategory && (
        <CategoryManager
          onAddCategory={(data) => {
            onUpdateCategory({ id: editingCategory.id, data });
            setEditingCategory(null);
          }}
          editMode
          initialData={editingCategory}
          open={!!editingCategory}
          onOpenChange={(open) => !open && setEditingCategory(null)}
        />
      )}
    </>
  );
}
