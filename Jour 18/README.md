# Jour 18 — Classification occupation du sol par seuillage NDVI + KMeans

Inspiré de la série de tutoriels PySTAC « Sentinel-2 Land Cover Threshold
Analysis using NDVI and KMeans in Python ».

## Objectifs d'apprentissage
- Calculer un NDVI à partir d'un composite Sentinel-2 propre (Cloud Score+)
- Classer l'occupation du sol par seuillage simple du NDVI (règles manuelles)
- Comparer ce seuillage à un clustering non supervisé (KMeans, 4 clusters)
- Comprendre les limites d'une classification non supervisée sans données
  d'entraînement réelles

## Zone d'étude
District d'Abidjan, Côte d'Ivoire — rectangle `[-4.20, 5.20, -3.80, 5.55]`
(même emprise que les Jours 1, 2, 3 et 17, pour rester cohérent).

## Données sources
- **Sentinel-2 SR Harmonized** (COPERNICUS/S2_SR_HARMONIZED) : composite
  médian sur juillet 2025 – septembre 2026 (fenêtre élargie à 15 mois, seuil
  nuage 40%), nettoyé via **Cloud Score+** (`GOOGLE/CLOUD_SCORE_PLUS/V1/S2_HARMONIZED`,
  seuil `cs_cdf >= 0.65`) plutôt que le simple masque QA60. **77 images**
  utilisées (même collection que le Jour 17).

## Méthode 1 — Seuillage NDVI (4 classes fixes)
| Classe | Seuil NDVI | Surface calculée |
|---|---|---|
| 1 — Eau / sol nu / bâti | < 0,1 | **493,15 km²** |
| 2 — Végétation clairsemée | 0,1 – 0,3 | **240,43 km²** |
| 3 — Végétation modérée | 0,3 – 0,5 | **188,95 km²** |
| 4 — Végétation dense | ≥ 0,5 | **811,32 km²** |

(0,96 km² hors classes, bords/nodata — négligeable)

## Méthode 2 — KMeans non supervisé (4 clusters)
Entraîné sur les bandes B2/B3/B4/B8 + NDVI, 5000 points échantillonnés à 20 m,
`ee.Clusterer.wekaKMeans(4)`.

| Cluster | Surface calculée |
|---|---|
| 0 | 341,52 km² |
| 1 | 676,29 km² |
| 2 | 386,74 km² |
| 3 | 329,30 km² |

**Observation méthodologique importante** : les clusters KMeans ne
correspondent PAS directement aux classes de seuillage. En inspectant
visuellement la carte KMeans, le cluster vert clair couvre majoritairement
la zone urbaine dense (pas la végétation comme dans le seuillage), car
KMeans regroupe sur la base des 4 bandes spectrales brutes + NDVI
ensemble, pas uniquement le NDVI. C'est une illustration concrète de la
limite centrale d'un clustering non supervisé : sans étiquette de
référence, la numérotation des clusters est arbitraire et doit toujours
être interprétée visuellement, jamais assumée a priori.

## Cartes
- `maps/01_ndvi_abidjan.png` / `.tif` — NDVI, échelle -0,2 à 0,8, palette
  rouge (faible) → vert (dense). La lagune et le cœur urbain ressortent
  nettement en rouge/orange.
- `maps/02_classes_seuillage_abidjan.png` / `.tif` — 4 classes par
  seuillage NDVI, légende intégrée.
- `maps/03_classes_kmeans_abidjan.png` / `.tif` — 4 clusters KMeans,
  légende intégrée (note explicite : pas de correspondance garantie avec
  le seuillage).

## Limites méthodologiques
- Le seuillage NDVI (classe 1 "eau / sol nu / bâti") confond plusieurs
  types de surfaces très différents partageant un NDVI faible — seul un
  indice complémentaire (NDBI, NDWI) permettrait de les séparer, comme fait
  au Jour 17.
- KMeans est un algorithme non supervisé : le nombre de clusters (ici 4,
  choisi pour comparer avec le seuillage) est un paramètre arbitraire, pas
  dérivé des données. Un autre K produirait une partition différente.
- Aucune validation terrain : les deux méthodes sont comparées entre elles,
  pas à une vérité de référence.
- Composite Sentinel-2 sur 15 mois : bonne couverture spatiale, mais mélange
  des dates (pas un instantané unique).

## Script
- `scripts/ndvi_kmeans_abidjan.js` — éditeur Google Earth Engine (JavaScript)
- `scripts/run_ndvi_kmeans_abidjan.py` — exécution réelle via l'API Python
  Earth Engine (celle utilisée pour produire les cartes et statistiques
  ci-dessus)

## Article scientifique
Voir [`ARTICLE.md`](./ARTICLE.md).
