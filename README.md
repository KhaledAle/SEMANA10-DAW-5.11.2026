# API RESTful de Productos - Laboratorio Semana 10

API backend construida con Node.js, Express y MySQL (`mysql2/promise`). Organiza el acceso a datos con controladores y rutas, usa un pool de conexiones y consultas preparadas.

## Requisitos

- Node.js LTS (20 o superior) y npm.
- MySQL activo, por ejemplo mediante XAMPP o Laragon.
- phpMyAdmin u otro cliente MySQL para crear la base de datos.
- Postman, Insomnia o Thunder Client para las pruebas HTTP.

## Puesta en marcha

1. Abre una terminal en la carpeta de este proyecto.
2. Instala las dependencias:

   ```bash
   npm install
   ```

3. (Opcional) Ejecuta las pruebas automatizadas:

   ```bash
   npm test
   ```

4. Crea la base de datos y la tabla. En phpMyAdmin, selecciona **Importar**, elige el archivo `database.sql` de este proyecto y ejecuta la importación. También puedes abrir `database.sql`, copiar su contenido y ejecutarlo en la pestaña **SQL**. Este paso lo debes realizar tú con tu instalación de MySQL.
5. Crea un archivo `.env` en la raíz copiando `.env.example`. Ajusta `DB_HOST`, `DB_USER`, `DB_PASSWORD` y `DB_PORT` según tu instalación; no compartas ni subas este archivo.
6. Inicia el servidor:

   ```bash
   npm run dev
   ```

   Alternativamente, para iniciar sin reinicio automático:

   ```bash
   npm start
   ```

El servidor escucha en `http://localhost:3000` por defecto. Si cambias `PORT` en `.env`, utiliza ese puerto en las solicitudes.

## Endpoints

| Método | Endpoint | Propósito | Respuestas |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/productos` | Lista todos los productos. | `200`, `500` |
| `GET` | `/api/productos/:id` | Obtiene un producto por ID. | `200`, `400`, `404`, `500` |
| `POST` | `/api/productos` | Crea un producto. Requiere `nombre`, `precio` y `stock`; `descripcion` es opcional. | `201`, `400`, `500` |
| `PUT` | `/api/productos/:id` | Reemplaza los datos de un producto. Requiere `nombre`, `precio` y `stock`. | `200`, `400`, `404`, `500` |
| `DELETE` | `/api/productos/:id` | Elimina un producto. | `200`, `400`, `404`, `500` |

Ejemplo de cuerpo JSON para `POST` y `PUT`:

```json
{
  "nombre": "Monitor UltraWide 29",
  "descripcion": "Panel IPS 75Hz",
  "precio": 899.9,
  "stock": 8
}
```

`nombre` debe ser texto de hasta 100 caracteres, `precio` un número mayor o igual a cero, `stock` un entero mayor o igual a cero y `descripcion` texto de hasta 255 caracteres. Los errores se devuelven como JSON con la propiedad `error`; no se envían detalles internos al cliente.

## Pruebas que debes realizar

Con el servidor iniciado y MySQL conectado, usa Postman, Insomnia o Thunder Client para probar:

1. `GET http://localhost:3000/api/productos` — debe devolver `200` y un arreglo JSON.
2. `POST http://localhost:3000/api/productos` — envía el ejemplo de JSON anterior; debe devolver `201`.
3. `GET http://localhost:3000/api/productos/1` — debe devolver `200` si existe ese producto.
4. `PUT http://localhost:3000/api/productos/1` — envía un cuerpo JSON completo; debe devolver `200`.
5. `DELETE http://localhost:3000/api/productos/3` — debe devolver `200` si existe ese producto.
6. `GET http://localhost:3000/api/productos/9999` — debe devolver `404` si ese ID no existe.
7. `POST http://localhost:3000/api/productos` con `{}` — debe devolver `400`.
8. Para verificar `500`, detén MySQL temporalmente y repite el GET de la lista; luego vuelve a iniciar MySQL.

Para `POST` y `PUT`, selecciona el cuerpo **raw / JSON** para que el cliente envíe `Content-Type: application/json`. Guarda las capturas solicitadas por la guía: árbol y archivos de código, respuestas exitosas y errores.

## Pasos finales a tu cargo

- [ ] Ejecutar la importación de `database.sql` en phpMyAdmin y confirmar que existan `db_lab10` y la tabla `productos`.
- [ ] Crear `.env` desde `.env.example` y poner las credenciales locales correctas.
- [ ] Ejecutar `npm install` y `npm run dev`.
- [ ] Completar las solicitudes y capturas de evidencia en tu cliente REST.
- [ ] Si debes entregar el repositorio en GitHub: inicializar Git, revisar que `.env` no se incluya, y subir el proyecto. `.gitignore` ya excluye `.env` y `node_modules/`.
