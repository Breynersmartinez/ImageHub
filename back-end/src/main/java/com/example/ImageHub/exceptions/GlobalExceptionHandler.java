package com.example.ImageHub.exceptions;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(UsernameNotFoundException.class)
    public ResponseEntity<String> handleUserNotFound(UsernameNotFoundException ex){
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(" Usuario no encontrado: " + ex.getMessage());
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<String> handleBadCredentials(BadCredentialsException ex){
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(" Credenciales invalidas: " + ex.getMessage());
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<String> handleGeneric(Exception ex){
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(" Error interno: " + ex.getMessage());
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<String> handleDataIntegrityViolationException(Exception ex){
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(" El usuario ya existe: " + ex.getMessage());
    }




}
