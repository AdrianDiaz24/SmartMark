# Manual de Usuario

## 1. Guía de uso de la aplicación

### Home Page

- **Barra de Navegación Lateral (Sidebar):** Desde aquí puedes acceder rápidamente a tus distintas Carpetas y filtrar por los Tags que hayas creado, ademas de acceder a las paginas de gestion de tags y carpetas clickando en el titulo de cada seccion del sidebar y presionando el "+" se abrira el modal para la creacion de una nueva carpeta o tag.


- **Panel Principal :** Es el área central donde se visualizan las tarjetas de tus marcadores mas recientes visitados en forma de lista. Cada card del listado mostrara portada, título, descripción y tags. En la esquina superior derecha de cada card encontrarás un pequeño icono que pulsando te llevara a la pagina de gestion de ese marcador, donde podras editar o eliminar el marcador.

    En el panel principal también encontrarás en la parte superior un card, compuestos por 4 estadisticas generales de tu biblioteca de marcadores:
  - Total de Marcadores
  - Total de Carpetas
  - Total de Tags
  - Número de marcadores visitados en los últimos 7 días


- **Buscador Superior:** Una barra de búsqueda global para encontrar rápidamente cualquier marcador por su título o descripción.


- **Boton de añadir marcador:** El boton que se encuentra en el header a la derecha del todo, es el acceso directo para crear un nuevo marcador. Al hacer clic se abrirá un modal donde podrás pegar la URL que deseas guardar y el sistema hará el scraping automáticamente (Los datos guardados automaticamente pueden ser editados manualmente).


- **Boton de "ver todo":** Entre  los card de los marcadores y las estaditicas se encuentra este boton, al hacer clic se mostrará el listado completo de marcadores sin ningún filtro aplicado, es decir, se mostrarán todos los marcadores que tengas guardados en tu biblioteca.

- **Logo:** Te permite volver a la Home Page desde cualquier sección de la aplicación haciendo clic en él.

### BookMark Page

- **Tarjetas de Marcadores:** Cada marcador se muestra como una tarjeta con su título, descripción, imagen de portada y tags asociados. Al hacer clic en la tarjeta, se abrirá la URL en una nueva pestaña. Estas se pueden ver en forma de lista o en un grid, estas tarjetas tambien muestran las carpetas, si le das al icono de editar que se encuentra en la esquina superior derecha de cada tarjeta, te llevara a la pagina de gestion de ese marcador o carpeta, donde podras editar o eliminar el marcador/carpeta.


- **Seccion central:** la seccion central es la que se encuentra entre el header y los marcadores.

    En esta seccion se muestras lo siguientes elementos:
  - **Boton de Cuadricula o Listado** : Este boton se encuentra a la derecha de la zona central, al hacer clic en el se alternará entre la vista de cuadricula o listado de los marcadores.
  - **Filtros activos** : En esta zona central a la izquierda se muestran los filtros activos, es decir, si tienes seleccionado una carpeta o un tag, se mostrará el nombre de esta en esta zona para que sepas que filtros tienes aplicados en ese momento, clickando en esta zona sobre el filtro especifico es la unica forma de eliminar ese filtro.


### Create Bookmark Modal, Create Folder Modal y Create Tag Modal

El funcionamiento de estos modales es muy similar, al hacer clic en el botón de crear marcador, carpeta o tag se abrirá un modal donde podrás introducir la información necesaria para crear el nuevo recurso. En el caso del marcador, al pegar la URL el sistema hará un scraping automático para extraer el título y la descripción, aunque esta información puede ser editada manualmente antes de guardar. Para las carpetas y los tags, simplemente tendrás que introducir el nombre y en el caso de los tags también seleccionar un color.

Tanto en el caso de los marcadores como el de las carpetas el selector de carpeta padre te permitira seleccionar si ese marcador se guarda en una carpeta o si la carpeta será una subcarpeta de otra carpeta ya existente, esto te permitira organizar tus marcadores de forma jerarquica y estructurada.


### Manage Bookmarks Page, Manage Folders Page y Manage Tags Page

En estas páginas podrás gestionar tus marcadores, carpetas y tags respectivamente. Podrás editar la información de cada recurso, cambiar su nombre, su URL, su imagen de portada, los tags asociados, etc. 

En la card de la derecha veras el menu de acciones rapidas, desde este podras actualizar los datos, visitar la pagina  o ver todos los marcadores en esa carpeta o con ese tag y por ultimo tendras la opcion de eliminar el recurso, esto hara que te aparezca un modal de confirmacion .

---

## 2. Capturas de pantalla de las funcionalidades principales

- **Vista del Dashboard:** El dashboard principal muestra una vista general de tus marcadores más recientes, con estadísticas clave en la parte superior y un acceso rápido a la creación de nuevos marcadores, carpetas y tags. La barra lateral izquierda permite navegar entre las diferentes categorías y etiquetas para filtrar los marcadores mostrados en el panel central.


  ![Vista del Dashboard Principal](https://i.gyazo.com/52682f95dad8b476e0381ac89504444e.png)


- **Modal de Creación de un Nuevo Marcador:** El modal hace web scraping automático al pegar la URL, extrayendo título y descripción, ademas de auto asignar el tag.


  ![Modal de Creación de un Nuevo Marcador](https://i.gyazo.com/09d341e105d05e07fb47bd6f86c4bf94.png)


- **Filtros aplicados:** El sistema de filtrado por carpeta y tags permite combinar ambos filtros para mostrar solo los marcadores que pertenecen a una carpeta específica y que además tengan un tag determinado, ademas de una palabra clave, esto es especialmente útil para encontrar rápidamente un marcador específico dentro de una categoría amplia.


  ![Búsqueda cruzada por Carpeta y Tags](https://i.gyazo.com/a88104737f99998c11cc37e90f2d35df.png)
---

## 3. Casos de uso típicos paso a paso

### Caso de Uso 1: Añadir un nuevo recurso a la biblioteca
1.  Haz clic en el botón principal **"Nuevo Marcador"**.
2.  En el cuadro de texto, pega la URL de la página web o repositorio que deseas guardar.
3.  Espera un momento (aprox. 1.5 segundos) mientras el sistema extrae automáticamente el título, la descripción y la imagen de portada.
4.  Opcionalmente, selecciona la **Carpeta** de destino y añade los **Tags** correspondientes para facilitar su búsqueda futura.
5.  Haz clic en **"Crear"**. El modal se cerrará y la nueva tarjeta aparecerá inmediatamente en tu lista.

### Caso de Uso 2: Encontrar un marcador antiguo mediante filtros
1.  Dirígete a la barra lateral izquierda.
2.  Haz clic en una **Carpeta** específica (ej. "Desarrollo Frontend"). El panel central mostrará solo los enlaces de esa categoría.
3.  Para afinar más, haz clic en un **Tag** (ej. "React"). La vista se actualizará mostrando únicamente los marcadores que pertenezcan a esa carpeta *y* tengan esa etiqueta.
4.  Si aún hay muchos resultados, utiliza la barra de búsqueda superior escribiendo una palabra clave del título o la descripción.

### Caso de Uso 3: Gestión de enlaces rotos
1.  Al entrar a la aplicación, revisa visualmente tus tarjetas.
2.  Si observas una tarjeta con un **borde de color naranja**, significa que el sistema automatizado ha detectado que esa página ya no existe (Error 404).
3.  Haz clic en el botón de edición de esa tarjeta para actualizar la URL con el nuevo enlace correcto, o utiliza el botón de eliminar si el recurso se ha perdido definitivamente.

---

## 4. FAQ o solución de problemas comunes

**¿Por qué algunos de mis marcadores tienen un borde naranja?**
La aplicación cuenta con un sistema de mantenimiento que verifica en segundo plano el estado de tus enlaces cada 7 días. El borde naranja es una alerta visual que indica que el enlace está caído o devuelve un error 404 (no encontrado). Deberías actualizar o eliminar ese marcador.

**¿Puedo editar la descripcion o el título que el sistema extrae automáticamente?**
Sí. Aunque el sistema realiza un *scraping* automático al pegar la URL para ahorrarte tiempo, antes de guardar (o editando el marcador posteriormente) puedes modificar el título, la descripción o subir tu propia imagen de portada personalizada.

**He añadido un enlace de GitHub, ¿se actualizan las estrellas y forks?**
El sistema captura los metadatos y estadísticas de GitHub en el momento de crear el marcador para darte contexto rápido. Estos son actualizados al cargar la página, por lo que si las estadísticas han cambiado desde la última visita, se mostrarán los datos más recientes.

**No encuentro un marcador, pero sé que lo guardé. ¿Qué hago?**
Asegúrate de no tener ningún filtro de Carpeta o Tag activo en la barra lateral (selecciona "Todos los marcadores"). Luego, utiliza la barra de búsqueda superior introduciendo cualquier palabra que recuerdes de su descripción, ya que el buscador escanea también el contenido, no solo el título.