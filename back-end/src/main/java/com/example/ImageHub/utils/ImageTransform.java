package com.example.ImageHub.utils;

import com.example.ImageHub.dto.imgDTO.TransformRequestDto;

import java.io.IOException;

//
public interface ImageTransform {

    /*
    * Aplica la transformacion a la  imagen
    * imagePath: ruta de la imagen a transformar
    * request: datos de la transformación
    * IOException: si hay error en operaciones de archivo
     */
    void transform(String imagePath, TransformRequestDto request) throws IOException;

    /*
    * Valida si la estrategia puede ejecutarse
    * request: datos de la transformacion
    * y retorna true si los tados son validos para la estrategia
     */
    boolean canHandle(TransformRequestDto request);

}
