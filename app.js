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



function generarInstrumento(actividad, nivelEC) {



  if (nivelEC === 'conocimiento' || nivelEC === 'comprension') {



    return generarListaCotejo(actividad, nivelEC);



  } else {



    return generarRubrica(actividad, nivelEC);



  }



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



        <span class="ec-codigo">${ec.codigo}</span>



        <span class="ec-chip chip-${ec.nivel}">${nombreNivel}</span>



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



  });







  // Mostrar resumen de distribución



  const resumen = document.getElementById('resumen-distribucion');



  resumen.classList.remove('hidden');



  document.getElementById('total-horas-display').textContent = planificacion.horasTotal + ' hrs';



  document.getElementById('total-semanas-display').textContent = planificacion.semanas + ' sem';



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



function renderizarActividades(listaActividades) {



  const tbody = document.getElementById('tabla-actividades-body');



  tbody.innerHTML = '';







  if (listaActividades.length === 0) {



    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:2rem;color:#757575;">No se generaron actividades. Verifica los días de clase seleccionados.</td></tr>`;



    return;



  }







  listaActividades.forEach((act, idx) => {



    const tipoLabel = act.instrumento ? act.instrumento.tipoLabel : 'Sin instrumento';



    const badgeClass = act.instrumento?.tipo === 'cotejo' ? 'badge-cotejo' : 'badge-rubrica';



    const icono = act.instrumento?.tipo === 'cotejo' ? 'checklist' : 'table_chart';







    const tr = document.createElement('tr');



    tr.innerHTML = `



      <td><span class="fecha-chip">${act.fechaStr}</span></td>



      <td><code style="font-size:0.8rem;color:#1565C0;font-weight:600;">${act.ecCodigo}</code></td>



      <td style="max-width:280px;">${act.enunciado}</td>



      <td><span class="instrumento-badge ${badgeClass}">



        <span class="material-icons" style="font-size:14px;">${icono}</span>



        ${tipoLabel}



      </span></td>



      <td>



        <button class="btn-ver-instrumento" onclick="abrirModalInstrumento(${idx})">



          <span class="material-icons">visibility</span>



          Ver instrumento



        </button>



      </td>



    `;



    tbody.appendChild(tr);



  });



}







// ================================================================



// --- SECCIÓN: UI ?" MODAL DE INSTRUMENTO ---



// ================================================================







/**



 * Abre el modal mostrando el instrumento de la actividad indicada



 * @param {number} idxActividad - Índice en planificacion.actividades



 */



function abrirModalInstrumento(idxActividad) {



  const act = planificacion.actividades[idxActividad];



  if (!act || !act.instrumento) return;







  const inst = act.instrumento;



  document.getElementById('modal-title').textContent = inst.titulo;







  const body = document.getElementById('modal-body');



  body.innerHTML = inst.tipo === 'cotejo'



    ? renderizarListaCotejoHTML(inst)



    : renderizarRubricaHTML(inst);







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



}







/**



 * Genera el HTML de una Lista de Cotejo



 */



function renderizarListaCotejoHTML(inst) {



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



  const vp = document.getElementById('vista-previa');



  const dg = planificacion.datosGenerales;



  const ra = planificacion.ra;



  const ec = planificacion.elementosCapacidad;



  const acts = planificacion.actividades;



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



  if (!planificacion.elementosCapacidad?.length) {



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
  var item = (biblio.items || []).find(function (it) { return it.id === sel.value; });
  if (!item || !item.planificacion) { mostrarToast('No se encontró la planificación', 'error'); return; }
  planificacion = item.planificacion;
  (planificacion.actividades || []).forEach(function (a) { if (a.fecha && typeof a.fecha === 'string') a.fecha = new Date(a.fecha); });
  (planificacion.fechasClase || []).forEach(function (f) { if (f.fecha && typeof f.fecha === 'string') f.fecha = new Date(f.fecha); });
  mostrarToast('Planificación cargada correctamente.', 'success');
  if (callback) callback();
}

function _actualizarSelectorPlanCal(tieneActividades) {
  var area = document.getElementById('cal-sin-actividades');
  if (!area) return;
  if (tieneActividades) { area.classList.add('hidden'); return; }
  var opts = _getBiblioOpts();
  area.classList.remove('hidden');
  if (!opts) {
    area.innerHTML = '<span class="material-icons">info</span><p>No hay planificaciones guardadas. Completa una planificación y guárdala primero.</p>';
    return;
  }
  area.innerHTML = '<span class="material-icons" style="color:#1565C0;">info</span>'
    + '<div style="flex:1;"><p style="margin:0 0 8px;font-weight:600;">Selecciona la planificación para registrar calificaciones:</p>'
    + '<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">'
    + '<select id="cal-selector-plan" style="flex:1;min-width:200px;padding:8px 12px;border:1.5px solid #90CAF9;border-radius:8px;font-size:0.9rem;">'
    + '<option value="">-- Selecciona --</option>' + opts + '</select>'
    + '<button class="btn-siguiente" style="padding:8px 16px;" onclick="_cargarPlanDesdeSelector(\'cal-selector-plan\',function(){document.getElementById(\'cal-sin-actividades\').classList.add(\'hidden\');renderizarCalificaciones();});">'
    + '<span class="material-icons">upload</span> Cargar</button></div></div>';
}

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



    // Desactivar botón siguiente si se edita el RA después de generar



    document.getElementById('btn-paso2-siguiente').disabled = true;



    planificacion.elementosCapacidad = [];



    planificacion.actividades = [];



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
  ['section-1', 'section-2', 'section-3', 'section-4', 'section-5'].forEach(id => {
    document.getElementById(id)?.classList.add('hidden');
  });
  _stepSectionsOcultas = true;
  // Ocultar otros paneles
  ['panel-calificaciones', 'panel-planificaciones', 'panel-diarias'].forEach(id => {
    if (id !== panelId) document.getElementById(id)?.classList.add('hidden');
  });
  // Mostrar panel deseado
  document.getElementById(panelId)?.classList.remove('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function _ocultarPaneles() {
  document.querySelector('.stepper-container')?.classList.remove('hidden');
  // Restaurar secciones de pasos - solo la activa debe verse
  ['section-1', 'section-2', 'section-3', 'section-4', 'section-5'].forEach(id => {
    document.getElementById(id)?.classList.remove('hidden');
  });
  _stepSectionsOcultas = false;
  // Ocultar paneles
  ['panel-calificaciones', 'panel-planificaciones', 'panel-diarias'].forEach(id => {
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



function abrirModalNuevoCurso() {



  document.getElementById('modal-title').textContent = 'Nuevo Curso';



  document.getElementById('modal-body').innerHTML = `



    <div class="modal-curso-content">



      <label for="input-nombre-curso">Nombre del curso (ej: 2do Año Sección A)</label>



      <input type="text" id="input-nombre-curso" placeholder="Ej: 2do B - Turno Matutino"



             maxlength="60" autofocus />



    </div>`;



  document.getElementById('modal-footer').innerHTML = `



    <button class="btn-siguiente" onclick="crearCurso()">



      <span class="material-icons">add</span> Crear curso



    </button>



    <button class="btn-secundario" onclick="cerrarModalBtn()">Cancelar</button>`;







  document.getElementById('modal-overlay').classList.remove('hidden');



  document.body.style.overflow = 'hidden';



  setTimeout(() => document.getElementById('input-nombre-curso')?.focus(), 100);







  // Permitir Enter para crear



  document.getElementById('input-nombre-curso').addEventListener('keydown', e => {



    if (e.key === 'Enter') crearCurso();



  });



}







/** Crea un nuevo curso y lo activa */



function crearCurso() {



  const nombre = document.getElementById('input-nombre-curso')?.value?.trim();



  if (!nombre) { mostrarToast('Escribe un nombre para el curso', 'error'); return; }







  const id = uid();



  calState.cursos[id] = { id, nombre, estudiantes: [], notas: {} };



  calState.cursoActivoId = id;



  guardarCalificaciones();



  cerrarModalBtn();



  renderizarCalificaciones();



  mostrarToast(`Curso "${nombre}" creado`, 'success');



}







/** Elimina un curso con confirmación */



function eliminarCurso(id) {



  const curso = calState.cursos[id];



  if (!curso) return;



  if (!confirm(`¿Eliminar el curso "${curso.nombre}" y todas sus calificaciones?`)) return;



  delete calState.cursos[id];



  const ids = Object.keys(calState.cursos);



  calState.cursoActivoId = ids.length > 0 ? ids[0] : null;



  guardarCalificaciones();



  renderizarCalificaciones();



  mostrarToast('Curso eliminado', 'info');



}







/** Cambia el curso activo */



function activarCurso(id) {



  if (!calState.cursos[id]) return;



  calState.cursoActivoId = id;



  guardarCalificaciones();



  renderizarCalificaciones();



}







// ----------------------------------------------------------------



// ESTUDIANTES



// ----------------------------------------------------------------







/** Agrega los estudiantes escritos en el textarea */



function agregarEstudiantes() {



  const raw = document.getElementById('input-estudiantes')?.value || '';



  const nombres = raw.split('\n').map(n => n.trim()).filter(n => n.length > 0);







  if (nombres.length === 0) {



    mostrarToast('Escribe al menos un nombre', 'error');



    return;



  }







  const cursoId = calState.cursoActivoId;



  if (!cursoId || !calState.cursos[cursoId]) {



    mostrarToast('Primero crea o selecciona un curso', 'error');



    return;



  }







  const curso = calState.cursos[cursoId];



  let agregados = 0;



  nombres.forEach(nombre => {



    // Evitar duplicados exactos



    const existe = curso.estudiantes.some(e => e.nombre.toLowerCase() === nombre.toLowerCase());



    if (!existe) {



      curso.estudiantes.push({ id: uid(), nombre });



      agregados++;



    }



  });







  if (agregados === 0) {



    mostrarToast('Todos los nombres ya existen en el curso', 'info');



    return;



  }







  document.getElementById('input-estudiantes').value = '';



  guardarCalificaciones();



  renderizarCalificaciones();



  mostrarToast(`${agregados} estudiante(s) agregado(s)`, 'success');



}







/** Elimina un estudiante del curso activo */



function eliminarEstudiante(estudianteId) {



  const curso = calState.cursos[calState.cursoActivoId];



  if (!curso) return;



  curso.estudiantes = curso.estudiantes.filter(e => e.id !== estudianteId);



  delete curso.notas[estudianteId];



  guardarCalificaciones();



  renderizarTablaCalificaciones();



}







/** Inicia edición inline del nombre de un estudiante */



function editarNombreEstudiante(estudianteId) {



  const curso = calState.cursos[calState.cursoActivoId];



  if (!curso) return;



  const est = curso.estudiantes.find(e => e.id === estudianteId);



  if (!est) return;







  const celda = document.getElementById(`nombre-${estudianteId}`);



  if (!celda) return;







  const input = document.createElement('input');



  input.type = 'text';



  input.value = est.nombre;



  input.style.cssText = 'width:100%;border:1.5px solid #1565C0;border-radius:4px;padding:4px 6px;font-family:Roboto,sans-serif;font-size:0.9rem;';







  celda.querySelector('.td-nombre-inner').replaceWith(input);



  input.focus();



  input.select();







  const guardar = () => {



    const nuevo = input.value.trim();



    if (nuevo) est.nombre = nuevo;



    guardarCalificaciones();



    renderizarTablaCalificaciones();



  };







  input.addEventListener('blur', guardar);



  input.addEventListener('keydown', e => { if (e.key === 'Enter') guardar(); });



}







// ----------------------------------------------------------------



// NOTAS



// ----------------------------------------------------------------







/** Registra una nota para un estudiante en una actividad */



// ================================================================
// SISTEMA DE CALIFICACIONES POR RA
// ================================================================

function _getRaKey() {
  const dg = planificacion.datosGenerales || {};
  const ra = planificacion.ra || {};
  const base = (dg.moduloFormativo || '') + '|' + (dg.codigoModulo || '') + '|' + (ra.descripcion || '').substring(0, 40);
  try { return 'ra_' + btoa(unescape(encodeURIComponent(base))).substring(0, 16).replace(/[^a-zA-Z0-9]/g, '_'); }
  catch (e) { return 'ra_' + Math.abs(base.split('').reduce((a, c) => a + c.charCodeAt(0), 0)) % 999999; }
}

function _ensureRA(curso, raKey) {
  if (!curso.ras) curso.ras = {};
  if (!curso.ras[raKey]) {
    const dg = planificacion.datosGenerales || {};
    const ra = planificacion.ra || {};
    const acts = planificacion.actividades || [];
    const valorTotal = parseFloat(dg.valorRA) || 10;
    const valores = {};
    if (acts.length > 0) {
      const porAct = Math.floor((valorTotal / acts.length) * 10) / 10;
      acts.forEach((a, i) => {
        valores[a.id] = (i === acts.length - 1)
          ? Math.round((valorTotal - porAct * (acts.length - 1)) * 10) / 10
          : porAct;
      });
    }
    curso.ras[raKey] = {
      raKey,
      label: (ra.descripcion || raKey).substring(0, 80),
      modulo: dg.moduloFormativo || '',
      valorTotal,
      actividades: acts.map(a => a.id),
      valores
    };
  }
  return curso.ras[raKey];
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
  if (!curso.ras) return null;
  let total = 0, hayAlgo = false;
  Object.keys(curso.ras).forEach(rk => {
    const n = _calcNotaRA(curso, estudianteId, rk);
    if (n !== null) { total += n; hayAlgo = true; }
  });
  return hayAlgo ? Math.round(total * 10) / 10 : null;
}

function _clsNota(n, max) {
  if (n === null || n === undefined) return '';
  const pct = max > 0 ? (n / max) * 100 : n;
  return pct >= 70 ? 'nota-aprobado' : pct >= 60 ? 'nota-regular' : 'nota-reprobado';
}
function _clsProm(n) {
  if (n === null || n === undefined) return '';
  return n >= 70 ? 'prom-aprobado' : n >= 60 ? 'prom-regular' : 'prom-reprobado';
}

function _actualizarFilaRA(estudianteId, raKey) {
  const curso = calState.cursos[calState.cursoActivoId];
  if (!curso) return;
  const nota = _calcNotaRA(curso, estudianteId, raKey);
  const max = curso.ras[raKey]?.valorTotal || 10;
  const cell = document.getElementById('total-ra-' + estudianteId + '-' + raKey);
  if (cell) { cell.textContent = nota !== null ? nota.toFixed(1) : '\u2014'; cell.className = 'td-total-ra ' + _clsNota(nota, max); }
  const notaFinal = _calcNotaFinal(curso, estudianteId);
  const cellFinal = document.getElementById('final-' + estudianteId);
  if (cellFinal) { cellFinal.textContent = notaFinal !== null ? notaFinal.toFixed(1) : '\u2014'; cellFinal.className = 'td-promedio ' + _clsProm(notaFinal); }
}

function _actualizarFooterRA(raKey) {
  const curso = calState.cursos[calState.cursoActivoId];
  if (!curso || !curso.ras?.[raKey]) return;
  const raInfo = curso.ras[raKey];
  raInfo.actividades.forEach(actId => {
    const vals = curso.estudiantes.map(e => curso.notas?.[e.id]?.[raKey]?.[actId]).filter(v => v !== undefined && v !== null);
    const cell = document.getElementById('foot-' + raKey + '-' + actId);
    if (!cell) return;
    if (vals.length === 0) { cell.textContent = '\u2014'; cell.style.color = ''; return; }
    const p = vals.reduce((a, b) => a + b, 0) / vals.length;
    const max = raInfo.valores[actId] || 10;
    cell.textContent = p.toFixed(1);
    cell.style.color = (p / max) >= 0.7 ? '#2E7D32' : (p / max) >= 0.6 ? '#E65100' : '#C62828';
  });
  const tots = curso.estudiantes.map(e => _calcNotaRA(curso, e.id, raKey)).filter(n => n !== null);
  const cellTot = document.getElementById('foot-total-ra-' + raKey);
  if (cellTot) {
    if (tots.length === 0) { cellTot.textContent = '\u2014'; cellTot.style.color = ''; }
    else {
      const p = tots.reduce((a, b) => a + b, 0) / tots.length;
      cellTot.textContent = p.toFixed(1);
      cellTot.style.color = (p / raInfo.valorTotal) >= 0.7 ? '#2E7D32' : (p / raInfo.valorTotal) >= 0.6 ? '#E65100' : '#C62828';
    }
  }
}

function actualizarFilaPromedio(estudianteId) { _actualizarFilaRA(estudianteId, _getRaKey()); }
function actualizarPromedioActividad(actividadId) { _actualizarFooterRA(_getRaKey()); }

// ----------------------------------------------------------------
// RENDERIZADO
// ----------------------------------------------------------------

function renderizarCalificaciones() {
  renderizarTabsCursos();
  renderizarTablaCalificaciones();
}

function renderizarTabsCursos() {
  const container = document.getElementById('cal-tabs');
  if (!container) return;
  container.innerHTML = '';
  const cursos = Object.values(calState.cursos);
  if (cursos.length === 0) {
    container.innerHTML = '<span style="color:#9E9E9E;font-size:0.85rem;">Sin cursos. Crea uno &rarr;</span>';
    return;
  }
  cursos.forEach(curso => {
    const tab = document.createElement('button');
    tab.className = 'cal-tab' + (curso.id === calState.cursoActivoId ? ' activo' : '');
    tab.innerHTML = '<span class="material-icons" style="font-size:16px;">class</span>'
      + escapeHTML(curso.nombre)
      + '<button class="cal-tab-del" title="Eliminar curso" onclick="event.stopPropagation();eliminarCurso(\'' + curso.id + '\')">'
      + '<span class="material-icons" style="font-size:16px;">close</span></button>';
    tab.onclick = () => activarCurso(curso.id);
    container.appendChild(tab);
  });
}

function renderizarTablaCalificaciones() {
  const thead = document.getElementById('cal-thead');
  const tbody = document.getElementById('cal-tbody');
  const tfoot = document.getElementById('cal-tfoot');
  const sinActs = document.getElementById('cal-sin-actividades');
  if (!thead || !tbody || !tfoot) return;

  const actividades = planificacion.actividades || [];
  const cursoId = calState.cursoActivoId;
  const curso = cursoId ? calState.cursos[cursoId] : null;

  if (actividades.length === 0) {
    sinActs?.classList.remove('hidden');
    thead.innerHTML = ''; tbody.innerHTML = ''; tfoot.innerHTML = '';
    return;
  }
  sinActs?.classList.add('hidden');

  if (!curso) {
    thead.innerHTML = '';
    tbody.innerHTML = '<tr><td colspan="99" style="text-align:center;padding:2rem;color:#9E9E9E;">Crea o selecciona un curso para comenzar.</td></tr>';
    tfoot.innerHTML = '';
    return;
  }

  const raKey = _getRaKey();
  const raInfo = _ensureRA(curso, raKey);
  const dg = planificacion.datosGenerales || {};
  const rasKeys = Object.keys(curso.ras || {});

  // ─── ENCABEZADO fila 1 ───
  const raDescCorta = planificacion.ra && planificacion.ra.descripcion
    ? escapeHTML(planificacion.ra.descripcion.substring(0, 65)) + (planificacion.ra.descripcion.length > 65 ? '&hellip;' : '')
    : '';
  const raLabel = escapeHTML((dg.moduloFormativo || 'RA').substring(0, 28))
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
      + escapeHTML(ri.modulo.substring(0, 14) || 'RA') + '<br><small style=\'font-weight:400;\'>(' + ri.valorTotal + ' pts)</small></th>';
  });

  h1 += '<th rowspan="2" style="background:#1B5E20;color:#fff;min-width:72px;font-size:0.8rem;vertical-align:middle;text-align:center;">FINAL</th></tr>';

  // Fila 2: actividades con valor editable
  let h2 = '<tr>';
  actividades.forEach((a, i) => {
    const val = raInfo.valores[a.id] !== undefined ? raInfo.valores[a.id] : '';
    const fechaCorta = a.fechaStr ? a.fechaStr.split(',')[0] : '';
    const ecCorto = a.ecCodigo ? a.ecCodigo.replace('E.C.', '') : '';
    h2 += '<th class="th-act" title="' + escapeHTML(a.enunciado) + '" style="min-width:80px;">'
      + '<div style="font-size:0.72rem;font-weight:600;">Act.' + (i + 1)
      + ' <span style="opacity:0.65;font-weight:400;">' + ecCorto + '</span></div>'
      + '<div style="font-size:0.68rem;opacity:0.7;margin:1px 0;">' + escapeHTML(fechaCorta) + '</div>'
      + '<input type="number" class="input-valor-act" value="' + val + '" min="0.1" max="100" step="0.5"'
      + ' title="Valor m&aacute;ximo de esta actividad" placeholder="pts"'
      + ' onchange="actualizarValorActividad(\'' + a.id + '\',this.value)"'
      + ' style="width:44px;padding:2px 3px;font-size:0.72rem;border:1px solid #90CAF9;border-radius:4px;text-align:center;display:block;margin:2px auto 0;">'
      + '</th>';
  });
  h2 += '</tr>';
  thead.innerHTML = h1 + h2;

  // ─── CUERPO ───
  if (curso.estudiantes.length === 0) {
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
      + '<button class="btn-del-estudiante" onclick="eliminarEstudiante(\'' + est.id + '\')" title="Eliminar"><span class="material-icons" style="font-size:16px;">close</span></button>'
      + '</div></td>';

    actividades.forEach(a => {
      const nota = curso.notas?.[est.id]?.[raKey]?.[a.id];
      const val = nota !== undefined ? nota : '';
      const max = raInfo.valores[a.id] || 100;
      const cls = nota !== undefined ? _clsNota(nota, max) : '';
      cells += '<td><input type="number" class="input-nota ' + cls + '"'
        + ' id="nota-' + est.id + '-' + a.id + '"'
        + ' value="' + val + '" min="0" max="' + max + '" step="0.5" placeholder="\u2014"'
        + ' onchange="registrarNota(\'' + est.id + '\',\'' + a.id + '\',this.value)"'
        + ' oninput="registrarNota(\'' + est.id + '\',\'' + a.id + '\',this.value)"'
        + ' title="M&aacute;x: ' + max + ' pts | ' + escapeHTML(a.enunciado.substring(0, 40)) + '"'
        + '/></td>';
    });

    const notaRA = _calcNotaRA(curso, est.id, raKey);
    cells += '<td class="td-total-ra ' + _clsNota(notaRA, raInfo.valorTotal) + '" id="total-ra-' + est.id + '-' + raKey + '">'
      + (notaRA !== null ? notaRA.toFixed(1) : '\u2014') + '</td>';

    rasKeys.filter(rk => rk !== raKey).forEach(rk => {
      const ri = curso.ras[rk];
      const n = _calcNotaRA(curso, est.id, rk);
      cells += '<td class="td-total-ra ' + _clsNota(n, ri.valorTotal) + '" style="background:#F3E5F5;">'
        + (n !== null ? n.toFixed(1) : '\u2014') + '</td>';
    });

    const notaFinal = _calcNotaFinal(curso, est.id);
    cells += '<td class="td-promedio ' + _clsProm(notaFinal) + '" id="final-' + est.id + '">'
      + (notaFinal !== null ? notaFinal.toFixed(1) : '\u2014') + '</td>';

    tr.innerHTML = cells;
    tbody.appendChild(tr);
  });

  // ─── FOOTER ───
  let footerRow = '<tr><td class="td-foot-label">Prom. clase</td>';
  actividades.forEach(a => {
    const vals = curso.estudiantes.map(e => curso.notas?.[e.id]?.[raKey]?.[a.id]).filter(v => v !== undefined && v !== null);
    const p = vals.length > 0 ? vals.reduce((x, y) => x + y, 0) / vals.length : null;
    const max = raInfo.valores[a.id] || 10;
    footerRow += '<td id="foot-' + raKey + '-' + a.id + '" style="' + (p !== null ? 'color:' + ((p / max) >= 0.7 ? '#2E7D32' : (p / max) >= 0.6 ? '#E65100' : '#C62828') : '') + ';">'
      + (p !== null ? p.toFixed(1) : '\u2014') + '</td>';
  });

  const tots = curso.estudiantes.map(e => _calcNotaRA(curso, e.id, raKey)).filter(n => n !== null);
  const avgRA = tots.length > 0 ? tots.reduce((a, b) => a + b, 0) / tots.length : null;
  footerRow += '<td id="foot-total-ra-' + raKey + '" style="font-weight:700;' + (avgRA !== null ? 'color:' + ((avgRA / raInfo.valorTotal) >= 0.7 ? '#2E7D32' : (avgRA / raInfo.valorTotal) >= 0.6 ? '#E65100' : '#C62828') : '') + ';">'
    + (avgRA !== null ? avgRA.toFixed(1) : '\u2014') + '</td>';

  rasKeys.filter(rk => rk !== raKey).forEach(rk => {
    const ri = curso.ras[rk];
    const tt = curso.estudiantes.map(e => _calcNotaRA(curso, e.id, rk)).filter(n => n !== null);
    const avg = tt.length > 0 ? tt.reduce((a, b) => a + b, 0) / tt.length : null;
    footerRow += '<td style="background:#EDE7F6;font-weight:700;' + (avg !== null ? 'color:' + ((avg / ri.valorTotal) >= 0.7 ? '#2E7D32' : (avg / ri.valorTotal) >= 0.6 ? '#E65100' : '#C62828') : '') + ';">'
      + (avg !== null ? avg.toFixed(1) : '\u2014') + '</td>';
  });

  const fins = curso.estudiantes.map(e => _calcNotaFinal(curso, e.id)).filter(n => n !== null);
  const avgFin = fins.length > 0 ? fins.reduce((a, b) => a + b, 0) / fins.length : null;
  footerRow += '<td style="font-weight:700;' + (avgFin !== null ? 'color:' + (avgFin >= 70 ? '#2E7D32' : avgFin >= 60 ? '#E65100' : '#C62828') : '') + ';">'
    + (avgFin !== null ? avgFin.toFixed(1) : '\u2014') + '</td>';

  footerRow += '</tr>';
  tfoot.innerHTML = footerRow;
}



/** Escapa HTML para evitar XSS en nombres */



function escapeHTML(str) {



  return String(str || '')



    .replace(/&/g, '&amp;')



    .replace(/</g, '&lt;')



    .replace(/>/g, '&gt;')



    .replace(/"/g, '&quot;');



}







// ----------------------------------------------------------------



// NAVEGACIÓN – mostrar/ocultar panel calificaciones



// ----------------------------------------------------------------







/** Muestra el panel de calificaciones y oculta el stepper/main */



function abrirCalificaciones() {
  // Intentar cargar planificación, pero no bloquear si no existe
  _asegurarPlanificacion();
  cargarCalificaciones();
  _mostrarPanel('panel-calificaciones');
  // Si no hay planificación activa, mostrar selector de planificaciones guardadas
  const tieneActividades = (planificacion.actividades || []).length > 0;
  _actualizarSelectorPlanCal(tieneActividades);
  renderizarCalificaciones();
}
// __old_abrirCalificaciones__







/** Cierra el panel y vuelve a la planificación */



function cerrarCalificaciones() {
  _ocultarPaneles();
}
// __old_cerrarCalificaciones__







// ----------------------------------------------------------------



// EXPORTACIÓN DE CALIFICACIONES



// ----------------------------------------------------------------







/** Exporta la tabla de calificaciones a Word */



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







  // Si ya existe uno con el mismo módulo + docente, preguntar si reemplazar



  const idx = biblio.items.findIndex(i =>



    i.planificacion?.datosGenerales?.moduloFormativo === dg.moduloFormativo &&



    i.planificacion?.datosGenerales?.nombreDocente === dg.nombreDocente



  );







  if (idx >= 0) {



    if (!confirm(



      'Ya existe una planificación guardada para "' + (dg.moduloFormativo || '') +



      '". ¿Deseas actualizarla con los datos actuales?'



    )) return;



    biblio.items[idx] = registro;



    mostrarToast('Planificación actualizada en la biblioteca', 'success');



  } else {



    biblio.items.unshift(registro); // más reciente primero



    mostrarToast('Planificación guardada correctamente', 'success');



  }







  persistirBiblioteca(biblio);



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



  const grid = document.getElementById('pln-grid');



  const vacio = document.getElementById('pln-vacio');



  if (!grid || !vacio) return;







  const biblio = cargarBiblioteca();



  const items = biblio.items || [];







  if (items.length === 0) {



    grid.innerHTML = '';



    vacio.classList.remove('hidden');



    return;



  }







  vacio.classList.add('hidden');



  grid.innerHTML = '';







  items.forEach(reg => {



    const dg = reg.planificacion?.datosGenerales || {};



    const ra = reg.planificacion?.ra || {};



    const ec = reg.planificacion?.elementosCapacidad || [];



    const acts = reg.planificacion?.actividades || [];



    const horasTotal = reg.planificacion?.horasTotal || 0;







    const resumenRA = ra.descripcion



      ? ra.descripcion.substring(0, 120) + (ra.descripcion.length > 120 ? '…' : '')



      : 'Sin descripción del RA';







    const busqueda = [



      dg.moduloFormativo, dg.nombreDocente, dg.nombreBachillerato,



      dg.familiaProfesional, ra.descripcion



    ].join(' ').toLowerCase();







    const card = document.createElement('div');



    card.className = 'pln-card';



    card.dataset.busqueda = busqueda;







    card.innerHTML = `



      <div class="pln-card-date">



        <span class="material-icons">schedule</span>



        ${escHTML(reg.fechaGuardadoLabel || reg.fechaGuardado)}



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



        ${ec.length ? '<span class="pln-chip pln-chip-ec"><span class="material-icons" style="font-size:12px;">layers</span>' + ec.length + ' EC</span>' : ''}



        ${acts.length ? '<span class="pln-chip pln-chip-acts"><span class="material-icons" style="font-size:12px;">event_note</span>' + acts.length + ' actividades</span>' : ''}



        ${horasTotal ? '<span class="pln-chip pln-chip-pts"><span class="material-icons" style="font-size:12px;">schedule</span>' + horasTotal + 'h</span>' : ''}



        ${dg.valorRA ? '<span class="pln-chip pln-chip-pts"><span class="material-icons" style="font-size:12px;">star</span>' + dg.valorRA + ' pts</span>' : ''}



      </div>







      <div class="pln-card-actions">



        <button class="btn-pln-cargar" onclick="cargarPlanificacionGuardada('${reg.id}')">



          <span class="material-icons">folder_open</span> Cargar



        </button>



        <button class="btn-pln-del" onclick="eliminarPlanificacionGuardada('${reg.id}')" title="Eliminar">



          <span class="material-icons">delete_outline</span>



        </button>



      </div>`;







    grid.appendChild(card);



  });



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







function cerrarPlanificaciones() {
  _ocultarPaneles();
}
// __old_cerrarPlanificaciones__







// ----------------------------------------------------------------



// INICIALIZACIÓN DEL MÓDULO



// ----------------------------------------------------------------



document.addEventListener('DOMContentLoaded', () => {



  const headerInner = document.querySelector('.header-inner');



  if (!headerInner) return;







  // Botón "Planificaciones" en el header (insertar antes del de Calificaciones)



  if (!document.getElementById('btn-planificaciones')) {



    const btn = document.createElement('button');



    btn.id = 'btn-planificaciones';



    btn.className = 'btn-planificaciones';



    btn.title = 'Mis Planificaciones';



    btn.innerHTML = '<span class="material-icons">folder_special</span>' +



      '<span class="btn-nueva-label">Planificaciones</span>';



    btn.onclick = abrirPlanificaciones;



    const btnCal = document.getElementById('btn-calificaciones');



    if (btnCal) {



      headerInner.insertBefore(btn, btnCal);



    } else {



      const btnNueva = document.getElementById('btn-nueva-planificacion');



      if (btnNueva) headerInner.insertBefore(btn, btnNueva);



      else headerInner.appendChild(btn);



    }



  }







  // Botón "Guardar planificación" flotante en la barra de navegación del stepper



  // Lo inyectamos en el footer del paso 5



  const navPaso5 = document.querySelector('#section-5 .nav-buttons');



  if (navPaso5 && !document.getElementById('btn-guardar-plan')) {



    const btnG = document.createElement('button');



    btnG.id = 'btn-guardar-plan';



    btnG.className = 'btn-guardar-plan';



    btnG.innerHTML = '<span class="material-icons">save</span> Guardar planificación';



    btnG.onclick = guardarPlanificacionActual;



    navPaso5.appendChild(btnG);



  }







  // También añadir "Guardar" al paso 4 (para guardar sin necesitar ir al 5)



  const navPaso4 = document.querySelector('#section-4 .nav-buttons');



  if (navPaso4 && !document.getElementById('btn-guardar-plan-4')) {



    const btnG4 = document.createElement('button');



    btnG4.id = 'btn-guardar-plan-4';



    btnG4.className = 'btn-guardar-plan';



    btnG4.style.fontSize = '0.82rem';



    btnG4.style.padding = '7px 14px';



    btnG4.innerHTML = '<span class="material-icons" style="font-size:16px;">save</span> Guardar';



    btnG4.onclick = guardarPlanificacionActual;



    navPaso4.appendChild(btnG4);



  }



});











// ================================================================



// --- FUNCIÓN: Volver al inicio (logo clickeable) ---



// ================================================================



function irAlHome() {
  _ocultarPaneles();
  irAlPaso(1, false);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}











// ================================================================



// --- MÓDULO: PLANIFICACIONES DIARIAS ---



// ================================================================







const DIARIAS_KEY = 'planificadorRA_diarias_v1';







/** Estado de las planificaciones diarias generadas/editadas */



let estadoDiarias = {



  sesiones: {} // { actividadId: { inicio:{...}, desarrollo:{...}, cierre:{...}, estrategias:'', recursos:'', tiempos:{ini:20,des:60,cie:20} } }



};







function cargarDiarias() {



  try {



    const raw = localStorage.getItem(DIARIAS_KEY);



    if (raw) estadoDiarias = JSON.parse(raw);



  } catch (e) { estadoDiarias = { sesiones: {} }; }



}







function persistirDiarias() {



  localStorage.setItem(DIARIAS_KEY, JSON.stringify(estadoDiarias));



}







function guardarTodasDiarias() {



  // Leer todos los textareas y volcar al estado



  (planificacion.actividades || []).forEach(act => {



    const s = estadoDiarias.sesiones[act.id] || {};



    const read = (campo, sub) => {



      const el = document.getElementById(`pd-${campo}-${sub}-${act.id}`);



      return el ? el.value : (s[campo]?.[sub] || '');



    };



    const readT = (m) => {



      const el = document.getElementById(`pd-t-${m}-${act.id}`);



      return el ? parseInt(el.value) || (m === 'ini' ? 20 : m === 'des' ? 55 : 15) : (s.tiempos?.[m] || (m === 'ini' ? 20 : m === 'des' ? 55 : 15));



    };



    const readSec = (id) => { const el = document.getElementById(id); return el ? el.value : ''; };







    estadoDiarias.sesiones[act.id] = {



      inicio: {



        apertura: read('inicio', 'apertura'),



        encuadre: read('inicio', 'encuadre'),



        organizacion: read('inicio', 'organizacion')



      },



      desarrollo: {



        procedimental: read('desarrollo', 'procedimental'),



        conceptual: read('desarrollo', 'conceptual')



      },



      cierre: {



        sintesis: read('cierre', 'sintesis'),



        conexion: read('cierre', 'conexion'),



        proximopaso: read('cierre', 'proximopaso')



      },



      estrategias: readSec(`pd-estrategias-${act.id}`),



      recursos: readSec(`pd-recursos-${act.id}`),



      tiempos: { ini: readT('ini'), des: readT('des'), cie: readT('cie') }



    };



  });



  persistirDiarias();



  mostrarToast('Planificaciones diarias guardadas', 'success');



}







// ----------------------------------------------------------------



// GENERACIÓN AUTOMÁTICA DE CONTENIDO



// ----------------------------------------------------------------







/** Genera el contenido de una sesión diaria basado en la actividad y su EC */



function generarContenidoSesion(act, ec, horasSesion) {



  const nivel = ec?.nivelBloom || 'aplicacion';



  const campo = (planificacion.datosGenerales?.moduloFormativo || 'el módulo').toLowerCase();



  const tema = act.enunciado || 'Actividad del módulo';



  const temaCorto = tema.split(':')[1]?.trim() || tema.substring(0, 60);



  const ecDesc = ec?.descripcion || '';







  // Tiempos por defecto según horas de sesión (convirtiendo horas a minutos)



  const minSesion = Math.round((horasSesion || 1.5) * 60);



  const tIni = Math.round(minSesion * 0.20);



  const tDes = Math.round(minSesion * 0.60);



  const tCie = minSesion - tIni - tDes;







  // Plantillas por nivel de Bloom



  const plantillas = {



    conocimiento: {



      apertura: `Saludo y activación de conocimientos previos a través de una pregunta exploratoria: ¿Qué saben sobre ${temaCorto}? Registro rápido de ideas en la pizarra (lluvia de ideas grupal).`,



      encuadre: `Presentación del propósito de la clase: identificar y nombrar los elementos fundamentales de ${temaCorto} dentro del campo de ${campo}, reconociendo su importancia en el contexto profesional.`,



      organizacion: `Trabajo individual con apoyo grupal. Los estudiantes inician con una actividad de exploración propia y luego contrastan sus respuestas con un compañero (think-pair-share).`,



      procedimental: `1. El docente presenta el tema con apoyo visual (diapositivas/pizarra).\n2. Los estudiantes leen el material de referencia e identifican los conceptos clave.\n3. Completan una guía de trabajo: definen, enumeran y clasifican los elementos de ${temaCorto}.\n4. Cada estudiante elabora un organizador gráfico (mapa de conceptos o lista organizada).\n5. Se realiza una revisión cruzada con el compañero de al lado.`,



      conceptual: `Reflexión guiada: ¿Por qué es importante conocer estos elementos en el ámbito de ${campo}? Los estudiantes comparten un ejemplo real donde este conocimiento es necesario. Se consolida con la definición colectiva del concepto central.`,



      sintesis: `Pregunta detonadora de cierre: "¿Cuál de los conceptos vistos hoy te parece más relevante para tu futuro desempeño profesional y por qué?" Respuesta oral de 2-3 estudiantes voluntarios.`,



      conexion: `Este conocimiento es la base de toda actuación técnica profesional en ${campo}. Los profesionales que dominan estos fundamentos toman mejores decisiones en situaciones reales de trabajo.`,



      proximopaso: `En la próxima sesión profundizaremos en la comprensión de estos conceptos, analizando casos y estableciendo relaciones entre ellos.`,



      estrategias: `• Activación de conocimientos previos (lluvia de ideas): fomenta la metacognición y conecta el nuevo aprendizaje con lo ya sabido.\n• Think-Pair-Share: promueve el aprendizaje colaborativo y la discusión entre pares.\n• Organizador gráfico (mapa conceptual): facilita la estructuración y retención del conocimiento declarativo.\n• Pregunta detonadora: estimula el pensamiento crítico y la reflexión individual al cierre.`,



      recursos: `• Pizarrón / pizarra digital\n• Guía de trabajo impresa o digital\n• Material de lectura del módulo (texto, apuntes o diapositivas)\n• Marcadores y papel para organizadores gráficos`



    },



    comprension: {



      apertura: `Saludo y presentación de un caso o situación cotidiana relacionada con ${temaCorto}. El docente lanza la pregunta: "¿Qué está ocurriendo aquí y por qué?" generando curiosidad y discusión inicial.`,



      encuadre: `El propósito de esta sesión es comprender a fondo ${temaCorto}, diferenciando sus componentes, estableciendo relaciones y siendo capaces de explicar el concepto con palabras propias en el contexto de ${campo}.`,



      organizacion: `Trabajo en parejas o tríos. Cada grupo analiza un aspecto del tema, para luego compartir sus hallazgos con la clase en un formato de "mini-exposición" de 2 minutos.`,



      procedimental: `1. El docente presenta 2-3 ejemplos contrastantes del tema y guía el análisis comparativo.\n2. Los estudiantes en parejas analizan un caso asignado: identifican características, causas y consecuencias.\n3. Construyen un cuadro comparativo o diagrama que explique las relaciones del tema.\n4. Cada pareja explica brevemente su análisis al grupo (2 min).\n5. El docente guía la síntesis colectiva de los hallazgos.`,



      conceptual: `Debate dirigido: ¿En qué situaciones reales de ${campo} se aplica este concepto? Los estudiantes argumentan sus respuestas. Se realiza una autoevaluación breve: ¿puedo explicar este tema a alguien que no lo conoce?`,



      sintesis: `Cierre con la técnica del "Exit Ticket": cada estudiante escribe en una tarjeta (física o digital) una frase que resume lo aprendido y una pregunta que aún tiene. Se retroalimenta de forma grupal.`,



      conexion: `La comprensión profunda de ${temaCorto} permite al profesional de ${campo} tomar decisiones fundamentadas, diagnosticar situaciones y proponer soluciones coherentes con la realidad del entorno laboral.`,



      proximopaso: `En la próxima sesión pasaremos de la comprensión a la aplicación: resolveremos situaciones prácticas usando este conocimiento en contextos reales del campo profesional.`,



      estrategias: `• Aprendizaje Basado en Análisis de Casos: desarrolla la capacidad de interpretar situaciones complejas.\n• Aprendizaje Cooperativo (parejas): favorece la construcción colectiva del conocimiento.\n• Mini-exposiciones entre pares: fortalece la comprensión al obligar a explicar el tema.\n• Exit Ticket: herramienta de evaluación formativa que promueve la metacognición.`,



      recursos: `• Casos de estudio impresos o digitales\n• Plantilla de cuadro comparativo\n• Tarjetas para Exit Ticket (físicas o formulario digital)\n• Proyector o pizarra para síntesis colectiva`



    },



    aplicacion: {



      apertura: `Saludo y presentación de un desafío o problema real del campo de ${campo} relacionado con ${temaCorto}. Se lanza la pregunta: "¿Cómo resolverían este problema con lo que saben?" Activando el pensamiento creativo y la motivación.`,



      encuadre: `Hoy aplicaremos los conocimientos sobre ${temaCorto} para resolver una situación práctica concreta del entorno profesional de ${campo}. El foco está en el proceso de resolución, no solo en la respuesta correcta.`,



      organizacion: `Trabajo en equipos de 3-4 personas. Cada equipo recibe el mismo reto pero podrá proponer distintas soluciones. Al final se comparan los resultados y se discute la mejor estrategia.`,



      procedimental: `1. El docente presenta el problema/reto y clarifca las instrucciones y criterios de evaluación (rúbrica compartida).\n2. Los equipos planifican su estrategia de resolución (5 min).\n3. Fase de ejecución: aplican los conceptos y herramientas disponibles para resolver el reto paso a paso.\n4. Documentan el proceso: anotan los pasos seguidos, herramientas usadas y decisiones tomadas.\n5. Presentan su solución al grupo con una breve explicación (3 min por equipo).\n6. Coevaluación: cada equipo evalúa brevemente la solución de otro usando la rúbrica.`,



      conceptual: `Reflexión metacognitiva: ¿Qué estrategia funcionó mejor y por qué? ¿Qué cambiarían en una segunda oportunidad? Los estudiantes identifican los principios aplicados en su solución y los conectan con la teoría vista.`,



      sintesis: `El docente guía la síntesis: ¿Qué aprendieron HOY que no sabían antes de resolver el problema? Cada equipo comparte una lección aprendida. Se registra en el pizarrón como resumen colectivo.`,



      conexion: `Esta misma metodología de resolución de problemas es la que usan los profesionales de ${campo} en su día a día. Dominar este proceso les permitirá enfrentarse con confianza a desafíos reales en la industria.`,



      proximopaso: `En la próxima sesión profundizaremos en las actitudes y valores profesionales que complementan estas competencias técnicas, explorando la dimensión ética del trabajo en ${campo}.`,



      estrategias: `• Aprendizaje Basado en Problemas (ABP): contextualiza el aprendizaje en situaciones reales y motiva la búsqueda activa de soluciones.\n• Aprendizaje Cooperativo por equipos: fomenta la comunicación efectiva y el trabajo colaborativo.\n• Coevaluación con rúbrica: desarrolla el juicio crítico y la autorregulación del aprendizaje.\n• Pensamiento visible (documentar el proceso): promueve la metacognición y el aprendizaje autónomo.`,



      recursos: `• Problema/reto impreso o en pantalla\n• Rúbrica de evaluación compartida con los estudiantes\n• Herramientas del campo (software, equipos, materiales según el módulo)\n• Acceso a recursos de referencia (manuales, guías técnicas, internet)\n• Hoja de registro del proceso de resolución`



    },



    actitudinal: {



      apertura: `Saludo y apertura con un dilema ético o profesional relacionado con ${campo}: se presenta un caso real o ficticio de toma de decisiones en el entorno laboral. Se lanza la pregunta: "¿Qué harías en esta situación y por qué?"`,



      encuadre: `Esta sesión está centrada en el desarrollo de actitudes y valores profesionales fundamentales para el desempeño en ${campo}. Reflexionaremos sobre la ética profesional, la responsabilidad y el compromiso con la calidad en nuestra práctica cotidiana.`,



      organizacion: `Debate en círculo socrático: todos participan desde su perspectiva personal. Luego, trabajo individual de portafolio/reflexión escrita. No hay respuestas únicas; se valora la profundidad de la reflexión.`,



      procedimental: `1. Lectura o presentación del dilema/caso ético (individual, 5 min).\n2. Ronda de opiniones: cada estudiante comparte su postura inicial (sin interrupciones).\n3. Debate guiado: el docente introduce preguntas que profundizan el análisis: ¿Qué valores están en juego? ¿Qué consecuencias tendría cada decisión?\n4. Los estudiantes redefinen su postura tras escuchar a sus compañeros.\n5. Cada uno redacta en su portafolio una reflexión personal: ¿Qué tipo de profesional de ${campo} quiero ser? ¿Qué valores guiarán mi práctica?`,



      conceptual: `Consolidación: análisis de referentes profesionales del campo que demuestran valores como la integridad, la innovación responsable y el compromiso social. Los estudiantes identifican actitudes a emular en su futura práctica.`,



      sintesis: `Cada estudiante escribe en una tarjeta (o comparte oralmente) UN compromiso personal que se lleva de esta clase para su desarrollo profesional. Se crea un "mural de compromisos" colectivo.`,



      conexion: `Las competencias técnicas son importantes, pero son los valores y la ética profesional los que distinguen a un buen técnico de un excelente profesional. En ${campo}, la confianza de los clientes y empleadores se construye sobre la base de la integridad y la responsabilidad.`,



      proximopaso: `En la próxima sesión integraremos las competencias técnicas y actitudinales en una actividad integradora que pondrá a prueba todas las capacidades desarrolladas durante este Elemento de Capacidad.`,



      estrategias: `• Diálogo Socrático / Debate ético: desarrolla el pensamiento crítico y la capacidad de argumentación fundamentada.\n• Portafolio reflexivo: promueve la metacognición, la autoevaluación y el desarrollo de la identidad profesional.\n• Aprendizaje Basado en Valores (ABV): conecta el aprendizaje con la dimensión humana y ética de la profesión.\n• Análisis de referentes profesionales: proporciona modelos de actuación profesional íntegra y motivadora.`,



      recursos: `• Caso/dilema ético impreso o proyectado\n• Portafolio del estudiante (cuaderno o carpeta digital)\n• Tarjetas o post-its para el mural de compromisos\n• Materiales sobre referentes del campo (artículos, videos breves, testimonios)`



    }



  };







  const p = plantillas[nivel] || plantillas.aplicacion;



  return {



    inicio: { apertura: p.apertura, encuadre: p.encuadre, organizacion: p.organizacion },



    desarrollo: { procedimental: p.procedimental, conceptual: p.conceptual },



    cierre: { sintesis: p.sintesis, conexion: p.conexion, proximopaso: p.proximopaso },



    estrategias: p.estrategias,



    recursos: (planificacion.ra?.recursosDid || '') ?



      p.recursos + '\n• ' + (planificacion.ra?.recursosDid || '').replace(/\n/g, '\n• ') :



      p.recursos,



    tiempos: { ini: tIni, des: tDes, cie: tCie }



  };



}







// ----------------------------------------------------------------



// BOTÓN GENERAR INDIVIDUAL



// ----------------------------------------------------------------



function generarSesion(actId) {



  const act = (planificacion.actividades || []).find(a => a.id === actId);



  if (!act) return;



  const ec = (planificacion.elementosCapacidad || []).find(e => e.codigo === act.ecCodigo);



  const horasAct = ec ? (ec.horasAsignadas / Math.max(1, (planificacion.actividades || []).filter(a => a.ecCodigo === ec.codigo).length)) : 1.5;







  // Si la actividad tiene sesión generada por IA, usarla; si no, generar local
  let gen;
  if (act.sesionIA) {
    const s = act.sesionIA;
    const minSesion = Math.round((horasAct || 1.5) * 60);
    const tIni = Math.round(minSesion * 0.20);
    const tDes = Math.round(minSesion * 0.60);
    const tCie = minSesion - tIni - tDes;
    gen = {
      inicio: {
        apertura: s.apertura || '',
        encuadre: s.encuadre || '',
        organizacion: s.organizacion || 'Trabajo individual y grupal según la dinámica de la actividad.'
      },
      desarrollo: {
        procedimental: s.procedimental || '',
        conceptual: s.conceptual || ''
      },
      cierre: {
        sintesis: s.sintesis || '',
        conexion: s.conceptual || '',
        proximopaso: s.proximopaso || 'Continuar con la siguiente actividad del EC.'
      },
      estrategias: s.estrategias || '',
      recursos: planificacion.ra?.recursosDid || 'Material del módulo, pizarrón, guías de trabajo.',
      tiempos: { ini: tIni, des: tDes, cie: tCie }
    };
  } else {
    gen = generarContenidoSesion(act, ec, horasAct);
  }



  estadoDiarias.sesiones[actId] = gen;



  persistirDiarias();







  // Actualizar textareas en vivo



  const s = gen;



  const set = (id, val) => { const el = document.getElementById(id); if (el) el.value = val; };



  set(`pd-inicio-apertura-${actId}`, s.inicio.apertura);



  set(`pd-inicio-encuadre-${actId}`, s.inicio.encuadre);



  set(`pd-inicio-organizacion-${actId}`, s.inicio.organizacion);



  set(`pd-desarrollo-procedimental-${actId}`, s.desarrollo.procedimental);



  set(`pd-desarrollo-conceptual-${actId}`, s.desarrollo.conceptual);



  set(`pd-cierre-sintesis-${actId}`, s.cierre.sintesis);



  set(`pd-cierre-conexion-${actId}`, s.cierre.conexion);



  set(`pd-cierre-proximopaso-${actId}`, s.cierre.proximopaso);



  set(`pd-estrategias-${actId}`, s.estrategias);



  set(`pd-recursos-${actId}`, s.recursos);







  const setT = (m, v) => { const el = document.getElementById(`pd-t-${m}-${actId}`); if (el) el.value = v; };



  setT('ini', s.tiempos.ini);



  setT('des', s.tiempos.des);



  setT('cie', s.tiempos.cie);







  mostrarToast('Sesión generada automáticamente', 'success');



}







// ----------------------------------------------------------------



// RENDERIZADO



// ----------------------------------------------------------------







function filtrarSesionesEC(btn, ecCodigo) {



  document.querySelectorAll('.pd-chip-flt').forEach(b => b.classList.remove('activo'));



  btn.classList.add('activo');



  document.querySelectorAll('.pd-sesion-card').forEach(card => {



    card.style.display = (ecCodigo === 'todos' || card.dataset.ec === ecCodigo) ? '' : 'none';



  });



}







function toggleSesion(actId) {



  const body = document.getElementById(`pd-body-${actId}`);



  if (!body) return;



  body.classList.toggle('open');



  const btn = document.getElementById(`pd-toggle-${actId}`);



  if (btn) {



    const open = body.classList.contains('open');



    btn.innerHTML = `<span class="material-icons" style="font-size:16px;">${open ? 'expand_less' : 'expand_more'}</span> ${open ? 'Contraer' : 'Ver / Editar'}`;



  }



}







/** Renderiza toda la lista de sesiones */



function renderizarDiarias() {



  const lista = document.getElementById('pd-sesiones-lista');



  const sinActs = document.getElementById('pd-sin-actividades');



  const filtroBar = document.getElementById('pd-filtro-bar');



  const filtroChips = document.getElementById('pd-filtro-chips');



  if (!lista) return;







  const actividades = planificacion.actividades || [];



  if (actividades.length === 0) {



    sinActs?.classList.remove('hidden');



    filtroBar?.classList.add('hidden');



    lista.innerHTML = '';



    return;



  }



  sinActs?.classList.add('hidden');



  filtroBar?.classList.remove('hidden');







  // Chips de EC



  const ecCodigos = [...new Set(actividades.map(a => a.ecCodigo).filter(Boolean))];



  filtroChips.innerHTML = '<button class="pd-chip-flt activo" data-ec="todos" onclick="filtrarSesionesEC(this,\'todos\')">Todas</button>';



  ecCodigos.forEach(ec => {



    filtroChips.innerHTML += `<button class="pd-chip-flt" data-ec="${ec}" onclick="filtrarSesionesEC(this,'${ec}')">${ec}</button>`;



  });







  // Chips de color por nivel



  const nivColores = { conocimiento: '#388E3C', comprension: '#1565C0', aplicacion: '#E65100', actitudinal: '#6A1B9A' };



  const nivLabel = { conocimiento: 'Conocimiento', comprension: 'Comprensión', aplicacion: 'Aplicación', actitudinal: 'Actitudinal' };







  lista.innerHTML = '';



  actividades.forEach((act, idx) => {



    const ec = (planificacion.elementosCapacidad || []).find(e => e.codigo === act.ecCodigo) || {};



    const nivel = ec.nivelBloom || 'aplicacion';



    const color = nivColores[nivel] || '#1565C0';



    const s = estadoDiarias.sesiones[act.id] || {};



    const ti = s.tiempos?.ini ?? 20;



    const td = s.tiempos?.des ?? 55;



    const tc = s.tiempos?.cie ?? 15;



    const total = ti + td + tc;







    const card = document.createElement('div');



    card.className = 'pd-sesion-card';



    card.dataset.ec = act.ecCodigo || '';







    const enunciadoCorto = (act.enunciado || '').substring(0, 80) + ((act.enunciado || '').length > 80 ? '…' : '');







    card.innerHTML = `



      <div class="pd-sesion-header" onclick="toggleSesion('${act.id}')">



        <div class="pd-sesion-num">${idx + 1}</div>



        <div class="pd-sesion-info">



          <div class="pd-sesion-titulo">${enunciadoCorto}</div>



          <div class="pd-sesion-meta">



            <span><span class="material-icons">event</span>${act.fechaStr || 'Sin fecha'}</span>



            <span><span class="material-icons">schedule</span>${total} min</span>



            <span class="pd-ec-chip" style="background:${color}22;color:${color};">${act.ecCodigo || ''}</span>



            <span class="pd-ec-chip" style="background:${color}22;color:${color};">${nivLabel[nivel] || nivel}</span>



          </div>



        </div>



        <button class="btn-pd-generar" onclick="event.stopPropagation();generarSesion('${act.id}')" title="Generar contenido automáticamente">



          <span class="material-icons">auto_awesome</span> Generar



        </button>



        <button class="pd-sesion-expand-btn" id="pd-toggle-${act.id}"



                onclick="event.stopPropagation();toggleSesion('${act.id}')">



          <span class="material-icons" style="font-size:16px;">expand_more</span> Ver / Editar



        </button>



      </div>







      <div class="pd-sesion-body" id="pd-body-${act.id}">







        <!-- Distribución de tiempos -->



        <div class="pd-tiempo-row">



          <div class="pd-tiempo-item">



            <label>🟢 Inicio:</label>



            <input type="number" id="pd-t-ini-${act.id}" value="${ti}" min="5" max="60">



            <span style="font-size:0.8rem;color:#757575;">min</span>



          </div>



          <div class="pd-tiempo-item">



            <label>🔵 Desarrollo:</label>



            <input type="number" id="pd-t-des-${act.id}" value="${td}" min="20" max="120">



            <span style="font-size:0.8rem;color:#757575;">min</span>



          </div>



          <div class="pd-tiempo-item">



            <label>🟠 Cierre:</label>



            <input type="number" id="pd-t-cie-${act.id}" value="${tc}" min="5" max="30">



            <span style="font-size:0.8rem;color:#757575;">min</span>



          </div>



        </div>







        <!-- 1er MOMENTO: INICIO -->



        <div class="pd-momento inicio">



          <div class="pd-momento-header">



            <span class="material-icons">play_circle</span>



            1er MOMENTO – INICIO



            <span class="pd-momento-pct">${ti} min</span>



          </div>



          <div class="pd-momento-body">



            <div class="pd-sub">



              <div class="pd-sub-label"><span class="material-icons">record_voice_over</span>Apertura</div>



              <textarea id="pd-inicio-apertura-${act.id}" rows="7" placeholder="Breve saludo y enganche con el tema...">${s.inicio?.apertura || ''}</textarea>



            </div>



            <div class="pd-sub">



              <div class="pd-sub-label"><span class="material-icons">flag</span>Encuadre</div>



              <textarea id="pd-inicio-encuadre-${act.id}" rows="2" placeholder="Propósito de la clase...">${s.inicio?.encuadre || ''}</textarea>



            </div>



            <div class="pd-sub">



              <div class="pd-sub-label"><span class="material-icons">groups</span>Organización</div>



              <textarea id="pd-inicio-organizacion-${act.id}" rows="2" placeholder="Cómo se trabajará: equipos, individual...">${s.inicio?.organizacion || ''}</textarea>



            </div>



          </div>



        </div>







        <!-- 2do MOMENTO: DESARROLLO -->



        <div class="pd-momento desarrollo">



          <div class="pd-momento-header">



            <span class="material-icons">build</span>



            2do MOMENTO – DESARROLLO



            <span class="pd-momento-pct">${td} min</span>



          </div>



          <div class="pd-momento-body">



            <div class="pd-sub">



              <div class="pd-sub-label"><span class="material-icons">engineering</span>Procedimental / Actividad principal</div>



              <textarea id="pd-desarrollo-procedimental-${act.id}" rows="12" placeholder="Paso a paso de lo que harán los estudiantes...">${s.desarrollo?.procedimental || ''}</textarea>



            </div>



            <div class="pd-sub">



              <div class="pd-sub-label"><span class="material-icons">psychology</span>Conceptual / Actitudinal</div>



              <textarea id="pd-desarrollo-conceptual-${act.id}" rows="3" placeholder="Reflexión, debate, autoevaluación o consolidación...">${s.desarrollo?.conceptual || ''}</textarea>



            </div>



          </div>



        </div>







        <!-- 3er MOMENTO: CIERRE -->



        <div class="pd-momento cierre">



          <div class="pd-momento-header">



            <span class="material-icons">flag_circle</span>



            3er MOMENTO – CIERRE



            <span class="pd-momento-pct">${tc} min</span>



          </div>



          <div class="pd-momento-body">



            <div class="pd-sub">



              <div class="pd-sub-label"><span class="material-icons">summarize</span>Síntesis</div>



              <textarea id="pd-cierre-sintesis-${act.id}" rows="8" placeholder="Pregunta detonadora o resumen...">${s.cierre?.sintesis || ''}</textarea>



            </div>



            <div class="pd-sub">



              <div class="pd-sub-label"><span class="material-icons">public</span>Conexión con el mundo real</div>



              <textarea id="pd-cierre-conexion-${act.id}" rows="2" placeholder="Cómo aplica al entorno profesional real...">${s.cierre?.conexion || ''}</textarea>



            </div>



            <div class="pd-sub">



              <div class="pd-sub-label"><span class="material-icons">navigate_next</span>Próximo paso</div>



              <textarea id="pd-cierre-proximopaso-${act.id}" rows="2" placeholder="Breve introducción a la próxima clase...">${s.cierre?.proximopaso || ''}</textarea>



            </div>



          </div>



        </div>







        <!-- ESTRATEGIAS -->



        <div class="pd-estrategias">



          <div class="pd-sec-header">



            <span class="material-icons">lightbulb</span> ESTRATEGIA(S) UTILIZADA(S)



          </div>



          <div class="pd-sec-body">



            <textarea id="pd-estrategias-${act.id}" rows="8"



              placeholder="Lista las 3-4 estrategias pedagógicas aplicadas con una breve justificación cada una. Ej:



• ABP: contextualiza el aprendizaje en situaciones reales...



• Coevaluación: desarrolla el juicio crítico...">${s.estrategias || ''}</textarea>



          </div>



        </div>







        <!-- RECURSOS -->



        <div class="pd-recursos-sect">



          <div class="pd-sec-header">



            <span class="material-icons">inventory_2</span> RECURSOS



          </div>



          <div class="pd-sec-body">



            <textarea id="pd-recursos-${act.id}" rows="4"



              placeholder="Lista viñeteada de materiales físicos o digitales necesarios para la sesión...">${s.recursos || ''}</textarea>



          </div>



        </div>







      </div><!-- fin pd-sesion-body -->



    `;



    lista.appendChild(card);



  });



}







// ----------------------------------------------------------------



// EXPORTAR



// ----------------------------------------------------------------



function exportarDiariasWord() {



  guardarTodasDiarias();



  const actividades = planificacion.actividades || [];



  if (!actividades.length) { mostrarToast('No hay sesiones para exportar', 'error'); return; }







  const dg = planificacion.datosGenerales || {};



  const hoy = new Date().toLocaleDateString('es-DO', { day: '2-digit', month: 'long', year: 'numeric' });







  let body = `<h2>Planificaciones Diarias</h2>



  <p><strong>Módulo:</strong> ${escHTML(dg.moduloFormativo || '')}</p>



  <p><strong>Docente:</strong> ${escHTML(dg.nombreDocente || '')}</p>



  <p><strong>Bachillerato:</strong> ${escHTML(dg.nombreBachillerato || '')}</p>



  <p><strong>Fecha de generación:</strong> ${hoy}</p><hr/>`;







  actividades.forEach((act, idx) => {



    const s = estadoDiarias.sesiones[act.id] || {};



    const ti = s.tiempos?.ini ?? '—';



    const td = s.tiempos?.des ?? '—';



    const tc = s.tiempos?.cie ?? '—';



    const total = (s.tiempos?.ini || 0) + (s.tiempos?.des || 0) + (s.tiempos?.cie || 0);







    body += `<h3>Sesión ${idx + 1}: ${escHTML(act.enunciado || '')}</h3>



    <p><strong>Fecha:</strong> ${escHTML(act.fechaStr || '—')} &nbsp;|&nbsp; <strong>EC:</strong> ${escHTML(act.ecCodigo || '')} &nbsp;|&nbsp; <strong>Duración total:</strong> ${total} min</p>







    <h4>1er MOMENTO – INICIO (${ti} min)</h4>



    <p><strong>Apertura:</strong> ${escHTML(s.inicio?.apertura || '—')}</p>



    <p><strong>Encuadre:</strong> ${escHTML(s.inicio?.encuadre || '—')}</p>



    <p><strong>Organización:</strong> ${escHTML(s.inicio?.organizacion || '—')}</p>







    <h4>2do MOMENTO – DESARROLLO (${td} min)</h4>



    <p><strong>Procedimental / Actividad principal:</strong><br>${escHTML(s.desarrollo?.procedimental || '—').replace(/\n/g, '<br>')}</p>



    <p><strong>Conceptual / Actitudinal:</strong><br>${escHTML(s.desarrollo?.conceptual || '—').replace(/\n/g, '<br>')}</p>







    <h4>3er MOMENTO – CIERRE (${tc} min)</h4>



    <p><strong>Síntesis:</strong> ${escHTML(s.cierre?.sintesis || '—')}</p>



    <p><strong>Conexión:</strong> ${escHTML(s.cierre?.conexion || '—')}</p>



    <p><strong>Próximo paso:</strong> ${escHTML(s.cierre?.proximopaso || '—')}</p>







    <p><strong>ESTRATEGIAS:</strong><br>${escHTML(s.estrategias || '—').replace(/\n/g, '<br>')}</p>



    <p><strong>RECURSOS:</strong><br>${escHTML(s.recursos || '—').replace(/\n/g, '<br>')}</p>



    <hr/>`;



  });







  const html = `<html xmlns:o='urn:schemas-microsoft-com:office:office'



    xmlns:w='urn:schemas-microsoft-com:office:word'



    xmlns='http://www.w3.org/TR/REC-html40'>



  <head><meta charset="utf-8"/>



  <style>



    body{font-family:Calibri,Arial;font-size:11pt;margin:2cm;}



    h2{color:#0D47A1;} h3{color:#0D47A1;margin-top:18pt;border-bottom:1pt solid #ccc;padding-bottom:4pt;}



    h4{color:#1565C0;margin-top:12pt;margin-bottom:4pt;}



    p{margin:4pt 0;line-height:1.5;}



    hr{border:none;border-top:1pt solid #e0e0e0;margin:12pt 0;}



  </style></head>



  <body>${body}</body></html>`;







  const blob = new Blob(['\ufeff', html], { type: 'application/msword' });



  const url = URL.createObjectURL(blob);



  const a = document.createElement('a');



  a.href = url;



  a.download = `PlanificacionesDiarias_${(dg.moduloFormativo || 'modulo').replace(/\s+/g, '_')}.doc`;



  document.body.appendChild(a); a.click();



  document.body.removeChild(a); URL.revokeObjectURL(url);



  mostrarToast('Word descargado', 'success');



}







function imprimirDiarias() {



  guardarTodasDiarias();



  const stepper = document.querySelector('.stepper-container');



  const main = document.querySelector('.main-content');



  const prev = [stepper?.style.display, main?.style.display];



  stepper && (stepper.style.display = 'none');



  main && (main.style.display = 'none');



  // Expandir todas las sesiones antes de imprimir



  document.querySelectorAll('.pd-sesion-body').forEach(b => b.classList.add('open'));



  window.print();



  stepper && (stepper.style.display = prev[0] || '');



  main && (main.style.display = prev[1] || '');



}







// ----------------------------------------------------------------



// NAVEGACIÓN



// ----------------------------------------------------------------



function abrirDiarias() {
  _asegurarPlanificacion();
  cargarDiarias();
  _mostrarPanel('panel-diarias');
  const tieneActividades = (planificacion.actividades || []).length > 0;
  _actualizarSelectorPlanDiarias(tieneActividades);
  renderizarDiarias();
}
// __old_abrirDiarias__







function cerrarDiarias() {
  guardarTodasDiarias();
  _ocultarPaneles();
}
// __old_cerrarDiarias__







// ----------------------------------------------------------------



// INICIALIZACIÓN



// ----------------------------------------------------------------



document.addEventListener('DOMContentLoaded', () => {



  const headerInner = document.querySelector('.header-inner');



  if (!headerInner || document.getElementById('btn-diarias')) return;







  const btn = document.createElement('button');



  btn.id = 'btn-diarias';



  btn.className = 'btn-diarias';



  btn.title = 'Planificaciones Diarias';



  btn.innerHTML = '<span class="material-icons">today</span><span class="btn-nueva-label">Plan. Diarias</span>';



  btn.onclick = abrirDiarias;







  const btnPln = document.getElementById('btn-planificaciones');



  if (btnPln) headerInner.insertBefore(btn, btnPln);



  else {



    const btnCal = document.getElementById('btn-calificaciones');



    headerInner.insertBefore(btn, btnCal || null);



  }



});





// ================================================================
// --- MÓDULO: INTEGRACIÓN GEMINI AI ---
// ================================================================

const GROQ_KEY_STORAGE = 'planificadorRA_groqKey';

/** Retorna la API key de Groq guardada o null */
function getGroqKey() {
  return localStorage.getItem(GROQ_KEY_STORAGE) || null;
}

/** Alias para compatibilidad interna */
function getApiKey() { return null; }

/** Abre el modal de configuración de la IA */
function abrirConfigIA() {
  const groqKeyActual = getGroqKey();
  const estado = groqKeyActual
    ? '<span class="ia-status-chip ia-activa-chip"><span class="material-icons" style="font-size:14px;">check_circle</span> Clave configurada</span>'
    : '<span class="ia-status-chip ia-inactiva-chip"><span class="material-icons" style="font-size:14px;">warning</span> Sin clave configurada</span>';

  document.getElementById('modal-title').textContent = 'Configuración de IA (Groq)';
  document.getElementById('modal-body').innerHTML = `
    <div class="config-ia-content">
      <div>${estado}</div>
      <label for="input-groq-key">🟢 Clave API de Groq</label>
      <input type="password" id="input-groq-key"
             placeholder="gsk_..."
             value="${groqKeyActual || ''}"
             autocomplete="off" />
      <div class="info-tip" style="margin:0;">
        <span class="material-icons" style="color:#2E7D32;font-size:16px;">info</span>
        <div>
          <p style="margin:0;">Obtén tu clave gratuita en
            <a href="https://console.groq.com/keys" target="_blank" style="color:#2E7D32;font-weight:600;">console.groq.com</a>
            (sin tarjeta de crédito).</p>
          <p style="margin:4px 0 0;font-size:0.8rem;color:#757575;">
            La clave se guarda solo en tu navegador. No se envía a ningún servidor externo.
          </p>
        </div>
      </div>
      ${groqKeyActual ? '<button class="btn-secundario" style="align-self:flex-start;margin-top:8px;" onclick="borrarApiKey()"><span class="material-icons" style="font-size:16px;">delete</span> Eliminar clave</button>' : ''}
    </div>`;

  document.getElementById('modal-footer').innerHTML = `
    <button class="btn-siguiente" onclick="guardarApiKey()">
      <span class="material-icons">save</span> Guardar clave
    </button>
    <button class="btn-secundario" onclick="cerrarModalBtn()">Cancelar</button>`;

  document.getElementById('modal-overlay').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  setTimeout(() => document.getElementById('input-groq-key')?.focus(), 100);
}

function guardarApiKey() {
  const groqKey = document.getElementById('input-groq-key')?.value?.trim();
  if (!groqKey) { mostrarToast('Ingresa una clave válida', 'error'); return; }
  if (!groqKey.startsWith('gsk_')) { mostrarToast('La clave debe comenzar con "gsk_..."', 'error'); return; }
  localStorage.setItem(GROQ_KEY_STORAGE, groqKey);
  actualizarBtnConfigIA();
  cerrarModalBtn();
  mostrarToast('Clave guardada. La IA está lista para generar planificaciones.', 'success');
}

function borrarApiKey() {
  localStorage.removeItem(GROQ_KEY_STORAGE);
  actualizarBtnConfigIA();
  cerrarModalBtn();
  mostrarToast('Clave eliminada. Se usará generación local.', 'info');
}

function actualizarBtnConfigIA() {
  const btn = document.getElementById('btn-config-ia');
  if (!btn) return;
  if (getGroqKey()) {
    btn.classList.add('ia-activa');
    btn.title = 'IA configurada ✓ — clic para cambiar la clave';
  } else {
    btn.classList.remove('ia-activa');
    btn.title = 'Configurar clave de IA (Groq)';
  }
}

// ─────────────────────────────────────────────────────────────
// CONSTRUCTOR DEL PROMPT
// ─────────────────────────────────────────────────────────────

function construirPromptBase(dg, ra) {
  const diasClaseObj = dg.diasClase || {};
  const diasArr = Object.entries(diasClaseObj)
    .filter(([, v]) => v && v.activo)
    .map(([dia, v]) => `${dia} (${v.horas}h)`);
  const diasStr = diasArr.length > 0 ? diasArr.join(', ') : (dg.horasSemana + ' hrs/semana');

  return `Eres docente experto en educación técnico profesional de República Dominicana.
Responde SOLO con JSON válido, sin markdown, sin texto extra.

MÓDULO: ${dg.moduloFormativo || ''} | Familia: ${dg.familiaProfesional || ''} | Horario: ${diasStr}
RA: ${ra.descripcion || ''}
TEMAS DE REFERENCIA (NO copiar, usar como inspiración temática): ${ra.criterios || 'No especificados'}
RECURSOS: ${ra.recursosDid || 'Pizarrón, guías'}

REGLAS IMPORTANTES para los Elementos de Capacidad (EC):
- NUNCA copies textualmente frases de los criterios dados
- Usa los temas de referencia solo para entender el contexto del módulo
- Redacta enunciados ORIGINALES con estructura: VERBO + QUÉ aprende + CÓMO o PARA QUÉ
- El EC de conocimiento usa verbo de conocimiento (Identificar, Reconocer, Clasificar, Enumerar...)
- El EC de comprensión usa verbo de comprensión (Explicar, Describir, Comparar, Interpretar...)
- El EC de aplicación usa verbo de acción práctica (Aplicar, Implementar, Ejecutar, Demostrar...)
- El EC actitudinal usa verbo de valor/actitud (Valorar, Asumir, Demostrar compromiso con, Integrar...)
- NO uses "CE3.X" literalmente; usa el número de CE más relevante según el tema (CE1, CE2, CE3...)
- Los 4 EC deben cubrir ASPECTOS DISTINTOS del módulo, no repetir el mismo concepto con diferente verbo

Genera EXACTAMENTE este JSON:
{
  "nivelBloomRA": "comprension",
  "elementosCapacidad": [
    {"codigo":"E.C.1.1.1","nivel":"conocimiento","nivelBloom":"conocimiento","enunciado":"[Verbo conocimiento] [objeto específico y original del módulo] [condición concreta], en correspondencia con CE1."},
    {"codigo":"E.C.2.1.1","nivel":"comprension","nivelBloom":"comprension","enunciado":"[Verbo comprensión] [objeto específico y original diferente al EC1] [condición concreta], en correspondencia con CE2."},
    {"codigo":"E.C.3.1.1","nivel":"aplicacion","nivelBloom":"aplicacion","enunciado":"[Verbo aplicación] [objeto específico y original diferente a EC1 y EC2] [condición práctica], en correspondencia con CE3."},
    {"codigo":"E.C.4.1.1","nivel":"actitudinal","nivelBloom":"actitudinal","enunciado":"[Verbo actitudinal] [valor o actitud profesional específica diferente a los anteriores] [en qué contexto], en correspondencia con CE4."}
  ],
  "actividades": [
    {"ecCodigo":"E.C.1.1.1","enunciado":"Tipo: descripción específica al tema.","instrumento":"cotejo"},
    {"ecCodigo":"E.C.2.1.1","enunciado":"Tipo: descripción específica al tema.","instrumento":"cotejo"},
    {"ecCodigo":"E.C.3.1.1","enunciado":"Tipo: descripción específica al tema.","instrumento":"rubrica"},
    {"ecCodigo":"E.C.4.1.1","enunciado":"Tipo: descripción específica al tema.","instrumento":"rubrica"}
  ]
}`;
}

function construirPromptInstrumentos(dg, ra, actividades, elementosCapacidad) {
  const acts = actividades.map(a => {
    const ec = elementosCapacidad.find(e => e.codigo === a.ecCodigo) || {};
    return `- [${a.ecCodigo}] "${a.enunciado}" | tipo: ${a.instrumento} | nivel: ${ec.nivel || ''}`;
  }).join('\n');

  return `Eres docente experto en educación técnico profesional.
Responde SOLO con JSON válido, sin markdown.

MÓDULO: ${dg.moduloFormativo || ''} | RA: ${ra.descripcion || ''}

Para cada actividad genera instrumento personalizado Y sesión diaria específica al tema.
ACTIVIDADES:
${acts}

JSON requerido (un objeto por actividad en el mismo orden):
{
  "detalles": [
    {
      "ecCodigo": "E.C.1.1.1",
      "instrumentoDetalle": {
        "titulo": "Lista de Cotejo – [título específico]",
        "instrucciones": "Marque con ✓ según lo observado.",
        "criterios": ["Indicador 1 específico","Indicador 2 específico","Indicador 3 específico","Indicador 4 específico","Indicador 5 específico"]
      },
      "sesionDiaria": {
        "apertura": "Cómo inicia la clase específicamente.",
        "encuadre": "Propósito específico.",
        "procedimental": "1. Paso 1.\n2. Paso 2.\n3. Paso 3.",
        "conceptual": "Reflexión con la práctica profesional.",
        "sintesis": "Cómo cierra la clase.",
        "estrategias": "Metodologías con justificación."
      }
    }
  ]
}
Para rúbrica usa criterios con: {"criterio":"...","descriptores":["Excelente: ...","Bueno: ...","En proceso: ...","Insuficiente: ..."]}`;
}

// Alias para compatibilidad con generarConGemini si quedara algún uso
function construirPromptGemini(dg, ra, fechasClase) {
  return construirPromptBase(dg, ra);
}

// ─────────────────────────────────────────────────────────────
// LLAMADA A GEMINI API (con reintento automático por rate limit)
// ─────────────────────────────────────────────────────────────

/** Espera `ms` milisegundos mostrando un countdown en el toast */
function _esperarConCountdown(ms, mensajeBase) {
  return new Promise(resolve => {
    let restante = Math.ceil(ms / 1000);
    mostrarToast(`${mensajeBase} (${restante}s)`, 'info');
    const interval = setInterval(() => {
      restante--;
      if (restante <= 0) {
        clearInterval(interval);
        resolve();
      } else {
        mostrarToast(`${mensajeBase} (${restante}s)`, 'info');
      }
    }, 1000);
  });
}

/** Modelos a intentar en orden (si uno da rate-limit, prueba el siguiente) */
const MODELOS_GEMINI = [
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite'
];

/** Modelos de Groq a intentar en orden */
const MODELOS_GROQ = [
  'llama-3.3-70b-versatile',
  'meta-llama/llama-4-maverick-17b-128e-instruct',
  'qwen/qwen-3-32b',
  'llama-3.1-8b-instant'
];

/** Llama a la API de Groq con un modelo especifico */
async function _llamarModeloGroq(modelo, groqKey, prompt) {
  const endpoint = 'https://api.groq.com/openai/v1/chat/completions';
  const body = {
    model: modelo,
    messages: [
      { role: 'system', content: 'Eres un asistente experto en educación técnico profesional. Responde SOLO con JSON válido, sin markdown, sin texto adicional.' },
      { role: 'user', content: prompt }
    ],
    temperature: 0.40,
    max_tokens: 8192
  };

  const resp = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${groqKey}`
    },
    body: JSON.stringify(body)
  });

  if (resp.ok) {
    const data = await resp.json();
    const rawText = data?.choices?.[0]?.message?.content;
    if (!rawText) return { ok: false, esRateLimit: false, error: 'Respuesta vacía de Groq' };
    const cleaned = rawText.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
    try {
      return { ok: true, data: JSON.parse(cleaned) };
    } catch (e) {
      // Intentar extraer JSON aunque venga con texto extra
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try { return { ok: true, data: JSON.parse(jsonMatch[0]) }; } catch (_) { }
      }
      console.error('JSON inválido de Groq:', cleaned.substring(0, 300));
      return { ok: false, esRateLimit: false, error: 'JSON inválido en respuesta de Groq. Intenta de nuevo.' };
    }
  }

  const errJson = await resp.json().catch(() => ({}));
  const msg = errJson?.error?.message || errJson?.error?.code || resp.statusText;
  const esRateLimit = resp.status === 429;
  console.error('Groq error detalle:', resp.status, JSON.stringify(errJson));
  return { ok: false, esRateLimit, error: `Groq (${modelo}) error ${resp.status}: ${msg}` };
}

/** Llama a Groq con fallback entre modelos. Devuelve datos parseados o lanza error. */
async function _llamarGroqConFallback(prompt, mensajeToast) {
  const groqKey = getGroqKey();
  let ultimoError = '';
  for (let m = 0; m < MODELOS_GROQ.length; m++) {
    const modelo = MODELOS_GROQ[m];
    mostrarToast(`🟢 ${mensajeToast} (${modelo})…`, 'info');
    for (let intento = 0; intento < 2; intento++) {
      const resultado = await _llamarModeloGroq(modelo, groqKey, prompt);
      if (resultado.ok) return resultado.data;
      if (!resultado.esRateLimit) { ultimoError = resultado.error; break; }
      ultimoError = resultado.error;
      if (intento === 0 && m < MODELOS_GROQ.length - 1) {
        mostrarToast(`⏳ ${modelo} sin cuota, probando siguiente...`, 'info');
        break;
      } else if (intento === 0) {
        await _esperarConCountdown(20000, '⏳ Reintentando en');
      }
    }
  }
  throw new Error(ultimoError || 'Groq: todos los modelos fallaron');
}

/** Genera detalle (instrumento + sesión) para UNA sola actividad */
function construirPromptDetalleUno(dg, ra, act, ec) {
  const tipo = act.instrumento === 'rubrica' ? 'rubrica' : 'cotejo';
  const horasSesion = ec && ec.horasAsignadas ? Math.round((ec.horasAsignadas / 2) * 10) / 10 : 1.5;
  const minTotal = Math.round(horasSesion * 60);
  const minInicio = Math.round(minTotal * 0.20);
  const minDesarrollo = Math.round(minTotal * 0.60);
  const minCierre = minTotal - minInicio - minDesarrollo;

  const instPrompt = tipo === 'cotejo'
    ? `"instrumentoDetalle": {
    "titulo": "Lista de Cotejo – [título específico al tema]",
    "instrucciones": "Marque con ✓ según lo observado durante la actividad.",
    "criterios": [
      "Indicador 1 muy específico al tema y la actividad",
      "Indicador 2 muy específico al tema y la actividad",
      "Indicador 3 muy específico al tema y la actividad",
      "Indicador 4 muy específico al tema y la actividad",
      "Indicador 5 muy específico al tema y la actividad"
    ]
  }`
    : `"instrumentoDetalle": {
    "titulo": "Rúbrica – [título específico al tema]",
    "instrucciones": "Seleccione el nivel de desempeño alcanzado en cada criterio.",
    "criterios": [
      {"criterio":"Criterio 1 específico","descriptores":["Excelente: descripción detallada y específica al tema","Bueno: descripción detallada","En proceso: descripción detallada","Insuficiente: descripción detallada"]},
      {"criterio":"Criterio 2 específico","descriptores":["Excelente: ...","Bueno: ...","En proceso: ...","Insuficiente: ..."]},
      {"criterio":"Criterio 3 específico","descriptores":["Excelente: ...","Bueno: ...","En proceso: ...","Insuficiente: ..."]},
      {"criterio":"Criterio 4 específico","descriptores":["Excelente: ...","Bueno: ...","En proceso: ...","Insuficiente: ..."]}
    ]
  }`;

  return `Eres docente experto en educación técnico-profesional. Responde SOLO con JSON válido, sin markdown.

MÓDULO: ${dg.moduloFormativo || ''}
FAMILIA PROFESIONAL: ${dg.familiaProfesional || ''}
RA: ${ra.descripcion || ''}
ACTIVIDAD: ${act.enunciado}
EC: ${ec?.enunciado || ''} | Nivel Bloom: ${ec?.nivel || ''}
RECURSOS DISPONIBLES: ${ra.recursosDid || 'pizarrón, guías de trabajo, computadoras'}
DURACIÓN TOTAL: ${minTotal} minutos (Inicio: ${minInicio} min | Desarrollo: ${minDesarrollo} min | Cierre: ${minCierre} min)

INSTRUCCIÓN PRINCIPAL:
Genera una planificación de sesión diaria MUY DETALLADA Y EXTENSA, como si fuera una guía didáctica completa.
Cada momento debe tener subtemas, pasos numerados, preguntas concretas, dinámicas específicas y tiempos parciales.

REFERENCIA DE NIVEL DE DETALLE (adapta al tema del módulo, NO copies esto):
- INICIO debe incluir: bienvenida con pregunta detonante específica al tema, activación de conocimientos previos con preguntas concretas, presentación del objetivo y metodología
- DESARROLLO debe incluir: bloques temáticos numerados con tiempos, actividades paso a paso, preguntas de verificación de comprensión, ejemplos concretos del campo profesional, dinámicas (individual, parejas, equipos)
- CIERRE debe incluir: síntesis con pregunta reflexiva específica, evaluación formativa rápida (quiz verbal o escrito con preguntas concretas), tarea para casa si aplica, anuncio del próximo tema

IMPORTANTE:
- Usa vocabulario específico del módulo "${dg.moduloFormativo || ''}" y la familia profesional "${dg.familiaProfesional || ''}"
- Las preguntas deben ser CONCRETAS al tema, no genéricas
- Los pasos del desarrollo deben ser ESPECÍFICOS con tiempos parciales (Ej: "Bloque 1 (15 min): ...")
- Incluye al menos 3 preguntas detonantes específicas al tema
- El campo "procedimental" debe tener mínimo 5 pasos detallados con subtemas
- El campo "apertura" debe tener mínimo 3 secciones: bienvenida/contexto, activación de saberes previos, presentación del objetivo

Genera exactamente este JSON:
{
  ${instPrompt},
  "sesionDiaria": {
    "apertura": "INICIO (${minInicio} minutos)\\n\\n1. Bienvenida y contextualización (X min)\\n   • [Descripción específica del saludo y conexión con el tema]\\n   • Pregunta motivadora: \\"[pregunta concreta al tema]\\"\\n\\n2. Activación de conocimientos previos (X min)\\n   • Pregunta detonante: \\"[pregunta específica al campo profesional]\\"\\n   • [Dinámica específica: lluvia de ideas, preguntas orales, etc.]\\n   • [Segunda pregunta de exploración]\\n\\n3. Presentación del objetivo y metodología (X min)\\n   • Objetivo de la sesión: [objetivo específico]\\n   • Dinámica de trabajo: [individual/parejas/equipos con justificación]\\n   • Criterios de evaluación: [mencionar el instrumento que se usará]",

    "encuadre": "Propósito específico y detallado de la sesión en relación con el EC y el RA. Explica QUÉ van a aprender, POR QUÉ es importante para su perfil profesional y CÓMO se conecta con competencias previas o futuras. Mínimo 3-4 oraciones concretas al tema.",

    "organizacion": "Describe la organización pedagógica completa: cómo se forman los grupos o si es individual, roles de cada integrante si aplica, materiales que necesita cada quien, normas de participación específicas para esta actividad, y criterios de evaluación compartidos con los estudiantes.",

    "procedimental": "DESARROLLO (${minDesarrollo} minutos)\\n\\nBloque 1: [Nombre del primer bloque temático] (X min)\\n• [Descripción detallada del contenido teórico con ejemplos]\\n• Demostración práctica: [qué hace el docente paso a paso]\\n• Pregunta de verificación: \\"[pregunta concreta]\\"\\n\\nBloque 2: [Nombre del segundo bloque] (X min)\\n• Actividad de investigación/práctica: [descripción detallada]\\n• Paso 1: [acción específica que hacen los estudiantes]\\n• Paso 2: [siguiente acción]\\n• Paso 3: [siguiente acción]\\n• Paso 4: [siguiente acción]\\n• Puesta en común: [cómo comparten resultados]\\n\\nBloque 3: [Nombre del tercer bloque si aplica] (X min)\\n• [Actividad integradora o de profundización]\\n• [Análisis comparativo o reflexión guiada]",

    "conceptual": "Reflexión conceptual profunda: explica la conexión del tema con el entorno laboral real del ${dg.familiaProfesional || 'campo profesional'}. Incluye: (1) un ejemplo de caso real de la profesión, (2) cómo este conocimiento se aplica en el día a día laboral, (3) pregunta reflexiva metacognitiva: [pregunta concreta]. Mínimo 4-5 oraciones.",

    "sintesis": "CIERRE (${minCierre} minutos)\\n\\n1. Síntesis y consolidación (X min)\\n   • Recapitulación: [conceptos clave aprendidos listados]\\n   • Pregunta reflexiva final: \\"[pregunta específica al tema]\\"\\n   • [Actividad de cierre: mural de compromisos, tarjeta de salida, etc.]\\n\\n2. Evaluación formativa rápida (X min)\\n   • Preguntas orales o escritas:\\n     - [Pregunta 1 específica al tema]\\n     - [Pregunta 2 específica al tema]\\n     - [Pregunta 3 específica al tema]\\n   • Modalidad: [verbal/escrita/Kahoot/Mentimeter]\\n\\n3. Tarea y próximos pasos (X min)\\n   • Asignación: [tarea específica relacionada al tema si aplica]\\n   • Próxima clase: [tema siguiente]\\n   • Feedback: \\"¿Qué les pareció más interesante de hoy?\\"",

    "estrategias": "• [Estrategia 1 con nombre]: [descripción de cómo se aplica en esta sesión y justificación pedagógica de por qué es adecuada para este nivel Bloom: ${ec?.nivel || 'aplicacion'}]\\n• [Estrategia 2 con nombre]: [descripción y justificación]\\n• [Estrategia 3 con nombre]: [descripción y justificación]\\n• [Estrategia 4 con nombre si aplica]: [descripción y justificación]"
  }
}`;
}



/** Genera planificación completa con Groq: 1 llamada para EC/actividades + 1 por cada actividad */
async function generarConGroq(dg, ra, fechasClase) {
  const groqKey = getGroqKey();
  if (!groqKey) return null;

  // --- LLAMADA 1: EC y Actividades ---
  const promptBase = construirPromptBase(dg, ra);
  const datosBase = await _llamarGroqConFallback(promptBase, 'Generando estructura');

  if (!datosBase || !datosBase.elementosCapacidad || !datosBase.actividades) {
    throw new Error('Groq no devolvió la estructura esperada de EC y actividades');
  }

  // --- LLAMADAS 2..N: Una por actividad (instrumento + sesión) ---
  for (let i = 0; i < datosBase.actividades.length; i++) {
    const act = datosBase.actividades[i];
    const ec = datosBase.elementosCapacidad.find(e => e.codigo === act.ecCodigo);
    mostrarToast(`🟢 Generando instrumento ${i + 1}/${datosBase.actividades.length}…`, 'info');
    try {
      const promptDet = construirPromptDetalleUno(dg, ra, act, ec);
      const det = await _llamarGroqConFallback(promptDet, `Instrumento ${i + 1}`);
      if (det) {
        act.instrumentoDetalle = det.instrumentoDetalle || null;
        act.sesionDiaria = det.sesionDiaria || null;
      }
    } catch (e) {
      console.warn(`Instrumento ${i + 1} no generado con IA, usará generación local:`, e.message);
    }
  }

  return datosBase;
}

/** Intenta llamar a UN modelo específico. Devuelve {ok, data, esRateLimit, error} */
async function _llamarModelo(modelo, apiKey, prompt) {
  const endpoint =
    `https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent?key=${apiKey}`;

  const body = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.35,
      maxOutputTokens: 2048
    }
  };

  const resp = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (resp.ok) {
    const data = await resp.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) return { ok: false, esRateLimit: false, error: 'Respuesta vacía de Gemini' };

    const cleaned = rawText.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
    try {
      return { ok: true, data: JSON.parse(cleaned) };
    } catch (e) {
      return { ok: false, esRateLimit: false, error: 'JSON inválido en respuesta de Gemini' };
    }
  }

  const errJson = await resp.json().catch(() => ({}));
  const msg = errJson?.error?.message || resp.statusText;
  const esRateLimit = resp.status === 429 || msg.includes('QUOTA') || msg.includes('RESOURCE_EXHAUSTED');
  return { ok: false, esRateLimit, error: `Gemini (${modelo}) error ${resp.status}: ${msg}` };
}

async function generarConGemini(dg, ra, fechasClase) {
  const apiKey = getApiKey();
  if (!apiKey) return null;

  const prompt = construirPromptGemini(dg, ra, fechasClase);
  let ultimoError = '';

  // Probar cada modelo; si uno da rate-limit, pasar al siguiente
  for (let m = 0; m < MODELOS_GEMINI.length; m++) {
    const modelo = MODELOS_GEMINI[m];
    mostrarToast(`🤖 Consultando ${modelo}…`, 'info');

    // Hasta 2 reintentos por modelo (espera 15s entre cada uno)
    for (let intento = 0; intento < 2; intento++) {
      const resultado = await _llamarModelo(modelo, apiKey, prompt);

      if (resultado.ok) {
        if (m > 0) mostrarToast(`✅ Generado con modelo alternativo (${modelo})`, 'success');
        return resultado.data;
      }

      if (!resultado.esRateLimit) {
        // Error que no es rate-limit → no reintentar este modelo
        ultimoError = resultado.error;
        break;
      }

      // Rate limit en este modelo
      ultimoError = resultado.error;

      if (intento === 0 && m < MODELOS_GEMINI.length - 1) {
        // Primer intento fallido → pasar al siguiente modelo sin esperar mucho
        mostrarToast(`⏳ ${modelo} bloqueado por cuota. Probando modelo alternativo...`, 'info');
        break;
      } else if (intento === 0) {
        // Último modelo, primer intento → esperar 20s y reintentar
        await _esperarConCountdown(20000, '⏳ Último modelo — reintentando en');
      }
    }
  }

  // Todos los modelos de Gemini fallaron
  throw new Error(ultimoError || 'Todos los modelos de Gemini están bloqueados por cuota');
}

// ─────────────────────────────────────────────────────────────
// APLICAR RESPUESTA DE GEMINI AL ESTADO DE LA APP
// ─────────────────────────────────────────────────────────────

function aplicarRespuestaGemini(aiData, fechasClase) {
  const dg = planificacion.datosGenerales;

  // 1. Nivel del RA
  if (aiData.nivelBloomRA) {
    planificacion.ra.nivelBloom = aiData.nivelBloomRA;
    const el = document.getElementById('nivel-bloom-detectado');
    if (el) el.textContent = aiData.nivelBloomRA.charAt(0).toUpperCase() + aiData.nivelBloomRA.slice(1);
  }

  // 2. Elementos de Capacidad
  const totalHoras = planificacion.horasTotal || (parseFloat(dg.horasSemana || 2) * 2);
  const horasPorEC = Math.floor(totalHoras / 4);
  const horasResto = totalHoras - (horasPorEC * 4);

  planificacion.elementosCapacidad = aiData.elementosCapacidad.map((ec, i) => ({
    id: ec.codigo,
    codigo: ec.codigo,
    nivel: ec.nivel,
    nivelBloom: ec.nivelBloom || ec.nivel,
    enunciado: ec.enunciado,
    horasAsignadas: horasPorEC + (i === 0 ? horasResto : 0),
    descripcion: ec.enunciado,
    secuencia: plantillasSecuencia[ec.nivel] || plantillasSecuencia.aplicacion
  }));

  // 3. Actividades — combinar las generadas por IA con fechas reales
  const actividadesAI = aiData.actividades || [];
  const fechasValidas = (fechasClase && fechasClase.length > 0) ? fechasClase : null;
  let fechaIdx = 0;

  planificacion.actividades = actividadesAI.map((act, i) => {
    const ecObj = planificacion.elementosCapacidad.find(e => e.codigo === act.ecCodigo)
      || planificacion.elementosCapacidad[0];

    // Proteger contra fechasClase vacio o undefined
    const fechaObj = fechasValidas
      ? (fechasValidas[fechaIdx] || fechasValidas[fechasValidas.length - 1])
      : null;
    fechaIdx++;

    // Usar instrumento personalizado de la IA si viene, si no generar local
    let instrumento;
    const det = act.instrumentoDetalle;
    if (det && det.criterios && det.criterios.length > 0) {
      if (act.instrumento === 'rubrica') {
        const niveles = [
          { nombre: 'Excelente', puntos: 4, clase: 'nivel-excelente' },
          { nombre: 'Bueno', puntos: 3, clase: 'nivel-bueno' },
          { nombre: 'En proceso', puntos: 2, clase: 'nivel-proceso' },
          { nombre: 'Insuficiente', puntos: 1, clase: 'nivel-insuficiente' }
        ];
        instrumento = {
          tipo: 'rubrica',
          tipoLabel: 'Rúbrica de Evaluación',
          titulo: det.titulo || `Rúbrica – ${act.enunciado.split(':')[0]}`,
          actividad: act.enunciado,
          ecCodigo: act.ecCodigo,
          niveles,
          criterios: det.criterios.map((c, ci) => ({
            numero: ci + 1,
            criterio: typeof c === 'string' ? c : c.criterio,
            descriptores: typeof c === 'string'
              ? niveles.map(n => `${c} – ${n.nombre}.`)
              : (c.descriptores || niveles.map(n => `${c.criterio} – ${n.nombre}.`))
          })),
          puntajeMax: det.criterios.length * 4,
          instrucciones: det.instrucciones || 'Seleccione el nivel de desempeño alcanzado en cada criterio.'
        };
      } else {
        instrumento = {
          tipo: 'cotejo',
          tipoLabel: 'Lista de Cotejo',
          titulo: det.titulo || `Lista de Cotejo – ${act.enunciado.split(':')[0]}`,
          actividad: act.enunciado,
          ecCodigo: act.ecCodigo,
          criterios: det.criterios.map((c, ci) => ({
            numero: ci + 1,
            indicador: typeof c === 'string' ? c : c.criterio,
            logrado: false,
            noLogrado: false,
            observacion: ''
          })),
          escala: ['Logrado', 'No Logrado'],
          puntaje: 100,
          instrucciones: det.instrucciones || 'Marque con ✓ según el desempeño observado.'
        };
      }
    } else {
      instrumento = act.instrumento === 'rubrica'
        ? generarRubrica(ecObj, act.enunciado)
        : generarListaCotejo(ecObj, act.enunciado);
    }

    return {
      id: `act_${i}`,
      ecCodigo: act.ecCodigo || ecObj.codigo,
      enunciado: act.enunciado,
      fecha: fechaObj ? fechaObj.fecha : null,
      fechaStr: fechaObj ? fechaObj.fechaStr : 'Sin fecha asignada',
      instrumento,
      sesionIA: act.sesionDiaria || null
    };
  });

  // 4. Actualizar resumen de horas en pantalla
  const resEl = document.getElementById('resumen-distribucion');
  if (resEl) {
    resEl.classList.remove('hidden');
    const displayHoras = document.getElementById('total-horas-display');
    const displaySemanas = document.getElementById('total-semanas-display');
    const displayXEC = document.getElementById('horas-por-ec-display');
    if (displayHoras) displayHoras.textContent = totalHoras + ' hrs';
    if (displaySemanas) displaySemanas.textContent = Math.ceil(totalHoras / parseFloat(dg.horasSemana || 2)) + ' sem';
    if (displayXEC) displayXEC.textContent = horasPorEC + ' hrs';
  }
}

// ─────────────────────────────────────────────────────────────
// SOBRESCRIBIR generarPlanificacion PARA USAR IA
// ─────────────────────────────────────────────────────────────

// Guardar referencia al generador local original
const _generarPlanificacionLocal = generarPlanificacion;

// Nueva versión con IA
generarPlanificacion = async function () {
  const dg = planificacion.datosGenerales || {};
  const ra = planificacion.ra || {};

  // Leer datos del formulario
  guardarDatosFormulario();

  // Validación básica
  // Leer el RA desde el estado (guardado por guardarDatosFormulario arriba)
  // o directamente desde el campo con su ID real
  const raDesc = planificacion.ra?.descripcion?.trim() ||
    document.getElementById('descripcion-ra')?.value?.trim() || '';
  if (!raDesc) {
    mostrarToast('Escribe el Resultado de Aprendizaje antes de generar', 'error');
    return;
  }

  // Calcular fechas de clase (necesario para asignar fechas a actividades)
  // ORDEN CORRECTO: (diasClase, fechaInicio, fechaTermino)
  const fechasClase = calcularFechasClase(
    planificacion.datosGenerales.diasClase,
    planificacion.datosGenerales.fechaInicio,
    planificacion.datosGenerales.fechaTermino
  );
  planificacion.fechasClase = fechasClase;

  const groqKey = getGroqKey();

  if (!groqKey) {
    // Sin IA: usar generación local y avisar
    mostrarToast('💡 Sin clave Groq: usando generación local. Configura la IA con el botón ⚙️ para mejores resultados.', 'info');
    _generarPlanificacionLocal();
    return;
  }

  // CON IA: mostrar spinner
  const btnGenerar = document.getElementById('btn-generar');
  const btnTexto = document.getElementById('btn-generar-texto');
  const iconoGenerar = btnGenerar?.querySelector('.material-icons');

  if (btnGenerar) btnGenerar.classList.add('btn-generando');
  if (btnTexto) btnTexto.textContent = 'Generando con IA...';
  if (iconoGenerar) iconoGenerar.textContent = 'hourglass_top';

  try {
    mostrarToast('Consultando IA... esto tarda unos segundos ⏳', 'info');

    // Generar con Groq
    const aiData = await generarConGroq(
      planificacion.datosGenerales,
      planificacion.ra,
      fechasClase
    );

    if (!aiData || !aiData.elementosCapacidad) {
      throw new Error('Respuesta inesperada de la IA');
    }

    // Aplicar resultados
    aplicarRespuestaGemini(aiData, fechasClase);

    // Renderizar
    renderizarEC(planificacion.elementosCapacidad);
    renderizarActividades(planificacion.actividades);

    // Auto-aplicar sesiones de IA al estado de planificaciones diarias
    (planificacion.actividades || []).forEach(act => {
      if (act.sesionIA && !estadoDiarias.sesiones[act.id]) {
        const ec = (planificacion.elementosCapacidad || []).find(e => e.codigo === act.ecCodigo);
        const horasAct = ec ? (ec.horasAsignadas / Math.max(1, (planificacion.actividades || []).filter(a => a.ecCodigo === ec.codigo).length)) : 1.5;
        const minSesion = Math.round(horasAct * 60);
        const tIni = Math.round(minSesion * 0.20);
        const tDes = Math.round(minSesion * 0.60);
        const s = act.sesionIA;
        estadoDiarias.sesiones[act.id] = {
          inicio: { apertura: s.apertura || '', encuadre: s.encuadre || '', organizacion: s.organizacion || 'Trabajo individual y grupal.' },
          desarrollo: { procedimental: s.procedimental || '', conceptual: s.conceptual || '' },
          cierre: { sintesis: s.sintesis || '', conexion: s.conceptual || '', proximopaso: s.proximopaso || '' },
          estrategias: s.estrategias || '',
          recursos: planificacion.ra?.recursosDid || '',
          tiempos: { ini: tIni, des: tDes, cie: minSesion - tIni - tDes }
        };
      }
    });
    persistirDiarias();

    // Habilitar siguiente
    document.getElementById('btn-paso2-siguiente').disabled = false;

    guardarBorrador();
    mostrarToast('¡Planificación generada con IA! Revisa y ajusta a tu criterio.', 'success');

    // Avanzar al paso 3
    setTimeout(() => irAlPaso(3, true), 600);

  } catch (err) {
    console.error('Error Groq:', err);
    const msg = err.message || String(err);

    if (msg.includes('401') || msg.includes('invalid_api_key') || msg.includes('API_KEY_INVALID')) {
      mostrarToast('❌ Clave de Groq inválida. Ve a ⚙️ Config. IA y verifica que empiece con "gsk_".', 'error');
    } else if (msg.includes('429') || msg.includes('Groq: todos') || msg.includes('rate_limit')) {
      mostrarToast('⏳ Cuota de Groq agotada. Intenta en unos minutos o crea otra clave en console.groq.com.', 'error');
    } else if (msg.includes('400') || msg.includes('bad_request')) {
      mostrarToast('⚠️ Error en la solicitud a Groq. Verifica tu clave en ⚙️ Config. IA.', 'error');
    } else {
      console.error('Error IA completo:', msg);
      mostrarToast('Error IA: ' + msg.substring(0, 120), 'error');
    }
    // Siempre usar generacion local como fallback
    _generarPlanificacionLocal();
  } finally {
    // Restaurar botón
    if (btnGenerar) btnGenerar.classList.remove('btn-generando');
    if (btnTexto) btnTexto.textContent = 'Generar planificación';
    if (iconoGenerar) iconoGenerar.textContent = 'auto_awesome';
  }
};

// ─────────────────────────────────────────────────────────────
// INICIALIZAR ESTADO DEL BOTÓN AL CARGAR
// ─────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  actualizarBtnConfigIA();
  // Asegurar que modal-footer tiene id
  const mf = document.querySelector('.modal-footer');
  if (mf && !mf.id) mf.id = 'modal-footer';
});

// ================================================================
// WIZARD: IMPORTAR PLANIFICACIÓN DESDE WORD
// ================================================================

var impState = {
  paso: 1,
  totalPasos: 4,
  datos: {
    dg: {}, ra: {},
    ecs: [],      // [{codigo, enunciado, nivel, horasAsignadas}]
    actividades: [] // [{ecCodigo, enunciado, fecha, instrumento}]
  }
};

function abrirImportarPlanificacion() {
  impState.paso = 1;
  impState.datos = { dg: {}, ra: {}, ecs: [], actividades: [] };
  document.getElementById('imp-overlay').classList.remove('hidden');
  imp_renderizarPaso();
}

function imp_cerrar() {
  document.getElementById('imp-overlay').classList.add('hidden');
}

function imp_cerrarSiClick(e) {
  if (e.target === document.getElementById('imp-overlay')) imp_cerrar();
}

function imp_renderizarTabs() {
  const bar = document.getElementById('imp-steps-bar');
  const labels = ['1. Datos Generales', '2. RA y Criterios', '3. EC y Actividades', '4. Confirmar'];
  bar.innerHTML = '';
  labels.forEach((lbl, i) => {
    const n = i + 1;
    const div = document.createElement('div');
    div.className = 'imp-step-tab' +
      (n === impState.paso ? ' activo' : '') +
      (n < impState.paso ? ' completado' : '');
    div.textContent = (n < impState.paso ? '✓ ' : '') + lbl;
    bar.appendChild(div);
  });

  const btnPrev = document.getElementById('imp-btn-prev');
  const btnNext = document.getElementById('imp-btn-next');
  btnPrev.style.display = impState.paso > 1 ? 'inline-flex' : 'none';
  if (impState.paso === impState.totalPasos) {
    btnNext.innerHTML = '<span class="material-icons">save</span> Guardar planificación';
  } else {
    btnNext.innerHTML = 'Siguiente <span class="material-icons">arrow_forward</span>';
  }
}

function imp_renderizarPaso() {
  imp_renderizarTabs();
  const body = document.getElementById('imp-body');
  if (impState.paso === 1) body.innerHTML = imp_htmlPaso1();
  else if (impState.paso === 2) body.innerHTML = imp_htmlPaso2();
  else if (impState.paso === 3) body.innerHTML = imp_htmlPaso3();
  else body.innerHTML = imp_htmlPaso4();
  // Restaurar valores guardados
  if (impState.paso === 1) imp_poblarPaso1();
  else if (impState.paso === 2) imp_poblarPaso2();
  else if (impState.paso === 3) imp_poblarPaso3();
}

// ─── PASO 1: DATOS GENERALES ───────────────────────────────────
function imp_htmlPaso1() {
  return `
  <div class="imp-section">
    <div class="imp-section-title"><span class="material-icons">school</span>Institución y Módulo</div>
    <div class="imp-grid-2">
      <div class="imp-field"><label>Familia Profesional</label><input id="imp-familiaProfesional" placeholder="Ej: Informática y Comunicaciones"></div>
      <div class="imp-field"><label>Código FP</label><input id="imp-codigoFP" placeholder="Ej: IFC"></div>
      <div class="imp-field"><label>Nombre del Bachillerato</label><input id="imp-nombreBachillerato" placeholder="Ej: Técnico en Desarrollo de Aplicaciones Web"></div>
      <div class="imp-field"><label>Código Título</label><input id="imp-codigoTitulo" placeholder="Ej: T-IFC-001"></div>
      <div class="imp-field full"><label>Módulo Formativo</label><input id="imp-moduloFormativo" placeholder="Ej: Programación Web en Entorno Cliente"></div>
      <div class="imp-field"><label>Código del Módulo</label><input id="imp-codigoModulo" placeholder="Ej: MF0491_3"></div>
      <div class="imp-field"><label>Nombre del Docente</label><input id="imp-nombreDocente" placeholder="Ej: Lic. Ana Torres"></div>
    </div>
  </div>

  <div class="imp-section">
    <div class="imp-section-title"><span class="material-icons">calendar_today</span>Horario y Fechas</div>
    <div class="imp-grid-2">
      <div class="imp-field"><label>Cantidad de RA en el módulo</label><input id="imp-cantidadRA" type="number" min="1" max="20" placeholder="Ej: 3"></div>
      <div class="imp-field"><label>Valor de este RA (puntos)</label><input id="imp-valorRA" type="number" min="1" max="100" step="0.5" placeholder="Ej: 10"></div>
      <div class="imp-field"><label>Horas semanales totales</label><input id="imp-horasSemana" type="number" min="1" max="40" placeholder="Ej: 6"></div>
      <div class="imp-field"></div>
      <div class="imp-field"><label>Fecha de inicio</label><input id="imp-fechaInicio" type="date"></div>
      <div class="imp-field"><label>Fecha de término</label><input id="imp-fechaTermino" type="date"></div>
    </div>
    <div style="margin-top:12px;">
      <label style="font-size:0.78rem;font-weight:700;color:#424242;display:block;margin-bottom:8px;">Días de clase y horas por día:</label>
      <div class="imp-dias-grid">
        ${['lunes', 'martes', 'miercoles', 'jueves', 'viernes'].map(d => `
          <div class="imp-dia-item">
            <label><input type="checkbox" id="imp-dia-${d}" style="margin-right:4px;">${d.charAt(0).toUpperCase() + d.slice(1)}</label>
            <input type="number" id="imp-hrs-${d}" min="1" max="8" value="2" title="Horas ese día">
            <span style="font-size:0.7rem;color:#9E9E9E;">hrs</span>
          </div>`).join('')}
      </div>
    </div>
  </div>`;
}

function imp_poblarPaso1() {
  const dg = impState.datos.dg;
  const set = (id, val) => { const el = document.getElementById(id); if (el && val !== undefined) el.value = val; };
  set('imp-familiaProfesional', dg.familiaProfesional);
  set('imp-codigoFP', dg.codigoFP);
  set('imp-nombreBachillerato', dg.nombreBachillerato);
  set('imp-codigoTitulo', dg.codigoTitulo);
  set('imp-moduloFormativo', dg.moduloFormativo);
  set('imp-codigoModulo', dg.codigoModulo);
  set('imp-nombreDocente', dg.nombreDocente);
  set('imp-cantidadRA', dg.cantidadRA);
  set('imp-valorRA', dg.valorRA);
  set('imp-horasSemana', dg.horasSemana);
  set('imp-fechaInicio', dg.fechaInicio);
  set('imp-fechaTermino', dg.fechaTermino);
  if (dg.diasClase) {
    ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'].forEach(d => {
      const cfg = dg.diasClase[d];
      if (!cfg) return;
      const cb = document.getElementById('imp-dia-' + d);
      const hr = document.getElementById('imp-hrs-' + d);
      if (cb) cb.checked = cfg.activo;
      if (hr) hr.value = cfg.horas || 2;
    });
  }
}

function imp_leerPaso1() {
  const get = id => { const el = document.getElementById(id); return el ? el.value.trim() : ''; };
  const diasClase = {};
  ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'].forEach(d => {
    const cb = document.getElementById('imp-dia-' + d);
    const hr = document.getElementById('imp-hrs-' + d);
    diasClase[d] = { activo: cb ? cb.checked : false, horas: parseInt(hr?.value || '2', 10) };
  });
  impState.datos.dg = {
    familiaProfesional: get('imp-familiaProfesional'),
    codigoFP: get('imp-codigoFP'),
    nombreBachillerato: get('imp-nombreBachillerato'),
    codigoTitulo: get('imp-codigoTitulo'),
    moduloFormativo: get('imp-moduloFormativo'),
    codigoModulo: get('imp-codigoModulo'),
    nombreDocente: get('imp-nombreDocente'),
    cantidadRA: get('imp-cantidadRA'),
    valorRA: get('imp-valorRA'),
    horasSemana: get('imp-horasSemana'),
    fechaInicio: get('imp-fechaInicio'),
    fechaTermino: get('imp-fechaTermino'),
    diasClase
  };
}

function imp_validarPaso1() {
  const dg = impState.datos.dg;
  if (!dg.moduloFormativo) { mostrarToast('El Módulo Formativo es obligatorio', 'error'); return false; }
  if (!dg.nombreDocente) { mostrarToast('El Nombre del Docente es obligatorio', 'error'); return false; }
  if (!dg.fechaInicio) { mostrarToast('La Fecha de inicio es obligatoria', 'error'); return false; }
  const diasActivos = Object.values(dg.diasClase || {}).filter(d => d.activo);
  if (diasActivos.length === 0) { mostrarToast('Selecciona al menos un día de clase', 'error'); return false; }
  return true;
}

// ─── PASO 2: RA Y CRITERIOS ────────────────────────────────────
function imp_htmlPaso2() {
  return `
  <div class="imp-section">
    <div class="imp-section-title"><span class="material-icons">psychology</span>Resultado de Aprendizaje (RA)</div>
    <div style="display:flex;flex-direction:column;gap:12px;">
      <div class="imp-field">
        <label>Descripción completa del RA</label>
        <textarea id="imp-ra-descripcion" rows="4" placeholder="Ej: Elabora aplicaciones web en el entorno cliente aplicando lenguajes de marcas y estándares web con criterios de usabilidad y accesibilidad…"></textarea>
      </div>
      <div class="imp-field">
        <label>Criterios de evaluación / temas de referencia (uno por línea)</label>
        <textarea id="imp-ra-criterios" rows="5" placeholder="CE1. Identifica las herramientas de diseño web y su función
CE2. Describe la estructura básica de HTML y sus etiquetas principales
CE3. Aplica estilos CSS para dar formato visual a páginas web
CE4. Desarrolla páginas web accesibles siguiendo estándares W3C"></textarea>
      </div>
      <div class="imp-field">
        <label>Recursos didácticos disponibles</label>
        <input id="imp-ra-recursos" placeholder="Ej: Computadoras con internet, proyector, guías de trabajo, VS Code">
      </div>
      <div class="imp-field">
        <label>Nivel de Bloom predominante del RA</label>
        <select id="imp-ra-nivel">
          <option value="conocimiento">Conocimiento – Identificar, Reconocer</option>
          <option value="comprension">Comprensión – Explicar, Describir</option>
          <option value="aplicacion" selected>Aplicación – Aplicar, Demostrar</option>
          <option value="actitudinal">Actitudinal – Valorar, Comprometerse</option>
        </select>
      </div>
    </div>
  </div>`;
}

function imp_poblarPaso2() {
  const ra = impState.datos.ra;
  const set = (id, val) => { const el = document.getElementById(id); if (el && val) el.value = val; };
  set('imp-ra-descripcion', ra.descripcion);
  set('imp-ra-criterios', ra.criterios);
  set('imp-ra-recursos', ra.recursos);
  set('imp-ra-nivel', ra.nivelBloom);
}

function imp_leerPaso2() {
  const get = id => { const el = document.getElementById(id); return el ? el.value.trim() : ''; };
  impState.datos.ra = {
    descripcion: get('imp-ra-descripcion'),
    criterios: get('imp-ra-criterios'),
    recursos: get('imp-ra-recursos'),
    nivelBloom: get('imp-ra-nivel')
  };
}

function imp_validarPaso2() {
  if (!impState.datos.ra.descripcion) { mostrarToast('La descripción del RA es obligatoria', 'error'); return false; }
  return true;
}

// ─── PASO 3: EC Y ACTIVIDADES ──────────────────────────────────
function imp_htmlPaso3() {
  // Si no hay ECs creados aún, inicializar con 1 vacío
  if (impState.datos.ecs.length === 0) {
    impState.datos.ecs = [{ codigo: 'CE1', enunciado: '', nivel: impState.datos.ra.nivelBloom || 'aplicacion', horasAsignadas: 2 }];
    impState.datos.actividades = [[]]; // un array de actividades por EC
  }

  let html = `
  <div style="margin-bottom:12px;display:flex;align-items:center;justify-content:space-between;">
    <div style="font-size:0.88rem;color:#616161;">Define los Elementos de Capacidad (EC) y las actividades de evaluación de tu planificación.</div>
    <button class="btn-siguiente" style="padding:7px 14px;font-size:0.82rem;" onclick="imp_agregarEC()">
      <span class="material-icons" style="font-size:16px;">add</span> Agregar EC
    </button>
  </div>`;

  impState.datos.ecs.forEach((ec, i) => {
    const acts = impState.datos.actividades[i] || [];
    html += `
    <div class="imp-ec-card" id="imp-ec-card-${i}">
      <div class="imp-ec-card-header">
        <span class="material-icons" style="font-size:18px;color:#1565C0;">task_alt</span>
        Elemento de Capacidad ${i + 1}
        ${impState.datos.ecs.length > 1 ? `<button onclick="imp_eliminarEC(${i})" style="margin-left:auto;background:none;border:none;cursor:pointer;color:#C62828;display:flex;align-items:center;" title="Eliminar EC"><span class="material-icons" style="font-size:18px;">delete</span></button>` : ''}
      </div>
      <div class="imp-ec-grid">
        <div class="imp-field">
          <label>Código del EC</label>
          <input id="imp-ec-cod-${i}" value="${escHTML(ec.codigo || '')}" placeholder="Ej: CE1" onchange="imp_actualizarEC(${i})">
        </div>
        <div class="imp-field">
          <label>Nivel Bloom</label>
          <select id="imp-ec-nivel-${i}" onchange="imp_actualizarEC(${i})">
            ${['conocimiento', 'comprension', 'aplicacion', 'actitudinal'].map(n =>
      `<option value="${n}" ${ec.nivel === n ? 'selected' : ''}>${n.charAt(0).toUpperCase() + n.slice(1)}</option>`
    ).join('')}
          </select>
        </div>
        <div class="imp-field" style="grid-column:1/-1;">
          <label>Enunciado del Elemento de Capacidad</label>
          <textarea id="imp-ec-enun-${i}" rows="2" placeholder="Ej: Selecciona herramientas de desarrollo web según sus características y caso de uso…" onchange="imp_actualizarEC(${i})">${escHTML(ec.enunciado || '')}</textarea>
        </div>
        <div class="imp-field">
          <label>Horas asignadas a este EC</label>
          <input id="imp-ec-hrs-${i}" type="number" min="1" max="100" value="${ec.horasAsignadas || 2}" onchange="imp_actualizarEC(${i})">
        </div>
        <div class="imp-field">
          <label>Instrumento de evaluación preferido</label>
          <select id="imp-ec-inst-${i}" onchange="imp_actualizarEC(${i})">
            <option value="cotejo" ${ec.instrumento !== 'rubrica' ? 'selected' : ''}>Lista de Cotejo</option>
            <option value="rubrica" ${ec.instrumento === 'rubrica' ? 'selected' : ''}>Rúbrica</option>
          </select>
        </div>
      </div>

      <div style="margin-top:8px;font-size:0.78rem;font-weight:700;color:#4527A0;margin-bottom:6px;">
        <span class="material-icons" style="font-size:14px;vertical-align:middle;">assignment</span>
        Actividades de evaluación
      </div>
      <div id="imp-acts-${i}">
        ${acts.map((act, j) => imp_htmlActRow(i, j, act)).join('')}
      </div>
      <button class="imp-add-act-btn" onclick="imp_agregarActividad(${i})">
        <span class="material-icons" style="font-size:16px;">add</span> Agregar actividad
      </button>
    </div>`;
  });

  return html;
}

function imp_htmlActRow(ecIdx, actIdx, act) {
  return `<div class="imp-act-row" id="imp-act-${ecIdx}-${actIdx}">
    <span class="imp-act-num">Act.${actIdx + 1}</span>
    <textarea rows="2" id="imp-act-enun-${ecIdx}-${actIdx}" placeholder="Describe la actividad de evaluación…"
      onchange="imp_actualizarAct(${ecIdx},${actIdx})">${escHTML((act && act.enunciado) || '')}</textarea>
    <input type="date" id="imp-act-fecha-${ecIdx}-${actIdx}" value="${(act && act.fecha) || ''}"
      onchange="imp_actualizarAct(${ecIdx},${actIdx})" title="Fecha de la sesión">
    <button class="btn-del-act" onclick="imp_eliminarActividad(${ecIdx},${actIdx})" title="Eliminar">
      <span class="material-icons" style="font-size:16px;">close</span>
    </button>
  </div>`;
}

function imp_actualizarEC(i) {
  const ec = impState.datos.ecs[i];
  if (!ec) return;
  ec.codigo = document.getElementById('imp-ec-cod-' + i)?.value.trim() || ec.codigo;
  ec.enunciado = document.getElementById('imp-ec-enun-' + i)?.value.trim() || ec.enunciado;
  ec.nivel = document.getElementById('imp-ec-nivel-' + i)?.value || ec.nivel;
  ec.horasAsignadas = parseFloat(document.getElementById('imp-ec-hrs-' + i)?.value) || ec.horasAsignadas;
  ec.instrumento = document.getElementById('imp-ec-inst-' + i)?.value || 'cotejo';
}

function imp_actualizarAct(ecIdx, actIdx) {
  if (!impState.datos.actividades[ecIdx]) return;
  const act = impState.datos.actividades[ecIdx][actIdx] || {};
  act.enunciado = document.getElementById(`imp-act-enun-${ecIdx}-${actIdx}`)?.value.trim() || '';
  act.fecha = document.getElementById(`imp-act-fecha-${ecIdx}-${actIdx}`)?.value || '';
  impState.datos.actividades[ecIdx][actIdx] = act;
}

function imp_agregarEC() {
  imp_leerPaso3();
  const n = impState.datos.ecs.length + 1;
  impState.datos.ecs.push({ codigo: 'CE' + n, enunciado: '', nivel: 'aplicacion', horasAsignadas: 2, instrumento: 'cotejo' });
  impState.datos.actividades.push([]);
  document.getElementById('imp-body').innerHTML = imp_htmlPaso3();
}

function imp_eliminarEC(i) {
  imp_leerPaso3();
  if (impState.datos.ecs.length <= 1) { mostrarToast('Debe haber al menos 1 EC', 'error'); return; }
  impState.datos.ecs.splice(i, 1);
  impState.datos.actividades.splice(i, 1);
  document.getElementById('imp-body').innerHTML = imp_htmlPaso3();
}

function imp_agregarActividad(ecIdx) {
  imp_leerPaso3();
  if (!impState.datos.actividades[ecIdx]) impState.datos.actividades[ecIdx] = [];
  impState.datos.actividades[ecIdx].push({ enunciado: '', fecha: '' });
  document.getElementById('imp-body').innerHTML = imp_htmlPaso3();
}

function imp_eliminarActividad(ecIdx, actIdx) {
  imp_leerPaso3();
  impState.datos.actividades[ecIdx].splice(actIdx, 1);
  document.getElementById('imp-body').innerHTML = imp_htmlPaso3();
}

function imp_leerPaso3() {
  impState.datos.ecs.forEach((ec, i) => {
    ec.codigo = document.getElementById('imp-ec-cod-' + i)?.value.trim() || ec.codigo;
    ec.enunciado = document.getElementById('imp-ec-enun-' + i)?.value.trim() || '';
    ec.nivel = document.getElementById('imp-ec-nivel-' + i)?.value || 'aplicacion';
    ec.horasAsignadas = parseFloat(document.getElementById('imp-ec-hrs-' + i)?.value) || 2;
    ec.instrumento = document.getElementById('imp-ec-inst-' + i)?.value || 'cotejo';
    if (!impState.datos.actividades[i]) impState.datos.actividades[i] = [];
    impState.datos.actividades[i].forEach((act, j) => {
      act.enunciado = document.getElementById(`imp-act-enun-${i}-${j}`)?.value.trim() || '';
      act.fecha = document.getElementById(`imp-act-fecha-${i}-${j}`)?.value || '';
    });
  });
}

function imp_validarPaso3() {
  imp_leerPaso3();
  for (let i = 0; i < impState.datos.ecs.length; i++) {
    if (!impState.datos.ecs[i].enunciado) {
      mostrarToast(`El EC ${i + 1} necesita un enunciado`, 'error'); return false;
    }
    const acts = impState.datos.actividades[i] || [];
    if (acts.length === 0) {
      mostrarToast(`El EC ${i + 1} debe tener al menos 1 actividad`, 'error'); return false;
    }
    for (let j = 0; j < acts.length; j++) {
      if (!acts[j].enunciado) {
        mostrarToast(`La actividad ${j + 1} del EC ${i + 1} necesita descripción`, 'error'); return false;
      }
    }
  }
  return true;
}

// ─── PASO 4: RESUMEN / CONFIRMACIÓN ───────────────────────────
function imp_htmlPaso4() {
  const dg = impState.datos.dg;
  const ra = impState.datos.ra;
  const ecs = impState.datos.ecs;
  const acts = impState.datos.actividades;
  const totalActs = acts.reduce((sum, arr) => sum + (arr ? arr.length : 0), 0);
  const diasActivos = Object.entries(dg.diasClase || {}).filter(([, v]) => v.activo).map(([k]) => k).join(', ');

  let ecResumen = ecs.map((ec, i) => {
    const aa = (acts[i] || []);
    return `<div style="margin:6px 0 2px;font-size:0.82rem;">
      <span style="font-weight:700;color:#1565C0;">${escHTML(ec.codigo)}</span>
      <span style="color:#616161;"> · ${ec.nivel} · ${ec.horasAsignadas}h</span><br>
      <span style="color:#424242;">${escHTML((ec.enunciado || '').substring(0, 80))}${ec.enunciado.length > 80 ? '…' : ''}</span>
      <span style="font-size:0.75rem;color:#9E9E9E;"> (${aa.length} actividad${aa.length !== 1 ? 'es' : ''})</span>
    </div>`;
  }).join('');

  return `
  <div style="background:#E8F5E9;border-radius:10px;padding:14px 16px;margin-bottom:16px;display:flex;gap:10px;align-items:flex-start;">
    <span class="material-icons" style="color:#2E7D32;font-size:28px;">check_circle</span>
    <div>
      <div style="font-weight:700;color:#1B5E20;margin-bottom:4px;">¡Planificación lista para guardar!</div>
      <div style="font-size:0.82rem;color:#2E7D32;">Revisa el resumen y confirma. Quedará guardada en tu biblioteca.</div>
    </div>
  </div>

  <div class="imp-resumen-card">
    <h4><span class="material-icons" style="font-size:16px;">assignment</span>Datos Generales</h4>
    <div class="imp-resumen-row"><strong>Módulo:</strong><span>${escHTML(dg.moduloFormativo || '—')}</span></div>
    <div class="imp-resumen-row"><strong>Bachillerato:</strong><span>${escHTML(dg.nombreBachillerato || '—')}</span></div>
    <div class="imp-resumen-row"><strong>Familia Profesional:</strong><span>${escHTML(dg.familiaProfesional || '—')}</span></div>
    <div class="imp-resumen-row"><strong>Docente:</strong><span>${escHTML(dg.nombreDocente || '—')}</span></div>
    <div class="imp-resumen-row"><strong>Período:</strong><span>${dg.fechaInicio || '—'} → ${dg.fechaTermino || '—'}</span></div>
    <div class="imp-resumen-row"><strong>Días de clase:</strong><span>${diasActivos || '—'}</span></div>
    <div class="imp-resumen-row"><strong>Horas semanales:</strong><span>${dg.horasSemana || '—'}</span></div>
    <div class="imp-resumen-row"><strong>Valor del RA:</strong><span>${dg.valorRA || '—'} pts</span></div>
  </div>

  <div class="imp-resumen-card">
    <h4><span class="material-icons" style="font-size:16px;">psychology</span>Resultado de Aprendizaje</h4>
    <div style="font-size:0.82rem;color:#424242;line-height:1.5;">${escHTML((ra.descripcion || '—').substring(0, 200))}${(ra.descripcion || '').length > 200 ? '…' : ''}</div>
    <div class="imp-resumen-row" style="margin-top:8px;"><strong>Nivel Bloom:</strong><span>${ra.nivelBloom || '—'}</span></div>
  </div>

  <div class="imp-resumen-card">
    <h4><span class="material-icons" style="font-size:16px;">task_alt</span>${ecs.length} Elemento${ecs.length !== 1 ? 's' : ''} de Capacidad · ${totalActs} Actividad${totalActs !== 1 ? 'es' : ''}</h4>
    ${ecResumen}
  </div>`;
}

// ─── NAVEGACIÓN ────────────────────────────────────────────────
function imp_siguiente() {
  if (impState.paso === 1) {
    imp_leerPaso1();
    if (!imp_validarPaso1()) return;
  } else if (impState.paso === 2) {
    imp_leerPaso2();
    if (!imp_validarPaso2()) return;
  } else if (impState.paso === 3) {
    if (!imp_validarPaso3()) return;
  } else if (impState.paso === 4) {
    imp_guardar();
    return;
  }
  impState.paso++;
  imp_renderizarPaso();
  document.getElementById('imp-body').scrollTop = 0;
}

function imp_anterior() {
  if (impState.paso <= 1) return;
  // Guardar estado actual antes de retroceder
  if (impState.paso === 2) imp_leerPaso2();
  else if (impState.paso === 3) imp_leerPaso3();
  impState.paso--;
  imp_renderizarPaso();
  document.getElementById('imp-body').scrollTop = 0;
}

// ─── GUARDAR ───────────────────────────────────────────────────
function imp_guardar() {
  const dg = impState.datos.dg;
  const ra = impState.datos.ra;
  const ecs = impState.datos.ecs;

  // Construir elementosCapacidad
  const elementosCapacidad = ecs.map((ec, i) => ({
    id: ec.codigo,
    codigo: ec.codigo,
    nivel: ec.nivel,
    nivelBloom: ec.nivel,
    enunciado: ec.enunciado,
    descripcion: ec.enunciado,
    horasAsignadas: ec.horasAsignadas,
    secuencia: plantillasSecuencia[ec.nivel] || plantillasSecuencia.aplicacion
  }));

  // Construir actividades
  const actividades = [];
  ecs.forEach((ec, ecIdx) => {
    const actsEC = impState.datos.actividades[ecIdx] || [];
    actsEC.forEach((act, actIdx) => {
      const fechaObj = act.fecha ? new Date(act.fecha + 'T12:00:00') : null;
      const fechaStr = fechaObj
        ? fechaObj.toLocaleDateString('es-DO', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })
        : '';
      const actObj = {
        id: `ACT-IMP-${ecIdx + 1}-${actIdx + 1}-${Date.now()}`,
        ecCodigo: ec.codigo,
        ecNivel: ec.nivel,
        enunciado: act.enunciado,
        fecha: fechaObj ? fechaObj.toISOString() : null,
        fechaStr,
        horas: ec.horasAsignadas,
        instrumento: ec.instrumento || 'cotejo'
      };
      // Generar instrumento básico
      actObj.instrumento = generarInstrumento(actObj, ec.nivel);
      actividades.push(actObj);
    });
  });

  // Construir fechasClase desde diasClase y fechas
  const fechasClase = _generarFechasDesde(dg);

  // Objeto planificacion completo
  const planImportada = {
    datosGenerales: dg,
    ra: { ...ra },
    elementosCapacidad,
    actividades,
    fechasClase,
    horasTotal: elementosCapacidad.reduce((s, e) => s + (e.horasAsignadas || 0), 0),
    _importada: true
  };

  // Guardar en biblioteca
  const ahora = new Date();
  const id = 'IMP-' + ahora.getTime();
  const registro = {
    id,
    fechaGuardado: ahora.toISOString(),
    fechaGuardadoLabel: ahora.toLocaleDateString('es-DO', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
    nombre: (dg.moduloFormativo || 'Sin módulo') + ' — ' + (dg.nombreDocente || 'Sin docente'),
    planificacion: planImportada
  };

  const biblio = cargarBiblioteca();
  const idxExistente = (biblio.items || []).findIndex(i =>
    i.planificacion?.datosGenerales?.moduloFormativo === dg.moduloFormativo &&
    i.planificacion?.datosGenerales?.nombreDocente === dg.nombreDocente
  );

  if (idxExistente >= 0) {
    if (!confirm('Ya existe una planificación de "' + (dg.moduloFormativo || '') + '". ¿Reemplazarla?')) return;
    biblio.items[idxExistente] = registro;
    mostrarToast('Planificación actualizada en la biblioteca', 'success');
  } else {
    biblio.items.unshift(registro);
    mostrarToast('Planificación importada y guardada correctamente', 'success');
  }

  persistirBiblioteca(biblio);
  imp_cerrar();
  renderizarBiblioteca();
}

/** Genera fechas de clase a partir de diasClase + fechaInicio + fechaTermino */
function _generarFechasDesde(dg) {
  if (!dg.fechaInicio || !dg.fechaTermino) return [];
  const DIAS = { lunes: 1, martes: 2, miercoles: 3, jueves: 4, viernes: 5 };
  const activosDias = Object.entries(dg.diasClase || {})
    .filter(([, v]) => v.activo)
    .map(([k, v]) => ({ dia: DIAS[k], horas: v.horas || 2 }));
  if (activosDias.length === 0) return [];

  const inicio = new Date(dg.fechaInicio + 'T12:00:00');
  const fin = new Date(dg.fechaTermino + 'T12:00:00');
  const result = [];
  const cur = new Date(inicio);
  while (cur <= fin) {
    const dow = cur.getDay(); // 0=dom
    const cfg = activosDias.find(d => d.dia === dow);
    if (cfg) {
      const fechaStr = cur.toLocaleDateString('es-DO', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
      result.push({ fecha: new Date(cur), fechaStr, horas: cfg.horas });
    }
    cur.setDate(cur.getDate() + 1);
  }
  return result;
}