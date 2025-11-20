package com.example.ImageHub.repository;

import com.example.ImageHub.model.User;


import com.example.ImageHub.model.enums.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmail(String email);
    Optional<User> findByLastName(String lastName);
    List<User> findByActive(Boolean active);
    List<User> findByRole(Role role);
}
