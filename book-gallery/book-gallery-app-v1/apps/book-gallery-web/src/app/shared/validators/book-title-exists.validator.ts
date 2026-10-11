import { AbstractControl, AsyncValidatorFn, FormControl, ValidationErrors } from "@angular/forms";
import { catchError, debounceTime, distinctUntilChanged, map, Observable, of, switchMap, tap } from "rxjs";
import { BookApiService } from "../services/book-api.service";

export function bookTitleExistsValidator(bookService: BookApiService, getOriginalTitle: () => string): AsyncValidatorFn {

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



