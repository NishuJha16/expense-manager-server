import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Budget } from './budget.entity';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { Expense } from 'src/expenses/expense.entity/expense.entity';

@Injectable()
export class BudgetService {
  constructor(
    @InjectRepository(Budget)
    private readonly budgetRepository: Repository<Budget>,
    @InjectRepository(Expense)
    private readonly expenseRepository: Repository<Expense>,
  ) {}

  async addCategoryBudget(
    createBudgetDto: CreateBudgetDto,
    userId: number,
  ): Promise<Budget> {
    let budget = await this.budgetRepository.findOne({
      where: {
        category: createBudgetDto.category,
        month: createBudgetDto.month,
        year: createBudgetDto.year,
        user: { id: userId },
      },
    });

    if (budget) {
      budget.amount = createBudgetDto.amount;
    } else {
      budget = this.budgetRepository.create({
        ...createBudgetDto,
        user: { id: userId },
      });
    }

    return this.budgetRepository.save(budget);
  }

  async getMonthlyBudget(userId: number, month: number, year: number) {
    return this.budgetRepository.find({
      where: {
        user: { id: userId },
        month: month,
        year: year,
      },
    });
  }

  async getCategoryWiseData(
    userId: number,
    month: number,
    year: number,
  ): Promise<any> {
    // Fetch expenses grouped by category
    const expenses = await this.expenseRepository
      .createQueryBuilder('expense')
      .select('expense.category', 'category')
      .addSelect('SUM(expense.amount)', 'totalExpenses')
      .where('expense.userId = :userId', { userId })
      .andWhere('EXTRACT(MONTH FROM expense.datetime) = :month', { month })
      .andWhere('EXTRACT(YEAR FROM expense.datetime) = :year', { year })
      .groupBy('expense.category')
      .getRawMany();

    // Fetch budgets grouped by category
    const budgets = await this.budgetRepository
      .createQueryBuilder('budget')
      .select('budget.category', 'category')
      .addSelect('budget.amount', 'totalBudget')
      .where('budget.userId = :userId', { userId })
      .andWhere('budget.month = :month', { month })
      .andWhere('budget.year = :year', { year })
      .getRawMany();

    // Combine expenses and budgets by category
    const combinedData = expenses.map((expense) => {
      const budget = budgets.find((b) => b.category === expense.category);
      return {
        category: expense.category,
        totalExpenses: parseFloat(expense.totalExpenses),
        totalBudget: budget ? parseFloat(budget.totalBudget) : 0,
      };
    });

    // Also add budgets that do not have corresponding expenses
    budgets.forEach((budget) => {
      if (!combinedData.find((data) => data.category === budget.category)) {
        combinedData.push({
          category: budget.category,
          totalExpenses: 0,
          totalBudget: parseFloat(budget.totalBudget),
        });
      }
    });

    return combinedData;
  }

  async getCategoryWiseExpensePercentage(
    userId: number,
    month: number,
    year: number,
  ): Promise<any> {
    // Fetch category-wise expenses for the month and year
    const expenses = await this.expenseRepository
      .createQueryBuilder('expense')
      .select('expense.category', 'category')
      .addSelect('SUM(expense.amount)', 'totalExpenses')
      .where('expense.userId = :userId', { userId })
      .andWhere('EXTRACT(MONTH FROM expense.datetime) = :month', { month })
      .andWhere('EXTRACT(YEAR FROM expense.datetime) = :year', { year })
      .groupBy('expense.category')
      .getRawMany();

    // Fetch total overall expenses for the month and year
    const overallExpense = await this.expenseRepository
      .createQueryBuilder('expense')
      .select('SUM(expense.amount)', 'totalOverallExpense')
      .where('expense.userId = :userId', { userId })
      .andWhere('EXTRACT(MONTH FROM expense.datetime) = :month', { month })
      .andWhere('EXTRACT(YEAR FROM expense.datetime) = :year', { year })
      .getRawOne();

    const totalOverallExpense = parseFloat(overallExpense.totalOverallExpense);

    // Calculate percentage for each category
    const result = expenses.map((expense) => {
      const totalExpenses = parseFloat(expense.totalExpenses);
      const percentage =
        totalOverallExpense > 0
          ? (totalExpenses / totalOverallExpense) * 100
          : 0; // Avoid division by zero

      return {
        category: expense.category,
        totalExpenses,
        percentage: percentage.toFixed(2), // Round to 2 decimal places
      };
    });

    return {
      totalOverallExpense: totalOverallExpense.toFixed(2),
      categoryWiseExpensePercentage: result,
    };
  }
}
