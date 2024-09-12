import { User } from 'src/users/user.entity/user.entity';
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';

@Entity()
export class Budget {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  category: string; // Will be 'Overall' if it's the total budget for the month

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  amount: number;

  @Column()
  month: number; // 1-12 for each month

  @Column()
  year: number; // Year for which the budget is set

  @ManyToOne(() => User, (user) => user.budgets, { onDelete: 'CASCADE' })
  user: User;
}
