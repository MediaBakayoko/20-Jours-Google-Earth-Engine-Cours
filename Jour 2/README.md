# Jour 2 — Concepts de base & JavaScript dans Google Earth Engine

## Objectifs d'apprentissage
- Maîtriser variables, fonctions et structures de contrôle en GEE
- Comprendre et manipuler les Geometries (Point, Ligne, Polygone, Rectangle)
- Créer et gérer des Features et FeatureCollections
- Utiliser des Dictionnaires pour stocker des métadonnées
- Comprendre la différence critique Client vs Serveur
- Construire des fonctions réutilisables pour un code plus propre

## Zone d'étude
District d'Abidjan (même rectangle que les jours précédents), avec des
géométries secondaires choisies sur des lieux réels et reconnaissables :
- **Point** : Le Plateau (centre administratif/affaires d'Abidjan)
- **Ligne** : axe approximatif Plateau → Cocody
- **Polygone** : zone urbaine centrale (Plateau–Cocody–Treichville)

## Résultats réels (calculés côté serveur Earth Engine)
| Géométrie | Mesure | Valeur |
|---|---|---|
| Rectangle (zone d'étude complète) | Aire | **1 723,4 km²** |
| Polygone (zone urbaine centrale) | Aire | **110,8 km²** |
| Ligne (axe Plateau-Cocody) | Longueur | **5,63 km** |
| FeatureCollection | Nombre de features | 3 |

Ces valeurs sont calculées par le serveur Earth Engine (`.area()`,
`.length()`), pas estimées localement — illustration concrète de la
distinction client/serveur qui est l'objectif pédagogique central de ce jour.

## Carte
- `maps/01_geometries_abidjan_jour2.png` — composite Sentinel-2 vraies
  couleurs du District d'Abidjan avec les 4 géométries superposées
  (rectangle rouge = zone d'étude, polygone blanc = zone urbaine centrale,
  ligne jaune = axe Plateau-Cocody, point bleu = Le Plateau).

## Limites méthodologiques
- Le composite de fond (Sentinel-2, médiane juillet 2025 – septembre 2026)
  présente une couverture nuageuse résiduelle visible par endroits — déjà
  documentée les jours précédents comme contrainte structurelle de la zone,
  non corrigée ici volontairement car l'objectif du jour est pédagogique
  (géométries), pas la qualité radiométrique du fond de carte.
- Les coordonnées du point, de la ligne et du polygone sont des
  approximations visuelles de lieux connus (Le Plateau, axe vers Cocody),
  pas des géométries officielles ou cadastrales.

## Script
Voir `scripts/core_concepts_abidjan.js` (éditeur Google Earth Engine).

## Article scientifique
Voir [`ARTICLE.md`](./ARTICLE.md).
