package com.example.ImageHub.service;


import com.example.ImageHub.model.User;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Value("${user.name.email}")
    private String mail;

    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;

    }

    // Envia un email de bienvenida al usuario registrado
    public void sendWelcomeEmail(User user) {
        SimpleMailMessage msg = new SimpleMailMessage();
        msg.setTo(user.getEmail());
        msg.setSubject("Bienvenido al sistema ImageHub!");
        msg.setText(buildWelcomeEmailContent(user));
        // Esta linea es importante para el cuerpo de solicitud para sendgrid
        msg.setFrom(mail); //  Esta línea es importante para evitar el error 550

        try {
            this.mailSender.send(msg);
        } catch (MailException ex) {
            System.err.println("Error enviando correo: " + ex.getMessage());
        }
    }

    // Construye el contenido del email de bienvenida
    public String buildWelcomeEmailContent(User user) {
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

}
