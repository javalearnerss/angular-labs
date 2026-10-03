package com.bookgallery.server.service;

import com.bookgallery.server.model.Book;
import com.bookgallery.server.model.BookRequest;
import com.bookgallery.server.model.Category;
import com.bookgallery.server.model.PageResponse;
import com.bookgallery.server.repository.BookRepository;
import com.bookgallery.server.repository.CategoryRepository;
import com.bookgallery.server.service.BookImageStorageService;
import jakarta.transaction.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.util.*;
import java.util.stream.Collectors;
/**
 * Service layer responsible for book-related business operations.
 *
 * <p>This service handles book retrieval, filtering, sorting, pagination,
 * creation, updates, validation, ISBN normalization, and cover image management.</p>
 *
 * <p>Database operations are delegated to {@link BookRepository} and category
 * validation is handled through {@link CategoryRepository}.</p>
 */
@Service
public class BookService {

    private static final String DEFAULT_COVER = "/images/books/no-preview.jpg";

    private final BookRepository bookRepository;
    private final CategoryRepository categoryRepository;
    private final BookImageStorageService imageStorageService;

    /**
     * Creates a new BookService with the required repository and image storage dependencies.
     *
     * @param bookRepository repository used for book persistence and queries
     * @param categoryRepository repository used for category validation
     * @param imageStorageService service responsible for storing and deleting cover images
     */
    public BookService(BookRepository bookRepository, CategoryRepository categoryRepository, BookImageStorageService imageStorageService) {
        this.bookRepository = bookRepository;
        this.categoryRepository = categoryRepository;
        this.imageStorageService = imageStorageService;
    }

    /**
     * Retrieves all books from the database.
     *
     * @return list containing all books
     */
    public List<Book> getAllBooks() {
        return bookRepository.findAll();
    }

    /**
     * Retrieves books using optional text and category filters.
     *
     * <p>The search text is matched against the book title and author.
     * Category filtering is performed using category names.</p>
     *
     * @param query optional search text used to filter books
     * @param categories optional category names used to filter books
     * @return list of books matching the supplied filters
     */
    public List<Book> getBooks(String query, List<String> categories) {
        List<Category> allCategories = categoryRepository.findAll();
        List<String> selectedCategories = categories == null ? List.of() : categories.stream().map(String::trim).filter(name -> !name.isBlank()).toList();
        List<Book> books;

        if (selectedCategories.isEmpty()) {
            books = getAllBooks();
        } else {
            Set<Long> categoryIds = selectedCategories.stream().map(name -> allCategories.stream().filter(category -> category.getName().equalsIgnoreCase(name)).findFirst().map(Category::getId).orElse(null)).filter(Objects::nonNull).collect(Collectors.toSet());
            books = getAllBooks().stream().filter(book -> categoryIds.contains(book.getCategoryId())).toList();
        }

        if (query == null || query.isBlank()) {
            return books;
        }

        String searchText = query.trim().toLowerCase();
        return books.stream().filter(book -> book.getTitle().toLowerCase().contains(searchText) || book.getAuthor().toLowerCase().contains(searchText)).toList();
    }

    /**
     * Searches books for the admin interface using text, category, status, sorting, and pagination.
     *
     * @param query optional search text matched against title, author, and ISBN
     * @param categoryId optional category ID used to filter books
     * @param status book availability status filter
     * @param sortBy sorting option such as newest, oldest, name, price-low, or price-high
     * @param pageNumber requested page number
     * @param pageSize number of books to return per page
     * @return paginated list of books matching the supplied criteria
     * @throws ResponseStatusException if an unsupported status or sort option is supplied
     */
    public PageResponse<Book> searchAdminBooks(String query, Long categoryId, String status, String sortBy, int pageNumber, int pageSize) {
        int safePageNumber = Math.max(pageNumber, 1);
        int safePageSize = pageSize <= 0 ? 0 : Math.min(pageSize, 100);
        String searchText = query == null ? "" : query.trim().toLowerCase(Locale.ROOT);
        String normalizedStatus = status == null ? "all" : status.trim().toLowerCase(Locale.ROOT);

        List<Book> filteredBooks = getAllBooks().stream()
                .filter(book -> searchText.isEmpty() || book.getTitle().toLowerCase(Locale.ROOT).contains(searchText) || book.getAuthor().toLowerCase(Locale.ROOT).contains(searchText) || book.getIsbn() != null && book.getIsbn().toLowerCase(Locale.ROOT).contains(searchText))
                .filter(book -> categoryId == null || categoryId <= 0 || categoryId.equals(book.getCategoryId()))
                .filter(book -> switch (normalizedStatus) {
                    case "all" -> true;
                    case "active" -> book.getStock() > 0;
                    case "out-of-stock", "out_of_stock" -> book.getStock() <= 0;
                    default -> throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unsupported book status");
                })
                .sorted(adminBookComparator(sortBy))
                .toList();

        int startIndex = Math.min((safePageNumber - 1) * safePageSize, filteredBooks.size());
        int endIndex = Math.min(startIndex + safePageSize, filteredBooks.size());
        return new PageResponse<>(filteredBooks.subList(startIndex, endIndex), safePageNumber, safePageSize, filteredBooks.size());
    }

    /**
     * Creates the comparator used to sort books in the admin search.
     *
     * @param sortBy requested sorting option
     * @return comparator matching the requested sorting option
     * @throws ResponseStatusException if the supplied sorting option is unsupported
     */
    private Comparator<Book> adminBookComparator(String sortBy) {
        String normalizedSort = sortBy == null ? "newest" : sortBy.trim().toLowerCase(Locale.ROOT);
        return switch (normalizedSort) {
            case "oldest" -> Comparator.comparing(Book::getId);
            case "price-low" -> Comparator.comparingDouble(Book::getPrice);
            case "price-high" -> Comparator.comparingDouble(Book::getPrice).reversed();
            case "name" -> Comparator.comparing(Book::getTitle, String.CASE_INSENSITIVE_ORDER);
            case "newest", "" -> Comparator.comparing(Book::getId).reversed();
            default -> throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unsupported sort order");
        };
    }

    /**
     * Retrieves a book using its unique ID.
     *
     * @param bookId unique identifier of the book
     * @return the matching book or null when the book does not exist
     */
    public Book getBookById(Long bookId) {
        return bookRepository.findById(bookId).orElse(null);
    }

    /**
     * Retrieves a book using its title.
     *
     * @param title title of the book
     * @return the matching book or null when the book does not exist
     */
    public Book getBookByTitle(String title) {
        return bookRepository.findByTitle(title);
    }

    /**
     * Creates and persists a new book.
     *
     * <p>The method validates the request, creates the book entity, stores the
     * optional cover image, and persists the book. If persistence fails after
     * image storage, the stored image is deleted to avoid an orphaned file.</p>
     *
     * @param request book details supplied by the client
     * @param coverImage optional cover image
     * @return the newly created book
     * @throws IOException if the cover image cannot be stored
     */
    @Transactional
    public Book createBook(BookRequest request, MultipartFile coverImage) throws IOException {
        validateBook(request, null);
        Book book = newBook(request);
        String storedImage = imageStorageService.store(coverImage);
        book.setCoverImage(storedImage == null ? DEFAULT_COVER : storedImage);

        try {
            return bookRepository.save(book);
        } catch (RuntimeException exception) {
            imageStorageService.delete(storedImage);
            throw exception;
        }
    }

    /**
     * Updates an existing book and optionally replaces its cover image.
     *
     * <p>The existing image is deleted only after the updated book has been
     * successfully persisted. If the update fails, the newly uploaded image
     * is removed to prevent unused files.</p>
     *
     * @param bookId ID of the book to update
     * @param request updated book details
     * @param coverImage optional replacement cover image
     * @return the updated book
     * @throws IOException if the cover image cannot be stored
     * @throws ResponseStatusException with HTTP 404 if the book does not exist
     */
    @Transactional
    public Book updateBook(Long bookId, BookRequest request, MultipartFile coverImage) throws IOException {
        Book book = bookRepository.findById(bookId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Book not found"));
        validateBook(request, bookId);

        String previousImage = book.getCoverImage();
        String storedImage = imageStorageService.store(coverImage);
        book.setTitle(request.title().trim());
        book.setAuthor(request.author().trim());
        book.setIsbn(normalizeIsbn(request.isbn()));
        book.setCategoryId(request.categoryId());
        book.setPrice(request.price());
        book.setStock(request.stock());
        book.setDescription(normalizeDescription(request.description()));

        if (storedImage != null) {
            book.setCoverImage(storedImage);
        }

        try {
            Book savedBook = bookRepository.save(book);

            if (storedImage != null) {
                imageStorageService.delete(previousImage);
            }

            return savedBook;
        } catch (RuntimeException exception) {
            imageStorageService.delete(storedImage);
            throw exception;
        }
    }

    /**
     * Creates a new Book entity from the supplied request.
     *
     * @param request book details
     * @return initialized Book entity
     */
    private Book newBook(BookRequest request) {
        Book book = new Book();
        book.setTitle(request.title().trim());
        book.setAuthor(request.author().trim());
        book.setIsbn(normalizeIsbn(request.isbn()));
        book.setCategoryId(request.categoryId());
        book.setPrice(request.price());
        book.setStock(request.stock());
        book.setDescription(normalizeDescription(request.description()));
        return book;
    }

    /**
     * Validates the supplied book request before creating or updating a book.
     *
     * <p>Validation includes required fields, category existence, price,
     * stock, description length, ISBN format, ISBN uniqueness, and title uniqueness.</p>
     *
     * @param request book request to validate
     * @param currentBookId ID of the book being updated, or null when creating a new book
     * @throws ResponseStatusException with HTTP 400 for invalid request data
     * @throws ResponseStatusException with HTTP 409 for duplicate ISBN or title
     */
    private void validateBook(BookRequest request, Long currentBookId) {
        if (request == null || request.title() == null || request.title().isBlank() || request.author() == null || request.author().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Title and author are required");
        }

        if (request.categoryId() == null || !categoryRepository.existsById(request.categoryId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Select a valid category");
        }

        if (request.price() == null || !Double.isFinite(request.price()) || request.price() <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Price must be greater than zero");
        }

        if (request.stock() == null || request.stock() < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Stock cannot be negative");
        }

        if (request.description() != null && request.description().length() > 500) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Description must be 500 characters or fewer");
        }

        String isbn = normalizeIsbn(request.isbn());

        if (isbn != null && !isValidIsbn(isbn)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Enter a valid ISBN-10 or ISBN-13");
        }

        if (isbn != null) {
            bookRepository.findByIsbn(isbn).ifPresent(existing -> {
                if (!existing.getId().equals(currentBookId)) {
                    throw new ResponseStatusException(HttpStatus.CONFLICT, "ISBN is already in use");
                }
            });
        }

        String title = request.title().trim();

        bookRepository.findByTitleIgnoreCase(title).ifPresent(existing -> {
            if (!existing.getId().equals(currentBookId)) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "A book with this title already exists");
            }
        });
    }

    /**
     * Normalizes an ISBN by removing spaces and hyphens and converting it to uppercase.
     *
     * @param isbn ISBN value supplied by the client
     * @return normalized ISBN or null when no ISBN was supplied
     */
    private String normalizeIsbn(String isbn) {
        if (isbn == null || isbn.isBlank()) {
            return null;
        }

        return isbn.replaceAll("[-\\s]", "").toUpperCase(Locale.ROOT);
    }

    /**
     * Normalizes the book description by trimming whitespace and converting blank values to null.
     *
     * @param description description supplied by the client
     * @return normalized description or null when no description is supplied
     */
    private String normalizeDescription(String description) {
        return description == null || description.isBlank() ? null : description.trim();
    }

    /**
     * Validates whether the supplied ISBN is a valid ISBN-10 or ISBN-13.
     *
     * @param isbn normalized ISBN value
     * @return true when the ISBN passes the corresponding checksum validation
     */
    private boolean isValidIsbn(String isbn) {
        if (isbn.matches("\\d{9}[\\dX]")) {
            int sum = 0;

            for (int index = 0; index < isbn.length(); index++) {
                int digit = isbn.charAt(index) == 'X' ? 10 : Character.digit(isbn.charAt(index), 10);
                sum += digit * (10 - index);
            }

            return sum % 11 == 0;
        }

        if (isbn.matches("\\d{13}")) {
            int sum = 0;

            for (int index = 0; index < isbn.length(); index++) {
                int digit = Character.digit(isbn.charAt(index), 10);
                sum += digit * (index % 2 == 0 ? 1 : 3);
            }

            return sum % 10 == 0;
        }

        return false;
    }
}
