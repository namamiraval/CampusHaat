package com.campusloop.controller;

import com.campusloop.dto.ProductRequest;
import com.campusloop.entity.*;
import com.campusloop.service.ProductService;

import jakarta.validation.Valid;

import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "*")
public class ProductController {

    private final ProductService service;

    public ProductController(ProductService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<Product> create(
            @Valid @RequestBody ProductRequest request,
            @AuthenticationPrincipal UserDetails user) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(service.create(request, user.getUsername()));
    }

    @GetMapping
    public List<Product> getAll() {
        return service.getAvailable();
    }

    @GetMapping("/{id}")
    public Product getById(@PathVariable Long id) {
        return service.getById(id);
    }

    @GetMapping("/search")
    public List<Product> search(@RequestParam String keyword) {
        return service.search(keyword);
    }

    @GetMapping("/category/{category}")
    public List<Product> byCategory(
            @PathVariable ProductCategory category) {
        return service.byCategory(category);
    }

    @PutMapping("/{id}")
    public Product update(
            @PathVariable Long id,
            @Valid @RequestBody ProductRequest request,
            @AuthenticationPrincipal UserDetails user) {

        return service.update(id, request, user.getUsername());
    }

    @PatchMapping("/{id}/status")
    public Product updateStatus(
            @PathVariable Long id,
            @RequestParam ProductStatus status,
            @AuthenticationPrincipal UserDetails user) {

        return service.updateStatus(id, status, user.getUsername());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails user) {

        service.delete(id, user.getUsername());

        return ResponseEntity.noContent().build();
    }
}