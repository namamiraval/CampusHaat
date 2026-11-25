package com.campusloop.dto;

import com.campusloop.entity.*;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;

public record ProductRequest(
    @NotBlank @Size(max = 100) String title,
    @NotBlank @Size(max = 1500) String description,
    @NotNull @DecimalMin("0.01") BigDecimal price,
    @NotNull ProductCategory category,
    @NotNull ProductCondition condition,
    @NotBlank @Size(max = 100) String sellerName,
    @NotBlank @Email @Size(max = 120) String sellerEmail,
    @Size(max = 120) String meetingPoint,
    @Size(max = 500) String imageUrl
) {}