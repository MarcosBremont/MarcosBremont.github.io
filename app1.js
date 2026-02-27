function escapeHTML(s) { if(s===null||s===undefined) return ""; return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;"); }

// ─── Funciones de gestión de cursos ───────────────────────────────
function eliminarCurso(id) {
  const curso = calState.cursos[id];
  if (!curso) return;
  if (!confirm(`¿Eliminar el curso "${curso.nombre}" y todas sus calificaciones?`)) return;
  delete calState.cursos[id];
  if (calState.cursoActivoId === id) {
    const ids = Object.keys(calState.cursos);
    calState.cursoActivoId = ids.length ? ids[0] : null;
  }
  guardarCalificaciones();
  renderizarCalificaciones();
  mostrarToast(`Curso eliminado`, 'success');
}

// ─── Funciones de estudiantes ─────────────────────────────────────
function agregarEstudiantes() {
  const raw = document.getElementById('input-estudiantes')?.value || '';
  const nombres = raw.split('\n').map(n => n.trim()).filter(n => n.length > 0);
  if (!nombres.length) { mostrarToast('Escribe al menos un nombre', 'error'); return; }
  const curso = calState.cursos[calState.cursoActivoId];
  if (!curso) { mostrarToast('Selecciona un curso primero', 'error'); return; }
  if (!curso.estudiantes) curso.estudiantes = [];
  nombres.forEach(nombre => {
    curso.estudiantes.push({ id: uid(), nombre });
  });
  guardarCalificaciones();
  if (document.getElementById('input-estudiantes'))
    document.getElementById('input-estudiantes').value = '';
  renderizarTablaCalificaciones();
  mostrarToast(`${nombres.length} estudiante(s) agregado(s)`, 'success');
}

function eliminarEstudiante(estudianteId) {
  const curso = calState.cursos[calState.cursoActivoId];
  if (!curso) return;
  const est = curso.estudiantes.find(e => e.id === estudianteId);
  if (!est) return;
  if (!confirm(`¿Eliminar a "${est.nombre}"?`)) return;
  curso.estudiantes = curso.estudiantes.filter(e => e.id !== estudianteId);
  // Limpiar notas
  if (curso.notas && curso.notas[estudianteId]) delete curso.notas[estudianteId];
  guardarCalificaciones();
  renderizarTablaCalificaciones();
}

function editarNombreEstudiante(estudianteId) {
  const curso = calState.cursos[calState.cursoActivoId];
  if (!curso) return;
  const est = curso.estudiantes.find(e => e.id === estudianteId);
  if (!est) return;
  const nuevoNombre = prompt('Nuevo nombre:', est.nombre);
  if (!nuevoNombre || !nuevoNombre.trim()) return;
  est.nombre = nuevoNombre.trim();
  guardarCalificaciones();
  const el = document.getElementById('nombre-' + estudianteId);
  if (el) el.querySelector('span').textContent = est.nombre;
}

// ─── Helpers de notas ─────────────────────────────────────────────
function _clsNota(nota, max) {
  if (nota === null || nota === undefined) return '';
  const pct = max > 0 ? (nota / max) * 100 : 0;
  if (pct >= 70) return 'nota-aprobado';
  if (pct >= 60) return 'nota-regular';
  return 'nota-reprobado';
}

function _clsProm(prom) {
  if (prom === null || prom === undefined) return '';
  if (prom >= 70) return 'prom-aprobado';
  if (prom >= 60) return 'prom-regular';
  return 'prom-reprobado';
}

function _calcNotaRA(curso, estudianteId, raKey) {
  const raInfo = curso.ras?.[raKey];
  if (!raInfo) return null;
  const notasEst = curso.notas?.[estudianteId]?.[raKey] || {};
  let total = 0, hayNotas = false;
  raInfo.actividades.forEach(actId => {
    const n = notasEst[actId];
    if (n !== undefined && n !== null) { total += n; hayNotas = true; }
  });
  return hayNotas ? Math.round(total * 10) / 10 : null;
}

function _calcNotaFinal(curso, estudianteId) {
  const rasKeys = Object.keys(curso.ras || {});
  if (!rasKeys.length) return null;
  let total = 0, hayNotas = false;
  rasKeys.forEach(rk => {
    const n = _calcNotaRA(curso, estudianteId, rk);
    if (n !== null) { total += n; hayNotas = true; }
  });
  return hayNotas ? Math.round(total * 10) / 10 : null;
}

function _promedioColRA(curso, raKey) {
  if (!curso.estudiantes?.length) return null;
  const notas = curso.estudiantes
    .map(e => _calcNotaRA(curso, e.id, raKey))
    .filter(n => n !== null);
  if (!notas.length) return null;
  return Math.round((notas.reduce((s, n) => s + n, 0) / notas.length) * 10) / 10;
}

function _promedioFinal(curso) {
  if (!curso.estudiantes?.length) return null;
  const notas = curso.estudiantes
    .map(e => _calcNotaFinal(curso, e.id))
    .filter(n => n !== null);
  if (!notas.length) return null;
  return Math.round((notas.reduce((s, n) => s + n, 0) / notas.length) * 10) / 10;
}

function _actualizarFilaRA(estudianteId, raKey) {
  const curso = calState.cursos[calState.cursoActivoId];
  if (!curso) return;
  const notaRA = _calcNotaRA(curso, estudianteId, raKey);
  const raInfo = curso.ras?.[raKey];
  const el = document.getElementById(`total-ra-${estudianteId}-${raKey}`);
  if (el) {
    el.textContent = notaRA !== null ? notaRA.toFixed(1) : '—';
    el.className = 'td-total-ra ' + _clsNota(notaRA, raInfo?.valorTotal || 100);
  }
  const notaFinal = _calcNotaFinal(curso, estudianteId);
  const elFinal = document.getElementById(`final-${estudianteId}`);
  if (elFinal) {
    elFinal.textContent = notaFinal !== null ? notaFinal.toFixed(1) : '—';
    elFinal.className = 'td-promedio ' + _clsProm(notaFinal);
  }
}

function _actualizarFooterRA(raKey) {
  const curso = calState.cursos[calState.cursoActivoId];
  if (!curso) return;
  renderizarTablaCalificaciones(); // re-render completo del footer
}



/**



 * ================================================================



 * PLANIFICADOR EDUCATIVO POR RESULTADOS DE APRENDIZAJE (RA)



 * Sistema para Docentes de Educación Técnico Profesional



 * República Dominicana



 * ================================================================



 *



 * INSTRUCCIONES DE DESPLIEGUE EN GITHUB PAGES:



 * 1. Crea un repositorio en GitHub (ej: planificador-ra)



 * 2. Sube los 3 archivos: index.html, styles.css, app.js



 * 3. Ve a Settings > Pages > Source: "Deploy from a branch"



 * 4. Selecciona la rama "main" y la carpeta "/ (root)"



 * 5. Haz clic en Save. Tu app estará en:



 *    https://tu-usuario.github.io/planificador-ra/



 *



 * También funciona en Netlify arrastrando la carpeta, o



 * abriendo index.html directamente en el navegador.



 * ================================================================



 */







'use strict';







// ================================================================



// --- SECCIÓ?oN: DATOS GLOBALES ---



// ================================================================







/** Banco de verbos de Bloom por nivel taxonómico */



const verbosBloom = {



  conocimiento: ["identificar", "reconocer", "listar", "definir", "nombrar", "recordar", "enunciar", "señalar", "mencionar", "describir brevemente", "clasificar básicamente"],



  comprension: ["explicar", "describir", "interpretar", "resumir", "clasificar", "comparar", "relacionar", "distinguir", "inferir", "parafrasear", "ilustrar", "traducir"],



  aplicacion: ["aplicar", "demostrar", "utilizar", "resolver", "ejecutar", "implementar", "desarrollar", "construir", "diseñar", "producir", "calcular", "experimentar"],



  actitudinal: ["valorar", "asumir", "comprometerse", "respetar", "reflexionar", "demostrar actitud hacia", "mostrar", "apreciar", "participar activamente", "colaborar", "integrar", "promover"]



};







/** Plantillas de secuencia didáctica por nivel */



const plantillasSecuencia = {



  conocimiento: {



    anticipacion: { nombre: "Anticipación", descripcion: "Activar conocimientos previos mediante preguntas detonadoras o lluvia de ideas sobre el tema.", pct: 20 },



    construccion: { nombre: "Construcción", descripcion: "Exposición conceptual con apoyo visual, lectura guiada de materiales y elaboración de mapas conceptuales.", pct: 55 },



    consolidacion: { nombre: "Consolidación", descripcion: "Cuestionario de verificación, elaboración de glosario y retroalimentación grupal.", pct: 25 }



  },



  comprension: {



    anticipacion: { nombre: "Anticipación", descripcion: "Presentar un caso o situación problemática para generar discusión y conectar con el RA.", pct: 15 },



    construccion: { nombre: "Construcción", descripcion: "Análisis de ejemplos comparativos, discusión dirigida y elaboración de esquemas explicativos.", pct: 60 },



    consolidacion: { nombre: "Consolidación", descripcion: "Elaboración de resumen propio, exposición breve y autoevaluación mediante lista de cotejo.", pct: 25 }



  },



  aplicacion: {



    anticipacion: { nombre: "Anticipación", descripcion: "Plantear una situación real del campo profesional que requiera solución práctica.", pct: 10 },



    construccion: { nombre: "Construcción", descripcion: "Demostración del docente, práctica guiada paso a paso, resolución de ejercicios reales.", pct: 65 },



    consolidacion: { nombre: "Consolidación", descripcion: "Presentación de resultado, coevaluación mediante rúbrica y reflexión sobre el proceso.", pct: 25 }



  },



  actitudinal: {



    anticipacion: { nombre: "Anticipación", descripcion: "Reflexión personal sobre valores y actitudes relacionadas con el ámbito profesional.", pct: 20 },



    construccion: { nombre: "Construcción", descripcion: "Trabajo colaborativo, análisis de casos éticos, debate argumentado y role-playing.", pct: 50 },



    consolidacion: { nombre: "Consolidación", descripcion: "Diario reflexivo, compromiso escrito y retroalimentación formativa grupal.", pct: 30 }



  }



};







/** Criterios y descriptores para instrumentos según nivel */



const criteriosInstrumento = {



  conocimiento: [



    "Identifica correctamente los conceptos fundamentales del tema",



    "Nombra y define los términos técnicos con precisión",



    "Enumera los elementos principales según el contenido estudiado",



    "Reconoce las características esenciales del objeto de estudio",



    "Recuerda y reproduce la información de manera organizada"



  ],



  comprension: [



    "Explica con sus propias palabras el concepto o proceso",



    "Establece relaciones entre los elementos del tema",



    "Distingue las diferencias y similitudes entre conceptos",



    "Interpreta correctamente la información presentada",



    "Resume el contenido conservando las ideas principales"



  ],



  aplicacion: [



    "Ejecuta el procedimiento siguiendo los pasos correctamente",



    "Aplica los conceptos teóricos en situaciones prácticas reales",



    "Utiliza las herramientas y recursos de manera adecuada",



    "Resuelve la situación planteada de forma efectiva",



    "Produce un resultado que cumple con las especificaciones requeridas"



  ],



  actitudinal: [



    "Muestra disposición positiva ante los retos del aprendizaje",



    "Respeta las normas de convivencia y trabajo colaborativo",



    "Asume responsabilidad por su propio proceso de aprendizaje",



    "Valora la importancia de la ética profesional en el campo técnico",



    "Demuestra compromiso y puntualidad en la entrega de trabajos"



  ]



};







/** Estado global de la planificación */



let planificacion = {



  datosGenerales: {},



  ra: { descripcion: '', criterios: '', recursos: '', nivelBloom: '' },



  elementosCapacidad: [],



  actividades: [],



  fechasClase: [],



  horasTotal: 0,



  semanas: 0



};







// ================================================================



// --- SECCIÓ?oN: SERVICIOS – ANÁLISIS Y GENERACIÓ?oN ---



// ================================================================







/**



 * Analiza el texto del RA y detecta su nivel dominante en Bloom



 * @param {string} texto - Descripción del RA



 * @returns {string} nivel - 'conocimiento'|'comprension'|'aplicacion'|'actitudinal'



 */



function analizarNivelBloom(texto) {



  const t = texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");



  const puntajes = { conocimiento: 0, comprension: 0, aplicacion: 0, actitudinal: 0 };







  // Puntuar cada nivel según verbos encontrados



  for (const [nivel, verbos] of Object.entries(verbosBloom)) {



    for (const verbo of verbos) {



      // Normalizar verbo también



      const vNorm = verbo.normalize("NFD").replace(/[\u0300-\u036f]/g, "");



      if (t.includes(vNorm)) {



        puntajes[nivel] += nivel === 'actitudinal' ? 2 : 1; // actitudinal con mayor peso



      }



    }



  }







  // Determinar nivel dominante



  const niveles = Object.entries(puntajes);



  let dominante = niveles.reduce((max, cur) => cur[1] > max[1] ? cur : max, ['aplicacion', 0]);







  // Si no se detectó ningún verbo, inferir por palabras clave



  if (dominante[1] === 0) {



    if (t.includes("desarrollar") || t.includes("construir") || t.includes("producir") || t.includes("implementar")) return 'aplicacion';



    if (t.includes("explicar") || t.includes("comparar") || t.includes("relacionar")) return 'comprension';



    if (t.includes("valorar") || t.includes("comprometer") || t.includes("respetar")) return 'actitudinal';



    return 'aplicacion'; // defecto: aplicación para módulos técnicos



  }







  return dominante[0];



}







/**



 * Extrae palabras clave del RA para construir los EC



 * @param {string} ra - Descripción del RA



 * @returns {string[]} palabras clave relevantes



 */



function extraerPalabrasClave(ra) {
  // Stopwords ampliadas (incluye verbos en infinitivo comunes)
  const stopwords = new Set([
    // articulos / preposiciones / conjunciones
    'el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas', 'y', 'o', 'de', 'del', 'al',
    'en', 'con', 'por', 'para', 'que', 'se', 'su', 'sus', 'es', 'son', 'ser', 'esta',
    'este', 'como', 'más', 'mas', 'mediante', 'través', 'traves', 'a', 'e', 'u',
    'hay', 'dicho', 'dichos', 'dichas', 'dicha', 'cuyo', 'cuya', 'cuyos', 'cuyas',
    'según', 'segun', 'cuanto', 'cuanta', 'cuantos', 'cuantas', 'todo', 'toda',
    'todos', 'todas', 'cada', 'otro', 'otra', 'otros', 'otras', 'mismo', 'misma',
    // verbos infinitivos muy frecuentes (a filtrar)
    'identificar', 'reconocer', 'aplicar', 'analizar', 'explicar', 'valorar',
    'evaluar', 'demostrar', 'utilizar', 'ejecutar', 'implementar', 'desarrollar',
    'realizar', 'efectuar', 'llevar', 'hacer', 'tener', 'poder', 'deber', 'saber',
    'conocer', 'comprender', 'interpretar', 'relacionar', 'comparar', 'definir',
    'describir', 'establecer', 'determinar', 'calcular', 'diseñar', 'disenar',
    'planificar', 'organizar', 'gestionar', 'administrar', 'controlar',
    // palabras genéricas poco útiles para el enunciado
    'manera', 'forma', 'modo', 'medio', 'tipo', 'nivel', 'proceso', 'procedimiento',
    'actividad', 'tarea', 'trabajo', 'campo', 'área', 'area', 'técnicas', 'tecnicas',
    'herramientas', 'herramienta', 'situaciones', 'situacion', 'situaciones',
    'general', 'generales', 'básico', 'basico', 'específico', 'especifico',
    'correspondencia', 'referencia', 'materiales', 'material', 'fuentes', 'fuente',
    'análisis', 'analisis', 'síntesis', 'sintesis', 'criterios', 'criterio',
    'mediante', 'través', 'partir', 'base', 'marco', 'acuerdo', 'relación'
  ]);

  // Extraer solo tokens de 4+ letras que no sean stopwords
  const tokens = ra
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')   // quitar acentos para comparar
    .replace(/[.,;:()\[\]{}'"\-!?]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length >= 4 && !stopwords.has(w) && !stopwords.has(w + 'r'));

  // Devolver maximo 5 tokens únicos
  return [...new Set(tokens)].slice(0, 5);
}







/**



 * Genera los 4 Elementos de Capacidad a partir del RA y criterios



 * @param {string} ra - Descripción del RA



 * @param {string} criterios - Criterios de referencia (uno por línea)



 * @param {object} datos - Datos generales para contextualizar



 * @returns {Array} Lista de 4 objetos EC



 */



function generarElementosCapacidad(ra, criterios, datos) {
  // Extraer núcleo temático del RA (frase más importante)
  // Tomar la primera oración completa, limpiar y recortar
  const raLimpio = (ra || '').trim().replace(/\s+/g, ' ');

  // Extraer el objeto directo del RA (lo que está después del primer verbo)
  // Generalmente: "Reconocer UN SISTEMA DE GESTIÓN DE SEGURIDAD..."
  const matchObjeto = raLimpio.match(
    /^[A-ZÁÉÍÓÚÜÑ][a-záéíóúüñ]+(?:\s+[a-záéíóúüñ]+)?\s+(.{10,80})(?:[,.]|$)/
  );
  const objetoRA = matchObjeto
    ? matchObjeto[1].replace(/,.*$/, '').trim()
    : raLimpio.split(/[,;.]/)[0].replace(/^[A-ZÁÉÍÓÚÜÑ][a-záéíóúüñ]+\s+/, '').trim().substring(0, 70);

  // Parsear los Criterios de Evaluación (uno por línea)
  const listaCE = (criterios || '').split('\n')
    .map(c => c.trim())
    .filter(c => c.length > 5);

  // Asignar criterios a cada EC
  function getCE(idx) {
    if (listaCE[idx]) return listaCE[idx];
    if (listaCE[0]) return listaCE[0];
    return 'los criterios del módulo';
  }

  // Contexto del módulo
  const modulo = (datos.moduloFormativo || 'el módulo formativo').toLowerCase();

  // Condiciones pedagógicas por nivel
  const condiciones = {
    conocimiento: 'mediante el análisis de materiales curriculares y fuentes técnicas especializadas',
    comprension: 'a través del análisis comparativo de casos reales relacionados con el entorno profesional',
    aplicacion: 'utilizando herramientas y técnicas apropiadas en situaciones prácticas del ámbito laboral',
    actitudinal: 'asumiendo una actitud reflexiva, comprometida y ética ante su práctica profesional'
  };

  const ec = [
    {
      codigo: 'E.C.1.1.1',
      nivel: 'conocimiento',
      nivelBloom: 'conocimiento',
      verbo: 'Identificar',
      enunciado: `Identificar ${objetoRA}, ${condiciones.conocimiento}, en correspondencia con ${getCE(0)}.`,
      horasAsignadas: 0,
      secuencia: plantillasSecuencia.conocimiento
    },
    {
      codigo: 'E.C.2.1.1',
      nivel: 'comprension',
      nivelBloom: 'comprension',
      verbo: 'Explicar',
      enunciado: `Explicar los elementos, relaciones y responsabilidades asociadas a ${objetoRA}, ${condiciones.comprension}, en correspondencia con ${getCE(1)}.`,
      horasAsignadas: 0,
      secuencia: plantillasSecuencia.comprension
    },
    {
      codigo: 'E.C.3.1.1',
      nivel: 'aplicacion',
      nivelBloom: 'aplicacion',
      verbo: 'Aplicar',
      enunciado: `Aplicar los procedimientos y mecanismos de ${objetoRA}, ${condiciones.aplicacion}, en correspondencia con ${getCE(2)}.`,
      horasAsignadas: 0,
      secuencia: plantillasSecuencia.aplicacion
    },
    {
      codigo: 'E.C.4.1.1',
      nivel: 'actitudinal',
      nivelBloom: 'actitudinal',
      verbo: 'Valorar',
      enunciado: `Valorar la importancia ética y profesional de ${objetoRA}, ${condiciones.actitudinal}, en correspondencia con ${getCE(3)}.`,
      horasAsignadas: 0,
      secuencia: plantillasSecuencia.actitudinal
    }
  ];

  return ec;
}







/**



 * Calcula todas las fechas reales de clase entre inicio y fin



 * según los días seleccionados



 * @param {object} diasConfig - { lunes: {horas:2}, martes: {horas:3}, ... }



 * @param {string} fechaInicio - 'YYYY-MM-DD'



 * @param {string} fechaFin - 'YYYY-MM-DD'



 * @returns {Array} Lista de { fecha: Date, dia: string, horas: number }



 */



function calcularFechasClase(diasConfig, fechaInicio, fechaFin) {



  const mapaDia = { domingo: 0, lunes: 1, martes: 2, miercoles: 3, jueves: 4, viernes: 5, sabado: 6 };



  const diasActivos = Object.entries(diasConfig)



    .filter(([, cfg]) => cfg.activo)



    .map(([dia, cfg]) => ({ numeroDia: mapaDia[dia], nombreDia: dia, horas: cfg.horas }));







  if (diasActivos.length === 0) return [];







  const inicio = new Date(fechaInicio + 'T00:00:00');



  const fin = new Date(fechaFin + 'T00:00:00');



  const fechas = [];



  const cursor = new Date(inicio);







  while (cursor <= fin) {



    const diaSemana = cursor.getDay();



    const diaConf = diasActivos.find(d => d.numeroDia === diaSemana);



    if (diaConf) {



      fechas.push({



        fecha: new Date(cursor),



        dia: diaConf.nombreDia,



        horas: diaConf.horas,



        fechaStr: cursor.toLocaleDateString('es-DO', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })



      });



    }



    cursor.setDate(cursor.getDate() + 1);



  }



  return fechas;



}







/**



 * Distribuye las horas totales entre los 4 EC



 * Proporciones: conocimiento 20%, comprension 25%, aplicacion 40%, actitudinal 15%



 * @param {number} horasTotal



 * @param {Array} ec - lista de EC



 * @returns {Array} EC con horasAsignadas actualizadas



 */



function distribuirHoras(horasTotal, ec) {



  const proporciones = [0.20, 0.25, 0.40, 0.15];



  return ec.map((e, i) => ({



    ...e,



    horasAsignadas: Math.round(horasTotal * proporciones[i])



  }));



}







/**



 * Calcula semanas entre dos fechas



 */



function calcularSemanas(fechaInicio, fechaFin) {



  const ms = new Date(fechaFin) - new Date(fechaInicio);



  return Math.ceil(ms / (1000 * 60 * 60 * 24 * 7));



}







// ================================================================



// --- SECCIÓ?oN: SERVICIOS – ACTIVIDADES ---



// ================================================================







/**



 * Genera las actividades por EC con fechas reales de clase



 * @param {Array} listaEC - Elementos de Capacidad



 * @param {Array} fechasClase - Fechas calculadas



 * @returns {Array} Lista de actividades



 */



function generarActividades(listaEC, fechasClase) {



  if (fechasClase.length === 0) return [];







  const actividades = [];



  // Distribuir fechas equitativamente entre los 4 EC (máx 2 por EC)



  const totalFechas = fechasClase.length;



  // Calcular índices de asignación proporcional



  const porcentajes = [0.20, 0.25, 0.40, 0.15]; // mismo que horas



  let cursor = 0;







  listaEC.forEach((ec, idxEC) => {



    // Número de actividades para este EC (1 o 2)



    const numActs = ec.nivel === 'actitudinal' ? 1 : 2;



    const plantillasActs = obtenerPlantillasActividad(ec);







    for (let i = 0; i < numActs; i++) {



      const fechaObj = fechasClase[cursor % totalFechas];



      cursor++;



      const act = {



        id: `ACT-${idxEC + 1}-${i + 1}`,



        ecCodigo: ec.codigo,



        ecNivel: ec.nivel,



        enunciado: plantillasActs[i],



        fecha: fechaObj.fecha,



        fechaStr: fechaObj.fechaStr,



        horas: fechaObj.horas,



        instrumento: null // se genera después



      };



      act.instrumento = generarInstrumento(act, ec.nivel);



      actividades.push(act);



    }



  });







  return actividades;



}







/**



 * Genera los enunciados de actividad según el nivel del EC



 */



function obtenerPlantillasActividad(ec) {
  // Extraer el objeto directo del EC (tras el verbo inicial)
  const enunciado = ec.enunciado || '';
  const matchObj = enunciado.match(/^[A-ZÁÉÍÓÚÜÑ][a-záéíóúüñ]+\s+(.+?),/);
  let campo = matchObj
    ? matchObj[1].trim()
    : enunciado.replace(/^[A-ZÁÉÍÓÚÜÑ][a-záéíóúüñ]+\s+/, '').split(',')[0].trim();

  // Limitar longitud
  if (campo.length > 60) {
    campo = campo.substring(0, 57) + '...';
  }

  const mapActividades = {
    conocimiento: [
      `Cuestionario escrito: Identificación y definición de los conceptos clave relacionados con ${campo}`,
      `Elaboración de mapa conceptual: Representación gráfica de los fundamentos y elementos de ${campo}`
    ],
    comprension: [
      `Exposición oral breve: Explicación comparativa de los procesos y responsabilidades de ${campo}`,
      `Análisis de caso: Interpretación de situaciones reales vinculadas a ${campo}`
    ],
    aplicacion: [
      `Práctica supervisada: Aplicación de procedimientos de ${campo} en situaciones del entorno laboral`,
      `Proyecto integrador: Diseño y presentación de solución técnica demostrando dominio de ${campo}`
    ],
    actitudinal: [
      `Reflexión y portafolio: Valoración crítica de la práctica profesional ética relacionada con ${campo}`
    ]
  };

  return mapActividades[ec.nivel] || [`Actividad aplicada: Demostración de competencias de ${campo}`];
}







// ================================================================



// --- SECCIÓ?oN: SERVICIOS – INSTRUMENTOS ---



// ================================================================







/**



 * Determina y genera el instrumento de evaluación para una actividad



 * @param {object} actividad



 * @param {string} nivelEC



 * @returns {object} instrumento



 */



function generarInstrumento(actividad, nivelEC, tipoForzado) {
  const tipo = tipoForzado
    || actividad?.instrumento?.tipo
    || ((nivelEC === 'conocimiento' || nivelEC === 'comprension') ? 'cotejo' : 'rubrica');
  return tipo === 'cotejo'
    ? generarListaCotejo(actividad, nivelEC)
    : generarRubrica(actividad, nivelEC);
}







/**



 * Genera una Lista de Cotejo para actividades de conocimiento/comprensión



 */



function generarListaCotejo(actividad, nivel) {



  const criterios = criteriosInstrumento[nivel] || criteriosInstrumento.conocimiento;



  return {



    tipo: 'cotejo',



    tipoLabel: 'Lista de Cotejo',



    titulo: `Lista de Cotejo – ${actividad.enunciado.split(':')[0]}`,



    actividad: actividad.enunciado,



    ecCodigo: actividad.ecCodigo,



    criterios: criterios.map((c, i) => ({



      numero: i + 1,



      indicador: c,



      logrado: false,



      noLogrado: false,



      observacion: ''



    })),



    escala: ['Logrado', 'No Logrado'],



    puntaje: 100,



    instrucciones: 'Marque con una ✓ en la casilla correspondiente según la observación del desempeño del estudiante durante la actividad.'



  };



}







/**



 * Genera una Rúbrica de evaluación para actividades de aplicación/actitudinal



 */



function generarRubrica(actividad, nivel) {



  const criterios = criteriosInstrumento[nivel] || criteriosInstrumento.aplicacion;



  const niveles = [



    { nombre: 'Excelente', puntos: 4, clase: 'nivel-excelente', descripcionSufijo: 'de manera excepcional, superando las expectativas' },



    { nombre: 'Bueno', puntos: 3, clase: 'nivel-bueno', descripcionSufijo: 'de manera satisfactoria, cumpliendo las expectativas' },



    { nombre: 'En proceso', puntos: 2, clase: 'nivel-proceso', descripcionSufijo: 'de manera parcial, con algunas deficiencias observadas' },



    { nombre: 'Insuficiente', puntos: 1, clase: 'nivel-insuficiente', descripcionSufijo: 'de manera inadecuada, sin alcanzar los criterios mínimos' }



  ];







  return {



    tipo: 'rubrica',



    tipoLabel: 'Rúbrica de Evaluación',



    titulo: `Rúbrica – ${actividad.enunciado.split(':')[0]}`,



    actividad: actividad.enunciado,



    ecCodigo: actividad.ecCodigo,



    niveles,



    criterios: criterios.map((c, i) => ({



      numero: i + 1,



      criterio: c,



      descriptores: niveles.map(n => `${c} ${n.descripcionSufijo}.`)



    })),



    puntajeMax: criterios.length * 4,



    instrucciones: 'Seleccione el nivel de desempeño alcanzado por el estudiante en cada criterio de evaluación.'



  };



}







// ================================================================



// --- SECCIÓN: UI ?" RENDERIZADO DE ELEMENTOS DE CAPACIDAD ---



// ================================================================







/**



 * Renderiza las tarjetas editables de EC en el paso 3



 * @param {Array} listaEC



 */





// ════════════════════════════════════════════════════════════════════
// AGREGAR NUEVO ELEMENTO DE CAPACIDAD
// ════════════════════════════════════════════════════════════════════
function _agregarNuevoEC() {
  const ecs = planificacion.elementosCapacidad || [];

  // Sugerir el siguiente código automáticamente
  const ultimoCod = ecs.length
    ? ecs[ecs.length - 1].codigo  // e.g. "E.C.3.1.1"
    : 'E.C.1.1.1';
  // Incrementar el primer número del EC (1→2→3...)
  const partes = ultimoCod.replace('E.C.','').split('.');
  const siguiente = `E.C.${parseInt(partes[0]||1)+1}.${partes[1]||1}.${partes[2]||1}`;

  const NIVELES = [
    { val:'conocimiento', label:'Conocimiento' },
    { val:'comprension',  label:'Comprensión'  },
    { val:'aplicacion',   label:'Aplicación'   },
    { val:'actitudinal',  label:'Actitudinal'  },
  ];
  const optsNivel = NIVELES.map(n =>
    `<option value="${n.val}">${n.label}</option>`
  ).join('');

  document.getElementById('modal-title').textContent = 'Nuevo Elemento de Capacidad';
  document.getElementById('modal-body').innerHTML = `
    <div style="display:flex;flex-direction:column;gap:14px;">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
        <div>
          <label style="font-size:0.78rem;font-weight:700;color:#424242;display:block;margin-bottom:5px;">Código EC</label>
          <input type="text" id="nuevo-ec-codigo" value="${siguiente}"
            style="width:100%;padding:9px 12px;border:1.5px solid #90CAF9;border-radius:8px;font-size:0.95rem;font-weight:700;font-family:monospace;">
        </div>
        <div>
          <label style="font-size:0.78rem;font-weight:700;color:#424242;display:block;margin-bottom:5px;">Nivel Bloom</label>
          <select id="nuevo-ec-nivel"
            style="width:100%;padding:9px 12px;border:1.5px solid #90CAF9;border-radius:8px;font-size:0.88rem;">
            ${optsNivel}
          </select>
        </div>
      </div>
      <div>
        <label style="font-size:0.78rem;font-weight:700;color:#424242;display:block;margin-bottom:5px;">Enunciado del EC</label>
        <textarea id="nuevo-ec-enunciado" rows="3"
          placeholder="Describe el elemento de capacidad..."
          style="width:100%;padding:10px 12px;border:1.5px solid #90CAF9;border-radius:8px;font-size:0.88rem;font-family:inherit;resize:vertical;"></textarea>
      </div>
      <div>
        <label style="font-size:0.78rem;font-weight:700;color:#424242;display:block;margin-bottom:5px;">Horas asignadas</label>
        <input type="number" id="nuevo-ec-horas" value="2" min="1" max="40" step="0.5"
          style="width:100px;padding:9px 12px;border:1.5px solid #90CAF9;border-radius:8px;font-size:0.88rem;">
      </div>
      <div style="display:flex;gap:8px;justify-content:flex-end;padding-top:8px;border-top:1px solid #E0E0E0;">
        <button class="btn-secundario" onclick="cerrarModalBtn()">Cancelar</button>
        <button class="btn-siguiente" onclick="_confirmarNuevoEC()">
          <span class="material-icons">add</span> Agregar EC
        </button>
      </div>
    </div>`;
  _usarFooterDinamico('');
  document.getElementById('modal-overlay').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  setTimeout(() => document.getElementById('nuevo-ec-enunciado')?.focus(), 80);
}

function _confirmarNuevoEC() {
  const codigo    = document.getElementById('nuevo-ec-codigo')?.value?.trim();
  const nivel     = document.getElementById('nuevo-ec-nivel')?.value || 'aplicacion';
  const enunciado = document.getElementById('nuevo-ec-enunciado')?.value?.trim();
  const horas     = parseFloat(document.getElementById('nuevo-ec-horas')?.value) || 2;

  if (!codigo)    { mostrarToast('Ingresa el código del EC', 'error'); return; }
  if (!enunciado || enunciado.length < 5) { mostrarToast('Escribe el enunciado del EC', 'error'); return; }

  const nuevoEC = {
    codigo,
    nivel,
    nivelBloom: nivel,
    enunciado,
    horasAsignadas: horas,
    secuencia: {
      anticipacion: { pct: 20, descripcion: 'Activación de conocimientos previos mediante preguntas detonantes.' },
      construccion:  { pct: 60, descripcion: 'Desarrollo del contenido con actividades prácticas.' },
      consolidacion: { pct: 20, descripcion: 'Síntesis, evaluación formativa y retroalimentación.' },
    }
  };

  if (!planificacion.elementosCapacidad) planificacion.elementosCapacidad = [];
  planificacion.elementosCapacidad.push(nuevoEC);
  guardarBorrador();
  cerrarModalBtn();
  renderizarEC(planificacion.elementosCapacidad);
  renderizarActividades(planificacion.actividades);
  mostrarToast(`EC ${codigo} agregado ✓ — Ve al paso 4 para agregar actividades`, 'success');
}

function renderizarEC(listaEC) {



  const contenedor = document.getElementById('ec-container');



  contenedor.innerHTML = '';







  listaEC.forEach((ec, idx) => {



    const nombreNivel = { conocimiento: 'Conocimiento', comprension: 'Comprensión', aplicacion: 'Aplicación', actitudinal: 'Actitudinal' }[ec.nivel];



    const secuencia = ec.secuencia;







    const card = document.createElement('div');



    card.className = `ec-card nivel-${ec.nivel}`;



    card.setAttribute('data-idx', idx);







    card.innerHTML = `



      <div class="ec-card-header">



        <span class="ec-codigo ec-codigo-editable" onclick="_editarCodigoEC(${idx})" title="Editar código EC">${ec.codigo} <span class="material-icons" style="font-size:12px;vertical-align:middle;opacity:0.5;">edit</span></span>



        <span class="ec-chip chip-${ec.nivel} ec-nivel-editable" onclick="_editarNivelEC(${idx}, this)" title="Cambiar nivel Bloom">${nombreNivel} <span class="material-icons" style="font-size:12px;vertical-align:middle;opacity:0.7;">arrow_drop_down</span></span>



        <span class="ec-horas"><span class="material-icons">schedule</span> ${ec.horasAsignadas}h</span>



      </div>



      <div



        class="ec-texto"



        contenteditable="true"



        id="ec-texto-${idx}"



        data-idx="${idx}"



        spellcheck="true"



        title="Haz clic para editar"



      >${ec.enunciado}</div>



      <div class="ec-edit-hint"><span class="material-icons">edit</span> Haz clic en el texto para editar</div>



      <div class="ec-secuencia">



        <div class="ec-secuencia-title">Secuencia Didáctica</div>



        <div class="momento-item">



          <span class="momento-label">?? Anticipación (${secuencia.anticipacion.pct}%):</span>



          <span>${secuencia.anticipacion.descripcion}</span>



        </div>



        <div class="momento-item">



          <span class="momento-label">?? Construcción (${secuencia.construccion.pct}%):</span>



          <span>${secuencia.construccion.descripcion}</span>



        </div>



        <div class="momento-item">



          <span class="momento-label">? Consolidación (${secuencia.consolidacion.pct}%):</span>



          <span>${secuencia.consolidacion.descripcion}</span>



        </div>



      </div>



    `;



    contenedor.appendChild(card);







    // Guardar ediciones en el estado global



    const textoDiv = card.querySelector('.ec-texto');



    textoDiv.addEventListener('input', () => {



      planificacion.elementosCapacidad[idx].enunciado = textoDiv.innerText.trim();



      guardarBorrador();



    });

/** Guarda un momento de la secuencia didáctica al editar inline */
function _guardarMomento(el) {
  const idx     = parseInt(el.dataset.idx);
  const momento = el.dataset.momento;
  const valor   = el.innerText.trim();
  if (!isNaN(idx) && momento && planificacion.elementosCapacidad?.[idx]?.secuencia) {
    planificacion.elementosCapacidad[idx].secuencia[momento].descripcion = valor;
    guardarBorrador();
  }
}




  });







  // Mostrar resumen de distribución



  const resumen = document.getElementById('resumen-distribucion');



  resumen.classList.remove('hidden');



  document.getElementById('total-horas-display').textContent = planificacion.horasTotal + ' hrs';



  const _semCalc = (() => {
    const dg = planificacion.datosGenerales || {};
    if (dg.fechaInicio && dg.fechaTermino) {
      const n = calcularSemanas(dg.fechaInicio, dg.fechaTermino);
      if (!isNaN(n) && n > 0) return n;
    }
    return planificacion.semanas && !isNaN(planificacion.semanas) ? planificacion.semanas : '?';
  })();
  document.getElementById('total-semanas-display').textContent = _semCalc + ' sem';



  document.getElementById('horas-por-ec-display').textContent =



    Math.round(planificacion.horasTotal / 4) + ' hrs';



}







// ================================================================



// --- SECCIÓN: UI ?" RENDERIZADO DE ACTIVIDADES ---



// ================================================================







/**



 * Renderiza la tabla de actividades en el paso 4



 * @param {Array} listaActividades



 */




// ════════════════════════════════════════════════════════════════════
// EDICIÓN DE EC: NIVEL BLOOM + CÓDIGO
// ════════════════════════════════════════════════════════════════════

function _editarNivelEC(idx, chipEl) {
  const ec = planificacion.elementosCapacidad[idx];
  if (!ec) return;
  // Si ya hay un dropdown abierto, cerrarlo
  document.querySelectorAll('.ec-nivel-dropdown').forEach(d => d.remove());

  const NIVELES = [
    { val: 'conocimiento', label: 'Conocimiento', color: '#1565C0' },
    { val: 'comprension',  label: 'Comprensión',  color: '#2E7D32' },
    { val: 'aplicacion',   label: 'Aplicación',   color: '#E65100' },
    { val: 'actitudinal',  label: 'Actitudinal',  color: '#6A1B9A' },
  ];

  const dropdown = document.createElement('div');
  dropdown.className = 'ec-nivel-dropdown';
  dropdown.innerHTML = NIVELES.map(n =>
    `<div class="ec-nivel-opt ${ec.nivel === n.val ? 'activo' : ''}"
       style="color:${n.color};"
       onclick="_aplicarNivelEC(${idx}, '${n.val}', '${n.label}')">
       ${ec.nivel === n.val ? '✓ ' : ''}${n.label}
     </div>`
  ).join('');

  // Posicionar relativo al chip
  const rect = chipEl.getBoundingClientRect();
  dropdown.style.cssText = `position:fixed;top:${rect.bottom+4}px;left:${rect.left}px;z-index:9999;
    background:#fff;border:1.5px solid #E0E0E0;border-radius:10px;box-shadow:0 8px 24px rgba(0,0,0,0.15);
    padding:6px;min-width:140px;`;
  document.body.appendChild(dropdown);

  // Cerrar al hacer click fuera
  setTimeout(() => {
    document.addEventListener('click', function _close(e) {
      if (!dropdown.contains(e.target)) { dropdown.remove(); document.removeEventListener('click', _close); }
    });
  }, 10);
}

function _aplicarNivelEC(idx, nuevoNivel, label) {
  document.querySelectorAll('.ec-nivel-dropdown').forEach(d => d.remove());
  const ec = planificacion.elementosCapacidad[idx];
  if (!ec) return;
  ec.nivel = nuevoNivel;
  ec.nivelBloom = nuevoNivel;
  guardarBorrador();
  renderizarEC(planificacion.elementosCapacidad);
  mostrarToast(`Nivel cambiado a ${label}`, 'success');
}

function _editarCodigoEC(idx) {
  const ec = planificacion.elementosCapacidad[idx];
  if (!ec) return;

  document.getElementById('modal-title').textContent = 'Editar código del EC';
  document.getElementById('modal-body').innerHTML = `
    <div style="display:flex;flex-direction:column;gap:14px;">
      <p style="font-size:0.85rem;color:#546E7A;margin:0;">
        El código identifica el EC. Formato sugerido: <code>E.C.1.1.1</code>,
        <code>E.C.1.1.2</code>, etc. Puedes usar cualquier formato.
      </p>
      <div>
        <label style="font-size:0.78rem;font-weight:700;color:#424242;display:block;margin-bottom:5px;">Código actual</label>
        <input type="text" id="edit-ec-codigo" value="${escapeHTML(ec.codigo)}"
          style="width:100%;padding:10px 12px;border:1.5px solid #90CAF9;border-radius:8px;font-size:1rem;font-weight:700;font-family:monospace;">
      </div>
      <div style="display:flex;gap:8px;justify-content:flex-end;padding-top:8px;border-top:1px solid #E0E0E0;">
        <button class="btn-secundario" onclick="cerrarModalBtn()">Cancelar</button>
        <button class="btn-siguiente" onclick="_guardarCodigoEC(${idx})">
          <span class="material-icons">save</span> Guardar
        </button>
      </div>
    </div>`;
  _usarFooterDinamico('');
  document.getElementById('modal-overlay').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  setTimeout(() => {
    const inp = document.getElementById('edit-ec-codigo');
    if (inp) { inp.focus(); inp.select(); }
  }, 80);
}

function _guardarCodigoEC(idx) {
  const nuevo = document.getElementById('edit-ec-codigo')?.value?.trim();
  if (!nuevo) { mostrarToast('El código no puede estar vacío', 'error'); return; }
  planificacion.elementosCapacidad[idx].codigo = nuevo;
  // Actualizar también las actividades que referencien este EC
  const viejo = planificacion.actividades?.filter(a => a.ecCodigo === planificacion.elementosCapacidad[idx]?.codigo);
  // Ya cambió el código, actualizar actividades
  planificacion.actividades?.forEach(a => {
    if (a.ecCodigo === planificacion.elementosCapacidad[idx]?.codigo || true) {
      // Solo actualizar las que tenían el código anterior — ya fue cambiado así que recorremos idx
    }
  });
  guardarBorrador();
  cerrarModalBtn();
  renderizarEC(planificacion.elementosCapacidad);
  mostrarToast('Código actualizado', 'success');
}

// ════════════════════════════════════════════════════════════════════
// EDITAR INSTRUMENTO DE UNA ACTIVIDAD EXISTENTE
// ════════════════════════════════════════════════════════════════════

function _editarInstrumentoActividad(idx) {
  const act = planificacion.actividades[idx];
  if (!act) return;
  const tipoActual = act.instrumento?.tipo || 'cotejo';

  document.getElementById('modal-title').textContent = 'Cambiar instrumento';
  document.getElementById('modal-body').innerHTML = `
    <div style="display:flex;flex-direction:column;gap:16px;">
      <p style="font-size:0.85rem;color:#546E7A;margin:0;">
        Selecciona el tipo de instrumento para: <strong>${escapeHTML((act.enunciado||'').substring(0,60))}…</strong>
      </p>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
        <label class="inst-opt ${tipoActual==='cotejo'?'inst-opt-sel':''}" id="iopt-cotejo"
          onclick="_selInstrOpt('cotejo')" style="cursor:pointer;border:2px solid ${tipoActual==='cotejo'?'#1565C0':'#E0E0E0'};border-radius:10px;padding:14px;text-align:center;transition:all 0.15s;">
          <span class="material-icons" style="font-size:28px;color:#1565C0;display:block;margin-bottom:6px;">checklist</span>
          <strong>Lista de Cotejo</strong>
          <p style="font-size:0.75rem;color:#78909C;margin:4px 0 0;">Criterios Sí/No</p>
        </label>
        <label class="inst-opt ${tipoActual==='rubrica'?'inst-opt-sel':''}" id="iopt-rubrica"
          onclick="_selInstrOpt('rubrica')" style="cursor:pointer;border:2px solid ${tipoActual==='rubrica'?'#6A1B9A':'#E0E0E0'};border-radius:10px;padding:14px;text-align:center;transition:all 0.15s;">
          <span class="material-icons" style="font-size:28px;color:#6A1B9A;display:block;margin-bottom:6px;">table_chart</span>
          <strong>Rúbrica</strong>
          <p style="font-size:0.75rem;color:#78909C;margin:4px 0 0;">Niveles de desempeño</p>
        </label>
      </div>
      <input type="hidden" id="edit-inst-tipo" value="${tipoActual}">
      <div style="display:flex;gap:8px;justify-content:flex-end;padding-top:8px;border-top:1px solid #E0E0E0;">
        <button class="btn-secundario" onclick="cerrarModalBtn()">Cancelar</button>
        <button class="btn-siguiente" onclick="_guardarInstrumentoActividad(${idx})">
          <span class="material-icons">save</span> Aplicar
        </button>
      </div>
    </div>`;
  _usarFooterDinamico('');
  document.getElementById('modal-overlay').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function _selInstrOpt(tipo) {
  document.getElementById('edit-inst-tipo').value = tipo;
  ['cotejo','rubrica'].forEach(t => {
    const el = document.getElementById('iopt-' + t);
    if (!el) return;
    const color = t === 'cotejo' ? '#1565C0' : '#6A1B9A';
    el.style.border = `2px solid ${t === tipo ? color : '#E0E0E0'}`;
    el.style.background = t === tipo ? (t === 'cotejo' ? '#E3F2FD' : '#F3E5F5') : '';
  });
}

function _guardarInstrumentoActividad(idx) {
  const tipo = document.getElementById('edit-inst-tipo')?.value || 'cotejo';
  const act  = planificacion.actividades[idx];
  if (!act) return;
  const tipoLabel = tipo === 'cotejo' ? 'Lista de Cotejo' : 'Rúbrica de Evaluación';
  act.instrumento = { ...(act.instrumento || {}), tipo, tipoLabel };
  guardarBorrador();
  cerrarModalBtn();
  renderizarActividades(planificacion.actividades);
  mostrarToast('Instrumento actualizado', 'success');
}

// ════════════════════════════════════════════════════════════════════
// AGREGAR NUEVA ACTIVIDAD
// ════════════════════════════════════════════════════════════════════


function _eliminarActividad(idx) {
  const act = planificacion.actividades[idx];
  if (!act) return;
  const resumen = (act.enunciado || '').substring(0, 60);
  if (!confirm(`¿Eliminar esta actividad?\n"${resumen}..."`)) return;
  planificacion.actividades.splice(idx, 1);
  guardarBorrador();
  renderizarActividades(planificacion.actividades);
  mostrarToast('Actividad eliminada', 'info');
}

function _agregarNuevaActividad() {
  const ecs = planificacion.elementosCapacidad || [];
  if (!ecs.length) { mostrarToast('Primero genera o carga los Elementos de Capacidad', 'error'); return; }

  const optsEC = ecs.map(ec =>
    `<option value="${ec.codigo}">${ec.codigo} — ${escapeHTML(ec.enunciado.substring(0,50))}…</option>`
  ).join('');

  document.getElementById('modal-title').textContent = 'Nueva actividad';
  document.getElementById('modal-body').innerHTML = `
    <div style="display:flex;flex-direction:column;gap:14px;">
      <div>
        <label style="font-size:0.78rem;font-weight:700;color:#424242;display:block;margin-bottom:5px;">Elemento de Capacidad</label>
        <select id="nueva-act-ec" style="width:100%;padding:9px 12px;border:1.5px solid #90CAF9;border-radius:8px;font-size:0.88rem;">
          ${optsEC}
        </select>
      </div>
      <div>
        <label style="font-size:0.78rem;font-weight:700;color:#424242;display:block;margin-bottom:5px;">Enunciado de la actividad</label>
        <textarea id="nueva-act-enunciado" rows="3" placeholder="Describe la actividad de aprendizaje..."
          style="width:100%;padding:10px 12px;border:1.5px solid #90CAF9;border-radius:8px;font-size:0.88rem;font-family:inherit;resize:vertical;"></textarea>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
        <div>
          <label style="font-size:0.78rem;font-weight:700;color:#424242;display:block;margin-bottom:5px;">Fecha (opcional)</label>
          <input type="date" id="nueva-act-fecha"
            style="width:100%;padding:9px 10px;border:1.5px solid #90CAF9;border-radius:8px;font-size:0.88rem;">
        </div>
        <div>
          <label style="font-size:0.78rem;font-weight:700;color:#424242;display:block;margin-bottom:5px;">Instrumento</label>
          <select id="nueva-act-instrumento" style="width:100%;padding:9px 10px;border:1.5px solid #90CAF9;border-radius:8px;font-size:0.88rem;">
            <option value="cotejo">Lista de Cotejo</option>
            <option value="rubrica">Rúbrica de Evaluación</option>
          </select>
        </div>
      </div>
      <div style="display:flex;gap:8px;justify-content:flex-end;padding-top:8px;border-top:1px solid #E0E0E0;">
        <button class="btn-secundario" onclick="cerrarModalBtn()">Cancelar</button>
        <button class="btn-siguiente" onclick="_confirmarNuevaActividad()">
          <span class="material-icons">add</span> Agregar
        </button>
      </div>
    </div>`;
  _usarFooterDinamico('');
  document.getElementById('modal-overlay').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  setTimeout(() => document.getElementById('nueva-act-enunciado')?.focus(), 80);
}

function _confirmarNuevaActividad() {
  const ecCodigo  = document.getElementById('nueva-act-ec')?.value;
  const enunciado = document.getElementById('nueva-act-enunciado')?.value?.trim();
  const fecha     = document.getElementById('nueva-act-fecha')?.value;
  const tipoInst  = document.getElementById('nueva-act-instrumento')?.value || 'cotejo';

  if (!enunciado || enunciado.length < 5) {
    mostrarToast('Escribe el enunciado de la actividad', 'error'); return;
  }
  const ec = (planificacion.elementosCapacidad||[]).find(e => e.codigo === ecCodigo);
  // Calcular código de actividad: Act X.Y.Z
  const actsDelEC = (planificacion.actividades||[]).filter(a => a.ecCodigo === ecCodigo);
  const numAct = actsDelEC.length + 1;
  const partes  = ecCodigo.replace('E.C.','').split('.');
  const codAct  = `Act ${partes.join('.')}.${numAct}`;

  const tipoLabel = tipoInst === 'cotejo' ? 'Lista de Cotejo' : 'Rúbrica de Evaluación';
  let fechaStr = '';
  if (fecha) {
    const d = new Date(fecha + 'T12:00:00');
    fechaStr = d.toLocaleDateString('es-DO', { weekday:'long', day:'2-digit', month:'long', year:'numeric' });
  }

  const nuevaAct = {
    id:         'act-' + Date.now(),
    ecCodigo,
    ecNivel:    ec?.nivel || 'aplicacion',
    enunciado,
    fecha:      fecha || '',
    fechaStr,
    instrumento: { tipo: tipoInst, tipoLabel, titulo: `${tipoLabel} – ${codAct}` }
  };

  if (!planificacion.actividades) planificacion.actividades = [];
  planificacion.actividades.push(nuevaAct);
  guardarBorrador();
  cerrarModalBtn();
  renderizarActividades(planificacion.actividades);
  mostrarToast('Actividad agregada ✓', 'success');
}

function renderizarActividades(listaActividades) {
  // Mostrar alerta si hay ECs sin actividades
  const _ecsSinActs = (planificacion.elementosCapacidad || []).filter(ec =>
    !(listaActividades || []).some(a => a.ecCodigo === ec.codigo)
  );
  const _alertEl = document.getElementById('alerta-ec-sin-act');
  if (_alertEl) {
    if (_ecsSinActs.length > 0) {
      _alertEl.innerHTML = `<span class="material-icons" style="font-size:16px;color:#E65100;">warning</span>
        Los siguientes EC aún no tienen actividades: <strong>${_ecsSinActs.map(e => e.codigo).join(', ')}</strong>.
        Usa el botón <em>Agregar actividad</em> para crearlas.`;
      _alertEl.style.display = 'flex';
    } else {
      _alertEl.style.display = 'none';
    }
  }



  const tbody = document.getElementById('tabla-actividades-body');



  tbody.innerHTML = '';







  if (listaActividades.length === 0) {



    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:2rem;color:#757575;">No se generaron actividades. Verifica los días de clase seleccionados.</td></tr>`;



    return;



  }







  listaActividades.forEach((act, idx) => {



    // Normalizar tipo e instrumento por si vienen de datos viejos
    if (act.instrumento && !act.instrumento.tipo && act.instrumento.tipoLabel) {
      act.instrumento.tipo = act.instrumento.tipoLabel.toLowerCase().includes('cotejo') ? 'cotejo' : 'rubrica';
    }
    const tipoLabel = act.instrumento?.tipo === 'cotejo' ? 'Lista de Cotejo'
                    : act.instrumento?.tipo === 'rubrica' ? 'Rúbrica de Evaluación'
                    : (act.instrumento?.tipoLabel || 'Sin instrumento');



    const badgeClass = act.instrumento?.tipo === 'cotejo' ? 'badge-cotejo' : 'badge-rubrica';



    const icono = act.instrumento?.tipo === 'cotejo' ? 'checklist' : 'table_chart';







    const tr = document.createElement('tr');



    tr.innerHTML = `



      <td>
        <input type="date" class="act-fecha-input" data-idx="${idx}"
          value="${(() => {
            if (!act.fecha) return '';
            if (act.fecha instanceof Date) return act.fecha.toISOString().split('T')[0];
            const s = String(act.fecha);
            if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
            if (s.includes('T')) return s.split('T')[0];
            const d = new Date(s); return isNaN(d.getTime()) ? '' : d.toISOString().split('T')[0];
          })()}"
          title="${act.fechaStr || ''}"
          style="border:1.5px solid #90CAF9;border-radius:8px;padding:5px 8px;
                 font-size:0.82rem;font-family:inherit;background:transparent;
                 color:inherit;cursor:pointer;min-width:145px;">
      </td>



      <td><code style="font-size:0.8rem;color:#1565C0;font-weight:600;">${act.ecCodigo}</code></td>



      <td style="max-width:280px;">${act.enunciado}</td>



      <td><span class="instrumento-badge ${badgeClass}">



        <span class="material-icons" style="font-size:14px;">${icono}</span>



        ${tipoLabel}



      </span></td>
      <td style="text-align:center;">
        <input type="number" class="act-valor-input" data-idx="${idx}"
          value="${act.valor != null ? act.valor : ''}"
          min="0" max="100" step="0.5" placeholder="—"
          title="Valor en puntos de esta actividad"
          style="width:65px;padding:5px 6px;border:1.5px solid #90CAF9;border-radius:8px;
                 font-size:0.88rem;text-align:center;background:transparent;
                 color:inherit;font-weight:700;">
      </td>



      <td style="display:flex;flex-direction:column;gap:5px;align-items:flex-start;padding:8px 6px;">
        <button class="btn-ver-instrumento" onclick="abrirEditarActividad(${idx})" style="background:#E8F5E9;color:#2E7D32;border-color:#A5D6A7;">
          <span class="material-icons">edit</span> Editar
        </button>
        <button class="btn-ver-instrumento" onclick="abrirModalInstrumento(${idx})">
          <span class="material-icons">visibility</span> Ver
        </button>
        <button class="btn-ver-instrumento" onclick="_editarInstrumentoActividad(${idx})" style="background:#FFF3E0;color:#E65100;border-color:#FFCC80;">
          <span class="material-icons">swap_horiz</span> Cambiar
        </button>
        <button class="btn-ver-instrumento" onclick="_eliminarActividad(${idx})" style="background:#FFEBEE;color:#C62828;border-color:#FFCDD2;">
          <span class="material-icons">delete_outline</span> Eliminar
        </button>
      </td>



    `;



    tbody.appendChild(tr);

    // Listener: editar fecha directamente en la tabla
    const fechaInput = tr.querySelector('.act-fecha-input');
    // Listener: editar valor de la actividad
    const valorInput = tr.querySelector('.act-valor-input');
    if (valorInput) {
      valorInput.addEventListener('change', function() {
        const i   = parseInt(this.dataset.idx);
        const act = planificacion.actividades[i];
        if (!act) return;
        const val = this.value.trim();
        act.valor = val !== '' && !isNaN(parseFloat(val)) ? parseFloat(val) : null;
        guardarBorrador();
        mostrarToast('Valor actualizado ✓', 'success');
      });
    }
    if (fechaInput) {
      fechaInput.addEventListener('change', function() {
        const i   = parseInt(this.dataset.idx);
        const act = planificacion.actividades[i];
        if (!act) return;
        const val = this.value;
        if (!val) return;
        const d      = new Date(val + 'T12:00:00');
        act.fecha    = val;
        act.fechaStr = d.toLocaleDateString('es-DO', { weekday:'long', day:'2-digit', month:'long', year:'numeric' });
        this.title   = act.fechaStr;
        guardarBorrador();
        mostrarToast('Fecha actualizada ✓', 'success');
      });
    }
  });
}

// ================================================================



// --- SECCIÓN: UI ?" MODAL DE INSTRUMENTO ---



// ================================================================







/**



 * Abre el modal mostrando el instrumento de la actividad indicada



 * @param {number} idxActividad - Índice en planificacion.actividades



 */




// ─── EDICIÓN COMPLETA DE ACTIVIDAD ───────────────────────────────
function abrirEditarActividad(idx) {
  const act = planificacion.actividades[idx];
  if (!act) return;
  const ecs = planificacion.elementosCapacidad || [];

  // Opciones de EC para el select
  const optsEC = ecs.map(ec =>
    `<option value="${ec.codigo}" ${act.ecCodigo === ec.codigo ? 'selected' : ''}>${ec.codigo} — ${ec.enunciado.substring(0,50)}…</option>`
  ).join('');

  // Tipo de instrumento actual
  const tipoInst = act.instrumento?.tipo || 'cotejo';

  document.getElementById('modal-title').textContent = `Editar Actividad ${idx + 1}`;
  document.getElementById('modal-body').innerHTML = `
    <div style="display:flex;flex-direction:column;gap:14px;padding:4px 0;">
      <div>
        <label style="font-size:0.78rem;font-weight:700;color:#424242;display:block;margin-bottom:5px;">Enunciado de la actividad</label>
        <textarea id="edit-act-enunciado" rows="3"
          style="width:100%;padding:10px 12px;border:1.5px solid #90CAF9;border-radius:8px;font-size:0.88rem;font-family:inherit;resize:vertical;"
        >${escapeHTML(act.enunciado)}</textarea>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
        <div>
          <label style="font-size:0.78rem;font-weight:700;color:#424242;display:block;margin-bottom:5px;">Fecha</label>
          <input type="date" id="edit-act-fecha"
            value="${act.fecha ? (act.fecha instanceof Date ? act.fecha.toISOString().split('T')[0] : String(act.fecha).split('T')[0]) : ''}"
            style="width:100%;padding:8px 10px;border:1.5px solid #90CAF9;border-radius:8px;font-size:0.88rem;">
        </div>
        <div>
          <label style="font-size:0.78rem;font-weight:700;color:#424242;display:block;margin-bottom:5px;">Instrumento</label>
          <select id="edit-act-instrumento"
            style="width:100%;padding:8px 10px;border:1.5px solid #90CAF9;border-radius:8px;font-size:0.88rem;">
            <option value="cotejo" ${tipoInst==='cotejo'?'selected':''}>Lista de Cotejo</option>
            <option value="rubrica" ${tipoInst==='rubrica'?'selected':''}>Rúbrica</option>
          </select>
        </div>
      </div>
      <div>
        <label style="font-size:0.78rem;font-weight:700;color:#424242;display:block;margin-bottom:5px;">Elemento de Capacidad (EC)</label>
        <select id="edit-act-ec"
          style="width:100%;padding:8px 10px;border:1.5px solid #90CAF9;border-radius:8px;font-size:0.88rem;">
          ${optsEC}
        </select>
      </div>
      <div style="background:#FFF8E1;border-radius:8px;padding:10px 12px;font-size:0.78rem;color:#795548;display:flex;gap:6px;align-items:flex-start;">
        <span class="material-icons" style="font-size:16px;color:#F57F17;margin-top:1px;">info</span>
        Al guardar, el instrumento se regenerará automáticamente con el nuevo enunciado.
      </div>
    
      <div style="display:flex;gap:8px;justify-content:flex-end;padding-top:8px;border-top:1px solid #E0E0E0;">
        <button class="btn-secundario" onclick="cerrarModalBtn()">Cancelar</button>
        <button class="btn-siguiente" onclick="guardarEdicionActividad(${idx})">
          <span class="material-icons">save</span> Guardar
        </button>
      </div>
    </div>`

  // botones en el body (ver línea anterior con </div>)`)
  _usarFooterDinamico('');
  document.getElementById('modal-overlay').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  setTimeout(() => document.getElementById('edit-act-enunciado')?.focus(), 80);
}

function guardarEdicionActividad(idx) {
  const act = planificacion.actividades[idx];
  if (!act) return;

  const nuevoEnunciado = document.getElementById('edit-act-enunciado')?.value.trim();
  const nuevaFechaStr  = document.getElementById('edit-act-fecha')?.value;
  const nuevoEC        = document.getElementById('edit-act-ec')?.value;
  const nuevoInst      = document.getElementById('edit-act-instrumento')?.value;

  if (!nuevoEnunciado) { mostrarToast('El enunciado no puede estar vacío', 'error'); return; }

  // Actualizar enunciado y EC
  act.enunciado = nuevoEnunciado;
  if (nuevoEC && nuevoEC !== act.ecCodigo) {
    act.ecCodigo = nuevoEC;
    // Sincronizar nivel del EC
    const ec = planificacion.elementosCapacidad.find(e => e.codigo === nuevoEC);
    if (ec) act.ecNivel = ec.nivel;
  }

  // Actualizar fecha si cambió
  if (nuevaFechaStr) {
    const fd = new Date(nuevaFechaStr + 'T12:00:00');
    act.fecha   = fd;
    act.fechaStr = fd.toLocaleDateString('es-DO', { weekday:'short', day:'2-digit', month:'short', year:'numeric' });
  }

  // Regenerar instrumento
  const ec = planificacion.elementosCapacidad.find(e => e.codigo === act.ecCodigo);
  const nivelEC = ec ? ec.nivel : (act.ecNivel || 'aplicacion');
  act.instrumento = generarInstrumento(act, nivelEC, nuevoInst);

  guardarBorrador();
  cerrarModalBtn();

  renderizarActividades(planificacion.actividades);
  mostrarToast('Actividad actualizada ✓', 'success');
}

function abrirModalInstrumento(idxActividad) {



  const act = planificacion.actividades[idxActividad];



  if (!act) return;
  if (!act.instrumento || !act.instrumento.criterios?.length) {
    const _ec = (planificacion.elementosCapacidad||[]).find(e => e.codigo === act.ecCodigo);
    // Respetar el tipo que ya tenía el instrumento (no dejar que el nivel del EC lo sobreescriba)
    const _tipoExistente = act.instrumento?.tipo || act.instrumento?.tipoLabel?.toLowerCase().includes('cotejo') ? 'cotejo' : null;
    const _tipoFinal = _tipoExistente || ((_ec?.nivel === 'conocimiento' || _ec?.nivel === 'comprension') ? 'cotejo' : 'rubrica');
    act.instrumento = generarInstrumento(act, _ec?.nivel || 'aplicacion', _tipoFinal);
    guardarBorrador();
  }







  const inst = act.instrumento;



  document.getElementById('modal-title').textContent = inst.titulo;







  const body = document.getElementById('modal-body');



  body.innerHTML = inst.tipo === 'cotejo'



    ? renderizarListaCotejoHTML(inst)



    : renderizarRubricaHTML(inst);







  _usarFooterInstrumento();
  document.getElementById('modal-overlay').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}







/** Cierra el modal al hacer clic en el overlay (si clic en el propio overlay) */



function cerrarModal(e) {



  if (e.target === document.getElementById('modal-overlay')) cerrarModalBtn();



}







/** Cierra el modal */



function cerrarModalBtn() {
  document.getElementById('modal-overlay').classList.add('hidden');
  document.body.style.overflow = '';
  // Restaurar botones de instrumento para la próxima vez que se abra
  _usarFooterInstrumento();
}







/**



 * Genera el HTML de una Lista de Cotejo



 */



function renderizarListaCotejoHTML(inst) {
  if (!inst || !inst.criterios?.length) return '<p style="color:#9E9E9E;font-style:italic;padding:10px;">Sin criterios. Guarda y vuelve a abrir el instrumento para regenerar.</p>';



  let html = `



    <div class="instrumento-seccion">



      <p style="margin-bottom:1rem;font-size:0.88rem;color:#555;">${inst.instrucciones}</p>



      <p style="margin-bottom:1rem;font-size:0.85rem;"><strong>Actividad:</strong> ${inst.actividad}</p>



      <p style="margin-bottom:1rem;font-size:0.85rem;"><strong>EC:</strong> ${inst.ecCodigo}</p>



      <table class="instrumento-table">



        <thead>



          <tr>



            <th class="text-left" style="width:50px;">#</th>



            <th class="text-left">Indicador / Criterio</th>



            <th class="check-col">Logrado</th>



            <th class="check-col">No Logrado</th>



          </tr>



        </thead>



        <tbody>`;







  inst.criterios.forEach(c => {



    html += `



          <tr>



            <td style="text-align:center;font-weight:600;color:#1565C0;">${c.numero}</td>



            <td>${c.indicador}</td>



            <td class="check-col"><span class="check-circle"></span></td>



            <td class="check-col"><span class="check-circle"></span></td>



          </tr>`;



  });







  html += `



        </tbody>



      </table>



      <div style="margin-top:1rem;padding:0.75rem;background:#F5F5F5;border-radius:8px;font-size:0.82rem;color:#555;">



        <strong>Observaciones generales:</strong>



        <div style="border-bottom:1px solid #ccc;margin-top:24px;"></div>



        <div style="border-bottom:1px solid #ccc;margin-top:24px;"></div>



      </div>



      <div style="display:flex;justify-content:space-between;margin-top:1.5rem;font-size:0.8rem;color:#555;">



        <div>Docente: ___________________________</div>



        <div>Firma: ___________________________</div>



        <div>Fecha: ___________________________</div>



      </div>



    </div>`;







  return html;



}







/**



 * Genera el HTML de una Rúbrica



 */



function renderizarRubricaHTML(inst) {
  if (!inst || !inst.criterios?.length) return '<p style="color:#9E9E9E;font-style:italic;padding:10px;">Sin criterios. Guarda y vuelve a abrir el instrumento para regenerar.</p>';



  let html = `



    <div class="instrumento-seccion">



      <p style="margin-bottom:1rem;font-size:0.88rem;color:#555;">${inst.instrucciones}</p>



      <p style="margin-bottom:0.5rem;font-size:0.85rem;"><strong>Actividad:</strong> ${inst.actividad}</p>



      <p style="margin-bottom:1rem;font-size:0.85rem;"><strong>EC:</strong> ${inst.ecCodigo} | <strong>Puntaje máximo:</strong> ${inst.puntajeMax} pts</p>



      <table class="instrumento-table">



        <thead>



          <tr>



            <th class="text-left" style="width:40%;">Criterio de Evaluación</th>`;







  inst.niveles.forEach(n => {



    html += `<th><span class="rubrica-nivel ${n.clase}">${n.nombre}<br>(${n.puntos} pts)</span></th>`;



  });







  html += `</tr></thead><tbody>`;







  inst.criterios.forEach(c => {



    html += `<tr><td class="text-left"><strong>${c.numero}.</strong> ${c.criterio}</td>`;



    c.descriptores.forEach((desc, i) => {



      html += `<td style="font-size:0.8rem;vertical-align:top;">${desc}</td>`;



    });



    html += `</tr>`;



  });







  html += `



      </tbody>



    </table>



    <div style="margin-top:1rem;padding:0.75rem;background:#F5F5F5;border-radius:8px;font-size:0.82rem;color:#555;">



      <div style="display:flex;gap:2rem;flex-wrap:wrap;">



        <div><strong>Puntaje obtenido:</strong> _______/  ${inst.puntajeMax}</div>



        <div><strong>Calificación:</strong> _____________</div>



      </div>



      <div style="margin-top:0.75rem;"><strong>Observaciones:</strong></div>



      <div style="border-bottom:1px solid #ccc;margin-top:28px;"></div>



    </div>



    <div style="display:flex;justify-content:space-between;margin-top:1.5rem;font-size:0.8rem;color:#555;">



      <div>Docente: ___________________________</div>



      <div>Firma: ___________________________</div>



      <div>Fecha: ___________________________</div>



    </div>



  </div>`;







  return html;



}







/** Imprime el contenido del modal */



function imprimirModal() {



  const contenido = document.getElementById('modal-body').innerHTML;



  const titulo = document.getElementById('modal-title').textContent;



  const ventana = window.open('', '_blank', 'width=800,height=600');



  ventana.document.write(`



    <html><head><title>${titulo}</title>



    <style>



      body { font-family:Arial,sans-serif; margin:2cm; font-size:11pt; }



      table { width:100%; border-collapse:collapse; margin:1rem 0; }



      th,td { border:1px solid #ccc; padding:8px; }



      th { background:#1565C0; color:#fff; }



      .check-circle { display:inline-block; width:16px; height:16px; border:1px solid #ccc; border-radius:50%; }



      .rubrica-nivel { font-size:0.75em; font-weight:bold; }



    </style></head><body>



    <h2>${titulo}</h2>



    ${contenido}



    </body></html>`);



  ventana.document.close();



  ventana.print();



}







/** Copia el texto del modal al portapapeles */



function copiarModal() {



  const texto = document.getElementById('modal-body').innerText;



  navigator.clipboard.writeText(texto)



    .then(() => mostrarToast('Instrumento copiado al portapapeles', 'success'))



    .catch(() => mostrarToast('No se pudo copiar. Selecciona el texto manualmente.', 'error'));



}







// ================================================================



// --- SECCIÓN: UI ?" VISTA PREVIA ---



// ================================================================







/**



 * Genera y renderiza la vista previa completa de la planificación



 */



function renderizarVistaPrevia() {
  const vp   = document.getElementById('vista-previa');
  if (!vp) return;
  const dg   = planificacion.datosGenerales   || {};
  const ra   = planificacion.ra               || {};
  const ec   = planificacion.elementosCapacidad || [];
  const acts = planificacion.actividades      || [];
  const fechaHoy = new Date().toLocaleDateString('es-DO', { day: '2-digit', month: 'long', year: 'numeric' });







  const nivelLabel = { conocimiento: 'Conocimiento', comprension: 'Comprensión', aplicacion: 'Aplicación', actitudinal: 'Actitudinal' };







  // Tabla de EC



  let tablaEC = `<table class="vp-table">



    <thead><tr><th>Código</th><th>Enunciado del EC</th><th>Nivel Bloom</th><th>Horas</th></tr></thead>



    <tbody>`;



  ec.forEach(e => {



    tablaEC += `<tr>



      <td><code>${e.codigo}</code></td>



      <td>${e.enunciado}</td>



      <td>${nivelLabel[e.nivel]}</td>



      <td>${e.horasAsignadas}h</td>



    </tr>`;



  });



  tablaEC += `</tbody></table>`;







  // Tabla de actividades



  let tablaActs = `<table class="vp-table">



    <thead><tr><th>EC</th><th>Actividad</th><th>Fecha</th><th>Instrumento</th></tr></thead>



    <tbody>`;



  acts.forEach(a => {



    tablaActs += `<tr>



      <td><code>${a.ecCodigo}</code></td>



      <td>${a.enunciado}</td>



      <td>${a.fechaStr}</td>



      <td>${a.instrumento?.tipoLabel || ''}</td>



    </tr>`;



  });



  tablaActs += `</tbody></table>`;







  // Instrumentos completos



  let instrumentosHTML = '';



  acts.forEach(a => {



    if (!a.instrumento) return;



    instrumentosHTML += `



    <div class="vp-instrumento-box">



      <div class="vp-instrumento-title">



        <span class="material-icons" style="font-size:18px;">${a.instrumento.tipo === 'cotejo' ? 'checklist' : 'table_chart'}</span>



        ${a.instrumento.titulo}



      </div>



      ${a.instrumento.tipo === 'cotejo' ? renderizarListaCotejoHTML(a.instrumento) : renderizarRubricaHTML(a.instrumento)}



    </div>`;



  });







  vp.innerHTML = `



    <!-- Encabezado institucional -->



    <div class="vp-header">



      <div class="vp-logo-area">



        <span class="material-icons vp-logo-icon">school</span>



        <div>



          <div class="vp-institucion">República Dominicana · Educación Técnico Profesional</div>



          <div class="vp-titulo-doc">Planificación por Resultados de Aprendizaje</div>



        </div>



      </div>



    </div>







    <!-- Datos generales -->



    <div class="vp-section-title">Datos Generales</div>



    <div class="vp-datos-grid">



      <div class="vp-dato"><strong>Familia Profesional</strong><span>${dg.familiaProfesional || '-'} (${dg.codigoFP || '-'})</span></div>



      <div class="vp-dato"><strong>Bachillerato Técnico</strong><span>${dg.nombreBachillerato || '-'}</span></div>



      <div class="vp-dato"><strong>Código Título</strong><span>${dg.codigoTitulo || '-'}</span></div>



      <div class="vp-dato"><strong>Módulo Formativo</strong><span>${dg.moduloFormativo || '-'} (${dg.codigoModulo || '-'})</span></div>



      <div class="vp-dato"><strong>Docente</strong><span>${dg.nombreDocente || '-'}</span></div>



      <div class="vp-dato"><strong>Período</strong><span>${dg.fechaInicio || '-'} ? ${dg.fechaTermino || '-'}</span></div>



      <div class="vp-dato"><strong>Horas por semana / Total</strong><span>${dg.horasSemana || '-'} hrs / ${planificacion.horasTotal} hrs</span></div>



      <div class="vp-dato"><strong>RA N° / Valor</strong><span>${dg.cantidadRA || '-'} RA en el módulo · ${dg.valorRA || '-'} puntos</span></div>



    </div>







    <!-- RA -->



    <div class="vp-section-title">Resultado de Aprendizaje (RA)</div>



    <div class="vp-ra-box">${ra.descripcion || '-'}</div>



    ${ra.criterios ? `<p style="font-size:0.85rem;color:#555;margin-bottom:0.5rem;"><strong>Criterios de referencia:</strong></p><pre style="font-size:0.82rem;color:#333;white-space:pre-wrap;background:#f9f9f9;padding:0.75rem;border-radius:6px;">${ra.criterios}</pre>` : ''}



    ${ra.recursos ? `<p style="font-size:0.85rem;color:#555;margin-top:0.5rem;"><strong>Recursos didácticos:</strong> ${ra.recursos}</p>` : ''}







    <!-- EC -->



    <div class="vp-section-title">Elementos de Capacidad</div>



    ${tablaEC}







    <!-- Actividades -->



    <div class="vp-section-title">Actividades de Aprendizaje y Evaluación</div>



    ${tablaActs}







    <!-- Instrumentos -->



    <div class="vp-section-title">Instrumentos de Evaluación</div>



    ${instrumentosHTML}







    <!-- Pie de página -->



    <div class="vp-footer">



      <div>



        <p>Elaborado con: <strong>Planificador Educativo por RA</strong></p>



        <p>Fecha de elaboración: ${fechaHoy}</p>



      </div>



      <div class="vp-firma">



        <div class="vp-firma-linea"></div>



        <strong>${dg.nombreDocente || 'Docente'}</strong>



        <p style="font-size:0.78rem;color:#777;">Firma del Docente</p>



      </div>



    </div>`;



}







// ================================================================



// --- SECCIÓN: EXPORTACIÓN ---



// ================================================================







/** Imprime / Guarda como PDF usando window.print() */



function imprimirPDF() {



  irAlPaso(5, false);



  setTimeout(() => window.print(), 300);



}







/** Exporta a Word como .doc (HTML compatible con Word) */



function exportarWord() {



  const contenido = document.getElementById('vista-previa').innerHTML;



  const dg = planificacion.datosGenerales;



  const nombreArchivo = `Planificacion_RA_${(dg.moduloFormativo || 'modulo').replace(/\s+/g, '_')}.doc`;







  const html = `



    <html xmlns:o='urn:schemas-microsoft-com:office:office'



          xmlns:w='urn:schemas-microsoft-com:office:word'



          xmlns='http://www.w3.org/TR/REC-html40'>



    <head>



      <meta charset="utf-8"/>



      <title>Planificación por RA</title>



      <!--[if gte mso 9]><xml><w:WordDocument><w:View>Print</w:View></w:WordDocument></xml><![endif]-->



      <style>



        body { font-family: Calibri, Arial, sans-serif; font-size: 11pt; margin: 2cm; }



        table { width: 100%; border-collapse: collapse; margin: 12pt 0; }



        th, td { border: 1pt solid #ccc; padding: 6pt 8pt; font-size: 10pt; }



        th { background: #1565C0; color: white; font-weight: bold; }



        h2 { color: #0D47A1; font-size: 14pt; }



        .vp-section-title { color: #0D47A1; font-weight: bold; font-size: 12pt; border-left: 4pt solid #1565C0; padding-left: 8pt; margin: 16pt 0 8pt; }



        .vp-ra-box { background: #E3F2FD; padding: 8pt; font-style: italic; color: #0D47A1; }



        .vp-logo-icon { display: none; }



        .material-icons { display: none; }



        code { font-family: Courier New; font-weight: bold; color: #1565C0; }



      </style>



    </head>



    <body>${contenido}</body></html>`;







  const blob = new Blob(['\ufeff', html], { type: 'application/msword' });



  const url = URL.createObjectURL(blob);



  const a = document.createElement('a');



  a.href = url;



  a.download = nombreArchivo;



  document.body.appendChild(a);



  a.click();



  document.body.removeChild(a);



  URL.revokeObjectURL(url);



  mostrarToast('Archivo Word descargado correctamente', 'success');



}







/** Copia el contenido de la vista previa al portapapeles */



function copiarPortapapeles() {



  const texto = document.getElementById('vista-previa').innerText;



  navigator.clipboard.writeText(texto)



    .then(() => mostrarToast('Planificación copiada al portapapeles', 'success'))



    .catch(() => mostrarToast('No se pudo copiar. Intenta seleccionar el texto manualmente.', 'error'));



}







// ================================================================



// --- SECCIÓN: STORAGE ?" LOCALSTORAGE ---



// ================================================================







const STORAGE_KEY = 'planificadorRA_borrador_v1';







/** Guarda el estado actual de la planificación en localStorage */



function guardarBorrador() {



  try {



    // Convertir fechas a strings para JSON



    const copia = JSON.parse(JSON.stringify(planificacion, (k, v) =>



      v instanceof Date ? v.toISOString() : v



    ));



    localStorage.setItem(STORAGE_KEY, JSON.stringify(copia));



  } catch (e) {



    console.warn('No se pudo guardar el borrador:', e);



  }



}







/** Restaura el borrador desde localStorage */



function restaurarBorrador() {



  try {



    const raw = localStorage.getItem(STORAGE_KEY);



    if (!raw) return false;



    const datos = JSON.parse(raw);



    planificacion = datos;







    // Restaurar fechas convertidas



    if (planificacion.actividades) {



      planificacion.actividades.forEach(a => {



        if (a.fecha && typeof a.fecha === 'string') a.fecha = new Date(a.fecha);



      });



    }



    if (planificacion.fechasClase) {



      planificacion.fechasClase.forEach(f => {



        if (f.fecha && typeof f.fecha === 'string') f.fecha = new Date(f.fecha);



      });



    }







    // Repopular formulario



    if (planificacion.datosGenerales) poblarFormularioDesdeEstado();







    return true;



  } catch (e) {



    console.warn('No se pudo restaurar el borrador:', e);



    return false;



  }



}







/** Llena los campos del formulario desde el estado restaurado */



function poblarFormularioDesdeEstado() {



  const dg = planificacion.datosGenerales;



  const ra = planificacion.ra;







  const setVal = (id, val) => { const el = document.getElementById(id); if (el && val !== undefined) el.value = val; };







  setVal('familia-profesional', dg.familiaProfesional);



  setVal('codigo-fp', dg.codigoFP);



  setVal('nombre-bachillerato', dg.nombreBachillerato);



  setVal('codigo-titulo', dg.codigoTitulo);



  setVal('modulo-formativo', dg.moduloFormativo);



  setVal('codigo-modulo', dg.codigoModulo);



  setVal('nombre-docente', dg.nombreDocente);



  setVal('cantidad-ra', dg.cantidadRA);



  setVal('valor-ra', dg.valorRA);



  setVal('horas-semana', dg.horasSemana);



  setVal('fecha-inicio', dg.fechaInicio);



  setVal('fecha-termino', dg.fechaTermino);



  setVal('descripcion-ra', ra.descripcion);



  setVal('criterios-referencia', ra.criterios);



  setVal('recursos-didacticos', ra.recursos);







  // Restaurar días de clase



  if (dg.diasClase) {



    Object.entries(dg.diasClase).forEach(([dia, cfg]) => {



      const checkbox = document.getElementById('dia-' + dia);



      if (checkbox && cfg.activo) {



        checkbox.checked = true;



        const wrap = document.getElementById('horas-' + dia + '-wrap');



        const horasInput = document.getElementById('horas-' + dia);



        if (wrap) wrap.classList.remove('hidden');



        if (horasInput) horasInput.value = cfg.horas;



        document.getElementById('dia-card-' + dia)?.classList.add('seleccionado');



      }



    });



    actualizarResumenHoras();



  }







  // Detectar nivel Bloom en paso 2



  if (ra.descripcion) actualizarBloomBadge(ra.descripcion);







  // Habilitar botón siguiente del paso 2



  if (planificacion.elementosCapacidad?.length) {



    document.getElementById('btn-paso2-siguiente').disabled = false;



  }







  mostrarToast('Borrador restaurado correctamente', 'success');



}







/** Limpia todo y reinicia la app */



function nuevaPlanificacion() {



  if (!confirm('¿Deseas iniciar una nueva planificación? Se perderán los datos actuales.')) return;



  localStorage.removeItem(STORAGE_KEY);



  location.reload();



}







// ================================================================



// --- SECCIÓN: UI ?" STEPPER Y NAVEGACIÓN ---



// ================================================================







let pasoActual = 1;



const TOTAL_PASOS = 5;







/**



 * Navega al paso indicado con validación opcional



 * @param {number} nuevoPaso



 * @param {boolean} validar - si debe validar el paso actual antes de avanzar



 */



function irAlPaso(nuevoPaso, validar = true) {



  if (validar && nuevoPaso > pasoActual) {



    if (!validarPasoActual()) return;



  }







  // Guardar datos del formulario al avanzar



  if (nuevoPaso > pasoActual || nuevoPaso === pasoActual) {



    guardarDatosFormulario();



  }







  // Actualizar secciones visibles



  document.querySelectorAll('.step-section').forEach(s => s.classList.remove('active'));



  const seccion = document.getElementById('section-' + nuevoPaso);



  if (seccion) seccion.classList.add('active');







  // Actualizar stepper visual



  actualizarStepper(nuevoPaso);







  // Al entrar al paso 5, regenerar vista previa



  if (nuevoPaso === 4) renderizarActividades(planificacion.actividades);
    if (nuevoPaso === 4) renderizarActividades(planificacion.actividades);
  if (nuevoPaso === 5) renderizarVistaPrevia();







  pasoActual = nuevoPaso;







  // Scroll al top



  window.scrollTo({ top: 0, behavior: 'smooth' });







  guardarBorrador();



}







/** Actualiza el estado visual del stepper */



function actualizarStepper(pasoActivo) {



  const steps = document.querySelectorAll('.step');



  const lines = document.querySelectorAll('.step-line');







  steps.forEach((step, idx) => {



    const numPaso = idx + 1;



    step.classList.remove('active', 'completed');



    if (numPaso < pasoActivo) step.classList.add('completed');



    if (numPaso === pasoActivo) step.classList.add('active');



  });







  lines.forEach((line, idx) => {



    line.classList.toggle('completed', idx + 1 < pasoActivo);



  });



}







// ================================================================



// --- SECCIÓN: VALIDACIÓN DE FORMULARIOS ---



// ================================================================







/** Valida el paso actual antes de avanzar */



function validarPasoActual() {



  if (pasoActual === 1) return validarPaso1();



  if (pasoActual === 2) return validarPaso2();



  return true;



}







function validarPaso1() {



  const campos = [



    'familia-profesional', 'codigo-fp', 'nombre-bachillerato', 'codigo-titulo',



    'modulo-formativo', 'codigo-modulo', 'nombre-docente', 'cantidad-ra',



    'valor-ra', 'horas-semana', 'fecha-inicio', 'fecha-termino'



  ];







  let valido = true;



  campos.forEach(id => {



    const el = document.getElementById(id);



    if (!el) return;



    const vacio = !el.value.trim();



    el.classList.toggle('error', vacio);



    if (vacio) valido = false;



  });







  // Verificar fechas coherentes



  const inicio = document.getElementById('fecha-inicio').value;



  const termino = document.getElementById('fecha-termino').value;



  if (inicio && termino && new Date(termino) <= new Date(inicio)) {



    document.getElementById('fecha-termino').classList.add('error');



    mostrarToast('La fecha de término debe ser posterior a la de inicio', 'error');



    return false;



  }







  // Al menos un día de clase



  const diasActivos = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes']



    .filter(d => document.getElementById('dia-' + d)?.checked);



  if (diasActivos.length === 0) {



    mostrarToast('Selecciona al menos un día de clase', 'error');



    return false;



  }







  if (!valido) {



    mostrarToast('Por favor completa todos los campos obligatorios', 'error');



    return false;



  }



  return true;



}







function validarPaso2() {



  const ra = document.getElementById('descripcion-ra').value.trim();



  if (ra.length < 20) {



    document.getElementById('descripcion-ra').classList.add('error');



    mostrarToast('Escribe una descripción completa del Resultado de Aprendizaje', 'error');



    return false;



  }



  // Verificar que ya se generó la planificación



  if (!planificacion.elementosCapacidad?.length && !planificacion._id) {



    mostrarToast('Haz clic en "Generar Planificación" antes de continuar', 'error');



    return false;



  }



  return true;



}







// ================================================================



// --- SECCIÓN: RECOLECCIÓN Y GUARDADO DE DATOS DEL FORMULARIO ---



// ================================================================







function guardarDatosFormulario() {



  const getVal = id => document.getElementById(id)?.value?.trim() || '';







  // Datos generales



  planificacion.datosGenerales = {



    familiaProfesional: getVal('familia-profesional'),



    codigoFP: getVal('codigo-fp'),



    nombreBachillerato: getVal('nombre-bachillerato'),



    codigoTitulo: getVal('codigo-titulo'),



    moduloFormativo: getVal('modulo-formativo'),



    codigoModulo: getVal('codigo-modulo'),



    nombreDocente: getVal('nombre-docente'),



    cantidadRA: getVal('cantidad-ra'),



    valorRA: getVal('valor-ra'),



    horasSemana: getVal('horas-semana'),



    fechaInicio: getVal('fecha-inicio'),



    fechaTermino: getVal('fecha-termino'),



    diasClase: obtenerDiasClase()



  };







  // Datos del RA



  planificacion.ra = {



    descripcion: getVal('descripcion-ra'),



    criterios: getVal('criterios-referencia'),



    recursos: getVal('recursos-didacticos'),



    nivelBloom: planificacion.ra?.nivelBloom || ''



  };



}







/** Extrae la configuración de días de clase del formulario */



function obtenerDiasClase() {



  const dias = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'];



  const config = {};



  dias.forEach(d => {



    const checkbox = document.getElementById('dia-' + d);



    const horas = document.getElementById('horas-' + d);



    config[d] = {



      activo: checkbox?.checked || false,



      horas: parseInt(horas?.value || '2', 10)



    };



  });



  return config;



}







// ================================================================



// --- SECCIÓN: ORQUESTADOR PRINCIPAL ?" GENERAR PLANIFICACIÓN ---



// ================================================================







/**



 * Función principal: recolecta datos, genera EC, actividades e instrumentos



 */



function generarPlanificacion() {



  // Validar paso 2



  const raTexto = document.getElementById('descripcion-ra').value.trim();



  if (raTexto.length < 20) {



    document.getElementById('descripcion-ra').classList.add('error');



    mostrarToast('Escribe una descripción más completa del RA', 'error');



    return;



  }







  // Animación de carga



  const btn = document.getElementById('btn-generar');



  const txt = document.getElementById('btn-generar-texto');



  const ico = btn.querySelector('.btn-generar-icon');



  btn.disabled = true;



  btn.classList.add('loading');



  ico.textContent = 'cached';



  txt.textContent = 'Generando...';







  // Guardar datos antes de procesar



  guardarDatosFormulario();







  setTimeout(() => {



    try {



      const dg = planificacion.datosGenerales;



      const ra = planificacion.ra;







      // 1. Detectar nivel Bloom del RA



      const nivelRA = analizarNivelBloom(ra.descripcion);



      planificacion.ra.nivelBloom = nivelRA;



      actualizarBloomBadge(ra.descripcion);







      // 2. Calcular fechas de clase reales



      planificacion.fechasClase = calcularFechasClase(



        dg.diasClase, dg.fechaInicio, dg.fechaTermino



      );







      // 3. Calcular horas totales y semanas



      planificacion.horasTotal = planificacion.fechasClase.reduce((s, f) => s + f.horas, 0);



      planificacion.semanas = calcularSemanas(dg.fechaInicio, dg.fechaTermino);







      // 4. Generar EC



      let ec = generarElementosCapacidad(ra.descripcion, ra.criterios, dg);







      // 5. Distribuir horas entre EC



      ec = distribuirHoras(planificacion.horasTotal, ec);



      planificacion.elementosCapacidad = ec;







      // 6. Generar actividades con fechas reales



      planificacion.actividades = generarActividades(ec, planificacion.fechasClase);







      // 7. Renderizar UI



      renderizarEC(ec);



      renderizarActividades(planificacion.actividades);







      // 8. Habilitar navegación



      document.getElementById('btn-paso2-siguiente').disabled = false;







      // 9. Guardar borrador



      guardarBorrador();







      mostrarToast('¡Planificación generada exitosamente!', 'success');







    } catch (e) {



      console.error('Error generando planificación:', e);



      mostrarToast('Ocurrió un error al generar. Revisa los datos ingresados.', 'error');



    } finally {



      btn.disabled = false;



      btn.classList.remove('loading');



      ico.textContent = 'auto_awesome';



      txt.textContent = 'Generar Planificación';



    }



  }, 900); // pequeño delay para mostrar animación



}







// ================================================================



// --- SECCIÓN: UI ?" HELPERS ---



// ================================================================







/** Muestra/actualiza el badge de nivel Bloom detectado */



function actualizarBloomBadge(textoRA) {



  const badge = document.getElementById('nivel-bloom-detectado');



  if (!textoRA || textoRA.length < 5) { badge.classList.add('hidden'); return; }







  const nivel = analizarNivelBloom(textoRA);



  const info = {



    conocimiento: { label: 'Nivel Bloom Detectado: Conocimiento', color: '#1565C0', bg: '#E3F2FD' },



    comprension: { label: 'Nivel Bloom Detectado: Comprensión', color: '#2E7D32', bg: '#E8F5E9' },



    aplicacion: { label: 'Nivel Bloom Detectado: Aplicación', color: '#E65100', bg: '#FFF3E0' },



    actitudinal: { label: 'Nivel Bloom Detectado: Actitudinal', color: '#6A1B9A', bg: '#F3E5F5' }



  }[nivel];







  badge.textContent = info.label;



  badge.style.color = info.color;



  badge.style.background = info.bg;



  badge.style.border = `1px solid ${info.color}33`;



  badge.classList.remove('hidden');



}







/** Actualiza el resumen de horas calculadas en paso 1 */



function actualizarResumenHoras() {



  const horasSemana = parseInt(document.getElementById('horas-semana')?.value || '0', 10);



  const fechaInicio = document.getElementById('fecha-inicio')?.value;



  const fechaFin = document.getElementById('fecha-termino')?.value;







  if (!fechaInicio || !fechaFin || !horasSemana) return;







  const sem = calcularSemanas(fechaInicio, fechaFin);



  if (sem <= 0) return;







  const totalH = horasSemana * sem;



  const resumen = document.getElementById('resumen-horas');



  const texto = document.getElementById('resumen-horas-texto');



  if (!resumen || !texto) return;







  texto.textContent = `Aprox. ${sem} semanas · ${totalH} horas totales estimadas`;



  resumen.classList.remove('hidden');



}







/** Muestra un toast de notificación */



function mostrarToast(mensaje, tipo = 'success') {



  const toast = document.getElementById('toast');



  const icono = document.getElementById('toast-icon');



  const texto = document.getElementById('toast-mensaje');







  const iconos = { success: 'check_circle', error: 'error', info: 'info' };



  icono.textContent = iconos[tipo] || 'info';



  texto.textContent = mensaje;



  toast.className = `toast toast-${tipo}`;







  // Mostrar



  requestAnimationFrame(() => { toast.classList.add('visible'); });







  // Ocultar después de 3.5 segundos



  clearTimeout(toast._timer);



  toast._timer = setTimeout(() => { toast.classList.remove('visible'); }, 3500);



}







// ================================================================



// --- SECCIÓN: INICIALIZACIÓN DE LA APP ---



// ================================================================








// ─────────────────────────────────────────────────────────────
// SELECTORES DE PLANIFICACION PARA CALIFICACIONES Y DIARIAS
// ─────────────────────────────────────────────────────────────

function _getBiblioOpts() {
  const biblio = cargarBiblioteca();
  return (biblio.items || []).map(it => {
    const dg = it.planificacion && it.planificacion.datosGenerales ? it.planificacion.datosGenerales : {};
    const label = [dg.moduloFormativo, dg.nombreBachillerato, it.fechaGuardadoLabel].filter(Boolean).join(' — ');
    return '<option value="' + it.id + '">' + label + '</option>';
  }).join('');
}

function _cargarPlanDesdeSelector(selectorId, callback) {
  var sel = document.getElementById(selectorId);
  if (!sel || !sel.value) { mostrarToast('Selecciona una planificación', 'error'); return; }
  var biblio = cargarBiblioteca();
  var item = (biblio.items || []).find(function(it) { return it.id === sel.value; });
  if (!item || !item.planificacion) { mostrarToast('No se encontró la planificación', 'error'); return; }
  planificacion = item.planificacion;
  (planificacion.actividades || []).forEach(function(a) { if (a.fecha && typeof a.fecha === 'string') a.fecha = new Date(a.fecha); });
  (planificacion.fechasClase || []).forEach(function(f) { if (f.fecha && typeof f.fecha === 'string') f.fecha = new Date(f.fecha); });
  mostrarToast('Planificación cargada correctamente.', 'success');
  if (callback) callback();
}

function _actualizarSelectorPlanCal() { /* obsoleto - ver nuevo flujo curso/plan */ }

function _actualizarSelectorPlanDiarias(tieneActividades) {
  var area = document.getElementById('pd-sin-actividades');
  if (!area) return;
  if (tieneActividades) { area.classList.add('hidden'); return; }
  var opts = _getBiblioOpts();
  area.classList.remove('hidden');
  if (!opts) {
    area.innerHTML = '<span class="material-icons">event_busy</span><p>No hay planificaciones guardadas. Completa y guarda una planificación primero.</p>';
    return;
  }
  area.innerHTML = '<span class="material-icons" style="color:#0D47A1;">info</span>'
    + '<div style="flex:1;"><p style="margin:0 0 8px;font-weight:600;">Selecciona una planificación guardada:</p>'
    + '<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">'
    + '<select id="diarias-selector-plan" style="flex:1;min-width:200px;padding:8px 12px;border:1.5px solid #90CAF9;border-radius:8px;font-size:0.9rem;">'
    + '<option value="">-- Selecciona --</option>' + opts + '</select>'
    + '<button class="btn-siguiente" style="padding:8px 16px;" onclick="_cargarPlanDesdeSelector(\'diarias-selector-plan\',function(){cargarDiarias();document.getElementById(\'pd-sin-actividades\').classList.add(\'hidden\');renderizarDiarias();});">'
    + '<span class="material-icons">upload</span> Cargar</button></div></div>';
}

document.addEventListener('DOMContentLoaded', () => {







  // --- Listeners de checkboxes de días ---



  ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'].forEach(dia => {



    const checkbox = document.getElementById('dia-' + dia);



    const wrap = document.getElementById('horas-' + dia + '-wrap');



    const card = document.getElementById('dia-card-' + dia);







    if (!checkbox) return;







    checkbox.addEventListener('change', () => {



      wrap?.classList.toggle('hidden', !checkbox.checked);



      card?.classList.toggle('seleccionado', checkbox.checked);



      actualizarResumenHoras();



    });







    // También activar al hacer clic en la card



    card?.addEventListener('click', (e) => {



      if (e.target !== checkbox && !e.target.closest('input')) {



        checkbox.checked = !checkbox.checked;



        checkbox.dispatchEvent(new Event('change'));



      }



    });







    // Actualizar resumen al cambiar horas



    document.getElementById('horas-' + dia)?.addEventListener('input', actualizarResumenHoras);



  });







  // --- Listener: análisis Bloom en tiempo real mientras escribe el RA ---



  document.getElementById('descripcion-ra')?.addEventListener('input', (e) => {



    actualizarBloomBadge(e.target.value);



    e.target.classList.remove('error');



    // Solo resetear si es planificación nueva, no cargada desde biblioteca
    if (!planificacion._id) {
      document.getElementById('btn-paso2-siguiente').disabled = true;
      planificacion.elementosCapacidad = [];
      planificacion.actividades = [];
    }



  });







  // --- Listener: limpiar error al escribir ---



  document.querySelectorAll('input, textarea').forEach(el => {



    el.addEventListener('input', () => el.classList.remove('error'));



  });







  // --- Actualizar resumen de horas al cambiar fechas/horas ---



  ['fecha-inicio', 'fecha-termino', 'horas-semana'].forEach(id => {



    document.getElementById(id)?.addEventListener('change', actualizarResumenHoras);



  });







  // --- Botón restaurar borrador ---



  document.getElementById('btn-restaurar')?.addEventListener('click', () => {



    const ok = restaurarBorrador();



    document.getElementById('banner-borrador').classList.add('hidden');



    if (ok && planificacion.elementosCapacidad?.length) {



      renderizarEC(planificacion.elementosCapacidad);



      renderizarActividades(planificacion.actividades);



    }



  });







  // --- Botón descartar borrador ---



  document.getElementById('btn-descartar-borrador')?.addEventListener('click', () => {



    localStorage.removeItem(STORAGE_KEY);



    document.getElementById('banner-borrador').classList.add('hidden');



  });







  // --- Botón nueva planificación ---



  document.getElementById('btn-nueva-planificacion')?.addEventListener('click', nuevaPlanificacion);







  // --- Cerrar modal con Escape ---



  document.addEventListener('keydown', (e) => {



    if (e.key === 'Escape') cerrarModalBtn();



  });







  // --- Auto-guardado cada 30 segundos ---



  setInterval(() => {



    if (Object.keys(planificacion.datosGenerales).length > 0) {



      guardarDatosFormulario();



      guardarBorrador();



    }



  }, 30000);







  // --- Verificar si hay borrador guardado al iniciar ---



  const hayBorrador = localStorage.getItem(STORAGE_KEY);



  if (hayBorrador) {



    document.getElementById('banner-borrador')?.classList.remove('hidden');



  }







  console.log('? Planificador Educativo por RA inicializado correctamente.');



  console.log('?? Para desplegar en GitHub Pages: sube los 3 archivos al repositorio y activa Pages en Settings.');



});











// ================================================================



// --- MÓDULO: CALIFICACIONES (Libro de Notas) ---



// Almacenamiento 100% en localStorage, sin backend.



// ================================================================








// ── Helper: asegurar que planificacion.actividades esté disponible ──────────
// Si el usuario abre un panel sin haber generado en esta sesión,
// intentamos restaurar desde el borrador guardado.
function _asegurarPlanificacion() {
  if (planificacion.actividades && planificacion.actividades.length > 0) return true;
  try {
    const raw = localStorage.getItem('planificadorRA_borrador');
    if (!raw) return false;
    const b = JSON.parse(raw);
    if (!b || !b.actividades || b.actividades.length === 0) return false;
    planificacion = b;
    // Restaurar fechas
    (planificacion.actividades || []).forEach(a => {
      if (a.fecha && typeof a.fecha === 'string') a.fecha = new Date(a.fecha);
    });
    (planificacion.fechasClase || []).forEach(f => {
      if (f.fecha && typeof f.fecha === 'string') f.fecha = new Date(f.fecha);
    });
    return true;
  } catch (e) { return false; }
}

// ── Helper: mostrar/ocultar las secciones correctas ─────────────────────────
var _stepSectionsOcultas = false;

function _mostrarPanel(panelId) {
  // Ocultar stepper
  document.querySelector('.stepper-container')?.classList.add('hidden');
  // Ocultar secciones de pasos por ID
  ['section-1','section-2','section-3','section-4','section-5'].forEach(id => {
    document.getElementById(id)?.classList.add('hidden');
  });
  _stepSectionsOcultas = true;
  // Ocultar otros paneles
  ['panel-calificaciones', 'panel-planificaciones', 'panel-diarias', 'panel-dashboard', 'panel-horario', 'panel-tareas'].forEach(id => {
    if (id !== panelId) document.getElementById(id)?.classList.add('hidden');
  });
  // Mostrar panel deseado
  document.getElementById(panelId)?.classList.remove('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function _ocultarPaneles() {
  document.querySelector('.stepper-container')?.classList.remove('hidden');
  // Restaurar secciones de pasos - solo la activa debe verse
  ['section-1','section-2','section-3','section-4','section-5'].forEach(id => {
    document.getElementById(id)?.classList.remove('hidden');
  });
  _stepSectionsOcultas = false;
  // Ocultar paneles
  ['panel-calificaciones', 'panel-planificaciones', 'panel-diarias', 'panel-dashboard', 'panel-horario', 'panel-tareas'].forEach(id => {
    document.getElementById(id)?.classList.add('hidden');
  });
  // Re-aplicar visibilidad de pasos segun el paso actual
  if (typeof irAlPaso === 'function') irAlPaso(pasoActual || 1, false);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

const CAL_STORAGE_KEY = 'planificadorRA_calificaciones_v1';







/**



 * Estado global del módulo de calificaciones.



 * Estructura:



 * {



 *   cursos: {



 *     "id_curso": {



 *       id: "uuid",



 *       nombre: "2do Año Sección A",



 *       estudiantes: [{ id, nombre }],



 *       notas: { "idEstudiante": { "idActividad": valor } }



 *     }



 *   },



 *   cursoActivoId: null



 * }



 */



let calState = {



  cursos: {},



  cursoActivoId: null



};







/** Carga el estado de calificaciones desde localStorage */



function cargarCalificaciones() {



  try {



    const raw = localStorage.getItem(CAL_STORAGE_KEY);



    if (raw) calState = JSON.parse(raw);



  } catch (e) {



    calState = { cursos: {}, cursoActivoId: null };



  }



}







/** Guarda el estado completo de calificaciones en localStorage */



function guardarCalificaciones() {



  localStorage.setItem(CAL_STORAGE_KEY, JSON.stringify(calState));



}







/** Genera un ID único simple */



function uid() {



  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);



}







// ----------------------------------------------------------------



// CURSOS



// ----------------------------------------------------------------







/** Abre el modal para crear un nuevo curso */



// ═══════════════════════════════════════════════════════════════════
// NUEVO SISTEMA: Cursos ↔ Planificaciones vinculadas
// ═══════════════════════════════════════════════════════════════════

// calState ahora incluye cursoActivoId y planActivaId dentro del curso
// Estructura:
//   calState.cursos[id] = {
//     id, nombre, estudiantes,
//     planIds: ['PLN-xxx', 'PLN-yyy'],   ← planificaciones asignadas
//     notas: { planId: { estudianteId: { actId: nota } } }
//   }


// Helper: footer dinámico (crearCurso, asignar, etc.)
function _usarFooterDinamico(html) {
  const footer = document.getElementById('modal-footer');
  if (footer) footer.innerHTML = html;
}
// Helper: restaurar footer de instrumento
const _FOOTER_INST_HTML = `<button class="btn-export btn-print btn-sm" onclick="imprimirModal()"><span class="material-icons">print</span> Imprimir instrumento</button><button class="btn-export btn-copy btn-sm" onclick="copiarModal()"><span class="material-icons">content_copy</span> Copiar</button><button class="btn-secundario" onclick="cerrarModalBtn()">Cerrar</button>`;
function _usarFooterInstrumento() {
  const footer = document.getElementById('modal-footer');
  if (footer) footer.innerHTML = _FOOTER_INST_HTML;
}

function abrirModalNuevoCurso() {
  const biblio = cargarBiblioteca();
  const planes = biblio.items || [];
  const optsPlanes = planes.map(p =>
    `<option value="${p.id}">${escHTML(p.planificacion?.datosGenerales?.moduloFormativo || p.nombre || p.id)}</option>`
  ).join('');

  document.getElementById('modal-title').textContent = 'Nuevo Curso';
  document.getElementById('modal-body').innerHTML = `
    <div class="modal-curso-content">
      <label for="input-nombre-curso">Nombre del curso</label>
      <input type="text" id="input-nombre-curso" placeholder="Ej: 2do B – Turno Matutino" maxlength="60" autofocus>
      ${planes.length ? `
      <label style="margin-top:12px;" for="sel-plan-curso">Planificación a asignar (opcional)</label>
      <select id="sel-plan-curso" style="padding:8px 12px;border:1.5px solid #90CAF9;border-radius:8px;font-size:0.9rem;">
        <option value="">— Sin planificación por ahora —</option>
        ${optsPlanes}
      </select>` : '<p style="margin-top:10px;font-size:0.82rem;color:#78909C;">Podrás asignar planificaciones desde la Biblioteca luego.</p>'}
      <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:20px;padding-top:16px;border-top:1px solid #E0E0E0;">
        <button class="btn-secundario" onclick="cerrarModalBtn()">Cancelar</button>
        <button class="btn-siguiente" onclick="crearCurso()">
          <span class="material-icons">add</span> Crear curso
        </button>
      </div>
    </div>`;
  // No tocamos el footer — los botones están en el body
  document.getElementById('modal-overlay').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  setTimeout(() => document.getElementById('input-nombre-curso')?.focus(), 100);
  document.getElementById('input-nombre-curso').addEventListener('keydown', e => {
    if (e.key === 'Enter') crearCurso();
  });
}

function crearCurso() {
  const nombre = document.getElementById('input-nombre-curso')?.value?.trim();
  if (!nombre) { mostrarToast('Escribe un nombre para el curso', 'error'); return; }
  const planId = document.getElementById('sel-plan-curso')?.value || '';
  const id = uid();
  calState.cursos[id] = { id, nombre, estudiantes: [], notas: {}, planIds: planId ? [planId] : [], planActivaId: planId || null };
  calState.cursoActivoId = id;
  guardarCalificaciones();
  cerrarModalBtn();
  renderizarCalificaciones();
  mostrarToast(`Curso "${nombre}" creado`, 'success');
}

function activarCurso(id) {
  if (!calState.cursos[id]) return;
  calState.cursoActivoId = id;
  const curso = calState.cursos[id];
  if (curso.planIds && curso.planIds.length && !curso.planActivaId) {
    curso.planActivaId = curso.planIds[0];
  }
  guardarCalificaciones();
  renderizarCalificaciones();
  // Si el panel de asistencia está abierto, re-renderizarlo con el nuevo curso
  if (_asistPanelAbierto) {
    _asistFechaSeleccionada = null;
    _asistVistaActiva = 'pasar';
    renderizarAsistencia();
  }
}

function activarPlanEnCurso(planId) {
  const curso = calState.cursos[calState.cursoActivoId];
  if (!curso) return;
  curso.planActivaId = planId;
  guardarCalificaciones();
  renderizarTablaCalificaciones();
  renderizarTabsPlanesDelCurso();
}

/** Asigna una planificación a un curso desde la biblioteca */
function asignarPlanACurso(planId) {
  const cursos = Object.values(calState.cursos);
  if (cursos.length === 0) {
    mostrarToast('Primero crea un curso en el Libro de Calificaciones', 'error');
    return;
  }
  const biblio = cargarBiblioteca();
  const reg = biblio.items.find(i => i.id === planId);
  if (!reg) return;

  // Construir select de cursos
  const opsCursos = cursos.map(c => `<option value="${c.id}">${escHTML(c.nombre)}</option>`).join('');
  document.getElementById('modal-title').textContent = 'Asignar al libro de calificaciones';
  document.getElementById('modal-body').innerHTML = `
    <div class="modal-curso-content">
      <p style="margin-bottom:12px;font-size:0.9rem;color:#37474F;">
        <strong>${escHTML(reg.planificacion?.datosGenerales?.moduloFormativo || reg.nombre)}</strong><br>
        <span style="font-size:0.82rem;color:#78909C;">${(reg.planificacion?.actividades||[]).length} actividades · ${reg.planificacion?.datosGenerales?.valorRA || '?'} pts</span>
      </p>
      <label for="sel-curso-destino">Asignar al curso:</label>
      <select id="sel-curso-destino" style="padding:8px 12px;border:1.5px solid #90CAF9;border-radius:8px;font-size:0.9rem;width:100%;">
        ${opsCursos}
      </select>
      <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:20px;padding-top:16px;border-top:1px solid #E0E0E0;">
        <button class="btn-secundario" onclick="cerrarModalBtn()">Cancelar</button>
        <button class="btn-siguiente" onclick="_confirmarAsignarPlan('${planId}')">
          <span class="material-icons">link</span> Asignar
        </button>
      </div>
    </div>`;
  // botones ya están en el body
  _usarFooterDinamico('');
  document.getElementById('modal-overlay').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function _confirmarAsignarPlan(planId) {
  const cursoId = document.getElementById('sel-curso-destino')?.value;
  if (!cursoId) return;
  const curso = calState.cursos[cursoId];
  if (!curso) return;
  if (!curso.planIds) curso.planIds = [];
  if (!curso.planIds.includes(planId)) {
    curso.planIds.push(planId);
    if (!curso.planActivaId) curso.planActivaId = planId;
  }
  guardarCalificaciones();
  cerrarModalBtn();
  renderizarBiblioteca();
  mostrarToast('Planificación asignada al curso', 'success');
}

function desasignarPlanDeCurso(planId) {
  const curso = calState.cursos[calState.cursoActivoId];
  if (!curso) return;
  if (!confirm('¿Quitar esta planificación del curso? Las notas registradas no se eliminarán.')) return;
  curso.planIds = (curso.planIds || []).filter(id => id !== planId);
  if (curso.planActivaId === planId) {
    curso.planActivaId = curso.planIds[0] || null;
  }
  guardarCalificaciones();
  renderizarCalificaciones();
  mostrarToast('Planificación quitada del curso', 'info');
}

// ─── Obtener planificación activa del curso ───────────────────────
function _getPlanActivaDeCurso() {
  const curso = calState.cursos[calState.cursoActivoId];
  if (!curso || !curso.planActivaId) return null;
  const biblio = cargarBiblioteca();
  const reg = biblio.items.find(i => i.id === curso.planActivaId);
  return reg ? reg.planificacion : null;
}

function _getPlanIdClave(planId) {
  // Clave estable para RA basada en el ID de planificación
  return 'ra_plan_' + String(planId).replace(/[^a-zA-Z0-9]/g, '_').substring(0, 20);
}

function _getRaKey() {
  const curso = calState.cursos[calState.cursoActivoId];
  if (curso && curso.planActivaId) return _getPlanIdClave(curso.planActivaId);
  // Fallback al sistema anterior
  const dg = planificacion.datosGenerales || {};
  const ra = planificacion.ra || {};
  const base = (dg.moduloFormativo||'')+'|'+(dg.codigoModulo||'')+'|'+(ra.descripcion||'').substring(0,40);
  try { return 'ra_' + btoa(unescape(encodeURIComponent(base))).substring(0,16).replace(/[^a-zA-Z0-9]/g,'_'); }
  catch(e) { return 'ra_' + Math.abs(base.split('').reduce((a,c)=>a+c.charCodeAt(0),0)) % 999999; }
}

function _ensureRA(curso, raKey) {
  if (!curso.ras) curso.ras = {};
  if (!curso.ras[raKey]) {
    // Intentar obtener la planificación activa del curso
    let plan = _getPlanActivaDeCurso();
    if (!plan) plan = planificacion; // fallback
    const dg   = plan.datosGenerales || {};
    const ra   = plan.ra || {};
    const acts = plan.actividades || [];
    const valorTotal = parseFloat(dg.valorRA) || 10;
    const valores = {};
    let sumaCustom = 0;
    acts.forEach(a => { if (a.valor) { valores[a.id] = a.valor; sumaCustom += a.valor; } });
    const sinValor = acts.filter(a => !a.valor);
    if (sinValor.length) {
      const resto = Math.max(0, valorTotal - sumaCustom);
      const porAct = Math.floor((resto / sinValor.length) * 10) / 10;
      sinValor.forEach((a, i) => {
        valores[a.id] = (i === sinValor.length - 1)
          ? Math.round((resto - porAct * (sinValor.length - 1)) * 10) / 10
          : porAct;
      });
    }
    curso.ras[raKey] = {
      raKey,
      label: (ra.descripcion || raKey).substring(0, 80),
      modulo: dg.moduloFormativo || '',
      valorTotal,
      actividades: acts.map(a => a.id),
      valores,
      _actividadesSnapshot: acts.map(a => ({
        id: a.id, enunciado: a.enunciado,
        ecCodigo: a.ecCodigo, fechaStr: a.fechaStr
      }))
    };
  }
  return curso.ras[raKey];
}

// ─── Renderizado principal ────────────────────────────────────────
function renderizarCalificaciones() {
  // Limpiar textarea de estudiantes al cambiar curso (bug fix)
  const inputEst = document.getElementById('input-estudiantes');
  if (inputEst) inputEst.value = '';
  renderizarTabsCursos();
  renderizarTabsPlanesDelCurso();
  renderizarTablaCalificaciones();
}

function renderizarTabsCursos() {
  const container = document.getElementById('cal-tabs');
  if (!container) return;
  container.innerHTML = '';
  const cursos = Object.values(calState.cursos);
  if (cursos.length === 0) {
    container.innerHTML = '<span style="color:#9E9E9E;font-size:0.85rem;">Sin cursos. Crea uno →</span>';
    return;
  }
  cursos.forEach(curso => {
    const tab = document.createElement('button');
    tab.className = 'cal-tab' + (curso.id === calState.cursoActivoId ? ' activo' : '');
    const nPlanes = (curso.planIds || []).length;
    tab.innerHTML = '<span class="material-icons" style="font-size:16px;">class</span>'
      + escapeHTML(curso.nombre)
      + (nPlanes ? ` <span style="background:#E3F2FD;color:#1565C0;border-radius:10px;padding:1px 7px;font-size:0.7rem;font-weight:700;">${nPlanes}</span>` : '')
      + '<button class="cal-tab-del" title="Eliminar curso" onclick="event.stopPropagation();eliminarCurso(\'' + curso.id + '\')">'
      + '<span class="material-icons" style="font-size:16px;">close</span></button>';
    tab.onclick = () => activarCurso(curso.id);
    container.appendChild(tab);
  });
}

function renderizarTabsPlanesDelCurso() {
  const area = document.getElementById('cal-planes-bar');
  if (!area) return;
  const curso = calState.cursos[calState.cursoActivoId];
  if (!curso) { area.innerHTML = ''; return; }

  const planIds = curso.planIds || [];
  if (planIds.length === 0) {
    area.innerHTML = `
      <div style="padding:10px 0;font-size:0.85rem;color:#78909C;display:flex;align-items:center;gap:8px;">
        <span class="material-icons" style="font-size:18px;">info</span>
        Este curso no tiene planificaciones asignadas. 
        <button onclick="abrirPlanificaciones()" style="background:none;border:none;color:#1565C0;cursor:pointer;font-weight:600;font-size:0.85rem;text-decoration:underline;">Ir a Mis Planificaciones</button>
        para asignar una.
      </div>`;
    return;
  }

  const biblio = cargarBiblioteca();
  let html = '<div class="cal-planes-tabs">';
  planIds.forEach(pid => {
    const reg = biblio.items.find(i => i.id === pid);
    if (!reg) return;
    const dg = reg.planificacion?.datosGenerales || {};
    const activo = pid === curso.planActivaId;
    html += `<button class="cal-plan-tab${activo ? ' activo' : ''}" onclick="activarPlanEnCurso('${pid}')">
      <span class="material-icons" style="font-size:15px;">assignment</span>
      <span>${escHTML((dg.moduloFormativo || reg.nombre || pid).substring(0,30))}</span>
      <span style="font-size:0.7rem;opacity:0.7;margin-left:2px;">${dg.valorRA ? dg.valorRA+'pts' : ''}</span>
      <button onclick="event.stopPropagation();desasignarPlanDeCurso('${pid}')" title="Quitar del curso"
        style="background:none;border:none;cursor:pointer;color:#B0BEC5;margin-left:4px;padding:0;line-height:1;">
        <span class="material-icons" style="font-size:14px;">close</span>
      </button>
    </button>`;
  });
  html += '</div>';
  area.innerHTML = html;
}

// ─── abrirCalificaciones ──────────────────────────────────────────

// ─── Toggle panel asistencia ─────────────────────────────────────
let _asistPanelAbierto = false;

function toggleVistaAsistencia() {
  const panel = document.getElementById('cal-asist-panel');
  const btn   = document.getElementById('btn-toggle-asistencia');
  if (!panel) return;
  _asistPanelAbierto = !_asistPanelAbierto;
  panel.classList.toggle('hidden', !_asistPanelAbierto);
  if (btn) {
    btn.style.background  = _asistPanelAbierto ? '#1565C0' : '#E3F2FD';
    btn.style.color       = _asistPanelAbierto ? '#fff'    : '#1565C0';
    btn.style.borderColor = _asistPanelAbierto ? '#1565C0' : '#90CAF9';
  }
  if (_asistPanelAbierto) {
    _asistFechaSeleccionada = null;
    abrirAsistencia();
  }
}

function abrirCalificaciones() {
  cargarCalificaciones();
  _mostrarPanel('panel-calificaciones');
  renderizarCalificaciones();
}

// ─── Tabla de calificaciones (usa planificación activa del curso) ─
function renderizarTablaCalificaciones() {
  const thead   = document.getElementById('cal-thead');
  const tbody   = document.getElementById('cal-tbody');
  const tfoot   = document.getElementById('cal-tfoot');
  const sinActs = document.getElementById('cal-sin-actividades');
  if (!thead || !tbody || !tfoot) return;

  const cursoId = calState.cursoActivoId;
  const curso   = cursoId ? calState.cursos[cursoId] : null;

  if (!curso) {
    sinActs?.classList.remove('hidden');
    thead.innerHTML = ''; tbody.innerHTML = ''; tfoot.innerHTML = '';
    return;
  }

  // Obtener planificación activa del curso
  const planActiva = _getPlanActivaDeCurso();
  let actividades = (planActiva && planActiva.actividades) || [];

  // Fallback: snapshot guardado en el RA
  if (actividades.length === 0) {
    const raKey  = _getRaKey();
    const raInfo = curso.ras && curso.ras[raKey];
    if (raInfo && raInfo._actividadesSnapshot) actividades = raInfo._actividadesSnapshot;
  }

  if (actividades.length === 0 || !curso.planActivaId) {
    sinActs?.classList.remove('hidden');
    thead.innerHTML = '';
    tbody.innerHTML = '<tr><td colspan="99" style="text-align:center;padding:2rem;color:#9E9E9E;">'
      + (curso.planIds && curso.planIds.length === 0
          ? 'Asigna una planificación a este curso para comenzar a registrar calificaciones.'
          : 'Selecciona una planificación arriba.')
      + '</td></tr>';
    tfoot.innerHTML = '';
    return;
  }
  sinActs?.classList.add('hidden');

  const raKey  = _getRaKey();
  const raInfo = _ensureRA(curso, raKey);
  const planDg = planActiva?.datosGenerales || {};
  const planRa = planActiva?.ra || {};
  const rasKeys = Object.keys(curso.ras || {});

  // ─── Fila 1: encabezado del RA ───
  const raDescCorta = planRa.descripcion
    ? escapeHTML(planRa.descripcion.substring(0, 65)) + (planRa.descripcion.length > 65 ? '&hellip;' : '')
    : '';
  const raLabel = escapeHTML((planDg.moduloFormativo || 'RA').substring(0, 28))
    + ' &mdash; RA&nbsp;(' + raInfo.valorTotal + '&nbsp;pts)'
    + (raDescCorta ? '<br><small style="font-weight:400;opacity:0.88;font-size:0.72rem;">' + raDescCorta + '</small>' : '');

  let h1 = '<tr class="tr-ec-header">'
    + '<th class="th-nombre" rowspan="2">Estudiante</th>'
    + '<th colspan="' + actividades.length + '" style="text-align:center;background:#1565C0;color:#fff;padding:6px 8px;">'
    + raLabel + '</th>'
    + '<th rowspan="2" style="background:#0D47A1;color:#fff;min-width:72px;font-size:0.8rem;vertical-align:middle;text-align:center;white-space:nowrap;">Total RA<br><small style=\'font-weight:400;\'>' + raInfo.valorTotal + ' pts</small></th>';

  rasKeys.filter(rk => rk !== raKey).forEach(rk => {
    const ri = curso.ras[rk];
    h1 += '<th rowspan="2" style="background:#4527A0;color:#fff;min-width:72px;font-size:0.75rem;vertical-align:middle;text-align:center;white-space:nowrap;" title="' + escapeHTML(ri.label) + '">'
      + escapeHTML(ri.modulo.substring(0,14)||'RA') + '<br><small style=\'font-weight:400;\'>(' + ri.valorTotal + ' pts)</small></th>';
  });
  h1 += '<th rowspan="2" style="background:#1B5E20;color:#fff;min-width:72px;font-size:0.8rem;vertical-align:middle;text-align:center;">FINAL</th>'
    + '<th rowspan="2" style="background:#00695C;color:#fff;min-width:62px;font-size:0.78rem;vertical-align:middle;text-align:center;">Asist.</th></tr>';

  // ─── Fila 2: actividades con contador correcto por EC ───
  const _cntEC = {};
  actividades.forEach(a => { const ec = a.ecCodigo || ''; _cntEC[ec] = (_cntEC[ec] || 0) + 1; });
  const _idxEC = {};

  let h2 = '<tr>';
  actividades.forEach((a, i) => {
    const val = raInfo.valores[a.id] !== undefined ? raInfo.valores[a.id] : '';
    const fechaCorta = a.fechaStr ? a.fechaStr.split(',')[0] : '';
    const ecCorto = a.ecCodigo ? a.ecCodigo.replace('E.C.','').replace('CE','') : '';
    _idxEC[a.ecCodigo || ''] = (_idxEC[a.ecCodigo || ''] || 0) + 1;
    const numInEC = _idxEC[a.ecCodigo || ''];
    const labelEC = _cntEC[a.ecCodigo || ''] > 1 ? ecCorto + '.' + numInEC : ecCorto;
    h2 += '<th class="th-act" title="' + escapeHTML(a.enunciado) + '" style="min-width:80px;">'
      + '<div style="font-size:0.72rem;font-weight:600;">Act.' + (i+1)
      + ' <span style="opacity:0.65;font-weight:400;">' + labelEC + '</span></div>'
      + '<div style="font-size:0.68rem;opacity:0.7;margin:1px 0;">' + escapeHTML(fechaCorta) + '</div>'
      + '<input type="number" class="input-valor-act" value="' + val + '" min="0.1" max="100" step="0.5"'
      + ' title="Valor máximo de esta actividad" placeholder="pts"'
      + ' onchange="actualizarValorActividad(\'' + a.id + '\',this.value)"'
      + ' style="width:44px;padding:2px 3px;font-size:0.72rem;border:1px solid #90CAF9;border-radius:4px;text-align:center;display:block;margin:2px auto 0;">'
      + '</th>';
  });
  h2 += '</tr>';
  thead.innerHTML = h1 + h2;

  // ─── Cuerpo ───
  if (!curso.estudiantes || curso.estudiantes.length === 0) {
    tbody.innerHTML = '<tr><td colspan="99" style="text-align:center;padding:2rem;color:#9E9E9E;">Agrega estudiantes usando el formulario de arriba.</td></tr>';
    tfoot.innerHTML = '';
    return;
  }

  tbody.innerHTML = '';
  curso.estudiantes.forEach(est => {
    const tr = document.createElement('tr');
    let cells = '<td class="td-nombre" id="nombre-' + est.id + '">'
      + '<div class="td-nombre-inner">'
      + '<span ondblclick="editarNombreEstudiante(\'' + est.id + '\')" title="Doble clic para editar" style="cursor:pointer;flex:1;">' + escapeHTML(est.nombre) + '</span>'
      + '<button class="btn-coment-est" onclick="abrirComentariosEstudiante(\'' + est.id + '\',\'' + est.id + '\')" title="Comentarios" data-nombre="' + escapeHTML(est.nombre) + '">'
      + '<span class="material-icons" style="font-size:14px;">comment</span>'
      + (_getComentariosEst(est.id).length ? '<span class="coment-count-badge">' + _getComentariosEst(est.id).length + '</span>' : '')
      + '</button>'
      + '<button class="btn-del-estudiante" onclick="eliminarEstudiante(\'' + est.id + '\')" title="Eliminar"><span class="material-icons" style="font-size:16px;">close</span></button>'
      + '</div></td>';

    actividades.forEach(a => {
      const nota = curso.notas?.[est.id]?.[raKey]?.[a.id];
      const val  = nota !== undefined ? nota : '';
      const max  = raInfo.valores[a.id] || 100;
      const cls  = nota !== undefined ? _clsNota(nota, max) : '';
      cells += '<td><input type="number" class="input-nota ' + cls + '"'
        + ' id="nota-' + est.id + '-' + a.id + '"'
        + ' value="' + val + '" min="0" max="' + max + '" step="0.5" placeholder="—"'
        + ' onchange="registrarNota(\'' + est.id + '\',\'' + a.id + '\',this.value)"'
        + ' oninput="registrarNota(\'' + est.id + '\',\'' + a.id + '\',this.value)"'
        + ' onkeydown="_notaKeyNav(event,this)"'
        + ' onwheel="event.preventDefault()"'
        + ' title="Máx: ' + max + ' pts | ' + escapeHTML((a.enunciado||'').substring(0,40)) + '"'
        + '/></td>';
    });

    const notaRA = _calcNotaRA(curso, est.id, raKey);
    cells += '<td class="td-total-ra ' + _clsNota(notaRA, raInfo.valorTotal) + '" id="total-ra-' + est.id + '-' + raKey + '">'
      + (notaRA !== null ? notaRA.toFixed(1) : '—') + '</td>';

    rasKeys.filter(rk => rk !== raKey).forEach(rk => {
      const ri = curso.ras[rk];
      const n  = _calcNotaRA(curso, est.id, rk);
      cells += '<td class="td-total-ra ' + _clsNota(n, ri.valorTotal) + '" style="background:#F3E5F5;">'
        + (n !== null ? n.toFixed(1) : '—') + '</td>';
    });

    const notaFinal = _calcNotaFinal(curso, est.id);
    cells += '<td class="td-promedio ' + _clsProm(notaFinal) + '" id="final-' + est.id + '">'
      + (notaFinal !== null ? notaFinal.toFixed(1) : '—') + '</td>';

    // Columna asistencia
    const asistStats = _statsAsistencia(calState.cursoActivoId, est.id);
    const asistCls   = asistStats.pct === null ? '' : asistStats.pct >= 80 ? 'nota-aprobado' : asistStats.pct >= 60 ? 'nota-regular' : 'nota-reprobado';
    cells += '<td class="td-total-ra ' + asistCls + '" style="cursor:pointer;" onclick="toggleVistaAsistencia()" title="P:'+asistStats.P+' T:'+asistStats.T+' A:'+asistStats.A+' / '+asistStats.total+' clases">'
      + (asistStats.pct !== null ? asistStats.pct + '%' : '—') + '</td>';
    tr.innerHTML = cells;
    tbody.appendChild(tr);
  });

  // ─── Footer ───
  let footCells = '<td class="tf-label">Promedio</td>';
  actividades.forEach(a => {
    const notas = curso.estudiantes.map(e => curso.notas?.[e.id]?.[raKey]?.[a.id]).filter(n => n !== undefined && n !== null);
    const avg   = notas.length ? notas.reduce((s,n) => s+n, 0) / notas.length : null;
    const max   = raInfo.valores[a.id] || 100;
    footCells += '<td class="' + (avg !== null ? _clsNota(avg, max) : '') + '">'
      + (avg !== null ? avg.toFixed(1) : '—') + '</td>';
  });
  const avgRA = _promedioColRA(curso, raKey);
  footCells += '<td class="td-total-ra ' + (avgRA !== null ? _clsNota(avgRA, raInfo.valorTotal) : '') + '">'
    + (avgRA !== null ? avgRA.toFixed(1) : '—') + '</td>';
  rasKeys.filter(rk => rk !== raKey).forEach(() => { footCells += '<td>—</td>'; });
  const avgFinal = _promedioFinal(curso);
  footCells += '<td class="td-promedio ' + _clsProm(avgFinal) + '">'
    + (avgFinal !== null ? avgFinal.toFixed(1) : '—') + '</td>';
  // Footer asistencia: promedio de % de asistencia del curso
  const asistProms = curso.estudiantes
    .map(e => _statsAsistencia(calState.cursoActivoId, e.id).pct)
    .filter(p => p !== null);
  const avgAsist = asistProms.length ? Math.round(asistProms.reduce((s,p)=>s+p,0)/asistProms.length) : null;
  const asistFootCls = avgAsist === null ? '' : avgAsist >= 80 ? 'nota-aprobado' : avgAsist >= 60 ? 'nota-regular' : 'nota-reprobado';
  footCells += '<td class="td-total-ra ' + asistFootCls + '">' + (avgAsist !== null ? avgAsist + '%' : '—') + '</td>';
  tfoot.innerHTML = '<tr>' + footCells + '</tr>';
}

// ─── Actualizar notas (usa raKey del curso activo) ──────────────

// ── Navegación de teclado en inputs de nota sin scroll ──────────
function _notaKeyNav(e, el) {
  // Evitar que flechas arriba/abajo hagan scroll de la página
  if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
    e.preventDefault();
    const delta = e.key === 'ArrowUp' ? 0.5 : -0.5;
    const max   = parseFloat(el.max) || 100;
    const cur   = parseFloat(el.value) || 0;
    const nv    = Math.min(max, Math.max(0, Math.round((cur + delta) * 2) / 2));
    el.value = nv;
    el.dispatchEvent(new Event('input'));
    return;
  }
  // Enter o Tab → mover al siguiente input-nota
  if (e.key === 'Enter' || (e.key === 'Tab' && !e.shiftKey)) {
    e.preventDefault();
    const todos = Array.from(document.querySelectorAll('.input-nota'));
    const idx   = todos.indexOf(el);
    if (idx >= 0 && idx + 1 < todos.length) {
      todos[idx + 1].focus();
      todos[idx + 1].select();
    }
  }
  // Shift+Tab → mover al anterior
  if (e.key === 'Tab' && e.shiftKey) {
    e.preventDefault();
    const todos = Array.from(document.querySelectorAll('.input-nota'));
    const idx   = todos.indexOf(el);
    if (idx > 0) {
      todos[idx - 1].focus();
      todos[idx - 1].select();
    }
  }
}

function registrarNota(estudianteId, actividadId, valor) {
  const curso = calState.cursos[calState.cursoActivoId];
  if (!curso) return;
  const raKey = _getRaKey();
  _ensureRA(curso, raKey);
  if (!curso.notas) curso.notas = {};
  if (!curso.notas[estudianteId]) curso.notas[estudianteId] = {};
  if (!curso.notas[estudianteId][raKey]) curso.notas[estudianteId][raKey] = {};
  const num = parseFloat(valor);
  if (valor === '' || isNaN(num)) {
    delete curso.notas[estudianteId][raKey][actividadId];
  } else {
    const max = (curso.ras[raKey].valores[actividadId]) || 100;
    curso.notas[estudianteId][raKey][actividadId] = Math.min(max, Math.max(0, num));
  }
  guardarCalificaciones();
  _actualizarFilaRA(estudianteId, raKey);
  _actualizarFooterRA(raKey);
}

function actualizarValorActividad(actividadId, nuevoValor) {
  const curso = calState.cursos[calState.cursoActivoId];
  if (!curso) return;
  const raKey = _getRaKey();
  _ensureRA(curso, raKey);
  const num = parseFloat(nuevoValor);
  if (!isNaN(num) && num > 0) {
    curso.ras[raKey].valores[actividadId] = num;
    guardarCalificaciones();
    renderizarTablaCalificaciones();
  }
}



function exportarCalificacionesWord() {



  if (!calState.cursoActivoId) { mostrarToast('No hay curso activo', 'error'); return; }



  const tabla = document.getElementById('cal-tabla-wrap')?.innerHTML || '';



  const curso = calState.cursos[calState.cursoActivoId];



  const dg = planificacion.datosGenerales || {};



  const hoy = new Date().toLocaleDateString('es-DO', { day: '2-digit', month: 'long', year: 'numeric' });







  const html = `<html xmlns:o='urn:schemas-microsoft-com:office:office'



    xmlns:w='urn:schemas-microsoft-com:office:word'



    xmlns='http://www.w3.org/TR/REC-html40'>



  <head><meta charset="utf-8"/>



  <style>



    body{font-family:Calibri,Arial;font-size:11pt;margin:1.5cm;}



    h2{color:#0D47A1;} h3{color:#1565C0;}



    table{width:100%;border-collapse:collapse;margin:8pt 0;}



    th,td{border:1pt solid #bbb;padding:5pt 7pt;font-size:9pt;}



    th{background:#1565C0;color:white;font-weight:bold;}



  </style></head>



  <body>



    <h2>Calificaciones – ${escapeHTML(curso.nombre)}</h2>



    <p><strong>Módulo:</strong> ${escapeHTML(dg.moduloFormativo || '-')}</p>



    <p><strong>Docente:</strong> ${escapeHTML(dg.nombreDocente || '-')}</p>



    <p><strong>Fecha:</strong> ${hoy}</p>



    <hr/>



    ${tabla}



  </body></html>`;







  const blob = new Blob(['\ufeff', html], { type: 'application/msword' });



  const url = URL.createObjectURL(blob);



  const a = document.createElement('a');



  a.href = url;



  a.download = `Calificaciones_${(curso.nombre || '').replace(/\s+/g, '_')}.doc`;



  document.body.appendChild(a);



  a.click();



  document.body.removeChild(a);



  URL.revokeObjectURL(url);



  mostrarToast('Archivo Word descargado', 'success');



}







/** Imprime las calificaciones */



function imprimirCalificaciones() {



  // Guardar estado: ocultar todo menos el panel cal



  const stepper = document.querySelector('.stepper-container');



  const main = document.querySelector('.main-content');



  const prevStepper = stepper?.style.display;



  const prevMain = main?.style.display;



  stepper && (stepper.style.display = 'none');



  main && (main.style.display = 'none');



  window.print();



  stepper && (stepper.style.display = prevStepper || '');



  main && (main.style.display = prevMain || '');



}







// ----------------------------------------------------------------



// MÓDULO: HORARIO DE CLASES
// ════════════════════════════════════════════════════════════════════
// ════════════════════════════════════════════════════════════════════
// MÓDULO: ASISTENCIA
// ════════════════════════════════════════════════════════════════════
const ASIST_KEY = 'planificadorRA_asistencia_v1';
const ASIST_UMBRAL_DEFAULT = 80; // % mínimo antes de alertar

function cargarAsistencia() {
  try { return JSON.parse(localStorage.getItem(ASIST_KEY) || '{}'); } catch { return {}; }
}
function guardarAsistencia(data) {
  localStorage.setItem(ASIST_KEY, JSON.stringify(data));
  setTimeout(actualizarBadgeNotificaciones, 100);
}

// Estructura: asistencia[cursoId][fecha_ISO][estudianteId] = 'P'|'A'|'T'
function _asistFecha() {
  return new Date().toISOString().split('T')[0]; // YYYY-MM-DD
}

// ─── Estadísticas de asistencia por estudiante ───────────────────
function _statsAsistencia(cursoId, estudianteId) {
  const data   = cargarAsistencia();
  const byDate = data[cursoId] || {};
  let P = 0, A = 0, T = 0, E = 0, total = 0;
  Object.values(byDate).forEach(dia => {
    const v = dia[estudianteId];
    if (!v) return;
    total++;
    if (v === 'P') P++;
    else if (v === 'A') A++;
    else if (v === 'T') T++;
    else if (v === 'E') E++;
  });
  // Excusa cuenta como presente para el %
  const pct = total > 0 ? Math.round(((P + T * 0.5 + E) / total) * 100) : null;
  return { P, A, T, E, total, pct };
}

// ─── Abrir panel de asistencia del curso activo ──────────────────
let _asistVistaActiva = 'pasar'; // 'pasar' | 'historial'

function abrirAsistencia() {
  _asistVistaActiva = 'pasar';
  renderizarAsistencia();
}

function renderizarAsistencia() {
  const wrap = document.getElementById('cal-asist-wrap');
  if (!wrap) return;
  const curso = calState.cursos[calState.cursoActivoId];
  if (!curso) {
    wrap.innerHTML = '<div class="asist-empty"><span class="material-icons">group_off</span><p>Selecciona un curso para registrar asistencia.</p></div>';
    return;
  }
  if (!curso.estudiantes || curso.estudiantes.length === 0) {
    wrap.innerHTML = '<div class="asist-empty"><span class="material-icons">person_add</span><p>Este curso no tiene estudiantes. Agrégalos en la pestaña de Calificaciones.</p></div>';
    return;
  }

  // Header con fecha hoy + selector de vista
  const hoy = _asistFecha();
  const hoyFmt = new Date(hoy + 'T12:00:00').toLocaleDateString('es-DO', { weekday:'long', day:'2-digit', month:'long', year:'numeric' });

  wrap.innerHTML = `
    <div class="asist-toolbar">
      <div class="asist-vista-tabs">
        <button class="asist-vtab ${_asistVistaActiva==='pasar'?'activo':''}" onclick="_setAsistVista('pasar')">
          <span class="material-icons">how_to_reg</span> Pasar lista
        </button>
        <button class="asist-vtab ${_asistVistaActiva==='historial'?'activo':''}" onclick="_setAsistVista('historial')">
          <span class="material-icons">history</span> Historial
        </button>
        <button class="asist-vtab ${_asistVistaActiva==='reporte'?'activo':''}" onclick="_setAsistVista('reporte')">
          <span class="material-icons">bar_chart</span> Reporte
        </button>
      </div>
      <button onclick="abrirExpAsistencia()" style="margin-left:auto;display:flex;align-items:center;gap:5px;
        background:#E3F2FD;border:1.5px solid #90CAF9;color:#1565C0;border-radius:8px;
        padding:5px 13px;font-size:0.78rem;font-weight:700;cursor:pointer;">
        <span class="material-icons" style="font-size:15px;">download</span> Exportar
      </button>
    </div>
    <div id="asist-vista-body"></div>`;

  _renderizarVistaAsistencia();
}

function _setAsistVista(vista) {
  _asistVistaActiva = vista;
  const tabs = document.querySelectorAll('.asist-vtab');
  tabs.forEach(t => t.classList.toggle('activo', t.textContent.trim().toLowerCase().includes(
    vista === 'pasar' ? 'pasar' : vista === 'historial' ? 'historial' : 'reporte'
  )));
  _renderizarVistaAsistencia();
}

function _renderizarVistaAsistencia() {
  const body = document.getElementById('asist-vista-body');
  if (!body) return;
  if (_asistVistaActiva === 'pasar')     _renderPasarLista(body);
  else if (_asistVistaActiva === 'historial') _renderHistorial(body);
  else _renderReporte(body);
}

// ── Vista: Pasar lista ───────────────────────────────────────────
function _renderPasarLista(body) {
  const curso  = calState.cursos[calState.cursoActivoId];
  const data   = cargarAsistencia();
  const hoy    = _asistFecha();
  const hoyFmt = new Date(hoy + 'T12:00:00').toLocaleDateString('es-DO', {weekday:'long', day:'2-digit', month:'long'});
  const diaData = (data[calState.cursoActivoId] || {})[hoy] || {};

  const counts = { P: 0, A: 0, T: 0 };
  curso.estudiantes.forEach(e => { const v = diaData[e.id]; if (v) counts[v] = (counts[v]||0)+1; });
  const registrados = counts.P + counts.A + counts.T;

  body.innerHTML = `
    <div class="asist-fecha-header">
      <span class="material-icons">today</span>
      <span>${hoyFmt}</span>
      <input type="date" id="asist-sel-fecha" value="${hoy}"
        onchange="_cambiarFechaLista(this.value)"
        style="margin-left:auto;padding:5px 10px;border:1.5px solid #90CAF9;border-radius:8px;font-size:0.82rem;">
    </div>

    <div class="asist-summary-bar">
      <div class="asist-sum-item pres"><span class="material-icons">check_circle</span>${counts.P} <span>Presentes</span></div>
      <div class="asist-sum-item ause"><span class="material-icons">cancel</span>${counts.A} <span>Ausentes</span></div>
      <div class="asist-sum-item tard"><span class="material-icons">schedule</span>${counts.T} <span>Tardanzas</span></div>
      <div class="asist-sum-item excu"><span class="material-icons">assignment_turned_in</span>${counts.E||0} <span>Excusas</span></div>
      <div class="asist-sum-item total"><span class="material-icons">group</span>${registrados}/${curso.estudiantes.length} <span>Registrados</span></div>
    </div>

    <div class="asist-acciones-rapidas">
      <button class="asist-btn-todos" onclick="_marcarTodos('P')">
        <span class="material-icons">done_all</span> Todos presentes
      </button>
      <button class="asist-btn-todos" onclick="_marcarTodos('A')" style="border-color:#FFCDD2;color:#C62828;">
        <span class="material-icons">remove_done</span> Todos ausentes
      </button>
      <button class="asist-btn-todos" onclick="_limpiarDia()" style="border-color:#E0E0E0;color:#757575;">
        <span class="material-icons">clear_all</span> Limpiar día
      </button>
    </div>

    <div class="asist-lista" id="asist-lista-body">
      ${curso.estudiantes.map((est, i) => {
        const v = diaData[est.id] || '';
        return `<div class="asist-fila" id="asist-fila-${est.id}">
          <div class="asist-num">${i+1}</div>
          <div class="asist-nombre">${escapeHTML(est.nombre)}</div>
          <div class="asist-btns">
            <button class="asist-btn-estado P ${v==='P'?'activo':''}" onclick="marcarAsistencia('${est.id}','P')" title="Presente">
              <span class="material-icons">check_circle</span>P
            </button>
            <button class="asist-btn-estado T ${v==='T'?'activo':''}" onclick="marcarAsistencia('${est.id}','T')" title="Tardanza">
              <span class="material-icons">schedule</span>T
            </button>
            <button class="asist-btn-estado A ${v==='A'?'activo':''}" onclick="marcarAsistencia('${est.id}','A')" title="Ausente">
              <span class="material-icons">cancel</span>A
            </button>
            <button class="asist-btn-estado E ${v==='E'?'activo':''}" onclick="marcarAsistencia('${est.id}','E')" title="Excusa">
              <span class="material-icons">assignment_turned_in</span>E
            </button>
          </div>
          ${_badgePctAsistencia(calState.cursoActivoId, est.id)}
        </div>`;
      }).join('')}
    </div>`;
}

let _asistFechaSeleccionada = null;

function _cambiarFechaLista(fecha) {
  _asistFechaSeleccionada = fecha;
  const body = document.getElementById('asist-vista-body');
  if (body) _renderPasarListaFecha(body, fecha);
}

function _renderPasarListaFecha(body, fecha) {
  const curso   = calState.cursos[calState.cursoActivoId];
  const data    = cargarAsistencia();
  const diaData = (data[calState.cursoActivoId] || {})[fecha] || {};
  const fechaFmt = new Date(fecha + 'T12:00:00').toLocaleDateString('es-DO', {weekday:'long', day:'2-digit', month:'long'});
  const counts = { P: 0, A: 0, T: 0 };
  curso.estudiantes.forEach(e => { const v = diaData[e.id]; if (v) counts[v] = (counts[v]||0)+1; });
  const registrados = counts.P + counts.A + counts.T;

  // Actualizar summary y lista sin re-render completo
  const sumP = body.querySelector('.asist-sum-item.pres');
  const sumA = body.querySelector('.asist-sum-item.ause');
  const sumT = body.querySelector('.asist-sum-item.tard');
  const sumTot = body.querySelector('.asist-sum-item.total');
  if (sumP) sumP.innerHTML = `<span class="material-icons">check_circle</span>${counts.P} <span>Presentes</span>`;
  if (sumA) sumA.innerHTML = `<span class="material-icons">cancel</span>${counts.A} <span>Ausentes</span>`;
  if (sumT) sumT.innerHTML = `<span class="material-icons">schedule</span>${counts.T} <span>Tardanzas</span>`;
  if (sumTot) sumTot.innerHTML = `<span class="material-icons">group</span>${registrados}/${curso.estudiantes.length} <span>Registrados</span>`;

  const listaBody = body.querySelector('#asist-lista-body');
  if (listaBody) {
    listaBody.innerHTML = curso.estudiantes.map((est, i) => {
      const v = diaData[est.id] || '';
      return `<div class="asist-fila" id="asist-fila-${est.id}">
        <div class="asist-num">${i+1}</div>
        <div class="asist-nombre">${escapeHTML(est.nombre)}</div>
        <div class="asist-btns">
          <button class="asist-btn-estado P ${v==='P'?'activo':''}" onclick="marcarAsistencia('${est.id}','P','${fecha}')" title="Presente">
            <span class="material-icons">check_circle</span>P
          </button>
          <button class="asist-btn-estado T ${v==='T'?'activo':''}" onclick="marcarAsistencia('${est.id}','T','${fecha}')" title="Tardanza">
            <span class="material-icons">schedule</span>T
          </button>
          <button class="asist-btn-estado A ${v==='A'?'activo':''}" onclick="marcarAsistencia('${est.id}','A','${fecha}')" title="Ausente">
            <span class="material-icons">cancel</span>A
          </button>
          <button class="asist-btn-estado E ${v==='E'?'activo':''}" onclick="marcarAsistencia('${est.id}','E','${fecha}')" title="Excusa">
            <span class="material-icons">assignment_turned_in</span>E
          </button>
        </div>
        ${_badgePctAsistencia(calState.cursoActivoId, est.id)}
      </div>`;
    }).join('');
  }
}

function _badgePctAsistencia(cursoId, estudianteId) {
  const s = _statsAsistencia(cursoId, estudianteId);
  if (s.total === 0) return '<span class="asist-pct-badge" style="color:#9E9E9E;">—</span>';
  const cls = s.pct >= 80 ? 'ok' : s.pct >= 60 ? 'warn' : 'bad';
  return `<span class="asist-pct-badge ${cls}" title="${s.P}P · ${s.T}T · ${s.A}A / ${s.total} clases">${s.pct}%</span>`;
}

function marcarAsistencia(estudianteId, estado, fechaOverride) {
  const cursoId = calState.cursoActivoId;
  const fecha   = fechaOverride || (_asistFechaSeleccionada || _asistFecha());
  const data    = cargarAsistencia();
  if (!data[cursoId]) data[cursoId] = {};
  if (!data[cursoId][fecha]) data[cursoId][fecha] = {};

  // Toggle: si ya tiene ese estado, quitar
  if (data[cursoId][fecha][estudianteId] === estado) {
    delete data[cursoId][fecha][estudianteId];
  } else {
    data[cursoId][fecha][estudianteId] = estado;
  }
  guardarAsistencia(data);

  // Actualizar fila sin re-render
  const fila = document.getElementById('asist-fila-' + estudianteId);
  if (fila) {
    const v = data[cursoId][fecha][estudianteId] || '';
    fila.querySelectorAll('.asist-btn-estado').forEach(btn => {
      btn.classList.toggle('activo', btn.classList.contains(v));
    });
    const badge = fila.querySelector('.asist-pct-badge');
    if (badge) badge.outerHTML = _badgePctAsistencia(cursoId, estudianteId);
  }

  // Actualizar summary
  const curso   = calState.cursos[cursoId];
  const diaData = (data[cursoId] || {})[fecha] || {};
  const counts  = { P: 0, A: 0, T: 0 };
  curso.estudiantes.forEach(e => { const v2 = diaData[e.id]; if (v2) counts[v2] = (counts[v2]||0)+1; });
  const registrados = counts.P + counts.A + counts.T;
  const body = document.getElementById('asist-vista-body');
  if (body) {
    const sumP   = body.querySelector('.asist-sum-item.pres');
    const sumA   = body.querySelector('.asist-sum-item.ause');
    const sumT   = body.querySelector('.asist-sum-item.tard');
    const sumTot = body.querySelector('.asist-sum-item.total');
    if (sumP) sumP.innerHTML = `<span class="material-icons">check_circle</span>${counts.P} <span>Presentes</span>`;
    if (sumA) sumA.innerHTML = `<span class="material-icons">cancel</span>${counts.A} <span>Ausentes</span>`;
    if (sumT) sumT.innerHTML = `<span class="material-icons">schedule</span>${counts.T} <span>Tardanzas</span>`;
    if (sumTot) sumTot.innerHTML = `<span class="material-icons">group</span>${registrados}/${curso.estudiantes.length} <span>Registrados</span>`;
  }
}

function _marcarTodos(estado) {
  const curso   = calState.cursos[calState.cursoActivoId];
  if (!curso) return;
  const fecha   = _asistFechaSeleccionada || _asistFecha();
  const data    = cargarAsistencia();
  const cursoId = calState.cursoActivoId;
  if (!data[cursoId]) data[cursoId] = {};
  if (!data[cursoId][fecha]) data[cursoId][fecha] = {};
  curso.estudiantes.forEach(e => { data[cursoId][fecha][e.id] = estado; });
  guardarAsistencia(data);
  _renderizarVistaAsistencia();
  mostrarToast(`Todos marcados como ${estado==='P'?'Presentes':estado==='A'?'Ausentes':estado==='T'?'Tardanza':'Excusa'}`, 'success');
}

function _limpiarDia() {
  if (!confirm('¿Borrar el registro de asistencia de este día?')) return;
  const fecha   = _asistFechaSeleccionada || _asistFecha();
  const cursoId = calState.cursoActivoId;
  const data    = cargarAsistencia();
  if (data[cursoId] && data[cursoId][fecha]) delete data[cursoId][fecha];
  guardarAsistencia(data);
  _asistFechaSeleccionada = null;
  _renderizarVistaAsistencia();
  mostrarToast('Registro borrado', 'success');
}

// ── Vista: Historial ─────────────────────────────────────────────
function _renderHistorial(body) {
  const cursoId = calState.cursoActivoId;
  const curso   = calState.cursos[cursoId];
  const data    = cargarAsistencia();
  const byDate  = data[cursoId] || {};
  const fechas  = Object.keys(byDate).sort().reverse(); // más reciente primero

  if (fechas.length === 0) {
    body.innerHTML = `<div class="asist-empty"><span class="material-icons">event_note</span><p>Sin registros de asistencia aún. Pasa lista en la vista de hoy.</p></div>`;
    return;
  }

  const DIAS = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
  body.innerHTML = `
    <div class="asist-hist-wrap">
      <table class="asist-hist-tabla">
        <thead>
          <tr>
            <th class="asist-hist-th-nombre">Estudiante</th>
            ${fechas.map(f => {
              const d = new Date(f + 'T12:00:00');
              return `<th class="asist-hist-th-fecha" title="${f}">
                <div>${DIAS[d.getDay()]}</div>
                <div>${d.getDate()}/${d.getMonth()+1}</div>
              </th>`;
            }).join('')}
            <th class="asist-hist-th-pct">%</th>
          </tr>
        </thead>
        <tbody>
          ${curso.estudiantes.map(est => {
            const stats = _statsAsistencia(cursoId, est.id);
            const cls   = stats.pct === null ? '' : stats.pct >= 80 ? 'ok' : stats.pct >= 60 ? 'warn' : 'bad';
            return `<tr>
              <td class="asist-hist-td-nombre">${escapeHTML(est.nombre)}</td>
              ${fechas.map(f => {
                const v = (byDate[f] || {})[est.id];
                const icono = { P:'check_circle', A:'cancel', T:'schedule', E:'assignment_turned_in' }[v] || '';
                const color = { P:'#2E7D32', A:'#C62828', T:'#E65100', E:'#1565C0' }[v] || '#CFD8DC';
                return `<td class="asist-hist-td-estado" onclick="marcarAsistencia('${est.id}','${v==='P'?'A':v==='A'?'T':v==='T'?'E':v==='E'?'P':'P'}','${f}');_renderizarVistaAsistencia();" style="cursor:pointer;" title="${v||'Sin registro'} — clic para cambiar">
                  ${icono ? `<span class="material-icons" style="font-size:16px;color:${color};">${icono}</span>` : '<span style="color:#CFD8DC;font-size:12px;">·</span>'}
                </td>`;
              }).join('')}
              <td class="asist-hist-td-pct ${cls}">${stats.pct !== null ? stats.pct + '%' : '—'}</td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>`;
}

// ── Vista: Reporte ───────────────────────────────────────────────
function _renderReporte(body) {
  const cursoId = calState.cursoActivoId;
  const curso   = calState.cursos[cursoId];
  const data    = cargarAsistencia();
  const byDate  = data[cursoId] || {};
  const totalDias = Object.keys(byDate).length;

  if (totalDias === 0) {
    body.innerHTML = `<div class="asist-empty"><span class="material-icons">bar_chart</span><p>Sin datos para generar reporte.</p></div>`;
    return;
  }

  // Umbral configurable
  const umbral = parseInt(localStorage.getItem('asist_umbral') || ASIST_UMBRAL_DEFAULT);

  const rows = curso.estudiantes.map(est => {
    const s = _statsAsistencia(cursoId, est.id);
    return { est, ...s };
  }).sort((a, b) => (a.pct||0) - (b.pct||0));

  const bajoUmbral = rows.filter(r => r.pct !== null && r.pct < umbral);

  body.innerHTML = `
    <div class="asist-rep-header">
      <div class="asist-rep-stat">
        <div class="asist-rep-num">${totalDias}</div>
        <div class="asist-rep-lbl">Clases registradas</div>
      </div>
      <div class="asist-rep-stat">
        <div class="asist-rep-num">${curso.estudiantes.length}</div>
        <div class="asist-rep-lbl">Estudiantes</div>
      </div>
      <div class="asist-rep-stat ${bajoUmbral.length>0?'bad':'ok'}">
        <div class="asist-rep-num">${bajoUmbral.length}</div>
        <div class="asist-rep-lbl">Bajo umbral (${umbral}%)</div>
      </div>
      <div style="display:flex;align-items:center;gap:8px;margin-left:auto;">
        <label style="font-size:0.78rem;font-weight:700;color:#546E7A;">Umbral %</label>
        <input type="number" value="${umbral}" min="1" max="100"
          onchange="localStorage.setItem('asist_umbral',this.value);_renderizarVistaAsistencia();"
          style="width:64px;padding:5px 8px;border:1.5px solid #90CAF9;border-radius:8px;font-size:0.9rem;font-weight:700;">
      </div>
    </div>

    ${bajoUmbral.length > 0 ? `
    <div class="asist-rep-alerta">
      <span class="material-icons">warning</span>
      <strong>${bajoUmbral.length} estudiante(s) bajo el umbral de ${umbral}%:</strong>
      ${bajoUmbral.map(r => `<span class="asist-rep-chip-bad">${escapeHTML(r.est.nombre)} (${r.pct}%)</span>`).join('')}
    </div>` : ''}

    <div class="asist-rep-tabla-wrap">
      <table class="asist-rep-tabla">
        <thead>
          <tr>
            <th>Estudiante</th>
            <th title="Presentes">✓ P</th>
            <th title="Tardanzas">⏱ T</th>
            <th title="Ausentes">✗ A</th>
            <th title="Excusas">📋 E</th>
            <th>Total</th>
            <th>% Asist.</th>
          </tr>
        </thead>
        <tbody>
          ${rows.map(r => {
            const cls = r.pct === null ? '' : r.pct >= umbral ? 'ok' : r.pct >= 60 ? 'warn' : 'bad';
            const barW = r.pct !== null ? r.pct : 0;
            const barColor = cls === 'ok' ? '#2E7D32' : cls === 'warn' ? '#E65100' : '#C62828';
            return `<tr class="asist-rep-row ${r.pct !== null && r.pct < umbral ? 'fila-alerta' : ''}">
              <td class="asist-rep-nombre">${escapeHTML(r.est.nombre)}</td>
              <td class="pres">${r.P}</td>
              <td class="tard">${r.T}</td>
              <td class="ause">${r.A}</td>
              <td class="excu">${r.E||0}</td>
              <td>${r.total}</td>
              <td>
                <div class="asist-bar-wrap">
                  <div class="asist-bar" style="width:${barW}%;background:${barColor};"></div>
                </div>
                <span class="asist-rep-pct ${cls}">${r.pct !== null ? r.pct + '%' : '—'}</span>
              </td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>`;
}


// ════════════════════════════════════════════════════════════════════
// MÓDULO: BUSCADOR DE ESTUDIANTES
// ════════════════════════════════════════════════════════════════════

let _buscarSeleccionado = null; // { cursoId, estId }

function abrirBuscadorEstudiante() {
  const overlay = document.getElementById('buscar-overlay');
  if (!overlay) return;
  overlay.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  _buscarSeleccionado = null;
  // Limpiar estado
  const input = document.getElementById('buscar-input');
  if (input) { input.value = ''; input.focus(); }
  document.getElementById('buscar-lista').innerHTML = '';
  document.getElementById('buscar-perfil').innerHTML = `
    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;color:#B0BEC5;text-align:center;padding:20px;">
      <span class="material-icons" style="font-size:3rem;margin-bottom:10px;opacity:0.4;">person_search</span>
      <p style="font-size:0.88rem;">Escribe el nombre de un estudiante<br>para ver su perfil completo.</p>
    </div>`;
  document.getElementById('buscar-resultados-count').textContent = '';
  // Si hay cursos, mostrar todos los estudiantes inicialmente
  buscarEstudiante('');
}

function cerrarBuscadorEstudiante() {
  document.getElementById('buscar-overlay')?.classList.add('hidden');
  document.body.style.overflow = '';
}

function buscarEstudiante(query) {
  const q = query.trim().toLowerCase();
  const lista = document.getElementById('buscar-lista');
  const countEl = document.getElementById('buscar-resultados-count');
  if (!lista) return;

  // Recopilar todos los estudiantes de todos los cursos
  const resultados = [];
  Object.values(calState.cursos).forEach(curso => {
    (curso.estudiantes || []).forEach(est => {
      if (!q || est.nombre.toLowerCase().includes(q)) {
        resultados.push({ curso, est });
      }
    });
  });

  // Ordenar: primero los que empiezan con la query, luego el resto
  resultados.sort((a, b) => {
    const na = a.est.nombre.toLowerCase();
    const nb = b.est.nombre.toLowerCase();
    if (q) {
      const aStarts = na.startsWith(q);
      const bStarts = nb.startsWith(q);
      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;
    }
    return na.localeCompare(nb, 'es');
  });

  const total = Object.values(calState.cursos).reduce((s, c) => s + (c.estudiantes?.length || 0), 0);
  if (total === 0) {
    lista.innerHTML = `<div style="padding:20px;text-align:center;color:#9E9E9E;font-size:0.82rem;">No hay estudiantes registrados.</div>`;
    if (countEl) countEl.textContent = '';
    return;
  }

  if (countEl) {
    countEl.textContent = q
      ? `${resultados.length} resultado(s) de ${total} estudiantes`
      : `${total} estudiante(s) en ${Object.keys(calState.cursos).length} curso(s)`;
  }

  if (resultados.length === 0) {
    lista.innerHTML = `<div style="padding:20px;text-align:center;color:#9E9E9E;font-size:0.82rem;">Sin resultados para "${escapeHTML(query)}".</div>`;
    return;
  }

  // Agrupar por curso
  const grupos = {};
  resultados.forEach(r => {
    const key = r.curso.id;
    if (!grupos[key]) grupos[key] = { curso: r.curso, ests: [] };
    grupos[key].ests.push(r.est);
  });

  lista.innerHTML = Object.values(grupos).map(g => {
    const nEst = g.ests.length;
    return `
      <div class="buscar-grupo-label">${escapeHTML(g.curso.nombre)} <span>${nEst}</span></div>
      ${g.ests.map(est => {
        const notaFinal = _calcNotaFinal(g.curso, est.id);
        const cls = notaFinal === null ? '' : notaFinal >= 70 ? 'apr' : notaFinal >= 60 ? 'reg' : 'rep';
        const isActive = _buscarSeleccionado?.estId === est.id && _buscarSeleccionado?.cursoId === g.curso.id;
        return `<div class="buscar-item ${isActive?'activo':''}"
          onclick="seleccionarEstudianteBuscar('${g.curso.id}','${est.id}')">
          <div class="buscar-item-avatar">${escapeHTML(est.nombre.trim()[0]?.toUpperCase()||'?')}</div>
          <div class="buscar-item-info">
            <div class="buscar-item-nombre">${_resaltarTexto(escapeHTML(est.nombre), q)}</div>
            <div class="buscar-item-curso">${escapeHTML(g.curso.nombre)}</div>
          </div>
          ${notaFinal !== null ? `<div class="buscar-item-nota ${cls}">${notaFinal.toFixed(1)}</div>` : ''}
        </div>`;
      }).join('')}`;
  }).join('');

  // Auto-seleccionar el primero si hay exactamente un resultado
  if (resultados.length === 1 && q) {
    seleccionarEstudianteBuscar(resultados[0].curso.id, resultados[0].est.id);
  }
}

function _resaltarTexto(texto, query) {
  if (!query) return texto;
  const idx = texto.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return texto;
  return texto.substring(0, idx)
    + `<mark style="background:#FFF176;border-radius:2px;padding:0 1px;">${texto.substring(idx, idx + query.length)}</mark>`
    + texto.substring(idx + query.length);
}

function seleccionarEstudianteBuscar(cursoId, estId) {
  _buscarSeleccionado = { cursoId, estId };

  // Actualizar estado activo en la lista
  document.querySelectorAll('.buscar-item').forEach(el => el.classList.remove('activo'));
  const items = document.querySelectorAll('.buscar-item');
  items.forEach(el => {
    if (el.onclick?.toString().includes(cursoId) && el.onclick?.toString().includes(estId)) {
      el.classList.add('activo');
    }
  });
  // Re-renderizar lista para reflejar selección
  buscarEstudiante(document.getElementById('buscar-input')?.value || '');

  _renderizarPerfilEstudiante(cursoId, estId);
}

function _renderizarPerfilEstudiante(cursoId, estId) {
  const perfil = document.getElementById('buscar-perfil');
  if (!perfil) return;

  const curso = calState.cursos[cursoId];
  if (!curso) return;
  const est = (curso.estudiantes || []).find(e => e.id === estId);
  if (!est) return;

  // ── Datos de notas ──
  const rasKeys = Object.keys(curso.ras || {});
  const notaFinal = _calcNotaFinal(curso, estId);
  const clsFinal  = notaFinal === null ? '' : notaFinal >= 70 ? 'apr' : notaFinal >= 60 ? 'reg' : 'rep';
  const biblio    = cargarBiblioteca();

  // ── Datos de asistencia ──
  const asistStats = _statsAsistencia(cursoId, estId);
  const clsAsist   = asistStats.pct === null ? '' : asistStats.pct >= 80 ? 'apr' : asistStats.pct >= 60 ? 'reg' : 'rep';

  // ── Posición en el curso (ranking) ──
  const promediosCurso = (curso.estudiantes || [])
    .map(e => ({ id: e.id, nota: _calcNotaFinal(curso, e.id) }))
    .filter(e => e.nota !== null)
    .sort((a, b) => b.nota - a.nota);
  const posicion = promediosCurso.findIndex(e => e.id === estId) + 1;
  const totalConNotas = promediosCurso.length;

  // ── Notas de clase escritas para este estudiante (vía sección del curso) ──
  // Las notas son por clase (no por estudiante), pero podemos mostrar cuántas hay
  const notasClase = Object.entries(localStorage)
    .filter(([k]) => k.startsWith(`notaclase_`) && k.includes(`_${curso.nombre}_`))
    .sort(([a],[b]) => b.localeCompare(a)) // más reciente primero
    .slice(0, 5);

  // ── Observaciones guardadas (clave por estudiante) ──
  const obsKey   = `obs_est_${estId}`;
  const obsGuard = localStorage.getItem(obsKey) || '';

  // Calcular letra de color del avatar
  const avatarColors = ['#1565C0','#00695C','#4527A0','#E65100','#AD1457','#BF360C','#1B5E20','#6A1B9A'];
  const avatarColor  = avatarColors[est.nombre.charCodeAt(0) % avatarColors.length];

  perfil.innerHTML = `
    <!-- Cabecera del perfil -->
    <div class="perfil-header">
      <div class="perfil-avatar" style="background:${avatarColor};">
        ${escapeHTML(est.nombre.trim()[0]?.toUpperCase()||'?')}
      </div>
      <div class="perfil-info">
        <div class="perfil-nombre">${escapeHTML(est.nombre)}</div>
        <div class="perfil-curso">
          <span class="material-icons" style="font-size:14px;">class</span>
          ${escapeHTML(curso.nombre)}
        </div>
        ${posicion > 0 ? `
        <div class="perfil-ranking">
          <span class="material-icons" style="font-size:13px;">leaderboard</span>
          Posición ${posicion} de ${totalConNotas} estudiantes con notas
        </div>` : ''}
      </div>
      <div class="perfil-nota-final ${clsFinal}">
        ${notaFinal !== null ? notaFinal.toFixed(1) : '—'}
        <div style="font-size:0.65rem;font-weight:500;opacity:0.8;">Final</div>
      </div>
    </div>

    <!-- Stats rápidas -->
    <div class="perfil-stats-row">
      <div class="perfil-stat">
        <div class="perfil-stat-num ${clsAsist}">${asistStats.pct !== null ? asistStats.pct + '%' : '—'}</div>
        <div class="perfil-stat-lbl">Asistencia</div>
        <div class="perfil-stat-sub">${asistStats.P}P · ${asistStats.T}T · ${asistStats.A}A · ${asistStats.E||0}E</div>
      </div>
      <div class="perfil-stat">
        <div class="perfil-stat-num">${asistStats.total}</div>
        <div class="perfil-stat-lbl">Clases registradas</div>
      </div>
      <div class="perfil-stat">
        <div class="perfil-stat-num">${(curso.estudiantes||[]).length}</div>
        <div class="perfil-stat-lbl">Compañeros en curso</div>
      </div>
    </div>

    <!-- Notas por RA -->
    ${rasKeys.length > 0 ? `
    <div class="perfil-seccion">
      <div class="perfil-seccion-titulo">
        <span class="material-icons">grade</span>Calificaciones por RA
      </div>
      ${rasKeys.map(rk => {
        const raInfo = curso.ras[rk];
        const notaRA = _calcNotaRA(curso, estId, rk);
        const clsRA  = notaRA === null ? '' : _clsNota(notaRA, raInfo.valorTotal);
        const pctRA  = notaRA !== null && raInfo.valorTotal ? Math.round((notaRA / raInfo.valorTotal) * 100) : null;
        // Notas por actividad
        const actividades = raInfo.actividades || [];
        return `
        <div class="perfil-ra-card">
          <div class="perfil-ra-header">
            <span class="perfil-ra-modulo">${escapeHTML((raInfo.modulo||raInfo.label||rk).substring(0,40))}</span>
            <span class="perfil-ra-total ${clsRA}">${notaRA !== null ? notaRA.toFixed(1) : '—'} / ${raInfo.valorTotal}</span>
          </div>
          ${pctRA !== null ? `
          <div class="perfil-ra-bar-wrap">
            <div class="perfil-ra-bar" style="width:${pctRA}%;background:${pctRA>=70?'#2E7D32':pctRA>=60?'#E65100':'#C62828'};"></div>
          </div>` : ''}
          ${actividades.length ? `
          <div class="perfil-ra-acts">
            ${actividades.slice(0,8).map((actId, i) => {
              const nota = curso.notas?.[estId]?.[rk]?.[actId];
              const max  = raInfo.valores?.[actId] || 100;
              const cls2 = nota !== undefined ? _clsNota(nota, max) : 'vacio';
              return `<span class="perfil-act-badge ${cls2}" title="Act.${i+1} — Máx: ${max}pts">
                ${nota !== undefined ? nota : '—'}
              </span>`;
            }).join('')}
            ${actividades.length > 8 ? `<span style="font-size:0.7rem;color:#9E9E9E;">+${actividades.length-8} más</span>` : ''}
          </div>` : ''}
        </div>`;
      }).join('')}
    </div>` : `
    <div class="perfil-seccion" style="text-align:center;padding:16px;color:#9E9E9E;font-size:0.82rem;">
      <span class="material-icons" style="display:block;font-size:2rem;opacity:0.3;margin-bottom:6px;">assignment</span>
      Sin calificaciones registradas aún.
    </div>`}

    <!-- Notas recientes de la clase (del curso) -->
    ${notasClase.length > 0 ? `
    <div class="perfil-seccion">
      <div class="perfil-seccion-titulo">
        <span class="material-icons">edit_note</span>Notas recientes de clase (${escapeHTML(curso.nombre)})
      </div>
      ${notasClase.map(([k, v]) => {
        const parts  = k.split('_'); // notaclase_FECHA_SECCION_PERIODO
        const fecha  = parts[1] || '';
        const periodo= parts[3] || '';
        const fechaFmt = fecha ? new Date(fecha+'T12:00:00').toLocaleDateString('es-DO',{weekday:'short',day:'2-digit',month:'short'}) : '';
        return `<div class="perfil-nota-clase">
          <div class="perfil-nota-meta">
            <span class="material-icons" style="font-size:13px;">today</span>
            ${fechaFmt}${periodo ? ` · P${periodo}` : ''}
          </div>
          <div class="perfil-nota-txt">${escapeHTML(v.substring(0,160))}${v.length>160?'…':''}</div>
        </div>`;
      }).join('')}
    </div>` : ''}

    <!-- Comentarios del estudiante -->
    <div class="perfil-seccion">
      <div class="perfil-seccion-titulo">
        <span class="material-icons">comment</span>Comentarios
        <span style="margin-left:auto;font-size:0.7rem;font-weight:400;color:#9E9E9E;">
          ${_getComentariosEst(estId).length > 0 ? _getComentariosEst(estId).length + ' comentario(s)' : ''}
        </span>
      </div>
      <input type="hidden" id="coment-cat-select" value="">
      <div id="perfil-comentarios-wrap"></div>
    </div>

    <!-- Acciones rápidas -->
    <div class="perfil-acciones">
      <button onclick="cerrarBuscadorEstudiante();activarCurso('${cursoId}');setTimeout(()=>abrirCalificaciones(),50);"
        class="perfil-accion-btn">
        <span class="material-icons">grade</span> Ver en calificaciones
      </button>
      <button onclick="cerrarBuscadorEstudiante();activarCurso('${cursoId}');setTimeout(()=>{abrirCalificaciones();setTimeout(()=>toggleVistaAsistencia(),300);},50);"
        class="perfil-accion-btn">
        <span class="material-icons">how_to_reg</span> Ver asistencia
      </button>
    </div>
  `;

  // Renderizar comentarios
  renderizarComentariosEnPerfil(estId);
}

// ════════════════════════════════════════════════════════════════════
// MÓDULO: COMENTARIOS POR ESTUDIANTE
// ════════════════════════════════════════════════════════════════════
const COMENT_KEY = 'planificadorRA_comentarios_v1';
const COMENT_CATEGORIAS = [
  { id: 'academico',    label: 'Académico',     icono: 'school',       color: '#1565C0' },
  { id: 'conducta',     label: 'Conducta',      icono: 'emoji_people', color: '#E65100' },
  { id: 'asistencia',   label: 'Asistencia',    icono: 'how_to_reg',   color: '#00695C' },
  { id: 'fortaleza',    label: 'Fortaleza',     icono: 'star',         color: '#F9A825' },
  { id: 'seguimiento',  label: 'Seguimiento',   icono: 'track_changes',color: '#6A1B9A' },
  { id: 'padre',        label: 'Contacto/Padre',icono: 'supervisor_account', color: '#AD1457' },
  { id: 'otro',         label: 'Otro',          icono: 'label',        color: '#546E7A' },
];

function cargarComentarios() {
  try { return JSON.parse(localStorage.getItem(COMENT_KEY) || '{}'); } catch { return {}; }
}
function guardarComentarios(data) {
  localStorage.setItem(COMENT_KEY, JSON.stringify(data));
}

// Obtener comentarios de un estudiante, ordenados más reciente primero
function _getComentariosEst(estId) {
  const data = cargarComentarios();
  return (data[estId] || []).slice().sort((a, b) => b.ts - a.ts);
}

// ── Renderizar sección de comentarios dentro del perfil ──────────
function renderizarComentariosEnPerfil(estId) {
  const wrap = document.getElementById('perfil-comentarios-wrap');
  if (!wrap) return;

  const lista = _getComentariosEst(estId);
  const catSelec = document.getElementById('coment-cat-select')?.value || '';

  const filtrados = catSelec ? lista.filter(c => c.categoria === catSelec) : lista;

  const badgesCat = COMENT_CATEGORIAS.map(cat => {
    const n = lista.filter(c => c.categoria === cat.id).length;
    if (!n) return '';
    const activo = catSelec === cat.id;
    return `<button class="coment-cat-filter ${activo?'activo':''}"
      style="${activo ? `background:${cat.color}18;border-color:${cat.color};color:${cat.color};` : ''}"
      onclick="document.getElementById('coment-cat-select').value='${activo?'':cat.id}';renderizarComentariosEnPerfil('${estId}')">
      <span class="material-icons" style="font-size:13px;">${cat.icono}</span>${cat.label}
      <span class="coment-cat-n">${n}</span>
    </button>`;
  }).filter(Boolean).join('');

  wrap.innerHTML = `
    <!-- Formulario nuevo comentario -->
    <div class="coment-form" id="coment-form-wrap">
      <select id="coment-cat-select" onchange="renderizarComentariosEnPerfil('${estId}')"
        style="padding:7px 10px;border:1.5px solid #E0E0E0;border-radius:8px;font-size:0.82rem;font-family:inherit;background:#fff;">
        <option value="">Todas las categorías</option>
        ${COMENT_CATEGORIAS.map(c => `<option value="${c.id}">${c.label}</option>`).join('')}
      </select>
      <button class="coment-btn-nuevo" onclick="abrirFormComentario('${estId}')">
        <span class="material-icons">add</span> Agregar comentario
      </button>
    </div>

    <!-- Formulario de entrada (oculto por defecto) -->
    <div class="coment-input-area hidden" id="coment-input-area">
      <div style="display:flex;gap:8px;margin-bottom:8px;flex-wrap:wrap;">
        ${COMENT_CATEGORIAS.map(c => `
        <button class="coment-cat-btn" data-cat="${c.id}" style="border-color:${c.color}20;"
          onclick="seleccionarCatComentario(this,'${c.color}','${estId}')">
          <span class="material-icons" style="font-size:14px;color:${c.color};">${c.icono}</span>
          ${c.label}
        </button>`).join('')}
      </div>
      <input type="hidden" id="coment-cat-nueva" value="otro">
      <textarea id="coment-texto-nueva" placeholder="Escribe el comentario…"
        style="width:100%;min-height:80px;padding:9px 12px;border:1.5px solid #90CAF9;border-radius:9px;
               font-size:0.84rem;font-family:inherit;resize:vertical;box-sizing:border-box;line-height:1.5;"
        onkeydown="if(event.ctrlKey&&event.key==='Enter')guardarComentarioNuevo('${estId}')"></textarea>
      <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:6px;">
        <button onclick="cerrarFormComentario()" style="background:none;border:1.5px solid #E0E0E0;color:#757575;border-radius:8px;padding:6px 14px;font-size:0.8rem;cursor:pointer;">Cancelar</button>
        <button onclick="guardarComentarioNuevo('${estId}')" class="coment-btn-guardar">
          <span class="material-icons" style="font-size:15px;">save</span> Guardar <span style="font-size:0.7rem;opacity:0.7;">(Ctrl+Enter)</span>
        </button>
      </div>
    </div>

    <!-- Filtros por categoría -->
    ${badgesCat ? `<div class="coment-filtros">${badgesCat}</div>` : ''}

    <!-- Lista de comentarios -->
    <div class="coment-lista" id="coment-lista">
      ${filtrados.length === 0 ? `
        <div class="coment-vacio">
          <span class="material-icons">chat_bubble_outline</span>
          <p>${lista.length === 0
            ? 'Sin comentarios aún. Usa el botón de arriba para agregar el primero.'
            : 'Sin comentarios en esta categoría.'
          }</p>
        </div>` :
        filtrados.map(c => _renderComentarioHTML(c, estId)).join('')
      }
    </div>`;
}

function _renderComentarioHTML(c, estId) {
  const cat   = COMENT_CATEGORIAS.find(x => x.id === c.categoria) || COMENT_CATEGORIAS[6];
  const fecha = new Date(c.ts).toLocaleDateString('es-DO', { weekday:'short', day:'2-digit', month:'short', year:'numeric' });
  const hora  = new Date(c.ts).toLocaleTimeString('es-DO', { hour:'2-digit', minute:'2-digit' });
  return `
  <div class="coment-item" id="coment-${c.id}">
    <div class="coment-item-header">
      <span class="coment-cat-badge" style="background:${cat.color}18;color:${cat.color};border:1px solid ${cat.color}33;">
        <span class="material-icons" style="font-size:12px;">${cat.icono}</span>${cat.label}
      </span>
      <span class="coment-fecha">${fecha} · ${hora}</span>
      <div class="coment-item-acciones">
        <button onclick="editarComentario('${c.id}','${estId}')" title="Editar" class="coment-accion-btn">
          <span class="material-icons">edit</span>
        </button>
        <button onclick="eliminarComentario('${c.id}','${estId}')" title="Eliminar" class="coment-accion-btn del">
          <span class="material-icons">delete_outline</span>
        </button>
      </div>
    </div>
    <div class="coment-texto" id="coment-txt-${c.id}">${escapeHTML(c.texto)}</div>
  </div>`;
}

function abrirFormComentario(estId) {
  document.getElementById('coment-input-area')?.classList.remove('hidden');
  document.getElementById('coment-btn-nuevo')?.classList.add('hidden');
  const ta = document.getElementById('coment-texto-nueva');
  if (ta) { ta.value = ''; ta.focus(); }
  // Seleccionar categoría por defecto "otro"
  const catOtro = document.querySelector('.coment-cat-btn[data-cat="otro"]');
  if (catOtro) seleccionarCatComentario(catOtro, '#546E7A', estId);
}

function cerrarFormComentario() {
  document.getElementById('coment-input-area')?.classList.add('hidden');
}

function seleccionarCatComentario(btn, color, estId) {
  document.querySelectorAll('.coment-cat-btn').forEach(b => {
    b.style.background = '';
    b.style.borderColor = '';
    b.style.color = '';
    b.style.fontWeight = '';
  });
  btn.style.background   = color + '18';
  btn.style.borderColor  = color;
  btn.style.color        = color;
  btn.style.fontWeight   = '800';
  const input = document.getElementById('coment-cat-nueva');
  if (input) input.value = btn.dataset.cat;
}

function guardarComentarioNuevo(estId) {
  const texto = document.getElementById('coment-texto-nueva')?.value?.trim();
  if (!texto) { mostrarToast('Escribe algo antes de guardar', 'error'); return; }
  const cat   = document.getElementById('coment-cat-nueva')?.value || 'otro';
  const data  = cargarComentarios();
  if (!data[estId]) data[estId] = [];
  data[estId].push({ id: uid(), ts: Date.now(), categoria: cat, texto });
  guardarComentarios(data);
  cerrarFormComentario();
  renderizarComentariosEnPerfil(estId);
  // También actualizar badge en la lista de resultados
  _actualizarBadgeComentarios(estId);
  mostrarToast('Comentario guardado', 'success');
}

function editarComentario(comentId, estId) {
  const data = cargarComentarios();
  const lista = data[estId] || [];
  const c = lista.find(x => x.id === comentId);
  if (!c) return;
  const txEl = document.getElementById(`coment-txt-${comentId}`);
  if (!txEl) return;
  // Reemplazar el texto por un inline textarea
  txEl.innerHTML = `
    <textarea style="width:100%;min-height:70px;padding:8px;border:1.5px solid #90CAF9;border-radius:8px;
                     font-size:0.83rem;font-family:inherit;resize:vertical;box-sizing:border-box;"
      id="edit-ta-${comentId}"
      onkeydown="if(event.ctrlKey&&event.key==='Enter')confirmarEditComentario('${comentId}','${estId}')"
    >${escapeHTML(c.texto)}</textarea>
    <div style="display:flex;justify-content:flex-end;gap:6px;margin-top:5px;">
      <button onclick="renderizarComentariosEnPerfil('${estId}')"
        style="background:none;border:1.5px solid #E0E0E0;color:#757575;border-radius:7px;padding:4px 12px;font-size:0.78rem;cursor:pointer;">
        Cancelar
      </button>
      <button onclick="confirmarEditComentario('${comentId}','${estId}')"
        style="background:#1565C0;border:none;color:#fff;border-radius:7px;padding:4px 12px;font-size:0.78rem;font-weight:700;cursor:pointer;">
        Guardar
      </button>
    </div>`;
  document.getElementById(`edit-ta-${comentId}`)?.focus();
}

function confirmarEditComentario(comentId, estId) {
  const nuevoTexto = document.getElementById(`edit-ta-${comentId}`)?.value?.trim();
  if (!nuevoTexto) { mostrarToast('El comentario no puede estar vacío', 'error'); return; }
  const data  = cargarComentarios();
  const lista = data[estId] || [];
  const c = lista.find(x => x.id === comentId);
  if (c) { c.texto = nuevoTexto; c.editado = Date.now(); }
  guardarComentarios(data);
  renderizarComentariosEnPerfil(estId);
  mostrarToast('Comentario actualizado', 'success');
}

function eliminarComentario(comentId, estId) {
  if (!confirm('¿Eliminar este comentario?')) return;
  const data  = cargarComentarios();
  data[estId] = (data[estId] || []).filter(c => c.id !== comentId);
  guardarComentarios(data);
  renderizarComentariosEnPerfil(estId);
  _actualizarBadgeComentarios(estId);
  mostrarToast('Comentario eliminado', 'success');
}

function _actualizarBadgeComentarios(estId) {
  const n = _getComentariosEst(estId).length;
  const badge = document.getElementById(`coment-badge-${estId}`);
  if (badge) badge.textContent = n > 0 ? n : '';
}

// ── Mini-preview de comentarios en la tabla de calificaciones ────
function abrirComentariosEstudiante(estId, nombreEstOrId) {
  // Buscar el nombre real del estudiante en cualquier curso
  let nombreEst = nombreEstOrId;
  if (!nombreEst || nombreEst === estId) {
    for (const curso of Object.values(calState.cursos)) {
      const est = (curso.estudiantes||[]).find(e => e.id === estId);
      if (est) { nombreEst = est.nombre; break; }
    }
  }
  const curso = calState.cursos[calState.cursoActivoId];
  if (!curso) return;

  document.getElementById('modal-title').innerHTML =
    `<span class="material-icons" style="vertical-align:middle;font-size:18px;margin-right:6px;color:#1565C0;">comment</span>
     Comentarios — ${escapeHTML(nombreEst)}`;

  document.getElementById('modal-body').innerHTML = `
    <input type="hidden" id="coment-cat-select" value="">
    <div id="perfil-comentarios-wrap"></div>`;

  // footer instrumento visible (solo cerrar modal al terminar)

  document.getElementById('modal-overlay').classList.remove('hidden');
  document.body.style.overflow = 'hidden';

  renderizarComentariosEnPerfil(estId);
}


// ── Guardado con debounce de observaciones ───────────────────────
let _obsDebounce = null;
function guardarObsEstudiante(key, valor) {
  clearTimeout(_obsDebounce);
  const ind = document.getElementById('perfil-obs-saved');
  if (ind) ind.style.display = 'none';
  _obsDebounce = setTimeout(() => {
    if (valor.trim()) localStorage.setItem(key, valor);
    else              localStorage.removeItem(key);
    if (ind) ind.style.display = 'inline';
  }, 600);
}


// ════════════════════════════════════════════════════════════════════
// MÓDULO: NOTIFICACIONES Y RECORDATORIOS
// ════════════════════════════════════════════════════════════════════

// Genera la lista de notificaciones activas
function _generarNotificaciones() {
  const notifs = [];
  const hoy    = new Date(); hoy.setHours(0,0,0,0);
  const ahora  = new Date();

  // ── 1. Tareas vencidas ──────────────────────────────────────────
  const tareas = cargarTareas();
  const tvenc  = tareas.filter(t => t.estado !== 'entregada' && t.fechaVencimiento &&
    new Date(t.fechaVencimiento).setHours(0,0,0,0) < hoy.getTime());
  if (tvenc.length) {
    notifs.push({
      id: 'tareas_vencidas', tipo: 'error', icono: 'assignment_late',
      titulo: `${tvenc.length} tarea(s) vencida(s)`,
      detalle: tvenc.map(t => `• ${t.descripcion||'Sin descripción'} (${t.seccion||''})`).join('\n'),
      accion: { label: 'Ver tareas', fn: 'abrirTareas' }
    });
  }

  // ── 2. Tareas que vencen hoy ────────────────────────────────────
  const thoy = tareas.filter(t => t.estado !== 'entregada' && t.fechaVencimiento &&
    new Date(t.fechaVencimiento).setHours(0,0,0,0) === hoy.getTime());
  if (thoy.length) {
    notifs.push({
      id: 'tareas_hoy', tipo: 'warning', icono: 'alarm',
      titulo: `${thoy.length} tarea(s) vencen hoy`,
      detalle: thoy.map(t => `• ${t.descripcion||'Sin descripción'} (${t.seccion||''})`).join('\n'),
      accion: { label: 'Ver tareas', fn: 'abrirTareas' }
    });
  }

  // ── 3. Tareas que vencen mañana ─────────────────────────────────
  const manana = new Date(hoy); manana.setDate(manana.getDate() + 1);
  const tman   = tareas.filter(t => t.estado !== 'entregada' && t.fechaVencimiento &&
    new Date(t.fechaVencimiento).setHours(0,0,0,0) === manana.getTime());
  if (tman.length) {
    notifs.push({
      id: 'tareas_manana', tipo: 'warning', icono: 'event',
      titulo: `${tman.length} tarea(s) vencen mañana`,
      detalle: tman.map(t => `• ${t.descripcion||'Sin descripción'} (${t.seccion||''})`).join('\n'),
      accion: { label: 'Ver tareas', fn: 'abrirTareas' }
    });
  }

  // ── 4. Cursos sin planificación asignada ────────────────────────
  const _biblioIds = new Set((cargarBiblioteca().items||[]).map(i => i.id));
  const sinPlan = Object.values(calState.cursos).filter(c =>
    !(c.planIds||[]).some(pid => _biblioIds.has(pid))
  );
  if (sinPlan.length) {
    notifs.push({
      id: 'cursos_sin_plan', tipo: 'info', icono: 'folder_off',
      titulo: `${sinPlan.length} curso(s) sin planificación`,
      detalle: sinPlan.map(c => `• ${c.nombre}`).join('\n'),
      accion: { label: 'Ver calificaciones', fn: 'abrirCalificaciones' }
    });
  }

  // ── 5. Asistencia no pasada hace 2+ días hábiles ────────────────
  const horario   = cargarHorario().filter(e => e.materia);
  const asistData = cargarAsistencia();
  const cursosConHorario = {};
  horario.forEach(e => {
    if (e.seccion) cursosConHorario[e.seccion] = true;
  });
  const cursosAlerta = [];
  Object.values(calState.cursos).forEach(curso => {
    if (!cursosConHorario[curso.nombre]) return;
    if (!curso.estudiantes?.length) return;
    const diasAsist = Object.keys((asistData[curso.id] || {})).sort().reverse();
    if (!diasAsist.length) {
      cursosAlerta.push({ nombre: curso.nombre, dias: 'nunca' });
    } else {
      const ultima = new Date(diasAsist[0] + 'T12:00:00');
      const diffDias = Math.round((hoy - ultima) / 86400000);
      if (diffDias > 2) cursosAlerta.push({ nombre: curso.nombre, dias: diffDias });
    }
  });
  if (cursosAlerta.length) {
    notifs.push({
      id: 'asist_pendiente', tipo: 'warning', icono: 'how_to_reg',
      titulo: `Asistencia pendiente en ${cursosAlerta.length} curso(s)`,
      detalle: cursosAlerta.map(c =>
        `• ${c.nombre}: ${c.dias === 'nunca' ? 'nunca registrada' : `hace ${c.dias} días`}`
      ).join('\n'),
      accion: { label: 'Ir a calificaciones', fn: 'abrirCalificaciones' }
    });
  }

  // ── 6. Estudiantes bajo umbral de asistencia ────────────────────
  const umbral = parseInt(localStorage.getItem('asist_umbral') || '80');
  const bajosUmbral = [];
  Object.values(calState.cursos).forEach(curso => {
    (curso.estudiantes||[]).forEach(est => {
      const s = _statsAsistencia(curso.id, est.id);
      if (s.pct !== null && s.pct < umbral && s.total >= 3) {
        bajosUmbral.push({ nombre: est.nombre, curso: curso.nombre, pct: s.pct });
      }
    });
  });
  if (bajosUmbral.length) {
    bajosUmbral.sort((a,b) => a.pct - b.pct);
    notifs.push({
      id: 'bajo_umbral', tipo: 'error', icono: 'person_off',
      titulo: `${bajosUmbral.length} estudiante(s) bajo ${umbral}% de asistencia`,
      detalle: bajosUmbral.slice(0,6).map(e =>
        `• ${e.nombre} (${e.curso}): ${e.pct}%`
      ).join('\n') + (bajosUmbral.length > 6 ? `\n  …y ${bajosUmbral.length-6} más` : ''),
      accion: { label: 'Ver asistencia', fn: 'abrirCalificaciones' }
    });
  }

  // ── 7. Clases de hoy sin actividad planificada ─────────────────
  const diasMap = [null,'Lunes','Martes','Miércoles','Jueves','Viernes'];
  const diaJS = ahora.getDay();
  if (diaJS >= 1 && diaJS <= 5) {
    const diaIdx = diaJS - 1;
    const clasesHoy  = cargarHorario().filter(e => e.dia === diaIdx && e.materia);
    const biblio     = cargarBiblioteca();
    const hoyISO     = hoy.toISOString().split('T')[0];
    const sinPlanHoy = [];
    clasesHoy.forEach(e => {
      const tienePlan = (biblio.items||[]).some(reg => {
        const cursosConReg = Object.values(calState.cursos).filter(c => (c.planIds||[]).includes(reg.id));
        return cursosConReg.some(c => c.nombre === e.seccion) &&
          (reg.planificacion?.actividades||[]).some(act => act.fecha === hoyISO);
      });
      if (!tienePlan) sinPlanHoy.push(`P${e.periodo}: ${e.materia}${e.seccion?' — '+e.seccion:''}`);
    });
    if (sinPlanHoy.length) {
      notifs.push({
        id: 'sin_plan_hoy', tipo: 'info', icono: 'event_note',
        titulo: `${sinPlanHoy.length} clase(s) de hoy sin actividad planificada`,
        detalle: sinPlanHoy.map(s => `• ${s}`).join('\n'),
        accion: { label: 'Ir a planificaciones', fn: 'abrirPlanificaciones' }
      });
    }
  }

  // ── 8. Notas pendientes de registrar ───────────────────────────
  let actsSinNota = 0;
  Object.values(calState.cursos).forEach(curso => {
    Object.values(curso.ras||{}).forEach(ra => {
      (ra.actividades||[]).forEach(actId => {
        const hayNota = (curso.estudiantes||[]).some(e => {
          const n = curso.notas?.[e.id];
          return n && Object.values(n).some(rn => rn && rn[actId] !== undefined);
        });
        if (!hayNota) actsSinNota++;
      });
    });
  });
  if (actsSinNota > 0) {
    notifs.push({
      id: 'notas_pendientes', tipo: 'info', icono: 'grading',
      titulo: `${actsSinNota} actividad(es) sin notas registradas`,
      detalle: 'Hay actividades en el libro de calificaciones que todavía no tienen notas.',
      accion: { label: 'Ir a calificaciones', fn: 'abrirCalificaciones' }
    });
  }

  return notifs;
}

// ── Actualizar badge del header ──────────────────────────────────
function actualizarBadgeNotificaciones() {
  const notifs  = _generarNotificaciones();
  const urgentes = notifs.filter(n => n.tipo === 'error' || n.tipo === 'warning').length;
  const badge   = document.getElementById('notif-badge');
  if (!badge) return;
  if (urgentes > 0) {
    badge.style.display = 'flex';
    badge.textContent   = urgentes > 9 ? '9+' : urgentes;
  } else {
    badge.style.display = 'none';
  }
}

// ── Abrir/cerrar modal ───────────────────────────────────────────
function abrirNotificaciones() {
  const overlay = document.getElementById('notif-overlay');
  if (!overlay) return;
  overlay.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  _renderizarNotificaciones();
}
function cerrarNotificaciones() {
  document.getElementById('notif-overlay')?.classList.add('hidden');
  document.body.style.overflow = '';
}

function _renderizarNotificaciones() {
  const body   = document.getElementById('notif-modal-body');
  const header = document.getElementById('notif-count-header');
  if (!body) return;
  const notifs = _generarNotificaciones();
  if (header) header.textContent = notifs.length ? `${notifs.length} aviso(s)` : '';

  if (!notifs.length) {
    body.innerHTML = `
      <div style="text-align:center;padding:40px 20px;color:#B0BEC5;">
        <span class="material-icons" style="font-size:3rem;display:block;margin-bottom:10px;opacity:0.4;">check_circle</span>
        <p style="font-size:0.92rem;font-weight:700;color:#78909C;">Todo en orden 🎉</p>
        <p style="font-size:0.78rem;margin-top:4px;">No hay avisos ni recordatorios pendientes.</p>
      </div>`;
    return;
  }

  const COLORES = {
    error:   { bg:'#FFEBEE', border:'#FFCDD2', icon:'#C62828', label:'bg:#FFCDD2;color:#C62828' },
    warning: { bg:'#FFF8E1', border:'#FFE082', icon:'#E65100', label:'bg:#FFF3E0;color:#E65100' },
    info:    { bg:'#E3F2FD', border:'#90CAF9', icon:'#1565C0', label:'bg:#E3F2FD;color:#1565C0' },
  };

  // Agrupar: errores primero, luego warnings, luego info
  const orden = ['error','warning','info'];
  const ordenados = orden.flatMap(tipo => notifs.filter(n => n.tipo === tipo));

  body.innerHTML = ordenados.map(n => {
    const c = COLORES[n.tipo];
    const lineas = n.detalle ? n.detalle.split('\n') : [];
    return `
    <div class="notif-item notif-tipo-${n.tipo}" style="background:${c.bg};border-color:${c.border};">
      <div class="notif-item-header">
        <span class="material-icons notif-icono" style="color:${c.icon};">${n.icono}</span>
        <span class="notif-titulo">${n.titulo}</span>
      </div>
      ${lineas.length ? `
      <div class="notif-detalle">
        ${lineas.slice(0,5).map(l => `<div>${escapeHTML(l)}</div>`).join('')}
        ${lineas.length > 5 ? `<div style="color:#9E9E9E;font-size:0.7rem;">…y ${lineas.length-5} más</div>` : ''}
      </div>` : ''}
      ${n.accion ? `
      <button class="notif-accion-btn" style="${n.tipo==='error'?'background:#FFCDD2;color:#C62828;':n.tipo==='warning'?'background:#FFE082;color:#E65100;':'background:#BBDEFB;color:#1565C0;'}"
        onclick="cerrarNotificaciones();${n.accion.fn}();">
        <span class="material-icons" style="font-size:14px;">arrow_forward</span> ${n.accion.label}
      </button>` : ''}
    </div>`;
  }).join('');
}


// ════════════════════════════════════════════════════════════════════
// MÓDULO: EXPORTAR ASISTENCIA A WORD / PDF
// ════════════════════════════════════════════════════════════════════

function abrirExpAsistencia() {
  const overlay = document.getElementById('exp-asist-overlay');
  if (!overlay) return;

  // Llenar select de cursos
  const sel = document.getElementById('exp-asist-curso');
  if (sel) {
    sel.innerHTML = Object.values(calState.cursos)
      .filter(c => c.estudiantes?.length)
      .map(c => `<option value="${c.id}">${escapeHTML(c.nombre)} (${c.estudiantes.length} est.)</option>`)
      .join('');
    if (!sel.options.length) sel.innerHTML = '<option value="">Sin cursos con estudiantes</option>';
  }

  // Fecha por defecto: este mes
  setExpAsistPeriodo('mes');

  overlay.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  _actualizarPreviewAsistencia();
}

function cerrarExpAsistencia() {
  document.getElementById('exp-asist-overlay')?.classList.add('hidden');
  document.body.style.overflow = '';
}

function setExpAsistPeriodo(tipo) {
  const hoy = new Date();
  const desde = document.getElementById('exp-asist-desde');
  const hasta  = document.getElementById('exp-asist-hasta');
  if (!desde || !hasta) return;
  const fmt = d => d.toISOString().split('T')[0];
  if (tipo === 'mes') {
    desde.value = fmt(new Date(hoy.getFullYear(), hoy.getMonth(), 1));
    hasta.value  = fmt(new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0));
  } else if (tipo === 'trimestre') {
    const d3 = new Date(hoy); d3.setMonth(d3.getMonth() - 3);
    desde.value = fmt(d3);
    hasta.value  = fmt(hoy);
  } else {
    desde.value = '2024-01-01';
    hasta.value  = fmt(hoy);
  }
  _actualizarPreviewAsistencia();
}

function _actualizarPreviewAsistencia() {
  const preview = document.getElementById('exp-asist-preview');
  if (!preview) return;
  const cursoId = document.getElementById('exp-asist-curso')?.value;
  const desde   = document.getElementById('exp-asist-desde')?.value;
  const hasta   = document.getElementById('exp-asist-hasta')?.value;
  if (!cursoId) { preview.innerHTML = ''; return; }
  const curso   = calState.cursos[cursoId];
  if (!curso)   { preview.innerHTML = ''; return; }
  const { fechas } = _filtrarAsistencia(cursoId, desde, hasta);
  preview.innerHTML = `
    <div style="background:#F5F7FA;border-radius:8px;padding:10px 14px;border:1px solid #E0E0E0;">
      <span class="material-icons" style="font-size:14px;vertical-align:middle;color:#1565C0;">preview</span>
      <strong>${curso.nombre}</strong> · ${curso.estudiantes?.length||0} estudiantes ·
      <strong>${fechas.length}</strong> fecha(s) en el período seleccionado
    </div>`;
}

// Filtrar datos de asistencia por rango de fechas
function _filtrarAsistencia(cursoId, desde, hasta) {
  const data   = cargarAsistencia();
  const byDate = data[cursoId] || {};
  const fechas = Object.keys(byDate)
    .filter(f => (!desde || f >= desde) && (!hasta || f <= hasta))
    .sort();
  return { fechas, byDate };
}

// ── EXPORTAR A WORD ─────────────────────────────────────────────
async function generarReporteAsistenciaWord() {
  const cursoId = document.getElementById('exp-asist-curso')?.value;
  const desde   = document.getElementById('exp-asist-desde')?.value;
  const hasta   = document.getElementById('exp-asist-hasta')?.value;
  if (!cursoId) { mostrarToast('Selecciona un curso', 'error'); return; }
  const curso = calState.cursos[cursoId];
  if (!curso)  { mostrarToast('Curso no encontrado', 'error'); return; }

  mostrarToast('Generando documento Word…', 'success');

  const { fechas, byDate } = _filtrarAsistencia(cursoId, desde, hasta);
  const estudiantes = curso.estudiantes || [];
  const umbral = parseInt(localStorage.getItem('asist_umbral') || '80');

  const {
    Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
    AlignmentType, BorderStyle, WidthType, ShadingType, VerticalAlign,
    PageOrientation
  } = docx;

  const borderThin  = { style: BorderStyle.SINGLE, size: 4,  color: '90CAF9' };
  const borderMed   = { style: BorderStyle.SINGLE, size: 8,  color: '1565C0' };
  const borders     = { top: borderThin, bottom: borderThin, left: borderThin, right: borderThin };
  const bordersHead = { top: borderMed,  bottom: borderMed,  left: borderMed,  right: borderMed  };

  // Colores
  const C_HEADER = '1565C0';
  const C_PRES   = 'E8F5E9';
  const C_AUS    = 'FFEBEE';
  const C_TARD   = 'FFF3E0';
  const C_EXCU   = 'E3F2FD';
  const C_SIN    = 'FAFAFA';

  function cell(text, opts = {}) {
    return new TableCell({
      borders: opts.borders || borders,
      width:   opts.width   ? { size: opts.width, type: WidthType.DXA } : undefined,
      shading: opts.shade   ? { fill: opts.shade, type: ShadingType.CLEAR } : undefined,
      verticalAlign: VerticalAlign.CENTER,
      margins: { top: 60, bottom: 60, left: 80, right: 80 },
      children: [new Paragraph({
        alignment: opts.align || AlignmentType.CENTER,
        children: [new TextRun({
          text: String(text || ''),
          bold: opts.bold || false,
          color: opts.color || '000000',
          font: 'Arial',
          size: opts.size || 16,
        })]
      })]
    });
  }

  // TABLA DE ENCABEZADO
  const encabezado = new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [9360],
    rows: [
      new TableRow({ children: [
        new TableCell({
          borders: bordersHead,
          width: { size: 9360, type: WidthType.DXA },
          shading: { fill: C_HEADER, type: ShadingType.CLEAR },
          margins: { top: 120, bottom: 120, left: 160, right: 160 },
          children: [
            new Paragraph({ alignment: AlignmentType.CENTER, children: [
              new TextRun({ text: 'REGISTRO DE ASISTENCIA', bold: true, color: 'FFFFFF', font: 'Arial', size: 28 })
            ]}),
            new Paragraph({ alignment: AlignmentType.CENTER, children: [
              new TextRun({ text: `Curso: ${curso.nombre}`, bold: true, color: 'E3F2FD', font: 'Arial', size: 22 })
            ]}),
            new Paragraph({ alignment: AlignmentType.CENTER, children: [
              new TextRun({
                text: `Período: ${desde || 'inicio'} — ${hasta || 'hoy'}  ·  Docente: ${planificacion?.datosGenerales?.nombreDocente || '—'}`,
                color: 'BBDEFB', font: 'Arial', size: 18
              })
            ]})
          ]
        })
      ]})
    ]
  });

  // TABLA DE ASISTENCIA
  // Cada columna: nombre (2200) + fechas (420 c/u) + total P/A/T/E + %
  const COL_NOMBRE = 2200;
  const COL_FECHA  = Math.min(420, Math.floor((9360 - COL_NOMBRE - 1200) / Math.max(fechas.length, 1)));
  const COL_TOTAL  = 300;
  const COL_PCT    = 380;
  const totalFechasW = COL_FECHA * fechas.length;
  const restoW = 9360 - COL_NOMBRE - totalFechasW - COL_TOTAL * 4 - COL_PCT;

  // Header de fechas
  const DIAS_ABREV = ['Do','Lu','Ma','Mi','Ju','Vi','Sa'];
  const headerRow  = new TableRow({
    tableHeader: true,
    children: [
      cell('Estudiante', { shade: C_HEADER, bold: true, color: 'FFFFFF', size: 17, align: AlignmentType.LEFT, width: COL_NOMBRE, borders: bordersHead }),
      ...fechas.map(f => {
        const d = new Date(f + 'T12:00:00');
        const label = `${DIAS_ABREV[d.getDay()]}\n${d.getDate()}/${d.getMonth()+1}`;
        return cell(label, { shade: C_HEADER, bold: true, color: 'FFFFFF', size: 14, width: COL_FECHA, borders: bordersHead });
      }),
      cell('P', { shade: C_PRES, bold: true, size: 15, width: COL_TOTAL, borders: bordersHead }),
      cell('T', { shade: C_TARD, bold: true, size: 15, width: COL_TOTAL, borders: bordersHead }),
      cell('A', { shade: C_AUS,  bold: true, size: 15, width: COL_TOTAL, borders: bordersHead }),
      cell('E', { shade: C_EXCU, bold: true, size: 15, width: COL_TOTAL, borders: bordersHead }),
      cell('%', { shade: C_HEADER, bold: true, color: 'FFFFFF', size: 15, width: COL_PCT, borders: bordersHead }),
    ]
  });

  // Filas de estudiantes
  const filasEst = estudiantes.map((est, idx) => {
    let P=0, A=0, T=0, E=0;
    const celdas = fechas.map(f => {
      const v = byDate[f]?.[est.id] || '';
      const shade = v==='P'?C_PRES : v==='A'?C_AUS : v==='T'?C_TARD : v==='E'?C_EXCU : C_SIN;
      if (v==='P') P++; else if (v==='A') A++; else if (v==='T') T++; else if (v==='E') E++;
      return cell(v || '·', { shade, size: 14, width: COL_FECHA });
    });
    const total  = P + A + T + E;
    const pct    = total > 0 ? Math.round(((P + T*0.5 + E) / total) * 100) : null;
    const rowShade = idx%2===0 ? 'FFFFFF' : 'F5F7FA';
    const pctColor = pct===null ? '9E9E9E' : pct >= umbral ? '2E7D32' : pct >= 60 ? 'E65100' : 'C62828';
    return new TableRow({ children: [
      cell(est.nombre, { shade: rowShade, align: AlignmentType.LEFT, width: COL_NOMBRE, size: 17 }),
      ...celdas,
      cell(P,   { shade: C_PRES, bold: true, size: 15, width: COL_TOTAL }),
      cell(T,   { shade: C_TARD, bold: true, size: 15, width: COL_TOTAL }),
      cell(A,   { shade: C_AUS,  bold: true, size: 15, width: COL_TOTAL }),
      cell(E,   { shade: C_EXCU, bold: true, size: 15, width: COL_TOTAL }),
      cell(pct!==null?pct+'%':'—', { shade: rowShade, bold: true, color: pctColor, size: 15, width: COL_PCT }),
    ]});
  });

  const colWidths = [COL_NOMBRE, ...fechas.map(()=>COL_FECHA), COL_TOTAL, COL_TOTAL, COL_TOTAL, COL_TOTAL, COL_PCT];
  const tablaAsistencia = new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: colWidths,
    rows: [headerRow, ...filasEst]
  });

  // TABLA RESUMEN
  const resumenRows = [
    new TableRow({ children: [
      cell('RESUMEN', { shade: C_HEADER, bold: true, color:'FFFFFF', size: 18, width: 4680, borders: bordersHead }),
      cell('', { shade: C_HEADER, width: 4680, borders: bordersHead }),
    ]}),
    new TableRow({ children: [
      cell('Total de clases registradas',   { shade:'F5F7FA', align: AlignmentType.LEFT, width:4680, size:17 }),
      cell(fechas.length,                   { bold:true, width:4680, size:17 }),
    ]}),
    new TableRow({ children: [
      cell('Total de estudiantes',          { shade:'F5F7FA', align: AlignmentType.LEFT, width:4680, size:17 }),
      cell(estudiantes.length,              { bold:true, width:4680, size:17 }),
    ]}),
    new TableRow({ children: [
      cell(`Estudiantes bajo umbral (${umbral}%)`, { shade:'FFEBEE', align: AlignmentType.LEFT, width:4680, size:17 }),
      cell(estudiantes.filter(e => {
        const s = _statsAsistencia(cursoId, e.id);
        return s.pct !== null && s.pct < umbral;
      }).length, { bold:true, shade:'FFEBEE', color:'C62828', width:4680, size:17 }),
    ]}),
  ];
  const tablaResumen = new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [4680, 4680],
    rows: resumenRows
  });

  const sections = fechas.length > 20
    ? [{ properties: { page: { size: { width: 12240, height: 15840, orientation: PageOrientation.LANDSCAPE }, margin: { top: 720, right: 720, bottom: 720, left: 720 } } }, children: [encabezado, new Paragraph({ text: '' }), tablaAsistencia, new Paragraph({ text: '' }), tablaResumen] }]
    : [{ properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1080, right: 720, bottom: 1080, left: 720 } } }, children: [encabezado, new Paragraph({ text: '' }), tablaAsistencia, new Paragraph({ text: '' }), tablaResumen] }];

  const documento = new Document({ sections });
  const buffer    = await Packer.toBlob(documento);
  const url       = URL.createObjectURL(buffer);
  const a         = document.createElement('a');
  a.href          = url;
  a.download      = `Asistencia_${curso.nombre.replace(/\s+/g,'_')}_${desde||'todo'}.docx`;
  a.click();
  URL.revokeObjectURL(url);
  mostrarToast('Documento Word generado 📄', 'success');
}

// ── EXPORTAR A PDF (via ventana de impresión) ───────────────────
function generarReporteAsistenciaPDF() {
  const cursoId = document.getElementById('exp-asist-curso')?.value;
  const desde   = document.getElementById('exp-asist-desde')?.value;
  const hasta   = document.getElementById('exp-asist-hasta')?.value;
  if (!cursoId) { mostrarToast('Selecciona un curso', 'error'); return; }
  const curso = calState.cursos[cursoId];
  if (!curso)  { mostrarToast('Curso no encontrado', 'error'); return; }

  const { fechas, byDate } = _filtrarAsistencia(cursoId, desde, hasta);
  const estudiantes = curso.estudiantes || [];
  const umbral = parseInt(localStorage.getItem('asist_umbral') || '80');
  const DIAS_ABREV = ['Do','Lu','Ma','Mi','Ju','Vi','Sa'];

  const filas = estudiantes.map((est, idx) => {
    let P=0, A=0, T=0, E=0;
    const celdas = fechas.map(f => {
      const v = byDate[f]?.[est.id] || '';
      const bg = v==='P'?'#C8E6C9':v==='A'?'#FFCDD2':v==='T'?'#FFE0B2':v==='E'?'#BBDEFB':'#F5F5F5';
      if (v==='P') P++; else if (v==='A') A++; else if (v==='T') T++; else if (v==='E') E++;
      return `<td style="background:${bg};font-size:9pt;">${v||'·'}</td>`;
    }).join('');
    const total  = P+A+T+E;
    const pct    = total > 0 ? Math.round(((P+T*0.5+E)/total)*100) : null;
    const pctColor = pct===null?'#9E9E9E':pct>=umbral?'#2E7D32':pct>=60?'#E65100':'#C62828';
    const rowBg  = idx%2===0?'#fff':'#F8F9FA';
    return `<tr style="background:${rowBg};">
      <td style="text-align:left;padding:4px 6px;font-size:9.5pt;">${escapeHTML(est.nombre)}</td>
      ${celdas}
      <td style="background:#C8E6C9;font-weight:700;">${P}</td>
      <td style="background:#FFE0B2;font-weight:700;">${T}</td>
      <td style="background:#FFCDD2;font-weight:700;">${A}</td>
      <td style="background:#BBDEFB;font-weight:700;">${E}</td>
      <td style="font-weight:800;color:${pctColor};">${pct!==null?pct+'%':'—'}</td>
    </tr>`;
  }).join('');

  const headerFechas = fechas.map(f => {
    const d = new Date(f+'T12:00:00');
    return `<th style="background:#1565C0;color:#fff;font-size:8pt;padding:3px;">${DIAS_ABREV[d.getDay()]}<br>${d.getDate()}/${d.getMonth()+1}</th>`;
  }).join('');

  const bajo = estudiantes.filter(e => {
    const s = _statsAsistencia(cursoId, e.id);
    return s.pct !== null && s.pct < umbral;
  }).length;

  const html = `<!DOCTYPE html><html><head>
    <meta charset="utf-8">
    <title>Asistencia — ${curso.nombre}</title>
    <style>
      @page { margin:0.6in; size:${fechas.length > 20 ? 'landscape' : 'portrait'}; }
      body { font-family:Arial,sans-serif; font-size:10pt; color:#212121; }
      h1   { font-size:16pt; color:#1565C0; margin:0 0 4px; }
      .sub { font-size:9pt; color:#546E7A; margin:0 0 12px; }
      table { border-collapse:collapse; width:100%; }
      th,td { border:1px solid #E0E0E0; text-align:center; padding:4px 3px; vertical-align:middle; }
      .resumen { margin-top:16px; border:1px solid #1565C0; border-radius:6px; padding:10px; display:inline-block; }
      .resumen td { border:none; padding:3px 14px; font-size:9.5pt; }
    </style>
  </head><body>
    <h1>Registro de Asistencia</h1>
    <p class="sub">Curso: <strong>${escapeHTML(curso.nombre)}</strong> &nbsp;·&nbsp;
      Período: ${desde||'inicio'} — ${hasta||'hoy'} &nbsp;·&nbsp;
      Docente: ${escapeHTML(planificacion?.datosGenerales?.nombreDocente||'—')}</p>
    <table>
      <thead><tr>
        <th style="background:#1565C0;color:#fff;text-align:left;padding:5px 8px;min-width:130px;">Estudiante</th>
        ${headerFechas}
        <th style="background:#C8E6C9;">P</th>
        <th style="background:#FFE0B2;">T</th>
        <th style="background:#FFCDD2;">A</th>
        <th style="background:#BBDEFB;">E</th>
        <th style="background:#1565C0;color:#fff;">%</th>
      </tr></thead>
      <tbody>${filas}</tbody>
    </table>
    <div class="resumen">
      <table>
        <tr><td>Clases registradas:</td><td><strong>${fechas.length}</strong></td></tr>
        <tr><td>Total estudiantes:</td><td><strong>${estudiantes.length}</strong></td></tr>
        <tr><td style="color:#C62828;">Bajo umbral (${umbral}%):</td><td style="color:#C62828;font-weight:700;">${bajo}</td></tr>
      </table>
    </div>
  </body></html>`;

  const win = window.open('', '_blank');
  win.document.write(html);
  win.document.close();
  setTimeout(() => win.print(), 600);
  mostrarToast('Ventana de impresión/PDF abierta 🖨️', 'success');
}


const HORARIO_KEY  = 'planificadorRA_horario_v1';
const TAREAS_KEY   = 'planificadorRA_tareas_v1';

const PERIODOS = [
  { id: 1, label: '1',  hora: '8:00 – 8:50 AM' },
  { id: 2, label: '2',  hora: '8:50 – 9:40 AM' },
  { id: 3, label: '3',  hora: '10:00 – 10:50 AM' },
  { id: 4, label: '4',  hora: '10:50 – 11:40 AM' },
  { id: 5, label: '5',  hora: '12:30 – 1:20 PM' },
  { id: 6, label: '6',  hora: '1:20 – 2:10 PM' },
  { id: 7, label: '7',  hora: '2:20 – 3:10 PM' },
  { id: 8, label: '8',  hora: '3:10 – 4:00 PM' },
];
const DIAS = ['Lunes','Martes','Miércoles','Jueves','Viernes'];
const DIAS_SHORT = ['Lu','Ma','Mi','Ju','Vi'];

// Colores para las materias
const MATERIA_COLORES = [
  '#1565C0','#2E7D32','#AD1457','#E65100','#4527A0',
  '#00695C','#BF360C','#37474F','#F57F17','#1B5E20',
  '#880E4F','#0D47A1','#1A237E','#006064','#33691E',
];

function _horarioColores() {
  const h = cargarHorario();
  const mapa = {};
  let ci = 0;
  h.forEach(e => {
    const key = (e.materia||'').trim();
    if (key && !mapa[key]) mapa[key] = MATERIA_COLORES[ci++ % MATERIA_COLORES.length];
  });
  return mapa;
}

function cargarHorario() {
  try { return JSON.parse(localStorage.getItem(HORARIO_KEY) || '[]'); } catch { return []; }
}
function guardarHorario(data) {
  localStorage.setItem(HORARIO_KEY, JSON.stringify(data));
}

function abrirHorario() {
  _mostrarPanel('panel-horario');
  renderizarHorario();
}
function cerrarHorario() { _ocultarPaneles(); }

function renderizarHorario() {
  const tabla = document.getElementById('horario-tabla');
  if (!tabla) return;
  const data  = cargarHorario();
  const colores = _horarioColores();

  // Construir mapa de búsqueda: dia-periodo → entrada
  const mapa = {};
  data.forEach(e => { mapa[`${e.dia}-${e.periodo}`] = e; });

  let html = '<table class="hor-tabla"><thead><tr><th class="hor-th-dia">Día</th>';
  PERIODOS.forEach(p => {
    html += `<th class="hor-th-per"><div class="hor-per-num">${p.label}</div><div class="hor-per-hora">${p.hora}</div></th>`;
  });
  html += '</tr></thead><tbody>';

  DIAS.forEach((dia, di) => {
    html += `<tr><td class="hor-td-dia"><span>${DIAS_SHORT[di]}</span></td>`;
    PERIODOS.forEach(p => {
      const key = `${di}-${p.id}`;
      const e   = mapa[key];
      const color = e && e.materia ? (colores[e.materia.trim()] || '#78909C') : null;
      const bg    = color ? color + '22' : '';
      const border= color ? `2px solid ${color}` : '1px solid #E0E0E0';
      html += `<td class="hor-td-celda" style="border-left:${border};background:${bg};"
        onclick="editarCeldaHorario(${di},${p.id})" title="Clic para editar">`;
      if (e && e.materia) {
        html += `<div class="hor-celda-inner">
          <div class="hor-materia" style="color:${color};">${escapeHTML(e.materia)}</div>
          ${e.seccion ? `<div class="hor-seccion">${escapeHTML(e.seccion)}</div>` : ''}
          ${e.aula    ? `<div class="hor-aula"><span class="material-icons" style="font-size:11px;">room</span>${escapeHTML(e.aula)}</div>` : ''}
        </div>`;
      } else {
        html += `<div class="hor-celda-vacia"><span class="material-icons">add</span></div>`;
      }
      html += '</td>';
    });
    html += '</tr>';
  });
  html += '</tbody></table>';
  tabla.innerHTML = html;

  // Leyenda de materias
  const leyenda = document.getElementById('horario-leyenda');
  if (leyenda) {
    const entries = Object.entries(colores);
    if (entries.length === 0) { leyenda.innerHTML = ''; return; }
    leyenda.innerHTML = '<div class="hor-leyenda-wrap">'
      + entries.map(([mat, col]) =>
          `<span class="hor-leyenda-item" style="border-color:${col};color:${col};">
            <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${col};margin-right:5px;"></span>
            ${escapeHTML(mat)}
          </span>`
        ).join('')
      + '</div>';
  }
}

function editarCeldaHorario(diaIdx, periodoId) {
  const data = cargarHorario();
  const key  = `${diaIdx}-${periodoId}`;
  const existente = data.find(e => e.dia === diaIdx && e.periodo === periodoId) || {};
  const periodo = PERIODOS.find(p => p.id === periodoId);

  // Obtener lista de materias ya usadas para sugerencias
  const materiasUsadas = [...new Set(data.map(e => e.materia).filter(Boolean))];
  const datalistOpts = materiasUsadas.map(m => `<option value="${escapeHTML(m)}">`).join('');

  document.getElementById('modal-title').textContent = `${DIAS[diaIdx]} — Período ${periodoId} (${periodo.hora})`;
  document.getElementById('modal-body').innerHTML = `
    <datalist id="dl-materias">${datalistOpts}</datalist>
    <div style="display:flex;flex-direction:column;gap:14px;padding:4px 0;">
      <div>
        <label style="font-size:0.78rem;font-weight:700;color:#424242;display:block;margin-bottom:5px;">
          Materia / Módulo
        </label>
        <input id="hor-inp-materia" list="dl-materias" placeholder="Ej: Diseño de Portales Web" value="${escapeHTML(existente.materia||'')}"
          style="width:100%;padding:9px 12px;border:1.5px solid #90CAF9;border-radius:8px;font-size:0.9rem;">
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
        <div>
          <label style="font-size:0.78rem;font-weight:700;color:#424242;display:block;margin-bottom:5px;">Sección</label>
          <input id="hor-inp-seccion" placeholder="Ej: 4to B" value="${escapeHTML(existente.seccion||'')}"
            style="width:100%;padding:9px 12px;border:1.5px solid #90CAF9;border-radius:8px;font-size:0.9rem;">
        </div>
        <div>
          <label style="font-size:0.78rem;font-weight:700;color:#424242;display:block;margin-bottom:5px;">Aula (opcional)</label>
          <input id="hor-inp-aula" placeholder="Ej: Lab 3" value="${escapeHTML(existente.aula||'')}"
            style="width:100%;padding:9px 12px;border:1.5px solid #90CAF9;border-radius:8px;font-size:0.9rem;">
        </div>
      </div>
      <div>
        <label style="font-size:0.78rem;font-weight:700;color:#424242;display:block;margin-bottom:5px;">Notas (opcional)</label>
        <input id="hor-inp-notas" placeholder="Ej: Trae USB" value="${escapeHTML(existente.notas||'')}"
          style="width:100%;padding:9px 12px;border:1.5px solid #90CAF9;border-radius:8px;font-size:0.9rem;">
      </div>
      <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:16px;padding-top:12px;border-top:1px solid #E0E0E0;flex-wrap:wrap;">
        <button class="btn-secundario" onclick="cerrarModalBtn()">Cancelar</button>
        ${existente.materia ? `<button class="btn-secundario" style="color:#C62828;border-color:#FFCDD2;" onclick="borrarCeldaHorario(${diaIdx},${periodoId})"><span class="material-icons">delete_outline</span> Borrar</button>` : ''}
        <button class="btn-siguiente" onclick="guardarCeldaHorario(${diaIdx},${periodoId})">
          <span class="material-icons">save</span> Guardar
        </button>
      </div>
    </div>`;
  // botones en body

  document.getElementById('modal-overlay').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  setTimeout(() => document.getElementById('hor-inp-materia')?.focus(), 80);
  document.getElementById('hor-inp-materia').addEventListener('keydown', e => {
    if (e.key === 'Enter') guardarCeldaHorario(diaIdx, periodoId);
  });
}

function guardarCeldaHorario(diaIdx, periodoId) {
  const materia = document.getElementById('hor-inp-materia')?.value.trim();
  const seccion = document.getElementById('hor-inp-seccion')?.value.trim();
  const aula    = document.getElementById('hor-inp-aula')?.value.trim();
  const notas   = document.getElementById('hor-inp-notas')?.value.trim();
  const data = cargarHorario().filter(e => !(e.dia === diaIdx && e.periodo === periodoId));
  if (materia) data.push({ dia: diaIdx, periodo: periodoId, materia, seccion, aula, notas });
  guardarHorario(data);
  cerrarModalBtn();
  renderizarHorario();
  mostrarToast(materia ? 'Período guardado' : 'Período borrado', 'success');
}

function borrarCeldaHorario(diaIdx, periodoId) {
  const data = cargarHorario().filter(e => !(e.dia === diaIdx && e.periodo === periodoId));
  guardarHorario(data);
  cerrarModalBtn();
  renderizarHorario();
  mostrarToast('Período borrado', 'success');
}

function copiarFilaHorario() {
  // Copia el horario de un día a otro (utilidad)
}


// ════════════════════════════════════════════════════════════════════
// MÓDULO: TAREAS
// ════════════════════════════════════════════════════════════════════
function cargarTareas() {
  try { return JSON.parse(localStorage.getItem(TAREAS_KEY) || '[]'); } catch { return []; }
}
function guardarTareas(data) {
  localStorage.setItem(TAREAS_KEY, JSON.stringify(data));
  setTimeout(actualizarBadgeNotificaciones, 100);
}

function abrirTareas() {
  _mostrarPanel('panel-tareas');
  // Poblar select de secciones con horario + cursos
  const sel = document.getElementById('tarea-filtro-seccion');
  if (sel) {
    const secsHor = [...new Set(cargarHorario().map(e => e.seccion).filter(Boolean))];
    const secsCur = Object.values(calState.cursos).map(c => c.nombre);
    const todas   = [...new Set([...secsHor, ...secsCur])].sort();
    const cur = sel.value;
    sel.innerHTML = '<option value="">Todas las secciones</option>'
      + todas.map(s => `<option value="${escapeHTML(s)}" ${cur===s?'selected':''}>${escapeHTML(s)}</option>`).join('');
  }
  renderizarTareas();
}
function cerrarTareas() { _ocultarPaneles(); }

function _estadoTarea(tarea) {
  if (tarea.estado === 'entregada') return 'entregada';
  if (!tarea.fechaLimite) return 'pendiente';
  const hoy  = new Date(); hoy.setHours(0,0,0,0);
  const fl   = new Date(tarea.fechaLimite); fl.setHours(0,0,0,0);
  if (fl < hoy) return 'vencida';
  return 'pendiente';
}

function _diasRestantes(fechaLimite) {
  if (!fechaLimite) return null;
  const hoy = new Date(); hoy.setHours(0,0,0,0);
  const fl  = new Date(fechaLimite); fl.setHours(0,0,0,0);
  return Math.ceil((fl - hoy) / 86400000);
}

function renderizarTareas() {
  const container = document.getElementById('tareas-container');
  if (!container) return;
  const tareas = cargarTareas();

  const filtroActivo  = document.querySelector('.tarea-filtro-btn.activo')?.dataset.filtro || 'todas';
  const filtroSeccion = document.getElementById('tarea-filtro-seccion')?.value || '';

  let filtradas = tareas.map(t => ({ ...t, _estado: _estadoTarea(t) }));
  if (filtroActivo !== 'todas') filtradas = filtradas.filter(t => t._estado === filtroActivo);
  if (filtroSeccion) filtradas = filtradas.filter(t => t.seccion === filtroSeccion);

  // Ordenar dentro de cada grupo por fecha
  filtradas.sort((a, b) => {
    if (!a.fechaLimite) return 1;
    if (!b.fechaLimite) return -1;
    return new Date(a.fechaLimite) - new Date(b.fechaLimite);
  });

  // Contadores para los filtros (siempre sobre el total sin filtro de estado)
  const counts = { todas: tareas.length, pendiente: 0, entregada: 0, vencida: 0 };
  tareas.forEach(t => { const e = _estadoTarea(t); counts[e] = (counts[e]||0) + 1; });
  ['todas','pendiente','entregada','vencida'].forEach(f => {
    const btn = document.querySelector(`.tarea-filtro-btn[data-filtro="${f}"]`);
    if (btn) { const badge = btn.querySelector('.tarea-count'); if (badge) badge.textContent = counts[f] || 0; }
  });

  if (filtradas.length === 0) {
    container.innerHTML = `<div class="tarea-vacia">
      <span class="material-icons">assignment_turned_in</span>
      <p>${filtroActivo === 'todas' ? 'No hay tareas. Crea la primera.' : 'Sin tareas en esta categoría.'}</p>
    </div>`;
    return;
  }

  // Agrupar por sección/curso
  const grupos = {};
  filtradas.forEach(t => {
    const key = t.seccion || 'Sin sección';
    if (!grupos[key]) grupos[key] = [];
    grupos[key].push(t);
  });

  // Orden de grupos: vencidas primero, luego pendientes, luego entregadas
  const ordenGrupos = Object.keys(grupos).sort((a, b) => {
    const urgA = grupos[a].some(t => t._estado === 'vencida') ? 0 : grupos[a].some(t => t._estado === 'pendiente') ? 1 : 2;
    const urgB = grupos[b].some(t => t._estado === 'vencida') ? 0 : grupos[b].some(t => t._estado === 'pendiente') ? 1 : 2;
    return urgA - urgB || a.localeCompare(b);
  });

  const _renderTarjeta = t => {
    const dias = _diasRestantes(t.fechaLimite);
    const estadoCls   = { pendiente:'tarea-pendiente', entregada:'tarea-entregada', vencida:'tarea-vencida' }[t._estado];
    const estadoLabel = { pendiente:'Pendiente', entregada:'Entregada', vencida:'Vencida' }[t._estado];
    let diasLabel = '';
    if (t._estado === 'pendiente' && dias !== null) {
      if (dias === 0)      diasLabel = '<span class="tarea-dias hoy">Hoy</span>';
      else if (dias === 1) diasLabel = '<span class="tarea-dias pronto">Mañana</span>';
      else if (dias <= 3)  diasLabel = `<span class="tarea-dias pronto">En ${dias} días</span>`;
      else                 diasLabel = `<span class="tarea-dias">En ${dias} días</span>`;
    } else if (t._estado === 'vencida') {
      diasLabel = `<span class="tarea-dias vencida">Venció hace ${Math.abs(dias)} día(s)</span>`;
    }
    const fechaFmt = t.fechaLimite
      ? new Date(t.fechaLimite + 'T12:00:00').toLocaleDateString('es-DO', { weekday:'short', day:'2-digit', month:'short' })
        + (t.horaLimite ? ' a las ' + t.horaLimite : '') : '';
    return `<div class="tarea-card ${estadoCls}" id="tarea-card-${t.id}">
      <div class="tarea-card-header">
        <div class="tarea-status-badge ${estadoCls}">${estadoLabel}</div>
        ${diasLabel}
        <div style="margin-left:auto;display:flex;gap:6px;">
          ${t._estado !== 'entregada'
            ? `<button class="tarea-btn-accion" onclick="marcarTareaEntregada('${t.id}')" title="Marcar como entregada"
                style="background:#E8F5E9;border-color:#A5D6A7;color:#2E7D32;">
                <span class="material-icons" style="font-size:15px;">check_circle</span>
              </button>`
            : `<button class="tarea-btn-accion" onclick="marcarTareaPendiente('${t.id}')" title="Revertir a pendiente"
                style="background:#FFF8E1;border-color:#FFE082;color:#F57F17;">
                <span class="material-icons" style="font-size:15px;">refresh</span>
              </button>`}
          <button class="tarea-btn-accion" onclick="abrirEditarTarea('${t.id}')" title="Editar">
            <span class="material-icons" style="font-size:15px;">edit</span>
          </button>
          <button class="tarea-btn-accion" onclick="eliminarTarea('${t.id}')" title="Eliminar"
            style="color:#EF5350;border-color:#FFCDD2;">
            <span class="material-icons" style="font-size:15px;">delete_outline</span>
          </button>
        </div>
      </div>
      <div class="tarea-descripcion">${escapeHTML(t.descripcion||'Sin descripción')}</div>
      ${fechaFmt ? `<div class="tarea-fecha"><span class="material-icons" style="font-size:14px;">event</span>${fechaFmt}</div>` : ''}
      ${t.observaciones ? `<div class="tarea-obs"><span class="material-icons" style="font-size:13px;">notes</span>${escapeHTML(t.observaciones)}</div>` : ''}
    </div>`;
  };

  container.innerHTML = ordenGrupos.map(grupo => {
    const items = grupos[grupo];
    const nPend = items.filter(t => t._estado === 'pendiente').length;
    const nVenc = items.filter(t => t._estado === 'vencida').length;
    const nEntr = items.filter(t => t._estado === 'entregada').length;
    const headerColor = nVenc > 0 ? '#C62828' : nPend > 0 ? '#E65100' : '#2E7D32';
    const badges = [
      nVenc ? `<span style="background:#FFEBEE;color:#C62828;border-radius:12px;padding:2px 9px;font-size:0.7rem;font-weight:700;">${nVenc} vencida(s)</span>` : '',
      nPend ? `<span style="background:#FFF3E0;color:#E65100;border-radius:12px;padding:2px 9px;font-size:0.7rem;font-weight:700;">${nPend} pendiente(s)</span>` : '',
      nEntr ? `<span style="background:#E8F5E9;color:#2E7D32;border-radius:12px;padding:2px 9px;font-size:0.7rem;font-weight:700;">${nEntr} entregada(s)</span>` : '',
    ].filter(Boolean).join('');
    const grupoEsc = grupo.replace(/\\/g,'\\\\').replace(/'/g,"\\'");
    return `<div class="tarea-grupo">
      <div class="tarea-grupo-header" style="border-left-color:${headerColor};">
        <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
          <span class="material-icons" style="font-size:20px;color:${headerColor};">class</span>
          <span class="tarea-grupo-titulo">${escapeHTML(grupo)}</span>
          ${badges}
        </div>
        <button onclick="abrirNuevaTarea('${grupoEsc}')"
          style="display:inline-flex;align-items:center;gap:4px;background:none;border:1.5px solid ${headerColor};color:${headerColor};border-radius:20px;padding:4px 12px;font-size:0.75rem;font-weight:700;cursor:pointer;">
          <span class="material-icons" style="font-size:14px;">add</span> Agregar
        </button>
      </div>
      <div class="tarea-grupo-body">${items.map(_renderTarjeta).join('')}</div>
    </div>`;
  }).join('');
}


function abrirNuevaTarea(seccionSugerida) {
  _abrirModalTarea(null, seccionSugerida);
}

function abrirEditarTarea(id) {
  _abrirModalTarea(id, null);
}

function _abrirModalTarea(id, seccionSugerida) {
  const tareas = cargarTareas();
  const tarea  = id ? tareas.find(t => t.id === id) : null;

  // Opciones de sección: del horario + de los cursos del libro de calificaciones
  const seccionesHorario = [...new Set(cargarHorario().map(e => e.seccion).filter(Boolean))].sort();
  const seccionesCursos  = Object.values(calState.cursos).map(c => c.nombre);
  const todasSecciones   = [...new Set([...seccionesHorario, ...seccionesCursos])];
  const optsSecc = `<option value="">— Sin sección —</option>`
    + todasSecciones.map(s => `<option value="${escapeHTML(s)}" ${(tarea?.seccion||seccionSugerida||'')===s?'selected':''}>${escapeHTML(s)}</option>`).join('');

  const hoy = new Date().toISOString().split('T')[0];

  document.getElementById('modal-title').textContent = tarea ? 'Editar Tarea' : 'Nueva Tarea';
  document.getElementById('modal-body').innerHTML = `
    <div style="display:flex;flex-direction:column;gap:14px;padding:4px 0;">
      <div>
        <label style="font-size:0.78rem;font-weight:700;color:#424242;display:block;margin-bottom:5px;">Descripción de la tarea *</label>
        <textarea id="tarea-inp-desc" rows="3" placeholder="Ej: Entregar práctica de HTML con formulario responsivo"
          style="width:100%;padding:10px 12px;border:1.5px solid #90CAF9;border-radius:8px;font-size:0.88rem;font-family:inherit;resize:vertical;"
        >${escapeHTML(tarea?.descripcion||'')}</textarea>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
        <div>
          <label style="font-size:0.78rem;font-weight:700;color:#424242;display:block;margin-bottom:5px;">Sección / Curso</label>
          <select id="tarea-inp-seccion"
            style="width:100%;padding:9px 10px;border:1.5px solid #90CAF9;border-radius:8px;font-size:0.88rem;">
            ${optsSecc}
          </select>
        </div>
        <div>
          <label style="font-size:0.78rem;font-weight:700;color:#424242;display:block;margin-bottom:5px;">Fecha límite</label>
          <input type="date" id="tarea-inp-fecha" value="${tarea?.fechaLimite||hoy}"
            style="width:100%;padding:9px 10px;border:1.5px solid #90CAF9;border-radius:8px;font-size:0.88rem;">
        </div>
      </div>
      <div>
        <label style="font-size:0.78rem;font-weight:700;color:#424242;display:block;margin-bottom:5px;">Hora límite (opcional)</label>
        <input type="time" id="tarea-inp-hora" value="${tarea?.horaLimite||''}"
          style="width:50%;padding:9px 10px;border:1.5px solid #90CAF9;border-radius:8px;font-size:0.88rem;">
      </div>
      <div>
        <label style="font-size:0.78rem;font-weight:700;color:#424242;display:block;margin-bottom:5px;">Observaciones (opcional)</label>
        <textarea id="tarea-inp-obs" rows="2" placeholder="Ej: Debe subirse al aula virtual antes de las 9:40 AM"
          style="width:100%;padding:10px 12px;border:1.5px solid #90CAF9;border-radius:8px;font-size:0.88rem;font-family:inherit;resize:vertical;"
        >${escapeHTML(tarea?.observaciones||'')}</textarea>
      </div>
      <div style="display:flex;gap:8px;justify-content:flex-end;padding-top:8px;border-top:1px solid #E0E0E0;">
        <button class="btn-secundario" onclick="cerrarModalBtn()">Cancelar</button>
        <button class="btn-siguiente" onclick="_guardarTarea('${id||''}')">
          <span class="material-icons">save</span> Guardar
        </button>
      </div>
    </div>`;
  // botones en el body
  _usarFooterDinamico('');
  document.getElementById('modal-overlay').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  setTimeout(() => document.getElementById('tarea-inp-desc')?.focus(), 80);
}

function _guardarTarea(id) {
  const desc  = document.getElementById('tarea-inp-desc')?.value.trim();
  if (!desc) { mostrarToast('Escribe una descripción', 'error'); return; }
  const seccion = document.getElementById('tarea-inp-seccion')?.value;
  const fecha   = document.getElementById('tarea-inp-fecha')?.value;
  const hora    = document.getElementById('tarea-inp-hora')?.value;
  const obs     = document.getElementById('tarea-inp-obs')?.value.trim();
  const tareas  = cargarTareas();

  if (id) {
    const idx = tareas.findIndex(t => t.id === id);
    if (idx >= 0) {
      tareas[idx] = { ...tareas[idx], descripcion: desc, seccion, fechaLimite: fecha, horaLimite: hora, observaciones: obs };
    }
  } else {
    tareas.push({ id: uid(), descripcion: desc, seccion, fechaLimite: fecha, horaLimite: hora, observaciones: obs, estado: 'pendiente', creadaEn: new Date().toISOString() });
  }
  guardarTareas(tareas);
  cerrarModalBtn();
  renderizarTareas();
  mostrarToast(id ? 'Tarea actualizada' : 'Tarea creada', 'success');
}

function marcarTareaEntregada(id) {
  const tareas = cargarTareas();
  const t = tareas.find(t => t.id === id);
  if (t) { t.estado = 'entregada'; t.entregadaEn = new Date().toISOString(); }
  guardarTareas(tareas);
  renderizarTareas();
  mostrarToast('Tarea marcada como entregada ✓', 'success');
}

function marcarTareaPendiente(id) {
  const tareas = cargarTareas();
  const t = tareas.find(t => t.id === id);
  if (t) { t.estado = 'pendiente'; delete t.entregadaEn; }
  guardarTareas(tareas);
  renderizarTareas();
}

function eliminarTarea(id) {
  if (!confirm('¿Eliminar esta tarea?')) return;
  guardarTareas(cargarTareas().filter(t => t.id !== id));
  renderizarTareas();
  mostrarToast('Tarea eliminada', 'success');
}

function filtrarTareas(filtro) {
  document.querySelectorAll('.tarea-filtro-btn').forEach(b => b.classList.toggle('activo', b.dataset.filtro === filtro));
  renderizarTareas();
}


// INICIALIZACIÓN DEL MÓDULO DE CALIFICACIONES



// ----------------------------------------------------------------



document.addEventListener('DOMContentLoaded', () => {



  // Inyectar botón en el header si no existe



  const headerInner = document.querySelector('.header-inner');



  if (headerInner && !document.getElementById('btn-calificaciones')) {



    const btnCal = document.createElement('button');



    btnCal.id = 'btn-calificaciones';



    btnCal.className = 'btn-calificaciones';



    btnCal.title = 'Libro de Calificaciones';



    btnCal.innerHTML = '<span class="material-icons">grade</span><span class="btn-nueva-label">Calificaciones</span>';



    btnCal.onclick = abrirCalificaciones;



    // Insert before "Nueva Planificación" button



    const btnNueva = document.getElementById('btn-nueva-planificacion');



    if (btnNueva) {



      headerInner.insertBefore(btnCal, btnNueva);



    } else {



      headerInner.appendChild(btnCal);



    }



  }







  // Patch the modal footer to have an id (needed for dynamic buttons)



  const modalFooter = document.querySelector('.modal-footer');



  if (modalFooter && !modalFooter.id) modalFooter.id = 'modal-footer';

  // Botón "Planificaciones" en el header
  if (headerInner && !document.getElementById('btn-planificaciones')) {
    const btnPln = document.createElement('button');
    btnPln.id = 'btn-planificaciones';
    btnPln.className = 'btn-planificaciones';
    btnPln.title = 'Mis Planificaciones';
    btnPln.innerHTML = '<span class="material-icons">folder_special</span><span class="btn-nueva-label">Planificaciones</span>';
    btnPln.onclick = abrirPlanificaciones;
    const btnCalRef = document.getElementById('btn-calificaciones');
    const btnNuevaRef = document.getElementById('btn-nueva-planificacion');
    if (btnCalRef) headerInner.insertBefore(btnPln, btnCalRef);
    else if (btnNuevaRef) headerInner.insertBefore(btnPln, btnNuevaRef);
    else headerInner.appendChild(btnPln);
  }







  // Botón Horario en el header
  if (headerInner && !document.getElementById('btn-horario')) {
    const btnHor = document.createElement('button');
    btnHor.id = 'btn-horario';
    btnHor.className = 'btn-planificaciones';
    btnHor.title = 'Mi Horario';
    btnHor.innerHTML = '<span class="material-icons">calendar_view_week</span><span class="btn-nueva-label">Horario</span>';
    btnHor.onclick = abrirHorario;
    const btnPlnRef = document.getElementById('btn-planificaciones');
    if (btnPlnRef) headerInner.insertBefore(btnHor, btnPlnRef);
    else headerInner.appendChild(btnHor);
  }
  // Botón Tareas en el header
  if (headerInner && !document.getElementById('btn-tareas')) {
    const btnTar = document.createElement('button');
    btnTar.id = 'btn-tareas';
    btnTar.className = 'btn-planificaciones';
    btnTar.title = 'Tareas';
    btnTar.innerHTML = '<span class="material-icons">assignment</span><span class="btn-nueva-label">Tareas</span>';
    btnTar.onclick = abrirTareas;
    const btnHorRef = document.getElementById('btn-horario');
    if (btnHorRef) headerInner.insertBefore(btnTar, btnHorRef);
    else headerInner.appendChild(btnTar);
  }
  // Cargar datos de calificaciones al iniciar



  cargarCalificaciones();



}, { once: false });











// ================================================================



// --- MÓDULO: BIBLIOTECA DE PLANIFICACIONES ---



// Guarda y carga múltiples planificaciones en localStorage.



// ================================================================







const BIBLIO_KEY = 'planificadorRA_biblioteca_v1';







/** Carga todas las planificaciones guardadas */



function cargarBiblioteca() {



  try {



    return JSON.parse(localStorage.getItem(BIBLIO_KEY) || '{"items":[]}');



  } catch (e) {



    return { items: [] };



  }



}







/** Guarda el estado de la biblioteca */



function persistirBiblioteca(biblio) {



  localStorage.setItem(BIBLIO_KEY, JSON.stringify(biblio));



}







/** Guarda la planificación actual en la biblioteca */



function guardarPlanificacionActual() {



  const dg = planificacion.datosGenerales || {};



  const ra = planificacion.ra || {};







  if (!dg.moduloFormativo && !ra.descripcion) {



    mostrarToast('No hay datos suficientes para guardar. Completa al menos el Paso 1.', 'error');



    return;



  }







  guardarDatosFormulario(); // asegurar que lo último del form esté en el estado







  const biblio = cargarBiblioteca();



  const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);



  const ahora = new Date();







  const registro = {



    id,



    fechaGuardado: ahora.toISOString(),



    fechaGuardadoLabel: ahora.toLocaleDateString('es-DO', {



      day: '2-digit', month: 'long', year: 'numeric',



      hour: '2-digit', minute: '2-digit'



    }),



    nombre: (dg.moduloFormativo || 'Sin módulo') + ' — ' + (dg.nombreDocente || 'Sin docente'),



    planificacion: JSON.parse(JSON.stringify(planificacion, (k, v) =>



      v instanceof Date ? v.toISOString() : v



    ))



  };







  // Si tiene _id (fue cargada de biblioteca), actualizar directamente
  const existingId = planificacion._id;
  const idxById = existingId ? biblio.items.findIndex(i => i.id === existingId) : -1;
  if (idxById >= 0) {
    registro.id = existingId;
    biblio.items[idxById] = registro;
    mostrarToast('Planificación actualizada', 'success');
  } else {
    // Guardar siempre como nueva — mismo módulo puede tener varios RA/planes
    biblio.items.unshift(registro);
    mostrarToast('Planificación guardada correctamente', 'success');
  }
  planificacion._id = registro.id;
  persistirBiblioteca(biblio);

  // Asignar al curso si hay cursos creados y no está ya asignada
  const cursosExist = Object.values(calState.cursos);
  if (cursosExist.length > 0) {
    // Usar registro.id (el ID final guardado), no el 'id' temporal inicial
    const finalId    = registro.id;
    const yaAsignada = cursosExist.some(c => (c.planIds||[]).includes(finalId));
    if (!yaAsignada) {
      const opsCursos = cursosExist.map(c => `<option value="${c.id}">${escapeHTML(c.nombre)}</option>`).join('');
      document.getElementById('modal-title').textContent = 'Asignar al libro de calificaciones';
      document.getElementById('modal-body').innerHTML = `
        <div class="modal-curso-content">
          <p style="margin-bottom:12px;font-size:0.9rem;color:#37474F;">
            ¿A qué curso pertenece esta planificación?
          </p>
          <label for="modal-sel-curso-guardar">Curso</label>
          <select id="modal-sel-curso-guardar" style="padding:8px 12px;border:1.5px solid #90CAF9;border-radius:8px;font-size:0.9rem;width:100%;margin-top:4px;">
            <option value="">— No asignar ahora —</option>
            ${opsCursos}
          </select>
          <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:20px;padding-top:16px;border-top:1px solid #E0E0E0;">
            <button class="btn-secundario" onclick="cerrarModalBtn()">Omitir</button>
            <button class="btn-siguiente" onclick="_asignarDesdeGuardar('${finalId}')">
              <span class="material-icons">link</span> Asignar
            </button>
          </div>
        </div>`;
      // botones en el body
  _usarFooterDinamico('');
  document.getElementById('modal-overlay').classList.remove('hidden');
      document.body.style.overflow = 'hidden';
    }
  }
}

function _asignarDesdeGuardar(planId) {
  const cursoId = document.getElementById('modal-sel-curso-guardar')?.value;
  cerrarModalBtn();
  if (!cursoId || !calState.cursos[cursoId]) return;
  const curso = calState.cursos[cursoId];
  if (!curso.planIds) curso.planIds = [];
  if (!curso.planIds.includes(planId)) {
    curso.planIds.push(planId);
    if (!curso.planActivaId) curso.planActivaId = planId;
    guardarCalificaciones();
    mostrarToast('Planificación asignada al curso "' + curso.nombre + '"', 'success');
  }
}

/** Carga una planificación guardada y la restaura como activa */



function cargarPlanificacionGuardada(id) {



  const biblio = cargarBiblioteca();



  const registro = biblio.items.find(i => i.id === id);



  if (!registro) return;







  if (!confirm('¿Cargar la planificación "' + registro.nombre +



    '"? Los datos actuales no guardados se perderán.')) return;







  // Restaurar estado global



  planificacion = registro.planificacion;
  planificacion._id = registro.id;







  // Restaurar fechas



  if (planificacion.actividades) {



    planificacion.actividades.forEach(a => {



      if (a.fecha && typeof a.fecha === 'string') a.fecha = new Date(a.fecha);



    });



  }



  if (planificacion.fechasClase) {



    planificacion.fechasClase.forEach(f => {



      if (f.fecha && typeof f.fecha === 'string') f.fecha = new Date(f.fecha);



    });



  }







  // Repoblar el formulario



  poblarFormularioDesdeEstado();







  // Regenerar vistas de EC y actividades si hay datos



  if (planificacion.elementosCapacidad?.length) {



    renderizarEC(planificacion.elementosCapacidad);



    renderizarActividades(planificacion.actividades);



    document.getElementById('btn-paso2-siguiente').disabled = false;



  }







  guardarBorrador(); // sincronizar con borrador activo







  // Cerrar panel y volver al paso 1



  cerrarPlanificaciones();



  irAlPaso(1, false);



  mostrarToast('Planificación "' + registro.nombre + '" cargada', 'success');



}







/** Elimina una planificación de la biblioteca */




// ════════════════════════════════════════════════════════════════════
// DUPLICAR PLANIFICACIÓN
// ════════════════════════════════════════════════════════════════════
let _dupPlanId = null; // id del registro original a duplicar

function abrirDuplicarPlan(id) {
  const biblio = cargarBiblioteca();
  const reg    = (biblio.items || []).find(i => i.id === id);
  if (!reg) return;
  _dupPlanId = id;

  const dg = reg.planificacion?.datosGenerales || {};

  // Mostrar info del original
  const origen = document.getElementById('dup-plan-origen');
  if (origen) origen.innerHTML =
    `<strong>Original:</strong> ${escHTML(dg.moduloFormativo || reg.nombre || 'Sin nombre')}` +
    (dg.nombreBachillerato ? ` · ${escHTML(dg.nombreBachillerato)}` : '') +
    `<br><span style="color:#9E9E9E;">Guardada el ${escHTML(reg.fechaGuardadoLabel || reg.fechaGuardado || '—')}</span>`;

  // Nombre por defecto: "Copia de X"
  const inputNombre = document.getElementById('dup-plan-nombre');
  if (inputNombre) inputNombre.value = `Copia de ${dg.moduloFormativo || reg.nombre || 'planificación'}`;

  // Llenar select de cursos
  const sel = document.getElementById('dup-plan-curso');
  if (sel) {
    sel.innerHTML = '<option value="">Sin asignar (puedo hacerlo después)</option>' +
      Object.values(calState.cursos).map(c =>
        `<option value="${c.id}">${escHTML(c.nombre)}</option>`
      ).join('');
    // Pre-seleccionar el curso activo si existe
    if (calState.cursoActivoId) sel.value = calState.cursoActivoId;
  }

  // Calcular fechas de actividades del original (normalizar a ISO string)
  const actividades = reg.planificacion?.actividades || [];
  const fechasActs = actividades.map(a => {
    if (!a.fecha) return null;
    if (a.fecha instanceof Date) return a.fecha.toISOString().split('T')[0];
    const s = String(a.fecha);
    // Si ya es YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
    // Si es ISO con T
    if (s.includes('T')) return s.split('T')[0];
    // Intentar parsear
    const d = new Date(s);
    return isNaN(d.getTime()) ? null : d.toISOString().split('T')[0];
  }).filter(Boolean).sort();
  const primerFecha = fechasActs[0] || null;
  const ultimaFecha = fechasActs[fechasActs.length - 1] || null;

  // Fecha de inicio por defecto: hoy
  const inputFecha = document.getElementById('dup-plan-fecha-inicio');
  if (inputFecha) inputFecha.value = new Date().toISOString().split('T')[0];

  // Preview de fechas
  _actualizarPreviewDupFechas(primerFecha, ultimaFecha, fechasActs.length);

  // Esconder/mostrar según toggle
  const toggle = document.getElementById('dup-plan-ajustar-fechas');
  if (toggle) toggleDupFechas(toggle.checked);

  // Guardar contexto de fechas en el input (como data attrs accesibles)
  if (inputFecha) {
    inputFecha.dataset.primeraOriginal = primerFecha || '';
    inputFecha.dataset.ultimaOriginal  = ultimaFecha || '';
    inputFecha.dataset.totalActs       = fechasActs.length;
    inputFecha.oninput = () => _actualizarPreviewDupFechas(primerFecha, ultimaFecha, fechasActs.length);
  }

  document.getElementById('dup-plan-overlay')?.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function cerrarDuplicarPlan() {
  document.getElementById('dup-plan-overlay')?.classList.add('hidden');
  document.body.style.overflow = '';
  _dupPlanId = null;
}

function toggleDupFechas(on) {
  const wrap = document.getElementById('dup-plan-fechas-wrap');
  if (wrap) wrap.style.display = on ? 'block' : 'none';
}

function _actualizarPreviewDupFechas(primeraOriginal, ultimaOriginal, totalActs) {
  const preview  = document.getElementById('dup-plan-fechas-preview');
  const inputVal = document.getElementById('dup-plan-fecha-inicio')?.value;
  if (!preview) return;
  if (!primeraOriginal || !totalActs) {
    preview.innerHTML = '<span style="color:#B0BEC5;">Las actividades no tienen fechas asignadas.</span>';
    return;
  }
  if (!inputVal) { preview.innerHTML = ''; return; }
  // Calcular el desplazamiento en días
  const orig  = new Date(primeraOriginal + 'T12:00:00');
  const nueva = new Date(inputVal       + 'T12:00:00');
  const diffMs  = nueva - orig;
  const diffDias = Math.round(diffMs / 86400000);
  const signo   = diffDias >= 0 ? '+' : '';
  // Calcular nueva fecha final
  const nuevaFin = ultimaOriginal
    ? new Date(new Date(ultimaOriginal + 'T12:00:00').getTime() + diffMs).toLocaleDateString('es-DO',{day:'2-digit',month:'short',year:'numeric'})
    : '—';
  preview.innerHTML = `
    <span class="material-icons" style="font-size:12px;vertical-align:middle;color:#1565C0;">info</span>
    Se moverán <strong>${totalActs}</strong> actividad(es) <strong>${signo}${diffDias} días</strong>.
    Nueva fecha de cierre: <strong>${nuevaFin}</strong>.`;
}

function confirmarDuplicarPlan() {
  if (!_dupPlanId) return;
  const biblio  = cargarBiblioteca();
  const original = (biblio.items || []).find(i => i.id === _dupPlanId);
  if (!original) { mostrarToast('Planificación no encontrada', 'error'); return; }

  // Clonar profundamente
  const copia = JSON.parse(JSON.stringify(original));

  // Nuevo id y fecha de guardado
  const ahora = new Date();
  copia.id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  copia.fechaGuardado      = ahora.toISOString();
  copia.fechaGuardadoLabel = ahora.toLocaleDateString('es-DO',{day:'2-digit',month:'long',year:'numeric',hour:'2-digit',minute:'2-digit'});

  // Nombre personalizado
  const inputNombre = document.getElementById('dup-plan-nombre')?.value?.trim();
  copia.nombre = inputNombre || `Copia de ${original.nombre}`;
  if (copia.planificacion?.datosGenerales) {
    copia.planificacion.datosGenerales.moduloFormativo =
      inputNombre || `Copia de ${original.planificacion.datosGenerales.moduloFormativo || original.nombre}`;
  }

  // Ajustar fechas de actividades
  const ajustar = document.getElementById('dup-plan-ajustar-fechas')?.checked;
  const inputFecha = document.getElementById('dup-plan-fecha-inicio');
  const primeraOriginal = inputFecha?.dataset.primeraOriginal;

  const _primeraOrig = inputFecha?.dataset?.primeraOriginal || primeraOriginal || '';
  if (ajustar && inputFecha?.value && _primeraOrig && _primeraOrig.length === 10) {
    const orig    = new Date(_primeraOrig + 'T12:00:00');
    const nueva   = new Date(inputFecha.value + 'T12:00:00');
    if (isNaN(orig.getTime()) || isNaN(nueva.getTime())) {
      mostrarToast('Fecha inválida, se copiarán las fechas originales', 'warning');
    }
    const diffMs  = isNaN(orig.getTime()) ? 0 : (nueva - orig);
    const acts    = copia.planificacion?.actividades || [];
    acts.forEach(act => {
      if (act.fecha) {
        try {
          // Normalizar a ISO string primero
          let fechaISO;
          if (act.fecha instanceof Date) {
            fechaISO = act.fecha.toISOString().split('T')[0];
          } else {
            const s = String(act.fecha);
            if (/^\d{4}-\d{2}-\d{2}$/.test(s)) fechaISO = s;
            else if (s.includes('T')) fechaISO = s.split('T')[0];
            else { const d = new Date(s); fechaISO = isNaN(d.getTime()) ? null : d.toISOString().split('T')[0]; }
          }
          if (fechaISO) {
            const fechaAct   = new Date(fechaISO + 'T12:00:00');
            const nuevaFecha = new Date(fechaAct.getTime() + diffMs);
            if (!isNaN(nuevaFecha.getTime())) {
              act.fecha    = nuevaFecha.toISOString().split('T')[0];
              act.fechaStr = nuevaFecha.toLocaleDateString('es-DO', { weekday:'long', day:'2-digit', month:'long', year:'numeric' });
            }
          }
        } catch(e) { /* conservar fecha original */ }
      }
    });
  }

  // Asignar a curso si se seleccionó
  const cursoId = document.getElementById('dup-plan-curso')?.value;
  if (cursoId && calState.cursos[cursoId]) {
    const curso = calState.cursos[cursoId];
    if (!curso.planIds) curso.planIds = [];
    if (!curso.planIds.includes(copia.id)) {
      curso.planIds.push(copia.id);
      if (!curso.planActivaId) curso.planActivaId = copia.id;
    }
    guardarCalificaciones();
  }

  // Guardar la copia en la biblioteca (al inicio de la lista)
  biblio.items.unshift(copia);
  persistirBiblioteca(biblio);

  cerrarDuplicarPlan();
  renderizarBiblioteca();
  mostrarToast(`✅ Planificación duplicada: "${copia.nombre}"`, 'success');
}

function eliminarPlanificacionGuardada(id) {



  const biblio = cargarBiblioteca();



  const reg = biblio.items.find(i => i.id === id);



  if (!reg) return;



  if (!confirm('¿Eliminar la planificación "' + reg.nombre + '"? Esta acción no se puede deshacer.')) return;







  biblio.items = biblio.items.filter(i => i.id !== id);



  persistirBiblioteca(biblio);



  renderizarBiblioteca();



  mostrarToast('Planificación eliminada', 'info');



}







/** Filtra las tarjetas según el texto del buscador */



function filtrarPlanificaciones() {



  const q = (document.getElementById('pln-buscador')?.value || '').toLowerCase();



  document.querySelectorAll('.pln-card').forEach(card => {



    const texto = card.dataset.busqueda || '';



    card.style.display = texto.includes(q) ? '' : 'none';



  });



}







// ----------------------------------------------------------------



// RENDERIZADO



// ----------------------------------------------------------------







/** Renderiza la cuadrícula de planificaciones guardadas */



function renderizarBiblioteca() {
  const grid  = document.getElementById('pln-grid');
  const vacio = document.getElementById('pln-vacio');
  if (!grid || !vacio) return;
  const biblio = cargarBiblioteca();
  const items  = biblio.items || [];
  const query  = (document.getElementById('pln-buscar')?.value || '').toLowerCase();

  if (items.length === 0) {
    grid.innerHTML = '';
    vacio.classList.remove('hidden');
    return;
  }
  vacio.classList.add('hidden');
  grid.innerHTML = '';

  // ── Filtrar por búsqueda ──────────────────────────────────────
  const filtrados = items.filter(reg => {
    if (!query) return true;
    const dg = reg.planificacion?.datosGenerales || {};
    const ra = reg.planificacion?.ra || {};
    return [dg.moduloFormativo, dg.nombreDocente, dg.nombreBachillerato,
            dg.familiaProfesional, ra.descripcion].join(' ').toLowerCase().includes(query);
  });

  if (filtrados.length === 0) {
    grid.innerHTML = '<p style="text-align:center;color:#9E9E9E;padding:40px;">Sin resultados para la búsqueda.</p>';
    return;
  }

  // ── Agrupar por curso ─────────────────────────────────────────
  const grupos = {};          // { cursoNombre: [reg, ...] }
  const sinCurso = [];
  const cursosMap = calState.cursos || {};

  filtrados.forEach(reg => {
    const cursosDePlan = Object.values(cursosMap).filter(c => (c.planIds||[]).includes(reg.id));
    if (cursosDePlan.length === 0) {
      sinCurso.push(reg);
    } else {
      cursosDePlan.forEach(c => {
        if (!grupos[c.nombre]) grupos[c.nombre] = [];
        grupos[c.nombre].push({ reg, esPlanActiva: c.planActivaId === reg.id });
      });
    }
  });

  // Ordenar grupos alfabéticamente; "Sin curso asignado" al final
  const nombresCurso = Object.keys(grupos).sort();

  // ── Renderizar función de card ────────────────────────────────
  const _renderCard = (reg, esPlanActiva) => {
    const dg = reg.planificacion?.datosGenerales || {};
    const ra = reg.planificacion?.ra || {};
    const ec   = reg.planificacion?.elementosCapacidad || [];
    const acts = reg.planificacion?.actividades || [];
    const horasTotal = reg.planificacion?.horasTotal || 0;
    const resumenRA  = ra.descripcion
      ? ra.descripcion.substring(0,120) + (ra.descripcion.length > 120 ? '…' : '')
      : 'Sin descripción del RA';

    const card = document.createElement('div');
    card.className = 'pln-card' + (esPlanActiva ? ' pln-card-activa' : '');
    card.innerHTML = `
      <div class="pln-card-date">
        <span class="material-icons">schedule</span>
        ${escHTML(reg.fechaGuardadoLabel || reg.fechaGuardado)}
        ${esPlanActiva ? '<span class="pln-badge-activa"><span class="material-icons" style="font-size:11px;">star</span>Activa</span>' : ''}
      </div>
      <div class="pln-card-modulo">${escHTML(dg.moduloFormativo || 'Sin módulo')}</div>
      <div class="pln-card-meta">
        <span><span class="material-icons">person</span>${escHTML(dg.nombreDocente || '—')}</span>
        <span><span class="material-icons">school</span>${escHTML(dg.nombreBachillerato || '—')}</span>
        ${dg.fechaInicio ? '<span><span class="material-icons">date_range</span>' +
          escHTML(dg.fechaInicio) + ' → ' + escHTML(dg.fechaTermino || '') + '</span>' : ''}
      </div>
      <div class="pln-card-ra">${escHTML(resumenRA)}</div>
      <div class="pln-card-chips">
        ${ec.length   ? '<span class="pln-chip pln-chip-ec"><span class="material-icons" style="font-size:12px;">layers</span>' + ec.length + ' EC</span>' : ''}
        ${acts.length ? '<span class="pln-chip pln-chip-acts"><span class="material-icons" style="font-size:12px;">event_note</span>' + acts.length + ' actividades</span>' : ''}
        ${horasTotal  ? '<span class="pln-chip pln-chip-pts"><span class="material-icons" style="font-size:12px;">schedule</span>' + horasTotal + 'h</span>' : ''}
        ${dg.valorRA  ? '<span class="pln-chip pln-chip-pts"><span class="material-icons" style="font-size:12px;">star</span>' + dg.valorRA + ' pts</span>' : ''}
      </div>
      <div class="pln-card-actions">
        <button class="btn-pln-cargar" onclick="cargarPlanificacionGuardada('${reg.id}')">
          <span class="material-icons">folder_open</span> Cargar
        </button>
        <button class="btn-pln-asignar" onclick="asignarPlanACurso('${reg.id}')" title="Asignar a un curso">
          <span class="material-icons">link</span> Asignar curso
        </button>
        <button class="btn-pln-dup" onclick="abrirDuplicarPlan('${reg.id}')" title="Duplicar planificación">
          <span class="material-icons">content_copy</span> Duplicar
        </button>
        <button class="btn-pln-del" onclick="eliminarPlanificacionGuardada('${reg.id}')" title="Eliminar">
          <span class="material-icons">delete_outline</span>
        </button>
      </div>`;
    return card;
  };

  // ── Sección de grupo ──────────────────────────────────────────
  const _renderGrupo = (titulo, icono, color, planes) => {
    const section = document.createElement('div');
    section.className = 'pln-grupo';
    const header = document.createElement('div');
    header.className = 'pln-grupo-header';
    header.innerHTML = `
      <span class="material-icons" style="color:${color};">${icono}</span>
      <span class="pln-grupo-nombre">${escHTML(titulo)}</span>
      <span class="pln-grupo-count">${planes.length} plan${planes.length !== 1 ? 'es' : ''}</span>
      <span class="material-icons pln-grupo-chevron">expand_more</span>`;
    // Toggle colapsar
    header.addEventListener('click', () => {
      section.classList.toggle('pln-grupo-collapsed');
    });
    section.appendChild(header);
    const cardsWrap = document.createElement('div');
    cardsWrap.className = 'pln-grupo-cards';
    planes.forEach(({ reg, esPlanActiva }) => {
      cardsWrap.appendChild(_renderCard(reg, esPlanActiva));
    });
    section.appendChild(cardsWrap);
    return section;
  };

  // Cursos con planes
  nombresCurso.forEach(nombre => {
    grid.appendChild(_renderGrupo(nombre, 'class', '#1565C0', grupos[nombre]));
  });

  // Sin curso asignado
  if (sinCurso.length > 0) {
    grid.appendChild(_renderGrupo('Sin curso asignado', 'folder_off', '#78909C',
      sinCurso.map(reg => ({ reg, esPlanActiva: false }))));
  }
}

/** Escapa HTML básico (helper local para la biblioteca) */



function escHTML(s) {



  return String(s || '')



    .replace(/&/g, '&amp;').replace(/</g, '&lt;')



    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');



}







// ----------------------------------------------------------------



// NAVEGACIÓN



// ----------------------------------------------------------------







function abrirPlanificaciones() {
  renderizarBiblioteca();
  _mostrarPanel('panel-planificaciones');
}
// __old_abrirPlanificaciones__






