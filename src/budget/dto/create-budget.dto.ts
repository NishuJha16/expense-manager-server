export class CreateBudgetDto {
  category: string;
  amount: number;
  month: number; // 1-12 for each month
  year: number; // Year for the budget
}
