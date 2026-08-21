# Web de la Notaría Pedro García de los Huertos Sánchez

Sitio estático (HTML + CSS + JS, sin dependencias ni compilación) pensado para GitHub Pages.

## Archivos

```
index.html            Inicio (hero, servicios, CTA, FAQ)
que-hacemos.html      Servicios en desplegables, con anclas (#herencias, #hipotecas…)
quienes-somos.html    El notario + Nuestra filosofía
donde-estamos.html    Mapa y datos de la notaría
contacto.html         Formulario de contacto + datos
aviso-legal.html      Aviso legal (borrador, revisar)
privacidad.html       Política de privacidad (borrador, revisar)
cookies.html          Política de cookies (borrador, revisar)
assets/css/styles.css Todo el diseño
assets/js/main.js     Menú móvil, ventana emergente, formularios, mapa
```

La cabecera y el pie están repetidos en cada archivo (así funciona un sitio estático).
Si cambias un enlace del menú, cámbialo en los ocho HTML.

## Antes de publicar

1. **Clave del formulario.** Entra en https://web3forms.com, pon el email de la notaría y te dan una *access key* al momento. Ábrela en `assets/js/main.js` y sustituye `TU_ACCESS_KEY_AQUI`. Hasta que lo hagas, el formulario avisa en pantalla en vez de fallar en silencio.
2. **Datos de contacto.** Busca y reemplaza en los ocho HTML:
   - `981 00 00 00` y `+34981000000` → teléfono real
   - `info@notariagarciadeloshuertos.es` → email real
   - Horario: las dos líneas que empiezan por `Lunes a jueves` y `Viernes`
3. **FAQ del inicio.** En `index.html` hay cinco bloques `<details id="faq-1">` … `faq-5`. Dentro de cada uno, sustituye el párrafo con clase `placeholder` por la respuesta.
4. **Textos legales.** Los tres archivos legales son un borrador orientativo con `[COMPLETAR]` en el NIF. Que los valide tu hermano antes de publicar.
5. **Dominio.** Si usas dominio propio, cambia `https://www.notariagarciadeloshuertos.es` en las etiquetas `canonical` y `og:url` de cada página, y crea un archivo `CNAME` con el dominio dentro.

## Publicar en GitHub Pages

```bash
git init
git add .
git commit -m "Web de la notaría"
git branch -M main
git remote add origin https://github.com/USUARIO/REPO.git
git push -u origin main
```

En el repositorio: **Settings → Pages → Source: Deploy from a branch → main / (root)**.
En un par de minutos estará en `https://USUARIO.github.io/REPO/`.

Para dominio propio: en Pages, apartado *Custom domain*, escribe el dominio y activa
*Enforce HTTPS*. En tu proveedor de dominio, apunta los registros `A` a las IP de
GitHub Pages (185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153) o
un `CNAME` a `USUARIO.github.io` si usas subdominio `www`.

## Notas de diseño

- Color de marca: Pantone 300 C ≈ `#005EB8`, definido en `:root` de `styles.css` como `--brand`.
- Todos los colores y tipografías salen de variables CSS en las primeras líneas del archivo.
- Tamaño de letra base 17 px y contrastes por encima de AA (WCAG 2.1) para lectura cómoda.
- El mapa de Google no se carga hasta que el visitante pulsa el botón, para no instalar
  cookies de terceros sin consentimiento.
