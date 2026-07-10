# crystalysis-site

Landing mínima + política de privacidad de **Crystalysis** (TrikyGames), para servir en GitHub Pages.

- `index.html` — landing (título, tagline, contacto, link a privacidad). Sirve como "website" de la ficha de Play.
- `privacy.html` — política de privacidad EN + ES. Es la URL que piden AdMob y el formulario Data Safety de Play Console.

## Publicar (pasos manuales, una sola vez)

1. Crear en GitHub un repo **público** llamado `crystalysis-site` (sin README inicial).
2. Desde esta carpeta: `git push -u origin main` (el remote ya está configurado).
3. En GitHub: Settings → Pages → Source: "Deploy from a branch" → Branch `main` / `(root)` → Save.
4. En ~1 min la política queda en:
   **https://trikyname.github.io/crystalysis-site/privacy.html**
   y la landing en **https://trikyname.github.io/crystalysis-site/**

Esa URL de privacy es la que se pega en: Play Console (Store listing → Privacy policy), el formulario
Data Safety, y la configuración de AdMob si la pide.
