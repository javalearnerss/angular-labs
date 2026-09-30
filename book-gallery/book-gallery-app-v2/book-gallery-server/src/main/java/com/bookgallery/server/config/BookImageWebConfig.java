package com.bookgallery.server.config;

import com.bookgallery.server.service.BookImageStorageService;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class BookImageWebConfig implements WebMvcConfigurer {

    private final BookImageStorageService imageStorageService;

    public BookImageWebConfig(BookImageStorageService imageStorageService) {
        this.imageStorageService = imageStorageService;
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/images/books/**")
            .addResourceLocations(
                imageStorageService.resourceLocation(),
                "classpath:/static/images/books/");
    }
}