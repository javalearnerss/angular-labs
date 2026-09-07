package com.bookgallery.server.service;

import com.bookgallery.server.model.Book;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class BookService {

    private final Map<String, List<Book>> bookCache =  new ConcurrentHashMap<>();

    @PostConstruct
    public void loadCache() {

        bookCache.put("fiction", getFictionBooks());
        bookCache.put("non-fiction", getNonFictionBooks());
        bookCache.put("science", getScienceBooks());
        bookCache.put("technology", getTechnologyBooks());
        bookCache.put("business", getBusinessBooks());
        bookCache.put("biography", getBiographyBooks());
        bookCache.put("self-help", getSelfHelpBooks());
        bookCache.put("children", getChildrenBooks());

        System.out.println("Books loaded into cache");
    }

    public List<Book> getAllBooks() {
        return bookCache.values().stream().flatMap(List::stream).toList();
    }

    public List<Book> getBooksByCategory(String category) {
        return bookCache.getOrDefault(category.toLowerCase(), List.of());
    }

    // =========================================================
    // FICTION - 5
    // =========================================================

    private List<Book> getFictionBooks() {

        return List.of(

                new Book(
                        1L,
                        "The Alchemist",
                        "Paulo Coelho",
                        "fiction",
                        399,
                        4.6,
                        "/images/books/the-alchemist.jpg"
                ),

                new Book(
                        2L,
                        "The Kite Runner",
                        "Khaled Hosseini",
                        "fiction",
                        499,
                        4.5,
                        "/images/books/the-kite-runner.jpg"
                ),

                new Book(
                        3L,
                        "The Book Thief",
                        "Markus Zusak",
                        "fiction",
                        450,
                        4.5,
                        "/images/books/the-book-thief.jpg"
                ),

                new Book(
                        4L,
                        "1984",
                        "George Orwell",
                        "fiction",
                        299,
                        4.6,
                        "/images/books/1984.jpg"
                ),

                new Book(
                        5L,
                        "The Great Gatsby",
                        "F. Scott Fitzgerald",
                        "fiction",
                        350,
                        4.4,
                        "/images/books/the-great-gatsby.jpg"
                )
        );
    }

    // =========================================================
    // NON-FICTION - 5
    // =========================================================

    private List<Book> getNonFictionBooks() {

        return List.of(

                new Book(
                        6L,
                        "Atomic Habits",
                        "James Clear",
                        "non-fiction",
                        599,
                        4.6,
                        "/images/books/atomic-habits.jpg"
                ),

                new Book(
                        7L,
                        "The Psychology of Money",
                        "Morgan Housel",
                        "non-fiction",
                        499,
                        4.5,
                        "/images/books/psychology-of-money.jpg"
                ),

                new Book(
                        8L,
                        "Sapiens",
                        "Yuval Noah Harari",
                        "non-fiction",
                        599,
                        4.6,
                        "/images/books/sapiens.jpg"
                ),

                new Book(
                        9L,
                        "Deep Work",
                        "Cal Newport",
                        "non-fiction",
                        550,
                        4.6,
                        "/images/books/deep-work.jpg"
                ),

                new Book(
                        10L,
                        "Ikigai",
                        "Hector Garcia",
                        "non-fiction",
                        450,
                        4.4,
                        "/images/books/ikigai.jpg"
                )
        );
    }

    // =========================================================
    // SCIENCE - 5
    // =========================================================

    private List<Book> getScienceBooks() {

        return List.of(

                new Book(
                        11L,
                        "A Brief History of Time",
                        "Stephen Hawking",
                        "science",
                        499,
                        4.5,
                        "/images/books/brief-history-of-time.jpg"
                ),

                new Book(
                        12L,
                        "Cosmos",
                        "Carl Sagan",
                        "science",
                        599,
                        4.7,
                        "/images/books/cosmos.jpg"
                ),

                new Book(
                        13L,
                        "The Selfish Gene",
                        "Richard Dawkins",
                        "science",
                        550,
                        4.5,
                        "/images/books/selfish-gene.jpg"
                ),

                new Book(
                        14L,
                        "The Gene",
                        "Siddhartha Mukherjee",
                        "science",
                        699,
                        4.6,
                        "/images/books/the-gene.jpg"
                ),

                new Book(
                        15L,
                        "Astrophysics for People in a Hurry",
                        "Neil deGrasse Tyson",
                        "science",
                        399,
                        4.4,
                        "/images/books/astrophysics.jpg"
                )
        );
    }

    // =========================================================
    // TECHNOLOGY - 5
    // =========================================================

    private List<Book> getTechnologyBooks() {

        return List.of(

                new Book(
                        16L,
                        "Clean Code",
                        "Robert C. Martin",
                        "technology",
                        799,
                        4.7,
                        "/images/books/clean-code.jpg"
                ),

                new Book(
                        17L,
                        "The Pragmatic Programmer",
                        "David Thomas",
                        "technology",
                        899,
                        4.8,
                        "/images/books/pragmatic-programmer.jpg"
                ),

                new Book(
                        18L,
                        "Designing Data-Intensive Applications",
                        "Martin Kleppmann",
                        "technology",
                        999,
                        4.8,
                        "/images/books/designing-data-intensive.jpg"
                ),

                new Book(
                        19L,
                        "JavaScript: The Definitive Guide",
                        "David Flanagan",
                        "technology",
                        699,
                        4.6,
                        "/images/books/javascript-definitive-guide.jpg"
                ),

                new Book(
                        20L,
                        "Refactoring",
                        "Martin Fowler",
                        "technology",
                        850,
                        4.7,
                        "/images/books/refactoring.jpg"
                )
        );
    }

    // =========================================================
    // BUSINESS - 5
    // =========================================================

    private List<Book> getBusinessBooks() {

        return List.of(

                new Book(
                        21L,
                        "Rich Dad Poor Dad",
                        "Robert T. Kiyosaki",
                        "business",
                        550,
                        4.4,
                        "/images/books/rich-dad-poor-dad.jpg"
                ),

                new Book(
                        22L,
                        "Think and Grow Rich",
                        "Napoleon Hill",
                        "business",
                        450,
                        4.6,
                        "/images/books/think-and-grow-rich.jpg"
                ),

                new Book(
                        23L,
                        "The Lean Startup",
                        "Eric Ries",
                        "business",
                        599,
                        4.4,
                        "/images/books/lean-startup.jpg"
                ),

                new Book(
                        24L,
                        "Zero to One",
                        "Peter Thiel",
                        "business",
                        450,
                        4.3,
                        "/images/books/zero-to-one.jpg"
                ),

                new Book(
                        25L,
                        "Good to Great",
                        "Jim Collins",
                        "business",
                        650,
                        4.5,
                        "/images/books/good-to-great.jpg"
                )
        );
    }

    // =========================================================
    // BIOGRAPHY - 5
    // =========================================================

    private List<Book> getBiographyBooks() {

        return List.of(

                new Book(
                        26L,
                        "Steve Jobs",
                        "Walter Isaacson",
                        "biography",
                        699,
                        4.6,
                        "/images/books/steve-jobs.jpg"
                ),

                new Book(
                        27L,
                        "Elon Musk",
                        "Walter Isaacson",
                        "biography",
                        799,
                        4.5,
                        "/images/books/elon-musk.jpg"
                ),

                new Book(
                        28L,
                        "Wings of Fire",
                        "A. P. J. Abdul Kalam",
                        "biography",
                        350,
                        4.7,
                        "/images/books/wings-of-fire.jpg"
                ),

                new Book(
                        29L,
                        "Long Walk to Freedom",
                        "Nelson Mandela",
                        "biography",
                        599,
                        4.7,
                        "/images/books/long-walk-to-freedom.jpg"
                ),

                new Book(
                        30L,
                        "Becoming",
                        "Michelle Obama",
                        "biography",
                        699,
                        4.6,
                        "/images/books/becoming.jpg"
                )
        );
    }

    // =========================================================
    // SELF HELP - 5
    // =========================================================

    private List<Book> getSelfHelpBooks() {

        return List.of(

                new Book(
                        31L,
                        "The 7 Habits of Highly Effective People",
                        "Stephen R. Covey",
                        "self-help",
                        599,
                        4.6,
                        "/images/books/7-habits.jpg"
                ),

                new Book(
                        32L,
                        "How to Win Friends and Influence People",
                        "Dale Carnegie",
                        "self-help",
                        399,
                        4.6,
                        "/images/books/how-to-win-friends.jpg"
                ),

                new Book(
                        33L,
                        "The Power of Now",
                        "Eckhart Tolle",
                        "self-help",
                        499,
                        4.5,
                        "/images/books/power-of-now.jpg"
                ),

                new Book(
                        34L,
                        "Think Like a Monk",
                        "Jay Shetty",
                        "self-help",
                        499,
                        4.4,
                        "/images/books/think-like-a-monk.jpg"
                ),

                new Book(
                        35L,
                        "The Subtle Art of Not Giving a F*ck",
                        "Mark Manson",
                        "self-help",
                        499,
                        4.5,
                        "/images/books/subtle-art.jpg"
                )
        );
    }

    // =========================================================
    // CHILDREN - 5
    // =========================================================

    private List<Book> getChildrenBooks() {

        return List.of(

                new Book(
                        36L,
                        "The Very Hungry Caterpillar",
                        "Eric Carle",
                        "children",
                        299,
                        4.8,
                        "/images/books/very-hungry-caterpillar.jpg"
                ),

                new Book(
                        37L,
                        "Charlotte’s Web",
                        "E. B. White",
                        "children",
                        350,
                        4.7,
                        "/images/books/charlottes-web.jpg"
                ),

                new Book(
                        38L,
                        "Matilda",
                        "Roald Dahl",
                        "children",
                        399,
                        4.8,
                        "/images/books/matilda.jpg"
                ),

                new Book(
                        39L,
                        "The Gruffalo",
                        "Julia Donaldson",
                        "children",
                        299,
                        4.7,
                        "/images/books/gruffalo.jpg"
                ),

                new Book(
                        40L,
                        "Charlie and the Chocolate Factory",
                        "Roald Dahl",
                        "children",
                        399,
                        4.8,
                        "/images/books/charlie-chocolate-factory.jpg"
                )
        );
    }

    // =========================================================
    // MORE - 5
    // =========================================================

    private List<Book> getMoreBooks() {

        return List.of(

                new Book(
                        41L,
                        "The 5 AM Club",
                        "Robin Sharma",
                        "more",
                        450,
                        4.5,
                        "/images/books/5-am-club.jpg"
                ),

                new Book(
                        42L,
                        "Dopamine Detox",
                        "Thibaut Meurisse",
                        "more",
                        399,
                        4.3,
                        "/images/books/dopamine-detox.jpg"
                ),

                new Book(
                        43L,
                        "The Four Agreements",
                        "Don Miguel Ruiz",
                        "more",
                        399,
                        4.5,
                        "/images/books/four-agreements.jpg"
                ),

                new Book(
                        44L,
                        "Man’s Search for Meaning",
                        "Viktor E. Frankl",
                        "more",
                        350,
                        4.7,
                        "/images/books/mans-search-for-meaning.jpg"
                ),

                new Book(
                        45L,
                        "The Power of Habit",
                        "Charles Duhigg",
                        "more",
                        499,
                        4.5,
                        "/images/books/power-of-habit.jpg"
                )
        );
    }
}