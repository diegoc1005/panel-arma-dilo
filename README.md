# Panel Arma-dilo 🦔
**Sistema de Gestión de Pago de Honorarios** — Equipo 6 · Ingeniería de Software · 5to semestre

---

## ¿Qué incluye el panel?

| Sección | Descripción |
|---------|-------------|
| **Dashboard** | Avance general, progreso por integrante, actividad reciente |
| **Kanban** | Tablero con columnas Por hacer / En progreso / En revisión / Hecho |
| **Tareas** | Lista filtrable con búsqueda, ordenamiento y tabla completa |
| **Historial** | Registro de todos los cambios y comentarios |
| **Equipo** | Vista por integrante con estadísticas y tareas |

## Cómo correr el panel

```bash
npm install
npm run dev
```

Abre http://localhost:5173

## Cambiar de usuario

En la barra lateral hay un selector de usuario. Cada integrante puede seleccionar su nombre para que los cambios queden registrados con su identidad.

## Datos

Los datos se guardan en `localStorage` del navegador. Cada navegador/computadora tiene su propia copia.

### Para sincronizar en tiempo real (Supabase)

1. Crear cuenta gratis en https://supabase.com
2. Crear un proyecto nuevo
3. Copiar la URL y la clave anon del proyecto
4. Renombrar `.env.example` a `.env` y pegar los valores:

```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=tu-clave-aqui
```

## Equipo

| Nombre | Rol |
|--------|-----|
| Córdova García Diego | Project Manager |
| Frías Hernández Edmond Antonio | Arquitecto de Software |
| Alfaro Carreto Irving Alberto | Analista de Requerimientos |
| Robles Cancino Arturo Andres | Programador |
| Gutiérrez Martínez Esmeralda Rubí | Diseñadora |
| Hernández Garcés Abigail | Tester |

**Fecha de entrega:** 5 de diciembre de 2026  
**Profesor:** Marco Antonio Delgado
