# 🌌 NuevasTendencias — Showroom Virtual 3D & Gestor de Presupuestos

![Symfony](https://img.shields.io/badge/Symfony_8.0-000000?style=for-the-badge&logo=symfony&logoColor=white)
![PHP](https://img.shields.io/badge/PHP_8.4-777BB4?style=for-the-badge&logo=php&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL_16-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Three.js](https://img.shields.io/badge/Three.js-000000?style=for-the-badge&logo=three.js&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)

Aplicación web Full-Stack desarrollada como Proyecto Final de Grado (DAW). Simula un **showroom virtual interactivo de sofás con temática espacial**, integrando un **configurador 3D en tiempo real (Three.js)**, un sistema B2B/B2C de **solicitud y gestión de presupuestos a medida**, **análisis de sentimiento automatizado en reseñas** mediante Magic Links y backoffice administrativo con **EasyAdmin 5**.

---

## ✨ Características Principales

- **🛋️ Configurador 3D en Tiempo Real (Three.js + Stimulus):**
  - Interfaz tipo *wizard* guiado en 4 pasos (Modelo, Tapicería, Color y Patas) con distribución 60% visor 3D y 40% panel de control.
  - Aplicación dinámica de materiales (`MeshStandardMaterial`) con variación de *roughness* y reflejos según el tejido (tela, piel, terciopelo), cambios de color con transición suave, iluminación espacial y partículas en canvas.
  - Arquitectura preparada para la carga directa de activos `.glb` / `.gltf` desde `public/models/`.
- **📋 Flujo de Presupuestos a Medida (Turbo Frames & Streams):**
  - Serialización y almacenamiento de la configuración exacta diseñada en el visor 3D junto a los datos de contacto del cliente.
  - Gestión del flujo de estados desde el panel de administración (`pendiente` → `en proceso` → `respondido`) con actualizaciones en tiempo real sin recarga de página.
- **🤖 Reseñas Verificadas con Magic Links & Análisis de Sentimiento (`AIService`):**
  - Generación de tokens únicos (`UUID v4`) de un solo uso con expiración a los 30 días (`ReviewToken`) para garantizar valoraciones reales.
  - Clasificación automática del sentimiento de cada reseña al persistirse en base de datos mediante `AIService::analyzeSentiment()`.
- **🛠️ Backoffice Completo (EasyAdmin 5):**
  - Administración integral de la jerarquía de catálogo (`Category` → `Mueble` → `Variation` → `Option` → `Image`), subida de imágenes y modelos 3D con `VichUploaderBundle` y moderación de presupuestos y reseñas.

---

## 🏗️ Stack Tecnológico y Arquitectura

Arquitectura monolítica moderna **100% libre de pasos de compilación Node/npm**, apoyándose en el ecosistema nativo de Symfony AssetMapper y Hotwired:

| Capa | Tecnología |
| :--- | :--- |
| **Backend** | Symfony 8.0 (PHP ≥ 8.4) con atributos nativos PHP 8 (`#[Route]`, `#[ORM]`) |
| **ORM & Base de Datos** | Doctrine ORM 3 + Doctrine Migrations + PostgreSQL 16 (Docker) |
| **Frontend & Interactividad** | Twig 3 + Tailwind CSS + Hotwired (Stimulus + Turbo Frames/Streams) |
| **Motor 3D** | Three.js (`sofa_configurator_controller.js`) |
| **Administración & Archivos** | EasyAdmin Bundle 5 + VichUploaderBundle |
| **Servicios & CLI** | `AIService` (análisis de sentimiento) + Comandos de consola personalizados |

### Modelo de Dominio

    Category (1) ──< Mueble (1) ──< Variation (n) >──< Option (1) ──< Image
                       │                                   ├── type: 'color' (value = hex)
                       │                                   ├── type: 'pata' (madera natural/oscura, metal negro/dorado)
                       │                                   ├── type: 'tapiceria' (tela/piel/terciopelo)
                       │                                   └── type: 'modulo' (chaise/rinconera/2-3 plazas)
                       │
                       ├──< Review ──── ReviewToken (Magic Link UUID v4, un solo uso, expira en 30 días)
                       └──< Presupuesto (Configuración 3D completa + datos de contacto del cliente)

---

## 🗺️ Rutas Principales de la Aplicación

| Ruta | Nombre Interno | Descripción |
| :--- | :--- | :--- |
| `/` | `app_home` | Catálogo principal del showroom con muebles activos |
| `/mueble/{id}` | `app_mueble_show` | Ficha técnica del sofá, reseñas analizadas por IA y acceso al visor 3D |
| `/mueble/{id}/configurar` | `app_mueble_configurar` | Wizard interactivo con el configurador 3D en Three.js |
| `/presupuesto/solicitar` | `app_presupuesto_solicitar` | Endpoint (`POST`) para registrar la configuración 3D y solicitud del cliente |
| `/mueble/{id}/simular-compra` | `app_mueble_simulate_purchase` | Endpoint (`POST`) que genera un `ReviewToken` de prueba para evaluar el flujo |
| `/opinar/{token}` | `app_review_form` | Formulario de valoración accesible mediante Magic Link de un solo uso |
| `/admin` | `admin` | Dashboard administrativo en EasyAdmin 5 |

---

## 🚀 Instalación y Puesta en Marcha Local

### Requisitos previos
- PHP ≥ 8.4 y Composer
- Docker y Docker Compose
- Symfony CLI *(opcional)*

### Pasos de ejecución

1. **Clonar el repositorio y levantar la base de datos PostgreSQL:**
   `git clone [https://github.com/Juandi01/NuevasTendenciasTFG-DAW.git](https://github.com/Juandi01/NuevasTendenciasTFG-DAW.git) && cd NuevasTendenciasTFG-DAW && docker compose up -d`

2. **Instalar dependencias de PHP:**
   `composer install`

3. **Ejecutar migraciones y cargar el catálogo de prueba (Fixtures):**
   `php bin/console doctrine:migrations:migrate --no-interaction && php bin/console doctrine:fixtures:load --no-interaction`

4. **Levantar el servidor de desarrollo:**
   `symfony server:start` *(o alternativamente `php -S 127.0.0.1:8000 -t public`)*

5. **Accesos locales:**
   - **Showroom Virtual:** `[http://127.0.0.1:8000](http://127.0.0.1:8000)`
   - **Panel Admin (EasyAdmin):** `[http://127.0.0.1:8000/admin](http://127.0.0.1:8000/admin)`

---

## 🧪 Utilidades CLI y Testing

- **Generar un token de reseña (Magic Link) manualmente por consola:**
  `php bin/console app:generate-token`
- **Ejecutar la batería de tests (PHPUnit):**
  `php bin/phpunit`
