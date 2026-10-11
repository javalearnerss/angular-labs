CREATE TABLE categories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);


CREATE TABLE books (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    category_id BIGINT NOT NULL,
    price DOUBLE NOT NULL,
    image_url VARCHAR(500),
    CONSTRAINT fk_book_category FOREIGN KEY (category_id) REFERENCES categories(id)
);

CREATE TABLE reviews (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    book_id BIGINT NOT NULL,
    reviewer_name VARCHAR(255) NOT NULL,
    rating INT NOT NULL,
    review TEXT,
    CONSTRAINT fk_review_book FOREIGN KEY (book_id) REFERENCES books(id)
);


