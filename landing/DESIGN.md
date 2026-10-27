# Landing de Rutas Eficientes: diseño

Construida siguiendo la skill `/awwwards` (github.com/juliobsz/skills). Este archivo guarda el
brief, el concepto y el sistema visual para que los cambios futuros sigan siendo coherentes.

## Fase 0: brief

- **Sujeto:** Rutas Eficientes, aplicación web que calcula el orden óptimo de las paradas de reparto,
  la publica en el teléfono del repartidor y deja constancia de cada entrega.
- **Público:** la cátedra y el jurado del proyecto final, empresas que reparten su propia mercadería,
  quien llega desde el video o el flyer.
- **Trabajo del sitio:** explicar en 3 segundos qué hace el producto, mostrarlo funcionando de verdad
  y llevar a la documentación (inicio rápido, manual, documentación técnica) y al sistema en vivo.
- **Idioma:** español rioplatense.
- **Restricciones:** el cliente original no se nombra en la landing; sin blanco puro (#FFFFFF);
  animaciones llamativas pero serias; equipo con nombres y fotos reales; sitio estático en GitHub
  Pages, sin build (por eso el stack es HTML + CSS + JS con GSAP y Lenis copiados en `js/vendor`).
- **Supuestos:** ninguno inventado. Todos los datos de la escena principal salen de una ruta real
  calculada por el sistema con Google Routes (ver `capturas/geo.js` en la carpeta de trabajo).

## Fase 1: concepto

| | Idea | Ancla | Momento firma | O / F / Fe / P |
|---|---|---|---|---|
| A. Material | La landing es una ruta del día: cinco paradas reales cargadas en un orden; al hacer scroll el orden de carga se desarma y se dibuja el recorrido óptimo | el producto reordena las paradas (`optimizeWaypointOrder`); "el orden que cargaste no es el orden final" (manual, 5.1) | la línea recta en orden de carga se retira, los números de las paradas ruedan a su posición óptima y se dibuja el camino real por las calles | 4 / 5 / 4 / 2 |
| B. Lugar | Carteles de autopista: cada sección es una salida con su distancia | la señalización vial verde de Buenos Aires | el cartel baja del pórtico y muestra la próxima salida | 4 / 3 / 4 / 3 |
| C. Formal | Hoja de ruta impresa: la página es el día de reparto de 8:40 a 13:00 con un reloj | la jornada del repartidor | el reloj avanza con el scroll y cada sección es un horario | 3 / 4 / 5 / 3 |

**Elegido: A.** Es la función central del producto mostrada con datos reales; ningún otro producto
la puede llevar igual. De B se toma la tipografía (Overpass, derivada de la señalización vial).
De C, la línea de estado con datos (paradas, km, tiempo).

```
Idea:        Las paradas del día se reordenan solas en el recorrido más conveniente.
Metáfora:    una hoja de ruta sobre el mapa: pines numerados, una línea de recorrido.
Signature:   escena del hero (pinned/sticky): orden de carga → orden óptimo con la polyline real.
Emoción:     claridad; "ah, eso hace".
Motion verb: reordenar y fijar (las cosas se deslizan a su lugar y se asientan, expo.out).
Screenshot:  el titular grande junto al recorrido verde ya trazado, con 22,7 km · 1 h 44 min.
```

## Fase 2: sistema

**Paleta**
- `ground` #EDF1EE: papel de hoja de ruta, nunca blanco puro.
- `surface` #F6F8F6: marcos de capturas y paneles.
- `ink` #0E1B17: asfalto verde muy oscuro.
- `muted` #4C5B54: texto secundario (≈ 6:1 sobre ground).
- `line` rgba(14, 27, 23, 0.14): filetes.
- `accent` #12A07A para la línea de recorrido y los pines; `accent-ink` #0B6E55 para texto verde (AA).
- `field` #0C3A2E: verde cartel, para la declaración y el pie; tinta sobre field #E6F2EC.

**Tipografía:** Overpass (variable 100 a 900) para todo; Overpass Mono solo para datos
(números de parada, km, minutos, conteos). Display 800, tracking −0.045em, interlineado 0.92.

**Grilla:** 12 columnas, gutter fluido; textos colgados de las columnas 1, 6 y 8.
**Forma:** contenedores con radio 14px (como la app); controles en píldora, igual que en la app.
**Movimiento:** `expo.out` para entradas, `expo.inOut` para la escena; 0.3 a 0.5 s en hovers.

**Composición (una familia por sección)**
```
1 Hero escena    [titular 5 col | mapa de la ruta 7 col, sticky]       estado: km · min · paradas
2 Declaración    [párrafo grande sobre verde cartel, 9 col]
3 Narrativa      [captura sticky 7 col | cuatro capítulos 4 col]      Cargar · Calcular · Publicar · Entregar
4 Índice         [filas de funciones a todo el ancho, ícono de captura; la captura se abre al hacer clic]
5 Par asimétrico [tres teléfonos escalonados | texto 4 col]           En la calle
6 Datos          [cuatro numerales grandes]                            31 · 7 · 3 · 1
7 Preguntas      [grupos 3 col | acordeón 8 col]
8 Equipo         [cinco retratos escalonados]
9 Pie final      [nombre gigante sobre verde cartel, enlaces reales]
```

**Hovers (una solución por rol):** botones con relleno que entra desde el lado del puntero; enlaces
de navegación con una línea que se dibuja como la de un carril; filas del índice que se corren y
muestran un pin; flechas que avanzan en su dirección.

**Capturas del índice (16/10/2026, pedido del usuario):** la captura de cada función ya no aparece
al pasar el mouse. Se abre solo al hacer clic en la fila, en un `<dialog>` (se cierra con la ×, Esc
o clic en el fondo). Al lado de cada título hay un ícono chico de imagen que avisa que hay una
captura. En el teléfono las miniaturas fijas también se sacaron: la fila abre el mismo visor.

**Estado en reposo:** un punto (el vehículo) recorre la ruta óptima en bucle mientras la escena está
en pantalla; se pausa fuera de pantalla y no existe con movimiento reducido.

**Prueba de genericidad:** un modelo genérico habría hecho un hero centrado con un mockup y tres
tarjetas de funciones. Se cambió por una escena con la ruta real, un índice en lugar de tarjetas y
capturas reales del sistema en lugar de ilustraciones.

**Movimiento reducido y sin JS:** la escena muestra directamente el recorrido óptimo, con el orden de
carga como línea punteada tenue; todo el contenido queda visible.
