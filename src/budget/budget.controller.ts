import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  UseGuards,
  Param,
} from '@nestjs/common';
import { BudgetService } from './budget.service';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';

@ApiTags('budgets')
@ApiBearerAuth() // Ensure JWT protection
@Controller('budgets')
export class BudgetController {
  constructor(private readonly budgetService: BudgetService) {}

  @Post('add')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Add or update category-wise budget for a specific month',
  })
  @ApiResponse({
    status: 201,
    description: 'Budget successfully added or updated.',
  })
  async addCategoryBudget(
    @Body() createBudgetDto: CreateBudgetDto,
    @Req() req: any,
  ) {
    const userId = req.user.userId;
    return this.budgetService.addCategoryBudget(createBudgetDto, userId);
  }

  @Get('monthly/:month/:year')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get the overall and category-wise budget for a specific month',
  })
  @ApiResponse({
    status: 200,
    description: 'Monthly budget retrieved successfully.',
  })
  async getMonthlyBudget(
    @Param('month') month: number,
    @Param('year') year: number,
    @Req() req: any,
  ) {
    const userId = req.user.userId;
    return this.budgetService.getMonthlyBudget(userId, month, year);
  }

  @Get('category-wise/:month/:year')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary:
      'Get category-wise expenses and budgets for a specific month and year',
  })
  @ApiResponse({
    status: 200,
    description:
      'Category-wise expense and budget data retrieved successfully.',
  })
  async getCategoryWiseData(
    @Param('month') month: number,
    @Param('year') year: number,
    @Req() req: any,
  ) {
    const userId = req.user.userId;
    return this.budgetService.getCategoryWiseData(userId, month, year);
  }

  @Get('category-wise-expense-percentage/:month/:year')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary:
      'Get category-wise expenses percentage for a specific month and year',
  })
  @ApiResponse({
    status: 200,
    description: 'Category-wise expense percentage retrieved successfully.',
  })
  async getCategoryWiseExpensePercentage(
    @Param('month') month: number,
    @Param('year') year: number,
    @Req() req: any,
  ) {
    const userId = req.user.userId;
    return this.budgetService.getCategoryWiseExpensePercentage(
      userId,
      month,
      year,
    );
  }
}
