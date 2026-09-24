import { Routes } from '@angular/router';

import { HomeComponent } from './features/home/home.component';
import { BooksComponent } from './features/books/books.component';
import { SearchComponent } from './features/search/search.component';


import { AdminContainerComponent }
    from './features/admin/container/admin-container/admin-container.component';
import { StoreContainerComponent } from './features/store/store-container/store-container.component';
import { BooksPageComponent } from './features/admin/books/books-page/books-page.component';
import { AddBookComponent } from './features/admin/books/add-book/add-book.component';
import { EditBookComponent } from './features/admin/books/edit-book/edit-book.component';

export const routes: Routes = [

    // =========================
    // Public Store
    // =========================

    {
        path: '',
        component: StoreContainerComponent,
        children: [

            {
                path: '',
                component: HomeComponent
            },

            {
                path: 'home',
                component: HomeComponent
            },

            {
                path: 'books',
                component: BooksComponent
            },

            {
                path: 'search',
                component: SearchComponent
            }

        ]
    },


    // =========================
    // Admin
    // =========================

    {
        path: 'admin',
        component: AdminContainerComponent,
        children: [

            {
                path: '',
                redirectTo: 'dashboard',
                pathMatch: 'full'
            },
            {
                path: 'books',
                component: BooksPageComponent,
            },
            {
                path: 'books/add-book',
                component: AddBookComponent
            },
            {
                path: 'books/:bookId/edit-book',
                component: EditBookComponent
            }

            // admin routes will come here

        ]
    }

];