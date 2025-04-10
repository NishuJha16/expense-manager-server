import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { Expense } from './expense.entity/expense.entity';
import {
  addDays,
  addWeeks,
  addMonths,
  addYears,
  isAfter,
  formatDistance,
} from 'date-fns';
import { UpdateExpenseDto } from './dto/update-expense.dto';

@Injectable()
export class ExpensesService {
  constructor(
    @InjectRepository(Expense)
    private readonly expenseRepository: Repository<Expense>,
  ) {}

  async createExpense(
    createExpenseDto: CreateExpenseDto,
    userId: number,
  ): Promise<Expense> {
    const expense = this.expenseRepository.create({
      ...createExpenseDto,
      user: { id: userId },
    });

    if (expense.datetime) {
      const date = new Date(expense.datetime);
      expense.month = date.getMonth() + 1;
      expense.year = date.getFullYear();
    }

    return this.expenseRepository.save(expense);
  }

  async findAll(userId: number): Promise<Expense[]> {
    return this.expenseRepository.find({
      where: {
        user: { id: userId },
      },
      order: {
        datetime: 'DESC',
      },
    });
  }

  async findOneById(id: number, userId: number): Promise<Expense> {
    const expense = await this.expenseRepository.findOne({
      where: { id, user: { id: userId } },
      relations: ['user'],
    });
    if (!expense) {
      throw new NotFoundException(
        `Expense with ID ${id} not found or not accessible by this user`,
      );
    }
    return expense;
  }

  async getMonthlyExpense(userId: number, month: number, year: number) {
    return this.expenseRepository.find({
      where: {
        user: { id: userId },
        month: month,
        year: year,
      },
    });
  }

  async findByCategory(category: string, userId: number): Promise<Expense[]> {
    const expense = await this.expenseRepository.find({
      where: { category, user: { id: userId } },
      relations: ['user'],
    });
    return expense;
  }

  async getCategoryWiseExpenses(userId: number): Promise<any[]> {
    return this.expenseRepository
      .createQueryBuilder('expense')
      .select('expense.category', 'category')
      .addSelect('SUM(expense.amount)', 'totalAmount')
      .where('expense.userId = :userId', { userId })
      .groupBy('expense.category')
      .getRawMany();
  }

  async updateExpense(
    id: number,
    updateExpenseDto: UpdateExpenseDto,
    userId: number,
  ): Promise<Expense> {
    const expense = await this.expenseRepository.preload({
      id,
      ...updateExpenseDto,
    });
    if (!expense || expense.user.id !== userId) {
      throw new NotFoundException(
        `Expense with ID ${id} not found or not accessible by this user`,
      );
    }
    return this.expenseRepository.save(expense);
  }

  async deleteExpense(id: number, userId: number): Promise<void> {
    const result = await this.expenseRepository.delete({
      id,
      user: { id: userId },
    });
    if (result.affected === 0) {
      throw new NotFoundException(
        `Expense with ID ${id} not found or not accessible by this user`,
      );
    }
  }

  async findUpcomingRecurringExpenses(userId: number): Promise<any[]> {
    const recurringExpenses = await this.expenseRepository.find({
      where: {
        user: { id: userId },
        isRecurring: true,
      },
      relations: ['user'],
    });

    const now = new Date();

    const upcoming = recurringExpenses
      .map((expense) => {
        let nextDate = new Date(expense.datetime);

        switch (expense.recurrencePattern) {
          case 'daily':
            nextDate = addDays(nextDate, 1);
            break;
          case 'weekly':
            nextDate = addWeeks(nextDate, 1);
            break;
          case 'monthly':
            nextDate = addMonths(nextDate, 1);
            break;
          case 'yearly':
            nextDate = addYears(nextDate, 1);
            break;
          default:
            return null;
        }

        if (isAfter(nextDate, now)) {
          const timeUntilNext = formatDistance(nextDate, now, {
            addSuffix: true,
          });
          return {
            ...expense,
            nextOccurrence: nextDate,
            timeUntilNext,
          };
        }

        return null;
      })
      .filter((e) => e !== null);

    return upcoming;
  }
}
