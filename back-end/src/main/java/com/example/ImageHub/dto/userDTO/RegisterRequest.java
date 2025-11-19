package com.example.ImageHub.dto.userDTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import com.example.ImageHub.model.enums.Role;
import java.util.UUID;


// DTO para registro
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {
    private UUID id;
    //COMPOSICION
    private String firstName;
    private String lastName;
    private String email;
    private String password;
    private String phoneNumber;
    private String direction;
    private Role role; // ADMIN o USER
}
