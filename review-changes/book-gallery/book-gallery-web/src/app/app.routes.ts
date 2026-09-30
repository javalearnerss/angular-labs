import { Routes } from '@angular/router';

export const routes: Routes = [

    // =========================
    // Public Store
    // =========================

    {
        path: '',
        loadComponent: () => import('./features/store/store-container/store-container.component')
            .then(component => component.StoreContainerComponent),
        children: [

            {
                path: '',
                loadComponent: () => import('./features/home/home.component')
                    .then(component => component.HomeComponent)
            },

            {
                path: 'home',
                loadComponent: () => import('./features/home/home.component')
                    .then(component => component.HomeComponent)
            },

            {
                path: 'books',
                loadComponent: () => import('./features/books/books.component')
                    .then(component => component.BooksComponent)
            },

            {
                path: 'search',
                loadComponent: () => import('./features/search/search.component')
                    .then(component => component.SearchComponent)
            }

        ]
    },


    // =========================
    // Admin
    // =========================

    {
        path: 'admin',
        loadComponent: () => import('./features/admin/container/admin-container/admin-container.component')
            .then(component => component.AdminContainerComponent),
        children: [

            {
                path: '',
                redirectTo: 'dashboard',
                pathMatch: 'full'
            },
            {
                path: 'dashboard',
                loadComponent: () => import('./features/admin/dashboard/dashboard-page/dashboard-page.component')
                    .then(component => component.DashboardPageComponent)
            },
            {
                path: 'books',
                loadComponent: () => import('./features/admin/books/books-page/books-page.component')
                    .then(component => component.BooksPageComponent)
            },
            {
                path: 'books/add-book',
                loadComponent: () => import('./features/admin/books/add-book/add-book.component')
                    .then(component => component.AddBookComponent)
            },
            {
                path: 'books/:bookId/edit-book',
                loadComponent: () => import('./features/admin/books/edit-book/edit-book.component')
                    .then(component => component.EditBookComponent)
            }

            // admin routes will come here

        ]
    }

];
