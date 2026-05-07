# FitSEO - Plataforma Interactiva de Gestión Deportiva

FitSEO es una aplicación web progresiva (PWA/Web App) diseñada para modernizar la experiencia del usuario dentro de centros deportivos. Este proyecto integra herramientas de gestión de estado físico, control de acceso mediante tecnología QR y una arquitectura backend escalable (BaaS), proporcionando una solución integral tanto para el usuario final como para la validación de membresías.

## Arquitectura y Características Principales

* **Autenticación y Gestión de Usuarios:** Integración nativa con Supabase (`supabaseClient.js`) para manejar el registro, inicio de sesión y persistencia de perfiles de usuario de manera segura.
* **Control de Acceso Integrado:** Implementación de un escáner QR nativo en el navegador (`QRScanner.jsx`), diseñado para validar el estado de las membresías (`MembershipStatus`) en tiempo real directamente desde el dispositivo del usuario o administrador.
* **Módulos de Salud y Entrenamiento:** Vistas dinámicas para la captura de datos físicos (`NutritionForm`, `RutinesForm`) y renderizado de planes personalizados (`NutritionPlan`, `Exercises`).
* **Enrutamiento Protegido:** Estructura de navegación segura que diferencia entre usuarios invitados (`Welcome`, `Login`) y usuarios autenticados (`Perfil`, `Inicio`).

## Stack Tecnológico

* **Frontend Core:** React 18
* **Build Tool:** Vite
* **Backend as a Service (BaaS):** Supabase (Autenticación y Base de Datos)
* **Estilos:** CSS puro y responsivo con enfoque "Mobile First"
* **Librerías Clave:** React Router DOM (Navegación), integraciones para escaneo QR.

## Instalación y Ejecución Local

Para visualizar y editar el entorno de desarrollo en una máquina local:

1. Clona el repositorio:
   ```bash
   git clone [https://github.com/TuUsuario/fitseo.git](https://github.com/TuUsuario/fitseo.git)
