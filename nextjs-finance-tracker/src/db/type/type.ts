export interface UserModel {
  _id: string;
  firstName: string;
  lastName: string;
  role: "User" | "Admin";
  email: string;
  password: string;
  phoneNumber: string;
  address: string;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
  deletedAt: Date | null;
}
export interface BudgetModel {
  _id: string;
  UserId: string;
  name: string;
  amount: number;
  spent: number;
  income: number;
  startDate: Date;
  endDate: Date;
  remaining: number;
  createdAt: Date;
  updatedAt: Date;
  deltedAt: Date | null;
  isDeleted: boolean;
}

export interface TransactionModel {
  _id: string;
  amount: number;
  category: string;
  type: "income" | "expense";
  date: Date;
  description: string;
  UserId: string;
  BudgetId: string;
  createdAt: Date;
  updatedAt: Date;
  deltedAt: Date | null;
  isDeleted: boolean;
}
