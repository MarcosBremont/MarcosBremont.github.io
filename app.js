/**
 * ================================================================
 * PLANIFICADOR EDUCATIVO POR RESULTADOS DE APRENDIZAJE (RA)
 * Sistema para Docentes de Educaci�f³n T�f©cnico Profesional
 * Rep�fºblica Dominicana
 * ================================================================
 *
 * INSTRUCCIONES DE DESPLIEGUE EN GITHUB PAGES:
 * 1. Crea un repositorio en GitHub (ej: planificador-ra)
 * 2. Sube los 3 archivos: index.html, styles.css, app.js
 * 3. Ve a Settings > Pages > Source: "Deploy from a branch"
 * 4. Selecciona la rama "main" y la carpeta "/ (root)"
 * 5. Haz clic en Save. Tu app estar�f¡ en:
 *    https://tu-usuario.github.io/planificador-ra/
 *
 * Tambi�f©n funciona en Netlify arrastrando la carpeta, o
 * abriendo index.html directamente en el navegador.
 * ================================================================
 */

'use strict';

// ================================================================
// --- SECCI�f�?oN: DATOS GLOBALES ---
// ================================================================

/** Banco de verbos de Bloom por nivel taxon�f³mico */
const verbosBloom = {
  conocimiento: ["identificar","reconocer","listar","definir","nombrar","recordar","enunciar","se�f±alar","mencionar","describir brevemente","clasificar b�f¡sicamente"],
  comprension:  ["explicar","describir","interpretar","resumir","clasificar","comparar","relacionar","distinguir","inferir","parafrasear","ilustrar","traducir"],
  aplicacion:   ["aplicar","demostrar","utilizar","resolver","ejecutar","implementar","desarrollar","construir","dise�f±ar","producir","calcular","experimentar"],
  actitudinal:  ["valorar","asumir","comprometerse","respetar","reflexionar","demostrar actitud hacia","mostrar","apreciar","participar activamente","colaborar","integrar","promover"]
};

/** Plantillas de secuencia did�f¡ctica por nivel */
const plantillasSecuencia = {
  conocimiento: {
    anticipacion: { nombre: "Anticipaci�f³n", descripcion: "Activar conocimientos previos mediante preguntas detonadoras o lluvia de ideas sobre el tema.", pct: 20 },
    construccion: { nombre: "Construcci�f³n",  descripcion: "Exposici�f³n conceptual con apoyo visual, lectura guiada de materiales y elaboraci�f³n de mapas conceptuales.", pct: 55 },
    consolidacion: { nombre: "Consolidaci�f³n", descripcion: "Cuestionario de verificaci�f³n, elaboraci�f³n de glosario y retroalimentaci�f³n grupal.", pct: 25 }
  },
  comprension: {
    anticipacion: { nombre: "Anticipaci�f³n", descripcion: "Presentar un caso o situaci�f³n problem�f¡tica para generar discusi�f³n y conectar con el RA.", pct: 15 },
    construccion: { nombre: "Construcci�f³n",  descripcion: "An�f¡lisis de ejemplos comparativos, discusi�f³n dirigida y elaboraci�f³n de esquemas explicativos.", pct: 60 },
    consolidacion: { nombre: "Consolidaci�f³n", descripcion: "Elaboraci�f³n de resumen propio, exposici�f³n breve y autoevaluaci�f³n mediante lista de cotejo.", pct: 25 }
  },
  aplicacion: {
    anticipacion: { nombre: "Anticipaci�f³n", descripcion: "Plantear una situaci�f³n real del campo profesional que requiera soluci�f³n pr�f¡ctica.", pct: 10 },
    construccion: { nombre: "Construcci�f³n",  descripcion: "Demostraci�f³n del docente, pr�f¡ctica guiada paso a paso, resoluci�f³n de ejercicios reales.", pct: 65 },
    consolidacion: { nombre: "Consolidaci�f³n", descripcion: "Presentaci�f³n de resultado, coevaluaci�f³n mediante r�fºbrica y reflexi�f³n sobre el proceso.", pct: 25 }
  },
  actitudinal: {
    anticipacion: { nombre: "Anticipaci�f³n", descripcion: "Reflexi�f³n personal sobre valores y actitudes relacionadas con el �f¡mbito profesional.", pct: 20 },
    construccion: { nombre: "Construcci�f³n",  descripcion: "Trabajo colaborativo, an�f¡lisis de casos �f©ticos, debate argumentado y role-playing.", pct: 50 },
    consolidacion: { nombre: "Consolidaci�f³n", descripcion: "Diario reflexivo, compromiso escrito y retroalimentaci�f³n formativa grupal.", pct: 30 }
  }
};

/** Criterios y descriptores para instrumentos seg�fºn nivel */
const criteriosInstrumento = {
  conocimiento: [
    "Identifica correctamente los conceptos fundamentales del tema",
    "Nombra y define los t�f©rminos t�f©cnicos con precisi�f³n",
    "Enumera los elementos principales seg�fºn el contenido estudiado",
    "Reconoce las caracter�f­sticas esenciales del objeto de estudio",
    "Recuerda y reproduce la informaci�f³n de manera organizada"
  ],
  comprension: [
    "Explica con sus propias palabras el concepto o proceso",
    "Establece relaciones entre los elementos del tema",
    "Distingue las diferencias y similitudes entre conceptos",
    "Interpreta correctamente la informaci�f³n presentada",
    "Resume el contenido conservando las ideas principales"
  ],
  aplicacion: [
    "Ejecuta el procedimiento siguiendo los pasos correctamente",
    "Aplica los conceptos te�f³ricos en situaciones pr�f¡cticas reales",
    "Utiliza las herramientas y recursos de manera adecuada",
    "Resuelve la situaci�f³n planteada de forma efectiva",
    "Produce un resultado que cumple con las especificaciones requeridas"
  ],
  actitudinal: [
    "Muestra disposici�f³n positiva ante los retos del aprendizaje",
    "Respeta las normas de convivencia y trabajo colaborativo",
    "Asume responsabilidad por su propio proceso de aprendizaje",
    "Valora la importancia de la �f©tica profesional en el campo t�f©cnico",
    "Demuestra compromiso y puntualidad en la entrega de trabajos"
  ]
};

/** Estado global de la planificaci�f³n */
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
// --- SECCI�f�?oN: SERVICIOS â�,��?o AN�fLISIS Y GENERACI�f�?oN ---
// ================================================================

/**
 * Analiza el texto del RA y detecta su nivel dominante en Bloom
 * @param {string} texto - Descripci�f³n del RA
 * @returns {string} nivel - 'conocimiento'|'comprension'|'aplicacion'|'actitudinal'
 */
function analizarNivelBloom(texto) {
  const t = texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const puntajes = { conocimiento: 0, comprension: 0, aplicacion: 0, actitudinal: 0 };

  // Puntuar cada nivel seg�fºn verbos encontrados
  for (const [nivel, verbos] of Object.entries(verbosBloom)) {
    for (const verbo of verbos) {
      // Normalizar verbo tambi�f©n
      const vNorm = verbo.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      if (t.includes(vNorm)) {
        puntajes[nivel] += nivel === 'actitudinal' ? 2 : 1; // actitudinal con mayor peso
      }
    }
  }

  // Determinar nivel dominante
  const niveles = Object.entries(puntajes);
  let dominante = niveles.reduce((max, cur) => cur[1] > max[1] ? cur : max, ['aplicacion', 0]);

  // Si no se detect�f³ ning�fºn verbo, inferir por palabras clave
  if (dominante[1] === 0) {
    if (t.includes("desarrollar") || t.includes("construir") || t.includes("producir") || t.includes("implementar")) return 'aplicacion';
    if (t.includes("explicar") || t.includes("comparar") || t.includes("relacionar")) return 'comprension';
    if (t.includes("valorar") || t.includes("comprometer") || t.includes("respetar")) return 'actitudinal';
    return 'aplicacion'; // defecto: aplicaci�f³n para m�f³dulos t�f©cnicos
  }

  return dominante[0];
}

/**
 * Extrae palabras clave del RA para construir los EC
 * @param {string} ra - Descripci�f³n del RA
 * @returns {string[]} palabras clave relevantes
 */
function extraerPalabrasClave(ra) {
  // Palabras a ignorar (stopwords en espa�f±ol)
  const stopwords = new Set(["el","la","los","las","un","una","unos","unas","y","o","de","del","al","en","con","por","para","que","se","su","sus","es","son","ser","esta","este","son","como","mas","m�f¡s","mediante","trav�f©s","a","e","u","las","los","hay"]);
  return ra.toLowerCase()
    .replace(/[.,;:!?()]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 3 && !stopwords.has(w))
    .slice(0, 8);
}

/**
 * Genera los 4 Elementos de Capacidad a partir del RA y criterios
 * @param {string} ra - Descripci�f³n del RA
 * @param {string} criterios - Criterios de referencia (uno por l�f­nea)
 * @param {object} datos - Datos generales para contextualizar
 * @returns {Array} Lista de 4 objetos EC
 */
function generarElementosCapacidad(ra, criterios, datos) {
  const palabrasClave = extraerPalabrasClave(ra);
  const listaCriterios = criterios.split('\n').map(c => c.trim()).filter(c => c.length > 3);
  const modulo = datos.moduloFormativo || 'el m�f³dulo formativo';
  const campo = palabrasClave.slice(0,3).join(', ') || 'los conceptos del m�f³dulo';

  // Construir n�fºcleo tem�f¡tico a partir del RA
  const nucleoTematico = palabrasClave.length > 0
    ? palabrasClave.slice(0, 4).join(' y ')
    : modulo.toLowerCase();

  // Criterio base para usar si no hay criterios de referencia
  const criterio1 = listaCriterios[0] || `los fundamentos de ${campo}`;
  const criterio2 = listaCriterios[1] || `los procedimientos de ${campo}`;
  const criterio3 = listaCriterios[2] || `t�f©cnicas y herramientas de ${campo}`;

  // Determinar el contexto del m�f³dulo para las condiciones
  const contexto = datos.moduloFormativo
    ? `en el contexto de ${datos.moduloFormativo}`
    : 'en situaciones del �f¡mbito t�f©cnico profesional';

  const ec = [
    {
      codigo: 'E.C.1.1.1',
      nivel: 'conocimiento',
      verbo: 'Identificar',
      enunciado: `Identificar los conceptos, principios y caracter�f­sticas fundamentales de ${nucleoTematico}, mediante el an�f¡lisis de materiales curriculares y fuentes t�f©cnicas especializadas, en correspondencia con ${criterio1}.`,
      horasAsignadas: 0,
      secuencia: plantillasSecuencia.conocimiento
    },
    {
      codigo: 'E.C.2.1.1',
      nivel: 'comprension',
      verbo: 'Explicar',
      enunciado: `Explicar los procesos, relaciones y fundamentos te�f³ricos de ${nucleoTematico}, comparando enfoques y t�f©cnicas mediante el an�f¡lisis de casos reales, en correspondencia con ${criterio2}.`,
      horasAsignadas: 0,
      secuencia: plantillasSecuencia.comprension
    },
    {
      codigo: 'E.C.3.1.1',
      nivel: 'aplicacion',
      verbo: 'Aplicar',
      enunciado: `Aplicar los conocimientos y procedimientos de ${nucleoTematico} para resolver situaciones pr�f¡cticas del campo t�f©cnico, utilizando herramientas y t�f©cnicas adecuadas ${contexto}, en correspondencia con ${criterio3}.`,
      horasAsignadas: 0,
      secuencia: plantillasSecuencia.aplicacion
    },
    {
      codigo: 'E.C.4.1.1',
      nivel: 'actitudinal',
      verbo: 'Valorar',
      enunciado: `Valorar la importancia del dominio t�f©cnico y �f©tico de ${nucleoTematico} asumiendo una actitud responsable, colaborativa y comprometida con la calidad del trabajo, demostrando integridad profesional en todas las actividades del m�f³dulo.`,
      horasAsignadas: 0,
      secuencia: plantillasSecuencia.actitudinal
    }
  ];

  return ec;
}

/**
 * Calcula todas las fechas reales de clase entre inicio y fin
 * seg�fºn los d�f­as seleccionados
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
// --- SECCI�f�?oN: SERVICIOS â�,��?o ACTIVIDADES ---
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
  // Distribuir fechas equitativamente entre los 4 EC (m�f¡x 2 por EC)
  const totalFechas = fechasClase.length;
  // Calcular �f­ndices de asignaci�f³n proporcional
  const porcentajes = [0.20, 0.25, 0.40, 0.15]; // mismo que horas
  let cursor = 0;

  listaEC.forEach((ec, idxEC) => {
    // N�fºmero de actividades para este EC (1 o 2)
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
        instrumento: null // se genera despu�f©s
      };
      act.instrumento = generarInstrumento(act, ec.nivel);
      actividades.push(act);
    }
  });

  return actividades;
}

/**
 * Genera los enunciados de actividad seg�fºn el nivel del EC
 */
function obtenerPlantillasActividad(ec) {
  const textoCorto = ec.enunciado.split(',')[0].replace(/^[A-Z�f�f�?��f�f�?o�fš][a-z�f¡�f©�f­�f³�fº]+ /,'').trim();
  const campo = textoCorto.length > 60 ? textoCorto.substring(0, 60) + '...' : textoCorto;

  const mapActividades = {
    conocimiento: [
      `Cuestionario escrito: Identificaci�f³n y definici�f³n de los conceptos clave relacionados con ${campo}`,
      `Elaboraci�f³n de mapa conceptual sobre los fundamentos te�f³ricos de ${campo}`
    ],
    comprension: [
      `Exposici�f³n oral breve: Explicaci�f³n comparativa de los procesos y elementos de ${campo}`,
      `Taller de an�f¡lisis de casos: Interpretaci�f³n y relaci�f³n de conceptos de ${campo}`
    ],
    aplicacion: [
      `Pr�f¡ctica supervisada: Resoluci�f³n de situaci�f³n real aplicando los procedimientos de ${campo}`,
      `Proyecto integrador: Desarrollo y presentaci�f³n de producto t�f©cnico demostrando dominio de ${campo}`
    ],
    actitudinal: [
      `Reflexi�f³n y portafolio: Valoraci�f³n cr�f­tica de la pr�f¡ctica profesional �f©tica en ${campo}`
    ]
  };

  return mapActividades[ec.nivel] || [`Actividad de ${ec.nivel}: ${campo}`];
}

// ================================================================
// --- SECCI�f�?oN: SERVICIOS â�,��?o INSTRUMENTOS ---
// ================================================================

/**
 * Determina y genera el instrumento de evaluaci�f³n para una actividad
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
 * Genera una Lista de Cotejo para actividades de conocimiento/comprensi�f³n
 */
function generarListaCotejo(actividad, nivel) {
  const criterios = criteriosInstrumento[nivel] || criteriosInstrumento.conocimiento;
  return {
    tipo: 'cotejo',
    tipoLabel: 'Lista de Cotejo',
    titulo: `Lista de Cotejo â�,��?o ${actividad.enunciado.split(':')[0]}`,
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
    instrucciones: 'Marque con una â�"�?o en la casilla correspondiente seg�fºn la observaci�f³n del desempe�f±o del estudiante durante la actividad.'
  };
}

/**
 * Genera una R�fºbrica de evaluaci�f³n para actividades de aplicaci�f³n/actitudinal
 */
function generarRubrica(actividad, nivel) {
  const criterios = criteriosInstrumento[nivel] || criteriosInstrumento.aplicacion;
  const niveles = [
    { nombre: 'Excelente',    puntos: 4, clase: 'nivel-excelente',    descripcionSufijo: 'de manera excepcional, superando las expectativas' },
    { nombre: 'Bueno',        puntos: 3, clase: 'nivel-bueno',        descripcionSufijo: 'de manera satisfactoria, cumpliendo las expectativas' },
    { nombre: 'En proceso',   puntos: 2, clase: 'nivel-proceso',      descripcionSufijo: 'de manera parcial, con algunas deficiencias observadas' },
    { nombre: 'Insuficiente', puntos: 1, clase: 'nivel-insuficiente', descripcionSufijo: 'de manera inadecuada, sin alcanzar los criterios m�f­nimos' }
  ];

  return {
    tipo: 'rubrica',
    tipoLabel: 'R�fºbrica de Evaluaci�f³n',
    titulo: `R�fºbrica â�,��?o ${actividad.enunciado.split(':')[0]}`,
    actividad: actividad.enunciado,
    ecCodigo: actividad.ecCodigo,
    niveles,
    criterios: criterios.map((c, i) => ({
      numero: i + 1,
      criterio: c,
      descriptores: niveles.map(n => `${c} ${n.descripcionSufijo}.`)
    })),
    puntajeMax: criterios.length * 4,
    instrucciones: 'Seleccione el nivel de desempe�f±o alcanzado por el estudiante en cada criterio de evaluaci�f³n.'
  };
}

// ================================================================
// --- SECCI�"N: UI �?" RENDERIZADO DE ELEMENTOS DE CAPACIDAD ---
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
// --- SECCI�"N: UI �?" RENDERIZADO DE ACTIVIDADES ---
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
// --- SECCI�"N: UI �?" MODAL DE INSTRUMENTO ---
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
// --- SECCI�"N: UI �?" VISTA PREVIA ---
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
// --- SECCI�"N: EXPORTACI�"N ---
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
// --- SECCI�"N: STORAGE �?" LOCALSTORAGE ---
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
// --- SECCI�"N: UI �?" STEPPER Y NAVEGACI�"N ---
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
// --- SECCI�"N: VALIDACI�"N DE FORMULARIOS ---
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
// --- SECCI�"N: RECOLECCI�"N Y GUARDADO DE DATOS DEL FORMULARIO ---
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
// --- SECCI�"N: ORQUESTADOR PRINCIPAL �?" GENERAR PLANIFICACI�"N ---
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
// --- SECCI�"N: UI �?" HELPERS ---
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
// --- SECCI�"N: INICIALIZACI�"N DE LA APP ---
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
