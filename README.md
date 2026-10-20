# Cabinet Monnet & Foujols — site statique

Version statique (HTML / CSS / JavaScript, sans WordPress ni jQuery) de
https://cabinet.psy-monnet-foujols.com/, migrée depuis le site WordPress / Oxygen.

## Structure

```
index.html                  Accueil
<page>/index.html           Une page par URL d'origine (adresses conservées à l'identique)
author/ category/ tag/      Redirections vers le blog (/actualites-psy/)
assets/css/                 CSS Oxygen d'origine + wp.css, cookies.css, fonts.css, site.css
assets/css/oxygen/          CSS propres à chaque modèle de page Oxygen
assets/js/main.js           Menu mobile, galerie photo, bandeau cookies + Google Analytics
assets/fonts/               Montserrat (hébergée localement, conforme RGPD)
assets/img/                 Images (ex-wp-content/uploads)
sitemap.xml, robots.txt
```

## Tester en local

```bash
python3 -m http.server 8080
```

Puis ouvrir http://localhost:8080/. La carte Google Maps ne s'affiche que sur le
domaine du cabinet (sa clé d'API est restreinte à ce domaine).

## Mise en ligne

Copier tout le dossier (sauf `.git`, `.claude` et ce README) à la racine du
domaine, sur n'importe quel hébergement statique (OVH, Netlify, GitHub Pages…).
Les liens sont relatifs ; les balises `canonical` et Open Graph pointent vers
`https://cabinet.psy-monnet-foujols.com/`.

## Cookies et mesure d'audience

Google Analytics (`G-VLQXP77G83`, `GT-TNP9GNK`) n'est chargé qu'après
consentement à la catégorie « Analytics ». Le choix est mémorisé 6 mois dans le
cookie `mf_consent`. Un lien `href="#cookie-settings"` placé n'importe où rouvre
la fenêtre de réglages.
