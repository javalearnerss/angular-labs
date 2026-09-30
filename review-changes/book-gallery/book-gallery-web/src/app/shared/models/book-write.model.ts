export interface BookWriteRequest {
  title: string;
  author: string;
  isbn: string | null;
  categoryId: number;
  price: number;
  stock: number;
  description: string | null;
}
