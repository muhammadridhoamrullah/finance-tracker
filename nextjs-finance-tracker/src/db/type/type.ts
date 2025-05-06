export interface UserModel {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber: string;
  address: string;
  createdAt: Date;
  updatedAt: Date;
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
}


