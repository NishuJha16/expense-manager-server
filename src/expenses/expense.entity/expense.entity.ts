import { User } from 'src/users/user.entity/user.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';

@Entity('expenses')
export class Expense {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('timestamp')
  datetime: Date;

  @Column({ length: 100 })
  category: string;

  @Column({ length: 255 })
  title: string;

  @Column('text')
  description: string;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column({ length: 50 })
  mode: string;

  // Automatically set the month based on the datetime
  @Column({ nullable: true })
  month: number;

  @Column({ nullable: true })
  year: number; // Year for which the budget is set

  @ManyToOne(() => User, (user) => user.expenses)
  user: User;

  // Automatically set the month and year before insert or update
  @BeforeInsert()
  @BeforeUpdate()
  setMonthAndYear() {
    if (this.datetime) {
      const date = new Date(this.datetime);
      this.month = date.getMonth() + 1; // getMonth() returns 0-11, so +1
      this.year = date.getFullYear();
    }
  }
}
