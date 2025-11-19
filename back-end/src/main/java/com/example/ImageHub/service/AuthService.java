package com.example.ImageHub.service;


import com.example.ImageHub.dto.authDTO.AuthResponse;
import com.example.ImageHub.dto.authDTO.LoginRequest;
import com.example.ImageHub.dto.userDTO.RegisterRequest;
import com.example.ImageHub.model.User;
import com.example.ImageHub.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class AuthService {

    @Value("${spring.mail.username}")
    private String mail;

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final JavaMailSender mailSender;
    private final SimpleMailMessage templateMessage;

    // Mensajes de error centralizados
    private static final String EMAIL_ALREADY_REGISTERED = "El email ya esta registrado";
    private static final String USER_NOT_FOUND = "Usuario no encontrado";

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService,
                       AuthenticationManager authenticationManager, JavaMailSender mailSender,
                       SimpleMailMessage templateMessage) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
        this.mailSender = mailSender;
        this.templateMessage = templateMessage;
    }

    // Registrar un nuevo usuario en el sistema
    public AuthResponse register(RegisterRequest request) {
        // Primero verificamos que el email no exista
        validateEmailUniqueness(request.getEmail());

        // Creamos el usuario con los datos del request
        User user = createUserFromRequest(request);

        // Lo guardamos en la base de datos
        userRepository.save(user);

        // Enviamos email de bienvenida
        sendWelcomeEmail(user);

        // Generamos y retornamos el token JWT
        String jwtToken = jwtService.generateToken(user);

        return buildAuthResponse(user, jwtToken, "Usuario registrado exitosamente");
    }

    // Autenticar usuario e iniciar sesion
    public AuthResponse login(LoginRequest request) {
        // Verificamos que las credenciales sean correctas
        // Si no son validas, AuthenticationManager lanza BadCredentialsException automaticamente
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        // Buscamos el usuario en la base de datos
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UsernameNotFoundException(USER_NOT_FOUND));

        // Generamos y retornamos el token JWT
        String jwtToken = jwtService.generateToken(user);

        return buildAuthResponse(user, jwtToken, "Login exitoso");
    }

    // Valida que el email no este registrado en el sistema
    private void validateEmailUniqueness(String email) {
        if (userRepository.findByEmail(email).isPresent()) {
            throw new DataIntegrityViolationException(EMAIL_ALREADY_REGISTERED);
        }
    }

    // Crea una instancia de User a partir del request de registro
    // Encripta la contrasena y establece valores por defecto
    private User createUserFromRequest(RegisterRequest request) {
        User user = new User();
        user.setId(request.getId());
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setPhoneNumber(request.getPhoneNumber());
        user.setDirection(request.getDirection());
        user.setRole(request.getRole());
        user.setRegistrationDate(LocalDateTime.now());
        user.setActive(true);
        return user;
    }

    // Envia un email de bienvenida al usuario registrado
    // Si falla, solo registra el error sin interrumpir el proceso de registro
    private void sendWelcomeEmail(User user) {
        SimpleMailMessage msg = new SimpleMailMessage(this.templateMessage);
        msg.setTo(user.getEmail());
        msg.setSubject("Bienvenido al sistema ImageHub!");
        msg.setText(buildWelcomeEmailContent(user));

        try {
            this.mailSender.send(msg);
        } catch (MailException ex) {
            System.err.println("Error enviando correo: " + ex.getMessage());
        }
    }

    // Construye el contenido del email de bienvenida
    private String buildWelcomeEmailContent(User user) {
        return "Hola " + user.getFirstName() + " " + user.getLastName() + ",\n\n" +
                "Tu registro en ImageHub se ha realizado con exito.\n\n" +
                "Detalles de tu cuenta:\n" +
                "• Nombre: " + user.getFirstName() + " " + user.getLastName() + "\n" +
                "• Email: " + user.getEmail() + "\n\n" +
                "Ya puedes ingresar a la plataforma con tus credenciales.\n\n" +
                "Si tienes preguntas o necesitas asistencia, no dudes en contactarnos:\n" +
                " WhatsApp: https://wa.me/573103212753\n" +
                " Email: bmtechnologicalsolutions@gmail.com\n\n" +
                "Gracias por confiar en ImageHub!\n\n" +
                "Atentamente,\n" +
                "Equipo ImageHub";
    }

    // Construye la respuesta de autenticacion con el token y datos del usuario
    private AuthResponse buildAuthResponse(User user, String token, String message) {
        return AuthResponse.builder()
                .token(token)
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .role(user.getRole())
                .message(message)
                .build();
    }
}