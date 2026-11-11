-- Actualizar descripciones de tareas con detalle de plantillas del profesor

-- IRVING — SRS ISO 29148
UPDATE tasks SET description =
'Elaborar el documento SRS completo siguiendo la plantilla ISO/IEC/IEEE 29148:2018.

SECCIONES REQUERIDAS:
• Información del documento (nombre, versión, estado, clasificación, fecha)
• Historial de versiones
• Tabla de aprobaciones (líder, analista, cliente)
• 1. Propósito: nombre del software, versión, objetivo
• 1.1 Alcance del documento
• 2. Referencias (tabla con ID, título, fuente, versión/fecha)
• 3. Descripción general: alcance, beneficios/objetivos, funcionalidades principales, supuestos (SUP-XXX)
• 4. Clases y características de usuarios (tipo, permisos, características, funcionalidades)
• 5. Entorno operativo: hardware mínimo y recomendado / software (SO, navegadores, APIs)
• 6. Requerimientos funcionales — formato RF-XXX con: descripción, criterios de aceptación, prioridad MoSCoW, dependencias, origen, observaciones
• 6.1 Matriz de trazabilidad de requerimientos
• 7. Requerimientos no funcionales: usabilidad, rendimiento, espacio, confiabilidad, seguridad, mantenibilidad, portabilidad, ambientales, regulatorios
• 8. Glosario (SRS, RF, RNF, MoSCoW, Stakeholder, términos del proyecto)'
WHERE title = 'SRS completo apegado a ISO 29148';

-- ESMERALDA + ABIGAIL — Análisis heurístico
UPDATE tasks SET description =
'Realizar el análisis heurístico de usabilidad sobre los prototipos de Figma del sistema.

ESTRUCTURA POR CADA PRINCIPIO (adjuntar captura de pantalla):
1. Visibilidad del estado del sistema — ¿la plataforma informa al usuario qué está pasando?
2. Coincidencia sistema/mundo real — ¿el lenguaje es comprensible para no expertos?
3. Control y libertad del usuario — ¿se pueden deshacer/cancelar acciones?
4. Consistencia y estándares — ¿los elementos son consistentes en toda la interfaz?
5. Prevención de errores — ¿el sistema previene errores antes de que ocurran?
6. Reconocimiento en lugar de recordar — ¿minimiza la carga cognitiva del usuario?
7. Flexibilidad y eficiencia — ¿permite a usuarios expertos trabajar más rápido?
8. Diseño estético y minimalista — ¿la interfaz es limpia sin distracciones?
9. Recuperación de errores — ¿los mensajes de error son claros y orientados a la acción?
10. Ayuda y documentación — ¿ofrece ayuda contextual cuando el usuario la necesita?

Por cada principio: evaluación, problemática detectada, recomendación + CAPTURA.'
WHERE title = 'Análisis heurístico de usabilidad (10 principios)';

UPDATE tasks SET description =
'Colaborar con la diseñadora en el análisis heurístico de los 10 principios de Nielsen sobre los prototipos Figma.

RESPONSABILIDAD: Revisar los principios 5 al 10 (Prevención de errores, Reconocimiento, Flexibilidad, Diseño minimalista, Recuperación de errores, Ayuda y documentación). Por cada uno: evaluación, problemática, recomendación y captura de pantalla del prototipo.'
WHERE title = 'Apoyo en análisis heurístico de usabilidad';

-- EDMOND — Arquitectura de software
UPDATE tasks SET description =
'Elaborar el documento de Definición de Arquitectura del Sistema.

SECCIONES REQUERIDAS:
1. IDENTIFICACIÓN DEL ASPECTO CRÍTICO
   Describir el principal atributo de calidad que condiciona la elección (seguridad, rendimiento, disponibilidad, escalabilidad, mantenibilidad). Justificar con el contexto del proyecto de gestión de honorarios.

2. ARQUITECTURA PROPUESTA
   Indicar el estilo arquitectónico seleccionado: multicapa, cliente-servidor, MVC, PAC, Microkernel, etc. Señalar número de capas o componentes principales.

3. JUSTIFICACIÓN (tabla):
   • Decisión: qué se eligió
   • Contexto: por qué era necesario decidir
   • Alternativas consideradas: qué otras opciones se evaluaron y por qué se descartaron
   • Consecuencias: qué se gana y qué se sacrifica

4. VENTAJAS PARA EL PROYECTO (3-5 ventajas específicas, no genéricas, vinculadas al aspecto crítico)

5. ASPECTOS A VIGILAR EN EL DESARROLLO (riesgos y puntos de control)'
WHERE title = 'Definición y justificación de arquitectura propuesta';

-- DIEGO — Presupuesto general
UPDATE tasks SET description =
'Coordinar y consolidar el cálculo de presupuesto completo del proyecto.

RUBROS A INCLUIR (plantilla Excel del profesor):
MANO DE OBRA (horas por mes × costo unitario):
  • Analista de requerimientos
  • Arquitecto de software
  • Programador
  • Tester
  • Project Manager

HARDWARE (por equipo):
  • Cantidad, costo unitario, vida útil (años), depreciación anual, depreciación mensual, duración del proyecto → costo total

SOFTWARE (por licencia):
  • Cantidad, costo unitario, vida útil, amortización mensual → costo total

SERVICIOS (por servicio):
  • Energía eléctrica, internet, otros → costo mensual × duración

TOTALES:
  • Total operativo (Hardware + Software + Servicios)
  • Salarios
  • Subtotal
  • Imprevistos (15%)
  • Contingencia (10%)
  • TOTAL GENERAL'
WHERE title = 'Estimación de costos generales';

-- ARTURO — Presupuesto individual
UPDATE tasks SET description =
'Calcular el costo de recurso humano individual como Programador.

DIMENSIONES A CONTEMPLAR (vistas en clase):
• Horas trabajadas por mes (distribución a lo largo del proyecto)
• Costo unitario por hora como Programador
• Meses activos en el proyecto
• Total de horas × costo unitario = costo total del rol

Referencia del presupuesto general: el Programador trabaja ~840 horas totales a $142.86/hr ≈ $120,000 MXN.
Ajusta según lo visto en clase y los datos reales del equipo.'
WHERE title = 'Estimación de costos individual (RH)' AND assignee_id = 4;

-- ABIGAIL — Presupuesto individual
UPDATE tasks SET description =
'Calcular el costo de recurso humano individual como Tester.

DIMENSIONES A CONTEMPLAR (vistas en clase):
• Horas trabajadas por mes (distribución a lo largo del proyecto)
• Costo unitario por hora como Tester
• Meses activos en el proyecto
• Total de horas × costo unitario = costo total del rol

Referencia del presupuesto general: el Tester trabaja ~240 horas totales a $93.75/hr ≈ $22,500 MXN.
Ajusta según lo visto en clase y los datos reales del equipo.'
WHERE title = 'Estimación de costos individual (RH) - Tester';

-- DIEGO — Estudio de factibilidad
UPDATE tasks SET description =
'Coordinar la elaboración del estudio de factibilidad completo del sistema de gestión de honorarios.

ESTRUCTURA Y RESPONSABLES:
1. Resumen Ejecutivo — Diego (PM): descripción del proyecto, qué evalúa el estudio
2. Factibilidad Técnica — Edmond + Arturo: tecnologías, RH necesario, riesgos técnicos, conclusión
3. Factibilidad Económica — Diego (PM): costos estimados, ingresos/ahorros proyectados, ROI
4. Factibilidad Operativa — Irving + Abigail: recursos, impacto organizacional, riesgos operativos
5. Factibilidad Legal — Abigail: normativas aplicables (LFPDPPP en México), riesgos legales
6. Factibilidad de Tiempo — Diego (PM): duración estimada, hitos clave, cronograma, riesgos de tiempo
7. Conclusión General — Diego (PM)

NOTA: Adaptar el ejemplo del profesor a un Sistema de Gestión de Pago de Honorarios universitario.'
WHERE title = 'Coordinar estudio de factibilidad general';
