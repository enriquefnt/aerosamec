# 🏥 Sistema de Gestión de Traslados Médicos Aéreos - TODO

## 📋 FASE 1: Sistema Base Funcional

### 🏗️ Configuración Inicial
- [x] Crear sandbox y configurar entorno
- [x] Configurar base de datos (Prisma + SQLite)
- [x] Crear esquema de base de datos
- [x] Poblar base de datos con datos de ejemplo
- [ ] Configurar autenticación (NextAuth.js)

### 🔐 Autenticación y Usuarios
- [x] Crear sistema de login
- [x] Implementar roles (Admin, Coordinador, Operario)
- [x] Middleware de protección de rutas
- [x] Dashboard básico por roles
- [x] CRUD de usuarios (gestión completa)
- [x] API de usuarios funcionando
- [x] Página de gestión de usuarios (solo admin)
- [x] Campos adicionales: DNI, función
- [ ] Envío de emails de verificación
- [ ] Cambio de contraseña por usuario

### 🚁 Gestión de Traslados
- [ ] Crear modelo de traslados
- [ ] CRUD completo de traslados
- [ ] Estados del traslado
- [ ] Asignación de equipos

### 💊 Seguimiento Médico
- [x] Registro de procedimientos
- [x] Control de medicación
- [x] Modelo de signos vitales (FC, FR, TA, Temp, SatO2, Glasgow)
- [x] Página de seguimiento para operarios
- [x] Grilla de seguimiento cronológico
- [x] Campo de epicrisis/debriefing
- [ ] Formularios de registro (procedimientos, medicación, signos)
- [ ] APIs de registro médico

### 📊 Dashboard y Reportes
- [ ] Dashboard principal
- [ ] Panel de control por roles
- [ ] Estadísticas básicas
- [ ] Filtros y búsquedas

### 🎨 Interfaz de Usuario
- [x] **STAGE 1**: Crear layout.tsx y page.tsx básicos
- [x] **AUTOMATIC**: Process placeholder images (placehold.co URLs) → AI-generated images
  - This step executes automatically when placeholders are detected
  - No manual action required - system triggers automatically
  - Ensures all images are ready before testing
- [ ] **STAGE 2**: Crear todos los componentes restantes
- [ ] Formularios con validación
- [ ] Componentes reutilizables

### 🧪 Testing y Validación
- [ ] Probar APIs con curl
- [ ] Validar autenticación
- [ ] Testing de funcionalidades
- [ ] Corrección de errores

### 📦 Preparación para Offline (Estructura)
- [ ] Hooks preparados para sincronización
- [ ] API endpoints offline-ready
- [ ] Componentes extensibles
- [ ] Documentación para FASE 2

## 🎯 Estado Actual: GESTIÓN DE USUARIOS FUNCIONANDO ✅
**Próximo paso**: Implementar gestión de traslados
**URL Sistema**: https://sb-5x8vvxfmka6m.vercel.run
**Login Funcional**: admin@salud.gob.ar / coord@salud.gob.ar / operario@salud.gob.ar (123456)
**Gestión Usuarios**: ✅ Solo admins pueden crear/gestionar usuarios
**API Usuarios**: ✅ GET /api/usuarios, POST /api/usuarios funcionando
**Base de Datos**: SQLite con Prisma - Usuarios con DNI, función, timestamps