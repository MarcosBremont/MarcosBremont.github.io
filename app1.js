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
  var item = (biblio.items || []).find(function(it) { return it.id === sel.value; });
  if (!item || !item.planificacion) { mostrarToast('No se encontró la planificación', 'error'); return; }
  planificacion = item.planificacion;
  (planificacion.actividades || []).forEach(function(a) { if (a.fecha && typeof a.fecha === 'string') a.fecha = new Date(a.fecha); });
  (planificacion.fechasClase || []).forEach(function(f) { if (f.fecha && typeof f.fecha === 'string') f.fecha = new Date(f.fecha); });
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
  ['section-1','section-2','section-3','section-4','section-5'].forEach(id => {
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
  ['section-1','section-2','section-3','section-4','section-5'].forEach(id => {
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
  const base = (dg.moduloFormativo||'')+'|'+(dg.codigoModulo||'')+'|'+(ra.descripcion||'').substring(0,40);
  try { return 'ra_' + btoa(unescape(encodeURIComponent(base))).substring(0,16).replace(/[^a-zA-Z0-9]/g,'_'); }
  catch(e) { return 'ra_' + Math.abs(base.split('').reduce((a,c)=>a+c.charCodeAt(0),0)) % 999999; }
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
    const p = vals.reduce((a,b)=>a+b,0)/vals.length;
    const max = raInfo.valores[actId] || 10;
    cell.textContent = p.toFixed(1);
    cell.style.color = (p/max)>=0.7?'#2E7D32':(p/max)>=0.6?'#E65100':'#C62828';
  });
  const tots = curso.estudiantes.map(e => _calcNotaRA(curso,e.id,raKey)).filter(n=>n!==null);
  const cellTot = document.getElementById('foot-total-ra-' + raKey);
  if (cellTot) {
    if (tots.length === 0) { cellTot.textContent = '\u2014'; cellTot.style.color = ''; }
    else {
      const p = tots.reduce((a,b)=>a+b,0)/tots.length;
      cellTot.textContent = p.toFixed(1);
      cellTot.style.color = (p/raInfo.valorTotal)>=0.7?'#2E7D32':(p/raInfo.valorTotal)>=0.6?'#E65100':'#C62828';
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
      + escapeHTML(ri.modulo.substring(0,14)||'RA') + '<br><small style=\'font-weight:400;\'>(' + ri.valorTotal + ' pts)</small></th>';
  });

  h1 += '<th rowspan="2" style="background:#1B5E20;color:#fff;min-width:72px;font-size:0.8rem;vertical-align:middle;text-align:center;">FINAL</th></tr>';

  // Fila 2: actividades con valor editable
  let h2 = '<tr>';
  actividades.forEach((a, i) => {
    const val = raInfo.valores[a.id] !== undefined ? raInfo.valores[a.id] : '';
    const fechaCorta = a.fechaStr ? a.fechaStr.split(',')[0] : '';
    const ecCorto = a.ecCodigo ? a.ecCodigo.replace('E.C.','') : '';
    h2 += '<th class="th-act" title="' + escapeHTML(a.enunciado) + '" style="min-width:80px;">'
      + '<div style="font-size:0.72rem;font-weight:600;">Act.' + (i+1)
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
        + ' title="M&aacute;x: ' + max + ' pts | ' + escapeHTML(a.enunciado.substring(0,40)) + '"'
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
    const p = vals.length > 0 ? vals.reduce((x,y)=>x+y,0)/vals.length : null;
    const max = raInfo.valores[a.id] || 10;
    footerRow += '<td id="foot-' + raKey + '-' + a.id + '" style="' + (p!==null?'color:'+((p/max)>=0.7?'#2E7D32':(p/max)>=0.6?'#E65100':'#C62828'):'') + ';">'
      + (p !== null ? p.toFixed(1) : '\u2014') + '</td>';
  });

  const tots = curso.estudiantes.map(e => _calcNotaRA(curso,e.id,raKey)).filter(n=>n!==null);
  const avgRA = tots.length > 0 ? tots.reduce((a,b)=>a+b,0)/tots.length : null;
  footerRow += '<td id="foot-total-ra-' + raKey + '" style="font-weight:700;' + (avgRA!==null?'color:'+((avgRA/raInfo.valorTotal)>=0.7?'#2E7D32':(avgRA/raInfo.valorTotal)>=0.6?'#E65100':'#C62828'):'') + ';">'
    + (avgRA !== null ? avgRA.toFixed(1) : '\u2014') + '</td>';

  rasKeys.filter(rk => rk !== raKey).forEach(rk => {
    const ri = curso.ras[rk];
    const tt = curso.estudiantes.map(e => _calcNotaRA(curso,e.id,rk)).filter(n=>n!==null);
    const avg = tt.length > 0 ? tt.reduce((a,b)=>a+b,0)/tt.length : null;
    footerRow += '<td style="background:#EDE7F6;font-weight:700;' + (avg!==null?'color:'+((avg/ri.valorTotal)>=0.7?'#2E7D32':(avg/ri.valorTotal)>=0.6?'#E65100':'#C62828'):'') + ';">'
      + (avg !== null ? avg.toFixed(1) : '\u2014') + '</td>';
  });

  const fins = curso.estudiantes.map(e => _calcNotaFinal(curso,e.id)).filter(n=>n!==null);
  const avgFin = fins.length > 0 ? fins.reduce((a,b)=>a+b,0)/fins.length : null;
  footerRow += '<td style="font-weight:700;' + (avgFin!==null?'color:'+(avgFin>=70?'#2E7D32':avgFin>=60?'#E65100':'#C62828'):'') + ';">'
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






