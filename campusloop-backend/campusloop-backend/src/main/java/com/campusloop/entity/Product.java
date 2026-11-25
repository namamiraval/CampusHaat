package com.campusloop.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "products")
public class Product {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false, length = 100) private String title;
    @Column(nullable = false, length = 1500) private String description;
    @Column(nullable = false, precision = 10, scale = 2) private BigDecimal price;
    @Enumerated(EnumType.STRING) @Column(nullable = false) private ProductCategory category;
    @Enumerated(EnumType.STRING) @Column(name = "product_condition", nullable = false) private ProductCondition condition;
    @Enumerated(EnumType.STRING) @Column(nullable = false) private ProductStatus status = ProductStatus.AVAILABLE;
    @Column(nullable = false, length = 100) private String sellerName;
    @Column(nullable = false, length = 120) private String sellerEmail;
    @Column(length = 120) private String meetingPoint;
    @Column(length = 500) private String imageUrl;
    @Column(nullable = false) private LocalDateTime createdAt = LocalDateTime.now();

    public Product() {}
    @PrePersist void onCreate() { if (createdAt == null) createdAt = LocalDateTime.now(); if (status == null) status = ProductStatus.AVAILABLE; }
    public Long getId() { return id; } public void setId(Long id) { this.id = id; }
    public String getTitle() { return title; } public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; } public void setDescription(String description) { this.description = description; }
    public BigDecimal getPrice() { return price; } public void setPrice(BigDecimal price) { this.price = price; }
    public ProductCategory getCategory() { return category; } public void setCategory(ProductCategory category) { this.category = category; }
    public ProductCondition getCondition() { return condition; } public void setCondition(ProductCondition condition) { this.condition = condition; }
    public ProductStatus getStatus() { return status; } public void setStatus(ProductStatus status) { this.status = status; }
    public String getSellerName() { return sellerName; } public void setSellerName(String sellerName) { this.sellerName = sellerName; }
    public String getSellerEmail() { return sellerEmail; } public void setSellerEmail(String sellerEmail) { this.sellerEmail = sellerEmail; }
    public String getMeetingPoint() { return meetingPoint; } public void setMeetingPoint(String meetingPoint) { this.meetingPoint = meetingPoint; }
    public String getImageUrl() { return imageUrl; } public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public LocalDateTime getCreatedAt() { return createdAt; } public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
