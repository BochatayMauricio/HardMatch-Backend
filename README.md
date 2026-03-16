# HardMatch Backend

Backend Gateway desarrollado en Node.js con Express y TypeScript. Actúa como gateway consumiendo dos microservicios además de sus funcionalidades básicas (CRUD, autenticación, etc.).

## Autores

- Aloi
- Bochatay
- Mariani

---

## Instalación

```bash
# Clonar el repositorio
git clone <url-del-repo>

# Instalar dependencias
npm install

# Crear archivo de variables de entorno
cp .env.example .env

# Editar .env con tus credenciales
```

---

## Configuración

### Variables de Entorno

En el archivo `.env.example` (es el que se sube al repo) están las variables que se declararon hasta ahora.

**Al momento de bajarse el repo:**

1. Crear archivo `.env` en la raíz del proyecto
2. Copiar el contenido de `.env.example`
3. Cambiar las credenciales si hace falta (BD, JWT, etc.)

### Archivo config.ts

Dentro del archivo `src/config/config.ts` se encontrarán:

- Variables de entorno ya definidas y validadas con Zod
- Endpoints de los servicios que consumirá el backend (microservicios)

---

## Comandos Disponibles

| Comando                           | Descripción                                                        |
| --------------------------------- | ------------------------------------------------------------------ |
| `npm run dev`                     | Inicia el servidor en modo desarrollo con hot-reload (tsx watch)   |
| `npm run build`                   | Compila el proyecto TypeScript a JavaScript (dist/)                |
| `npm run start`                   | Inicia el servidor en producción (requiere build previo)           |
| `npm run migrate`                 | Ejecuta todas las migraciones SQL pendientes                       |
| `npm run migrate:create <nombre>` | Crea un nuevo archivo de migración SQL                             |
| `npm run migrate:status`          | Muestra el estado de todas las migraciones (ejecutadas/pendientes) |
| `npm run db:sync`                 | Sincroniza los modelos Sequelize con la BD (solo desarrollo)       |

### Ejemplos de uso

```bash
# Desarrollo
npm run dev

# Ver estado de migraciones
npm run migrate:status

# Crear nueva migración
npm run migrate:create add_phone_to_users

# Ejecutar migraciones pendientes
npm run migrate

# Build para producción
npm run build
npm run start
```

---

## Autenticación

El sistema implementa autenticación JWT con roles (`ADMIN` y `CLIENT`).

### Credenciales de Prueba

| Rol    | Email                 | Username | Password     |
| ------ | --------------------- | -------- | ------------ |
| ADMIN  | admin@hardmatch.com   | admin    | `admin123`   |
| CLIENT | cliente@hardmatch.com | cliente  | `cliente123` |

> **⚠️ Estas credenciales son solo para desarrollo/testing**

### Endpoints de Auth

| Método | Endpoint                    | Descripción                | Acceso  |
| ------ | --------------------------- | -------------------------- | ------- |
| POST   | `/api/auth/register`        | Registrar nuevo usuario    | Público |
| POST   | `/api/auth/login`           | Iniciar sesión             | Público |
| GET    | `/api/auth/me`              | Obtener perfil del usuario | Auth    |
| POST   | `/api/auth/change-password` | Cambiar contraseña         | Auth    |

### Ejemplo de Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@hardmatch.com", "password": "admin123"}'
```

## Migraciones

Se llevará un registro de todas las migraciones o cambios realizados en la base de datos durante el desarrollo.

### Reglas importantes

> **⚠️ NO MODIFICAR DIRECTAMENTE LA BASE DE DATOS**

Cuando debamos hacer un cambio sobre alguna tabla de la BD o crear una tabla nueva:

1. **Crear la migración:**

   ```bash
   npm run migrate:create nombre_migracion
   ```

   Esto generará un archivo SQL dentro de la carpeta `/migrations` con un timestamp.

2. **Editar el archivo generado:**
   Abrir el archivo SQL creado e insertar el código SQL necesario.

3. **Ejecutar las migraciones:**
   ```bash
   npm run migrate
   ```
   Se ejecutarán únicamente las migraciones pendientes.

### Control de migraciones

Para llevar el control de qué migraciones ya fueron ejecutadas, se agregó una tabla en la BD llamada `_migrations`. Esta tabla registra automáticamente cada migración ejecutada con su timestamp.

### Ver estado actual

```bash
npm run migrate:status
```

Esto mostrará algo como:

```
📊 Migration Status
============================================================
  Status      Migration File
  --------------------------------------------------------
  ✓ Executed  001_create_tables.sql
  ○ Pending   20260220_add_phone_to_users.sql
============================================================
```

> **📌 PD: SI NO SE ACUERDAN LOS COMANDOS MIREN EL PACKAGE.JSON**

---

## Estructura del Proyecto

```
├── migrations/              # Archivos SQL de migraciones
├── src/
│   ├── api/
│   │   ├── controllers/     # Controladores de las rutas
│   │   ├── middlewares/     # Middlewares (auth, validación, etc.)
│   │   └── routes/          # Definición de rutas
│   ├── config/
│   │   ├── config.ts        # Configuración y variables de entorno
│   │   └── database.ts      # Conexión a la base de datos
│   ├── core/
│   │   ├── interfaces/      # Interfaces TypeScript
│   │   ├── models/          # Modelos Sequelize
│   │   └── services/        # Lógica de negocio y servicios
│   ├── scripts/             # Scripts de utilidad (migraciones)
│   ├── app.ts               # Configuración de Express
│   └── index.ts             # Entry point
├── .env.example             # Ejemplo de variables de entorno
├── package.json
└── tsconfig.json
```

---

## Tecnologías

- **Runtime:** Node.js
- **Framework:** Express
- **Lenguaje:** TypeScript
- **ORM:** Sequelize
- **Base de Datos:** MySQL
- **Validación:** Zod
- **Autenticación:** JWT (jsonwebtoken) + bcrypt
- **HTTP Client:** Axios (para consumir microservicios)


## 🚀 Documentación: Motor de Búsqueda y Filtros de Productos
# 📌 Endpoint Principal
`GET /api/products`

Este endpoint funciona con un constructor de consultas dinámico.
El Controlador atrapa los parámetros que vienen en la URL (req.query), los formatea asegurando que sean números o strings, y se los pasa al Servicio. 
El Servicio evalúa qué parámetros llegaron y usa los Operadores de Sequelize (Op) para armar la consulta SQL a medida antes de pegarle a la base de datos.

# 🛠️ Parámetros Aceptados (Query Params)
Todos los parámetros son opcionales y combinables entre sí:

- search (string): Busca coincidencias parciales en el nombre del producto (usa LIKE).

- minPrice (number): Filtra productos con precio mayor o igual a este valor.

- maxPrice (number): Filtra productos con precio menor o igual a este valor.

- brandId (number): Trae solo productos de una marca específica (coincidencia exacta).

- categoryId (number): Trae solo productos de una categoría específica (coincidencia exacta).

# 🔥 Casos de Uso y Posibilidades (Frontend e IA)

1. Navegación libre (El Home)
Si el Frontend no envía nada, el endpoint devuelve todo el catálogo activo.

`GET /api/products`

2. Barra de búsqueda superior
Cuando el usuario tipea algo en el buscador principal.

`GET /api/products?search=Ryzen`

3. Panel de Filtros Laterales (Estilo Mercado Libre)
Cuando el usuario entra a la sección "Monitores" y mueve la barrita de precio máximo.

`GET /api/products?categoryId=3&maxPrice=450000`

4. Interacción con el Chatbot de IA
Este es el caso de uso más importante para nuestro proyecto. Cuando el microservicio de IA detecte la intención del usuario (ej: "Busco una notebook marca Asus por menos de 1 millón"), el bot no necesita lógica compleja. Simplemente debe armar esta URL y consultar nuestro backend:

`GET /api/products?categoryId=1&brandId=4&maxPrice=1000000`

5. Búsquedas hiper-específicas (Filtro Total)

`GET /api/products?categoryId=1&brandId=2&search=Gamer&minPrice=800000&maxPrice=1500000`