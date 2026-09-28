import { HttpInterceptorFn } from "@angular/common/http";
import { tap } from "rxjs";


export const loggingInterceptor: HttpInterceptorFn = (req, next) => {
    const started = Date.now();
    console.log(`📚 Request → ${req.method} ${req.url}`);

    return next(req).pipe(tap({
        next: () => {
            const elapsed = Date.now() - started;
            console.log(`✅ Response ← ${req.url} (${elapsed}ms)`);
        },
        error: (error) => {
            console.error(`❌ Error on ${req.url}`, error);
        }
    }));
}