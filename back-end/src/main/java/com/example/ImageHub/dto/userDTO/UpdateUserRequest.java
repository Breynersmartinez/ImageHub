package com.example.ImageHub.dto.userDTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import com.example.ImageHub.model.enums.Role;
import java.util.UUID;

// DTO para actualizar usuario
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateUserRequest {
    private UUID id;
    //COMPOSICION
    private String firstName;
    private String lastName;
    private String email;
    private String password; // Opcional, solo si se quiere cambiar
    private String phoneNumber;
    private String direction;
    private Role role;
    private Boolean active;
}
