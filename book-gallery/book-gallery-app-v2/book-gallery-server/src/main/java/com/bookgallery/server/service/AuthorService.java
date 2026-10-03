package com.bookgallery.server.service;

import com.bookgallery.server.model.Author;
import com.bookgallery.server.repository.AuthorRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AuthorService {

    private AuthorRepository authorRepository;

    public AuthorService(AuthorRepository authorRepository) {
        this.authorRepository = authorRepository;
    }

    public List<Author> allAuthors(){
        return authorRepository.findAll();
    }

}
