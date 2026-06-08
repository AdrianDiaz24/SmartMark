# Conclusiones - SmarkMark

Este apartado es la reflexión final sobre el desarrollo de **SmartMark**, analizando críticamente el proceso, los resultados obtenidos y el camino trazado para la evolución del software.

## 1. Evaluación Crítica respecto a los Objetivos Iniciales

El propósito de SmartMark era resolver la desorganización en la gestión de recursos web, aportando valor mediante la automatización y el contexto técnico. Al evaluar el producto final contra estos objetivos, el balance es altamente positivo:

- **Automatización:** Se ha logrado implementar con éxito el sistema de *web scraping* (usando Cheerio) que facilita el guardar un recurso. El sistema extrae metadatos básicos, ádemas de auto-etiquetar el contenido basándose en los tags existentes en la base de datos, cumpliendo dos de las propuestas de valor.


- **Mantenimiento Proactivo:** La implementación del *Cron Job* para la verificación en segundo plano de las URLs marca la gran diferencia entre SmartMark y otras aplicaciones las cuales no cuentan con esta funcionalidad o es premium.


- **Contexto Técnico (GitHub):** La integración con la API de GitHub para mostrar estadísticas dinámicas en las tarjetas cumple con el objetivo de crear una herramienta para desarrolladores.

---

## 2. Grado de Cumplimiento del Alcance Propuesto

El proyecto ha alcanzado el **100% de los requisitos definidos para el Producto Mínimo Viable (MVP)** y la implementación de las funcionalidades que dan valor a la aplicación. SmartMark es hoy una aplicación completamente funcional, desplegable mediante Docker y capaz de gestionar el flujo completo de información sin errores.

Se han implementado todas las funcionalidades principales (CRUD, extracción de metadatos, organización por carpetas y tags, búsqueda y filtrado) y las funcionalidades avanzadas (integración con GitHub, auto-etiquetado técnico, verificación de URLs). Esto demuestra un cumplimiento total del alcance propuesto inicialmente.

Adenmas de esto, se han implementado funcionalidades adicionales que no estaban inicialmente planificadas como el login y registro, haciendo que en un mismo despliegue se pueda tener diferentes usuarios con diferentes marcadores cada uno.

---

## 3. Mejoras Futuras Propuestas (Roadmap)

La arquitectura de SmartMark se ha diseñado para ser escalable. Las siguientes iteraciones del producto se centrarán en las siguientes áreas:

**A corto plazo:**

1. **Refactorización UI:** Migrar todos los assets gráficos a SVG nativo para mejorar el rendimiento y la escalabilidad visual.

**A medio plazo:**
1.  **Importación y Exportación:** Para facilitar la migración desde otros gestores de marcadores o desde otro dispositivo, se implementará una función de importación/exportación en JSON, esto facilitará que los usuarios den el salto de otro gestor de marcadores a SmartMark o facilitar el traspaso de tú marcadores entre dispositivos.


2. **Mayor implementación de API:** Implementar diferentes API en la aplicación propórcionara un gran valor a SmartMark ya qué no solo guardara los datos básicos de los marcadores, sino que mostraran datos adicionales enriqueciendo los mismos, un ejemplo de esto sería usar la API de YouTube haciendo que cualquier enlace a un video te muestre datos adicionales sobre la duración, visitas, likes.

**A largo plazo:**

1. **Carpetas colaborativas:** Permitir que los usuarios compartan carpetas específicas con otros usuarios, facilitando la colaboración en proyectos comunes o la compartición de recursos entre equipos de trabajo.


2.  **Extensión de Navegador:** Desarrollar una extensión para Chrome/Firefox que permita guardar marcadores en SmartMark directamente desde la pestaña activa con un solo clic, esto facilitara el guardado de marcadores para poder usar la aplicación sin tener que tenerla abierta en el navegador.

---

## 4. Lecciones Aprendidas

El desarrollo integral de SmartMark (Full-Stack y DevOps) ha supuesto un reto técnico y de gestión del que se extraen valiosos aprendizajes profesionales:

1.  **El valor de priorizar el MVP:** La decisión de abandonar la lucha con los conversores de SVG o posponer la Integración Continua (CI) demostró ser acertada. Entender cuándo una tarea bloquea el avance y saber adaptarte es vital para entregar software funcional a tiempo. Es preferible un producto completo con iconos PNG que un producto inacabado con iconos perfectos. Aun asi con el tiempo extra puede implementar el CI y los test unitarios



2.  **Gestión de la incertidumbre técnica:** La implementación del *web scraping* representó un terreno desconocido. La experiencia demostró que investigar librerías (Cheerio), leer documentación oficial y apoyarse en herramientas de IA para resolver cuellos de botella permite integrar tecnologías complejas en tiempo récord.


3.  **Estimación de tiempos:** Se evidenció la necesidad de aplicar el principio un aumento del 20-30% a los tiempos planificados para el desarrollo de funcionalidades. Los errores imprevistos consumen más recursos de los calculados inicialmente en un entorno ideal.

    Esto evidencia que se debe aprender incluso de los errores, planificar con márgenes de tiempo más flexibles, esto hará que la gestión del tiempo sea más eficiente y se puedan entregar productos de mayor calidad sin tener que sacrificar funcionalidades o calidad por falta de tiempo.


4.  **Conocimientos en nuevas librerías:** El desarrollo de SmartMark ha supuesto la adquisición de conocimientos en librerías y tecnologías nuevas como Cheerio para el *web scraping* básico o Cron Jobs para la verificación de URL semanal. Esta experiencia ha ampliado el conocimiento técnico y la capacidad de adaptación a nuevas herramientas.