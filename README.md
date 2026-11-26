# Browine 🧡💧

App de hidratación con un carpincho (capibara) surfista. Cada bebida que registras llena la silueta del carpincho con el color de esa bebida; cuando cumples tu meta, el carpincho aparece a todo color.

**Todos los gráficos y animaciones están hechos con código**: SVG generado en JavaScript, animaciones CSS, Web Animations API y un motor de partículas en `<canvas>`. Las únicas imágenes son los iconos PNG de la app, que se generan a partir de ese mismo dibujo.

## Instalarla en el teléfono

Versión publicada con GitHub Pages (rama `main`): **https://8nrhgj9r25-source.github.io/Claudecod/**

- **iPhone:** abre el enlace en Safari → Compartir → "Añadir a pantalla de inicio" → Añadir.
- **Android (Chrome):** menú ⋮ → "Instalar app".

La app instalada se abre a pantalla completa, funciona sin conexión y guarda los datos en el teléfono. La propia app muestra estas instrucciones la primera vez que la abres en Safari.

## Ejecutar en local

Es una web app (PWA) sin dependencias ni compilación:

```bash
python3 -m http.server 8000
# abre http://localhost:8000 (mejor en vista de móvil)
```

Los iconos PNG se generan a partir del carpincho dibujado en `js/art.js`: `node tools/make-icons.js` (necesita Playwright).

## Pantallas y flujo

| Pantalla | Qué hace |
| --- | --- |
| **Splash** | El carpincho cae sobre su tabla y aparecen las letras de "Browine". |
| **Inicio** | Contador (`385ml · Hidratación · 17% de tu meta`). Al tocarlo cambia a "Restantes" y muestra al carpincho a color. Silueta que se llena por capas de colores con olas animadas y burbujas; la tabla flota sobre el mar. Insignia de racha con anillo de progreso (se abre en "1 día"). |
| **Fila de bebidas** | Personaje, 12 bebidas (agua, té verde, café, jugo, smoothie, leche, agua de coco, refresco, bebida energética, cerveza, vino, licor fuerte) y "Agregar o editar". |
| **Agregar bebida** | El recipiente sale del icono que tocaste. Arrastra hacia arriba o abajo para cambiar la cantidad (de 10 en 10 ml, y el líquido se mueve). Tamaño anterior/siguiente, info de hidratación (`···`). Al confirmar, el vaso vuela hacia el carpincho, salpica y la capa sube. Toast con "Deshacer". |
| **Alcohol** | Resta hidratación (cerveza −60 %, vino −160 %, licor −320 %) y deja una franja de su color. |
| **Meta cumplida** | El carpincho salta, hay confeti, sube la racha y se desbloquea un personaje nuevo. |
| **Valoración** | Ventana "¿Te gusta Browine?" con estrellas animadas (después de la 2.ª bebida). |
| **Configuración inicial** | Tarjeta 1/3 (recordatorios, widget, objetivo) y la píldora flotante "Finaliza tu configuración". |
| **Desafíos** | Desafío por tiempo limitado, consejos de hoy (carrusel) y 6 desafíos de hábitos con pantalla de detalle, progreso por días y "Comenzar ahora". |
| **Colección** | 33 carpinchos con accesorios (naranja, lentes, flor, gorro, corona…), botón "Mezclar" y cuadrícula "Diario". |
| **Menú** | Recordatorios (notificaciones reales, reloj despertador animado), objetivo recomendado (peso / actividad / clima), historial de hoy, editar bebidas, widgets (tutorial con pestañas), icono de la app (cambia el favicon), hora de reinicio, calorías, ml/oz, compartir y borrar. |

## Estructura

```
index.html            estructura de pantallas
css/styles.css        estilos y animaciones de la interfaz
js/art.js             ilustraciones en SVG: carpincho, accesorios, tabla, 9 recipientes, iconos, reloj y teléfono con widgets
js/data.js            bebidas, personajes, desafíos y consejos
js/app.js             estado (localStorage), animación del líquido, partículas y todas las pantallas
sw.js / manifest      PWA sin conexión y avisos
icon.svg, *.png       iconos generados con tools/make-icons.js
.nojekyll             GitHub Pages publica los archivos tal cual
```
