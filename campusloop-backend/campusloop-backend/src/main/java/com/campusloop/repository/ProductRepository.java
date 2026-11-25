package com.campusloop.repository;

import com.campusloop.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByStatus(ProductStatus status);
    List<Product> findByCategoryAndStatus(ProductCategory category, ProductStatus status);
    List<Product> findByTitleContainingIgnoreCaseAndStatus(String title, ProductStatus status);
}
