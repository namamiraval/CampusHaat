package com.campusloop.service;

import com.campusloop.entity.Student;
import com.campusloop.repository.StudentRepository;

import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import org.springframework.stereotype.Service;

@Service
public class StudentDetailsService implements UserDetailsService {

    private final StudentRepository studentRepository;

    public StudentDetailsService(StudentRepository studentRepository) {
        this.studentRepository = studentRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String email)
            throws UsernameNotFoundException {

        Student student = studentRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException(
                        "Student not found with email: " + email
                ));

        return User.builder()
                .username(student.getEmail())
                .password(student.getPassword())
                .authorities("ROLE_STUDENT")
                .build();
    }
}