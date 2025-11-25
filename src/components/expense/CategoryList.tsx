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

import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { CategoryManager } from "./CategoryManager";

interface CategoryListProps {
  categories: Category[];
  onDeleteCategory: (id: number) => void;
  onUpdateCategory: (args: { id: number; data: any }) => void;
  onSummariseAndUpdateMonth: (month: string) => void;
  isSummarising: boolean;
}

export function CategoryList({
  categories,
  onDeleteCategory,
  onUpdateCategory,
  onSummariseAndUpdateMonth,
  isSummarising,
}: CategoryListProps) {
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [showSummarise, setShowSummarise] = useState(false);

  // Get previous month in format like "Jan-25"
  const getPreviousMonth = () => {
    const now = new Date();
    const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                       "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const year = prevMonth.getFullYear().toString().slice(-2);
    return `${monthNames[prevMonth.getMonth()]}-${year}`;
  };

  const handleSummariseAndUpdate = () => {
    const previousMonth = getPreviousMonth();
    onSummariseAndUpdateMonth(previousMonth);
  };

  return (
    <>
     
      <Card>
        <CardHeader>
          <CardTitle>Categories</CardTitle>
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
              {categories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    No categories yet. Add one to get started!
                  </TableCell>
                </TableRow>
              ) : (
                categories.map((category) => (
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
      <div className="mb-4">
        <Button 
          onClick={() => setShowSummarise(!showSummarise)}
          variant="outline"
          className="mb-4"
        >
          Summarise
        </Button>
        
        {showSummarise && (
          <Card>
            <CardHeader>
              <CardTitle>Summarise & Update Previous Month</CardTitle>
            </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">
                Will summarise categories and update month to: <strong>{getPreviousMonth()}</strong>
              </p>
            </div>
            <Button 
              onClick={handleSummariseAndUpdate} 
              disabled={isSummarising}
            >
              {isSummarising ? "Processing..." : "Summarise & Update"}
            </Button>
          </div>
            </CardContent>
          </Card>
        )}
      </div>
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
