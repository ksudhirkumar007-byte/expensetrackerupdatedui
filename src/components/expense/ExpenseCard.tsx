import { Expense, Category } from "../../types/expense";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Trash2, Calendar, Tag } from "lucide-react";
import { format } from "date-fns";
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

interface ExpenseCardProps {
  expense: Expense;
  category: Category | undefined;
  onDelete: (id: number) => void;
}

export function ExpenseCard({ expense, category, onDelete }: ExpenseCardProps) {
  return (
    <Card className="hover:shadow-md transition-all duration-200 active:scale-[0.98] touch-manipulation">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-foreground truncate text-base">
              {expense.description}
            </h4>
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mt-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Tag className="h-3.5 w-3.5 flex-shrink-0" />
                <span className="truncate">{category?.name || "Unknown"}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
                <span>{format(new Date(expense.date), "MMM dd, yyyy")}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 sm:gap-3">
            <span className="text-lg sm:text-xl font-bold text-foreground whitespace-nowrap">
              ₹{expense.amount.toFixed(2)}
            </span>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-destructive h-9 w-9 touch-manipulation"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="mx-4 max-w-sm">
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Expense</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this expense? This action
                    cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                  <AlertDialogCancel className="w-full sm:w-auto">Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onDelete(expense.id)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90 w-full sm:w-auto"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
