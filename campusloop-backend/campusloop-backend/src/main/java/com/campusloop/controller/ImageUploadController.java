package com.campusloop.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.nio.file.*;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/products/images")
public class ImageUploadController {

    private final Path uploadDirectory =
            Paths.get("uploads").toAbsolutePath().normalize();

    @PostMapping
    public ResponseEntity<Map<String, String>> uploadImage(
            @RequestParam("image") MultipartFile image,
            @AuthenticationPrincipal UserDetails user) {

        if (image.isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Please select an image.");
        }

        String contentType = image.getContentType();

        if (contentType == null || !contentType.startsWith("image/")) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Only image files are allowed.");
        }

        try {
            Files.createDirectories(uploadDirectory);

            String extension = switch (contentType) {
                case "image/jpeg" -> ".jpg";
                case "image/png" -> ".png";
                case "image/webp" -> ".webp";
                case "image/gif" -> ".gif";
                default -> throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST, "Unsupported image format.");
            };

            String fileName = UUID.randomUUID() + extension;

            Path target = uploadDirectory.resolve(fileName).normalize();

            if (!target.startsWith(uploadDirectory)) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST, "Invalid file path.");
            }

            Files.copy(image.getInputStream(), target);

            return ResponseEntity.ok(Map.of(
                    "imageUrl", "/uploads/" + fileName
            ));

        } catch (IOException e) {
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Image upload failed.");
        }
    }
}