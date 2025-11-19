package com.example.ImageHub.controller;

import com.example.ImageHub.dto.authDTO.AuthResponse;
import com.example.ImageHub.dto.authDTO.LoginRequest;
import com.example.ImageHub.dto.userDTO.RegisterRequest;
import com.example.ImageHub.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/api/auth")

public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    //  Las excepciones se lanzan naturalmente y el handler las captura.

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {
        // Las excepciones serán capturadas automáticamente por GlobalExceptionHandler
        AuthResponse response = authService.register(request);
        return ResponseEntity.ok(response);


    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        // BadCredentialsException será capturada por GlobalExceptionHandler
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);


    }


}