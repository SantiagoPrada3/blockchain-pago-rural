# 🚀 PIB Web Payment Rural - CryptoPay

<div align="center">

![Angular](https://img.shields.io/badge/Angular-19.2.0-DD0031?style=for-the-badge&logo=angular&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7.2-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.1.13-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![MetaMask](https://img.shields.io/badge/MetaMask-Web3-F6851B?style=for-the-badge&logo=metamask&logoColor=white)

**Aplicación Web Progresiva de Pagos Digitales con Integración Blockchain**

[🎯 Características](#-características) • [🛠️ Instalación](#️-instalación) • [📱 Funcionalidades](#-funcionalidades) • [🔧 Tecnologías](#-tecnologías)

</div>

---

## 🎯 Descripción

**PIB Web Payment Rural - CryptoPay** es una PWA moderna desarrollada con Angular 19 que permite realizar pagos digitales seguros mediante integración con MetaMask y blockchain Ethereum. Diseñada especialmente para facilitar transacciones financieras en zonas rurales con una interfaz intuitiva y moderna.

### ✨ Características Principales

- 🔗 **Integración MetaMask Real**: Conexión directa con wallets Web3
- 📱 **PWA Completa**: Aplicación instalable con capacidades nativas
- 💰 **Transacciones ETH**: Envío y recepción de Ethereum real
- 📊 **Historial Completo**: Seguimiento de todas las transacciones
- 🎨 **Diseño Moderno**: UI futurista con efectos glassmorphism
- 🔒 **Seguridad Avanzada**: Protección de rutas y validaciones

---

## 🛠️ Instalación

### Prerrequisitos

- Node.js 20.x o superior
- npm 10.x o superior
- MetaMask instalado en el navegador

### Configuración Rápida

```bash
# Clonar repositorio
git clone https://github.com/vallegrande/AS231S6_T03_PagoRural.git
cd AS231S6_T03_PagoRural

# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm start
# Aplicación disponible en http://localhost:4200

# Build para producción
npm run build

# Ejecutar con SSR
npm run serve:ssr:pib-web-paymentrural
```

---

## 📱 Funcionalidades

### 🔐 Autenticación Web3
- **Login MetaMask**: Conexión segura con wallet
- **Balance Real**: Consulta de ETH en tiempo real
- **Detección de Red**: Soporte para Ethereum, Holesky, Sepolia
- **Persistencia**: Reconexión automática

### 💰 Sistema de Pagos
- **Transacciones ETH**: Envío real de Ethereum
- **Validación Avanzada**: Verificación de balance y gas
- **Transacción Forzada**: Método alternativo para casos especiales
- **Historial Completo**: Registro de todas las operaciones

### 👥 Gestión de Contactos
- **Lista de Contactos**: Gestión completa de destinatarios
- **Favoritos**: Marcado de contactos frecuentes
- **Privacidad**: Balances ocultos por defecto
- **Búsqueda**: Filtrado por nombre o dirección

### 📊 Historial y Análisis
- **Filtros de Fecha**: Hoy, 7 días, mes, año, todo
- **Tipos de Transacción**: Enviadas, recibidas, todas
- **Búsqueda Avanzada**: Por contacto, descripción o hash
- **Explorador**: Enlaces directos a Etherscan/Holesky

### 📱 Código QR
- **Generación Real**: QR escaneadle con dirección
- **Detección de Red**: Muestra red actual (Holesky, Ethereum, etc.)
- **Compartir**: Funcionalidad nativa de compartir
- **Descargar**: Guardar QR como imagen

### 👤 Perfil de Usuario
- **Datos Completos**: Información personal editable
- **Avatar Dinámico**: Generación aleatoria de avatares
- **Configuraciones**: Privacidad y preferencias
- **Persistencia**: Almacenamiento local seguro

---

## 🔧 Tecnologías

### Frontend
- **Angular 19.2.0**: Framework principal con Standalone Components
- **TypeScript 5.7.2**: Tipado estricto y moderno
- **Tailwind CSS 4.1.13**: Estilos utility-first con animaciones personalizadas
- **RxJS 7.8.0**: Programación reactiva y manejo de estado

### Blockchain & Web3
- **Web3.js 4.16.0**: Interacción con blockchain Ethereum
- **MetaMask Integration**: Conexión directa con wallets
- **QRCode 1.5.4**: Generación de códigos QR reales

### PWA & Performance
- **Angular SSR**: Server-Side Rendering habilitado
- **Service Worker**: Capacidades offline
- **Express 4.18.2**: Servidor para SSR
- **Lazy Loading**: Carga diferida de rutas

---

## 📂 Estructura del Proyecto

```
src/app/
├── components/
│   └── bottom-nav/          # Navegación inferior
├── guards/
│   └── auth.guard.ts        # Protección de rutas
├── pages/
│   ├── introduccion/        # Página de bienvenida
│   ├── login/              # Autenticación MetaMask
│   ├── inicio/             # Dashboard principal
│   ├── pagar/              # Sistema de pagos
│   ├── enviar-dinero/      # Envío de ETH
│   ├── contactos/          # Gestión de contactos
│   ├── historial/          # Historial de transacciones
│   ├── mi-qr/              # Código QR personal
│   ├── perfil/             # Perfil de usuario
│   └── editar-perfil/      # Editor de perfil
├── services/
│   ├── metamask.service.ts  # Integración Web3
│   ├── transaction.service.ts # Gestión de transacciones
│   ├── contact.service.ts   # Gestión de contactos
│   └── user.service.ts      # Gestión de usuario
└── app.routes.ts           # Configuración de rutas
```

---

## 🚀 Características Técnicas

### Redes Soportadas
- **Ethereum Mainnet** (0x1)
- **Holesky Testnet** (0x4268) - Red principal de pruebas
- **Sepolia Testnet** (0xaa36a7)
- **Polygon, BSC, Arbitrum** - Soporte adicional

### Funcionalidades Web3
- **Balance Real**: Consulta `eth_getBalance` en tiempo real
- **Transacciones**: Envío de ETH con validación completa
- **Explorador**: Enlaces automáticos al explorador correcto
- **Cambio de Red**: Detección y cambio automático de redes

### PWA Features
- **Instalable**: Manifest.json configurado
- **Offline**: Service Worker implementado
- **Shortcuts**: Accesos rápidos a Pagar y Mi QR
- **Responsive**: Diseño mobile-first

---

## 🔒 Seguridad

- **No Storage**: Las claves privadas nunca se almacenan
- **MetaMask Delegation**: Seguridad delegada a MetaMask
- **Route Guards**: Protección automática de rutas
- **Validación**: Formularios reactivos con validaciones
- **Error Handling**: Manejo robusto de errores

---

## 🎨 Diseño

### Paleta de Colores
- **Púrpura**: `#8b5cf6` - Elementos principales
- **Cian**: `#06b6d4` - Acentos y gradientes
- **Verde**: `#10b981` - Estados exitosos
- **Rojo**: `#ef4444` - Errores y alertas

### Efectos Visuales
- **Glassmorphism**: `backdrop-blur` y transparencias
- **Animaciones**: Float, glow, pulse personalizadas
- **Gradientes**: Efectos modernos y atractivos
- **Responsive**: Mobile-first design

---

## 📈 Scripts Disponibles

| Comando | Descripción |
|---------|-------------|
| `npm start` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm test` | Tests unitarios |
| `npm run watch` | Build en modo watch |
| `npm run serve:ssr:pib-web-paymentrural` | Servidor SSR |

---

## 🤝 Contribución

1. Fork el repositorio
2. Crear rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

---

## 👥 Equipo de Desarrollo

- **Johan Malasquez** - johan.malasquez@vallegrande.edu.pe
- **María Lázaro** - maria.lazaro@vallegrande.edu.pe  
- **Santiago Prada** - santiago.prada@vallegrande.edu.pe

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver [LICENSE](LICENSE) para más detalles.

---

<div align="center">

**Desarrollado por el equipo AS231S6_T03 P.I.B. para la comunidad Rural**

[![Angular](https://img.shields.io/badge/Built_with-Angular_19-DD0031?style=flat-square&logo=angular&logoColor=white)](https://angular.io/)
[![TypeScript](https://img.shields.io/badge/Powered_by-TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Web3](https://img.shields.io/badge/Web3-Ready-F6851B?style=flat-square&logo=ethereum&logoColor=white)](https://ethereum.org/)

</div>