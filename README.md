# API RESTful de Productos - Práctica Semana 10

Backend para administrar productos mediante una API REST. Está desarrollado con Node.js y Express, organizado en rutas y controladores, y utiliza MySQL mediante `mysql2/promise` y un pool de conexiones.

## Tecnologías y características

- Node.js, Express, `cors` y `dotenv`.
- MySQL con `mysql2/promise`, consultas asíncronas y pool de conexiones.
- Operaciones CRUD para productos: listar, consultar, crear, actualizar y eliminar.
- Consultas preparadas para los valores enviados a MySQL.
- Validación de datos y respuestas JSON con códigos HTTP apropiados.
- Manejo de errores sin exponer detalles internos en las respuestas.

## Estructura del proyecto

```text
├── src/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   └── productosController.js
│   ├── routes/
│   │   └── productosRoutes.js
│   └── app.js
├── test/
│   └── productos.test.js
├── .env.example
├── .gitignore
├── database.sql
├── package.json
└── README.md
```

`.env` contiene la configuración local de la conexión y está excluido del repositorio mediante `.gitignore`.

## Base de datos

La aplicación utiliza la base de datos `db_lab10` y la tabla `productos`. El esquema y los tres registros iniciales están definidos en `database.sql`.

| Columna | Tipo | Descripción |
| :--- | :--- | :--- |
| `id` | `INT`, autoincremental | Identificador principal |
| `nombre` | `VARCHAR(100)` | Nombre obligatorio |
| `descripcion` | `VARCHAR(255)` | Descripción opcional |
| `precio` | `DECIMAL(10, 2)` | Precio obligatorio |
| `stock` | `INT` | Unidades disponibles; por defecto `0` |
| `creado_en` | `TIMESTAMP` | Fecha y hora de creación |

## Ejecución con XAMPP

Se requiere Node.js 20 o superior y XAMPP con MySQL habilitado.

1. Inicia los servicios **Apache** y **MySQL** desde el panel de XAMPP. Apache se utiliza para acceder a phpMyAdmin; la API Node.js no se ejecuta en Apache.
2. En phpMyAdmin (`http://localhost/phpmyadmin`), importa `database.sql`. El script crea `db_lab10`, la tabla `productos` y los registros iniciales.
3. En la raíz del proyecto, crea `.env` con la configuración de tu MySQL local. Para una instalación XAMPP predeterminada:

   ```env
   PORT=3000
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=db_lab10
   DB_PORT=3306
   ```

   Si configuraste una contraseña para MySQL o usas otro puerto, coloca esos valores en `.env`.

4. En una terminal abierta en la carpeta del proyecto, instala las dependencias e inicia el servidor:

   ```bash
   npm install
   npm run dev
   ```

   Para iniciar sin reinicio automático al modificar archivos:

   ```bash
   npm start
   ```

El servidor queda disponible en `http://localhost:3000` (o en el puerto establecido mediante `PORT`). La raíz `/` no es una página web; las solicitudes de la API comienzan en `/api/productos`.

## Endpoints

| Método | Endpoint | Descripción | Respuestas principales |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/productos` | Lista todos los productos. | `200`, `500` |
| `GET` | `/api/productos/:id` | Obtiene un producto por identificador. | `200`, `400`, `404`, `500` |
| `POST` | `/api/productos` | Crea un producto. | `201`, `400`, `500` |
| `PUT` | `/api/productos/:id` | Actualiza los datos de un producto. | `200`, `400`, `404`, `500` |
| `DELETE` | `/api/productos/:id` | Elimina un producto. | `200`, `400`, `404`, `500` |

Las respuestas se envían en JSON. Las solicitudes `POST` y `PUT` reciben un cuerpo JSON con este formato:

```json
{
  "nombre": "Monitor UltraWide 29",
  "descripcion": "Panel IPS 75Hz",
  "precio": 899.9,
  "stock": 8
}
```

`nombre`, `precio` y `stock` son obligatorios. El nombre admite hasta 100 caracteres, la descripción hasta 255; el precio debe ser un número mayor o igual a cero y el stock un entero mayor o igual a cero. Los errores tienen el formato `{ "error": "mensaje" }`.

## Pruebas automatizadas

El proyecto incluye pruebas de las rutas, validaciones y respuestas HTTP. Se ejecutan con:

```bash
npm test
```

Estas pruebas simulan las consultas a la base de datos; para usar la API con datos reales se requiere que MySQL de XAMPP esté iniciado y que exista la base de datos `db_lab10`.
