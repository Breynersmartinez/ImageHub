

# Qué hacer cuando Vite muestra “Port XXXX is in use”

## 1. Ver qué proceso está usando el puerto

En PowerShell o CMD ejecutar:

```
netstat -ano | findstr :5173
```

Reemplazar 5173 por el puerto que esté causando el problema.
El resultado mostrará una línea similar a:

```
TCP 127.0.0.1:5173  LISTENING  9368
```

El número final (en este caso 9368) es el PID del proceso que está ocupando el puerto.

---

## 2. Finalizar el proceso que usa el puerto

Usar el PID obtenido:

```
taskkill /PID 9368 /F
```

Esto libera el puerto.

---

## 3. Cerrar todos los procesos de Node (opcional)

Si hay muchos puertos ocupados por procesos de desarrollo:

```
taskkill /IM node.exe /F
```

Esto detiene todos los servidores Node en ejecución.

---

## 4. Evitar que Vite cambie automáticamente de puerto

Si se quiere que Vite falle en lugar de cambiar de puerto:

```
npm run dev -- --strictPort
```

Así, si el puerto está ocupado, Vite no iniciará en uno distinto.

---

## 5. Consultar qué proceso corresponde a un PID

En caso de querer identificar el programa asociado:

```
tasklist | findstr 9368
```

---
