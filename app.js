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



  conocimiento: ["identificar","reconocer","listar","definir","nombrar","recordar","enunciar","señalar","mencionar","describir brevemente","clasificar básicamente"],



  comprension:  ["explicar","describir","interpretar","resumir","clasificar","comparar","relacionar","distinguir","inferir","parafrasear","ilustrar","traducir"],



  aplicacion:   ["aplicar","demostrar","utilizar","resolver","ejecutar","implementar","desarrollar","construir","diseñar","producir","calcular","experimentar"],



  actitudinal:  ["valorar","asumir","comprometerse","respetar","reflexionar","demostrar actitud hacia","mostrar","apreciar","participar activamente","colaborar","integrar","promover"]



};







/** Plantillas de secuencia didáctica por nivel */



const plantillasSecuencia = {



  conocimiento: {



    anticipacion: { nombre: "Anticipación", descripcion: "Activar conocimientos previos mediante preguntas detonadoras o lluvia de ideas sobre el tema.", pct: 20 },



    construccion: { nombre: "Construcción",  descripcion: "Exposición conceptual con apoyo visual, lectura guiada de materiales y elaboración de mapas conceptuales.", pct: 55 },



    consolidacion: { nombre: "Consolidación", descripcion: "Cuestionario de verificación, elaboración de glosario y retroalimentación grupal.", pct: 25 }



  },



  comprension: {



    anticipacion: { nombre: "Anticipación", descripcion: "Presentar un caso o situación problemática para generar discusión y conectar con el RA.", pct: 15 },



    construccion: { nombre: "Construcción",  descripcion: "Análisis de ejemplos comparativos, discusión dirigida y elaboración de esquemas explicativos.", pct: 60 },



    consolidacion: { nombre: "Consolidación", descripcion: "Elaboración de resumen propio, exposición breve y autoevaluación mediante lista de cotejo.", pct: 25 }



  },



  aplicacion: {



    anticipacion: { nombre: "Anticipación", descripcion: "Plantear una situación real del campo profesional que requiera solución práctica.", pct: 10 },



    construccion: { nombre: "Construcción",  descripcion: "Demostración del docente, práctica guiada paso a paso, resolución de ejercicios reales.", pct: 65 },



    consolidacion: { nombre: "Consolidación", descripcion: "Presentación de resultado, coevaluación mediante rúbrica y reflexión sobre el proceso.", pct: 25 }



  },



  actitudinal: {



    anticipacion: { nombre: "Anticipación", descripcion: "Reflexión personal sobre valores y actitudes relacionadas con el ámbito profesional.", pct: 20 },



    construccion: { nombre: "Construcción",  descripcion: "Trabajo colaborativo, análisis de casos éticos, debate argumentado y role-playing.", pct: 50 },



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
    'el','la','los','las','un','una','unos','unas','y','o','de','del','al',
    'en','con','por','para','que','se','su','sus','es','son','ser','esta',
    'este','como','más','mas','mediante','través','traves','a','e','u',
    'hay','dicho','dichos','dichas','dicha','cuyo','cuya','cuyos','cuyas',
    'según','segun','cuanto','cuanta','cuantos','cuantas','todo','toda',
    'todos','todas','cada','otro','otra','otros','otras','mismo','misma',
    // verbos infinitivos muy frecuentes (a filtrar)
    'identificar','reconocer','aplicar','analizar','explicar','valorar',
    'evaluar','demostrar','utilizar','ejecutar','implementar','desarrollar',
    'realizar','efectuar','llevar','hacer','tener','poder','deber','saber',
    'conocer','comprender','interpretar','relacionar','comparar','definir',
    'describir','establecer','determinar','calcular','diseñar','disenar',
    'planificar','organizar','gestionar','administrar','controlar',
    // palabras genéricas poco útiles para el enunciado
    'manera','forma','modo','medio','tipo','nivel','proceso','procedimiento',
    'actividad','tarea','trabajo','campo','área','area','técnicas','tecnicas',
    'herramientas','herramienta','situaciones','situacion','situaciones',
    'general','generales','básico','basico','específico','especifico',
    'correspondencia','referencia','materiales','material','fuentes','fuente',
    'análisis','analisis','síntesis','sintesis','criterios','criterio',
    'mediante','través','partir','base','marco','acuerdo','relación'
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
    if (listaCE[0])   return listaCE[0];
    return 'los criterios del módulo';
  }

  // Contexto del módulo
  const modulo = (datos.moduloFormativo || 'el módulo formativo').toLowerCase();

  // Condiciones pedagógicas por nivel
  const condiciones = {
    conocimiento: 'mediante el análisis de materiales curriculares y fuentes técnicas especializadas',
    comprension:  'a través del análisis comparativo de casos reales relacionados con el entorno profesional',
    aplicacion:   'utilizando herramientas y técnicas apropiadas en situaciones prácticas del ámbito laboral',
    actitudinal:  'asumiendo una actitud reflexiva, comprometida y ética ante su práctica profesional'
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



  const mapaDia = { domingo:0, lunes:1, martes:2, miercoles:3, jueves:4, viernes:5, sabado:6 };



  const diasActivos = Object.entries(diasConfig)



    .filter(([, cfg]) => cfg.activo)



    .map(([dia, cfg]) => ({ numeroDia: mapaDia[dia], nombreDia: dia, horas: cfg.horas }));







  if (diasActivos.length === 0) return [];







  const inicio = new Date(fechaInicio + 'T00:00:00');



  const fin    = new Date(fechaFin + 'T00:00:00');



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



        fechaStr: cursor.toLocaleDateString('es-DO', { weekday:'short', day:'2-digit', month:'short', year:'numeric' })



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
  const matchObj  = enunciado.match(/^[A-ZÁÉÍÓÚÜÑ][a-záéíóúüñ]+\s+(.+?),/);
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



    { nombre: 'Excelente',    puntos: 4, clase: 'nivel-excelente',    descripcionSufijo: 'de manera excepcional, superando las expectativas' },



    { nombre: 'Bueno',        puntos: 3, clase: 'nivel-bueno',        descripcionSufijo: 'de manera satisfactoria, cumpliendo las expectativas' },



    { nombre: 'En proceso',   puntos: 2, clase: 'nivel-proceso',      descripcionSufijo: 'de manera parcial, con algunas deficiencias observadas' },



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



    const nombreNivel = { conocimiento:'Conocimiento', comprension:'Comprensión', aplicacion:'Aplicación', actitudinal:'Actitudinal' }[ec.nivel];



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



    const icono     = act.instrumento?.tipo === 'cotejo' ? 'checklist' : 'table_chart';







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



  const titulo    = document.getElementById('modal-title').textContent;



  const ventana   = window.open('', '_blank', 'width=800,height=600');



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



  const fechaHoy = new Date().toLocaleDateString('es-DO',{day:'2-digit',month:'long',year:'numeric'});







  const nivelLabel = { conocimiento:'Conocimiento', comprension:'Comprensión', aplicacion:'Aplicación', actitudinal:'Actitudinal' };







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



      <td>${a.instrumento?.tipoLabel||''}</td>



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



        <span class="material-icons" style="font-size:18px;">${a.instrumento.tipo==='cotejo'?'checklist':'table_chart'}</span>



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



      <div class="vp-dato"><strong>Familia Profesional</strong><span>${dg.familiaProfesional||'-'} (${dg.codigoFP||'-'})</span></div>



      <div class="vp-dato"><strong>Bachillerato Técnico</strong><span>${dg.nombreBachillerato||'-'}</span></div>



      <div class="vp-dato"><strong>Código Título</strong><span>${dg.codigoTitulo||'-'}</span></div>



      <div class="vp-dato"><strong>Módulo Formativo</strong><span>${dg.moduloFormativo||'-'} (${dg.codigoModulo||'-'})</span></div>



      <div class="vp-dato"><strong>Docente</strong><span>${dg.nombreDocente||'-'}</span></div>



      <div class="vp-dato"><strong>Período</strong><span>${dg.fechaInicio||'-'} ? ${dg.fechaTermino||'-'}</span></div>



      <div class="vp-dato"><strong>Horas por semana / Total</strong><span>${dg.horasSemana||'-'} hrs / ${planificacion.horasTotal} hrs</span></div>



      <div class="vp-dato"><strong>RA N° / Valor</strong><span>${dg.cantidadRA||'-'} RA en el módulo · ${dg.valorRA||'-'} puntos</span></div>



    </div>







    <!-- RA -->



    <div class="vp-section-title">Resultado de Aprendizaje (RA)</div>



    <div class="vp-ra-box">${ra.descripcion||'-'}</div>



    ${ra.criterios ? `<p style="font-size:0.85rem;color:#555;margin-bottom:0.5rem;"><strong>Criterios de referencia:</strong></p><pre style="font-size:0.82rem;color:#333;white-space:pre-wrap;background:#f9f9f9;padding:0.75rem;border-radius:6px;">${ra.criterios}</pre>` : ''}



    ${ra.recursos  ? `<p style="font-size:0.85rem;color:#555;margin-top:0.5rem;"><strong>Recursos didácticos:</strong> ${ra.recursos}</p>` : ''}







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



        <strong>${dg.nombreDocente||'Docente'}</strong>



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



  const nombreArchivo = `Planificacion_RA_${(dg.moduloFormativo||'modulo').replace(/\s+/g,'_')}.doc`;







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



  const url  = URL.createObjectURL(blob);



  const a    = document.createElement('a');



  a.href     = url;



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



  } catch(e) {



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



  } catch(e) {



    console.warn('No se pudo restaurar el borrador:', e);



    return false;



  }



}







/** Llena los campos del formulario desde el estado restaurado */



function poblarFormularioDesdeEstado() {



  const dg = planificacion.datosGenerales;



  const ra = planificacion.ra;







  const setVal = (id, val) => { const el = document.getElementById(id); if(el && val !== undefined) el.value = val; };







  setVal('familia-profesional', dg.familiaProfesional);



  setVal('codigo-fp',           dg.codigoFP);



  setVal('nombre-bachillerato', dg.nombreBachillerato);



  setVal('codigo-titulo',       dg.codigoTitulo);



  setVal('modulo-formativo',    dg.moduloFormativo);



  setVal('codigo-modulo',       dg.codigoModulo);



  setVal('nombre-docente',      dg.nombreDocente);



  setVal('cantidad-ra',         dg.cantidadRA);



  setVal('valor-ra',            dg.valorRA);



  setVal('horas-semana',        dg.horasSemana);



  setVal('fecha-inicio',        dg.fechaInicio);



  setVal('fecha-termino',       dg.fechaTermino);



  setVal('descripcion-ra',      ra.descripcion);



  setVal('criterios-referencia',ra.criterios);



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



    if (numPaso < pasoActivo)  step.classList.add('completed');



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



    'familia-profesional','codigo-fp','nombre-bachillerato','codigo-titulo',



    'modulo-formativo','codigo-modulo','nombre-docente','cantidad-ra',



    'valor-ra','horas-semana','fecha-inicio','fecha-termino'



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



  const inicio  = document.getElementById('fecha-inicio').value;



  const termino = document.getElementById('fecha-termino').value;



  if (inicio && termino && new Date(termino) <= new Date(inicio)) {



    document.getElementById('fecha-termino').classList.add('error');



    mostrarToast('La fecha de término debe ser posterior a la de inicio', 'error');



    return false;



  }







  // Al menos un día de clase



  const diasActivos = ['lunes','martes','miercoles','jueves','viernes']



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



    codigoFP:           getVal('codigo-fp'),



    nombreBachillerato: getVal('nombre-bachillerato'),



    codigoTitulo:       getVal('codigo-titulo'),



    moduloFormativo:    getVal('modulo-formativo'),



    codigoModulo:       getVal('codigo-modulo'),



    nombreDocente:      getVal('nombre-docente'),



    cantidadRA:         getVal('cantidad-ra'),



    valorRA:            getVal('valor-ra'),



    horasSemana:        getVal('horas-semana'),



    fechaInicio:        getVal('fecha-inicio'),



    fechaTermino:       getVal('fecha-termino'),



    diasClase:          obtenerDiasClase()



  };







  // Datos del RA



  planificacion.ra = {



    descripcion: getVal('descripcion-ra'),



    criterios:   getVal('criterios-referencia'),



    recursos:    getVal('recursos-didacticos'),



    nivelBloom:  planificacion.ra?.nivelBloom || ''



  };



}







/** Extrae la configuración de días de clase del formulario */



function obtenerDiasClase() {



  const dias = ['lunes','martes','miercoles','jueves','viernes'];



  const config = {};



  dias.forEach(d => {



    const checkbox = document.getElementById('dia-' + d);



    const horas    = document.getElementById('horas-' + d);



    config[d] = {



      activo: checkbox?.checked || false,



      horas:  parseInt(horas?.value || '2', 10)



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



      planificacion.semanas    = calcularSemanas(dg.fechaInicio, dg.fechaTermino);







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







    } catch(e) {



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



  const info  = {



    conocimiento: { label:'Nivel Bloom Detectado: Conocimiento', color:'#1565C0', bg:'#E3F2FD' },



    comprension:  { label:'Nivel Bloom Detectado: Comprensión',  color:'#2E7D32', bg:'#E8F5E9' },



    aplicacion:   { label:'Nivel Bloom Detectado: Aplicación',   color:'#E65100', bg:'#FFF3E0' },



    actitudinal:  { label:'Nivel Bloom Detectado: Actitudinal',  color:'#6A1B9A', bg:'#F3E5F5' }



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



  const fechaFin    = document.getElementById('fecha-termino')?.value;







  if (!fechaInicio || !fechaFin || !horasSemana) return;







  const sem = calcularSemanas(fechaInicio, fechaFin);



  if (sem <= 0) return;







  const totalH = horasSemana * sem;



  const resumen = document.getElementById('resumen-horas');



  const texto   = document.getElementById('resumen-horas-texto');



  if (!resumen || !texto) return;







  texto.textContent = `Aprox. ${sem} semanas · ${totalH} horas totales estimadas`;



  resumen.classList.remove('hidden');



}







/** Muestra un toast de notificación */



function mostrarToast(mensaje, tipo = 'success') {



  const toast = document.getElementById('toast');



  const icono = document.getElementById('toast-icon');



  const texto = document.getElementById('toast-mensaje');







  const iconos = { success:'check_circle', error:'error', info:'info' };



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







document.addEventListener('DOMContentLoaded', () => {







  // --- Listeners de checkboxes de días ---



  ['lunes','martes','miercoles','jueves','viernes'].forEach(dia => {



    const checkbox = document.getElementById('dia-' + dia);



    const wrap     = document.getElementById('horas-' + dia + '-wrap');



    const card     = document.getElementById('dia-card-' + dia);







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



  ['fecha-inicio','fecha-termino','horas-semana'].forEach(id => {



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
  } catch(e) { return false; }
}

// ── Helper: mostrar/ocultar las secciones correctas ─────────────────────────
function _mostrarPanel(panelId) {
  // Ocultar area principal
  document.querySelector('.stepper-container')?.classList.add('hidden');
  document.querySelector('.main-content')?.classList.add('hidden');
  // Ocultar otros paneles
  ['panel-calificaciones','panel-planificaciones','panel-diarias'].forEach(id => {
    if (id !== panelId) document.getElementById(id)?.classList.add('hidden');
  });
  // Mostrar panel deseado
  document.getElementById(panelId)?.classList.remove('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function _ocultarPaneles() {
  document.querySelector('.stepper-container')?.classList.remove('hidden');
  document.querySelector('.main-content')?.classList.remove('hidden');
  ['panel-calificaciones','panel-planificaciones','panel-diarias'].forEach(id => {
    document.getElementById(id)?.classList.add('hidden');
  });
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



  } catch(e) {



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



function registrarNota(estudianteId, actividadId, valor) {



  const curso = calState.cursos[calState.cursoActivoId];



  if (!curso) return;







  if (!curso.notas[estudianteId]) curso.notas[estudianteId] = {};







  const num = parseFloat(valor);



  if (valor === '' || isNaN(num)) {



    delete curso.notas[estudianteId][actividadId];



  } else {



    curso.notas[estudianteId][actividadId] = Math.min(100, Math.max(0, num));



  }







  guardarCalificaciones();



  actualizarFilaPromedio(estudianteId);



  actualizarPromedioActividad(actividadId);



}







/** Recalcula y actualiza el promedio de un estudiante en su fila */



function actualizarFilaPromedio(estudianteId) {



  const curso = calState.cursos[calState.cursoActivoId];



  if (!curso) return;







  const notas = curso.notas[estudianteId] || {};



  const vals = Object.values(notas).filter(n => n !== null && n !== undefined);



  const promedio = vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : null;







  const cell = document.getElementById(`prom-${estudianteId}`);



  if (!cell) return;







  if (promedio === null) {



    cell.textContent = '—';



    cell.className = 'td-promedio';



  } else {



    const p = Math.round(promedio * 10) / 10;



    cell.textContent = p.toFixed(1);



    cell.className = `td-promedio ${p >= 70 ? 'prom-aprobado' : p >= 60 ? 'prom-regular' : 'prom-reprobado'}`;



  }







  // Colorear el input



  const actIds = (planificacion.actividades || []).map(a => a.id);



  actIds.forEach(aId => {



    const inp = document.getElementById(`nota-${estudianteId}-${aId}`);



    if (!inp) return;



    const v = parseFloat(inp.value);



    if (!isNaN(v)) {



      inp.className = `input-nota ${v >= 70 ? 'nota-aprobado' : v >= 60 ? 'nota-regular' : 'nota-reprobado'}`;



    } else {



      inp.className = 'input-nota';



    }



  });



}







/** Recalcula el promedio por columna (actividad) en el footer */



function actualizarPromedioActividad(actividadId) {



  const curso = calState.cursos[calState.cursoActivoId];



  if (!curso) return;







  const vals = curso.estudiantes



    .map(e => curso.notas[e.id]?.[actividadId])



    .filter(v => v !== undefined && v !== null);







  const cell = document.getElementById(`foot-${actividadId}`);



  if (!cell) return;







  if (vals.length === 0) {



    cell.textContent = '—';



  } else {



    const p = vals.reduce((a, b) => a + b, 0) / vals.length;



    cell.textContent = (Math.round(p * 10) / 10).toFixed(1);



    cell.style.color = p >= 70 ? '#2E7D32' : p >= 60 ? '#E65100' : '#C62828';



  }



}







// ----------------------------------------------------------------



// RENDERIZADO



// ----------------------------------------------------------------







/** Renderiza el panel completo de calificaciones */



function renderizarCalificaciones() {



  renderizarTabsCursos();



  renderizarTablaCalificaciones();



}







/** Renderiza los tabs de cursos */



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



    tab.className = `cal-tab${curso.id === calState.cursoActivoId ? ' activo' : ''}`;



    tab.innerHTML = `



      <span class="material-icons" style="font-size:16px;">class</span>



      ${escapeHTML(curso.nombre)}



      <button class="cal-tab-del" title="Eliminar curso"



        onclick="event.stopPropagation();eliminarCurso('${curso.id}')">



        <span class="material-icons" style="font-size:16px;">close</span>



      </button>`;



    tab.onclick = () => activarCurso(curso.id);



    container.appendChild(tab);



  });



}







/** Renderiza la tabla de calificaciones del curso activo */



function renderizarTablaCalificaciones() {



  const thead = document.getElementById('cal-thead');



  const tbody = document.getElementById('cal-tbody');



  const tfoot = document.getElementById('cal-tfoot');



  const sinActs = document.getElementById('cal-sin-actividades');







  if (!thead || !tbody || !tfoot) return;







  const actividades = planificacion.actividades || [];



  const cursoId = calState.cursoActivoId;



  const curso = cursoId ? calState.cursos[cursoId] : null;







  // Si no hay actividades generadas, mostrar aviso



  if (actividades.length === 0) {



    sinActs?.classList.remove('hidden');



    thead.innerHTML = '';



    tbody.innerHTML = '';



    tfoot.innerHTML = '';



    return;



  }



  sinActs?.classList.add('hidden');







  if (!curso) {



    thead.innerHTML = '';



    tbody.innerHTML = '<tr><td colspan="99" style="text-align:center;padding:2rem;color:#9E9E9E;">Crea o selecciona un curso para comenzar.</td></tr>';



    tfoot.innerHTML = '';



    return;



  }







  // Agrupar actividades por EC



  const grupos = {};



  actividades.forEach(a => {



    if (!grupos[a.ecCodigo]) grupos[a.ecCodigo] = [];



    grupos[a.ecCodigo].push(a);



  });







  // ---- ENCABEZADO ----



  // Fila 1: EC agrupados (colspan)



  let headRow1 = '<tr class="tr-ec-header"><th class="th-nombre">Estudiante</th>';



  // Fila 2: actividades individuales



  let headRow2 = '<tr><th class="th-nombre" style="position:sticky;left:0;z-index:10;background:var(--color-primario-dark);">Nombre</th>';







  Object.entries(grupos).forEach(([ecCodigo, acts]) => {



    headRow1 += `<th colspan="${acts.length}" style="text-align:center;">${escapeHTML(ecCodigo)}</th>`;



    acts.forEach((a, i) => {



      const label = `Act. ${i + 1}`;



      const fechaCorta = a.fechaStr ? a.fechaStr.split(',')[0] : '';



      headRow2 += `<th title="${escapeHTML(a.enunciado)}">${label}<br><span style="font-weight:400;opacity:0.8;">${fechaCorta}</span></th>`;



    });



  });







  headRow1 += '<th>Promedio</th></tr>';



  headRow2 += '<th>Final</th></tr>';



  thead.innerHTML = headRow1 + headRow2;







  // ---- CUERPO ----



  if (curso.estudiantes.length === 0) {



    tbody.innerHTML = `<tr><td colspan="${actividades.length + 2}" style="text-align:center;padding:2rem;color:#9E9E9E;">



      Agrega estudiantes usando el formulario de arriba.



    </td></tr>`;



    tfoot.innerHTML = '';



    return;



  }







  tbody.innerHTML = '';



  curso.estudiantes.forEach(est => {



    const tr = document.createElement('tr');



    let cells = `



      <td class="td-nombre" id="nombre-${est.id}">



        <div class="td-nombre-inner">



          <span ondblclick="editarNombreEstudiante('${est.id}')" title="Doble clic para editar"



            style="cursor:pointer;flex:1;">${escapeHTML(est.nombre)}</span>



          <button class="btn-del-estudiante" onclick="eliminarEstudiante('${est.id}')" title="Eliminar">



            <span class="material-icons" style="font-size:16px;">close</span>



          </button>



        </div>



      </td>`;







    actividades.forEach(a => {



      const nota = curso.notas[est.id]?.[a.id];



      const val = nota !== undefined ? nota : '';



      const cls = nota !== undefined



        ? (nota >= 70 ? 'nota-aprobado' : nota >= 60 ? 'nota-regular' : 'nota-reprobado')



        : '';



      cells += `<td><input type="number" class="input-nota ${cls}"



        id="nota-${est.id}-${a.id}"



        value="${val}" min="0" max="100" step="0.5"



        placeholder="—"



        onchange="registrarNota('${est.id}','${a.id}',this.value)"



        oninput="registrarNota('${est.id}','${a.id}',this.value)"



        title="Nota de ${escapeHTML(est.nombre)} en ${escapeHTML(a.enunciado.substring(0,50))}"



        /></td>`;



    });







    // Promedio final del estudiante



    const notas = curso.notas[est.id] || {};



    const vals = Object.values(notas).filter(n => n !== null && n !== undefined);



    const prom = vals.length > 0 ? vals.reduce((a,b) => a+b, 0) / vals.length : null;



    const promStr = prom !== null ? (Math.round(prom * 10)/10).toFixed(1) : '—';



    const promCls = prom !== null ? (prom >= 70 ? 'prom-aprobado' : prom >= 60 ? 'prom-regular' : 'prom-reprobado') : '';



    cells += `<td class="td-promedio ${promCls}" id="prom-${est.id}">${promStr}</td>`;







    tr.innerHTML = cells;



    tbody.appendChild(tr);



  });







  // ---- FOOTER (promedios por actividad) ----



  let footerRow = '<tr><td class="td-foot-label">Promedio clase</td>';



  actividades.forEach(a => {



    const vals = curso.estudiantes



      .map(e => curso.notas[e.id]?.[a.id])



      .filter(v => v !== undefined && v !== null);



    const prom = vals.length > 0 ? (vals.reduce((x,y) => x+y, 0) / vals.length) : null;



    const color = prom !== null ? (prom >= 70 ? '#2E7D32' : prom >= 60 ? '#E65100' : '#C62828') : '';



    footerRow += `<td id="foot-${a.id}" style="color:${color};">${prom !== null ? (Math.round(prom*10)/10).toFixed(1) : '—'}</td>`;



  });



  footerRow += '<td id="foot-prom-total" class="td-foot-label">—</td></tr>';



  tfoot.innerHTML = footerRow;







  // Calcular promedio general



  const todosProms = curso.estudiantes.map(est => {



    const stNotas = Object.values(curso.notas[est.id] || {}).filter(n => n !== undefined && n !== null);



    return stNotas.length > 0 ? stNotas.reduce((a,b)=>a+b,0)/stNotas.length : null;



  }).filter(p => p !== null);



  const footProm = document.getElementById('foot-prom-total');



  if (footProm && todosProms.length > 0) {



    const gp = todosProms.reduce((a,b)=>a+b,0)/todosProms.length;



    footProm.textContent = (Math.round(gp*10)/10).toFixed(1);



    footProm.style.color = gp >= 70 ? '#2E7D32' : gp >= 60 ? '#E65100' : '#C62828';



  }



}







/** Escapa HTML para evitar XSS en nombres */



function escapeHTML(str) {



  return String(str || '')



    .replace(/&/g,'&amp;')



    .replace(/</g,'&lt;')



    .replace(/>/g,'&gt;')



    .replace(/"/g,'&quot;');



}







// ----------------------------------------------------------------



// NAVEGACIÓN – mostrar/ocultar panel calificaciones



// ----------------------------------------------------------------







/** Muestra el panel de calificaciones y oculta el stepper/main */



function abrirCalificaciones() {
  _asegurarPlanificacion();
  cargarCalificaciones();
  _mostrarPanel('panel-calificaciones');
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



  const hoy = new Date().toLocaleDateString('es-DO',{day:'2-digit',month:'long',year:'numeric'});







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



    <p><strong>Módulo:</strong> ${escapeHTML(dg.moduloFormativo||'-')}</p>



    <p><strong>Docente:</strong> ${escapeHTML(dg.nombreDocente||'-')}</p>



    <p><strong>Fecha:</strong> ${hoy}</p>



    <hr/>



    ${tabla}



  </body></html>`;







  const blob = new Blob(['\ufeff', html], { type: 'application/msword' });



  const url = URL.createObjectURL(blob);



  const a = document.createElement('a');



  a.href = url;



  a.download = `Calificaciones_${(curso.nombre||'').replace(/\s+/g,'_')}.doc`;



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



  } catch(e) {



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



    .replace(/&/g,'&amp;').replace(/</g,'&lt;')



    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');



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



  // Cerrar cualquier panel lateral abierto



  document.getElementById('panel-calificaciones')?.classList.add('hidden');



  document.getElementById('panel-planificaciones')?.classList.add('hidden');



  // Mostrar stepper y contenido principal



  document.querySelector('.stepper-container')?.classList.remove('hidden');



  document.querySelector('.main-content')?.classList.remove('hidden');



  // Ir al paso 1



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



  } catch(e) { estadoDiarias = { sesiones: {} }; }



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



      return el ? parseInt(el.value) || (m==='ini'?20:m==='des'?55:15) : (s.tiempos?.[m] || (m==='ini'?20:m==='des'?55:15));



    };



    const readSec = (id) => { const el = document.getElementById(id); return el ? el.value : ''; };







    estadoDiarias.sesiones[act.id] = {



      inicio: {



        apertura:     read('inicio','apertura'),



        encuadre:     read('inicio','encuadre'),



        organizacion: read('inicio','organizacion')



      },



      desarrollo: {



        procedimental:  read('desarrollo','procedimental'),



        conceptual:     read('desarrollo','conceptual')



      },



      cierre: {



        sintesis:    read('cierre','sintesis'),



        conexion:    read('cierre','conexion'),



        proximopaso: read('cierre','proximopaso')



      },



      estrategias: readSec(`pd-estrategias-${act.id}`),



      recursos:    readSec(`pd-recursos-${act.id}`),



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



      apertura:     `Saludo y activación de conocimientos previos a través de una pregunta exploratoria: ¿Qué saben sobre ${temaCorto}? Registro rápido de ideas en la pizarra (lluvia de ideas grupal).`,



      encuadre:     `Presentación del propósito de la clase: identificar y nombrar los elementos fundamentales de ${temaCorto} dentro del campo de ${campo}, reconociendo su importancia en el contexto profesional.`,



      organizacion: `Trabajo individual con apoyo grupal. Los estudiantes inician con una actividad de exploración propia y luego contrastan sus respuestas con un compañero (think-pair-share).`,



      procedimental:`1. El docente presenta el tema con apoyo visual (diapositivas/pizarra).\n2. Los estudiantes leen el material de referencia e identifican los conceptos clave.\n3. Completan una guía de trabajo: definen, enumeran y clasifican los elementos de ${temaCorto}.\n4. Cada estudiante elabora un organizador gráfico (mapa de conceptos o lista organizada).\n5. Se realiza una revisión cruzada con el compañero de al lado.`,



      conceptual:   `Reflexión guiada: ¿Por qué es importante conocer estos elementos en el ámbito de ${campo}? Los estudiantes comparten un ejemplo real donde este conocimiento es necesario. Se consolida con la definición colectiva del concepto central.`,



      sintesis:     `Pregunta detonadora de cierre: "¿Cuál de los conceptos vistos hoy te parece más relevante para tu futuro desempeño profesional y por qué?" Respuesta oral de 2-3 estudiantes voluntarios.`,



      conexion:     `Este conocimiento es la base de toda actuación técnica profesional en ${campo}. Los profesionales que dominan estos fundamentos toman mejores decisiones en situaciones reales de trabajo.`,



      proximopaso:  `En la próxima sesión profundizaremos en la comprensión de estos conceptos, analizando casos y estableciendo relaciones entre ellos.`,



      estrategias:  `• Activación de conocimientos previos (lluvia de ideas): fomenta la metacognición y conecta el nuevo aprendizaje con lo ya sabido.\n• Think-Pair-Share: promueve el aprendizaje colaborativo y la discusión entre pares.\n• Organizador gráfico (mapa conceptual): facilita la estructuración y retención del conocimiento declarativo.\n• Pregunta detonadora: estimula el pensamiento crítico y la reflexión individual al cierre.`,



      recursos:     `• Pizarrón / pizarra digital\n• Guía de trabajo impresa o digital\n• Material de lectura del módulo (texto, apuntes o diapositivas)\n• Marcadores y papel para organizadores gráficos`



    },



    comprension: {



      apertura:     `Saludo y presentación de un caso o situación cotidiana relacionada con ${temaCorto}. El docente lanza la pregunta: "¿Qué está ocurriendo aquí y por qué?" generando curiosidad y discusión inicial.`,



      encuadre:     `El propósito de esta sesión es comprender a fondo ${temaCorto}, diferenciando sus componentes, estableciendo relaciones y siendo capaces de explicar el concepto con palabras propias en el contexto de ${campo}.`,



      organizacion: `Trabajo en parejas o tríos. Cada grupo analiza un aspecto del tema, para luego compartir sus hallazgos con la clase en un formato de "mini-exposición" de 2 minutos.`,



      procedimental:`1. El docente presenta 2-3 ejemplos contrastantes del tema y guía el análisis comparativo.\n2. Los estudiantes en parejas analizan un caso asignado: identifican características, causas y consecuencias.\n3. Construyen un cuadro comparativo o diagrama que explique las relaciones del tema.\n4. Cada pareja explica brevemente su análisis al grupo (2 min).\n5. El docente guía la síntesis colectiva de los hallazgos.`,



      conceptual:   `Debate dirigido: ¿En qué situaciones reales de ${campo} se aplica este concepto? Los estudiantes argumentan sus respuestas. Se realiza una autoevaluación breve: ¿puedo explicar este tema a alguien que no lo conoce?`,



      sintesis:     `Cierre con la técnica del "Exit Ticket": cada estudiante escribe en una tarjeta (física o digital) una frase que resume lo aprendido y una pregunta que aún tiene. Se retroalimenta de forma grupal.`,



      conexion:     `La comprensión profunda de ${temaCorto} permite al profesional de ${campo} tomar decisiones fundamentadas, diagnosticar situaciones y proponer soluciones coherentes con la realidad del entorno laboral.`,



      proximopaso:  `En la próxima sesión pasaremos de la comprensión a la aplicación: resolveremos situaciones prácticas usando este conocimiento en contextos reales del campo profesional.`,



      estrategias:  `• Aprendizaje Basado en Análisis de Casos: desarrolla la capacidad de interpretar situaciones complejas.\n• Aprendizaje Cooperativo (parejas): favorece la construcción colectiva del conocimiento.\n• Mini-exposiciones entre pares: fortalece la comprensión al obligar a explicar el tema.\n• Exit Ticket: herramienta de evaluación formativa que promueve la metacognición.`,



      recursos:     `• Casos de estudio impresos o digitales\n• Plantilla de cuadro comparativo\n• Tarjetas para Exit Ticket (físicas o formulario digital)\n• Proyector o pizarra para síntesis colectiva`



    },



    aplicacion: {



      apertura:     `Saludo y presentación de un desafío o problema real del campo de ${campo} relacionado con ${temaCorto}. Se lanza la pregunta: "¿Cómo resolverían este problema con lo que saben?" Activando el pensamiento creativo y la motivación.`,



      encuadre:     `Hoy aplicaremos los conocimientos sobre ${temaCorto} para resolver una situación práctica concreta del entorno profesional de ${campo}. El foco está en el proceso de resolución, no solo en la respuesta correcta.`,



      organizacion: `Trabajo en equipos de 3-4 personas. Cada equipo recibe el mismo reto pero podrá proponer distintas soluciones. Al final se comparan los resultados y se discute la mejor estrategia.`,



      procedimental:`1. El docente presenta el problema/reto y clarifca las instrucciones y criterios de evaluación (rúbrica compartida).\n2. Los equipos planifican su estrategia de resolución (5 min).\n3. Fase de ejecución: aplican los conceptos y herramientas disponibles para resolver el reto paso a paso.\n4. Documentan el proceso: anotan los pasos seguidos, herramientas usadas y decisiones tomadas.\n5. Presentan su solución al grupo con una breve explicación (3 min por equipo).\n6. Coevaluación: cada equipo evalúa brevemente la solución de otro usando la rúbrica.`,



      conceptual:   `Reflexión metacognitiva: ¿Qué estrategia funcionó mejor y por qué? ¿Qué cambiarían en una segunda oportunidad? Los estudiantes identifican los principios aplicados en su solución y los conectan con la teoría vista.`,



      sintesis:     `El docente guía la síntesis: ¿Qué aprendieron HOY que no sabían antes de resolver el problema? Cada equipo comparte una lección aprendida. Se registra en el pizarrón como resumen colectivo.`,



      conexion:     `Esta misma metodología de resolución de problemas es la que usan los profesionales de ${campo} en su día a día. Dominar este proceso les permitirá enfrentarse con confianza a desafíos reales en la industria.`,



      proximopaso:  `En la próxima sesión profundizaremos en las actitudes y valores profesionales que complementan estas competencias técnicas, explorando la dimensión ética del trabajo en ${campo}.`,



      estrategias:  `• Aprendizaje Basado en Problemas (ABP): contextualiza el aprendizaje en situaciones reales y motiva la búsqueda activa de soluciones.\n• Aprendizaje Cooperativo por equipos: fomenta la comunicación efectiva y el trabajo colaborativo.\n• Coevaluación con rúbrica: desarrolla el juicio crítico y la autorregulación del aprendizaje.\n• Pensamiento visible (documentar el proceso): promueve la metacognición y el aprendizaje autónomo.`,



      recursos:     `• Problema/reto impreso o en pantalla\n• Rúbrica de evaluación compartida con los estudiantes\n• Herramientas del campo (software, equipos, materiales según el módulo)\n• Acceso a recursos de referencia (manuales, guías técnicas, internet)\n• Hoja de registro del proceso de resolución`



    },



    actitudinal: {



      apertura:     `Saludo y apertura con un dilema ético o profesional relacionado con ${campo}: se presenta un caso real o ficticio de toma de decisiones en el entorno laboral. Se lanza la pregunta: "¿Qué harías en esta situación y por qué?"`,



      encuadre:     `Esta sesión está centrada en el desarrollo de actitudes y valores profesionales fundamentales para el desempeño en ${campo}. Reflexionaremos sobre la ética profesional, la responsabilidad y el compromiso con la calidad en nuestra práctica cotidiana.`,



      organizacion: `Debate en círculo socrático: todos participan desde su perspectiva personal. Luego, trabajo individual de portafolio/reflexión escrita. No hay respuestas únicas; se valora la profundidad de la reflexión.`,



      procedimental:`1. Lectura o presentación del dilema/caso ético (individual, 5 min).\n2. Ronda de opiniones: cada estudiante comparte su postura inicial (sin interrupciones).\n3. Debate guiado: el docente introduce preguntas que profundizan el análisis: ¿Qué valores están en juego? ¿Qué consecuencias tendría cada decisión?\n4. Los estudiantes redefinen su postura tras escuchar a sus compañeros.\n5. Cada uno redacta en su portafolio una reflexión personal: ¿Qué tipo de profesional de ${campo} quiero ser? ¿Qué valores guiarán mi práctica?`,



      conceptual:   `Consolidación: análisis de referentes profesionales del campo que demuestran valores como la integridad, la innovación responsable y el compromiso social. Los estudiantes identifican actitudes a emular en su futura práctica.`,



      sintesis:     `Cada estudiante escribe en una tarjeta (o comparte oralmente) UN compromiso personal que se lleva de esta clase para su desarrollo profesional. Se crea un "mural de compromisos" colectivo.`,



      conexion:     `Las competencias técnicas son importantes, pero son los valores y la ética profesional los que distinguen a un buen técnico de un excelente profesional. En ${campo}, la confianza de los clientes y empleadores se construye sobre la base de la integridad y la responsabilidad.`,



      proximopaso:  `En la próxima sesión integraremos las competencias técnicas y actitudinales en una actividad integradora que pondrá a prueba todas las capacidades desarrolladas durante este Elemento de Capacidad.`,



      estrategias:  `• Diálogo Socrático / Debate ético: desarrolla el pensamiento crítico y la capacidad de argumentación fundamentada.\n• Portafolio reflexivo: promueve la metacognición, la autoevaluación y el desarrollo de la identidad profesional.\n• Aprendizaje Basado en Valores (ABV): conecta el aprendizaje con la dimensión humana y ética de la profesión.\n• Análisis de referentes profesionales: proporciona modelos de actuación profesional íntegra y motivadora.`,



      recursos:     `• Caso/dilema ético impreso o proyectado\n• Portafolio del estudiante (cuaderno o carpeta digital)\n• Tarjetas o post-its para el mural de compromisos\n• Materiales sobre referentes del campo (artículos, videos breves, testimonios)`



    }



  };







  const p = plantillas[nivel] || plantillas.aplicacion;



  return {



    inicio: { apertura: p.apertura, encuadre: p.encuadre, organizacion: p.organizacion },



    desarrollo: { procedimental: p.procedimental, conceptual: p.conceptual },



    cierre: { sintesis: p.sintesis, conexion: p.conexion, proximopaso: p.proximopaso },



    estrategias: p.estrategias,



    recursos: (planificacion.ra?.recursosDid || '') ?



      p.recursos + '\n• ' + (planificacion.ra?.recursosDid || '').replace(/\n/g,'\n• ') :



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



  const horasAct = ec ? (ec.horasAsignadas / Math.max(1, (planificacion.actividades||[]).filter(a=>a.ecCodigo===ec.codigo).length)) : 1.5;







  const gen = generarContenidoSesion(act, ec, horasAct);



  estadoDiarias.sesiones[actId] = gen;



  persistirDiarias();







  // Actualizar textareas en vivo



  const s = gen;



  const set = (id, val) => { const el = document.getElementById(id); if(el) el.value = val; };



  set(`pd-inicio-apertura-${actId}`,      s.inicio.apertura);



  set(`pd-inicio-encuadre-${actId}`,      s.inicio.encuadre);



  set(`pd-inicio-organizacion-${actId}`,  s.inicio.organizacion);



  set(`pd-desarrollo-procedimental-${actId}`, s.desarrollo.procedimental);



  set(`pd-desarrollo-conceptual-${actId}`,    s.desarrollo.conceptual);



  set(`pd-cierre-sintesis-${actId}`,     s.cierre.sintesis);



  set(`pd-cierre-conexion-${actId}`,     s.cierre.conexion);



  set(`pd-cierre-proximopaso-${actId}`,  s.cierre.proximopaso);



  set(`pd-estrategias-${actId}`,         s.estrategias);



  set(`pd-recursos-${actId}`,            s.recursos);







  const setT = (m, v) => { const el = document.getElementById(`pd-t-${m}-${actId}`); if(el) el.value = v; };



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



  const nivColores = { conocimiento:'#388E3C', comprension:'#1565C0', aplicacion:'#E65100', actitudinal:'#6A1B9A' };



  const nivLabel   = { conocimiento:'Conocimiento', comprension:'Comprensión', aplicacion:'Aplicación', actitudinal:'Actitudinal' };







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







    const enunciadoCorto = (act.enunciado || '').substring(0, 80) + ((act.enunciado||'').length > 80 ? '…' : '');







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



              <textarea id="pd-inicio-apertura-${act.id}" rows="3" placeholder="Breve saludo y enganche con el tema...">${s.inicio?.apertura || ''}</textarea>



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



              <textarea id="pd-desarrollo-procedimental-${act.id}" rows="6" placeholder="Paso a paso de lo que harán los estudiantes...">${s.desarrollo?.procedimental || ''}</textarea>



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



              <textarea id="pd-cierre-sintesis-${act.id}" rows="2" placeholder="Pregunta detonadora o resumen...">${s.cierre?.sintesis || ''}</textarea>



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



            <textarea id="pd-estrategias-${act.id}" rows="5"



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



  const hoy = new Date().toLocaleDateString('es-DO',{day:'2-digit',month:'long',year:'numeric'});







  let body = `<h2>Planificaciones Diarias</h2>



  <p><strong>Módulo:</strong> ${escHTML(dg.moduloFormativo||'')}</p>



  <p><strong>Docente:</strong> ${escHTML(dg.nombreDocente||'')}</p>



  <p><strong>Bachillerato:</strong> ${escHTML(dg.nombreBachillerato||'')}</p>



  <p><strong>Fecha de generación:</strong> ${hoy}</p><hr/>`;







  actividades.forEach((act, idx) => {



    const s = estadoDiarias.sesiones[act.id] || {};



    const ti = s.tiempos?.ini ?? '—';



    const td = s.tiempos?.des ?? '—';



    const tc = s.tiempos?.cie ?? '—';



    const total = (s.tiempos?.ini||0)+(s.tiempos?.des||0)+(s.tiempos?.cie||0);







    body += `<h3>Sesión ${idx+1}: ${escHTML(act.enunciado||'')}</h3>



    <p><strong>Fecha:</strong> ${escHTML(act.fechaStr||'—')} &nbsp;|&nbsp; <strong>EC:</strong> ${escHTML(act.ecCodigo||'')} &nbsp;|&nbsp; <strong>Duración total:</strong> ${total} min</p>







    <h4>1er MOMENTO – INICIO (${ti} min)</h4>



    <p><strong>Apertura:</strong> ${escHTML(s.inicio?.apertura||'—')}</p>



    <p><strong>Encuadre:</strong> ${escHTML(s.inicio?.encuadre||'—')}</p>



    <p><strong>Organización:</strong> ${escHTML(s.inicio?.organizacion||'—')}</p>







    <h4>2do MOMENTO – DESARROLLO (${td} min)</h4>



    <p><strong>Procedimental / Actividad principal:</strong><br>${escHTML(s.desarrollo?.procedimental||'—').replace(/\n/g,'<br>')}</p>



    <p><strong>Conceptual / Actitudinal:</strong><br>${escHTML(s.desarrollo?.conceptual||'—').replace(/\n/g,'<br>')}</p>







    <h4>3er MOMENTO – CIERRE (${tc} min)</h4>



    <p><strong>Síntesis:</strong> ${escHTML(s.cierre?.sintesis||'—')}</p>



    <p><strong>Conexión:</strong> ${escHTML(s.cierre?.conexion||'—')}</p>



    <p><strong>Próximo paso:</strong> ${escHTML(s.cierre?.proximopaso||'—')}</p>







    <p><strong>ESTRATEGIAS:</strong><br>${escHTML(s.estrategias||'—').replace(/\n/g,'<br>')}</p>



    <p><strong>RECURSOS:</strong><br>${escHTML(s.recursos||'—').replace(/\n/g,'<br>')}</p>



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



  a.download = `PlanificacionesDiarias_${(dg.moduloFormativo||'modulo').replace(/\s+/g,'_')}.doc`;



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

const IA_KEY_STORAGE = 'planificadorRA_geminiKey';

/** Retorna la API key guardada o null */
function getApiKey() {
  return localStorage.getItem(IA_KEY_STORAGE) || null;
}

/** Abre el modal de configuración de la IA */
function abrirConfigIA() {
  const keyActual = getApiKey();
  const estado = keyActual
    ? '<span class="ia-status-chip ia-activa-chip"><span class="material-icons" style="font-size:14px;">check_circle</span> Clave configurada</span>'
    : '<span class="ia-status-chip ia-inactiva-chip"><span class="material-icons" style="font-size:14px;">warning</span> Sin clave configurada</span>';

  document.getElementById('modal-title').textContent = 'Configuración de IA (Gemini)';
  document.getElementById('modal-body').innerHTML = `
    <div class="config-ia-content">
      <div>${estado}</div>
      <label for="input-gemini-key">Clave API de Gemini</label>
      <input type="password" id="input-gemini-key"
             placeholder="AIza..."
             value="${keyActual || ''}"
             autocomplete="off" />
      <div class="info-tip" style="margin:0;">
        <span class="material-icons" style="color:#1565C0;">info</span>
        <div>
          <p style="margin:0;">Obtén tu clave gratuita en
            <a href="https://aistudio.google.com/app/apikey" target="_blank"
               style="color:#1565C0;font-weight:600;">aistudio.google.com</a>
            (requiere cuenta Google).</p>
          <p style="margin:4px 0 0;font-size:0.8rem;color:#757575;">
            La clave se guarda solo en tu navegador. No se envía a ningún servidor externo.
          </p>
        </div>
      </div>
      ${keyActual ? '<button class="btn-secundario" style="align-self:flex-start;" onclick="borrarApiKey()"><span class="material-icons" style="font-size:16px;">delete</span> Eliminar clave</button>' : ''}
    </div>`;

  document.getElementById('modal-footer').innerHTML = `
    <button class="btn-siguiente" onclick="guardarApiKey()">
      <span class="material-icons">save</span> Guardar clave
    </button>
    <button class="btn-secundario" onclick="cerrarModalBtn()">Cancelar</button>`;

  document.getElementById('modal-overlay').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  setTimeout(() => document.getElementById('input-gemini-key')?.focus(), 100);
}

function guardarApiKey() {
  const key = document.getElementById('input-gemini-key')?.value?.trim();
  if (!key) { mostrarToast('Ingresa una clave válida', 'error'); return; }
  if (!key.startsWith('AIza')) { mostrarToast('La clave debe comenzar con "AIza..."', 'error'); return; }
  localStorage.setItem(IA_KEY_STORAGE, key);
  actualizarBtnConfigIA();
  cerrarModalBtn();
  mostrarToast('Clave guardada. La IA está lista para generar planificaciones.', 'success');
}

function borrarApiKey() {
  localStorage.removeItem(IA_KEY_STORAGE);
  actualizarBtnConfigIA();
  cerrarModalBtn();
  mostrarToast('Clave eliminada. Se usará generación local.', 'info');
}

function actualizarBtnConfigIA() {
  const btn = document.getElementById('btn-config-ia');
  if (!btn) return;
  if (getApiKey()) {
    btn.classList.add('ia-activa');
    btn.title = 'IA configurada ✓ — clic para cambiar la clave';
  } else {
    btn.classList.remove('ia-activa');
    btn.title = 'Configurar clave de IA (Gemini)';
  }
}

// ─────────────────────────────────────────────────────────────
// CONSTRUCTOR DEL PROMPT
// ─────────────────────────────────────────────────────────────

function construirPromptGemini(dg, ra, fechasClase) {
  // diasClase es un objeto {lunes:{activo,horas}, martes:{activo,horas}, ...}
  const diasClaseObj = dg.diasClase || {};
  const diasArr = Object.entries(diasClaseObj)
    .filter(([, v]) => v && v.activo)
    .map(([dia, v]) => `${dia} (${v.horas}h)`);
  const diasStr = diasArr.length > 0 ? diasArr.join(', ') : (dg.horasSemana + ' hrs/semana');

  const totalFechasSesion = fechasClase ? fechasClase.length : '?';

  return `Eres docente experto en educación técnico profesional de la República Dominicana.
Responde ÚNICAMENTE con un objeto JSON válido, sin explicaciones adicionales, sin bloques de código markdown.

DATOS DEL MÓDULO:
- Familia profesional: ${dg.familiaProfesional || ''} (${dg.codigoFP || ''})
- Bachillerato Técnico: ${dg.nombreBachillerato || ''}
- Módulo Formativo: ${dg.moduloFormativo || ''} (${dg.codigoModulo || ''})
- Docente: ${dg.nombreDocente || ''}
- Período: ${dg.fechaInicio || ''} → ${dg.fechaTermino || ''}
- Horario semanal: ${diasStr} (${dg.horasSemana || '?'} horas/semana)
- Total de sesiones disponibles: ${totalFechasSesion}
- Valor del RA: ${dg.valorRA || '10'} puntos
- Cantidad de RA en el módulo: ${dg.cantidadRA || '?'}

RESULTADO DE APRENDIZAJE (RA):
${ra.descripcion || ''}

CRITERIOS DE EVALUACIÓN (referencia para los EC):
${ra.criterios || 'No especificados'}

RECURSOS DIDÁCTICOS:
${ra.recursosDid || 'Material de la asignatura, pizarrón, guías de trabajo'}

INSTRUCCIONES PARA LA GENERACIÓN:
1. Determina el nivel Bloom del RA completo (una sola palabra: conocimiento, comprension, aplicacion, sintesis, evaluacion o creacion).
2. Genera EXACTAMENTE 4 Elementos de Capacidad (EC):
   - E.C.1.1.1 → nivel: "conocimiento" (verbos: Identificar, Reconocer, Listar, Nombrar, Definir...)
   - E.C.2.1.1 → nivel: "comprension" (verbos: Explicar, Comparar, Interpretar, Describir, Relacionar...)
   - E.C.3.1.1 → nivel: "aplicacion" (verbos: Aplicar, Resolver, Ejecutar, Demostrar, Implementar...)
   - E.C.4.1.1 → nivel: "actitudinal" (verbos: Valorar, Asumir, Demostrar, Comprometerse, Reflexionar...)
   Cada enunciado debe tener: VERBO en infinitivo + OBJETO (qué aprende) + CONDICIONES (cómo/con qué) + "en correspondencia con [CE_X.X]."
   Los enunciados deben ser específicos a la asignatura, NO genéricos.
3. Genera de 1 a 2 actividades por EC (máximo 2, según tiempo disponible).
   Formato de enunciado: "Tipo de actividad: Descripción específica y contextualizada al tema."
   Tipos válidos: Cuestionario escrito, Mapa conceptual, Análisis de caso, Exposición oral, Práctica supervisada, Proyecto integrador, Reflexión y portafolio, Debate dirigido, Estudio de caso.
4. Instrumento de evaluación: "cotejo" para conocimiento/comprensión, "rubrica" para aplicación/actitudinal.

DEVUELVE EXACTAMENTE este JSON (sin modificar los nombres de los campos):
{
  "nivelBloomRA": "comprension",
  "elementosCapacidad": [
    {
      "codigo": "E.C.1.1.1",
      "nivel": "conocimiento",
      "nivelBloom": "conocimiento",
      "enunciado": "Identificar... objeto... condición..., en correspondencia con CE3.X."
    },
    {
      "codigo": "E.C.2.1.1",
      "nivel": "comprension",
      "nivelBloom": "comprension",
      "enunciado": "Explicar... objeto... condición..., en correspondencia con CE3.X."
    },
    {
      "codigo": "E.C.3.1.1",
      "nivel": "aplicacion",
      "nivelBloom": "aplicacion",
      "enunciado": "Aplicar... objeto... condición..., en correspondencia con CE3.X."
    },
    {
      "codigo": "E.C.4.1.1",
      "nivel": "actitudinal",
      "nivelBloom": "actitudinal",
      "enunciado": "Valorar... objeto... condición..., en correspondencia con CE3.X."
    }
  ],
  "actividades": [
    {
      "ecCodigo": "E.C.1.1.1",
      "enunciado": "Tipo: Descripción específica.",
      "instrumento": "cotejo"
    }
  ]
}`;
}

// ─────────────────────────────────────────────────────────────
// LLAMADA A GEMINI API
// ─────────────────────────────────────────────────────────────

async function generarConGemini(dg, ra, fechasClase) {
  const apiKey = getApiKey();
  if (!apiKey) return null;

  const prompt = construirPromptGemini(dg, ra, fechasClase);

  const endpoint =
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

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

  if (!resp.ok) {
    const errJson = await resp.json().catch(() => ({}));
    const msg = errJson?.error?.message || resp.statusText;
    throw new Error(`Gemini API error ${resp.status}: ${msg}`);
  }

  const data = await resp.json();
  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawText) throw new Error('Respuesta vacía de Gemini');

  // Limpiar posibles bloques markdown que Gemini a veces añade
  const cleaned = rawText.replace(/^```json\s*/i, '').replace(/```\s*$/,'').trim();
  return JSON.parse(cleaned);
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
  let fechaIdx = 0;

  planificacion.actividades = actividadesAI.map((act, i) => {
    const ecObj = planificacion.elementosCapacidad.find(e => e.codigo === act.ecCodigo)
                  || planificacion.elementosCapacidad[0];
    const fecha = fechasClase[fechaIdx] || fechasClase[fechasClase.length - 1];
    fechaIdx++;

    const instrumento = act.instrumento === 'rubrica'
      ? generarRubrica(ecObj, act.enunciado)
      : generarListaCotejo(ecObj, act.enunciado);

    return {
      id: `act_${i}`,
      ecCodigo: act.ecCodigo || ecObj.codigo,
      enunciado: act.enunciado,
      fecha: fecha.fecha,
      fechaStr: fecha.fechaStr,
      instrumento
    };
  });

  // 4. Actualizar resumen de horas en pantalla
  const resEl = document.getElementById('resumen-distribucion');
  if (resEl) {
    resEl.classList.remove('hidden');
    const displayHoras  = document.getElementById('total-horas-display');
    const displaySemanas = document.getElementById('total-semanas-display');
    const displayXEC   = document.getElementById('horas-por-ec-display');
    if (displayHoras)   displayHoras.textContent   = totalHoras + ' hrs';
    if (displaySemanas) displaySemanas.textContent = Math.ceil(totalHoras / parseFloat(dg.horasSemana || 2)) + ' sem';
    if (displayXEC)     displayXEC.textContent     = horasPorEC + ' hrs';
  }
}

// ─────────────────────────────────────────────────────────────
// SOBRESCRIBIR generarPlanificacion PARA USAR IA
// ─────────────────────────────────────────────────────────────

// Guardar referencia al generador local original
const _generarPlanificacionLocal = generarPlanificacion;

// Nueva versión con IA
generarPlanificacion = async function() {
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
  const fechasClase = calcularFechasClase(
    planificacion.datosGenerales.fechaInicio,
    planificacion.datosGenerales.fechaTermino,
    planificacion.datosGenerales.diasClase
  );
  planificacion.fechasClase = fechasClase;

  const apiKey = getApiKey();

  if (!apiKey) {
    // Sin IA: usar generación local y avisar
    mostrarToast('💡 Sin clave Gemini: usando generación local. Configura la IA con el botón ⚙️ para mejores resultados.', 'info');
    // Llamar al generador local original
    _generarPlanificacionLocal();
    return;
  }

  // CON IA: mostrar spinner
  const btnGenerar   = document.getElementById('btn-generar');
  const btnTexto     = document.getElementById('btn-generar-texto');
  const iconoGenerar = btnGenerar?.querySelector('.material-icons');

  if (btnGenerar) btnGenerar.classList.add('btn-generando');
  if (btnTexto)   btnTexto.textContent = 'Generando con IA...';
  if (iconoGenerar) iconoGenerar.textContent = 'hourglass_top';

  try {
    mostrarToast('Consultando IA... esto tarda unos segundos ⏳', 'info');

    const aiData = await generarConGemini(
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

    // Habilitar siguiente
    document.getElementById('btn-paso2-siguiente').disabled = false;

    guardarBorrador();
    mostrarToast('¡Planificación generada con IA! Revisa y ajusta a tu criterio.', 'success');

    // Avanzar al paso 3
    setTimeout(() => irAlPaso(3, true), 600);

  } catch (err) {
    console.error('Error Gemini:', err);
    const msg = err.message || String(err);

    if (msg.includes('API_KEY_INVALID') || msg.includes('401')) {
      mostrarToast('❌ Clave inválida. Ve a ⚙️ Config. IA y verifica tu clave.', 'error');
    } else if (msg.includes('expired') || msg.includes('400')) {
      mostrarToast(
        '⚠️ API key rechazada. Abre la app desde http://localhost:8080 (no desde archivo) o crea la clave sin restricciones en AI Studio.',
        'error'
      );
    } else if (msg.includes('QUOTA') || msg.includes('429')) {
      mostrarToast('⏳ Límite gratuito alcanzado. Espera 1 minuto e intenta de nuevo.', 'error');
    } else {
      mostrarToast('Error IA: ' + msg.substring(0, 80), 'error');
    }
    // Siempre usar generacion local como fallback
    _generarPlanificacionLocal();
  } finally {
    // Restaurar botón
    if (btnGenerar) btnGenerar.classList.remove('btn-generando');
    if (btnTexto)   btnTexto.textContent = 'Generar planificación';
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
