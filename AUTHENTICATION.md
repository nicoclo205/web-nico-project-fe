# 🔐 Sistema de Autenticación - FriendlyBet

Este documento describe el sistema de autenticación implementado en el frontend de FriendlyBet, que se integra con el backend Django usando tokens.

## 📋 Tabla de Contenidos

- [Arquitectura](#arquitectura)
- [Flujo de Autenticación](#flujo-de-autenticación)
- [Componentes Principales](#componentes-principales)
- [Uso en la Aplicación](#uso-en-la-aplicación)
- [Seguridad](#seguridad)
- [Troubleshooting](#troubleshooting)

---

## 🏗️ Arquitectura

El sistema de autenticación está basado en **tokens** proporcionados por Django REST Framework, con la siguiente estructura:

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React)                          │
│                                                              │
│  ┌──────────────┐      ┌──────────────┐                    │
│  │  AuthContext │◄─────┤   useAuth    │                    │
│  │   Provider   │      │    Hook      │                    │
│  └──────┬───────┘      └──────────────┘                    │
│         │                                                   │
│         ▼                                                   │
│  ┌──────────────┐      ┌──────────────┐                    │
│  │ AuthService  │◄─────┤  apiClient   │                    │
│  │   (Logic)    │      │  (Axios)     │                    │
│  └──────────────┘      └──────┬───────┘                    │
│                                │                            │
└────────────────────────────────┼────────────────────────────┘
                                 │ HTTP + Token Header
                                 │
                        ┌────────▼─────────┐
                        │   Django Backend │
                        │   (API Server)   │
                        └──────────────────┘
```

---

## 🔄 Flujo de Autenticación

### 1. **Login Flow**

```
Usuario → Login Form → authService.login() → POST /api/login
                                                    │
                                                    ▼
                                            { token: "abc123..." }
                                                    │
                                                    ▼
                                       GET /api/usuario/me (con token)
                                                    │
                                                    ▼
                                            { id, username, email }
                                                    │
                                                    ▼
                                      Guardar en localStorage:
                                      - authToken
                                      - user (JSON)
                                                    │
                                                    ▼
                                            Redirect a /homepage
```

### 2. **Register Flow**

```
Usuario → Register Form → authService.register() → POST /api/usuarios/
                                                              │
                                                              ▼
                                                    { success: true }
                                                              │
                                                              ▼
                                               Switch to Login View
```

### 3. **Token Validation on App Load**

```
App Start → authService.isAuthenticated() → Check localStorage
                                                    │
                    ┌───────────────────────────────┴───────────────────────────────┐
                    │                                                               │
                    ▼                                                               ▼
            Token exists?                                                   No token
                    │                                                               │
                    ▼                                                               ▼
       authService.validateToken()                                        User = null
                    │
                    ▼
      GET /api/usuario/me
                    │
    ┌───────────────┴───────────────┐
    │                               │
    ▼                               ▼
Valid (200)                    Invalid (401)
    │                               │
    ▼                               ▼
Load User                    Clear localStorage
    │                               │
    ▼                               ▼
Continue                     Redirect to /login
```

---

## 🧩 Componentes Principales

### 1. **AuthService** (`src/services/authService.ts`)

Servicio centralizado para manejar todas las operaciones de autenticación.

**Métodos principales:**

```typescript
// Autenticación
authService.login(username, password)      // Iniciar sesión
authService.register(userData)             // Registrar usuario
authService.logout()                       // Cerrar sesión

// Estado
authService.isAuthenticated()              // ¿Usuario autenticado?
authService.getToken()                     // Obtener token
authService.getUser()                      // Obtener datos del usuario
authService.validateToken()                // Validar token con el servidor
authService.getCurrentUser()               // Refrescar datos del usuario
```

**Ejemplo de uso:**

```typescript
import { authService } from './services/authService';

// Login
try {
  const { token, user } = await authService.login('usuario', 'password');
  console.log('Login exitoso:', user);
} catch (error) {
  console.error('Error:', error.message);
}
```

---

### 2. **useAuth Hook** (`src/hooks/useAuth.tsx`)

Hook de React para acceder al contexto de autenticación en componentes.

**Propiedades disponibles:**

```typescript
const {
  user,              // Datos del usuario (null si no autenticado)
  loading,           // Estado de carga
  error,             // Error actual
  mensajeErr,        // Mensaje de error para mostrar
  isAuthenticated,   // Boolean: ¿usuario autenticado?
  login,             // Función para login
  register,          // Función para registro
  logout,            // Función para logout
  refreshUser,       // Función para refrescar datos del usuario
  setError,          // Setter para error
  setMensajeErr      // Setter para mensaje de error
} = useAuth();
```

**Ejemplo de uso:**

```typescript
import { useAuth } from './hooks/useAuth';

function MyComponent() {
  const { user, isAuthenticated, logout } = useAuth();

  if (!isAuthenticated) {
    return <div>No autenticado</div>;
  }

  return (
    <div>
      <p>Bienvenido, {user.nombre_usuario}!</p>
      <button onClick={logout}>Cerrar sesión</button>
    </div>
  );
}
```

---

### 3. **ProtectedRoute** (`src/components/ProtectedRoute.tsx`)

Componente para proteger rutas que requieren autenticación.

**Ejemplo de uso:**

```typescript
import { ProtectedRoute } from './components/ProtectedRoute';
import HomePage from './HomePage';

// En tu router
<Route
  path="/homepage"
  element={
    <ProtectedRoute>
      <HomePage />
    </ProtectedRoute>
  }
/>
```

**Funcionalidad:**
- ✅ Muestra loading mientras verifica autenticación
- ✅ Redirige a `/login` si no está autenticado
- ✅ Guarda la ruta original para redirigir después del login
- ✅ Renderiza el contenido si está autenticado

---

### 4. **API Client** (`src/utils/languageApi.ts`)

Cliente Axios configurado con interceptores para tokens y manejo de idiomas.

**Interceptores:**

**Request Interceptor:**
```typescript
// Agrega automáticamente a cada petición:
headers: {
  'Authorization': 'Token abc123...',
  'Accept-Language': 'es',
  'Content-Type': 'application/json'
}
```

**Response Interceptor:**
```typescript
// Maneja errores automáticamente:
- 401 Unauthorized → Limpia localStorage → Redirect a /login
- 403 Forbidden → Log de error
- 5xx Server Error → Log de error
```

**Ejemplo de uso:**

```typescript
import { apiClient } from './utils/languageApi';

// GET request
const response = await apiClient.get('/api/salas/');

// POST request
const response = await apiClient.post('/api/partidos/', {
  equipo_local: 1,
  equipo_visitante: 2
});

// El token se agrega automáticamente
```

---

## 🛠️ Uso en la Aplicación

### Proteger una nueva ruta

```typescript
// src/App.tsx
import { ProtectedRoute } from './components/ProtectedRoute';
import MyNewPage from './pages/MyNewPage';

<Route
  path="/my-new-page"
  element={
    <ProtectedRoute>
      <MyNewPage />
    </ProtectedRoute>
  }
/>
```

### Hacer llamadas API autenticadas

```typescript
import { apiClient } from './utils/languageApi';

// En un componente o servicio
async function fetchUserRooms() {
  try {
    const response = await apiClient.get('/api/salas/');
    return response.data;
  } catch (error) {
    console.error('Error fetching rooms:', error);
    throw error;
  }
}
```

### Mostrar información del usuario

```typescript
import { useAuth } from './hooks/useAuth';

function UserProfile() {
  const { user, loading } = useAuth();

  if (loading) return <div>Cargando...</div>;
  if (!user) return <div>No autenticado</div>;

  return (
    <div>
      <h1>{user.nombre_usuario}</h1>
      <p>{user.email}</p>
    </div>
  );
}
```

### Logout

```typescript
import { useAuth } from './hooks/useAuth';
import { useNavigate } from 'react-router-dom';

function LogoutButton() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return <button onClick={handleLogout}>Cerrar sesión</button>;
}
```

---

## 🔒 Seguridad

### ✅ Medidas Implementadas

1. **Token en Headers HTTP**
   - Formato: `Authorization: Token {token}`
   - Compatible con Django REST Framework Token Authentication

2. **Validación Automática de Tokens**
   - Al cargar la app, se valida el token con el servidor
   - Tokens inválidos son eliminados automáticamente

3. **Interceptores de Axios**
   - Agregan token automáticamente a todas las peticiones
   - Manejan 401 (Unauthorized) para limpiar sesiones expiradas

4. **Redirección Inteligente**
   - Solo redirige si no estás ya en `/login` o `/start`
   - Guarda la ruta original para volver después del login

5. **Limpieza de Datos**
   - Logout limpia tanto localStorage como el estado de React
   - Manejo de errores limpia datos parciales

### ⚠️ Consideraciones de Seguridad

1. **localStorage vs Cookies**
   - Actualmente usa `localStorage` (vulnerable a XSS)
   - Alternativa más segura: httpOnly cookies (requiere cambios en backend)

2. **Token Expiration**
   - Django puede configurar expiración de tokens
   - Frontend detecta tokens expirados via 401 responses

3. **HTTPS en Producción**
   - SIEMPRE usar HTTPS en producción
   - Tokens enviados en texto plano sobre HTTP son vulnerables

4. **XSS Protection**
   - Sanitizar inputs del usuario
   - Usar React's built-in XSS protection
   - No usar `dangerouslySetInnerHTML` con datos de usuario

---

## 🐛 Troubleshooting

### Problema: "Token inválido" después de iniciar sesión

**Causa:** El backend no está devolviendo el token correctamente.

**Solución:**
```bash
# Verificar respuesta del backend en /api/login
# Debe retornar: { "token": "abc123..." }
```

### Problema: 401 Unauthorized en todas las peticiones

**Causa:** El token no se está enviando correctamente o expiró.

**Solución:**
```typescript
// Verificar en DevTools → Application → localStorage
// Debe existir: authToken

// Verificar en DevTools → Network → Request Headers
// Debe incluir: Authorization: Token abc123...
```

### Problema: Redirect loop entre /login y /homepage

**Causa:** Protected route redirige a login, pero login redirige a homepage.

**Solución:**
```typescript
// Verificar en useAuth que loading sea false antes de verificar autenticación
if (loading) return <LoadingScreen />;
```

### Problema: Usuario se desloguea al refrescar la página

**Causa:** localStorage se está limpiando o el token no es válido.

**Solución:**
```typescript
// Verificar en AuthProvider que se llame validateToken() en mount
useEffect(() => {
  authService.validateToken();
}, []);
```

---

## 📚 Referencias

### Backend Django Endpoints

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/login` | POST | Iniciar sesión → retorna token |
| `/api/logout` | POST | Cerrar sesión (invalida token) |
| `/api/usuarios/` | POST | Registrar nuevo usuario |
| `/api/usuario/me` | GET | Obtener datos del usuario actual |
| `/api/users/me/` | PATCH | Actualizar preferencias del usuario |

### Tipos TypeScript

```typescript
// User
interface User {
  id: number;
  nombre_usuario: string;
  username: string;
  email: string;
  [key: string]: any;
}

// Register Data
interface RegisterData {
  name: string;
  lastName: string;
  username: string;
  phoneNum: string;
  email: string;
  password: string;
}

// Login Response
interface LoginResponse {
  token: string;
  user: User;
}
```

---

## 📝 TODO / Mejoras Futuras

- [ ] Implementar refresh tokens para sesiones más largas
- [ ] Migrar de localStorage a httpOnly cookies
- [ ] Agregar 2FA (Two-Factor Authentication)
- [ ] Implementar "Remember me" functionality
- [ ] Agregar rate limiting en login attempts
- [ ] Implementar password reset flow
- [ ] Agregar logs de auditoría de sesiones

---

**Última actualización:** 2025-12-01
