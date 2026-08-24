# PlayConnect - Monorepo (Sprint 0)

PlayConnect es una plataforma móvil para conectar deportistas amateurs (fútbol, pádel y deportes futuros), organizar partidos, formar equipos, reservar canchas y calificar jugadores.

Este repositorio contiene la **Fundación Técnica (Sprint 0)** con la base de datos espacial PostgreSQL + PostGIS, el backend Express + TypeScript con autenticación JWT, y la aplicación móvil React Native + Expo.

---

## 🚀 Requisitos Previos

Asegúrate de tener instalado en tu equipo:
- **Node.js**: v18.x o v20.x
- **NPM**: v9.x o superior
- **Docker Desktop**: Para ejecutar la base de datos PostgreSQL + PostGIS
- **Expo Go** (Opcional): Si deseas probar la app móvil en un dispositivo físico iOS/Android

---

## 🛠️ Guía Rápida de Inicio (Onboarding Developer)

### 1. Clonar el repositorio e instalar dependencias

```bash
# Clonar el proyecto
git clone https://github.com/JuanTorres05/Vivero_despliegue.git
cd Vivero_despliegue

# Instalar dependencias en el monorepo
npm install
```

---

### 2. Levantar la Base de Datos PostgreSQL + PostGIS

Asegúrate de que Docker Desktop esté en ejecución y ejecuta:

```bash
docker-compose up -d
```

Esto iniciará un contenedor `playconnect_db` escuchando en el puerto `5432` con las credenciales por defecto:
- **Usuario**: `playconnect_user`
- **Contraseña**: `playconnect_password`
- **Base de datos**: `playconnect_db`

---

### 3. Configurar Variables de Entorno

#### Backend
Copia el archivo de plantilla `.env.example` en la carpeta `backend/`:

```bash
cp backend/.env.example backend/.env
```

El archivo `backend/.env` viene preconfigurado para entorno local:
```env
PORT=4000
NODE_ENV=development
DATABASE_URL="postgresql://playconnect_user:playconnect_password@localhost:5432/playconnect_db?schema=public"
JWT_ACCESS_SECRET="super-secret-access-token-key-change-me-in-production"
JWT_REFRESH_SECRET="super-secret-refresh-token-key-change-me-in-production"
JWT_ACCESS_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"
CORS_ORIGIN="*"
```

#### Mobile App
Copia el archivo de plantilla `.env.example` en la carpeta `mobile/`:

```bash
cp mobile/.env.example mobile/.env
```

```env
# Para emulador Android usar: http://10.0.2.2:4000/api/v1
# Para simulador iOS o Web usar: http://localhost:4000/api/v1
EXPO_PUBLIC_API_URL="http://localhost:4000/api/v1"
```

---

### 4. Ejecutar Migraciones de Base de Datos (PostGIS + Tablas)

Ejecuta las migraciones de Prisma para instalar la extensión `postgis`, crear las tablas de entidades y generar el índice de búsqueda espacial GIST en `canchas.ubicacion`:

```bash
npm run prisma:migrate
npm run prisma:generate
```

---

### 5. Iniciar el Backend

```bash
npm run dev:backend
```

El servidor estará corriendo en `http://localhost:4000`. Puedes verificar el healthcheck en:
```bash
curl http://localhost:4000/health
```

---

### 6. Ejecutar los Tests Automatizados

Para verificar el correcto funcionamiento del flujo de registro, inicio de sesión, refresh token y obtención del usuario actual:

```bash
npm run test:backend
```

---

### 7. Iniciar la App Móvil

En una nueva terminal, inicia la aplicación Expo:

```bash
npm run dev:mobile
```

Opciones para interactuar con la app:
- Presiona `w` para abrir en el navegador Web.
- Presiona `a` para abrir en emulador de Android.
- Presiona `i` para abrir en simulador de iOS.
- Escanea el código QR desde la app **Expo Go** en tu smartphone.

---

## 📱 Verificación del Flujo de Usuario (Criterio de Aceptación Sprint 0)

1. Abre la app móvil.
2. Serás redirigido automáticamente a la pantalla de **Iniciar Sesión**.
3. Haz clic en **Regístrate aquí**.
4. Completa los campos:
   - Nombre: `Valentin Torres`
   - Email: `valentin@playconnect.com`
   - Contraseña: `Password123`
5. Haz clic en **Crear Cuenta**. Serás registrado en el backend real y redirigido automáticamente a la pantalla **Home**, mostrando tu correo y el mensaje de sesión activa con JWT.
6. Haz clic en **Cerrar Sesión**. Serás devuelto a la pantalla de Login.
7. Ingresa nuevamente tu email y contraseña -> **Ingresar**. Accederás de nuevo exitosamente.

---

## 📂 Estructura de Entidades en Base de Datos

Las entidades migradas en la base de datos son:
- `usuarios`: Cuentas de usuario con hash de contraseña bcrypt.
- `perfiles_deportivos`: Deporte, posición y nivel por usuario.
- `equipos` y `equipo_miembros`: Equipos y roles de integrantes.
- `centros_deportivos`: Complejos deportivos con usuarios administradores.
- `canchas`: Canchas con campo `ubicacion` de tipo `GEOGRAPHY(Point, 4326)` e índice de búsqueda espacial **GIST** (`idx_canchas_ubicacion`).
- `reservas`: Reservas de canchas por fecha y rango horario.
- `partidos`: Partidos organizados por deporte y estado.
- `calificaciones`: Evaluaciones y puntuaciones entre deportistas post-partido.

---

## 🏛️ Documentación de Arquitectura

Para profundizar en el diseño de sistema, ciclo de vida de tokens JWT, estrategia de búsqueda geográfica por PostGIS y decisiones técnicas, consulta [`ARCHITECTURE.md`](ARCHITECTURE.md).
