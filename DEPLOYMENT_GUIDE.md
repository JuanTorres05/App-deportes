# 🚀 Guía de Despliegue y Distribución Rápida - PlayConnect

Esta guía contiene los pasos exactos para desplegar la base de datos, el backend y generar la app para que tus compañeros la usen en sus celulares.

---

## 📋 1. Base de Datos en la Nube (Supabase - Gratis)

1. Ve a [supabase.com](https://supabase.com) y crea una cuenta.
2. Haz clic en **New Project**, nómbralo `playconnect-db` y define una contraseña para la base de datos.
3. En el menú lateral, ve a **Database** ➔ **Extensions**, busca **`postgis`** y actívala (o ejecuta `CREATE EXTENSION postgis;` en el SQL Editor).
4. Ve a **Project Settings** ➔ **Database** ➔ **Connection String** ➔ **URI** y copia la URL:
   ```text
   postgresql://postgres:[TU_PASSWORD]@db.xxxxxxxx.supabase.co:5432/postgres
   ```

---

## ☁️ 2. Backend en la Nube (Render - Gratis)

1. Sube tu código a un repositorio en **GitHub**.
2. Entra a [render.com](https://render.com) e inicia sesión con GitHub.
3. Haz clic en **New +** ➔ **Web Service** y conecta tu repositorio.
4. Completa la configuración:
   - **Name**: `playconnect-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
5. En la sección **Environment Variables**, añade:
   - `DATABASE_URL`: *(Tu URL de Supabase del paso 1)*
   - `NODE_ENV`: `production`
   - `PORT`: `4000`
   - `JWT_ACCESS_SECRET`: `clave_secreta_acceso_playconnect_2026`
   - `JWT_REFRESH_SECRET`: `clave_secreta_refresh_playconnect_2026`
   - `CORS_ORIGIN`: `*`
6. Haz clic en **Create Web Service**.
7. Una vez desplegado, copia la URL generada (ej: `https://playconnect-backend.onrender.com`).

### 📦 Cargar Datos de Prueba (Seed) en la Nube:
En tu computadora local, ejecuta apuntando a la base de datos de Supabase:
```bash
cd backend
DATABASE_URL="tu_url_de_supabase" npm run seed
```

---

## 📱 3. Conectar la App Móvil

En tu archivo [`mobile/.env`](file:///c:/Users/user/Downloads/App%20deportes/mobile/.env):
```env
EXPO_PUBLIC_API_URL=https://playconnect-backend.onrender.com/api/v1
```

---

## 📲 4. Opciones para que tus Compañeros la Usen

### Opción A: A través de Expo Go (La más rápida para Android & iPhone)
1. En tu terminal:
   ```bash
   cd mobile
   npx expo start
   ```
2. Tus compañeros descargan **Expo Go** desde Google Play o App Store.
3. Escanean el código QR desde la app (Android) o la cámara (iOS).

### Opción B: Generar un archivo instalador APK (Solo Android)
1. Instala EAS CLI si no lo tienes:
   ```bash
   npm install -g eas-cli
   ```
2. Inicia sesión en tu cuenta de Expo:
   ```bash
   eas login
   ```
3. Genera el APK:
   ```bash
   cd mobile
   eas build -p android --profile preview
   ```
4. EAS compilará el `.apk` en la nube de Expo y te dará un enlace directo para descargarlo e instalarlo en cualquier teléfono Android.
