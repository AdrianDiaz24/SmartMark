# Introducción a SmartMark

## 1. Origen de la Idea y Motivación del Proyecto

### Contexto del Problema

En el día a día de un desarrollador o estudiante del sector tecnológico, se consumen cientos de recursos web: tutoriales, documentación, repositorios, foros y referencias técnicas. Los gestores de marcadores integrados en los navegadores ofrecen listas de texto planas y desorganizadas, lo que provoca:

- **Pérdida de información valiosa**: El contenido se acumula sin estructura, haciendo que sea imposible encontrar un recurso específico meses después.
- **Ruptura del flujo**: El tiempo invertido en buscar un marcador guardado interrumpe la concentración del programador.
- **Falta de contexto**: No hay forma de diferenciar entre múltiples enlaces similares (ej. varios tutoriales de React) sin abrir cada uno.
- **Problema generalizado**: Aunque afecta especialmente a desarrolladores, otros profesionales también sufren esta desorganización (archivos, recetas, artículos de interés, etc.).

### Detección de la Necesidad

Esta necesidad se detectó mediante:

- **Observación directa**: Análisis del flujo de trabajo propio y de compañeros durante el ciclo de DAW.
- **Experiencia en FCT**: Constatación del problema en entornos profesionales reales.
- **Experiencia personal**: Necesidad de gestionar múltiples marcadores de YouTube, documentación técnica y referencias sin poder identificar rápidamente cuál era cada uno.

### Usuarios Objetivo

- **Público principal**: Estudiantes de informática, desarrolladores de software, diseñadores UI/UX y profesionales del sector tecnológico.
- **Público secundario**: Cualquier usuario que necesite una zona de marcadores personal, visual y altamente organizada.

---

## 2. Expectativas y Objetivos Específicos

### Objetivos Generales

Crear una herramienta de gestión de marcadores especializada en el ecosistema de desarrollo que sea:

- **Visual**: Una interfaz intuitiva basada en tarjetas (cards) en lugar de listas de texto.
- **Organizada**: Sistema jerárquico de carpetas y etiquetado.
- **Inteligente**: Extracción automática de metadatos de las URLs guardadas.
- **Mantenible**: Detección proactiva de enlaces rotos.
- **Contextualizada**: Información específica para desarrolladores (estadísticas de GitHub, lenguajes de programación, etc.).

### Funcionalidades Principales (MVP)

1. **CRUD de Marcadores**: Crear, leer, actualizar y eliminar enlaces mediante interfaz gráfica.
2. **Extracción de Metadatos**: El sistema extrae automáticamente título, descripción e imagen de portada de cada URL.
3. **Sistema de Organización**: 
   - Carpetas con estructura jerárquica (subcarpetas ilimitadas).
   - Etiquetas (tags) personalizables y reutilizables.
4. **Búsqueda y Filtrado**: Búsqueda en tiempo real por título, descripción, carpeta o etiqueta.
5. **Estadísticas básicas**: Registro de última apertura y conteo de accesos.

### Funcionalidades Avanzadas

1. **Integración GitHub**: Mostrar estadísticas dinámicas (estrellas, forks, lenguaje principal) de repositorio.
2. **Auto-etiquetado Técnico**: Detección automática de lenguajes de programación y frameworks.
3. **Verificación de URLs**: Cron job semanal que detecta enlaces rotos (HTTP 404).
4. **Interface Responsiva**: Accesibilidad desde dispositivos diferentes.

### Objetivos Técnicos

- Implementar una arquitectura Cliente-Servidor (SPA React + API REST Node.js).
- Utilizar SQLite para persistencia de datos sin necesidad de servidor externo.
- Demostrar separación de responsabilidades entre Frontend, Backend y Base de Datos.
- Implementar despliegue automatizado mediante Docker y GitHub Actions.

---

## 3. Análisis Comparativo de Aplicaciones Similares

### Soluciones Existentes en el Mercado

Existen varias herramientas consolidadas que abordan la gestión de marcadores:

| Aplicación | Enfoque | Fortalezas | Limitaciones |
|-----------|---------|-----------|--------------|
| **Raindrop.io** | Generalista | UI atractiva, sincronización multiplataforma | Trata todas las URLs igual, sin contexto técnico |
| **Linkding** | Generalista | Código abierto, sin trackers | Interfaz básica, marcadores sin enriquecimiento |
| **Linkwarden** | Generalista | Colaborativo, web-clipper | No especializado en desarrollo |

### Propuesta de Valor Diferencial de SmartMark

**SmartMark se especializa en el ecosistema técnico** mediante tres pilares que la competencia no cubre:

#### 1. Integración de Datos Vivos
- **Problema**: Las herramientas generalistas extraen solo título e imagen genérica.
- **Solución SmartMark**: Conexión en tiempo real con APIs de terceros (GitHub REST API) para mostrar estadísticas reales directamente en la tarjeta del marcador.
- **Ejemplo**: Al guardar un repo de React, SmartMark muestra automáticamente estrellas, forks, lenguajes y contribuidores.

#### 2. Mantenimiento Proactivo
- **Problema**: Los usuarios descubren URLs rotas meses después, sin saber cuándo sucedió.
- **Solución SmartMark**: Sistema de verificación automática cada 7 días que detecta enlaces inactivos (Error 404) y alerta al usuario.
- **Beneficio**: Mantener una biblioteca de recursos siempre actualizada y operativa.

#### 3. Auto-clasificación Técnica
- **Problema**: Las herramientas generalistas no entienden contexto técnico.
- **Solución SmartMark**: Detección automática de tecnologías (lenguajes de programación, frameworks) en el contenido y auto-etiquetado (ej. #React, #Node, #Python).
- **Beneficio**: Clasificación inteligente sin intervención manual del usuario.

### Posicionamiento en el Mercado

**SmartMark para desarrolladores** se posiciona como:

- Una herramienta **especializada** (no generalista) en el ecosistema de desarrollo.
- Una solución **rápida de desplegar** (self-hosted, sin dependencias complejas).
- Una plataforma con **alto potencial de escalabilidad** hacia modelo SaaS freemium o espacios colaborativos para equipos empresariales.



