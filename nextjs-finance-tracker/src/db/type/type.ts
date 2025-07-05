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
  isVerified: boolean;
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
  deletedAt: Date | null;
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
  deletedAt: Date | null;
  isDeleted: boolean;
  isDeletedByBudget: boolean;
}

export function formatRupiah(angka: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(angka);
}

export function formatId(id: string): string {
  return id.match(/.{1,5}/g)?.join(" ") || id;
}

export const thisYear = new Date().getFullYear();
export const thisMonth = new Date().toLocaleString("default", {
  month: "long",
});

export function thisDate(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return dateObj.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function thisTime(date: string): string {
  const dateObj = new Date(date);
  return dateObj.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
}
export const thisDateTime = `${thisDate} ${thisTime}`;
