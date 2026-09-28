/**
01. [Observable] Why would BookService return Observables?
02. [Observable vs Promise] Which would you choose for Book Search and why?
03. [Subscription] What happens when BookList subscribes?
04. [Cold vs Hot Observable] Give an example from BookGallery.
05. [Subject] Where could a Subject be useful?
06. [BehaviorSubject] How could it represent the selected Book?
07. [ReplaySubject] Where could it be useful?
08. [map] How would you transform Book API data?
09. [filter] How would you filter books?
10. [tap] Where would you perform side effects?
11. [debounceTime] How would you debounce Book Search?
12. [distinctUntilChanged] Why use it with search?
13. [switchMap] Why is it suitable for Book Search?
14. [mergeMap] When would it be appropriate?
15. [concatMap] When would sequential Book operations be useful?
16. [exhaustMap] Where could it prevent duplicate actions?
17. [switchMap vs mergeMap] What happens if search uses mergeMap?
18. [forkJoin] How would you load Book, Author and Category APIs?
19. [combineLatest] How would you combine search/filter/sort streams?
20. [withLatestFrom] Where could it be useful in Checkout?
21. [catchError] How would you handle Book API errors?
22. [retry] How would you retry transient failures?
23. [finalize] How would you stop a loading spinner?
24. [shareReplay] How would you avoid duplicate Book API calls?
25. [Memory Leaks] How could BookGallery leak subscriptions?
26. [takeUntilDestroyed] How would you solve subscription cleanup?

 */

=================================================================================================================
01. [Observable] Why would BookService return Observables?
    Scenario-based explanation:
    Imagine you are building a Book Store application.
    A user opens the Books page. Your Angular application needs to call the backend:
        "Hey server, give me all the books."

    The request goes over the network, so the response doesn't come immediately.

        Angular App
            |
            |  "Give me all books"
            ↓
        Backend API
            |
            |  ...processing...
            |  ...database...
            ↓
        Angular App
            |
            |  Books received
            ↓
        Display books

    Now, suppose BookService directly returned the books:
        getBooks(): Book[] {
        // Call API
        }
    
    The problem is: the books aren't available immediately. The API might take 100ms, 1 second, or even longer.
    So instead, BookService says:
        "I don't have the books right now, but I'll give you an Observable. 
         Subscribe to it, and I'll give you the books when they arrive."

         getBooks(): Observable<Book[]> {
            return this.http.get<Book[]>('/api/books');
          }

    Then the component subscribes:
        this.bookService.getBooks().subscribe(books => {
            this.books = books;
        });

    Think of an Observable like a delivery service 📦
    You order books online.
    You don't stand at the warehouse waiting for the books.
    Instead, the delivery service tells you:
        "Here is your tracking subscription. When the books arrive, I'll notify you."
    That's essentially what an Observable does.

=================================================================================================================
02. [Observable vs Promise] Which would you choose for Book Search and why?

Scenario-based explanation
Imagine you have a Book Store application with a search box.
The user wants to search for books, so they start typing: Angular

Your application needs to send that search term to the backend:

    User types "Angular"
            ↓
    Search box
            ↓
    BookService
            ↓
    Backend API
            ↓
    Books matching "Angular"

Now imagine the user doesn't type the complete search term at once. They type:

    A → An → Ang → Angular

Here is where Observable becomes a better choice than Promise.

Where are we using Observable?
In Angular, the search box can be a FormControl:
    searchControl = new FormControl('');

And Angular gives us: this.searchControl.valueChanges
valueChanges is an Observable.

It emits a new value whenever the user changes the search text:

    User types "A"
        ↓
    valueChanges emits "A"

    User types "An"
        ↓
    valueChanges emits "An"

    User types "Ang"
        ↓
    valueChanges emits "Ang"

    User types "Angular"
        ↓
    valueChanges emits "Angular"

So the important point is:
The search box produces multiple values over time, and valueChanges gives us those values through an Observable.

Now we can use RxJS operators
    this.searchControl.valueChanges
    .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap(term => this.bookService.searchBooks(term))
    )
    .subscribe(books => {
        this.books = books;
    });

    Think of the code as a pipeline:

    valueChanges
        ↓
    Observable
        ↓
    debounceTime()
        ↓
    distinctUntilChanged()
        ↓
    switchMap()
        ↓
    BookService
        ↓
    HTTP Observable
        ↓
    subscribe()
        ↓
    Display books
What do these operators do?
    debounceTime(300) : Waits for the user to stop typing for 300ms before continuing.

    A → An → Ang → Angular
                ↓
          wait 300ms
                ↓
           Search API

This prevents an API call for every single keystroke.

distinctUntilChanged() : If the user enters the same value again, it doesn't perform the search again.

switchMap() : 
Suppose the user searches: Angular
and then quickly changes it to: Angular 18

We are no longer interested in the old "Angular" search. switchMap() switches to the latest search.

    "Angular"
        ↓
    API request ────────────X

    "Angular 18"
        ↓
    API request ────────────✓
                            ↓
                        Show results


What about Promise?
Let's say our search box is:
    searchControl = new FormControl('');

Angular gives us: this.searchControl.valueChanges

This is an Observable because the search box can change many times:

    User types:

    "A"          → valueChanges emits "A"
    "An"         → valueChanges emits "An"
    "Ang"        → valueChanges emits "Ang"
    "Angular"    → valueChanges emits "Angular"

Now, imagine if valueChanges were a Promise instead.

A Promise would give us only one eventual value:

    Promise
    ↓
    "Angular"
    ↓
    DONE

But what about "A", "An", and "Ang"?

The Promise isn't designed to keep notifying us every time the value changes.

That's the key difference.

With Observable
    this.searchControl.valueChanges.subscribe(value => {
    console.log(value);
    });

    We can keep listening:

    "A"        → received
    "An"       → received
    "Ang"      → received
    "Angular"  → received

The Observable stays subscribed and receives new values as they are emitted.

With Promise
A Promise is more like: const value = await somePromise;

We wait for one result:
    Wait
    ↓
    Result received
    ↓
    Done

It doesn't naturally represent:

    Value 1 → Value 2 → Value 3 → Value 4 → ...                        

Answer : 
I wouldn't choose Observable simply because Promise can't make an HTTP call. 
Promise can certainly handle an individual search request. 
I would choose Observable because the requirement is a 
search-as-you-type experience: valueChanges gives us a stream of user input, 
and RxJS allows us to debounce, ignore duplicate values, and switch to the latest request. 
If I only needed to execute one search for a fixed term, a Promise would be a perfectly reasonable choice.

export class BookSearchComponent implements OnInit, OnDestroy {

  searchControl = new FormControl('');

  books: Book[] = [];

  private destroy$ = new Subject<void>();

  constructor(private bookService: BookService) {}

  ngOnInit(): void {
    this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),

        switchMap(term => {
          if (!term || term.trim() === '') {
            return of([]);
          }

          return this.bookService.searchBooks(term.trim());
        }),

        takeUntil(this.destroy$)
      )
      .subscribe(books => {
        this.books = books;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

==================================================================================================================
03. [Subscription] What happens when BookList subscribes?

==================================================================================================================
04. [Cold vs Hot Observable] Give an example from BookGallery.

==================================================================================================================
05. [Subject] Where could a Subject be useful?


==================================================================================================================
06. [BehaviorSubject] How could it represent the selected Book?


==================================================================================================================
07. [ReplaySubject] Where could it be useful?


==================================================================================================================
08. [map] How would you transform Book API data?

Scenario
Suppose the API returns one book:
    {
        id: 1,
        title: 'Angular',
        author: 'John',
        price: 500
    }

But our component wants the book in a different format:
    {
        name: 'Angular',
        writtenBy: 'John',
        displayPrice: '₹500'
    }

So we can use RxJS map() to transform it.

Book Service
    import { Injectable } from '@angular/core';
    import { HttpClient } from '@angular/common/http';
    import { Observable, map } from 'rxjs';

    export interface Book {
        id: number;
        title: string;
        author: string;
        price: number;
    }

    export interface BookViewModel {
        name: string;
        writtenBy: string;
        displayPrice: string;
    }

    @Injectable({
        providedIn: 'root'
    })
    export class BookService {

    constructor(private http: HttpClient) {}

    getBook(): Observable<BookViewModel> {

        // Call the API.
        // The API returns one Book object.
        return this.http.get<Book>('/api/books/1')

        // RxJS map() receives that single Book object
        // and transforms it into a BookViewModel.
        .pipe(
            map(book => ({
                name: book.title,
                writtenBy: book.author,
                displayPrice: `₹${book.price}`
            }))
        );
      }
    }

    Component
    export class BookComponent {

    book!: BookViewModel;

    constructor(private bookService: BookService) {}

    loadBook() {

            // Subscribe to the Observable returned by the service.
            this.bookService.getBook().subscribe(book => {

            // The book is already transformed by map().
            this.book = book;

        });
      }
    }

    What exactly is happening?

The API returns:

    API
    ↓
    {
        id: 1,
        title: "Angular",
        author: "John",
        price: 500
    }

The RxJS map() receives this single object:

map(book => ({
  name: book.title,
  writtenBy: book.author,
  displayPrice: `₹${book.price}`
}))

And transforms it:

    Before map()
    {
        id: 1,
        title: "Angular",
        author: "John",
        price: 500
    }

            ↓ RxJS map()

    After map()
    {
        name: "Angular",
        writtenBy: "John",
        displayPrice: "₹500"
    }

Example 1 — Number transformation
    import { of } from 'rxjs';
    import { map } from 'rxjs/operators';

    of(10).pipe(
        map(value => value * 2)
    ).subscribe(result => {
        console.log(result);
    });

    Output: 20

    Here, the Observable emits 10, and RxJS map() transforms it to 20.

Example 2 — String transformation
    of('angular').pipe(
     map(value => value.toUpperCase())
    ).subscribe(result => {
    console.log(result);
    });

    Output: ANGULAR

    Here:

        'angular'
            ↓
        RxJS map()
            ↓
        'ANGULAR'

Example 3 — Transforming an API response
    this.http.get<Book>('/api/book/1').pipe(
        map(book => ({
            name: book.title,
            price: `₹${book.price}`
        }))
        ).subscribe(result => {
            console.log(result);
    });

    If the API gives:

    {
        title: 'Angular',
        price: 500
    }

    RxJS map() transforms it into:

    {
        name: 'Angular',
        price: '₹500'
    }

Key point: RxJS map() takes whatever value the Observable emits and transforms it into a new value.

==================================================================================================================
09. [filter] How would you filter books using RxJS filter()?

Imagine we have a Book Store application.

The backend returns all books:

GET /api/books

[
  Angular       → Technology
  RxJS          → Technology
  Clean Code    → Programming
  Harry Potter  → Fiction
  TypeScript    → Technology
]

But in our application, we are interested only in Technology books.
We can use RxJS filter() to allow only Technology books to continue through the Observable stream.

Book Service
    import { HttpClient } from '@angular/common/http';
    import { Observable, from, filter, mergeMap } from 'rxjs';

    export interface Book {
        id: number;
        title: string;
        author: string;
        category: string;
    }

    export class BookService {

    constructor(private http: HttpClient) {}

    getTechnologyBooks(): Observable<Book> {
            // Backend returns ALL books.
            // Therefore, HttpClient returns Observable<Book[]>.
            return this.http.get<Book[]>('/api/books').pipe(

            // The Observable currently emits the entire array.
            // Convert the array into individual Book emissions.
            mergeMap(books => from(books)),

            // Now filter() receives one Book at a time.
            // Only Technology books are allowed to continue.
            filter(book => book.category === 'Technology')
        );
      }
    }
How does it work?

First, HttpClient receives the complete array: 
    Observable<Book[]>
            ↓
    [Angular, RxJS, Clean Code, Harry Potter, TypeScript]

Then:
    mergeMap(books => from(books))
turns the array into individual emissions:

    from(books) : takes the array and creates an Observable from it.
        You can think of from() as saying:
            "Take these items and emit them one by one through an Observable."

    const books = [
      { id: 1, title: 'Angular', category: 'Technology' },
      { id: 2, title: 'Java', category: 'Programming' },
      { id: 3, title: 'RxJS', category: 'Technology' }
    ];

    const allBook$ = from(books);
    allBook$.subscribe(book => {
      console.log('Book Details : ',book);
    });

mergeMap() takes the values produced by from(books) and makes those values become the values emitted by the original Observable.

Before mergeMap():
    Observable<Book[]>
            ↓
    [Angular, RxJS, Clean Code, Harry Potter, TypeScript]

After mergeMap():

    Observable<Book>

        Angular
            ↓
        RxJS
            ↓
        Clean Code
            ↓
        Harry Potter
            ↓
        TypeScript

That's what flattening means here.

Now RxJS filter() checks each emitted book:

filter(book => book.category === 'Technology')

So:

Angular       → Technology  → ✅
RxJS          → Technology  → ✅
Clean Code    → Programming → ❌
Harry Potter  → Fiction     → ❌
TypeScript    → Technology  → ✅

The subscriber receives only:
    Angular
    RxJS
    TypeScript

Component

    export class BookComponent {

        constructor(private bookService: BookService) {}

        loadTechnologyBooks() {

                // Subscribe to the filtered Observable.
                this.bookService.getTechnologyBooks().subscribe(book => {

                // This runs only for Technology books.
                console.log(book);

            });
        }
    }   

The complete flow
    Backend
    ↓
    All Books
    ↓
    HttpClient
    ↓
    Observable<Book[]>
    ↓
    mergeMap() + from()
    ↓
    Observable<Book>
    ↓
    RxJS filter()
    ↓
    Technology books only
    ↓
    subscribe()
🎯 Interview answer

Suppose the backend returns all books, but I only want Technology books. Since HttpClient returns an Observable<Book[]>, 
the Observable initially emits the entire array as one value. If I specifically want to use RxJS filter(), 
I can flatten the array into individual book emissions using mergeMap() and from(). 
Then filter(book => book.category === 'Technology') checks each book and allows only Technology books to continue to the subscriber.

Important point to remember
RxJS filter() filters values emitted by the Observable. If the Observable emits an array, filter() sees the entire array. 
To filter individual books using RxJS filter(), we first need individual Book emissions.

==================================================================================================================
10. [tap] Where would you perform side effects?

In RxJS, tap() is used when you want to perform a side effect without changing the value flowing through the Observable. 
A side effect means doing something in addition to processing the data, such as logging, showing a message, updating a variable, 
storing something in local storage, or debugging.

For example, suppose we get books from an API:

return this.http.get<Book[]>('/api/books').pipe(

  tap(books => {
    console.log('Books received:', books);
  })

);

Here, tap() receives the books and prints them to the console. It does not modify the books. T
he same books array continues to the next operator or to the subscriber.

You can also use tap() to update a loading flag:
this.loading = true;
return this.http.get<Book[]>('/api/books').pipe(

  tap(books => {
    console.log('Number of books:', books.length);
    this.loading = false;
  })

);

Another common use is debugging an RxJS pipeline:

return this.http.get<Book[]>('/api/books').pipe(

  tap(books => console.log('After API:', books)),

  map(books => books.filter(book => book.price > 500)),

  tap(books => console.log('After filtering:', books))

);

The important difference is:

map()  → changes the value
filter() → removes values
tap()   → performs an action but keeps the value unchanged

For example:

map(book => book.title)       // Book → title
filter(book => book.price > 500) // keeps only matching books
tap(book => console.log(book))   // logs book, doesn't change it

Easy way to remember: tap() means "I want to look at/do something with this value, but I don't want to transform it."

===============================================================================================================================================
11. [debounceTime] How would you debounce Book Search?

debounceTime() is used when we don't want to perform an action every time the user types something. 
Instead, we wait until the user stops typing for a specific amount of time.

For example, imagine the user types:

A → An → Ang → Angu → Angular

Without debounceTime(), we could make 5 API calls. With debounceTime(300), RxJS waits for 300 milliseconds after the latest value. 
If the user types again during those 300 ms, the timer resets.

this.searchControl.valueChanges.pipe(
  debounceTime(300)
).subscribe(searchText => {
  console.log(searchText);
});

The flow is:

    User types: A
        ↓
    wait 300ms

    User types: An
        ↓
    timer resets
    wait 300ms

    User types: Ang
        ↓
    timer resets
    wait 300ms

    User stops typing
        ↓
    300ms passes
        ↓
    "Ang" is emitted

For an actual API search, we commonly combine debounceTime() with switchMap():

this.searchControl.valueChanges.pipe(
  debounceTime(300),
  switchMap(searchText =>
    this.http.get<Book[]>(`/api/books?search=${searchText}`)
  )
).subscribe(books => {
  this.books = books;
});

Here, debounceTime(300) prevents an API request from being made for every keystroke. 
The API request happens only after the user has stopped typing for 300 ms.

Easy way to remember:
    debounceTime(300) = "Wait until nothing happens for 300 ms, then continue."


<h2>Book Search</h2>

<input
  type="text"
  [formControl]="searchControl"
  placeholder="Search books..."
/>

<ul>
  <li *ngFor="let book of filteredBooks">
    {{ book.title }} - {{ book.author }} - {{ book.category }}
  </li>
</ul>

import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ChildComponent } from './child/child.component';
import { debounceTime, tap } from 'rxjs';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

export interface Book {
  id: number;
  title: string;
  author: string;
  category: string;
}

@Component({
  selector: 'app-parent',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './parent.component.html',
  styleUrl: './parent.component.css'
})
export class ParentComponent {

  searchControl = new FormControl('', {
    nonNullable: true
  });

  books: Book[] = [
    {
      id: 1,
      title: 'Angular Basics',
      author: 'John',
      category: 'Technology'
    },
    {
      id: 2,
      title: 'The Alchemist',
      author: 'Paulo Coelho',
      category: 'Fiction'
    },
    {
      id: 3,
      title: 'RxJS in Action',
      author: 'David',
      category: 'Technology'
    }
  ];

  filteredBooks: Book[] = this.books;

  constructor() {

    this.searchControl.valueChanges
      .pipe(
        tap(value => console.log("Before debounce time : ", value, new Date())),
        debounceTime(3000),
        tap(value => console.log("After debounce time : ", value, new Date())),
      )
      .subscribe((searchText: string) => {

        console.log("After subscribe : ", new Date())
        const search = searchText.toLowerCase();

        this.filteredBooks = this.books.filter(book =>
          book.category.toLowerCase().startsWith(search)
        );

      });
  }
}


Output :
Before debounce time :  t Wed Sep 09 2026 01:14:01 GMT+0530 (India Standard Time)
parent.component.ts:54 Before debounce time :  te Wed Sep 09 2026 01:14:01 GMT+0530 (India Standard Time)
parent.component.ts:54 Before debounce time :  tec Wed Sep 09 2026 01:14:01 GMT+0530 (India Standard Time)
parent.component.ts:54 Before debounce time :  tech Wed Sep 09 2026 01:14:02 GMT+0530 (India Standard Time)
parent.component.ts:56 After debounce time :  tech Wed Sep 09 2026 01:14:05 GMT+0530 (India Standard Time)
parent.component.ts:60 After subscribe :  Wed Sep 09 2026 01:14:05 GMT+0530 (India Standard Time)

=================================================================================================================

12. [distinctUntilChanged] Why use it with search?
distinctUntilChanged() is used to prevent processing the same search value repeatedly. It compares the current value with the previous value. 
If they are the same, it does not emit the value again.

For example, suppose your search input produces these values:

Angular
Angular
Angular
Java
Java
RxJS

Without distinctUntilChanged():

Angular → process
Angular → process
Angular → process
Java    → process
Java    → process
RxJS    → process

With distinctUntilChanged():

Angular → process
Angular → ❌ ignored
Angular → ❌ ignored
Java    → process
Java    → ❌ ignored
RxJS    → process

So when used with a search box, you commonly write:

this.searchControl.valueChanges
  .pipe(
    debounceTime(300),
    distinctUntilChanged()
  )
  .subscribe(searchText => {
    console.log(searchText);
  });

The two operators solve different problems:

debounceTime(300)
        ↓
Wait until the user stops typing

distinctUntilChanged()
        ↓
Don't process the same value twice in a row

For example, if the user types:

Angular

and then deletes a character and types it again:

Angular → Angula → Angular

distinctUntilChanged() will allow the final Angular, because the immediately previous value was Angula. 
It only compares with the previous emission, not with every value that has ever occurred.

Easy way to remember:

debounceTime() = "Wait before processing."
distinctUntilChanged() = "Don't process the same value twice in a row."

import { Component } from '@angular/core';
import { debounceTime, distinctUntilChanged, tap } from 'rxjs';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

export interface Book {
  id: number;
  title: string;
  author: string;
  category: string;
}

@Component({
  selector: 'app-parent',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule
  ],
  templateUrl: './parent.component.html',
  styleUrl: './parent.component.css'
})
export class ParentComponent {

  searchControl = new FormControl('', {
    nonNullable: true
  });

  books: Book[] = [
    {
      id: 1,
      title: 'Angular Basics',
      author: 'John',
      category: 'Technology'
    },
    {
      id: 2,
      title: 'The Alchemist',
      author: 'Paulo Coelho',
      category: 'Fiction'
    },
    {
      id: 3,
      title: 'RxJS in Action',
      author: 'David',
      category: 'Technology'
    }
  ];

  filteredBooks: Book[] = this.books;

  constructor() {

    this.searchControl.valueChanges
      .pipe(
        tap(value =>
          console.log(
            `Before debounceTime | searchedText: "${value}" | Time: ${new Date()}`
          )
        ),

        debounceTime(3000),

        tap(value =>
          console.log(
            `After debounceTime | searchedText: "${value}" | Time: ${new Date()}`
          )
        ),

        tap(value =>
          console.log(
            `Before distinctUntilChanged | searchedText: "${value}" | Time: ${new Date()}`
          )
        ),

        distinctUntilChanged(),

        tap(value =>
          console.log(
            `After distinctUntilChanged | searchedText: "${value}" | Time: ${new Date()}`
          )
        )
      )
      .subscribe((searchText: string) => {

        console.log(
          `After subscribe | searchedText: "${searchText}" | Time: ${new Date()}`
        );

        const search = searchText.toLowerCase();

        this.filteredBooks = this.books.filter(book =>
          book.category.toLowerCase().startsWith(search)
        );

      });
  }
}

Before debounceTime | searchedText: "t" | Time: Wed Sep 09 2026 01:24:35 GMT+0530 (India Standard Time)
parent.component.ts:57 Before debounceTime | searchedText: "te" | Time: Wed Sep 09 2026 01:24:36 GMT+0530 (India Standard Time)
parent.component.ts:57 Before debounceTime | searchedText: "tec" | Time: Wed Sep 09 2026 01:24:36 GMT+0530 (India Standard Time)
parent.component.ts:57 Before debounceTime | searchedText: "tech" | Time: Wed Sep 09 2026 01:24:36 GMT+0530 (India Standard Time)
parent.component.ts:65 After debounceTime | searchedText: "tech" | Time: Wed Sep 09 2026 01:24:39 GMT+0530 (India Standard Time)
parent.component.ts:71 Before distinctUntilChanged | searchedText: "tech" | Time: Wed Sep 09 2026 01:24:39 GMT+0530 (India Standard Time)
parent.component.ts:79 After distinctUntilChanged | searchedText: "tech" | Time: Wed Sep 09 2026 01:24:39 GMT+0530 (India Standard Time)
parent.component.ts:86 After subscribe | searchedText: "tech" | Time: Wed Sep 09 2026 01:24:39 GMT+0530 (India Standard Time)
parent.component.ts:57 Before debounceTime | searchedText: "tec" | Time: Wed Sep 09 2026 01:24:42 GMT+0530 (India Standard Time)
parent.component.ts:57 Before debounceTime | searchedText: "tech" | Time: Wed Sep 09 2026 01:24:42 GMT+0530 (India Standard Time)
parent.component.ts:65 After debounceTime | searchedText: "tech" | Time: Wed Sep 09 2026 01:24:45 GMT+0530 (India Standard Time)
parent.component.ts:71 Before distinctUntilChanged | searchedText: "tech" | Time: Wed Sep 09 2026 01:24:45 GMT+0530 (India Standard Time)

==================================================================================================================================
13. [switchMap] Why is it suitable for Book Search?

switchMap() is suitable for a search box because the user can type many different search terms quickly, 
and we usually only care about the result for the latest search term.

For example, imagine the user types:

A
An
Ang
Angular

Each search term could start an API request:

"A"       → API request 1
"An"      → API request 2
"Ang"     → API request 3
"Angular" → API request 4

The problem is that these requests don't necessarily finish in the same order. For example:

"A"       → takes 500ms
"An"      → takes 300ms
"Ang"     → takes 200ms
"Angular" → takes 100ms

We don't want an old "A" result to arrive later and replace our "Angular" results. switchMap() solves this by switching to the latest Observable 
and unsubscribing from the previous one.

For example:

this.searchControl.valueChanges
  .pipe(
    debounceTime(300),
    distinctUntilChanged(),

    switchMap(searchText =>
      this.bookService.searchBooks(searchText)
    )
  )
  .subscribe(books => {
    this.books = books;
  });

The important part is:

switchMap(searchText =>
  this.bookService.searchBooks(searchText)
)

Every time a new search term arrives, switchMap() subscribes to the new API Observable and stops listening to the previous one.

Think of it like this:

User types "Ang"
       ↓
API request for "Ang"
       ↓
User types "Angular"
       ↓
❌ Stop listening to "Ang"
       ↓
API request for "Angular"
       ↓
✅ Use "Angular" results

So the main reason switchMap() is good for search is:
Search results should correspond to the latest search term, not an older term the user has already moved past.
debounceTime() + distinctUntilChanged() + switchMap()

These three are commonly used together:

this.searchControl.valueChanges.pipe(
  debounceTime(300),
  distinctUntilChanged(),
  switchMap(searchText =>
    this.bookService.searchBooks(searchText)
  )
);

Their responsibilities are different:

debounceTime(300)
        ↓
Wait until user stops typing

distinctUntilChanged()
        ↓
Ignore the same search value

switchMap()
        ↓
Cancel/stop listening to the previous search
and switch to the latest search

One important point for your current project: since you don't have a backend, you don't really need switchMap() for your local books array. 
switchMap() becomes useful when each search term starts another Observable, such as an HTTP request.



<h2>Book Search</h2>

<input
  type="text"
  [formControl]="searchControl"
  placeholder="Search books..."
/>

<ul>
  <li *ngFor="let book of filteredBooks">
    {{ book.title }} - {{ book.author }} - {{ book.category }}
  </li>
</ul>


import { Component } from '@angular/core';
import {
  debounceTime,
  distinctUntilChanged,
  tap,
  switchMap,
  timer,
  map,
  finalize
} from 'rxjs';

import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

export interface Book {
  id: number;
  title: string;
  author: string;
  category: string;
}

@Component({
  selector: 'app-parent',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule
  ],
  templateUrl: './parent.component.html',
  styleUrl: './parent.component.css'
})
export class ParentComponent {

  searchControl = new FormControl('', {
    nonNullable: true
  });

  books: Book[] = [
    {
      id: 1,
      title: 'Angular Basics',
      author: 'John',
      category: 'Technology'
    },
    {
      id: 2,
      title: 'The Alchemist',
      author: 'Paulo Coelho',
      category: 'Fiction'
    },
    {
      id: 3,
      title: 'RxJS in Action',
      author: 'David',
      category: 'Technology'
    }
  ];

  filteredBooks: Book[] = this.books;

  constructor() {

    this.searchControl.valueChanges
      .pipe(
        debounceTime(100),
        distinctUntilChanged(),
        switchMap(searchText => {
          console.log(`START request | searchedText: "${searchText}" | Time: ${new Date()}`);

          const search = searchText.toLowerCase();
          return timer(3000).pipe(
            map(() => {
              return this.books.filter(book =>
                book.category
                  .toLowerCase()
                  .startsWith(search)
              );
            }),

            tap(result => {
              console.log(
                `RESPONSE received | searchedText: "${searchText}" | result:`,
                result
              );
            }),

            finalize(() => {
              console.log(`CLEANUP / UNSUBSCRIBE | searchedText: "${searchText}" | Time: ${new Date()}`);

            })

          );

        })

      )
      .subscribe((books: Book[]) => {
        console.log(`AFTER subscribe | books:`, books);
        this.filteredBooks = books;

      });
  }
}


Output : 
START request | searchedText: "t" | Time: Wed Sep 09 2026 01:38:47 GMT+0530 (India Standard Time)
parent.component.ts:89 CLEANUP / UNSUBSCRIBE | searchedText: "t" | Time: Wed Sep 09 2026 01:38:47 GMT+0530 (India Standard Time)
parent.component.ts:68 START request | searchedText: "te" | Time: Wed Sep 09 2026 01:38:47 GMT+0530 (India Standard Time)
parent.component.ts:89 CLEANUP / UNSUBSCRIBE | searchedText: "te" | Time: Wed Sep 09 2026 01:38:47 GMT+0530 (India Standard Time)
parent.component.ts:68 START request | searchedText: "tec" | Time: Wed Sep 09 2026 01:38:47 GMT+0530 (India Standard Time)
parent.component.ts:89 CLEANUP / UNSUBSCRIBE | searchedText: "tec" | Time: Wed Sep 09 2026 01:38:47 GMT+0530 (India Standard Time)
parent.component.ts:68 START request | searchedText: "tech" | Time: Wed Sep 09 2026 01:38:47 GMT+0530 (India Standard Time)
parent.component.ts:81 RESPONSE received | searchedText: "tech" | result: (2) [{…}, {…}]
parent.component.ts:101 AFTER subscribe | books: (2) [{…}, {…}]
parent.component.ts:89 CLEANUP / UNSUBSCRIBE | searchedText: "tech" | Time: Wed Sep 09 2026 01:38:50 GMT+0530 (India Standard Time)

=========================================================================================================================
14. [mergeMap] When would it be appropriate?

mergeMap() is appropriate when you have multiple inner Observables and you want all of them to continue running at the same time. Unlike switchMap(), mergeMap() does not cancel the previous Observable when a new value arrives.

For example, suppose you have multiple books and you want to load additional information for every book:

from(this.books).pipe(
  mergeMap(book =>
    this.getBookDetails(book.id)
  )
).subscribe(details => {
  console.log(details);
});

Imagine the books are:

Angular
RxJS
Java

mergeMap() can start all three operations:

Angular → getBookDetails(1) ────────┐
RxJS    → getBookDetails(2) ────┐  │
Java    → getBookDetails(3) ─┐  │  │
                              ↓  ↓  ↓
                         All continue

Even if Angular takes 3 seconds and Java takes only 1 second, mergeMap() doesn't cancel Angular. All requests are allowed to complete.

A simple example without an API is:

import { from, of, mergeMap, delay } from 'rxjs';

from([1, 2, 3]).pipe(
  mergeMap(id =>
    of(`Book ${id}`).pipe(
      delay(1000)
    )
  )
).subscribe(result => {
  console.log(result);
});

Here, each number creates a new Observable, and mergeMap() subscribes to all of them concurrently.

The easiest way to compare it with switchMap() is:

switchMap()
1 → start
2 → cancel 1, start 2
3 → cancel 2, start 3
                    ↓
                only latest

mergeMap()
1 → start ──────────→ complete
2 → start ──────────→ complete
3 → start ──────────→ complete
        ↓
   all continue

So remember:

switchMap() → I only care about the latest operation.

mergeMap() → I want all operations to continue.

For a search box, switchMap() is usually more appropriate because you generally want only the latest search result. 
For something like loading details for multiple books, processing multiple independent tasks, or sending multiple independent requests, 
mergeMap() can be appropriate.

===============================================================================================================================
15. [concatMap] When would sequential Book operations be useful?

In a Book Gallery application, concatMap is useful when you have multiple operations that must execute one after another in the same order.
In simple terms:
concatMap puts asynchronous operations into a queue and executes them one by one, preserving their order.

Real-world example: E-commerce item booking

Suppose a customer clicks "Buy Now" for a product.

Before completing the booking, the application needs to perform these operations:

1. Get customer information
        ↓
2. Reserve the product/inventory
        ↓
3. Process payment
        ↓
4. Complete the booking

These operations are dependent on each other.

For example, we shouldn't process the payment until the inventory has been successfully reserved.

Angular example
this.userService.getUserInfo(userId).pipe(

  concatMap(user => {

    console.log('User received:', user);

    return this.inventoryService.reserveItem({
      userId: user.id,
      productId: productId,
      quantity: 1
    });
  }),

  concatMap(inventory => {

    console.log('Inventory reserved:', inventory);

    return this.paymentService.makePayment({
      inventoryId: inventory.inventoryId,
      amount: productPrice
    });
  })

).subscribe({
  next: payment => {
    console.log('Payment successful:', payment);
  },
  error: error => {
    console.error('Booking failed:', error);
  }
});
How does the data flow?

Suppose the first API returns:

{
  "id": 101,
  "name": "Sandeep"
}

Then:

concatMap(user => ...)

receives that object as user.

We use:

user.id

to reserve the inventory.

The inventory API might then return:

{
  "inventoryId": 5001,
  "productId": 25,
  "status": "RESERVED"
}

That response becomes the value received by:

concatMap(inventory => ...)

We can then use:

inventory.inventoryId

when making the payment.

So the data flows like this:

getUserInfo()
      │
      │ emits User
      ▼
concatMap(user => reserveItem(user.id))
      │
      │ emits Inventory
      ▼
concatMap(inventory => makePayment(inventory.inventoryId))
      │
      │ emits Payment
      ▼
subscribe(payment => ...)
Why concatMap is useful here

The order matters:

Get User
   ↓ complete
Reserve Inventory
   ↓ complete
Make Payment
   ↓ complete
Booking Complete

If inventory reservation fails:

Get User
   ↓
Reserve Inventory
   ↓
❌ Failed
   ↓
Payment is NOT started

This prevents us from charging the customer when the item wasn't successfully reserved.

Interview answer

concatMap is useful when I have dependent asynchronous operations that must execute sequentially. 
For example, in an e-commerce application, when a customer books an item, I can first fetch the customer information, 
then reserve the inventory, and only after the inventory is successfully reserved, process the payment. 
The response emitted by each API becomes the input to the next concatMap, 
allowing the data to flow through the checkout process while maintaining the required sequence.

===============================================================================================================================
16. [exhaustMap] Where could it prevent duplicate actions?

exhaustMap runs one task at a time. While a task is running, it ignores any new requests. When the task finishes, it accepts the next one.

The Problem

A customer writes a review and clicks Submit. The server is slow, so they click again. Without protection, 
the same review is posted two or three times.


The Service
typescript
@Injectable({ providedIn: 'root' })
export class ReviewService {
  constructor(private http: HttpClient) {}

  submitReview(bookId: number, review: ReviewDto) {
    return this.http.post<Review>(`/api/books/${bookId}/reviews`, review);
  }
}


The Component
typescript
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Subject, EMPTY } from 'rxjs';
import { exhaustMap, catchError, finalize, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-book-review',
  templateUrl: './book-review.component.html'
})
export class BookReviewComponent implements OnInit, OnDestroy {
  bookId = 42;
  submitting = false;
  message = '';

  reviewForm = this.fb.group({
    rating: [5, [Validators.required, Validators.min(1), Validators.max(5)]],
    comment: ['', [Validators.required, Validators.minLength(10)]]
  });

  private submit$ = new Subject<void>();
  private destroy$ = new Subject<void>();

  constructor(private fb: FormBuilder, private reviewService: ReviewService) {}

  ngOnInit() {
    this.submit$.pipe(
      exhaustMap(() => {
        this.submitting = true;
        return this.reviewService
          .submitReview(this.bookId, this.reviewForm.value)
          .pipe(
            catchError(() => {
              this.message = 'Could not submit review. Please try again.';
              return EMPTY;               // keeps the submit stream alive
            }),
            finalize(() => (this.submitting = false))
          );
      }),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.message = 'Thank you! Your review was posted.';
      this.reviewForm.reset({ rating: 5, comment: '' });
    });
  }

  onSubmit() {
    if (this.reviewForm.valid) {
      this.submit$.next();               // triggers exhaustMap
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}


The Template
html
<form [formGroup]="reviewForm" (ngSubmit)="onSubmit()">
  <select formControlName="rating">
    <option *ngFor="let n of [5,4,3,2,1]" [value]="n">{{ n }} stars</option>
  </select>

  <textarea formControlName="comment" placeholder="Write your review"></textarea>

  <button type="submit" [disabled]="reviewForm.invalid || submitting">
    {{ submitting ? 'Submitting...' : 'Submit Review' }}
  </button>

  <p *ngIf="message">{{ message }}</p>
</form>

What Happens When the User Clicks 3 Times Quickly
Click 1  → POST /reviews starts     ✅ accepted
Click 2  → ignored (request busy)   ❌
Click 3  → ignored (request busy)   ❌
...server responds → request completes → form resets
Click 4  → would start a new POST   ✅ (only if the user writes another review)

Result: one review posted, not three.

Line by Line
Code	Purpose
submit$.next()	Each click sends a trigger into the stream
exhaustMap(...)	Starts the POST only if no other POST is running; ignores extra triggers
catchError(... EMPTY)	Shows an error and lets the user try again without killing the stream
finalize(...)	Resets submitting whether the request succeeds or fails
takeUntil(destroy$)	Unsubscribes when the component is destroyed, avoiding memory leaks
[disabled]="... submitting"	UI feedback, with exhaustMap as the safety net

Key Points
Why exhaustMap and not concatMap? concatMap would queue the extra clicks and post the review two or three times, 
one after another. exhaustMap drops them.
Server-side check: also reject duplicate reviews on the backend (for example, one review per user per book) 
since exhaustMap only protects a single browser session.

One-Line Summary

exhaustMap turns repeated clicks on Submit Review into a single POST request, so the same review is never posted more than once.

===============================================================================================================================
17. [switchMap vs mergeMap] What happens if search uses mergeMap?

With mergeMap, every keystroke starts a new request and none of the old ones are cancelled. All requests run in parallel, and responses can arrive out of order, so the screen can end up showing results for an older search instead of the latest one. This bug is called a race condition.

The Story Version

A customer types "harry" into the bookstore search box. The manager has a rule for Sam:

"Sam, every time the customer adds a letter, send a new runner to the warehouse. Don't call back the old runners. Show whatever comes back."

Runners for "h", "ha", "har", "harr", "harry" all go out at once. The runner for "harry" may return first, but the slow runner for "ha" arrives later and overwrites the correct results with wrong ones.

What Goes Wrong
Typing:      h --- ha --- har --- harr --- harry

Requests:    "h"      ────────────────────────► (slow, returns last)
             "ha"       ──────────► 
             "har"        ────► 
             "harr"         ──►
             "harry"          ─►  (returns first)

Order of responses:  harry, harr, har, ha, h
Screen finally shows: results for "h"  ❌  (user typed "harry")
The Code That Causes It
typescript
// ❌ Buggy: mergeMap
this.searchControl.valueChanges.pipe(
  mergeMap(term => this.bookService.searchBooks(term))
).subscribe(books => this.books = books);
The Fix
typescript
// ✅ Correct: switchMap (with debounce for good measure)
this.searchControl.valueChanges.pipe(
  debounceTime(300),
  distinctUntilChanged(),
  switchMap(term => this.bookService.searchBooks(term))
).subscribe(books => this.books = books);

switchMap cancels the previous request as soon as a new keystroke arrives, so only the latest search can ever reach the screen.

Problems with mergeMap in Search
Problem	                    Explanation
Stale results	              A slow, old response overwrites the newest one
Flickering list	            Results jump between different searches as responses arrive
Wasted requests	            Old requests keep running even though nobody needs them
Server overload	            Five letters typed means five simultaneous requests per user
Unpredictable behavior	    Which result wins depends on network timing, so the bug appears randomly and is hard to reproduce

switchMap vs mergeMap in Search
	                                                    switchMap	                          mergeMap
Old request when new keystroke arrives	              Cancelled	                        Keeps running
Requests in flight	                                  Only 1	                          Many
Result shown	                                        Always the latest search	        Whichever response arrives last
Correct for search?	                                  ✅ Yes	                           ❌ No
When mergeMap Is Actually Right

When every result matters and they are independent, for example loading details of 20 different books at once, 
or sending several unrelated saves in parallel. It's wrong for search because only the latest query matters.

Conclusion

If search uses mergeMap, old requests are not cancelled and run in parallel, 
so responses can arrive out of order and the screen may show results for an outdated search term. 
switchMap fixes this by cancelling the previous request whenever a new one starts.

===============================================================================================================================
18. [forkJoin] How would you load Book, Author and Category APIs?
forkJoin runs multiple Observables in parallel and emits their final results together, once all of them have completed.

Use it when you need several independent API responses before you can continue.

Example: Book Gallery Page

The Books page needs three APIs that don't depend on each other:

GET /api/books
GET /api/authors
GET /api/categories
typescript
forkJoin({
  books: this.bookService.getBooks(),
  authors: this.authorService.getAuthors(),
  categories: this.categoryService.getCategories()
}).subscribe({
  next: ({ books, authors, categories }) => {
    this.books = books;
    this.authors = authors;
    this.categories = categories;
  },
  error: err => console.error('Failed to load data:', err)
});
How It Works
             ┌── GET /api/books ────────┐
forkJoin ────┼── GET /api/authors ──────┼──→ all complete → emit once
             └── GET /api/categories ───┘

All three requests start together. forkJoin waits for the slowest one, then emits a single object:

typescript
{ books: [...], authors: [...], categories: [...] }

Total time is about the slowest request, not the sum of all three.

forkJoin vs concatMap
	                  forkJoin	                              concatMap
Execution	          Parallel	                              Sequential
Use when	          Calls are independent	                  One call depends on another
Result	            One combined result at the end	        Results one by one

Key Points
If any request fails, forkJoin errors and the other results are lost. Use catchError on individual calls if some data is optional.
It works only with Observables that complete, such as HttpClient calls.
Conclusion

forkJoin loads the Book, Author and Category APIs in parallel and delivers all three results together, 
so the page renders only when everything is ready.

===============================================================================================================================
19. [combineLatest] How would you combine search/filter/sort streams?
combineLatest combines multiple Observables and emits an array (or object) of their latest values every time any one of them emits. It starts emitting only after every source has emitted at least once.

Use it when a result depends on several changing inputs at the same time.

Example: Book Gallery Controls

The Books page has three controls, each producing its own stream:

Search box (title or author text)
Category filter (dropdown)
Sort option (price, title, rating)

Whenever any of them changes, the book list must update using the current value of all three.

typescript
searchControl   = new FormControl('');
categoryControl = new FormControl('all');
sortControl     = new FormControl('title');

books$ = this.bookService.getBooks();   // loaded once

visibleBooks$ = combineLatest({
  books:    this.books$,
  search:   this.searchControl.valueChanges.pipe(
              startWith(''), debounceTime(300), distinctUntilChanged()),
  category: this.categoryControl.valueChanges.pipe(startWith('all')),
  sort:     this.sortControl.valueChanges.pipe(startWith('title'))
}).pipe(
  map(({ books, search, category, sort }) => {
    let result = books.filter(b =>
      b.title.toLowerCase().includes(search.toLowerCase()) &&
      (category === 'all' || b.category === category)
    );
    return result.sort((a, b) =>
      sort === 'price' ? a.price - b.price : a.title.localeCompare(b.title)
    );
  })
);


html
<div *ngFor="let book of visibleBooks$ | async">{{ book.title }}</div>
How It Works
search:    --"h"------"ha"--------------------
category:  ----"all"-------------"fiction"-----
sort:      ------"title"------------------------

combineLatest:
                 [ha, all, title]  [ha, fiction, title]

Every emission uses the latest value from each stream, so changing only the category still keeps the current search text and sort order.

Why startWith Is Needed

combineLatest emits only after all sources have emitted once. valueChanges doesn't emit until the user interacts, so without startWith the list would stay empty on page load. startWith gives each control an initial value.

combineLatest vs Other Operators
Operator	Behavior	Fit here
combineLatest	                    Emits on every change, using the latest of each	              ✅ Search + filter + sort
forkJoin	                        Emits once, after all complete	                              ❌ Streams never complete
merge	                            Emits values separately, not combined	                        ❌ Loses the other values
withLatestFrom	                  Only one stream triggers	                                    Useful when just one input should trigger

Key Points
Streams must emit at least once (use startWith), or nothing appears.
Use debounceTime only on the search input, so filter and sort react instantly.
Use the async pipe so Angular subscribes and unsubscribes automatically.
If the search should also call the server, add switchMap after combineLatest to cancel old requests.
Conclusion

combineLatest combines the search, filter and sort streams into one, 
recomputing the visible book list with the latest value of all three whenever any of them changes.

===============================================================================================================================
20. [withLatestFrom] Where could it be useful in Checkout?
withLatestFrom lets an action (like a click) pick up the current value of other data at the moment it happens. 
Only the action triggers something. Changes to the other data do nothing on their own.

In the Bookstore Checkout

The customer clicks Place Order. At that moment, the app needs to know:

What is in the cart right now?
Which address is selected right now?

withLatestFrom says: "When the click happens, look at the current cart and address, and take them along."

Easy Way to Remember

"I only act when the button is clicked. When it is, I check the latest cart and address first."

withLatestFrom: Full Working Checkout Example

A complete Angular example (standalone components, Angular 15+). The Place Order click is the trigger, 
and it reads the latest cart, address, and payment method at that moment.

1. Models
typescript
// models.ts
export interface CartItem {
  bookId: number;
  title: string;
  price: number;
  qty: number;
}

export interface Order {
  id: number;
  total: number;
}

export interface OrderRequest {
  items: CartItem[];
  address: string;
  payment: string;
}


2. Cart Service (holds the current cart)
typescript
// cart.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CartItem } from './models';

@Injectable({ providedIn: 'root' })
export class CartService {
  // BehaviorSubject always has a current value, so withLatestFrom never misses it
  private cartSubject = new BehaviorSubject<CartItem[]>([
    { bookId: 1, title: 'Clean Code', price: 30, qty: 1 },
    { bookId: 2, title: 'The Pragmatic Programmer', price: 35, qty: 2 }
  ]);

  cart$ = this.cartSubject.asObservable();

  changeQty(bookId: number, delta: number) {
    const updated = this.cartSubject.value.map(i =>
      i.bookId === bookId ? { ...i, qty: Math.max(1, i.qty + delta) } : i
    );
    this.cartSubject.next(updated);
  }

  clear() {
    this.cartSubject.next([]);
  }
}


3. Order Service
typescript
// order.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Order, OrderRequest } from './models';

@Injectable({ providedIn: 'root' })
export class OrderService {
  constructor(private http: HttpClient) {}

  placeOrder(request: OrderRequest) {
    return this.http.post<Order>('/api/orders', request);
  }
}


4. Checkout Component
typescript
// checkout.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject, EMPTY } from 'rxjs';
import {
  withLatestFrom, exhaustMap, catchError, finalize, map, startWith, takeUntil
} from 'rxjs/operators';
import { CartService } from './cart.service';
import { OrderService } from './order.service';
import { CartItem } from './models';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './checkout.component.html'
})
export class CheckoutComponent implements OnInit, OnDestroy {
  addressControl = new FormControl('', [Validators.required, Validators.minLength(5)]);
  paymentControl = new FormControl('card', Validators.required);

  cart$ = this.cartService.cart$;
  total$ = this.cart$.pipe(
    map(items => items.reduce((sum, i) => sum + i.price * i.qty, 0))
  );

  placing = false;
  message = '';

  // The TRIGGER stream: only this causes an order to be placed
  private placeOrder$ = new Subject<void>();
  private destroy$ = new Subject<void>();

  constructor(
    private cartService: CartService,
    private orderService: OrderService
  ) {}

  ngOnInit() {
    this.placeOrder$.pipe(
      // On each click, grab the LATEST cart, address and payment method
      withLatestFrom(
        this.cartService.cart$,
        this.addressControl.valueChanges.pipe(startWith(this.addressControl.value)),
        this.paymentControl.valueChanges.pipe(startWith(this.paymentControl.value))
      ),
      // Ignore extra clicks while an order is already being placed
      exhaustMap(([, items, address, payment]) => {
        this.placing = true;
        this.message = '';
        return this.orderService
          .placeOrder({ items, address: address!, payment: payment! })
          .pipe(
            catchError(() => {
              this.message = 'Order failed. Please try again.';
              return EMPTY;   // keeps the click stream alive
            }),
            finalize(() => (this.placing = false))
          );
      }),
      takeUntil(this.destroy$)
    ).subscribe(order => {
      this.message = `Order #${order.id} placed! Total: $${order.total}`;
      this.cartService.clear();
    });
  }

  changeQty(item: CartItem, delta: number) {
    this.cartService.changeQty(item.bookId, delta);   // does NOT place an order
  }

  onPlaceOrder() {
    if (this.addressControl.valid && this.paymentControl.valid) {
      this.placeOrder$.next();
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}


5. Template
html
<!-- checkout.component.html -->
<h2>Checkout</h2>

<ul>
  <li *ngFor="let item of cart$ | async">
    {{ item.title }} - ${{ item.price }} x {{ item.qty }}
    <button (click)="changeQty(item, -1)">-</button>
    <button (click)="changeQty(item, 1)">+</button>
  </li>
</ul>

<p><strong>Total: ${{ total$ | async }}</strong></p>

<label>
  Address
  <input [formControl]="addressControl" placeholder="Delivery address" />
</label>

<label>
  Payment
  <select [formControl]="paymentControl">
    <option value="card">Credit Card</option>
    <option value="upi">UPI</option>
    <option value="cod">Cash on Delivery</option>
  </select>
</label>

<button
  (click)="onPlaceOrder()"
  [disabled]="placing || addressControl.invalid">
  {{ placing ? 'Placing order...' : 'Place Order' }}
</button>

<p *ngIf="message">{{ message }}</p>


6. App Config (HttpClient must be provided)
typescript
// main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { CheckoutComponent } from './app/checkout.component';

bootstrapApplication(CheckoutComponent, {
  providers: [provideHttpClient()]
});

What Happens at Runtime
User changes quantity      → cart$ updates            → nothing is ordered
User types an address      → addressControl updates   → nothing is ordered
User clicks Place Order    → placeOrder$ emits
                           → withLatestFrom reads the latest cart, address, payment
                           → exhaustMap sends ONE POST /api/orders
User clicks again quickly  → ignored by exhaustMap

Key Points
placeOrder$ is the trigger. Cart, address, and payment changes never place an order.
BehaviorSubject and startWith guarantee each stream has a value before the first click. Without an initial value, withLatestFrom silently ignores the click.
exhaustMap after withLatestFrom prevents duplicate orders on double-click.
catchError inside the inner pipe keeps the button working after a failure.
Testing without a backend: replace the HTTP call in OrderService with of({ id: 101, total: 100 }).pipe(delay(1000)).
One-Line Summary

withLatestFrom lets the Place Order click read the latest cart, address, and payment method at that moment, so only the click triggers the order.

===================================================================================================================================
21. [catchError] How would you handle Book API errors?

catchError catches an error from an Observable and lets you replace it with a fallback value, a different Observable, 
or a new error, so the app doesn't crash and the stream can keep working.

In the Bookstore

The Book API can fail: the server is down, the network drops, or the book doesn't exist (404). 
Without handling, the error reaches subscribe unhandled, the stream dies, and the user sees a blank or broken page.

catchError says: "If something goes wrong, do this instead."

Example: Load Books with Error Handling
typescript
// book.service.ts
@Injectable({ providedIn: 'root' })
export class BookService {
  constructor(private http: HttpClient) {}

  getBooks() {
    return this.http.get<Book[]>('/api/books').pipe(
      retry(2),                                   // retry twice on failure
      catchError(err => this.handleError(err))
    );
  }

  private handleError(err: HttpErrorResponse) {
    let message: string;
    if (err.status === 0)        message = 'Network error. Check your connection.';
    else if (err.status === 404) message = 'Books not found.';
    else if (err.status >= 500)  message = 'Server error. Please try later.';
    else                         message = 'Something went wrong.';

    return throwError(() => new Error(message));  // pass a friendly error on
  }
}
typescript
// book-list.component.ts
export class BookListComponent implements OnInit {
  books: Book[] = [];
  loading = true;
  error = '';

  constructor(private bookService: BookService) {}

  ngOnInit() {
    this.bookService.getBooks().pipe(
      finalize(() => (this.loading = false))
    ).subscribe({
      next: books => (this.books = books),
      error: err => (this.error = err.message)
    });
  }
}

html
<p *ngIf="loading">Loading...</p>
<p *ngIf="error" class="error">{{ error }}</p>
<div *ngFor="let b of books">{{ b.title }}</div>


Three Ways to Use catchError
Strategy	Code	When to use
Return a fallback value	          catchError(() => of([]))	                                Page can work with empty data
Return another Observable	        catchError(() => this.getCachedBooks())	                  A backup source exists
Rethrow a friendly error	        catchError(e => throwError(() => new Error('...')))	      The component should show the message



Where to Place It

typescript
// ✅ Inside the inner pipe: only that request fails, the outer stream survives
searchControl.valueChanges.pipe(
  switchMap(term =>
    this.bookService.search(term).pipe(
      catchError(() => of([]))
    )
  )
)

// ❌ Outside: one error ends the whole search stream permanently
searchControl.valueChanges.pipe(
  switchMap(term => this.bookService.search(term)),
  catchError(() => of([]))
)

This is the most important rule: for streams that must keep running (search, clicks), put catchError inside the inner Observable.

Combining with retry
typescript
this.http.get<Book[]>('/api/books').pipe(
  retry({ count: 2, delay: 1000 }),   // wait 1s between retries
  catchError(() => of([]))            // then fall back
)

retry goes before catchError, so it tries again first and only falls back if all attempts fail. 
Retry only safe, repeatable calls like GET, never POST (it could create duplicate orders).

Key Points
Show a friendly message, not the raw server error.
Always reset loading with finalize, so the spinner stops on failure too.
Use a global HttpInterceptor for common errors (401 redirect to login, 500 toast) so you don't repeat handlers in every service.
Log the real error (console.error or a logging service) before returning the friendly one.

===================================================================================================================================
22. [retry] How would you retry transient failures?

retry re-subscribes to an Observable when it errors, so a failed request is tried again instead of failing immediately.

Use it for transient failures: temporary problems like a network blip or a 503 that may succeed on the next try.

Example
typescript
getBooks() {
  return this.http.get<Book[]>('/api/books').pipe(
    retry({ count: 3, delay: 1000 }),   // up to 3 retries, 1s apart
    catchError(() => of([]))            // fallback if all retries fail
  );
}
How It Works
Attempt 1 → fails (503) → wait 1s
Attempt 2 → fails (503) → wait 1s
Attempt 3 → succeeds ✅ → books shown

If every attempt fails, catchError provides the fallback.

Key Points
Limit the attempts and add a delay so you don't hammer a struggling server.
Put retry before catchError, otherwise the error is swallowed and never retried.
Retry only safe calls like GET. Never retry POST /orders, because it could create duplicate orders.
Don't retry permanent errors like 404 or 401; they fail every time.
Conclusion

Use retry with a limited count and a delay, placed before catchError, 
to retry temporary failures on safe requests like GET, while skipping permanent errors and unsafe calls like placing an order.

===================================================================================================================================
23. [finalize] How would you stop a loading spinner?

finalize runs a cleanup function when an Observable ends, whether it completes, errors, or is unsubscribed. 
It is the right place to stop a loading spinner.

Example
typescript
loading = false;

loadBooks() {
  this.loading = true;
  this.bookService.getBooks().pipe(
    finalize(() => (this.loading = false))   // runs on success AND failure
  ).subscribe({
    next: books => (this.books = books),
    error: () => (this.error = 'Failed to load books.')
  });
}

html
<p *ngIf="loading">Loading...</p>
<div *ngFor="let b of books">{{ b.title }}</div>

How It Works
Success:  request → response → complete → finalize → spinner stops ✅
Failure:  request → error                → finalize → spinner stops ✅
Cancel:   request → unsubscribed         → finalize → spinner stops ✅
Why Not Stop It in next?

If you set loading = false only inside next, a failed request never reaches it, and the spinner spins forever. finalize covers every ending.

Key Points
Start the spinner before subscribing, and stop it in finalize.
Place finalize last in the pipe so it runs after everything else.
Inside switchMap or exhaustMap, put it in the inner pipe so it resets after each request.
It doesn't receive the value or error, so use next and error for those.
Conclusion

Use finalize to set loading = false, because it runs on success, error, and cancellation, so the spinner always stops.

===================================================================================================================================
24. [shareReplay] How would you avoid duplicate Book API calls?

shareReplay shares one subscription among many subscribers and replays the last emitted value to late subscribers, 
so the source (like an HTTP request) runs only once.

The Problem

HttpClient Observables are cold: every subscribe() sends a new request. If the header, the book list, 
and a sidebar all subscribe to getBooks(), the app calls /api/books three times.

Example
typescript
@Injectable({ providedIn: 'root' })
export class BookService {
  private books$ = this.http.get<Book[]>('/api/books').pipe(
    shareReplay({ bufferSize: 1, refCount: true })
  );

  constructor(private http: HttpClient) {}

  getBooks() {
    return this.books$;   // everyone gets the same shared Observable
  }
}

html
<!-- Two async pipes, but only ONE HTTP request -->
<p>Total: {{ (books$ | async)?.length }}</p>
<div *ngFor="let b of books$ | async">{{ b.title }}</div>
How It Works
Without shareReplay:
  Subscriber A → GET /api/books
  Subscriber B → GET /api/books
  Subscriber C → GET /api/books      (3 calls)

With shareReplay:
  Subscriber A → GET /api/books      (1 call)
  Subscriber B → gets the same result
  Subscriber C → gets the cached result instantly



Add shareReplay({ bufferSize: 1, refCount: true }) to the Book API Observable so all subscribers share 
one HTTP request and reuse its result, avoiding duplicate calls.

===================================================================================================================================
25. [Memory Leaks] How could BookGallery leak subscriptions?

A subscription leak happens when a component subscribes to an Observable but never unsubscribes. 
After the component is destroyed, the subscription stays alive, keeping the component in memory and continuing to run its callbacks.

Where BookGallery Can Leak
Source	Why it leaks
Search box (valueChanges)	                          Never completes, so it lives forever
Router events / route params	                      Long-lived streams
interval / timer (auto-refresh, carousel)	          Keep ticking after the component is gone
Shared services (BehaviorSubject like cart$)	      Outlive the component
fromEvent (scroll, resize)	                        Listener stays attached to window
Manual .subscribe() in ngOnInit	                    Nothing cleans it up

HttpClient calls complete on their own, so they are usually safe.

Leaky Code
typescript
ngOnInit() {
  // ❌ Never unsubscribed
  this.searchControl.valueChanges.pipe(
    switchMap(term => this.bookService.search(term))
  ).subscribe(books => this.books = books);

  // ❌ Keeps running after the component is destroyed
  interval(5000).subscribe(() => this.refreshBooks());
}

Every time the user visits the gallery and leaves, another subscription is added. Memory grows and duplicate callbacks fire.

Fixes

1. async pipe (best): Angular unsubscribes automatically.

typescript
books$ = this.searchControl.valueChanges.pipe(
  switchMap(term => this.bookService.search(term))
);
html
<div *ngFor="let b of books$ | async">{{ b.title }}</div>

2. takeUntil with a destroy subject

typescript
private destroy$ = new Subject<void>();

ngOnInit() {
  interval(5000).pipe(takeUntil(this.destroy$))
    .subscribe(() => this.refreshBooks());
}

ngOnDestroy() {
  this.destroy$.next();
  this.destroy$.complete();
}

3. takeUntilDestroyed (Angular 16+, cleanest)

typescript
constructor() {
  interval(5000).pipe(takeUntilDestroyed())
    .subscribe(() => this.refreshBooks());
}

4. Store and unsubscribe manually

typescript
private sub = new Subscription();

ngOnInit() { this.sub.add(stream$.subscribe(...)); }
ngOnDestroy() { this.sub.unsubscribe(); }

===================================================================================================================================
26. [takeUntilDestroyed] How would you solve subscription cleanup?

takeUntilDestroyed is an Angular (16+) RxJS operator that automatically unsubscribes from an Observable 
when the component (or service, directive) is destroyed. It replaces the manual destroy$ subject and ngOnDestroy boilerplate.

The Old Way vs the New Way
typescript
// ❌ Old: boilerplate
private destroy$ = new Subject<void>();

ngOnInit() {
  interval(5000).pipe(takeUntil(this.destroy$)).subscribe(...);
}

ngOnDestroy() {
  this.destroy$.next();
  this.destroy$.complete();
}
typescript
// ✅ New: one operator
constructor() {
  interval(5000).pipe(takeUntilDestroyed()).subscribe(...);
}


Example: BookGallery
typescript
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({ selector: 'app-book-gallery', standalone: true, templateUrl: './book-gallery.component.html' })
export class BookGalleryComponent implements OnInit {
  private bookService = inject(BookService);
  private destroyRef = inject(DestroyRef);
  searchControl = new FormControl('');
  books: Book[] = [];

  // 1. In the constructor (injection context): no argument needed
  constructor() {
    interval(30000).pipe(takeUntilDestroyed())
      .subscribe(() => this.refreshBooks());
  }

  // 2. Outside the constructor (e.g. ngOnInit): pass DestroyRef
  ngOnInit() {
    this.searchControl.valueChanges.pipe(
      switchMap(term => this.bookService.search(term)),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(books => (this.books = books));
  }
}


How It Works
Component created   → subscription starts
Component destroyed → Angular fires DestroyRef → takeUntilDestroyed completes the stream
                    → subscription is cleaned up ✅
