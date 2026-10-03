import { BookStatus } from "../../features/admin/shared/data-table/data-table.component";
import { ReviewSummary } from "../../features/books/models/review-summary.model";

export interface Book {
  id: number;
  title: string;
  author: string;
  category: string;
  categoryId?: number;
  price: number;
  stock: number;
  status: BookStatus;
  isbn: string | null;
  description?: string | null;
  coverImage: string;
}


export interface BookWithReviewSummary extends Book {
  reviewSummary: ReviewSummary | null;
}