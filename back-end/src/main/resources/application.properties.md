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


sendgrid.api.key=${SENDGRID_API_KEY}
user.name.email=${USER_NAME_MAIL}


springdoc.swagger-ui.path=/swagger-ui.html
springdoc.api-docs.path=/v3/api-docs
springdoc.swagger-ui.operationsSorter=method


spring.servlet.multipart.max-file-size=5MB
spring.servlet.multipart.max-request-size=5MB
image.supported-formats=jpg,jpeg,png

# Local Storage configs
image.input.path=D:\\Tech\\images\\input
image.output.path=D:\\Tech\\images\\output

# Format SQL nicely
spring.jpa.properties.hibernate.format_sql=false

