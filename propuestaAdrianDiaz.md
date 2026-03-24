# **Propuesta de Proyecto Final:** SmartMark

**Autor:** Adrián

**Ciclo:** Desarrollo de Aplicaciones Web (DAW)

### Indice
* [**Propuesta de Proyecto Final:** SmartMark](#propuesta-de-proyecto-final-smartmark)
    * [Índice](#índice)
  * [1. Identificación de necesidades](#1-identificación-de-necesidades)
    * [Descripción del problema](#descripción-del-problema)
    * [Detección de la necesidad](#detección-de-la-necesidad)
    * [Usuarios o beneficiarios](#usuarios-o-beneficiarios)
  * [2. Oportunidades de negocio](#2-oportunidades-de-negocio)
    * [Propuesta de valor diferencial](#propuesta-de-valor-diferencial)
    * [Potencial y escalabilidad](#potencial-y-escalabilidad)
  * [3. Tipo de proyecto](#3-tipo-de-proyecto)
    * [Tipo de aplicación](#tipo-de-aplicación)
    * [Justificación](#justificación)
    * [Arquitectura propuesta](#arquitectura-propuesta)
  * [4. Características específicas](#4-características-específicas)
    * [Funcionalidades principales (MVP - Producto Mínimo Viable)](#funcionalidades-principales-mvp---producto-mínimo-viable)
    * [Funcionalidades Avanzadas (Diferenciales / Opcionales según tiempo)](#funcionalidades-avanzadas-diferenciales--opcionales-según-tiempo)
  * [5. Obligaciones legales y prevención](#5-obligaciones-legales-y-prevención)
  * [6. Ayudas y subvenciones](#6-ayudas-y-subvenciones)
    * [Subvenciones](#subvenciones)
    * [Recursos de bajo coste o gratuitos](#recursos-de-bajo-coste-o-gratuitos)
  * [7. Guión de trabajo](#7-guión-de-trabajo)
    * [Fases de desarrollo e hitos](#fases-de-desarrollo-e-hitos)
    * [Herramientas de gestión](#herramientas-de-gestión)


### Descripción del problema
En el día a día de un desarrollador o estudiante del sector tecnológico, se consumen cientos de recursos web (tutoriales, documentación, repositorios, foros). Los gestores de marcadores integrados en los navegadores ofrecen listas de texto planas y caóticas, lo que provoca la pérdida de información valiosa y la frustración al intentar recuperar un recurso específico meses después, aunque este no es solo un problema de los desarrolladores otros profesionales o personas tienen la necesidad de guardar diferentes sitios web en sus marcadores, pero termina siendo texto plano sin apenas informacion adicional lo cual puede complicar volver a ese sitio web, un ejemplo de esto seria tener diferentes marcadores a YouTube, lo mas seguro es que principalmente se vean que son de YouTube pero no de que tratan ni cual es cual.

### Detección de la necesidad
Esta problemática se ha detectado mediante la observación directa del flujo de trabajo propio y de compañeros durante el ciclo de DAW, así como en el entorno de la Formación en Centros de Trabajo (FCT). Se constata que el tiempo invertido en buscar un recurso previamente guardado rompe el flujo de concentración del programador, tambien durante mi dia a dia el uso de marcadores hace que tenga que abrir varios para poder ver cual era exactamente el que necesitaba.

### Usuarios o beneficiarios
El público objetivo son estudiantes de informática, desarrolladores de software, diseñadores UI/UX y profesionales del sector tecnológico que necesitan una zona de marcadores personal, visual y altamente organizado, aunque estos son el publico objetivo tambien puede ser usado por cualquier usuario normal al no ser algo especifico solo para programadores pero con sus ventajas para estos ultimos.


## 2. Oportunidades de negocio
   Análisis de mercado y competidores
   Existen soluciones consolidadas en el mercado como Raindrop.io, Linkding o Linkwarden. Sin embargo, estas aplicaciones son generalistas; tratan un artículo sobre un framework de JavaScript de la misma manera que una receta de cocina, limitándose a extraer el título y una imagen genérica.

### Propuesta de valor diferencial
SmartMark se posiciona como una herramienta especializada en el ecosistema de desarrollo mediante tres pilares que la competencia directa no cubre:

- **Integración de Datos Vivos:** Conexión con APIs del sector (ej. GitHub) para mostrar estadísticas reales de los enlaces guardados directamente en la tarjeta visual (estrellas, forks, lenguaje principal).

- **Mantenimiento Proactivo:** Un sistema de revisión en segundo plano que detecta qué URLs guardadas han dejado de existir (Error 404), alertando al usuario.

- **Auto-etiquetado Técnico:** Deteccion de tecnologías en el contenido y auto-clasificacion con un tag los recursos (ej. #React, #Node).

### Potencial y escalabilidad
El proyecto nace como una herramienta local de un solo usuario (self-hosted), pero tiene una alta escalabilidad comercial. Se podría pivotar hacia un modelo SaaS (Software as a Service) freemium o implementar espacios de trabajo colaborativos para equipos de desarrollo en empresas.


## 3. Tipo de proyecto
   
### Tipo de aplicación
   El proyecto se desarrollará como una SPA (Single Page Application).

### Justificación
Para un gestor visual de tarjetas, la experiencia de usuario debe ser fluida, sin recargas de página al buscar, filtrar o añadir etiquetas. Una SPA permite manipular el DOM de forma reactiva, ofreciendo un rendimiento similar al de una aplicación nativa de escritorio.

### Arquitectura propuesta
Se utilizará una arquitectura Cliente-Servidor (API REST):

- **Frontend (Cliente):** React. Se encargará de la renderización de la interfaz, el estado de la aplicación y el consumo de la API local.

- **Backend (Servidor):** Node.js con Express. Su existencia es obligatoria para evadir las restricciones CORS del navegador al realizar web scraping, procesar las llamadas a APIs de terceros y ejecutar tareas programadas (cron jobs).

- **Base de Datos:** SQLite. Proporciona persistencia relacional sin necesidad de instalar un motor de base de datos pesado, ideal para el enfoque inicial de un solo usuario.


## 4. Características específicas

### Funcionalidades principales (MVP - Producto Mínimo Viable)
- **CRUD de Marcadores:** Añadir, leer, actualizar y borrar enlaces mediante una interfaz de cuadrícula.

- **Extracción de Metadatos (Scraping):** El backend leerá la URL y extraerá automáticamente el título, descripción e imagen de portada de la web destino.

- **Sistema de Organización:** Creación de categorías y asignación de etiquetas (tags) manuales.

- **Buscador:** Filtrado en tiempo real por título y descripción.

### Funcionalidades Avanzadas (Diferenciales / Opcionales según tiempo)
- **Integración API GitHub:** Mostrar estadísticas dinámicas de los repositorios guardados.

- **Auto-etiquetado Técnico (Smart Tags):** Detección de lenguajes de programación en el texto extraído.

- **Detector de Enlaces Rotos:** Cron job semanal que compruebe la disponibilidad de los enlaces (status 200 vs 404).

- **Extensión de Navegador:** Plugin básico para capturar la URL de la pestaña activa con un clic.


## 5. Obligaciones legales y prevención

- **Normativa aplicable (RGPD y LSSI-CE):** Aunque en su fase inicial será una aplicación local privada, el código estará preparado con principios de "Privacidad desde el Diseño" limitando la recolección de datos personales. En caso de evolucionar a una plataforma web pública, requerirá aviso legal, política de privacidad y gestión de cookies (LSSI-CE).

- **Seguridad:** Se implementarán medidas de saneamiento de inputs para evitar inyecciones SQL en SQLite, protección contra ataques XSS en React y configuración restrictiva de CORS en Express.

- **Accesibilidad Web (WCAG):** La interfaz seguirá las directrices de accesibilidad WCAG 2.1 nivel AA, utilizando HTML semántico, atributos ARIA para los elementos interactivos y ratios de contraste adecuados en el diseño visual.


## 6. Ayudas y subvenciones
### Subvenciones
De cara a una futura comercialización del producto orientado a empresas de desarrollo o agencias, el proyecto podría enmarcarse en ayudas a la digitalización como el Kit Digital (para comercializarlo como solución de gestión del conocimiento) o financiación a través de ENISA (para emprendedores de base tecnológica).

### Recursos de bajo coste o gratuitos
Para mantener el coste de desarrollo en cero durante esta fase, se aprovecharán los siguientes recursos:

- APIs públicas gratuitas (GitHub REST API).

- Herramientas del GitHub Student Developer Pack.

- Entorno de ejecución local y bases de datos basadas en archivos (SQLite), eliminando la necesidad de servidores en la nube para la fase de prototipado.

## 7. Guión de trabajo
### Fases de desarrollo e hitos
- **Fase 1:** Diseño y Arquitectura. Modelado de la base de datos y diseño de los wireframes de la interfaz. (Hito: Esquema relacional cerrado).

- **Fase 2:**  Desarrollo Backend (MVP). Configuración de servidor Node.js, conexión a SQLite y endpoints básicos CRUD.

- **Fase 3:** Desarrollo Frontend. Configuración de React, enrutamiento y creación de la vista principal de tarjetas. (Hito: Conexión Frontend-Backend establecida).

- **Fase 4:** Lógica Avanzada. Implementación del web scraping, el cron job de enlaces rotos y la conexión con la API de GitHub. (Hito: Funcionalidades diferenciales operativas).

- **Fase 5:** Extensión y Pruebas. Creación del plugin de navegador, depuración de errores y auditoría de accesibilidad.

- **Fase 6:**  Documentación y Despliegue. Preparación de la memoria final y el empaquetado del proyecto.

### Herramientas de gestión
Se aplicarán metodologías ágiles utilizando GitHub Projects para la gestión del tablero Kanban (Backlog, In Progress, Done), aunque tal vez use Trello que tengo experiencia usandolo en cosas personales y Git para el control de versiones, asegurando un progreso documentado y organizado.