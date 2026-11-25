package com.campusloop.controller;

import com.campusloop.dto.RegistrationRequest;
import com.campusloop.service.StudentService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.campusloop.dto.OtpVerificationRequest;

import com.campusloop.dto.LoginRequest;
import com.campusloop.dto.LoginResponse;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final StudentService studentService;

    public AuthController(StudentService studentService) {
        this.studentService = studentService;
    }

    @PostMapping("/register")
    public ResponseEntity<String> register(
            @Valid @RequestBody RegistrationRequest request) {

        String response = studentService.registerStudent(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<String> verifyOtp(
         @Valid @RequestBody OtpVerificationRequest request) {

        String response = studentService.verifyOtp(request);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/resend-otp")
    public ResponseEntity<String> resendOtp(
            @RequestParam String email) {

        String response = studentService.resendOtp(email);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(
            @Valid @RequestBody LoginRequest request) {

        LoginResponse response = studentService.login(request);
        return ResponseEntity.ok(response);
    }
}
