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

Sin embargo, como en todo ciclo de desarrollo real, el alcance tuvo que ajustarse frente a la limitación temporal. Las siguientes funcionalidades quedaron fuera del alcance temporal, pero se consideran implementaciones importantes para futuras versiones:

- **Integración Continua (CI):** Aunque se logró implementar el Despliegue Continuo (CD) mediante GitHub Actions para la generación y subida de imágenes a Docker Hub, la validación automática (CI) se intentó la implementación pero sin éxito, dejándolo para realizarlo más adelante, por desgracia quedó fuera del alcance temporal aunque 


- **Testing Automatizado:** Por restricciones de tiempo, se optó por un enfoque de pruebas funcionales y E2E manuales. La cobertura manual fue exhaustiva y garantizó la estabilidad del MVP, pero la falta de tests unitarios automatizados (Jest) es un hito pendiente.


- **Optimización de Assets:** La conversión planificada de la iconografía a formato SVG vectorial puro tuvo que descartarse temporalmente en favor de formatos PNG, priorizando la funcionalidad de la aplicación sobre el perfeccionismo estético.

---

## 3. Mejoras Futuras Propuestas (Roadmap)

La arquitectura de SmartMark se ha diseñado para ser escalable. Las siguientes iteraciones del producto se centrarán en las siguientes áreas:

**A corto plazo:**
1.  **Implementación de Testing Automatizado:** Creación de baterías de pruebas unitarias para el backend y pruebas E2E automatizadas para el frontend.


2.  **Completar el Pipeline CI:** Añadir flujos en GitHub Actions que ejecuten los tests.


3.  **Refactorización UI:** Migrar todos los assets gráficos a SVG nativo para mejorar el rendimiento y la escalabilidad visual.

**A medio plazo:**
1.  **Importación y Exportación:** Para facilitar la migración desde otros gestores de marcadores o desde otro dispositivo, se implementará una función de importación/exportación en JSON, esto facilitará que los usuarios den el salto de otro gestor de marcadores a SmartMark o facilitar el traspaso de tú marcadores entre dispositivos.


2.  **Extensión de Navegador:** Desarrollar una extensión para Chrome/Firefox que permita guardar marcadores en SmartMark directamente desde la pestaña activa con un solo clic, esto facilitara el guardado de marcadores para poder usar la aplicación sin tener que tenerla abierta en el navegador.


3.  **Mayor implementación de API:** Implementar diferentes API en la aplicación propórcionara un gran valor a SmartMark ya qué no solo guardara los datos básicos de los marcadores, sino que mostraran datos adicionales enriqueciendo los mismos, un ejemplo de esto sería usar la API de YouTube haciendo que cualquier enlace a un video te muestre datos adicionales sobre la duración, visitas, likes.

**A largo plazo:**

1.  **Sistema Multi-usuario:** Evolucionar de un modelo de uso individual y local a un modelo SaaS, implementando registro, login (JWT) y bases de datos aisladas por usuario, esto permitirá la implementación de funcionalidades colaborativas y facilitará el acceso a SmartMark a clientes fuera del ámbito informático.

2.  **Despliegue web (Hosting):** Desplegar SmartMark en un hosting web para que los usuarios puedan acceder a su biblioteca de marcadores desde cualquier dispositivo sin necesidad de configurar Docker, esto facilitará el acceso a la aplicación a usuarios no técnicos y permitirá que SmartMark llegue a un público más amplio.

2.  **Carpetas colaborativas:** Permitir que los usuarios compartan carpetas específicas con otros usuarios, facilitando la colaboración en proyectos comunes o la compartición de recursos entre equipos de trabajo.

---

## 4. Lecciones Aprendidas

El desarrollo integral de SmartMark (Full-Stack y DevOps) ha supuesto un reto técnico y de gestión del que se extraen valiosos aprendizajes profesionales:

1.  **El valor de priorizar el MVP:** La decisión de abandonar la lucha con los conversores de SVG o posponer la Integración Continua (CI) demostró ser acertada. Entender cuándo una tarea bloquea el avance y saber adaptarte es vital para entregar software funcional a tiempo. Es preferible un producto completo con iconos PNG que un producto inacabado con iconos perfectos.


2.  **Gestión de la incertidumbre técnica:** La implementación del *web scraping* representó un terreno desconocido. La experiencia demostró que investigar librerías (Cheerio), leer documentación oficial y apoyarse en herramientas de IA para resolver cuellos de botella permite integrar tecnologías complejas en tiempo récord.


3.  **Estimación de tiempos:** Se evidenció la necesidad de aplicar el principio un aumento del 20-30% a los tiempos planificados para el desarrollo de funcionalidades. Los errores imprevistos consumen más recursos de los calculados inicialmente en un entorno ideal.

    Esto evidencia que se debe aprender incluso de los errores, planificar con márgenes de tiempo más flexibles, esto hará que la gestión del tiempo sea más eficiente y se puedan entregar productos de mayor calidad sin tener que sacrificar funcionalidades o calidad por falta de tiempo.


4.  **Conocimientos en nuevas librerías:** El desarrollo de SmartMark ha supuesto la adquisición de conocimientos en librerías y tecnologías nuevas como Cheerio para el *web scraping* básico o Cron Jobs para la verificación de URL semanal. Esta experiencia ha ampliado el conocimiento técnico y la capacidad de adaptación a nuevas herramientas.