import { HttpInterceptor, HttpInterceptorFn } from "@angular/common/http";
import { inject } from "@angular/core";
import { LoadingService } from "../services/loading.service";
import { finalize, tap } from "rxjs";


export const loadingInterceptor: HttpInterceptorFn = (req, next) => {

    const loadingService = inject(LoadingService);

    loadingService.show();
    console.log('Request is sent to backend');

    return next(req).pipe(finalize(() => { loadingService.hide() 
        console.log('Data is retrieved from the backend');
    }));
}