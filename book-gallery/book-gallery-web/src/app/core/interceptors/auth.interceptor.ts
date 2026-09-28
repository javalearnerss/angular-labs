import { HttpInterceptorFn } from "@angular/common/http";

export const authInterceptor: HttpInterceptorFn = (req, next) => {

    localStorage.setItem('JWT_TOKEN', 'Jwt Token');
    const token = localStorage.getItem('JWT_TOKEN');

    if (token) {
        const authRequest = req.clone({
            setHeaders: { 'Authorization': `Bearer ${token}` }
        });
        console.log('Request header ', authRequest);
        return next(authRequest);
    }

    return next(req);
};

