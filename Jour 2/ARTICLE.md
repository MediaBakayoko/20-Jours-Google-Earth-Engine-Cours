# Primitives géospatiales et architecture client-serveur de Google Earth Engine : application aux géométries administratives et d'infrastructure du District d'Abidjan

**Auteur :** Média Marcel Bakayoko
**Zone d'étude :** District d'Abidjan, Côte d'Ivoire
**Données :** Google Earth Engine — Sentinel-2 SR Harmonized (fond de carte), géométries vectorielles natives GEE
**Date d'analyse :** Octobre 2026

## Résumé

Ce deuxième exercice de la série « 20 jours Google Earth Engine » s'éloigne
du calcul d'indices spectraux pour se concentrer sur les primitives
géospatiales fondamentales de la plateforme — `ee.Geometry`, `ee.Feature`,
`ee.FeatureCollection`, `ee.Dictionary` — et sur la distinction architecturale
entre calcul côté client et côté serveur, qui structure l'ensemble de la
programmation sous Earth Engine. Quatre géométries ancrées sur des lieux
réels du District d'Abidjan (Le Plateau, un axe vers Cocody, une zone urbaine
centrale, l'emprise globale du district) sont définies et leurs mesures
géométriques (aire, longueur) calculées par le serveur Earth Engine plutôt
qu'estimées localement, pour un total de 1 723,4 km² (zone d'étude), 110,8 km²
(zone urbaine centrale) et 5,63 km (axe routier).

## 1. Introduction

Contrairement à un script Python ou JavaScript classique où chaque opération
s'exécute immédiatement en mémoire locale, Google Earth Engine repose sur un
modèle **client-serveur différé** : les objets `ee.*` (Geometry, Image,
FeatureCollection, etc.) ne sont que des *descriptions* d'un calcul à
effectuer, transmises au serveur Google uniquement lors d'un appel explicite
(`.getInfo()`, `print()`, affichage sur la carte). Comprendre cette
distinction est une étape nécessaire avant d'aborder des traitements plus
complexes (classification, séries temporelles), car elle conditionne la
performance et la lisibilité du code.

## 2. Zone d'étude et géométries définies

Le rectangle d'étude reprend l'emprise standard du cours
(`[-4.20°, 5.20°, -3.80°, 5.55°]`, District d'Abidjan). Trois géométries
secondaires ont été définies sur des repères géographiques réels plutôt que
des coordonnées arbitraires, pour ancrer l'exercice dans un contexte concret :

| Type GEE | Objet représenté | Coordonnées (WGS84) |
|---|---|---|
| `ee.Geometry.Point` | Le Plateau (centre administratif/affaires) | [-4.0219, 5.3200] |
| `ee.Geometry.LineString` | Axe routier approximatif Plateau → Cocody | [-4.0219, 5.3200] → [-3.9850, 5.3550] |
| `ee.Geometry.Polygon` | Zone urbaine centrale (Plateau-Cocody-Treichville) | voir script |
| `ee.Geometry.Rectangle` | Zone d'étude complète (District d'Abidjan) | [-4.20, 5.20, -3.80, 5.55] |

## 3. Méthode

### 3.1 Features et FeatureCollection

Chaque géométrie est associée à des métadonnées via `ee.Feature(geometry,
properties)`, puis regroupée dans une `ee.FeatureCollection` — structure
analogue à une couche vectorielle SIG classique (GeoJSON/Shapefile), mais
manipulable par les opérateurs serveur de GEE (filtrage, agrégation,
jointure spatiale).

### 3.2 Mesures géométriques côté serveur

Les mesures d'aire (`.area(maxError)`) et de longueur (`.length(maxError)`)
sont exécutées par le serveur Earth Engine sur l'ellipsoïde WGS84 (calcul
géodésique, pas une projection planaire approximative), avec une marge
d'erreur maximale explicite en mètres (ici 100 m pour les aires, 1 m pour la
longueur de ligne) — paramètre qui illustre concrètement le compromis
précision/performance propre au calcul distribué de GEE.

### 3.3 Démonstration client vs serveur

Le script distingue explicitement :
- des calculs **purement serveur** (aire, longueur), dont le résultat n'existe
  qu'après un appel réseau explicite ;
- des informations nécessitant elles aussi un aller-retour serveur dès lors
  qu'elles portent sur un objet `ee.*` (ex. `FeatureCollection.size()`), par
  opposition à une variable JavaScript/Python native qui serait disponible
  immédiatement en mémoire locale.

## 4. Résultats

| Géométrie | Mesure | Valeur |
|---|---|---|
| Rectangle (zone d'étude) | Aire géodésique | **1 723,4 km²** |
| Polygone (zone urbaine centrale) | Aire géodésique | **110,8 km²** |
| Ligne (axe Plateau-Cocody) | Longueur géodésique | **5,63 km** |
| FeatureCollection | Nombre de features | 3 |

Pour contexte, la zone urbaine centrale définie ici (110,8 km²) représente
environ 6,4 % de la surface totale de la zone d'étude (1 723,4 km²) — un
ordre de grandeur cohérent avec un centre urbain dense au sein d'un district
beaucoup plus vaste incluant lagune, périphérie et zones rurales.

La carte produite (figure 1) superpose les quatre géométries à un composite
Sentinel-2 vraies couleurs du District d'Abidjan, permettant de visualiser
concrètement la position du Plateau, l'axe vers Cocody et l'étendue de la
zone urbaine centrale par rapport à l'emprise complète du district.

## 5. Discussion et limites méthodologiques

**Approximation des géométries secondaires.** Les coordonnées du point
(Le Plateau), de la ligne (axe vers Cocody) et du polygone (zone urbaine
centrale) sont des approximations visuelles construites pour l'exercice,
non des géométries officielles ou cadastrales — elles ne doivent pas être
utilisées pour une analyse de précision infra-métrique.

**Couverture nuageuse résiduelle du fond de carte.** Le composite Sentinel-2
utilisé comme arrière-plan conserve une couverture nuageuse visible par
endroits, conforme à la contrainte déjà documentée aux Jours 1 et 17 de ce
cours sur cette même zone d'étude. Cette limite n'affecte pas les mesures
géométriques elles-mêmes (calculées indépendamment de l'image), mais réduit
la lisibilité visuelle de certaines zones de la carte.

**Portée pédagogique de l'exercice.** Contrairement aux Jours 1 et 17 qui
produisent des indices scientifiquement exploitables (NDVI, NDBI), ce Jour 2
a une vocation principalement didactique : les géométries et leurs mesures
servent à illustrer des concepts de programmation GEE, non à produire un
résultat d'analyse territoriale validé.

## 6. Conclusion

Cet exercice établit les briques de base — géométries, features, métadonnées,
et surtout la distinction client/serveur — nécessaires à la compréhension de
tout script Earth Engine plus avancé. Les mesures géodésiques obtenues
(1 723,4 km² pour l'emprise du district, 110,8 km² pour le cœur urbain,
5,63 km pour un axe routier type) constituent par ailleurs un premier ordre
de grandeur réutilisable pour contextualiser les analyses ultérieures de ce
cours sur la même zone d'étude.
