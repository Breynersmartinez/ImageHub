package com.example.ImageHub.model;


import com.example.ImageHub.audit.Auditable;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import javax.management.relation.Role;
import java.util.Collection;
import java.util.List;
import java.util.UUID;


@Entity
@Inheritance(strategy = InheritanceType.JOINED)
@Table (name = "user")
public class User extends Auditable<User> implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;


    @Column(name = "NOMBRE")
    @NotBlank(message = " El campo nombre no puede quedar en blanco ")
    private String firstName;


    @Column(name = "APELLIDO")
    @NotBlank(message = "El campo apellido no puede quedar en blanco")
    private String lastName;


    @Column(name = " CORREO")
    @NotBlank(message = "El campo correo no puede quedar en blanco")
    private String email;

    @Column(name = "CONTRASEÑA")
    @NotBlank(message = "El campo contraseña no puede quedar en blanco")
    private String password;



    @Enumerated(EnumType.STRING)
    @Column(name = "ROL", nullable = false)
    private Role role;

    public User(UUID id, String firstName, String lastName, String email, String password, Role role) {
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.password = password;
        this.role = role;
    }

    //Constructor vacio
    public User()
    {
    }


    //Metodo de userDetails para springSecurity
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities(){
        return List.of(new SimpleGrantedAuthority("ROLE_"+ role.name()));
    }

    //gettes and setters


    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String mail) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }
}
