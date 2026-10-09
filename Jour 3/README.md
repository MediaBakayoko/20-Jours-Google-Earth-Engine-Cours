# Jour 3 — Image vs ImageCollection : approfondissement

## Objectifs d'apprentissage
- Comprendre la différence entre `Image` et `ImageCollection`
- Apprendre à manipuler des images individuelles
- Maîtriser mosaicking, clipping, sélection de bandes, ajout de bandes
- Combiner plusieurs images et créer des composites
- Pratiquer les techniques courantes de manipulation d'images

## Zone d'étude
District d'Abidjan (même rectangle que les jours précédents).

## Résultats réels (calculés sur Google Earth Engine)
| Indicateur | Valeur |
|---|---|
| Nombre d'images dans la collection | 77 |
| Première image — ID | `20250702T102559_20250702T103813_T30NUL` |
| Première image — date | 2025-07-02 |
| Première image — % nuage | 28,9 % |
| Nombre de bandes après `addBands(NDVI)` | 27 |
| Nombre de bandes de la mosaïque | 26 |
| NIR moyen — composite **median** | 2988 |
| NIR moyen — **mosaic** | 5653 |

## ⚠️ Découverte méthodologique importante : median vs mosaic

**Le NIR moyen de la mosaïque (5653) est presque le double de celui du
composite médian (2988).** Ce n'est pas une anomalie de script mais un
résultat réel et pédagogiquement central : `.mosaic()` empile les images et
garde la dernière valeur "au-dessus" pour chaque pixel, **sans aucun
filtrage de qualité** — si la dernière image disponible pour un pixel donné
est nuageuse, le pixel final est nuageux (et les nuages ont une réflectance
très élevée dans le NIR, d'où la moyenne doublée). `.median()`, en
revanche, calcule la valeur médiane pixel par pixel sur toute la pile
d'images, ce qui **lisse statistiquement** les nuages tant qu'une majorité
d'observations propres existe à cet endroit.

Ce contraste est visible à l'œil sur les cartes : la moitié sud de la zone
d'étude reste fortement voilée de blanc **même sur le composite médian**,
ce qui indique que, pour cette portion de la zone, la majorité des 77 images
disponibles sont elles-mêmes nuageuses à cet endroit précis — pas un simple
problème d'affichage. Cette limite se propage ensuite dans le calcul du
NDVI (carte 3).

## Cartes
- `maps/01_median_composite.png` — composite médian vraies couleurs (77
  images). Couverture correcte au nord, forte nébulosité résiduelle au sud.
- `maps/02_mosaic_composite.png` — mosaïque simple (dernière image "au
  dessus"). Contamination nuageuse nettement plus sévère que le médian,
  confirmant visuellement l'écart statistique mesuré (NIR x1,9).
- `maps/03_ndvi_abidjan_jour3.png` / `.tif` — NDVI calculé depuis le
  composite médian via `addBands()`. Le bruit NDVI de la moitié sud reflète
  directement la limite de couverture documentée ci-dessus.

## Limites méthodologiques
- La zone d'étude n'a **pas de couverture Sentinel-2 propre homogène** sur
  toute sa surface pour la période retenue (juillet 2025 – septembre 2026) :
  la moitié sud reste affectée par une nébulosité persistante quel que soit
  le mode de composite utilisé. Une analyse quantitative fine sur cette
  portion nécessiterait soit une fenêtre temporelle encore plus large, soit
  une autre source (Landsat, SAR Sentinel-1 insensible aux nuages).
- `.mosaic()` est illustré ici à dessein comme une méthode **naïve et peu
  robuste** pour un composite sans nuages — ce n'est pas un défaut du
  script mais l'objet même de la démonstration pédagogique du jour.

## Script
Voir `scripts/image_vs_collection_abidjan.js` (éditeur Google Earth Engine).

## Article scientifique
Voir [`ARTICLE.md`](./ARTICLE.md).
