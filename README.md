# 🎵 RhymeFinder - Buscador de Rimas Inteligente

## 📱 Descripción del Proyecto

**RhymeFinder** es una aplicación móvil multiplataforma desarrollada con React Native y Expo que permite a los usuarios buscar rimas de manera inteligente y eficiente. La aplicación está diseñada para poetas, compositores, escritores y cualquier persona que necesite encontrar palabras que rimen para sus creaciones literarias.

### 🎯 Características Principales

- **Búsqueda de Rimas en Tiempo Real**: Integración con la API de RhymeBrain para obtener rimas precisas
- **Sistema de Autenticación**: Registro e inicio de sesión seguro con Firebase Authentication
- **Gestión de Favoritos**: Guardar y organizar rimas favoritas
- **Sistema de Notas**: Crear y gestionar notas con rimas encontradas
- **Interfaz Moderna**: Diseño atractivo con gradientes y animaciones fluidas
- **Funcionalidad Offline**: Datos de prueba cuando no hay conexión a internet
- **Multiplataforma**: Compatible con iOS, Android y Web

## 🛠️ Tecnologías Utilizadas

### Frontend y Desarrollo Móvil
- **React Native 0.79.5**: Framework principal para desarrollo móvil multiplataforma
- **Expo SDK 53**: Plataforma de desarrollo que simplifica el proceso de creación de apps
- **TypeScript 5.8.3**: Lenguaje de programación tipado para mayor robustez del código
- **React Navigation 7**: Sistema de navegación entre pantallas

### Backend y Servicios
- **Firebase 12.1.0**: Plataforma de Google para backend como servicio
  - **Firebase Authentication**: Sistema de autenticación de usuarios
  - **Firestore**: Base de datos NoSQL en tiempo real
- **RhymeBrain API**: API externa para búsqueda de rimas

### Librerías y Dependencias
- **@expo/vector-icons**: Iconografía consistente en toda la aplicación
- **expo-linear-gradient**: Efectos de gradiente para mejorar la UI
- **@react-native-async-storage**: Almacenamiento local de datos
- **expo-crypto**: Funcionalidades criptográficas
- **react-native-gesture-handler**: Manejo de gestos táctiles

### Herramientas de Desarrollo
- **Metro Bundler**: Empaquetador de JavaScript para React Native
- **Babel**: Transpilador de JavaScript
- **ESLint/TypeScript**: Herramientas de linting y verificación de tipos

## 📁 Estructura del Proyecto

```
RhymeFinder/
├── src/
│   ├── components/          # Componentes reutilizables
│   │   ├── ConfirmModal.tsx
│   │   ├── FilterModal.tsx
│   │   ├── LogoutModal.tsx
│   │   ├── RhymeCard.tsx
│   │   └── SearchBar.tsx
│   ├── config/             # Configuraciones
│   │   ├── firebase.ts     # Configuración de Firebase
│   │   └── firebase.example.ts
│   ├── contexts/           # Contextos de React
│   │   └── AuthContext.tsx # Contexto de autenticación
│   ├── hooks/              # Custom hooks
│   ├── navigation/         # Configuración de navegación
│   │   ├── AppNavigator.tsx
│   │   └── AuthNavigator.tsx
│   ├── screens/            # Pantallas principales
│   │   ├── SearchScreen.tsx    # Pantalla de búsqueda
│   │   ├── FavoritesScreen.tsx # Pantalla de favoritos
│   │   ├── NotesScreen.tsx     # Pantalla de notas
│   │   ├── ProfileScreen.tsx   # Pantalla de perfil
│   │   ├── LoginScreen.tsx     # Pantalla de login
│   │   └── RegisterScreen.tsx  # Pantalla de registro
│   ├── services/           # Servicios y APIs
│   │   ├── authService.ts      # Servicio de autenticación
│   │   ├── favoritesService.ts # Servicio de favoritos
│   │   ├── firebaseService.ts  # Servicio de Firebase
│   │   ├── notesService.ts     # Servicio de notas
│   │   └── rhymeService.ts     # Servicio de búsqueda de rimas
│   ├── types/              # Definiciones de tipos TypeScript
│   │   └── index.ts
│   └── utils/              # Utilidades y helpers
│       ├── platform.ts
│       └── platform.web.ts
├── assets/                 # Recursos estáticos
├── App.tsx                 # Componente principal
├── package.json           # Dependencias del proyecto
└── tsconfig.json          # Configuración de TypeScript
```

## 🔧 Módulos y Funcionalidades

### 1. **Módulo de Autenticación** (`src/contexts/AuthContext.tsx`)
- **Descripción**: Gestiona el estado de autenticación de los usuarios
- **Funcionalidades**:
  - Registro de nuevos usuarios
  - Inicio de sesión con email y contraseña
  - Persistencia de sesión
  - Cierre de sesión seguro
- **Tecnologías**: Firebase Authentication, React Context API

### 2. **Módulo de Búsqueda de Rimas** (`src/services/rhymeService.ts`)
- **Descripción**: Servicio principal para interactuar con la API de RhymeBrain
- **Funcionalidades**:
  - Búsqueda de rimas exactas y aproximadas
  - Filtrado por puntuación y número de sílabas
  - Manejo de errores de red y CORS
  - Datos de prueba para modo offline
- **Tecnologías**: Fetch API, RhymeBrain API, Manejo de CORS

### 3. **Módulo de Favoritos** (`src/services/favoritesService.ts`)
- **Descripción**: Gestiona el almacenamiento y recuperación de rimas favoritas
- **Funcionalidades**:
  - Agregar/eliminar rimas de favoritos
  - Sincronización con Firestore
  - Organización por usuario
- **Tecnologías**: Firebase Firestore, AsyncStorage

### 4. **Módulo de Notas** (`src/services/notesService.ts`)
- **Descripción**: Permite crear y gestionar notas con rimas
- **Funcionalidades**:
  - Crear, editar y eliminar notas
  - Marcar notas como favoritas
  - Búsqueda y filtrado de notas
- **Tecnologías**: Firebase Firestore, Timestamps

### 5. **Módulo de Navegación** (`src/navigation/`)
- **Descripción**: Sistema de navegación entre pantallas
- **Funcionalidades**:
  - Navegación por tabs para usuarios autenticados
  - Navegación por stack para autenticación
  - Iconos dinámicos según el estado
- **Tecnologías**: React Navigation 7, Expo Vector Icons

### 6. **Módulo de UI/UX** (`src/components/`)
- **Descripción**: Componentes reutilizables para la interfaz
- **Componentes**:
  - `SearchBar`: Barra de búsqueda con iconos
  - `RhymeCard`: Tarjeta para mostrar rimas
  - `ConfirmModal`: Modal de confirmación
  - `FilterModal`: Modal de filtros
- **Tecnologías**: React Native, Expo Linear Gradient

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js (versión 16 o superior)
- npm o yarn
- Expo CLI
- Cuenta de Firebase

### Pasos de Instalación

1. **Clonar el repositorio**
   ```bash
   git clone [URL_DEL_REPOSITORIO]
   cd RhymeFinder
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar Firebase**
   - Crear un proyecto en Firebase Console
   - Habilitar Authentication y Firestore
   - Copiar las credenciales a `src/config/firebase.ts`

4. **Ejecutar la aplicación**
   ```bash
   npm start
   ```

### Scripts Disponibles
- `npm start`: Inicia el servidor de desarrollo
- `npm run android`: Ejecuta en Android
- `npm run ios`: Ejecuta en iOS
- `npm run web`: Ejecuta en navegador web

## 🔌 APIs y Servicios Externos

### RhymeBrain API
- **URL**: https://rhymebrain.com/talk
- **Funcionalidad**: Búsqueda de rimas en español
- **Endpoints utilizados**:
  - `getRhymes`: Obtener rimas para una palabra
  - `getSynonyms`: Obtener sinónimos
  - `getWordInfo`: Información detallada de palabras

### Firebase Services
- **Authentication**: Gestión de usuarios
- **Firestore**: Base de datos para favoritos y notas
- **Configuración**: Variables de entorno y configuración

## 📱 Características Técnicas

### Arquitectura
- **Patrón MVC**: Separación clara entre lógica de negocio y presentación
- **Servicios**: Capa de abstracción para APIs externas
- **Context API**: Gestión de estado global
- **TypeScript**: Tipado estático para mayor robustez

### Manejo de Errores
- **Try-Catch**: Manejo de errores en servicios
- **Fallbacks**: Datos de prueba cuando no hay conexión
- **Alertas**: Notificaciones de error al usuario
- **Logging**: Console logs para debugging

### Optimizaciones
- **Lazy Loading**: Carga diferida de componentes
- **Memoización**: Optimización de re-renders
- **Debouncing**: Evitar llamadas excesivas a la API
- **Caching**: Almacenamiento local de datos

## 🎨 Diseño y UX

### Paleta de Colores
- **Primario**: #667eea (Azul)
- **Secundario**: #764ba2 (Púrpura)
- **Fondo**: #f8f9fa (Gris claro)
- **Texto**: #333 (Gris oscuro)

### Componentes de UI
- **Gradientes**: Fondo con LinearGradient
- **Sombras**: Elevación en tarjetas
- **Iconos**: Ionicons para consistencia
- **Tipografía**: Jerarquía clara de textos

## 🔒 Seguridad

### Autenticación
- **Firebase Auth**: Sistema seguro de autenticación
- **Validación**: Verificación de credenciales
- **Persistencia**: Mantener sesión activa

### Datos
- **Firestore Rules**: Reglas de seguridad en base de datos
- **Validación**: Verificación de datos de entrada
- **Sanitización**: Limpieza de datos antes de procesar

## 📊 Métricas y Analytics

### Funcionalidades de Tracking
- **Búsquedas**: Conteo de búsquedas realizadas
- **Favoritos**: Estadísticas de uso de favoritos
- **Notas**: Métricas de creación de notas
- **Errores**: Logging de errores para debugging

## 🚀 Roadmap y Mejoras Futuras

### Próximas Funcionalidades
- [ ] Búsqueda por categorías (verbos, sustantivos, etc.)
- [ ] Exportación de rimas a PDF
- [ ] Compartir rimas en redes sociales
- [ ] Modo oscuro
- [ ] Notificaciones push
- [ ] Sincronización offline mejorada

### Optimizaciones Planificadas
- [ ] Implementación de React Query para cache
- [ ] Optimización de bundle size
- [ ] Mejoras en performance de listas
- [ ] Tests unitarios y de integración

## 👥 Contribución

### Cómo Contribuir
1. Fork del repositorio
2. Crear rama para nueva funcionalidad
3. Implementar cambios
4. Crear Pull Request
5. Revisión de código

### Estándares de Código
- **TypeScript**: Uso obligatorio
- **ESLint**: Reglas de linting
- **Prettier**: Formateo de código
- **Commits**: Mensajes descriptivos

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 📞 Contacto

- **Desarrollador**: [Tu Nombre]
- **Email**: [tu-email@ejemplo.com]
- **GitHub**: [tu-usuario-github]

---

**RhymeFinder** - Encuentra la rima perfecta para tus creaciones 🎵
