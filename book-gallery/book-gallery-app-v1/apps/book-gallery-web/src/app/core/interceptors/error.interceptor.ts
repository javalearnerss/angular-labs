import { HttpErrorResponse, HttpInterceptorFn } from "@angular/common/http";
import { inject } from "@angular/core";
import { Router } from "@angular/router";
import { catchError, tap, throwError } from "rxjs";

export const errorInterceptor: HttpInterceptorFn = (req, next) => {


    const router = inject(Router);

    return next(req).pipe(
        catchError((error: HttpErrorResponse) => {
            
            if (error.status == 404) {
                console.log('No resource availaable for URL ', req.urlWithParams);
            }
            return throwError(() => error);
        })
    );

};