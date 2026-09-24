import { AbstractControl, ValidationErrors } from '@angular/forms';

export function isbnValidator(control: AbstractControl): ValidationErrors | null {

    const value = control.value;

    if (!value) {
        return null;
    }

    // Remove spaces and hyphens
    const isbn = value.replace(/[-\s]/g, '');

    // ISBN-10
    if (/^\d{9}[\dX]$/.test(isbn)) {
        let sum = 0;

        for (let i = 0; i < 10; i++) {
            const digit = isbn[i] === 'X' ? 10 : Number(isbn[i]);
            sum += digit * (10 - i);
        }

        return sum % 11 === 0 ? null : { invalidIsbn: true };
    }

    // ISBN-13
    if (/^\d{13}$/.test(isbn)) {
        let sum = 0;

        for (let i = 0; i < 13; i++) {
            const digit = Number(isbn[i]);
            sum += i % 2 === 0 ? digit : digit * 3;
        }

        return sum % 10 === 0 ? null  : { invalidIsbn: true };
    }

    return { invalidIsbn: true };
}