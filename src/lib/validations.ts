import { z } from "zod";

export const expenseSchema = z.object({
  amount: z.number().positive("Amount must be greater than 0"),
  category_id: z.number().positive("Please select a category"),
  description: z
    .string()
    .min(1, "Description is required")
    .max(200, "Description too long"),
  date: z.string().min(1, "Date is required"),
  month: z.string().min(1, "Month is required"),
});

export const categorySchema = z.object({
  name: z.string().min(1, "Category name is required").max(50, "Name too long"),
  budget: z.number().positive("Budget must be greater than 0"),
  type: z.string().refine((v) => v === "fixed" || v === "variable", {
    message: "Type must be 'fixed' or 'variable'",
  }),
  month: z.string().optional(), // Made optional
});

export type ExpenseFormData = z.infer<typeof expenseSchema>;
export type CategoryFormData = z.infer<typeof categorySchema>;
