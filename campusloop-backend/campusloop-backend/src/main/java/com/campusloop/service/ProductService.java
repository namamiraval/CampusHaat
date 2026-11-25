package com.campusloop.service;

import com.campusloop.dto.ProductRequest;
import com.campusloop.entity.*;
import com.campusloop.exception.*;
import com.campusloop.repository.ProductRepository;
import com.campusloop.repository.StudentRepository;

import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class ProductService {

    private final ProductRepository repository;
    private final StudentRepository studentRepository;
    private final NotificationService notificationService;

    public ProductService(
            ProductRepository repository,
            StudentRepository studentRepository,
            NotificationService notificationService) {

        this.repository = repository;
        this.studentRepository = studentRepository;
        this.notificationService = notificationService;
    }

    public Product create(ProductRequest request, String email) {

        Student student = getStudent(email);

        Product product = new Product();
        apply(product, request);

        product.setSellerName(student.getFullName());
        product.setSellerEmail(student.getEmail());

        Product saved = repository.save(product);

        notificationService.logNewListing(
                saved.getTitle(), saved.getSellerEmail());

        return saved;
    }

    public List<Product> getAvailable() {
        return repository.findByStatus(ProductStatus.AVAILABLE);
    }

    public Product getById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ProductNotFoundException(id));
    }

    public List<Product> search(String keyword) {
        if (keyword == null || keyword.isBlank()) {
            return getAvailable();
        }

        return repository.findByTitleContainingIgnoreCaseAndStatus(
                keyword.trim(), ProductStatus.AVAILABLE);
    }

    public List<Product> byCategory(ProductCategory category) {
        return repository.findByCategoryAndStatus(
                category, ProductStatus.AVAILABLE);
    }

    public Product update(Long id, ProductRequest request, String email) {

        Product product = getOwnedProduct(id, email);

        if (product.getStatus() == ProductStatus.SOLD) {
            throw new InvalidProductException(
                    "Sold products cannot be edited.");
        }

        apply(product, request);

        return repository.save(product);
    }

    public Product updateStatus(Long id, ProductStatus status, String email) {

        Product product = getOwnedProduct(id, email);

        if (product.getStatus() == ProductStatus.SOLD) {
            throw new InvalidProductException(
                    "A sold product cannot change status.");
        }

        product.setStatus(status);

        return repository.save(product);
    }

    public void delete(Long id, String email) {
        Product product = getOwnedProduct(id, email);
        repository.delete(product);
    }

    private Student getStudent(String email) {
        return studentRepository.findByEmail(email)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Student account not found."));
    }

    private Product getOwnedProduct(Long id, String email) {

        Product product = getById(id);

        if (!product.getSellerEmail().equalsIgnoreCase(email)) {
            throw new IllegalArgumentException(
                    "You are not authorized to modify this listing.");
        }

        return product;
    }

    private void apply(Product product, ProductRequest request) {

        product.setTitle(request.title().trim());
        product.setDescription(request.description().trim());
        product.setPrice(request.price());
        product.setCategory(request.category());
        product.setCondition(request.condition());
        product.setMeetingPoint(request.meetingPoint());
        product.setImageUrl(request.imageUrl());
    }
}