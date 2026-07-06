export interface IUser {
  _id: string;
  name: string;
  email: string;
  role: "admin" | "manager" | "employee";
}

export interface IProduct {
  _id: string;
  name: string;
  sku: string;
  category: string;
  purchasePrice: number;
  sellingPrice: number;
  stock: number;
  image: string;
  isDeleted: boolean;
  createdAt: string;
}

export interface ISaleItem {
  product: IProduct;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface ISale {
  _id: string;
  items: ISaleItem[];
  grandTotal: number;
  soldBy: IUser;
  createdAt: string;
}

export interface IDashboard {
  totalProducts: number;
  totalSales: number;
  lowStockProducts: IProduct[];
}

export interface IMeta {
  page: number;
  limit: number;
  total: number;
  totalPage: number;
}

export interface IApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: IMeta;
}
