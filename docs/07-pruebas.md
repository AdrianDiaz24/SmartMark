# Pruebas - SmartMark

## 1. Metodología de Pruebas Empleada

### Pruebas Manuales

Se utilizó **únicamente pruebas manuales** durante todo el desarrollo.

**Justificación:**
- MVP con funcionalidades claras y visuales
- Tests manuales en navegador más efectivos para UI/UX
- Debugging manual más rápido que configurar framework de tests

La ultima semana se implemetaron los test tanto para el backend como para el frontend, estos test se pasan cada vez que se hace un commit en la rama main y se han ido ejecutando a lo largo de las ultimas implementaciones para comprobar el correcto funcionamiento.

### Ciclo de Desarrollo con Pruebas Manuales


1. Desarrollar una funcionalidad en local                                       
2. Ejecutar backend: npm run dev                              
3. Ejecutar frontend: npm start                                  
4. Abrir navegador en localhost:3001                                          
5. Testear manualmente en el navegador la funcionalidad desarrollada:     
6. Si falla: Corregir código y repetir paso 2-5            
7. Si funciona: Continuar con la siguiente funcionalidad           

**Herramientas utilizadas:**
- Navegador: Opera GX (Inspector de Elementos y todas las herramientas de desarrollo que se encuentra ahi) 
- Backend: Consola del terminal (logs)
- Base de datos: Visualizado de BD de IntelliJ

---

Actualmente aunque se han seguido usando pruebas manuales el ciclo de uso de los test unitarios usados esta ultima semana es el siguietne:
1. Desarrollar una funcionalidad en local                                       
2. Ejecutar test backend: cd backend && npm run test
3. Ejecutar test frontend: cd frontend && npm run test
4. Si falla: Corregir código y repetir paso 2-3
5. Si funciona: Continuar con la siguiente funcionalidad

## 2. Tipos de Pruebas Realizadas

### 2.1 Pruebas Funcionales (Manuales)

#### Backend - Endpoints CRUD

Cada endpoint se probó manualmente verificando:

GET /api/links
- Sin filtros: Retorna todos los marcadores
- Con ?carpeta=1: Filtra por carpeta
- Con ?tag=2: Filtra por tag
- Con ambos filtros: Combina ambas condiciones

POST /api/links
- Con datos válidos: Se crea marcador y retorna ID
- Sin URL: Error 400
- URL inválida: Scraping devuelve error

PUT /api/links/:id
- Con datos válidos: Actualiza y retorna el marcador
- ID inexistente: Error 404
- Datos incompletos → Error 400

DELETE /api/links/:id
- Con ID existente: Elimina y retorna success
- Con ID inexistente: Error 404
- Verificar cascade delete de tags


#### Frontend - Flujos de Usuario


Crear Marcador
- Pegar URL: Se extrae metadatos automáticamente
- Cambiar datos: Se actualizan en tiempo real
- Seleccionar carpeta: Se asigna correctamente
- Seleccionar tags: Se muestran badges de color
- Hacer clic "Crear": Aparece en grid inmediatamente

Filtrado
- Click en carpeta: Se filtran marcadores
- Click en tag: Se filtran marcadores
- Combinación: Se filtran por ambos criterios
- Hacer clic "Todos": Muestra todos nuevamente

Búsqueda
- Escribir en SearchBar: Filtra en tiempo real
- Busca en título: Coincidencias en título
- Busca en descripción: Coincidencias en descripción
- Limpiar: Muestra todos

### 2.2 Pruebas E2E

**Ejemplo 1: Flujo completo de añadir un tag**


1. El Usuario abre localhost:3001
   - Se carga HomePage con estadísticas
   - Sidebar muestra las carpetas y los tags
   - Botón "+" accesible en el Header

2. El Usuario hace clic en el "+"
   - Se abre CreateBookmarkModal
   - Puede escribir URL

3. El Usuario pega la URL: https://github.com/AdrianDiaz24/SmartMark
   - Sistema hace scraping automáticamente
   - Aparece el título y la descripción
   - Se detectan los tags automáticamente (GitHub)

4. El Usuario selecciona carpeta: "Frontend"
   - Se asigna correctamente

5. El Usuario hace clic "Crear"
   - La notificación Toast de operación exitosa aparece
   - El modal se cierra
   - El marcador aparece en grid

6. El Usuario hace clic en tag "#GitHub" en sidebar
   - El grid se filtra mostrando solo marcador con React
   - la URL cambia a ?tag=1

7. El Usuario hace clic en carpeta "Frontend"
   - El Grid se filtra
   - La URL cambia a ?carpeta=2

8. El Usuario busca "SmartMark" en SearchBar
   - El grid se filtra


**Ejemplo 2: Gestión de Carpetas**

1. El Usuario hace clic en "Carpetas" 
   - Navega a /gestionar-carpetas
   - Muestra el sidebar con lista de carpetas

2. El usuario hace clic en carpeta "Frontend"
   - Se muestra información centralizada
   - Puede editar el nombre

3. Usuario hace clic en "Actualizar"
   - El Cambio se guarda
   - El Sidebar se actualiza

4. Usuario hace clic en "Eliminar"
   - El modal de confirmación aparece
   - Al confirmar la carpeta se elimina


### 2.4 Pruebas de Compatibilidad (Manuales)

| Navegador | Versión | Funcionalidad | Estado |
|-----------|---------|---------------|-----|
| Chrome    | 124+    | Completa |  OK |
| Firefox   | 123+    | Completa |  OK |
| Opera GX  | 131+    | Completa |  OK |

---

## 3. Cobertura de Código Alcanzada

**Backend:**
- Controllers (CRUD): todas las rutas principales probadas
- Middleware: CORS, error handler en cada request
- Servicios (scraping, verificación): Probado en su mayoria, el scraping con URLs reales funciona correctamente, el cron job se verifico en un principio pero no se pudo esperar 7 días para verificarlo completamente con la version final
- Base de datos: operaciones CRUD básicas
- Timeouts y reintentos

**Frontend:**
- Components principales: Las paginas funcionan correctamente
- Modales: Fucionan correctamente
- Filtrado/Búsqueda: Funciona correctamente
- Context API: Funciona correctamente

**No cubierto:**
- Casos extremos (URLs especiales, formatos no estándar)
- Tests de carga (rendimiento con muchos marcadores)

---

## 4. Resultados y Estadísticas de las Pruebas

Todas las funcionalidades principales del MVP fueron probadas manualmente en el entorno de desarrollo local y en docker. No se encontraron errores.

Es verdad que es dificil dar un resultado o estadisticas de porcentajes de test exitosos o fallidos, ya que no se utilizó un framework de testing automatizado, pero se puede decir que el 100% de las funcionalidades principales fueron probadas manualmente y funcionaron correctamente.

En cuanto a los test unitarios actualmente se pasan el 100% de los test tanto del backend como del frontend, aunque se han implementado recientemente, se han ido pasando a lo largo de las ultimas implementaciones para verificar el correcto funcionamiento de cada funcionalidad.