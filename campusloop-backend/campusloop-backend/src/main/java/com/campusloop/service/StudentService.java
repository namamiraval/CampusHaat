package com.campusloop.service;

import com.campusloop.dto.RegistrationRequest;
import com.campusloop.entity.Student;
import com.campusloop.repository.StudentRepository;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

import java.security.SecureRandom;
import java.time.LocalDateTime;

import com.campusloop.dto.OtpVerificationRequest;

import com.campusloop.dto.LoginRequest;
import com.campusloop.dto.LoginResponse;
import com.campusloop.service.JwtService;

@Service
public class StudentService {
    private final JwtService jwtService;

    private final EmailService emailService;
    private final SecureRandom secureRandom = new SecureRandom();

    private final StudentRepository studentRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${campushaat.allowed-email-domains}")
    private List<String> allowedDomains;

    public StudentService(
            StudentRepository studentRepository,
            PasswordEncoder passwordEncoder,
            EmailService emailService,
            JwtService jwtService) {

        this.studentRepository = studentRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
        this.jwtService = jwtService;
    }

    private String generateOtp() {
        int number = secureRandom.nextInt(1000000);
        return String.format("%06d", number);
    }

    public String registerStudent(RegistrationRequest request) {

        String email = request.email().trim().toLowerCase();

        // Validate university email domain
        boolean validDomain = allowedDomains.stream()
                .map(String::trim)
                .map(String::toLowerCase)
                .anyMatch(domain -> email.endsWith("@" + domain));

        if (!validDomain) {
            throw new IllegalArgumentException(
                    "Please use an approved university email address."
            );
        }

        // Check duplicate email
        if (studentRepository.existsByEmail(email)) {
            throw new IllegalArgumentException(
                    "This email address is already registered."
            );
        }

        // Create student
        Student student = new Student();

        student.setFullName(request.fullName().trim());
        student.setEmail(email);
        student.setPassword(passwordEncoder.encode(request.password()));
        student.setEmailVerified(false);

        // Generate OTP
        String otp = generateOtp();

        // Hash OTP before storing it
        student.setOtpHash(passwordEncoder.encode(otp));

        // Set OTP expiry to 5 minutes
        student.setOtpExpiry(LocalDateTime.now().plusMinutes(5));

        // Record OTP sending time
        student.setOtpLastSentAt(LocalDateTime.now());

        // Reset incorrect attempts
        student.setOtpAttempts(0);

        // Save student
        studentRepository.save(student);

        // Send OTP email
        emailService.sendOtpEmail(email, otp);

        return "Registration successful! Please verify your email.";
    }

    public String verifyOtp(OtpVerificationRequest request) {

    String email = request.email().trim().toLowerCase();

    // Find student using email
    Student student = studentRepository.findByEmail(email)
            .orElseThrow(() -> new IllegalArgumentException(
                    "No account found with this email address."
            ));

    // Check whether email is already verified
    if (student.isEmailVerified()) {
        throw new IllegalArgumentException(
                "This email address is already verified."
        );
    }

    // Check maximum incorrect attempts
    if (student.getOtpAttempts() >= 5) {
        throw new IllegalArgumentException(
                "Maximum OTP attempts exceeded. Please request a new OTP."
        );
    }

    // Check OTP expiry
    if (student.getOtpExpiry() == null ||
            LocalDateTime.now().isAfter(student.getOtpExpiry())) {

        throw new IllegalArgumentException(
                "OTP has expired. Please request a new one."
        );
    }

        // Verify OTP
        if (!passwordEncoder.matches(
                request.otp(), student.getOtpHash())) {

            int attempts = student.getOtpAttempts() + 1;
            student.setOtpAttempts(attempts);

            if (attempts >= 5) {
                student.setOtpHash(null);
                student.setOtpExpiry(null);
            }

            studentRepository.save(student);

            throw new IllegalArgumentException(
                    attempts >= 5
                            ? "Maximum attempts exceeded. Please request a new OTP."
                            : "Incorrect OTP. Attempts remaining: " + (5 - attempts)
            );
        }

        // Mark email as verified
        student.setEmailVerified(true);

        // Invalidate OTP after successful verification
        student.setOtpHash(null);
        student.setOtpExpiry(null);
        student.setOtpLastSentAt(null);
        student.setOtpAttempts(0);

        studentRepository.save(student);

        return "Email verified successfully! Welcome to CampusHaat.";
    }
        public String resendOtp(String emailAddress) {

        String email = emailAddress.trim().toLowerCase();

        Student student = studentRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException(
                        "No account found with this email address."
                ));

        if (student.isEmailVerified()) {
            throw new IllegalArgumentException(
                    "This email address is already verified."
            );
        }

        // 60-second resend cooldown
        if (student.getOtpLastSentAt() != null) {

            LocalDateTime nextAllowedTime =
                    student.getOtpLastSentAt().plusSeconds(60);

            if (LocalDateTime.now().isBefore(nextAllowedTime)) {

                long remainingSeconds =
                        java.time.Duration.between(
                                LocalDateTime.now(),
                                nextAllowedTime
                        ).getSeconds();

                throw new IllegalArgumentException(
                        "Please wait " + remainingSeconds
                        + " seconds before requesting another OTP."
                );
            }
        }

        // Generate a fresh OTP
        String otp = generateOtp();

        // Store its hash
        student.setOtpHash(passwordEncoder.encode(otp));

        // Set fresh expiry
        student.setOtpExpiry(LocalDateTime.now().plusMinutes(5));

        // Update sending timestamp
        student.setOtpLastSentAt(LocalDateTime.now());

        // Reset incorrect attempts
        student.setOtpAttempts(0);

        // Save updated details
        studentRepository.save(student);

        // Send new OTP
        emailService.sendOtpEmail(email, otp);

        return "A new OTP has been sent to your email address.";
    }

    public LoginResponse login(LoginRequest request) {

        String email = request.email().trim().toLowerCase();

        Student student = studentRepository.findByEmail(email)
                .orElseThrow(() ->
                        new IllegalArgumentException("Invalid email or password."));

        if (!passwordEncoder.matches(request.password(), student.getPassword())) {
            throw new IllegalArgumentException("Invalid email or password.");
        }

        if (!student.isEmailVerified()) {
            throw new IllegalArgumentException(
                    "Please verify your email before logging in.");
        }

        String token = jwtService.generateToken(email);

        return new LoginResponse(
                token,
                "Bearer",
                86400000
        );
    }
}