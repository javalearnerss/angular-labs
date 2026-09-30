import { HttpClient, HttpParams, provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { cacheInterceptor } from './cache.interceptor';

describe('cacheInterceptor', () => {
  let http: HttpClient;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([cacheInterceptor])),
        provideHttpClientTesting()
      ]
    });

    http = TestBed.inject(HttpClient);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTestingController.verify());

  it('caches book-list GET responses', () => {
    const url = '/api/books';
    const params = new HttpParams().set('query', 'cache-spec-list');
    const response = { books: [], pageNumber: 1, pageSize: 12, totalBooks: 0, totalPages: 0 };
    let receivedResponse: unknown;

    http.get(url, { params }).subscribe();
    httpTestingController.expectOne(`${url}?query=cache-spec-list`).flush(response);

    http.get(url, { params }).subscribe(value => receivedResponse = value);

    expect(receivedResponse).toEqual(response);
    httpTestingController.expectNone(`${url}?query=cache-spec-list`);
  });

  it('does not cache individual book responses', () => {
    const url = '/api/books/987654';

    http.get(url).subscribe();
    const firstRequest = httpTestingController.expectOne(url);
    expect(firstRequest.request.method).toBe('GET');
    firstRequest.flush({ id: 987654 });

    http.get(url).subscribe();
    const secondRequest = httpTestingController.expectOne(url);
    expect(secondRequest.request.method).toBe('GET');
    secondRequest.flush({ id: 987654 });
  });

  it('invalidates cached book lists after a write', () => {
    const url = '/api/books';
    const params = new HttpParams().set('query', 'cache-spec-invalidation');
    const response = { books: [], pageNumber: 1, pageSize: 12, totalBooks: 0, totalPages: 0 };

    http.get(url, { params }).subscribe();
    httpTestingController.expectOne(`${url}?query=cache-spec-invalidation`).flush(response);

    http.post('/api/books', {}).subscribe();
    const writeRequest = httpTestingController.expectOne('/api/books');
    expect(writeRequest.request.method).toBe('POST');
    writeRequest.flush({});

    http.get(url, { params }).subscribe();
    const refreshedRequest = httpTestingController.expectOne(`${url}?query=cache-spec-invalidation`);
    expect(refreshedRequest.request.method).toBe('GET');
    refreshedRequest.flush(response);
  });
});
