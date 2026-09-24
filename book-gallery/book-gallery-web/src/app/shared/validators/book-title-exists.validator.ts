import { AbstractControl, AsyncValidatorFn, FormControl, ValidationErrors } from "@angular/forms";
import { catchError, debounceTime, distinctUntilChanged, map, Observable, of, switchMap, tap } from "rxjs";
import { BookService } from "../services/book.service";

export function bookTitleExistsValidator(bookService: BookService, getOriginalTitle: () => string): AsyncValidatorFn {

    return (titleControl: AbstractControl): Observable<ValidationErrors | null> => {

        if (!titleControl || !titleControl.value)
            return of(null);

        const originalTitle = getOriginalTitle()?.trim();

        // Don't call backend if title hasn't changed
        if (titleControl.value.trim() === originalTitle) {
            return of(null);
        }


        return bookService.getBookByTitle(titleControl.value).pipe(
            tap(book =>
                console.log("booK : ", book)
            ),
            map(book => book ? { titleExists: true } : null),

            catchError(error => {
                console.log("error : ", error, titleControl.value);
                return of(null);
            })
        );

    }


}



