package com.example.ImageHub.service;


import com.example.ImageHub.model.User;
import com.sendgrid.Method;
import com.sendgrid.Request;
import com.sendgrid.Response;
import com.sendgrid.SendGrid;
import com.sendgrid.helpers.mail.Mail;
import com.sendgrid.helpers.mail.objects.Content;
import com.sendgrid.helpers.mail.objects.Email;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;

@Service
public class EmailService {

    @Value("${sendgrid.api.key}")
    private String sendgridApiKey;

    @Value("${user.name.email}")
    private String mail;



    // Envia un email de bienvenida al usuario registrado
    public void sendWelcomeEmail(User user) {
        Email from = new Email(mail);
        String subject = "Bienvenido al sistema ImageHub!";
        Email to = new Email(user.getEmail());
        Content content = new Content("text/plain", buildWelcomeEmailContent(user));
        Mail mail = new Mail(from, subject, to, content);

        SendGrid sg = new SendGrid(sendgridApiKey);
        Request request = new Request();
        try {
            request.setMethod(Method.POST);
            request.setEndpoint("mail/send");
            request.setBody(mail.build());
            Response response = sg.api(request);
            System.out.println("Email enviado con código: " + response.getStatusCode());
        } catch (IOException ex) {
            System.err.println("Error enviando correo: " + ex.getMessage());
        }
    }

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