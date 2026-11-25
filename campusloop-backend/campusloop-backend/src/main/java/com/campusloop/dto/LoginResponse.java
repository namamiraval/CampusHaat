package com.campusloop.dto;

public record LoginResponse(
    String token,
    String tokenType,
    long expiresIn
) {}