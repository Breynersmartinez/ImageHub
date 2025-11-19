package com.example.ImageHub.dto.userDTO;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import com.example.ImageHub.model.enums.Role;

import java.time.LocalDateTime;
import java.util.UUID;

// DTO para respuesta de usuario (sin contraseña)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    private Integer idCard;
    //COMPOSICION
    private String firstName;
    private String lastName;
    private String email;
    private String phoneNumber;
    private String direction;
    private Role role;
    private LocalDateTime registrationDate;
    private Boolean active;
}
