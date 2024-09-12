import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Delete,
  Put,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Expense } from './expense.entity/expense.entity';

@ApiTags('expenses')
@ApiBearerAuth()
@Controller('expenses')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new expense' })
  @UseGuards(JwtAuthGuard)
  @ApiResponse({
    status: 201,
    description: 'The expense has been successfully created.',
    type: Expense,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  async create(
    @Body() createExpenseDto: CreateExpenseDto,
    @Req() req: any,
  ): Promise<Expense> {
    const userId = req.user.userId;
    return this.expensesService.createExpense(createExpenseDto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all expenses for the logged-in user' })
  @UseGuards(JwtAuthGuard)
  @ApiResponse({
    status: 200,
    description: 'The expenses have been successfully retrieved.',
    type: [Expense],
  })
  async findAll(@Req() req: any): Promise<Expense[]> {
    const userId = req.user.userId;
    return this.expensesService.findAll(userId);
  }

  @Get('monthly/:month/:year')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get the overall and category-wise expense for a specific month',
  })
  @ApiResponse({
    status: 200,
    description: 'Monthly expense retrieved successfully.',
  })
  async getMonthlyExpense(
    @Param('month') month: number,
    @Param('year') year: number,
    @Req() req: any,
  ) {
    const userId = req.user.userId;
    return this.expensesService.getMonthlyExpense(userId, month, year);
  }

  @Get('category-wise')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get expenses grouped by category' })
  @ApiResponse({ status: 200, description: 'Category-wise expense report.' })
  async getCategoryWiseExpenses(@Req() req: any) {
    console.log(req);
    const userId = req.user.userId;
    if (!userId) {
      throw new Error('User ID is not available in the request.');
    }
    return this.expensesService.getCategoryWiseExpenses(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an expense by ID' })
  @UseGuards(JwtAuthGuard)
  @ApiResponse({
    status: 200,
    description: 'The expense has been successfully retrieved.',
    type: Expense,
  })
  @ApiResponse({
    status: 404,
    description: 'Expense not found or not accessible by this user.',
  })
  async findOne(@Param('id') id: string, @Req() req: any): Promise<Expense> {
    const userId = req.user.userId;
    return this.expensesService.findOneById(Number(id), userId);
  }

  @Get(':category')
  @ApiOperation({ summary: 'Get an expense by Category' })
  @UseGuards(JwtAuthGuard)
  @ApiResponse({
    status: 200,
    description: 'The expenses has been successfully retrieved.',
    type: Expense,
  })
  @ApiResponse({
    status: 404,
    description: 'Expense not found or not accessible by this user.',
  })
  async findByCategory(
    @Param('category') category: string,
    @Req() req: any,
  ): Promise<Expense[]> {
    const userId = req.user.userId;
    return this.expensesService.findByCategory(category, userId);
  }

  @Put('update/:id')
  @ApiOperation({ summary: 'Update an expense by ID' })
  @UseGuards(JwtAuthGuard)
  @ApiResponse({
    status: 200,
    description: 'The expense has been successfully updated.',
    type: Expense,
  })
  @ApiResponse({
    status: 404,
    description: 'Expense not found or not accessible by this user.',
  })
  async update(
    @Param('id') id: string,
    @Body() updateExpenseDto: UpdateExpenseDto,
    @Req() req: any,
  ): Promise<Expense> {
    const userId = req.user.userId;
    return this.expensesService.updateExpense(
      Number(id),
      updateExpenseDto,
      userId,
    );
  }

  @Delete('delete/:id')
  @ApiOperation({ summary: 'Delete an expense by ID' })
  @UseGuards(JwtAuthGuard)
  @ApiResponse({
    status: 204,
    description: 'The expense has been successfully deleted.',
  })
  @ApiResponse({
    status: 404,
    description: 'Expense not found or not accessible by this user.',
  })
  async remove(@Param('id') id: string, @Req() req: any): Promise<void> {
    const userId = req.user.userId;
    return this.expensesService.deleteExpense(Number(id), userId);
  }
}
