import { Component, OnDestroy } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';

@Component({
  selector: 'app-add-book',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './add-book.component.html',
  styleUrl: './add-book.component.css'
})
export class AddBookComponent implements OnDestroy {

  selectedCoverImage: File | null = null;
  coverImagePreview: string | null = null;

  onSaveNewBook(form: NgForm): void {

    if (form.invalid) {
      return;
    }

    console.log('Book details:', form.value);
    console.log('Cover image:', this.selectedCoverImage);
  }

  onCoverImageSelected(event: Event): void {

    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) {
      return;
    }

    const file = input.files[0];

    // Validate file type
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp'
    ];

    if (!allowedTypes.includes(file.type)) {
      console.error('Invalid image type');
      return;
    }

    // Validate file size (2 MB)
    const maxFileSize = 2 * 1024 * 1024;

    if (file.size > maxFileSize) {
      console.error('Image size must be less than 2 MB');
      return;
    }

    // Release previous preview URL
    if (this.coverImagePreview) {
      URL.revokeObjectURL(this.coverImagePreview);
    }

    this.selectedCoverImage = file;
    this.coverImagePreview = URL.createObjectURL(file);
  }

  ngOnDestroy(): void {

    if (this.coverImagePreview) {
      URL.revokeObjectURL(this.coverImagePreview);
    }
  }
}