# crystalysis-site

La web pública de **Crystalysis** en GitHub Pages: https://trikyname.github.io/crystalysis-site/
Un push a `main` publica.

- `index.html`: la landing (arena del menú del juego, tráiler, capturas, qué trae, dónde jugar). Es
  el "website" de las fichas de Play y Steam.
- `press.html`: el kit de prensa, EN y ES en la misma página (ficha técnica, descripción, tráiler,
  capturas, logos, condiciones).
- `privacy.html` y `delete-data.html`: superficies legales que piden las tiendas. La URL de
  `privacy.html` es la que está en Play Console, el formulario Data Safety y AdMob.
- `site.css`: fuente (Space Grotesk, en `fonts/` con su licencia OFL) y tokens del juego, compartidos.
- `arena.js`: el campo de triángulos del menú del juego, con el cristal que se rompe.
- `PRODUCT.md`: para quién es la web, qué no se promete y de dónde salen los textos.

## Cambiar una tienda de estado

En `index.html`, cada tienda es un `<li>` de `#stores` con `data-state`:

- `live`: sale con enlace. La primera `live` es el botón grande de la portada.
- `soon`: sale con «Coming soon», sin enlace, y la portada la anuncia debajo del botón.
- `off`: no sale.

Para abrir una, se pone `data-state="live"` y se mete el enlace dentro de su `.go` (Steam lleva un
comentario con el suyo). En `press.html` la ficha técnica dice el estado de cada plataforma en prosa:
se cambia a mano en EN y en ES.

## Textos

Toda frase sobre el juego se comprueba contra el GDD, el código o la tabla de localización del repo
del juego antes de publicarla; la última copia larga verificada es el *About* de Steam. La
divulgación de IA copia la de Steam (`.docs/reference/store-listing-copy.md` §12.1 en el repo del
juego).

## Ver en local

`python -m http.server 8765 --bind 127.0.0.1` en esta carpeta y abrir http://127.0.0.1:8765/.
