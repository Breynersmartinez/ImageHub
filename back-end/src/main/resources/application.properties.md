spring.application.name=ImageHub
spring.datasource.url=${URL_DB}
spring.datasource.username=${USER_NAME}
spring.datasource.password=${PASSWORD_DB}
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect

spring.datasource.driver-class-name=org.postgresql.Driver
spring.jpa.show-sql=true
spring.jpa.hibernate.naming.physical-strategy=org.hibernate.boot.model.naming.PhysicalNamingStrategyStandardImpl


jwt.secret.key=${TOKEN_JWT}
jwt.expiration.time=86400000

server.port=8080

spring.mail.host=smtp.gmail.com
spring.mail.port=465
spring.mail.username=${USER_NAME_MAIL}
spring.mail.password=${APP_PASSWORD}
spring.mail.properties.mail.smtp.ssl.enable=true
spring.mail.properties.mail.smtp.auth=true

spring.mail.host=smtp.sendgrid.net
spring.mail.port=587
spring.mail.username=BM Technological Solutions
spring.mail.password=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
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true




springdoc.swagger-ui.path=/swagger-ui.html
springdoc.api-docs.path=/v3/api-docs
springdoc.swagger-ui.operationsSorter=method