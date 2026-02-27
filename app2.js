
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
  abrirDashboard();
}

function irAlHomeBase() {
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




// ════════════════════════════════════════════════════════════════════
// GENERAR SESIÓN DIARIA CON GROQ — PROMPT PERSONALIZADO
// ════════════════════════════════════════════════════════════════════
async function _generarSesionConGroq(actId, act, ec) {
  const dg         = planificacion.datosGenerales || {};
  const ra         = planificacion.ra || {};
  const horasAct   = ec ? (ec.horasAsignadas / Math.max(1, (planificacion.actividades||[]).filter(a=>a.ecCodigo===ec.codigo).length)) : 1.5;
  const minTotal   = Math.round((horasAct || 1.5) * 60);
  const minInicio  = Math.round(minTotal * 0.20);
  const minDesarr  = Math.round(minTotal * 0.60);
  const minCierre  = minTotal - minInicio - minDesarr;

  // Botón: estado cargando
  const btn = document.querySelector(`[onclick*="generarSesion('${actId}')"]`);
  if (btn) { btn.disabled = true; btn.innerHTML = '<span class="material-icons" style="font-size:14px;animation:spin 1s linear infinite;">hourglass_top</span> Generando...'; }
  mostrarToast('🧠 Generando sesión personalizada con IA...', 'info');

  const prompt = `dame una planificacion diaria de esta actividad:

MÓDULO: ${dg.moduloFormativo || ''}
FAMILIA PROFESIONAL: ${dg.familiaProfesional || ''}
BACHILLERATO: ${dg.nombreBachillerato || ''}
RESULTADO DE APRENDIZAJE: ${ra.descripcion || ''}
ELEMENTO DE CAPACIDAD (${act.ecCodigo}): ${ec?.enunciado || ''}
NIVEL BLOOM: ${ec?.nivel || ''}
DURACIÓN TOTAL: ${minTotal} minutos
RECURSOS DISPONIBLES: ${ra.recursosDid || 'pizarrón, computadoras, guías de trabajo'}

ACTIVIDAD: ${act.enunciado}

yo necesito:
1er momento. Inicio (${minInicio} minutos): apertura motivadora con pregunta detonante específica al tema, activación de conocimientos previos con preguntas concretas del campo profesional, presentación del objetivo y criterios de evaluación.

2do momento. Desarrollo (${minDesarr} minutos): desarrollo paso a paso con bloques temáticos numerados y tiempos parciales, actividades prácticas específicas al tema, preguntas de verificación de comprensión concretas, dinámicas (individual/parejas/equipos según aplique).

3er momento. Cierre (${minCierre} minutos): síntesis de lo aprendido con pregunta reflexiva específica, evaluación formativa rápida con 2-3 preguntas concretas al tema, tarea/próximo paso si aplica.

Responde SOLO con JSON válido, sin markdown ni explicaciones. Formato exacto:
{
  "apertura": "texto detallado del INICIO con pasos numerados, preguntas concretas al tema y tiempos parciales",
  "encuadre": "propósito específico de la sesión: qué van a aprender, por qué es importante para su perfil profesional y cómo se conecta con el RA",
  "organizacion": "organización pedagógica: individual/grupos, roles, materiales por estudiante, normas de participación específicas para esta actividad",
  "procedimental": "texto detallado del DESARROLLO con bloques numerados (Bloque 1, 2, 3...) con tiempos parciales, pasos específicos, preguntas de verificación concretas al tema",
  "conceptual": "reflexión conceptual: ejemplo real del campo profesional ${dg.familiaProfesional || ''}, cómo aplica en el trabajo diario, pregunta metacognitiva específica",
  "sintesis": "texto detallado del CIERRE con recapitulación de conceptos clave, preguntas de evaluación formativa específicas al tema, tarea concreta si aplica y próximo paso",
  "estrategias": "lista de 3-4 estrategias didácticas usadas con nombre, descripción de cómo se aplican en ESTA sesión y justificación según nivel Bloom: ${ec?.nivel || 'aplicacion'}"
}`;

  try {
    const data = await _llamarGroqConFallback(prompt, 'Generando sesión');
    if (!data) throw new Error('Sin respuesta de Groq');

    // Mapear respuesta al formato interno
    const minSesion = minTotal;
    const tIni = minInicio, tDes = minDesarr, tCie = minCierre;
    const gen = {
      inicio: {
        apertura:     data.apertura     || '',
        encuadre:     data.encuadre     || '',
        organizacion: data.organizacion || ''
      },
      desarrollo: {
        procedimental: data.procedimental || '',
        conceptual:    data.conceptual    || ''
      },
      cierre: {
        sintesis:     data.sintesis || '',
        conexion:     data.conceptual || '',
        proximopaso:  'Continuar con la siguiente actividad del EC.'
      },
      estrategias: data.estrategias || '',
      recursos: ra.recursosDid || 'Material del módulo, pizarrón, guías de trabajo.',
      tiempos: { ini: tIni, des: tDes, cie: tCie }
    };

    // Guardar en sesionIA y en estadoDiarias
    act.sesionIA = data;
    estadoDiarias.sesiones[actId] = gen;
    persistirDiarias();

    // Actualizar textareas en pantalla
    const set = (id, val) => { const el = document.getElementById(id); if (el) el.value = val; };
    set(`pd-inicio-apertura-${actId}`,     gen.inicio.apertura);
    set(`pd-inicio-encuadre-${actId}`,     gen.inicio.encuadre);
    set(`pd-inicio-organizacion-${actId}`, gen.inicio.organizacion);
    set(`pd-desarrollo-proc-${actId}`,     gen.desarrollo.procedimental);
    set(`pd-desarrollo-conc-${actId}`,     gen.desarrollo.conceptual);
    set(`pd-cierre-sintesis-${actId}`,     gen.cierre.sintesis);
    set(`pd-estrategias-${actId}`,         gen.estrategias);
    set(`pd-recursos-${actId}`,            gen.recursos);

    mostrarToast('✅ Sesión generada con IA', 'success');
  } catch(e) {
    console.error('_generarSesionConGroq error:', e);
    mostrarToast('⚠️ Error con IA, usando generación local', 'warning');
    // Fallback a generación local
    const ec2 = (planificacion.elementosCapacidad||[]).find(e=>e.codigo===act.ecCodigo);
    const gen = generarContenidoSesion(act, ec2, horasAct);
    estadoDiarias.sesiones[actId] = gen;
    persistirDiarias();
    const set = (id, val) => { const el = document.getElementById(id); if (el) el.value = val; };
    const s = gen;
    set(`pd-inicio-apertura-${actId}`,     s.inicio.apertura);
    set(`pd-inicio-encuadre-${actId}`,     s.inicio.encuadre);
    set(`pd-inicio-organizacion-${actId}`, s.inicio.organizacion);
    set(`pd-desarrollo-proc-${actId}`,     s.desarrollo.procedimental);
    set(`pd-desarrollo-conc-${actId}`,     s.desarrollo.conceptual);
    set(`pd-cierre-sintesis-${actId}`,     s.cierre.sintesis);
    set(`pd-estrategias-${actId}`,         s.estrategias);
    set(`pd-recursos-${actId}`,            s.recursos);
    mostrarToast('Sesión generada (modo local)', 'info');
  } finally {
    if (btn) { btn.disabled = false; btn.innerHTML = '<span class="material-icons" style="font-size:14px;">auto_awesome</span> Generar'; }
  }
}

function generarSesion(actId) {
  const act = (planificacion.actividades || []).find(a => a.id === actId);
  if (!act) return;
  const ec = (planificacion.elementosCapacidad || []).find(e => e.codigo === act.ecCodigo);
  // Si tiene clave Groq, regenerar con IA directamente (prompt personalizado del usuario)
  if (getGroqKey()) {
    _generarSesionConGroq(actId, act, ec);
    return;
  }
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







        <!-- INSTRUMENTO DE EVALUACION -->
        <div class="pd-instrumento-sect">
          <div class="pd-sec-header" style="background:linear-gradient(135deg,#1B5E20,#2E7D32);color:#fff;border-radius:8px 8px 0 0;padding:10px 14px;margin-top:0;">
            <span class="material-icons">assignment_turned_in</span>
            INSTRUMENTO DE EVALUACION
            <span style="margin-left:auto;font-size:0.78rem;font-weight:400;opacity:0.9;">${act.instrumento ? act.instrumento.tipoLabel : 'Sin instrumento'}</span>
          </div>
          <div style="border:1.5px solid #C8E6C9;border-top:none;border-radius:0 0 8px 8px;padding:16px;">
            ${act.instrumento
              ? (act.instrumento.tipo === 'cotejo'
                  ? renderizarListaCotejoHTML(act.instrumento)
                  : renderizarRubricaHTML(act.instrumento))
              : '<p style=\"color:#9E9E9E;font-size:0.85rem;text-align:center;padding:12px 0;\">No hay instrumento generado para esta actividad.</p>'
            }
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

  mostrarToast('Generando planificaciones con la plantilla del centro...', 'info');

  const {
    Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
    ImageRun, AlignmentType, PageOrientation, BorderStyle, WidthType,
    ShadingType, VerticalAlign, TableLayoutType
  } = docx;

  const dg  = planificacion.datosGenerales || {};
  const ra  = planificacion.ra || {};

  // Cargar logos institucionales (deben estar en la misma carpeta que index.html)
  function fetchImg(url) {
    return fetch(url).then(r => r.arrayBuffer()).then(b => new Uint8Array(b));
  }

  Promise.all([fetchImg('logo1.jpg'), fetchImg('logo2.jpg')])
    .then(([img1, img2]) => _generarDocxDiarias(img1, img2))
    .catch(() => _generarDocxDiarias(null, null));

  function textParas(text, opts) {
    if (!text) text = '\u2014';
    opts = opts || {};
    return String(text).split('\n').map((line, i) => new Paragraph({
      spacing: { before: i === 0 ? 0 : 40, after: 0 },
      children: [new TextRun({
        text: line || ' ',
        font: 'Arial',
        size: opts.size || 20,
        bold: !!opts.bold,
        color: opts.color || '000000'
      })]
    }));
  }

  function mkLabel(text) {
    return new TableCell({
      borders: BDRS, margins: MARG,
      width: { size: COL1, type: WidthType.DXA },
      shading: { fill: 'D9E1F2', type: ShadingType.CLEAR },
      verticalAlign: VerticalAlign.CENTER,
      children: [new Paragraph({ children: [new TextRun({ text: text, bold: true, font: 'Arial', size: 20, color: '1F3864' })] })]
    });
  }

  function mkContent(paras, w) {
    return new TableCell({
      borders: BDRS, margins: MARG,
      width: { size: w || COL2, type: WidthType.DXA },
      children: paras
    });
  }

  function mkMomento(title, mins) {
    return new TableCell({
      borders: BDRS, margins: MARG,
      width: { size: COL1, type: WidthType.DXA },
      shading: { fill: '1F3864', type: ShadingType.CLEAR },
      verticalAlign: VerticalAlign.CENTER,
      children: [
        new Paragraph({ children: [new TextRun({ text: title, bold: true, italics: true, font: 'Arial', size: 20, color: 'FFFFFF' })] }),
        new Paragraph({ children: [new TextRun({ text: mins + ' minutos', font: 'Arial', size: 18, color: 'BDD7EE' })] })
      ]
    });
  }

  function instTexto(inst) {
    if (!inst) return '\u2014';
    var txt = (inst.tipoLabel || '') + ': ' + (inst.titulo || '') + '\n';
    if (inst.tipo === 'cotejo') {
      (inst.criterios || []).forEach(function(c, i) { txt += (i+1) + '. ' + (c.indicador || c) + '\n'; });
    } else if (inst.tipo === 'rubrica') {
      (inst.criterios || []).forEach(function(c, i) {
        txt += (i+1) + '. ' + c.criterio + '\n';
        (c.descriptores || []).forEach(function(d) { txt += '   \u2022 ' + d + '\n'; });
      });
    }
    return txt;
  }

  // Constantes de layout (landscape A4)
  const PAGE_W = 16838, PAGE_H = 11906, MARGIN = 720;
  const TABLE_W = PAGE_W - MARGIN * 2;
  const COL1 = 2700, COL2 = TABLE_W - COL1;
  const MARG = { top: 80, bottom: 80, left: 120, right: 120 };
  const bdr = { style: BorderStyle.SINGLE, size: 4, color: '4472C4' };
  const BDRS = { top: bdr, bottom: bdr, left: bdr, right: bdr };

  function _generarDocxDiarias(img1, img2) {
    const sections = actividades.map(function(act) {
      const s   = estadoDiarias.sesiones[act.id] || {};
      const ti  = (s.tiempos && s.tiempos.ini) || 20;
      const td  = (s.tiempos && s.tiempos.des) || 55;
      const tc  = (s.tiempos && s.tiempos.cie) || 15;
      const tot = ti + td + tc;
      const raW = Math.round(COL2 * 0.68);
      const tW  = COL2 - raW;

      var headerChildren = [];
      if (img1) headerChildren.push(new ImageRun({ data: img1, transformation: { width: 115, height: 48 }, type: 'jpg' }));
      headerChildren.push(new TextRun({ text: '   ', size: 20 }));
      if (img2) headerChildren.push(new ImageRun({ data: img2, transformation: { width: 310, height: 43 }, type: 'jpg' }));

      const headerPara = new Paragraph({ spacing: { after: 0 }, children: headerChildren });

      const titlePara = new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 100, after: 100 },
        children: [new TextRun({ text: 'Matriz de Planificaci\u00f3n Diaria o por Actividad de Aprendizaje', bold: true, italics: true, font: 'Arial', size: 24, color: '1F3864' })]
      });

      const inicio   = s.inicio   || {};
      const desarrollo = s.desarrollo || {};
      const cierre   = s.cierre   || {};

      const tabla = new Table({
        width: { size: TABLE_W, type: WidthType.DXA },
        columnWidths: [COL1, raW, tW],
        layout: TableLayoutType.FIXED,
        rows: [
          new TableRow({ children: [ mkLabel('M\u00f3dulo formativo (MF)'),               mkContent(textParas(dg.moduloFormativo), COL2) ] }),
          new TableRow({ children: [ mkLabel('Nombre del docente'),                         mkContent(textParas(dg.nombreDocente),    COL2) ] }),
          new TableRow({ children: [ mkLabel('Fecha'),                                       mkContent(textParas(act.fechaStr),         COL2) ] }),
          new TableRow({ children: [ mkLabel('Actividad'),                                   mkContent(textParas(act.enunciado),        COL2) ] }),
          // RA + Tiempo (3 columnas)
          new TableRow({ children: [
            mkLabel('Resultado de Aprendizaje (RA)'),
            mkContent(textParas(ra.descripcion), raW),
            new TableCell({
              borders: BDRS, margins: MARG,
              width: { size: tW, type: WidthType.DXA },
              shading: { fill: 'FFF2CC', type: ShadingType.CLEAR },
              verticalAlign: VerticalAlign.CENTER,
              children: [
                new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Tiempo', bold: true, font: 'Arial', size: 20, color: '7F6000' })] }),
                new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: tot + ' minutos', bold: true, font: 'Arial', size: 20, color: 'BF8F00' })] }),
                new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'I:'+ti+' D:'+td+' C:'+tc+' min', font: 'Arial', size: 16, color: '7F6000' })] }),
              ]
            })
          ]}),
          // 1er momento
          new TableRow({ children: [
            mkMomento('1er momento.\nInicio', ti),
            mkContent([
              ...textParas('Apertura:', { bold: true, size: 19, color: '1F3864' }),
              ...textParas(inicio.apertura),
              new Paragraph({ spacing: { before: 60 }, children: [] }),
              ...textParas('Encuadre:', { bold: true, size: 19, color: '1F3864' }),
              ...textParas(inicio.encuadre),
              new Paragraph({ spacing: { before: 60 }, children: [] }),
              ...textParas('Organizaci\u00f3n:', { bold: true, size: 19, color: '1F3864' }),
              ...textParas(inicio.organizacion),
            ], COL2)
          ]}),
          // 2do momento
          new TableRow({ children: [
            mkMomento('2do momento.\nDesarrollo (conceptual, procedimental y/o actitudinal)', td),
            mkContent([
              ...textParas('Procedimental / Actividad principal:', { bold: true, size: 19, color: '1F3864' }),
              ...textParas(desarrollo.procedimental),
              new Paragraph({ spacing: { before: 80 }, children: [] }),
              ...textParas('Conceptual / Actitudinal:', { bold: true, size: 19, color: '1F3864' }),
              ...textParas(desarrollo.conceptual),
            ], COL2)
          ]}),
          // 3er momento
          new TableRow({ children: [
            mkMomento('3er momento.\nCierre', tc),
            mkContent([
              ...textParas('S\u00edntesis:', { bold: true, size: 19, color: '1F3864' }),
              ...textParas(cierre.sintesis),
              new Paragraph({ spacing: { before: 60 }, children: [] }),
              ...textParas('Conexi\u00f3n con el mundo real:', { bold: true, size: 19, color: '1F3864' }),
              ...textParas(cierre.conexion),
              new Paragraph({ spacing: { before: 60 }, children: [] }),
              ...textParas('Pr\u00f3ximo paso:', { bold: true, size: 19, color: '1F3864' }),
              ...textParas(cierre.proximopaso),
            ], COL2)
          ]}),
          new TableRow({ children: [ mkLabel('Estrategia(s) utilizada(s):'),        mkContent(textParas(s.estrategias), COL2) ] }),
          new TableRow({ children: [ mkLabel('Recursos:'),                            mkContent(textParas(s.recursos),    COL2) ] }),
          new TableRow({ children: [ mkLabel('Instrumentos de evaluaci\u00f3n'),      mkContent(textParas(instTexto(act.instrumento)), COL2) ] }),
        ]
      });

      return {
        properties: {
          page: {
            size: { width: PAGE_H, height: PAGE_W, orientation: PageOrientation.LANDSCAPE },
            margin: { top: MARGIN, right: MARGIN, bottom: MARGIN, left: MARGIN }
          }
        },
        children: [headerPara, titlePara, tabla]
      };
    });

    const docObj = new Document({
      styles: { default: { document: { run: { font: 'Arial', size: 20 } } } },
      sections: sections
    });

    Packer.toBlob(docObj).then(function(blob) {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'PlanificacionesDiarias_' + (dg.moduloFormativo || 'modulo').replace(/\s+/g, '_') + '.docx';
      document.body.appendChild(a); a.click();
      document.body.removeChild(a); URL.revokeObjectURL(url);
      mostrarToast('\u00a1Planificaciones exportadas con la plantilla del centro!', 'success');
    }).catch(function(e) {
      console.error(e);
      mostrarToast('Error al generar Word: ' + e.message, 'error');
    });
  }
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
    </div>
      <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:14px;padding-top:12px;border-top:1px solid #E0E0E0;">
        <button class="btn-secundario" onclick="cerrarModalBtn()">Cancelar</button>
        <button class="btn-siguiente" onclick="guardarApiKey()">
          <span class="material-icons">save</span> Guardar clave
        </button>
      </div>
    </div>`;
  _usarFooterDinamico('');
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
    .filter(([_k, v]) => v && v.activo)
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
        try { return { ok: true, data: JSON.parse(jsonMatch[0]) }; } catch (_) {}
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
    secuencia: plantillasSecuencia[ec.nivel] || plantillasSecuencia.aplicacion,
    instrumento: undefined
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
  const mf = document.querySelector('.modal-footer');
  if (mf && !mf.id) mf.id = 'modal-footer';
  // Aplicar preferencias de apariencia antes de mostrar
  _aplicarPreferencias();
  // Mostrar dashboard al iniciar
  setTimeout(() => { abrirDashboard(); actualizarBadgeNotificaciones(); }, 50);
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
  <div class="imp-section" id="imp-sec-curso">
    <div class="imp-section-title"><span class="material-icons">class</span>Curso al que pertenece</div>
    <div class="imp-grid-2">
      <div class="imp-field full" id="imp-curso-field">
        <!-- Se genera dinámicamente en imp_poblarPaso1 -->
      </div>
    </div>
  </div>
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
        ${['lunes','martes','miercoles','jueves','viernes'].map(d => `
          <div class="imp-dia-item">
            <label><input type="checkbox" id="imp-dia-${d}" style="margin-right:4px;">${d.charAt(0).toUpperCase()+d.slice(1)}</label>
            <input type="number" id="imp-hrs-${d}" min="1" max="8" value="2" title="Horas ese día">
            <span style="font-size:0.7rem;color:#9E9E9E;">hrs</span>
          </div>`).join('')}
      </div>
    </div>
  </div>`;
}

function imp_poblarPaso1() {
  const dg = impState.datos.dg;
  const set = (id, val) => { const el = document.getElementById(id); if(el && val !== undefined) el.value = val; };
  // Renderizar selector de curso
  const cf = document.getElementById('imp-curso-field');
  if (cf) {
    const cursos = Object.values(calState.cursos);
    if (cursos.length === 0) {
      cf.innerHTML = '<p style="font-size:0.85rem;color:#78909C;margin:0;">No tienes cursos creados. Podrás asignar esta planificación a un curso desde el <strong>Libro de Calificaciones</strong> después de guardarla.</p>';
    } else {
      const opts = '<option value="">— Sin asignar —</option>' + cursos.map(c =>
        `<option value="${c.id}" ${impState.datos.cursoId === c.id ? 'selected' : ''}>${escHTML(c.nombre)}</option>`
      ).join('');
      cf.innerHTML = '<label>Asignar al curso</label>'
        + '<select id="imp-cursoId" style="padding:8px 12px;border:1.5px solid #90CAF9;border-radius:8px;font-size:0.9rem;width:100%;">' + opts + '</select>'
        + '<p style="font-size:0.75rem;color:#78909C;margin:4px 0 0;">Las actividades de esta planificación aparecerán en el libro de calificaciones de ese curso.</p>';
    }
  }
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
    ['lunes','martes','miercoles','jueves','viernes'].forEach(d => {
      const cfg = dg.diasClase[d];
      if (!cfg) return;
      const cb = document.getElementById('imp-dia-'+d);
      const hr = document.getElementById('imp-hrs-'+d);
      if (cb) cb.checked = cfg.activo;
      if (hr) hr.value = cfg.horas || 2;
    });
  }
}

function imp_leerPaso1() {
  const get = id => { const el = document.getElementById(id); return el ? el.value.trim() : ''; };
  impState.datos.cursoId = document.getElementById('imp-cursoId')?.value || null;
  const diasClase = {};
  ['lunes','martes','miercoles','jueves','viernes'].forEach(d => {
    const cb = document.getElementById('imp-dia-'+d);
    const hr = document.getElementById('imp-hrs-'+d);
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
  if (!dg.nombreDocente)   { mostrarToast('El Nombre del Docente es obligatorio', 'error'); return false; }
  if (!dg.fechaInicio)     { mostrarToast('La Fecha de inicio es obligatoria', 'error'); return false; }
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
        <select id="imp-ra-nivel" onchange="imp_onBloomChange()">
          <option value="conocimiento">Conocimiento – Identificar, Reconocer, Nombrar</option>
          <option value="comprension">Comprensión – Explicar, Describir, Interpretar</option>
          <option value="aplicacion" selected>Aplicación – Aplicar, Demostrar, Ejecutar</option>
          <option value="analisis">Análisis – Analizar, Comparar, Diferenciar</option>
          <option value="evaluacion">Evaluación – Evaluar, Juzgar, Justificar</option>
          <option value="creacion">Creación – Crear, Diseñar, Construir</option>
          <option value="actitudinal">Actitudinal – Valorar, Comprometerse, Respetar</option>
          <option value="otro">Otro (escribir abajo)…</option>
        </select>
        <input id="imp-ra-nivel-otro" placeholder="Especifica el nivel de Bloom…"
          style="display:none;margin-top:6px;" onchange="imp_onBloomOtroChange()">
    </div>
  </div>`;
}

function imp_poblarPaso2() {
  const ra = impState.datos.ra;
  // Resolver bloom personalizado
  if (ra.nivelBloom === 'otro') {
    ra.nivelBloom = document.getElementById('imp-ra-nivel-otro')?.value.trim() || 'otro';
  }
  const set = (id, val) => { const el = document.getElementById(id); if(el && val) el.value = val; };
  set('imp-ra-descripcion', ra.descripcion);
  set('imp-ra-criterios', ra.criterios);
  set('imp-ra-recursos', ra.recursos);
  set('imp-ra-nivel', ra.nivelBloom && ['conocimiento','comprension','aplicacion','analisis','evaluacion','creacion','actitudinal'].includes(ra.nivelBloom) ? ra.nivelBloom : (ra.nivelBloom ? 'otro' : 'aplicacion'));
  if (ra.nivelBloom && !['conocimiento','comprension','aplicacion','analisis','evaluacion','creacion','actitudinal'].includes(ra.nivelBloom)) {
    const otrEl = document.getElementById('imp-ra-nivel-otro');
    if (otrEl) { otrEl.value = ra.nivelBloom; otrEl.style.display = ''; }
  }
}

function imp_leerPaso2() {
  const get = id => { const el = document.getElementById(id); return el ? el.value.trim() : ''; };
  impState.datos.ra = {
    descripcion: get('imp-ra-descripcion'),
    criterios: get('imp-ra-criterios'),
    recursos: get('imp-ra-recursos'),
    nivelBloom: (function() {
      const v = get('imp-ra-nivel');
      return v === 'otro' ? (document.getElementById('imp-ra-nivel-otro')?.value.trim() || 'otro') : v;
    })()
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
            ${['conocimiento','comprension','aplicacion','actitudinal'].map(n =>
              `<option value="${n}" ${ec.nivel===n?'selected':''}>${n.charAt(0).toUpperCase()+n.slice(1)}</option>`
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
  const INST_OPTS = [
    { v: 'cotejo',  l: 'Lista de Cotejo' },
    { v: 'rubrica', l: 'Rúbrica'         },
  ];
  const instSel = (v) => INST_OPTS.map(o =>
    `<option value="${o.v}" ${(act && act.instrumento) === o.v ? 'selected' : ''}>${o.l}</option>`
  ).join('');
  return `<div class="imp-act-row" id="imp-act-${ecIdx}-${actIdx}">
    <div class="imp-act-num">Act.${actIdx+1}</div>
    <textarea rows="2" id="imp-act-enun-${ecIdx}-${actIdx}" placeholder="Describe la actividad de evaluación…"
      onchange="imp_actualizarAct(${ecIdx},${actIdx})">${escHTML((act && act.enunciado) || '')}</textarea>
    <input type="date" id="imp-act-fecha-${ecIdx}-${actIdx}" value="${(act && act.fecha) || ''}"
      onchange="imp_actualizarAct(${ecIdx},${actIdx})" title="Fecha de la sesión">
    <select id="imp-act-inst-${ecIdx}-${actIdx}" onchange="imp_actualizarAct(${ecIdx},${actIdx})"
      title="Instrumento de evaluación" style="font-size:0.78rem;padding:4px 6px;border-radius:6px;border:1.5px solid #90CAF9;">
      ${instSel()}
    </select>
    <input type="number" id="imp-act-valor-${ecIdx}-${actIdx}"
      value="${(act && act.valor) || ''}" min="0.5" max="100" step="0.5" placeholder="pts"
      onchange="imp_actualizarAct(${ecIdx},${actIdx})"
      title="Valor en puntos de esta actividad"
      style="width:52px;font-size:0.78rem;padding:4px 6px;border-radius:6px;border:1.5px solid #90CAF9;text-align:center;">
    <button class="btn-del-act" onclick="imp_eliminarActividad(${ecIdx},${actIdx})" title="Eliminar">
      <span class="material-icons" style="font-size:16px;">close</span>
    </button>
  </div>`;
}

function imp_actualizarEC(i) {
  const ec = impState.datos.ecs[i];
  if (!ec) return;
  ec.codigo = document.getElementById('imp-ec-cod-'+i)?.value.trim() || ec.codigo;
  ec.enunciado = document.getElementById('imp-ec-enun-'+i)?.value.trim() || ec.enunciado;
  ec.nivel = document.getElementById('imp-ec-nivel-'+i)?.value || ec.nivel;
  ec.horasAsignadas = parseFloat(document.getElementById('imp-ec-hrs-'+i)?.value) || ec.horasAsignadas;
}

function imp_actualizarAct(ecIdx, actIdx) {
  if (!impState.datos.actividades[ecIdx]) return;
  const act = impState.datos.actividades[ecIdx][actIdx] || {};
  act.enunciado   = document.getElementById(`imp-act-enun-${ecIdx}-${actIdx}`)?.value.trim() || '';
  act.fecha       = document.getElementById(`imp-act-fecha-${ecIdx}-${actIdx}`)?.value || '';
  act.instrumento = document.getElementById(`imp-act-inst-${ecIdx}-${actIdx}`)?.value || 'cotejo';
  const valRaw    = document.getElementById(`imp-act-valor-${ecIdx}-${actIdx}`)?.value;
  act.valor       = valRaw !== '' && !isNaN(parseFloat(valRaw)) ? parseFloat(valRaw) : null;
  impState.datos.actividades[ecIdx][actIdx] = act;
}

function imp_onBloomChange() {
  const sel = document.getElementById('imp-ra-nivel');
  const inp = document.getElementById('imp-ra-nivel-otro');
  if (!sel || !inp) return;
  inp.style.display = sel.value === 'otro' ? '' : 'none';
  if (sel.value !== 'otro') inp.value = '';
}

function imp_onBloomOtroChange() {
  const inp = document.getElementById('imp-ra-nivel-otro');
  if (impState.datos.ra) impState.datos.ra.nivelBloom = inp?.value.trim() || 'otro';
}

function imp_agregarEC() {
  imp_leerPaso3();
  const n = impState.datos.ecs.length + 1;
  impState.datos.ecs.push({ codigo: 'CE'+n, enunciado: '', nivel: 'aplicacion', horasAsignadas: 2 });
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
  impState.datos.actividades[ecIdx].push({ enunciado: '', fecha: '', instrumento: 'cotejo', valor: null });
  document.getElementById('imp-body').innerHTML = imp_htmlPaso3();
}

function imp_eliminarActividad(ecIdx, actIdx) {
  imp_leerPaso3();
  impState.datos.actividades[ecIdx].splice(actIdx, 1);
  document.getElementById('imp-body').innerHTML = imp_htmlPaso3();
}

function imp_leerPaso3() {
  impState.datos.ecs.forEach((ec, i) => {
    ec.codigo = document.getElementById('imp-ec-cod-'+i)?.value.trim() || ec.codigo;
    ec.enunciado = document.getElementById('imp-ec-enun-'+i)?.value.trim() || '';
    ec.nivel = document.getElementById('imp-ec-nivel-'+i)?.value || 'aplicacion';
    ec.horasAsignadas = parseFloat(document.getElementById('imp-ec-hrs-'+i)?.value) || 2;
    if (!impState.datos.actividades[i]) impState.datos.actividades[i] = [];
    impState.datos.actividades[i].forEach((act, j) => {
      act.enunciado   = document.getElementById(`imp-act-enun-${i}-${j}`)?.value.trim() || '';
      act.fecha       = document.getElementById(`imp-act-fecha-${i}-${j}`)?.value || '';
      act.instrumento = document.getElementById(`imp-act-inst-${i}-${j}`)?.value || 'cotejo';
      const valRaw    = document.getElementById(`imp-act-valor-${i}-${j}`)?.value;
      act.valor       = valRaw !== '' && !isNaN(parseFloat(valRaw)) ? parseFloat(valRaw) : null;
    });
  });
}

function imp_validarPaso3() {
  imp_leerPaso3();
  for (let i = 0; i < impState.datos.ecs.length; i++) {
    if (!impState.datos.ecs[i].enunciado) {
      mostrarToast(`El EC ${i+1} necesita un enunciado`, 'error'); return false;
    }
    const acts = impState.datos.actividades[i] || [];
    if (acts.length === 0) {
      mostrarToast(`El EC ${i+1} debe tener al menos 1 actividad`, 'error'); return false;
    }
    for (let j = 0; j < acts.length; j++) {
      if (!acts[j].enunciado) {
        mostrarToast(`La actividad ${j+1} del EC ${i+1} necesita descripción`, 'error'); return false;
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
  const diasActivos = Object.entries(dg.diasClase || {}).filter(([,v]) => v.activo).map(([k]) => k).join(', ');

  let ecResumen = ecs.map((ec, i) => {
    const aa = (acts[i] || []);
    return `<div style="margin:6px 0 2px;font-size:0.82rem;">
      <span style="font-weight:700;color:#1565C0;">${escHTML(ec.codigo)}</span>
      <span style="color:#616161;"> · ${ec.nivel} · ${ec.horasAsignadas}h</span><br>
      <span style="color:#424242;">${escHTML((ec.enunciado||'').substring(0,80))}${ec.enunciado.length>80?'…':''}</span>
      <span style="font-size:0.75rem;color:#9E9E9E;"> (${aa.length} actividad${aa.length!==1?'es':''})</span>
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
    <div class="imp-resumen-row"><strong>Módulo:</strong><span>${escHTML(dg.moduloFormativo||'—')}</span></div>
    <div class="imp-resumen-row"><strong>Bachillerato:</strong><span>${escHTML(dg.nombreBachillerato||'—')}</span></div>
    <div class="imp-resumen-row"><strong>Familia Profesional:</strong><span>${escHTML(dg.familiaProfesional||'—')}</span></div>
    <div class="imp-resumen-row"><strong>Docente:</strong><span>${escHTML(dg.nombreDocente||'—')}</span></div>
    <div class="imp-resumen-row"><strong>Período:</strong><span>${dg.fechaInicio||'—'} → ${dg.fechaTermino||'—'}</span></div>
    <div class="imp-resumen-row"><strong>Días de clase:</strong><span>${diasActivos||'—'}</span></div>
    <div class="imp-resumen-row"><strong>Horas semanales:</strong><span>${dg.horasSemana||'—'}</span></div>
    <div class="imp-resumen-row"><strong>Valor del RA:</strong><span>${dg.valorRA||'—'} pts</span></div>
  </div>

  <div class="imp-resumen-card">
    <h4><span class="material-icons" style="font-size:16px;">psychology</span>Resultado de Aprendizaje</h4>
    <div style="font-size:0.82rem;color:#424242;line-height:1.5;">${escHTML((ra.descripcion||'—').substring(0,200))}${(ra.descripcion||'').length>200?'…':''}</div>
    <div class="imp-resumen-row" style="margin-top:8px;"><strong>Nivel Bloom:</strong><span>${ra.nivelBloom||'—'}</span></div>
  </div>

  <div class="imp-resumen-card">
    <h4><span class="material-icons" style="font-size:16px;">task_alt</span>${ecs.length} Elemento${ecs.length!==1?'s':''} de Capacidad · ${totalActs} Actividad${totalActs!==1?'es':''}</h4>
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
    secuencia: plantillasSecuencia[ec.nivel] || plantillasSecuencia.aplicacion,
    instrumento: undefined
  }));

  // Construir actividades
  const actividades = [];
  ecs.forEach((ec, ecIdx) => {
    const actsEC = impState.datos.actividades[ecIdx] || [];
    actsEC.forEach((act, actIdx) => {
      const fechaObj = act.fecha ? new Date(act.fecha + 'T12:00:00') : null;
      const fechaStr = fechaObj
        ? fechaObj.toLocaleDateString('es-DO', { weekday:'long', day:'2-digit', month:'long', year:'numeric' })
        : '';
      const actObj = {
        id: `ACT-IMP-${ecIdx+1}-${actIdx+1}-${Date.now()}`,
        ecCodigo: ec.codigo,
        ecNivel: ec.nivel,
        enunciado: act.enunciado,
        fecha: fechaObj ? fechaObj.toISOString() : null,
        fechaStr,
        horas: ec.horasAsignadas,
        valor: act.valor || null,
        _instTipo: act.instrumento || 'cotejo'
      };
      // Generar instrumento con el tipo elegido por actividad
      actObj.instrumento = generarInstrumento(actObj, ec.nivel, act.instrumento || 'cotejo');
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
    fechaGuardadoLabel: ahora.toLocaleDateString('es-DO', { day:'2-digit', month:'long', year:'numeric', hour:'2-digit', minute:'2-digit' }),
    nombre: (dg.moduloFormativo || 'Sin módulo') + ' — ' + (dg.nombreDocente || 'Sin docente'),
    planificacion: planImportada
  };

  const biblio = cargarBiblioteca();
  // Siempre guardar como nueva — mismo módulo puede tener múltiples RA
  biblio.items.unshift(registro);
  mostrarToast('Planificación importada y guardada correctamente', 'success');

  persistirBiblioteca(biblio);

  // Asignar al curso elegido
  const cursoIdElegido = impState.datos.cursoId;
  if (cursoIdElegido && calState.cursos[cursoIdElegido]) {
    const cursoAsig = calState.cursos[cursoIdElegido];
    if (!cursoAsig.planIds) cursoAsig.planIds = [];
    if (!cursoAsig.planIds.includes(id)) {
      cursoAsig.planIds.push(id);
      if (!cursoAsig.planActivaId) cursoAsig.planActivaId = id;
      guardarCalificaciones();
    }
  }
  imp_cerrar();
  renderizarBiblioteca();
}

/** Genera fechas de clase a partir de diasClase + fechaInicio + fechaTermino */
function _generarFechasDesde(dg) {
  if (!dg.fechaInicio || !dg.fechaTermino) return [];
  const DIAS = { lunes:1, martes:2, miercoles:3, jueves:4, viernes:5 };
  const activosDias = Object.entries(dg.diasClase || {})
    .filter(([,v]) => v.activo)
    .map(([k,v]) => ({ dia: DIAS[k], horas: v.horas || 2 }));
  if (activosDias.length === 0) return [];

  const inicio = new Date(dg.fechaInicio + 'T12:00:00');
  const fin = new Date(dg.fechaTermino + 'T12:00:00');
  const result = [];
  const cur = new Date(inicio);
  while (cur <= fin) {
    const dow = cur.getDay(); // 0=dom
    const cfg = activosDias.find(d => d.dia === dow);
    if (cfg) {
      const fechaStr = cur.toLocaleDateString('es-DO', { weekday:'long', day:'2-digit', month:'long', year:'numeric' });
      result.push({ fecha: new Date(cur), fechaStr, horas: cfg.horas });
    }
    cur.setDate(cur.getDate() + 1);
  }
  return result;
}


// ================================================================
// BACKUP: EXPORTAR / IMPORTAR TODOS LOS DATOS
// ================================================================

var _backupFileData = null;

function abrirBackup() {
  _backupFileData = null;
  document.getElementById('backup-overlay').classList.remove('hidden');
  document.getElementById('backup-file-name').textContent = 'Seleccionar archivo .json';
  document.getElementById('backup-preview').classList.add('hidden');
  document.getElementById('backup-preview').innerHTML = '';
  document.getElementById('backup-btn-importar').style.display = 'none';
  document.getElementById('backup-file-input').value = '';

  // Resumen de datos actuales
  const biblio = cargarBiblioteca();
  const nPlans = (biblio.items || []).length;
  const cal = JSON.parse(localStorage.getItem(CAL_STORAGE_KEY) || '{"cursos":{}}');
  const nCursos = Object.keys(cal.cursos || {}).length;
  const diarias = JSON.parse(localStorage.getItem(DIARIAS_KEY) || '{"sesiones":{}}');
  const nSesiones = Object.keys(diarias.sesiones || {}).length;
  const tieneKey = !!getGroqKey();

  document.getElementById('backup-resumen').innerHTML =
    '<div style="background:#F1F8E9;border-radius:8px;padding:10px 12px;display:flex;gap:16px;flex-wrap:wrap;">' +
    '<span><strong>' + nPlans + '</strong> planificacion' + (nPlans !== 1 ? 'es' : '') + '</span>' +
    '<span><strong>' + nCursos + '</strong> curso' + (nCursos !== 1 ? 's' : '') + '</span>' +
    '<span><strong>' + nSesiones + '</strong> sesion' + (nSesiones !== 1 ? 'es' : '') + ' diarias</span>' +
    '<span>' + (tieneKey ? '✓ API Key guardada' : 'Sin API Key') + '</span>' +
    '</div>';
}

function cerrarBackup() {
  document.getElementById('backup-overlay').classList.add('hidden');
}
// ════════════════════════════════════════════════════════════════════
// MÓDULO: CONFIGURACIÓN
// ════════════════════════════════════════════════════════════════════
function abrirConfiguracion() {
  const overlay = document.getElementById('config-overlay');
  if (!overlay) return;
  // Cargar valores guardados en los toggles
  const dark     = localStorage.getItem('cfg_dark_mode')  === 'true';
  const grande   = localStorage.getItem('cfg_fuente_grande') === 'true';
  const alertas  = localStorage.getItem('cfg_alertas') !== 'false';
  const manana   = localStorage.getItem('cfg_manana')  !== 'false';
  const umbral   = localStorage.getItem('asist_umbral') || '80';
  const cfgDark   = document.getElementById('cfg-dark-mode');
  const cfgGrande = document.getElementById('cfg-fuente-grande');
  const cfgAlert  = document.getElementById('cfg-alertas');
  const cfgMan    = document.getElementById('cfg-manana');
  const cfgUmbral = document.getElementById('cfg-umbral-asist');
  if (cfgDark)   cfgDark.checked   = dark;
  if (cfgGrande) cfgGrande.checked = grande;
  if (cfgAlert)  cfgAlert.checked  = alertas;
  if (cfgMan)    cfgMan.checked    = manana;
  if (cfgUmbral) cfgUmbral.value   = umbral;
    overlay.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  const _mf = document.getElementById('modal-footer');
  if (_mf) _mf.style.visibility = 'hidden';
}
function cerrarConfiguracion() {
  document.getElementById('config-overlay')?.classList.add('hidden');
  document.body.style.overflow = '';
  const _mf = document.getElementById('modal-footer');
  if (_mf) _mf.style.visibility = '';
}

function toggleDarkMode(on) {
  localStorage.setItem('cfg_dark_mode', on);
  document.body.classList.toggle('dark-mode', on);
  mostrarToast(on ? 'Modo oscuro activado 🌙' : 'Modo claro activado ☀️', 'success');
}

function toggleFuenteGrande(on) {
  localStorage.setItem('cfg_fuente_grande', on);
  document.body.classList.toggle('fuente-grande', on);
  mostrarToast(on ? 'Fuente grande activada' : 'Fuente normal activada', 'success');
}

function limpiarTodosDatos() {
  localStorage.clear();
  mostrarToast('Todos los datos borrados. Recargando…', 'error');
  setTimeout(() => location.reload(), 1500);
}

function _aplicarPreferencias() {
  if (localStorage.getItem('cfg_dark_mode')     === 'true') document.body.classList.add('dark-mode');
  if (localStorage.getItem('cfg_fuente_grande') === 'true') document.body.classList.add('fuente-grande');
}

// ════════════════════════════════════════════════════════════════════
// MÓDULO: ACERCA DE
// ════════════════════════════════════════════════════════════════════
function abrirAcercaDe() {
  document.getElementById('acercade-overlay')?.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function cerrarAcercaDe() {
  document.getElementById('acercade-overlay')?.classList.add('hidden');
  document.body.style.overflow = '';
}



function exportarDatos() {
  const ahora = new Date();
  const backup = {
    _meta: {
      app: 'El Gran Planificador',
      version: '2.0',
      exportado: ahora.toISOString(),
      exportadoLabel: ahora.toLocaleDateString('es-DO', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    },
    biblioteca:      localStorage.getItem(BIBLIO_KEY)       || '{"items":[]}',
    calificaciones:  localStorage.getItem(CAL_STORAGE_KEY)  || '{"cursos": {}}',
    horario:         localStorage.getItem(HORARIO_KEY)        || '[]',
    tareas:          localStorage.getItem(TAREAS_KEY)         || '[]',
    asistencia:      localStorage.getItem(ASIST_KEY)          || '{}',
    comentarios:     localStorage.getItem(COMENT_KEY)          || '{}',
    notasClase:      JSON.stringify(Object.fromEntries(
      Object.entries(localStorage).filter(([k]) => k.startsWith('notaclase_'))
    )),
    obsEstudiantes:  JSON.stringify(Object.fromEntries(
      Object.entries(localStorage).filter(([k]) => k.startsWith('obs_est_'))
    )),
    diarias:         localStorage.getItem(DIARIAS_KEY)       || '{"sesiones":{}}',
    borrador:        localStorage.getItem(STORAGE_KEY)       || 'null',
    groqKey:         localStorage.getItem(GROQ_KEY_STORAGE)  || ''
  };

  const json = JSON.stringify(backup, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const fecha = ahora.toISOString().slice(0, 10);
  a.href = url;
  a.download = 'backup-planificador-' + fecha + '.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  mostrarToast('Backup descargado correctamente', 'success');
}

function onBackupFileSelected(input) {
  const file = input.files[0];
  if (!file) return;
  document.getElementById('backup-file-name').textContent = file.name;

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const data = JSON.parse(e.target.result);

      // Validar que es un backup válido
      if (!data._meta || !data.biblioteca) {
        mostrarToast('El archivo no parece ser un backup válido', 'error');
        return;
      }

      _backupFileData = data;

      // Generar preview
      const biblio = JSON.parse(data.biblioteca || '{"items":[]}');
      const cal    = JSON.parse(data.calificaciones || '{"cursos":{}}');
      const nPlans = (biblio.items || []).length;
      const nCursos = Object.keys(cal.cursos || {}).length;
      const diariasData = JSON.parse(data.diarias || '{"sesiones":{}}');
      const nSes = Object.keys(diariasData.sesiones || {}).length;

      document.getElementById('backup-preview').innerHTML =
        '<div style="font-weight:700;margin-bottom:6px;color:#0D47A1;">Contenido del backup:</div>' +
        '<div style="display:flex;gap:14px;flex-wrap:wrap;">' +
        '<span>📅 <strong>' + data._meta.exportadoLabel + '</strong></span>' +
        '<span>📁 <strong>' + nPlans + '</strong> planificacion' + (nPlans !== 1 ? 'es' : '') + '</span>' +
        '<span>🏫 <strong>' + nCursos + '</strong> curso' + (nCursos !== 1 ? 's' : '') + '</span>' +
        '<span>📝 <strong>' + nSes + '</strong> sesiones diarias</span>' +
        (data.groqKey ? '<span>🔑 API Key incluida</span>' : '') +
        '</div>';
      document.getElementById('backup-preview').classList.remove('hidden');
      document.getElementById('backup-btn-importar').style.display = 'flex';

    } catch (err) {
      mostrarToast('Error al leer el archivo: ' + err.message, 'error');
    }
  };
  reader.readAsText(file);
}

function importarDatos() {
  if (!_backupFileData) return;

  if (!confirm(
    '¿Restaurar este backup?\n\n' +
    'Esto reemplazará TODOS tus datos actuales (planificaciones, calificaciones y sesiones diarias) ' +
    'con los del archivo seleccionado.\n\n' +
    'Esta acción no se puede deshacer.'
  )) return;

  try {
    const d = _backupFileData;

    if (d.biblioteca)     localStorage.setItem(BIBLIO_KEY, d.biblioteca);
    if (d.calificaciones) localStorage.setItem(CAL_STORAGE_KEY, d.calificaciones);
    if (d.horario)        localStorage.setItem(HORARIO_KEY, d.horario);
    if (d.tareas)         localStorage.setItem(TAREAS_KEY, d.tareas);
    if (d.asistencia)     localStorage.setItem(ASIST_KEY, d.asistencia);
    if (d.comentarios)    localStorage.setItem(COMENT_KEY, d.comentarios);
    if (d.notasClase) {
      try {
        const nc = JSON.parse(d.notasClase);
        Object.entries(nc).forEach(([k,v]) => localStorage.setItem(k, v));
      } catch {}
    }
    if (d.obsEstudiantes) {
      try {
        const obs = JSON.parse(d.obsEstudiantes);
        Object.entries(obs).forEach(([k,v]) => localStorage.setItem(k, v));
      } catch {}
    }
    if (d.diarias)        localStorage.setItem(DIARIAS_KEY, d.diarias);
    if (d.borrador && d.borrador !== 'null') localStorage.setItem(STORAGE_KEY, d.borrador);
    if (d.groqKey)        localStorage.setItem(GROQ_KEY_STORAGE, d.groqKey);

    mostrarToast('¡Datos restaurados correctamente! Recargando...', 'success');
    cerrarBackup();

    // Recargar la página para que todo se inicialice desde localStorage
    setTimeout(() => location.reload(), 1200);

  } catch (err) {
    mostrarToast('Error al restaurar: ' + err.message, 'error');
  }
}

// ================================================================
// DASHBOARD PRINCIPAL
// ================================================================

function abrirDashboard() {
  _mostrarPanel('panel-dashboard');
  renderizarDashboard();
}

function renderizarDashboard() {
  _renderizarSaludo();
  _renderizarAlertas();
  _renderizarClasesHoy();
  _renderizarClasesManana();
  _renderizarTareasProximas();
  _renderizarResumenCursos();
}

// ── Saludo + estadísticas ────────────────────────────────────────
function _renderizarSaludo() {
  const ahora = new Date();
  const DIAS  = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
  const MESES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  const hora  = ahora.getHours();
  const saludo = hora < 12 ? '¡Buenos días' : hora < 18 ? '¡Buenas tardes' : '¡Buenas noches';
  const dg = planificacion.datosGenerales || {};
  const nombre = dg.nombreDocente
    ? ', ' + dg.nombreDocente.trim().split(' ')[0] + '!'
    : '!';
  const fechaStr = DIAS[ahora.getDay()] + ', ' + ahora.getDate() + ' de ' + MESES[ahora.getMonth()] + ' · ' + ahora.getFullYear();

  const biblio   = cargarBiblioteca();
  const nPlans   = (biblio.items || []).length;
  const nCursos  = Object.keys(calState.cursos || {}).length;
  const tareas   = cargarTareas();
  const nPend    = tareas.filter(t => _estadoTarea(t) === 'pendiente').length;
  const nVenc    = tareas.filter(t => _estadoTarea(t) === 'vencida').length;

  // Clases hoy desde horario
  const horario  = cargarHorario();
  const diaHoy   = new Date().getDay(); // 0=Dom…6=Sab
  const diaIdx   = diaHoy === 0 ? -1 : diaHoy - 1; // 0=Lu…4=Vi
  const clasesHoy = diaIdx >= 0 ? horario.filter(e => e.dia === diaIdx && e.materia).length : 0;

  const el = document.getElementById('dash-greeting');
  if (!el) return;
  el.innerHTML = `
    <div class="dash-greeting-left">
      <div class="dash-greeting-date">${fechaStr}</div>
      <div class="dash-greeting-title">${saludo}${nombre}</div>
      <div class="dash-greeting-sub">Sistema de Planificación Educativa · República Dominicana</div>
    </div>
    <div class="dash-stats-row">
      <div class="dash-stat-pill" title="Planificaciones guardadas" onclick="abrirPlanificaciones()" style="cursor:pointer;">
        <div class="dash-stat-icon"><span class="material-icons">folder_special</span></div>
        <div class="dash-stat-num">${nPlans}</div>
        <div class="dash-stat-lbl">Planific.</div>
      </div>
      <div class="dash-stat-pill" title="Cursos activos" onclick="abrirCalificaciones()" style="cursor:pointer;">
        <div class="dash-stat-icon"><span class="material-icons">school</span></div>
        <div class="dash-stat-num">${nCursos}</div>
        <div class="dash-stat-lbl">Cursos</div>
      </div>
      <div class="dash-stat-pill" title="Clases programadas hoy" onclick="abrirHorario()" style="cursor:pointer;">
        <div class="dash-stat-icon"><span class="material-icons">today</span></div>
        <div class="dash-stat-num">${clasesHoy}</div>
        <div class="dash-stat-lbl">Clases hoy</div>
      </div>
      <div class="dash-stat-pill ${nVenc > 0 ? 'stat-alerta' : nPend > 0 ? 'stat-warning' : ''}" title="Tareas pendientes" onclick="abrirTareas()" style="cursor:pointer;">
        <div class="dash-stat-icon"><span class="material-icons">assignment</span></div>
        <div class="dash-stat-num">${nPend + nVenc}</div>
        <div class="dash-stat-lbl">Tareas</div>
      </div>
    </div>`;
}

// ── Alertas inteligentes ─────────────────────────────────────────
function _renderizarAlertas() {
  const el = document.getElementById('dash-alertas');
  if (!el) return;
  const alertas = [];

  // Tareas vencidas
  const tareas = cargarTareas();
  const vencidas = tareas.filter(t => _estadoTarea(t) === 'vencida');
  if (vencidas.length > 0) {
    const grupos = {};
    vencidas.forEach(t => { grupos[t.seccion||'?'] = (grupos[t.seccion||'?']||0)+1; });
    const txt = Object.entries(grupos).map(([s,n]) => `${s} (${n})`).join(', ');
    alertas.push({ tipo: 'error', icono: 'warning', msg: `${vencidas.length} tarea(s) vencida(s): ${txt}`, accion: 'abrirTareas()', label: 'Ver tareas' });
  }

  // Tareas que vencen hoy o mañana
  const hoy = new Date(); hoy.setHours(0,0,0,0);
  const manana = new Date(hoy); manana.setDate(manana.getDate()+1);
  const urgentes = tareas.filter(t => {
    if (!t.fechaLimite || _estadoTarea(t) !== 'pendiente') return false;
    const fl = new Date(t.fechaLimite); fl.setHours(0,0,0,0);
    return fl <= manana;
  });
  urgentes.forEach(t => {
    const fl = new Date(t.fechaLimite); fl.setHours(0,0,0,0);
    const esHoy = fl.getTime() === hoy.getTime();
    alertas.push({
      tipo: 'warning',
      icono: 'schedule',
      msg: `Tarea de ${t.seccion||'?'} vence ${esHoy ? 'HOY' : 'mañana'}${t.horaLimite ? ' a las ' + t.horaLimite : ''}: "${(t.descripcion||'').substring(0,50)}"`,
      accion: 'abrirTareas()', label: 'Ver'
    });
  });

  // Cursos sin planificación asignada
  const _bibIds = new Set((cargarBiblioteca().items||[]).map(i => i.id));
  const cursosSinPlan = Object.values(calState.cursos).filter(c =>
    !(c.planIds||[]).some(pid => _bibIds.has(pid))
  );
  if (cursosSinPlan.length > 0) {
    alertas.push({ tipo: 'info', icono: 'link_off', msg: `${cursosSinPlan.length} curso(s) sin planificación asignada: ${cursosSinPlan.map(c=>c.nombre).join(', ')}`, accion: 'abrirPlanificaciones()', label: 'Asignar' });
  }

  // Actividades sin instrumento
  const biblio = cargarBiblioteca();
  let sinInst = 0;
  (biblio.items||[]).forEach(r => {
    (r.planificacion?.actividades||[]).forEach(a => { if (!a.instrumento) sinInst++; });
  });
  if (sinInst > 0) {
    alertas.push({ tipo: 'info', icono: 'assignment_late', msg: `${sinInst} actividad(es) sin instrumento de evaluación asignado`, accion: 'abrirPlanificaciones()', label: 'Revisar' });
  }

  if (alertas.length === 0) { el.innerHTML = ''; return; }

  el.innerHTML = `<div class="dash-alertas-wrap">` +
    alertas.map(a => `
      <div class="dash-alerta dash-alerta-${a.tipo}">
        <span class="material-icons">${a.icono}</span>
        <span class="dash-alerta-msg">${escapeHTML(a.msg)}</span>
        <button onclick="${a.accion}" class="dash-alerta-btn">${a.label} →</button>
      </div>`
    ).join('') +
  `</div>`;
}

// ── Clases de hoy desde horario ──────────────────────────────────
// ── Clases de hoy y mañana (función genérica) ────────────────────
function _renderizarClasesHoy() {
  _renderizarClasesDia('dash-hoy', 'dash-hoy-fecha', 0);
}
function _renderizarClasesManana() {
  _renderizarClasesDia('dash-manana', 'dash-manana-fecha', 1);
}

function _renderizarClasesDia(contId, fechaLabelId, offsetDias) {
  const cont = document.getElementById(contId);
  if (!cont) return;
  const DIAS  = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
  const MESES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  const target = new Date();
  target.setDate(target.getDate() + offsetDias);
  target.setHours(0,0,0,0);
  const diaJS  = target.getDay();            // 0=Dom…6=Sab
  const diaIdx = diaJS === 0 || diaJS === 6 ? -1 : diaJS - 1; // 0=Lu…4=Vi

  const fechaEl = document.getElementById(fechaLabelId);
  if (fechaEl) fechaEl.textContent = DIAS[diaJS] + ' ' + target.getDate() + ' de ' + MESES[target.getMonth()];

  if (diaIdx < 0) {
    cont.innerHTML = `<div class="dash-empty-card"><span class="material-icons">weekend</span><p>${offsetDias===0?'¡Es fin de semana!':'Mañana es fin de semana 😄'}</p></div>`;
    return;
  }

  const horario = cargarHorario().filter(e => e.dia === diaIdx && e.materia);
  const coloresMateria = _horarioColores();

  if (horario.length === 0) {
    cont.innerHTML = `<div class="dash-empty-card"><span class="material-icons">event_available</span><p>Sin clases programadas.<br><button onclick="abrirHorario()" style="margin-top:8px;background:none;border:1.5px solid #90CAF9;color:#1565C0;border-radius:20px;padding:4px 14px;font-size:0.8rem;cursor:pointer;">Configurar horario</button></p></div>`;
    return;
  }

  horario.sort((a, b) => a.periodo - b.periodo);

  // Buscar actividades de planificaciones para esa fecha
  const planPorSeccion = {};
  const biblio = cargarBiblioteca();
  (biblio.items||[]).forEach(reg => {
    (reg.planificacion?.actividades || []).forEach(act => {
      if (!act.fecha) return;
      // Normalizar act.fecha a ISO string YYYY-MM-DD
      let _fechaISO;
      if (act.fecha instanceof Date) {
        _fechaISO = act.fecha.toISOString().split('T')[0];
      } else {
        const s = String(act.fecha);
        _fechaISO = s.includes('T') ? s.split('T')[0] : s.substring(0,10);
      }
      // Parsear como fecha LOCAL (no UTC) agregando T12:00:00
      const fa = new Date(_fechaISO + 'T12:00:00'); fa.setHours(0,0,0,0);
      if (fa.getTime() === target.getTime()) {
        const cursosConPlan = Object.values(calState.cursos).filter(c => (c.planIds||[]).includes(reg.id));
        cursosConPlan.forEach(c => {
          if (!planPorSeccion[c.nombre]) planPorSeccion[c.nombre] = [];
          planPorSeccion[c.nombre].push({ act, dg: reg.planificacion?.datosGenerales||{}, planId: reg.id });
        });
      }
    });
  });

  const horaActual = offsetDias === 0 ? new Date().getHours() * 60 + new Date().getMinutes() : -1;
  const horasPer = {1:480,2:530,3:600,4:650,5:750,6:800,7:860,8:910};

  cont.innerHTML = horario.map(e => {
    const color  = coloresMateria[e.materia.trim()] || '#78909C';
    const per    = PERIODOS.find(p => p.id === e.periodo);
    const sesiones = planPorSeccion[e.seccion] || [];
    const inicioMin = horasPer[e.periodo] || 0;
    const finMin    = inicioMin + 50;
    const estado = horaActual < 0 ? 'futura'
      : horaActual > finMin ? 'pasada'
      : horaActual >= inicioMin ? 'ahora' : 'futura';

    // Datos para el modal — serializados en data-attrs
    const dataClase = JSON.stringify({
      materia: e.materia, seccion: e.seccion||'', aula: e.aula||'', notas: e.notas||'',
      periodo: e.periodo, hora: per?.hora||'', color,
      sesiones: sesiones.map(s=>({ enunciado: s.act.enunciado||'', actId: s.act.id||'', planId: s.planId||'', instrumento: s.act.instrumento||null, dg: s.dg })),
      fecha: target.toISOString().split('T')[0]
    }).replace(/'/g,'&apos;');

    return `<div class="dash-clase-card" style="--clase-color:${color};opacity:${estado==='pasada'?'0.65':'1'};"
      onclick="abrirModalClase('${encodeURIComponent(dataClase)}')" title="Ver detalles de la clase">
      <div class="dash-clase-barra" style="background:${color};"></div>
      <div class="dash-clase-body">
        <div class="dash-clase-header">
          <span class="dash-clase-periodo">P${e.periodo} · ${per?.hora||''}</span>
          ${estado==='ahora'  ? '<span class="dash-clase-ahora"><span class="material-icons" style="font-size:12px;">fiber_manual_record</span>Ahora</span>' : ''}
          ${estado==='pasada' ? '<span class="dash-clase-pasada">Finalizada</span>' : ''}
        </div>
        <div class="dash-clase-materia" style="color:${color};">${escapeHTML(e.materia)}</div>
        ${e.seccion ? `<div class="dash-clase-seccion"><span class="material-icons" style="font-size:13px;">group</span>${escapeHTML(e.seccion)}</div>` : ''}
        ${e.aula    ? `<div class="dash-clase-aula"><span class="material-icons" style="font-size:13px;">room</span>${escapeHTML(e.aula)}</div>` : ''}
        ${sesiones.length ? sesiones.map(s=>`
          <div class="dash-clase-plan">
            <span class="material-icons" style="font-size:12px;">description</span>
            ${escapeHTML((s.act.enunciado||'').substring(0,52))}${(s.act.enunciado||'').length>52?'…':''}
          </div>`).join('') : ''}
      </div>
      <span class="material-icons dash-clase-chevron" style="color:${color};">chevron_right</span>
    </div>`;
  }).join('');
}

// ── Modal de detalle de clase ────────────────────────────────────
function abrirModalClase(encodedData) {
  let d;
  try { d = JSON.parse(decodeURIComponent(encodedData)); } catch { return; }
  const color = d.color || '#1565C0';

  const FORM_EVAL = [
    { id:'exposicion',    icono:'mic',                label:'Exposición oral' },
    { id:'cuaderno',      icono:'menu_book',           label:'Cuaderno / Portafolio' },
    { id:'participacion', icono:'record_voice_over',   label:'Participación' },
    { id:'practica',      icono:'computer',            label:'Práctica / Lab' },
    { id:'trabajo',       icono:'assignment',          label:'Trabajo escrito' },
    { id:'examen',        icono:'quiz',                label:'Examen / Prueba' },
    { id:'proyecto',      icono:'engineering',         label:'Proyecto' },
    { id:'actitud',       icono:'emoji_people',        label:'Actitud / Comportamiento' },
  ];

  const evalKey  = `eval_${d.fecha}_${d.seccion}_${d.periodo}`;
  const notaKey  = `notaclase_${d.fecha}_${d.seccion}_${d.periodo}`;
  let savedEval  = {};
  let savedNota  = '';
  try { savedEval = JSON.parse(localStorage.getItem(evalKey) || '{}'); } catch {}
  try { savedNota = localStorage.getItem(notaKey) || ''; } catch {}

  const asistData = cargarAsistencia();
  const cursoConSeccion = Object.values(calState.cursos).find(c => c.nombre === d.seccion);
  const asistDia = cursoConSeccion ? ((asistData[cursoConSeccion.id]||{})[d.fecha]||{}) : {};
  const nEst   = cursoConSeccion ? (cursoConSeccion.estudiantes||[]).length : 0;
  const nPres  = Object.values(asistDia).filter(v=>v==='P').length;
  const nAus   = Object.values(asistDia).filter(v=>v==='A').length;
  const nTard  = Object.values(asistDia).filter(v=>v==='T').length;
  const asistRegistrada = nPres + nAus + nTard > 0;

  const sesionInfo = d.sesiones && d.sesiones[0];
  const sesion     = sesionInfo ? (estadoDiarias.sesiones[sesionInfo.actId] || {}) : {};
  const tiempos    = sesion.tiempos || { ini: 20, des: 55, cie: 15 };

  document.getElementById('modal-title').innerHTML =
    `<span style="color:${color};">●</span> ${escapeHTML(d.materia)}
     <span style="font-size:0.78rem;font-weight:400;color:#78909C;margin-left:8px;">P${d.periodo} · ${d.hora}</span>`;

  document.getElementById('modal-body').innerHTML = `
    <div style="display:flex;flex-direction:column;gap:14px;">

      <!-- Info básica -->
      <div class="modal-clase-header" style="border-left:4px solid ${color};padding-left:12px;">
        ${d.seccion ? `<div class="mcl-row"><span class="material-icons">group</span><strong>${escapeHTML(d.seccion)}</strong></div>` : ''}
        ${d.aula    ? `<div class="mcl-row"><span class="material-icons">room</span>${escapeHTML(d.aula)}</div>` : ''}
        ${d.notas   ? `<div class="mcl-row"><span class="material-icons">info</span>${escapeHTML(d.notas)}</div>` : ''}
      </div>

      <!-- Actividad / Planificación -->
      ${sesionInfo ? `
      <div class="mcl-seccion">
        <div class="mcl-titulo"><span class="material-icons">description</span>Actividad planificada</div>
        <div class="mcl-actividad-txt">${escapeHTML(sesionInfo.enunciado)}</div>
        ${sesionInfo.instrumento ? `
        <div class="mcl-instrumento" style="background:${color}18;border-color:${color}44;">
          <span class="material-icons" style="color:${color};">${sesionInfo.instrumento.tipo==='rubrica'?'table_chart':'checklist'}</span>
          <span><strong>${escapeHTML(sesionInfo.instrumento.tipoLabel||'')}</strong>: ${escapeHTML(sesionInfo.instrumento.titulo||'')}</span>
        </div>` : ''}
        <div class="mcl-tiempos">
          <span class="mcl-tiempo ini">Inicio&nbsp;${tiempos.ini}min</span>
          <span class="mcl-tiempo des">Desarrollo&nbsp;${tiempos.des}min</span>
          <span class="mcl-tiempo cie">Cierre&nbsp;${tiempos.cie}min</span>
        </div>
        <!-- Planificación diaria expandida -->
        ${(() => {
          const s = sesion;
          const ini = s.inicio || {};
          const dev = s.desarrollo || {};
          const cie = s.cierre || {};
          if (!ini.apertura && !dev.procedimental && !cie.sintesis) return '';
          return `
          <div class="mcl-sesion-diaria">
            <!-- Toggle header -->
            <button class="mcl-sesion-toggle" onclick="this.parentElement.classList.toggle('mcl-sesion-open')" style="color:${color};border-color:${color}44;">
              <span class="material-icons" style="font-size:15px;">calendar_today</span>
              <strong>Planificación diaria</strong>
              <span class="material-icons mcl-sesion-chevron" style="margin-left:auto;font-size:18px;transition:transform 0.2s;">expand_more</span>
            </button>
            <!-- Contenido colapsable -->
            <div class="mcl-sesion-contenido">
              ${ini.apertura ? `
              <div class="mcl-momento" style="border-left:3px solid #4CAF50;">
                <div class="mcl-momento-hdr" style="color:#2E7D32;"><span class="material-icons">play_circle_filled</span>1er Momento — Inicio (${tiempos.ini} min)</div>
                <div class="mcl-momento-txt">${ini.apertura.replace(/\n/g,'<br>')}</div>
              </div>` : ''}
              ${dev.procedimental ? `
              <div class="mcl-momento" style="border-left:3px solid #2196F3;">
                <div class="mcl-momento-hdr" style="color:#1565C0;"><span class="material-icons">play_circle_filled</span>2do Momento — Desarrollo (${tiempos.des} min)</div>
                <div class="mcl-momento-txt">${dev.procedimental.replace(/\n/g,'<br>')}</div>
              </div>` : ''}
              ${cie.sintesis ? `
              <div class="mcl-momento" style="border-left:3px solid #FF9800;">
                <div class="mcl-momento-hdr" style="color:#E65100;"><span class="material-icons">play_circle_filled</span>3er Momento — Cierre (${tiempos.cie} min)</div>
                <div class="mcl-momento-txt">${cie.sintesis.replace(/\n/g,'<br>')}</div>
              </div>` : ''}
              ${s.estrategias ? `
              <div class="mcl-momento" style="border-left:3px solid #9C27B0;margin-top:4px;">
                <div class="mcl-momento-hdr" style="color:#6A1B9A;"><span class="material-icons">lightbulb</span>Estrategias</div>
                <div class="mcl-momento-txt">${s.estrategias.replace(/\n/g,'<br>')}</div>
              </div>` : ''}
            </div>
          </div>`;
        })()} 
        <button onclick="cerrarModalBtn();abrirDiarias();" class="mcl-btn-link" style="color:${color};border-color:${color}44;">
          <span class="material-icons" style="font-size:14px;">open_in_new</span> Abrir planificación diaria
        </button>
      </div>` : `
      <div class="mcl-seccion" style="background:#F5F5F5;border-radius:8px;padding:12px;text-align:center;color:#9E9E9E;font-size:0.82rem;">
        <span class="material-icons" style="font-size:1.8rem;display:block;margin-bottom:4px;opacity:0.4;">event_note</span>
        Sin actividad planificada para esta fecha.<br>
        <button onclick="cerrarModalBtn();abrirDiarias();" style="margin-top:8px;background:none;border:1.5px solid #90CAF9;color:#1565C0;border-radius:20px;padding:4px 14px;font-size:0.78rem;cursor:pointer;">
          Crear planificación diaria
        </button>
      </div>`}

      <!-- Asistencia rápida -->
      <div class="mcl-seccion">
        <div class="mcl-titulo"><span class="material-icons">how_to_reg</span>Asistencia
          ${asistRegistrada ? `<span style="font-size:0.7rem;background:#E8F5E9;color:#2E7D32;border-radius:10px;padding:2px 8px;margin-left:6px;font-weight:700;">Registrada</span>` : ''}
        </div>
        ${nEst > 0 ? `
        <div class="mcl-asist-resumen">
          <span class="mcl-asist-chip pres"><span class="material-icons">check_circle</span>${nPres} P</span>
          <span class="mcl-asist-chip tard"><span class="material-icons">schedule</span>${nTard} T</span>
          <span class="mcl-asist-chip ause"><span class="material-icons">cancel</span>${nAus} A</span>
          <span style="color:#78909C;font-size:0.75rem;">/ ${nEst} estudiantes</span>
        </div>` : '<p style="font-size:0.8rem;color:#9E9E9E;">Curso sin estudiantes registrados.</p>'}
        <button onclick="cerrarModalBtn();abrirCalificaciones();setTimeout(()=>toggleVistaAsistencia(),300);"
          class="mcl-btn-link" style="color:#00695C;border-color:#B2DFDB;">
          <span class="material-icons" style="font-size:14px;">how_to_reg</span>
          ${asistRegistrada ? 'Ver / editar asistencia' : 'Pasar lista ahora'}
        </button>
      </div>

      <!-- Formas de evaluación -->
      <div class="mcl-seccion">
        <div class="mcl-titulo"><span class="material-icons">star_rate</span>Forma de evaluación</div>
        <p style="font-size:0.75rem;color:#78909C;margin:0 0 10px;">¿Cómo vas a evaluar esta clase?</p>
        <div class="mcl-eval-grid">
          ${FORM_EVAL.map(f => `
          <button class="mcl-eval-btn ${savedEval[f.id]?'activo':''}"
            style="${savedEval[f.id]?`background:${color}18;border-color:${color};color:${color};`:''}"
            onclick="toggleFormaEval('${evalKey}','${f.id}','${color}',this)">
            <span class="material-icons">${f.icono}</span>
            <span>${f.label}</span>
          </button>`).join('')}
        </div>
      </div>

      <!-- Notas rápidas de clase -->
      <div class="mcl-seccion">
        <div class="mcl-titulo">
          <span class="material-icons">edit_note</span>Notas de la clase
          <span id="mcl-nota-guardada" style="margin-left:auto;font-size:0.68rem;color:#9E9E9E;font-weight:400;display:none;">
            <span class="material-icons" style="font-size:11px;vertical-align:middle;">check</span> Guardado
          </span>
        </div>
        <p style="font-size:0.75rem;color:#78909C;margin:0 0 8px;">
          Lo que pasó realmente en clase, observaciones, pendientes para la próxima vez…
        </p>
        <textarea id="mcl-nota-textarea"
          placeholder="Ej: Los estudiantes llegaron tarde. Cubrimos el tema hasta la sección 2. Pendiente: traer material de práctica el jueves..."
          style="width:100%;min-height:110px;padding:10px 12px;border:1.5px solid #E0E0E0;border-radius:9px;
                 font-size:0.85rem;font-family:inherit;resize:vertical;line-height:1.5;
                 transition:border-color 0.15s;box-sizing:border-box;"
          onfocus="this.style.borderColor='${color}'"
          onblur="this.style.borderColor='#E0E0E0'"
          oninput="guardarNotaClaseDebounce('${notaKey}',this.value)"
        >${escapeHTML(savedNota)}</textarea>
        ${savedNota ? `
        <div style="display:flex;justify-content:flex-end;margin-top:6px;">
          <button onclick="borrarNotaClase('${notaKey}')"
            style="background:none;border:none;color:#BDBDBD;font-size:0.72rem;cursor:pointer;display:flex;align-items:center;gap:3px;">
            <span class="material-icons" style="font-size:13px;">delete_outline</span> Borrar nota
          </button>
        </div>` : ''}
      </div>

      <!-- Ir a calificaciones -->
      <button onclick="cerrarModalBtn();abrirCalificaciones();"
        class="mcl-btn-link" style="color:#E65100;border-color:#FFCCBC;width:100%;justify-content:center;">
        <span class="material-icons" style="font-size:15px;">grade</span> Ir al libro de calificaciones
      </button>

    </div>`;

  // botones en body

  document.getElementById('modal-overlay').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

// ── Debounce para guardado de notas de clase ─────────────────────
let _notaDebounceTimer = null;
function guardarNotaClaseDebounce(key, valor) {
  clearTimeout(_notaDebounceTimer);
  const ind = document.getElementById('mcl-nota-guardada');
  if (ind) ind.style.display = 'none';
  _notaDebounceTimer = setTimeout(() => {
    localStorage.setItem(key, valor);
    if (ind) { ind.style.display = 'inline'; }
  }, 600);
}

function borrarNotaClase(key) {
  if (!confirm('¿Borrar la nota de esta clase?')) return;
  localStorage.removeItem(key);
  const ta = document.getElementById('mcl-nota-textarea');
  if (ta) ta.value = '';
  mostrarToast('Nota borrada', 'success');
}

function toggleFormaEval(evalKey, formaId, color, btn) {
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem(evalKey) || '{}'); } catch {}
  saved[formaId] = !saved[formaId];
  localStorage.setItem(evalKey, JSON.stringify(saved));
  const activo = saved[formaId];
  btn.classList.toggle('activo', activo);
  btn.style.background  = activo ? color + '18' : '';
  btn.style.borderColor = activo ? color : '';
  btn.style.color       = activo ? color : '';
}


// ── Tareas próximas (7 días) ─────────────────────────────────────
function _renderizarTareasProximas() {
  const cont = document.getElementById('dash-tareas-proximas');
  if (!cont) return;

  const tareas = cargarTareas();
  const hoy    = new Date(); hoy.setHours(0,0,0,0);
  const en7    = new Date(hoy); en7.setDate(en7.getDate() + 7);

  const proximas = tareas
    .map(t => ({ ...t, _estado: _estadoTarea(t) }))
    .filter(t => {
      if (t._estado === 'entregada') return false;
      if (!t.fechaLimite) return t._estado === 'vencida';
      const fl = new Date(t.fechaLimite); fl.setHours(0,0,0,0);
      return fl <= en7;
    })
    .sort((a, b) => {
      if (!a.fechaLimite) return 1;
      if (!b.fechaLimite) return -1;
      return new Date(a.fechaLimite) - new Date(b.fechaLimite);
    })
    .slice(0, 8); // max 8 en el dash

  if (proximas.length === 0) {
    cont.innerHTML = `<div class="dash-empty-card"><span class="material-icons">task_alt</span><p>Sin tareas pendientes esta semana 🎉</p></div>`;
    return;
  }

  cont.innerHTML = proximas.map(t => {
    const dias = _diasRestantes(t.fechaLimite);
    const estadoCls = { pendiente:'dash-tarea-pend', vencida:'dash-tarea-venc' }[t._estado] || 'dash-tarea-pend';
    let diasStr = '';
    if (t._estado === 'vencida') diasStr = `<span class="dt-dias venc">Vencida</span>`;
    else if (dias === 0) diasStr = `<span class="dt-dias hoy">Hoy</span>`;
    else if (dias === 1) diasStr = `<span class="dt-dias pronto">Mañana</span>`;
    else diasStr = `<span class="dt-dias">En ${dias}d</span>`;

    const horaStr = t.horaLimite ? ` · ${t.horaLimite}` : '';
    const fechaStr = t.fechaLimite
      ? new Date(t.fechaLimite+'T12:00:00').toLocaleDateString('es-DO',{weekday:'short',day:'2-digit',month:'short'}) + horaStr
      : '';

    return `<div class="dash-tarea-row ${estadoCls}">
      <div class="dt-left">
        <span class="dt-seccion">${escapeHTML(t.seccion||'—')}</span>
        <span class="dt-desc">${escapeHTML((t.descripcion||'').substring(0,50))}${(t.descripcion||'').length>50?'…':''}</span>
        ${fechaStr ? `<span class="dt-fecha"><span class="material-icons" style="font-size:11px;">event</span>${fechaStr}</span>` : ''}
      </div>
      <div class="dt-right">
        ${diasStr}
        <button onclick="marcarTareaEntregada('${t.id}')" class="dt-check" title="Marcar entregada">
          <span class="material-icons">check</span>
        </button>
      </div>
    </div>`;
  }).join('');
}

// ── Resumen de cursos ────────────────────────────────────────────
function _renderizarResumenCursos() {
  const cont = document.getElementById('dash-cursos');
  if (!cont) return;

  const cursos = Object.values(calState.cursos || {});
  if (cursos.length === 0) {
    cont.innerHTML = `<div class="dash-empty-card"><span class="material-icons">school</span><p>No hay cursos creados aún.<br><button onclick="abrirCalificaciones()" style="margin-top:8px;background:none;border:1.5px solid #90CAF9;color:#1565C0;border-radius:20px;padding:4px 14px;font-size:0.8rem;cursor:pointer;">Crear curso</button></p></div>`;
    return;
  }

  cont.innerHTML = `<div class="dash-cursos-grid">` + cursos.map(curso => {
    const nEst  = (curso.estudiantes||[]).length;
    const nPlans = (curso.planIds||[]).length;
    const _biblioItems = cargarBiblioteca().items || [];
    // Si planActivaId no existe en biblioteca, buscar la primera de planIds que sí exista
    let planActiva = null;
    if (curso.planActivaId) planActiva = _biblioItems.find(i => i.id === curso.planActivaId);
    if (!planActiva && (curso.planIds||[]).length) {
      for (const pid of curso.planIds) {
        const found = _biblioItems.find(i => i.id === pid);
        if (found) { planActiva = found; curso.planActivaId = pid; break; }
      }
    }
    const modulo = planActiva?.planificacion?.datosGenerales?.moduloFormativo || '—';

    // Calcular promedio general del curso
    let promedioLabel = '—';
    if (nEst > 0 && planActiva) {
      const raKey = Object.keys(curso.ras||{})[0];
      if (raKey) {
        const pf = _promedioFinal(curso);
        if (pf !== null) promedioLabel = pf.toFixed(1);
      }
    }

    // Tareas pendientes para este curso
    const tareasCurso = cargarTareas().filter(t =>
      t.seccion === curso.nombre && _estadoTarea(t) !== 'entregada'
    );
    const nTareasVenc = tareasCurso.filter(t => _estadoTarea(t) === 'vencida').length;
    const nTareasPend = tareasCurso.filter(t => _estadoTarea(t) === 'pendiente').length;

    const statusColor = nTareasVenc > 0 ? '#C62828' : nTareasPend > 0 ? '#E65100' : '#2E7D32';

    return `<div class="dash-curso-card" onclick="abrirCalificaciones()">
      <div class="dash-curso-header">
        <div class="dash-curso-nombre">${escapeHTML(curso.nombre)}</div>
        <div class="dash-curso-dot" style="background:${statusColor};"></div>
      </div>
      <div class="dash-curso-modulo" title="${escapeHTML(modulo)}">${escapeHTML(modulo.substring(0,40))}${modulo.length>40?'…':''}</div>
      <div class="dash-curso-stats">
        <span title="Estudiantes"><span class="material-icons" style="font-size:13px;">group</span>${nEst}</span>
        <span title="Planificaciones"><span class="material-icons" style="font-size:13px;">description</span>${nPlans}</span>
          ${promedioLabel !== '—' ? '<span title="Promedio general"><span class="material-icons" style="font-size:13px;">grade</span>'+promedioLabel+'</span>' : ''}
        ${nTareasPend+nTareasVenc > 0 ? '<span style="color:'+statusColor+';" title="Tareas"><span class="material-icons" style="font-size:13px;">assignment</span>'+(nTareasPend+nTareasVenc)+'</span>' : ''}
      </div>
    </div>`;
  }).join('') + `</div>`;
}

// ════════════════════════════════════════════════════════════════════
  const _mf2 = document.getElementById('modal-footer');
  if (_mf2) _mf2.style.visibility = '';
