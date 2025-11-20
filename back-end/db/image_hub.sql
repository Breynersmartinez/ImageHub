SET TIME ZONE 'UTC';

CREATE TABLE IF NOT EXISTS usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    NOMBRE VARCHAR(50) NOT NULL,
    APELLIDO VARCHAR(50) NOT NULL,
    CONTRASEÑA VARCHAR(255) NOT NULL,
    CORREO VARCHAR(100) UNIQUE NOT NULL,
    NUMERO_TELEFONO VARCHAR(15),
    DIRECCION VARCHAR(200),
    FECHA_REGISTRO TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ROL VARCHAR(50) NOT NULL DEFAULT 'USER',
    ACTIVO BOOLEAN DEFAULT TRUE,
    CREATED_BY VARCHAR(100),
    CREATED_DATE TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    LAST_MODIFIED_BY VARCHAR(100),
    LAST_MODIFIED_DATE TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE usuarios IS 'Tabla de usuarios de la aplicación ImageHub';
COMMENT ON COLUMN usuarios.id IS 'Identificador único UUID del usuario';
COMMENT ON COLUMN usuarios.NOMBRE IS 'Nombre del usuario';
COMMENT ON COLUMN usuarios.APELLIDO IS 'Apellido del usuario';
COMMENT ON COLUMN usuarios.CONTRASEÑA IS 'Contraseña encriptada con BCrypt (255 caracteres)';
COMMENT ON COLUMN usuarios.CORREO IS 'Email del usuario, único en el sistema';
COMMENT ON COLUMN usuarios.NUMERO_TELEFONO IS 'Número telefónico del usuario';
COMMENT ON COLUMN usuarios.DIRECCION IS 'Dirección residencial del usuario';
COMMENT ON COLUMN usuarios.FECHA_REGISTRO IS 'Fecha y hora del registro del usuario';
COMMENT ON COLUMN usuarios.ROL IS 'Rol del usuario: USER, ADMIN, EDITOR';
COMMENT ON COLUMN usuarios.ACTIVO IS 'Estado del usuario: true (activo), false (inactivo)';

CREATE INDEX idx_usuarios_correo ON usuarios(CORREO);
CREATE INDEX idx_usuarios_rol ON usuarios(ROL);
CREATE INDEX idx_usuarios_activo ON usuarios(ACTIVO);

--DROP TABLE usuarios;
--DROP TABLE image_data;
CREATE TABLE IF NOT EXISTS image_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    NOMBRE_USUARIO VARCHAR(100) NOT NULL,
    NOMBRE_IMAGEN VARCHAR(255) NOT NULL,
    RUTA_INGRESADA VARCHAR(500) NOT NULL,
    RUTA_DE_TRANSFORMACION VARCHAR(500),
    DESCRIPCION VARCHAR(500),
    FECHA_REGISTRO TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FECHA_ACTUALIZACION TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CREATED_BY VARCHAR(100),
    CREATED_DATE TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    LAST_MODIFIED_BY VARCHAR(100),
    LAST_MODIFIED_DATE TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_image_user FOREIGN KEY (NOMBRE_USUARIO) 
        REFERENCES usuarios(CORREO) ON DELETE CASCADE
);

DELETE FROM image_data
WHERE id='8696f98f-7dec-45ca-9fc5-905f4a2634cf';


select*from image_data;

COMMENT ON TABLE image_data IS 'Tabla de metadata de imágenes subidas por usuarios';
COMMENT ON COLUMN image_data.id IS 'Identificador único UUID de la imagen';
COMMENT ON COLUMN image_data.USER_NAME IS 'Email del usuario propietario de la imagen';
COMMENT ON COLUMN image_data.NOMBRE_IMAGEN IS 'Nombre original del archivo de imagen';
COMMENT ON COLUMN image_data.RUTA_INGRESADA IS 'Ruta de la imagen original en el servidor';
COMMENT ON COLUMN image_data.RUTA_DE_TRANSFORMACION IS 'Ruta de la imagen transformada (si existe)';
COMMENT ON COLUMN image_data.DESCRIPCION IS 'Descripción opcional de la imagen';
COMMENT ON COLUMN image_data.FECHA_REGISTRO IS 'Fecha y hora cuando se subió la imagen';
COMMENT ON COLUMN image_data.FECHA_ACTUALIZACION IS 'Fecha y hora de última actualización de metadata';

CREATE INDEX idx_image_user_name ON image_data(USER_NAME);
CREATE INDEX idx_image_fecha_registro ON image_data(FECHA_REGISTRO);
CREATE INDEX idx_image_transform_null ON image_data(RUTA_DE_TRANSFORMACION) WHERE RUTA_DE_TRANSFORMACION IS NULL;


CREATE TABLE IF NOT EXISTS audit_log (
    id SERIAL PRIMARY KEY,
    tabla_afectada VARCHAR(100) NOT NULL,
    id_registro UUID,
    tipo_operacion VARCHAR(20) NOT NULL,
    usuario VARCHAR(100),
    valores_anteriores TEXT,
    valores_nuevos TEXT,
    fecha_operacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_origen VARCHAR(50)
);

COMMENT ON TABLE audit_log IS 'Registro de auditoría de cambios en tablas principales';
COMMENT ON COLUMN audit_log.tabla_afectada IS 'Nombre de la tabla modificada';
COMMENT ON COLUMN audit_log.tipo_operacion IS 'Tipo: INSERT, UPDATE, DELETE';

CREATE INDEX idx_audit_usuario ON audit_log(usuario);
CREATE INDEX idx_audit_fecha ON audit_log(fecha_operacion);

