# El Gran Planificador — Planificador Educativo por RA

Sistema web de planificación educativa por Resultados de Aprendizaje (RA) para docentes de la **Educación Técnico Profesional de la República Dominicana**.

## ¿Qué es?

Aplicación web de una sola página (SPA) que guía al docente en la creación de planificaciones didácticas estructuradas, el registro de calificaciones, el control de asistencia y la generación de sesiones diarias asistidas por inteligencia artificial. Funciona completamente en el navegador, sin instalación ni servidor.

**URL pública:** [marcosbremont.github.io](https://marcosbremont.github.io)

---

## Características principales

### Planificación por RA (flujo de 5 pasos)
1. **Datos Generales** — Familia profesional, módulo formativo, docente, fechas y horas.
2. **Resultado de Aprendizaje** — Definición del RA con criterios de evaluación.
3. **Elementos de Capacidad (EC)** — Creación, reordenación y edición de ECs con secuencia didáctica (anticipación / construcción / consolidación).
4. **Actividades** — Asignación de actividades a cada EC con instrumento de evaluación (lista de cotejo o rúbrica).
5. **Vista Previa** — Revisión completa de la planificación antes de exportar.

### Libro de Calificaciones
- Gestión de cursos y estudiantes.
- Registro de notas por RA y actividad.
- Cálculo automático de promedios y estado (aprobado / regular / reprobado).
- Exportación a Word (.docx).

### Control de Asistencia
- Registro diario por estudiante (presente / ausente / tardanza / justificado).
- Cálculo de porcentaje de asistencia con umbral configurable.
- Reportes de asistencia exportables a Word y PDF.

### Planificaciones Diarias con IA
- Generación automática de sesiones diarias usando la API de **Groq**.
- Exportación de planificaciones diarias a Word.

### Dashboard
- Vista de clases del día y del día siguiente según el horario configurado.
- Alertas inteligentes de tareas próximas y estado de cursos.
- Accesos rápidos a todos los módulos.

### Otros módulos
| Módulo | Descripción |
|---|---|
| **Mi Horario** | Configuración del horario semanal de clases. |
| **Tareas** | Lista de tareas con fechas de vencimiento y notificaciones. |
| **Mis Notas** | Bloc de notas personal con guardado automático. |
| **Mis Datos** | Exportar / importar toda la información como JSON (backup). |
| **Bitácora** | Registro automático de cambios relevantes realizados en la app. |

---

## Tecnologías

- **HTML5 / CSS3 / JavaScript** puro (sin frameworks).
- **localStorage** para persistencia de todos los datos en el navegador.
- **Groq API** para generación de sesiones diarias con IA (requiere clave propia).
- **docx.js** para exportación a formato Word (.docx).
- **Google Fonts** (Roboto) y **Material Icons**.
- **GitHub Pages** como hosting.

---

## Estructura de archivos

```
/
├── index.html          # Estructura HTML de la SPA (todos los paneles)
├── app.js              # Lógica completa de la aplicación
├── styles.css          # Estilos
├── docx.js             # Librería para generación de archivos Word
├── Metabotlogo.svg     # Logo principal (header)
├── MetaBotLogo.png     # Logo alternativo
└── logo.png / logo1.jpg / logo2.jpg   # Recursos gráficos adicionales
```

---

## Uso

### Para el docente (usuario final)
1. Abrir [marcosbremont.github.io](https://marcosbremont.github.io) en el navegador.
2. Hacer clic en **Nueva Planificación** y seguir los 5 pasos.
3. En el Paso 5 (Vista Previa), exportar a **PDF** o **Word**.
4. Usar el **Dashboard** para el seguimiento diario.

### Para usar la IA (Groq)
1. Obtener una clave API gratuita en [console.groq.com](https://console.groq.com).
2. En la app, ir a **Config. IA** → pegar la clave → Guardar.
3. La clave se guarda localmente y no se envía a ningún servidor externo excepto Groq.

### Backup de datos
- Ir a **Mis Datos** → **Exportar** para descargar un archivo `.json` con toda la información.
- Usar **Importar** para restaurar datos en otro dispositivo o navegador.

---

## Persistencia de datos

Todos los datos se almacenan en el `localStorage` del navegador. Esto significa:

- Los datos son **locales al dispositivo y navegador** donde se usa la app.
- Limpiar el caché o el almacenamiento del navegador **borra todos los datos**.
- Se recomienda hacer **backups periódicos** desde el módulo "Mis Datos".

---

## Desarrollo

El proyecto es un sitio estático alojado en GitHub Pages. No requiere proceso de build.

Para contribuir o modificar:

```bash
git clone https://github.com/MarcosBremont/MarcosBremont.github.io.git
cd MarcosBremont.github.io
# Abrir index.html directamente en el navegador o con un servidor local
npx serve .
```

Los cambios en `main` se publican automáticamente en GitHub Pages.

---

## Licencia

Proyecto de uso educativo desarrollado para docentes del sistema de Educación Técnico Profesional de la República Dominicana.
