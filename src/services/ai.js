/**
 * Servicio de IA para Copiloto ABP
 * Maneja la generación de prompts y el parseo de respuestas.
 */

// Helper para determinar la normativa curricular según el curso
const getCurriculumContext = (curso) => {
  if (!curso) return "Bases Curriculares vigentes del MINEDUC.";
  const lowerCurso = curso.toLowerCase();

  if (lowerCurso.includes('kínder') || lowerCurso.includes('kinder')) {
    return "Nivel Parvularia: Bases Curriculares Decreto 481 (2018).";
  }

  const match = curso.match(/\d+/);
  if (!match) return "Bases Curriculares vigentes del MINEDUC.";

  const nivel = parseInt(match[0]);

  if (lowerCurso.includes('básico') || lowerCurso.includes('basico')) {
    if (nivel <= 6) return "Nivel 1° a 6° Básico: Bases Curriculares Decretos 433 y 439 (2012).";
    return "Nivel 7° Básico a 2° Medio: Bases Curriculares Decretos 614 (2013) y 369 (2015).";
  }

  if (lowerCurso.includes('medio')) {
    if (nivel <= 2) return "Nivel 7° Básico a 2° Medio: Bases Curriculares Decretos 614 (2013) y 369 (2015).";
    return "Nivel 3° y 4° Medio: Bases Curriculares Decreto 193 (2019).";
  }

  return "Bases Curriculares vigentes del MINEDUC.";
};

// Construye el "Mega Prompt" para ser copiado por el usuario
export const buildMegaPrompt = (idea, curso, duracion, asignaturas) => {
  const normativas = getCurriculumContext(curso);

  return `
  ROL: Actúa como un experto en Diseño Universal para el Aprendizaje (DUA) y especialista en el Currículum Nacional de Chile del MINEDUC.
  
  TU TAREA:
  Diseñar una planificación completa para un proyecto escolar basándote EXCLUSIVAMENTE en los siguientes datos y normativa:
  
  CONTEXTO:
  - IDEA / NECESIDADES: "${idea}" (Analiza aquí si el usuario menciona características del curso, estudiantes PIE/NEEP, recursos disponibles o metodología específica).
  - NIVEL EDUCATIVO: ${curso}
  - NORMATIVA APLICABLE: ${normativas}
  - DURACIÓN: ${duracion} semanas
  - ASIGNATURAS INTEGRADAS: ${asignaturas.join(', ')}

  MARCO TEÓRICO: APRENDIZAJE PROFUNDO (MICHAEL FULLAN) - LAS 6C:
  Debes integrar transversalmente estas competencias:
  1. Carácter: Aprender a aprender, resiliencia, autorregulación.
  2. Ciudadanía: Visión global, empatía, sostenibilidad.
  3. Colaboración: Trabajo en equipo, interdependencia positiva.
  4. Comunicación: Claridad, diversas audiencias y herramientas.
  5. Creatividad: Soluciones nuevas, pensamiento emprendedor.
  6. Pensamiento Crítico: Evaluar información, resolver problemas complejos.
  
  REGLAS DE PLANIFICACIÓN (ESTRICTAS):
  1. Filtro de Nivel: Antes de proponer un Objetivo de Aprendizaje (OA), verifica que corresponda estrictamente al nivel y asignatura solicitada según la normativa citada. No mezcles OAs de básica en educación media ni viceversa.
  2. Estructura del OA: Cada OA seleccionado debe incluir su número y el texto íntegro según el documento oficial vigente.
  3. Vinculación: Relaciona el OA con los Indicadores de Evaluación sugeridos por el MINEDUC.
  4. Vigencia Legal: Asegúrate siempre de verificar si la normativa citada sigue vigente.
  5. INTEGRACIÓN 6C: Aunque los OAs son los oficiales, las ACTIVIDADES y la EVALUACIÓN deben estar diseñadas para movilizar las 6C de Fullan. No diseñes actividades de "relleno" o solo memorísticas.
  
  FORMATO DE SALIDA (ESTRICTO):
  Debes responder ÚNICAMENTE con un objeto JSON válido. NO añadidas texto introductorio ni de cierre. El JSON debe seguir EXACTAMENTE esta estructura:
  
  {
    "nombre_proyecto": "Un título creativo y atractivo para el proyecto",
    "problema": "Descripción pedagógica del problema o desafío a resolver",
    "oai": [
      { 
        "asignatura": "Nombre Asignatura 1", 
        "oa": "Número y Texto del OA (ej: OA 3: Analizar...)", 
        "indicadores": ["Indicador 1", "Indicador 2"],
        "oat": ["OAT relacionado"]
      },
      ...
    ],
    "rai": ["Resultado de Aprendizaje Indicador 1", "Resultado de Aprendizaje Indicador 2"],
    "hsxxi": ["Competencia 6C 1 (ej: Carácter - Resiliencia)", "Competencia 6C 2 (ej: Creatividad - Solución de problemas)"],
    "producto_final": "Descripción detallada del artefacto o producto que crearán los estudiantes",
    "pregunta_guia": "¿Pregunta desafiante que impulsa el proyecto?",
    "cronograma": [
      {
        "semana": 1,
        "fase": "Lanzamiento",
        "actividades": "OBLIGATORIO: Tu respuesta para 'actividades' DEBE ser un único string siguiendo este formato EXACTO (usa saltos de línea \\n\\n):\n\n**Asignatura(s) Principal(es)**: [Indica qué asignatura lidera esta semana]\n\n**Inicio (10-15 min)**: DESCRIPCIÓN DETALLADA PASO A PASO. Qué hace el docente para activar y motivar. Qué responden los estudiantes.\n\n**Desarrollo (45 min)**: DESCRIPCIÓN DETALLADA PASO A PASO de la actividad principal. Explica la instrucción, el trabajo de los estudiantes y el rol del docente. Evita generalidades.\n\n**Aplicación (25 min)**: DESCRIPCIÓN DETALLADA de cómo los estudiantes practican o aplican lo aprendido en el contexto del proyecto.\n\n**Cierre (10 min)**: DESCRIPCIÓN DETALLADA de la metacognición, preguntas clave y ticket de salida.",
        "evaluacion": "Tipo de evaluación o instrumento",
        "recursos": "Recursos necesarios",
        "producto_intermedio": "Opcional: entregable de la semana"
      },
      ... (generar una entrada por cada semana de duración)
    ]
  }
  
  INSTRUCCIONES ADICIONALES:
  1. Asegúrate de que las actividades sean coherentes con la metodología ABP.
  2. Integra realmente las asignaturas mencionadas.
  3. El tono debe ser profesional pero motivador para profesores y estudiantes.
  4. NO MARQUES EL JSON CON BLOQUES DE CÓDIGO (markdown), SOLO EL TEXTO PLANO DEL JSON.
  5. VITAL: En las 'actividades', NO seas genérico. NO digas 'analizan un texto'. DI: 'Leen el texto X, subrayan las ideas principales y discuten en parejas la pregunta Y'. SÉ DESCRIPTIVO.
  `;
};

// Construye el prompt para mejorar una sección específica
export const buildImprovementPrompt = (context, currentText, instruction, projectContext) => {
  // Serializar contexto si es objeto
  const contextStr = typeof projectContext === 'object' ? JSON.stringify(projectContext) : projectContext;

  return `
  ACTÚA COMO UN EXPERTO PEDAGOGO.
  TU TAREA: Mejorar el siguiente texto que es parte de un Proyecto ABP.
  
  CONTEXTO DEL PROYECTO:
  ${contextStr}
  
  SECCIÓN A MEJORAR: ${context}
  TEXTO ACTUAL: "${currentText}"
  INSTRUCCIÓN DE MEJORA: "${instruction}"
  
  SALIDA ESPERADA:
  Solo devuelve el texto mejorado. No agregues comillas ni explicaciones extra. Mantenlo directo y listo para usar.
  `;
};

// Construye el prompt para generar la Rúbrica de Evaluación
export const buildRubricPrompt = (projectData) => {
  return `
  ACTÚA COMO UN EXPERTO EN EVALUACIÓN EDUCATIVA.
  
  TU TAREA:
  Crear una Rúbrica de Evaluación Analítica detallada para el siguiente proyecto:
  
  - TÍTULO: "${projectData.nombre_proyecto}"
  - NIVEL: ${projectData.curso || "No especificado"}
  - OBJETIVOS DE APRENDIZAJE: ${JSON.stringify(projectData.oai || [])}
  - PRODUCTO FINAL: "${projectData.producto_final || "No especificado"}"
  - COMPETENCIAS 6C (Fullan): ${JSON.stringify(projectData.hsxxi || [])}
  
  FORMATO DE SALIDA (ESTRICTO JSON):
  Debes responder ÚNICAMENTE con un objeto JSON válido con la siguiente estructura:
  
  {
    "criterios": [
      {
        "nombre": "Nombre del Criterio (ej: Calidad de la Investigación)",
        "peso": "20%",
        "niveles": {
          "excelente": "Descripción de desempeño sobresaliente (7.0)",
          "bueno": "Descripción de desempeño adecuado (5.0 - 6.0)",
          "suficiente": "Descripción de desempeño mínimo (4.0)",
          "insuficiente": "Descripción de desempeño bajo (1.0 - 3.9)"
        }
      },
      ... (Generar entre 5 y 7 criterios variados que cubran proceso, producto, y habilidades blandas)
    ]
  }

  IMPORTANTE:
  - Los criterios deben estar ALINEADOS con las 6C de Michael Fullan (Carácter, Ciudadanía, Colaboración, Comunicación, Creatividad, Pensamiento Crítico).
  - Evalúa tanto el proceso (competencias) como el producto final.
  - Los criterios deben ser específicos y observables.
  - El lenguaje debe ser constructivo.
  - NO uses markdown para el bloque de código, solo el texto plano del JSON.
  `;
};

// Intenta parsear la respuesta del usuario, limpiando texto basura si es necesario
export const parseAIResponse = (responseText) => {
  try {
    // 1. Limpieza básica
    let cleanText = responseText.trim();

    // 2. Extraer JSON de bloques de código markdown si existen (```json ... ```)
    const jsonBlockRegex = /```(?:json)?\s*([\s\S]*?)\s*```/i;
    const match = cleanText.match(jsonBlockRegex);
    if (match) {
      cleanText = match[1];
    }

    // 3. Si no hay bloques, buscar el primer '{' y el último '}'
    const firstBrace = cleanText.indexOf('{');
    const lastBrace = cleanText.lastIndexOf('}');

    if (firstBrace !== -1 && lastBrace !== -1) {
      cleanText = cleanText.substring(firstBrace, lastBrace + 1);
    } else {
      throw new Error("No se encontraron corchetes JSON válidos en el texto.");
    }

    // 4. Parsear
    const parsed = JSON.parse(cleanText);

    // 5. Validación simple de estructura
    const isProject = parsed.nombre_proyecto && parsed.cronograma;
    const isRubric = parsed.criterios && Array.isArray(parsed.criterios);
    const isInstrument = parsed.instrumento && parsed.items; // New validation for instruments

    if (!isProject && !isRubric && !isInstrument) {
      throw new Error("El JSON no tiene la estructura esperada (falta nombre/cronograma, criterios o instrumento).");
    }

    return parsed;
  } catch (error) {
    console.error("Error al parsear JSON:", error);
    throw new Error("No se pudo leer la respuesta de la IA. Asegúrate de copiar solo el bloque JSON. " + error.message);
  }
};

// ============================================================================
// 4. PROMPT: GENERADOR DE INSTRUMENTOS (Clase a Clase) - MEJORADO
// ============================================================================
export const buildInstrumentPrompt = (clase, proyecto) => {
  return `
  ACTÚA COMO UN EXPERTO EVALUADOR EDUCACIONAL, ESPECIALISTA EN EVALUACIÓN FORMATIVA Y AUTÉNTICA.
  
  TU TAREA: Diseñar un instrumento de evaluación preciso, sensible y contextualizado para una sesión específica de un Proyecto ABP.
  
  CONTEXTO DEL PROYECTO:
  - Nombre: "${proyecto.nombre_proyecto}"
  - Nivel Educativo: ${proyecto.curso}
  
  INFORMACIÓN DE LA CLASE A EVALUAR:
  - Fase del Proyecto: ${clase.fase}
  - Actividad Principal: ${clase.actividades}
  - Evaluación Solicitada: ${clase.evaluacion}
  - Producto/Evidencia esperada de esta clase: ${clase.producto_intermedio || clase.producto || "No especificado (inferir de la actividad)"}

  INSTRUCCIONES CLAVE:
  1. ANALIZA PROFUNDAMENTE la "Evaluación Solicitada" y el "Producto Esperado".
     - Si pide "Autoevaluación" o "Coevaluación", dirígete al estudiante ("Me sentí...", "Mi compañero...").
     - Si hay un producto tangible (ej: maqueta, boceto), sugiere una Rúbrica o Lista de Cotejo técnica.
     - Si es una discusión o debate, sugiere una Escala de Apreciación o Registro de Observación.

  2. SELECCIONA EL FORMATO MÁS ADECUADO:
     - "lista_cotejo": Para verificar presencia/ausencia de indicadores.
     - "rubrica": Para evaluar calidad con niveles de desempeño (Excelente, Bueno, etc.).
     - "escala": Para grados de logro (Logrado, Medianamente, Por lograr).
     - "ticket": Preguntas abiertas de metacognición o cierre.
     - "quiz": Preguntas de selección múltiple.

  3. REDACTA LOS ITEMS CON LENGUAJE CERCANO Y ADECUADO A LA EDAD (${proyecto.curso}).
     - Sé específico con lo que se evalúa (evita generalidades como "trabajó bien").
     - Vincula los indicadores DIRECTAMENTE con el contenido de la clase y el proyecto.
     - Si es pertinente, evalúa alguna de las 6C (Colaboración, Comunicación, Pensamiento Crítico, etc.) movilizada en la clase.

  4. TU RESPUESTA DEBE SER ÚNICAMENTE UN JSON CON ESTA ESTRUCTURA EXACTA:

  {
    "instrumento": "Nombre Técnico (ej: Rúbrica Analítica, Autoevaluación de Trabajo en Equipo)",
    "titulo": "Título Creativo para el Estudiante (ej: ¡Revisando mi Progreso!)",
    "instrucciones": "Indicaciones claras y motivadoras para quien responde.",
    "tipo": "rubrica" | "lista_cotejo" | "escala" | "quiz" | "ticket",
    "items": [
      // OPCIÓN A: Para Lista de Cotejo / Escala / Quiz / Ticket
      {
        "pregunta": "Indicador o Pregunta",
        "opciones": ["Sí", "No"] O ["Siempre", "A veces", "Nunca"] O ["A", "B", "C"] (según corresponda)
      },
      // OPCIÓN B: Solo si es "rubrica"
      {
        "criterio": "Nombre del criterio (ej: Creatividad)",
        "niveles": [
            { "nombre": "Excelente", "descripcion": "..." },
            { "nombre": "Regular", "descripcion": "..." },
            { "nombre": "Por mejorar", "descripcion": "..." }
        ]
      }
    ]
  }
  `;
};

// Parser simple para texto mejorado (básicamente limpieza)
export const parseImprovementResponse = (responseText) => {
  return responseText.replace(/^"|"$/g, '').trim(); // Remove surrounding quotes if any
};

// export const generatePlan = async (...) => { ... } -> Removed
// export const improveText = async (...) => { ... } -> Removed
