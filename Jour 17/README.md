# Jour 17 — Analyse urbaine : NDBI, bâti & lumières nocturnes

## Objectifs d'apprentissage
- Calculer le NDBI (Normalized Difference Built-up Index)
- Cartographier les zones bâties / urbaines
- Utiliser les données VIIRS nighttime lights
- Comparer données optiques et lumières nocturnes
- Visualiser l'extension et l'intensité urbaine

## Zone d'étude
District d'Abidjan, Côte d'Ivoire — rectangle `[-4.20, 5.20, -3.80, 5.55]`
(même emprise que les analyses LST/LULC précédentes du dépôt
`variation-temperature-surface-gee`, pour rester cohérent).

## Données sources
- **Sentinel-2 SR Harmonized** (COPERNICUS/S2_SR_HARMONIZED) : composite médian
  sur juillet 2025 – septembre 2026 (fenêtre élargie à 15 mois, seuil nuage
  40%, leçon tirée des analyses précédentes sur Abidjan où une seule saison
  laisse des trous de couverture nuageuse). **77 images** utilisées.
- **VIIRS DNB Monthly** (NOAA/VIIRS/DNB/MONTHLY_V1/VCMSLCFG) : moyenne annuelle
  2025 des lumières nocturnes (`avg_rad`).

## Indices et méthode
- **NDBI** = (SWIR - NIR) / (SWIR + NIR), bandes B11/B8.
- **Masque bâti** : NDBI > 0.1.

## Résultats réels (calculés sur Google Earth Engine)
- Surface bâtie (NDBI > 0,1) : **≈ 321,6 km²**
- NDBI : min -0,68 / moyenne -0,07 / max 0,53
- Lumières nocturnes VIIRS 2025 : moyenne 11,4 nW/cm²/sr, maximum 370,5
  (cœur urbain, probablement Le Plateau / zone portuaire)

## Cartes
- `maps/01_ndbi_abidjan.png` / `.tif` — NDBI, échelle -0,4 à 0,4, palette
  bleu (eau/végétation) → orange/brun (bâti dense). La lagune Ébrié est
  clairement identifiable.
- `maps/02_viirs_nighttime_abidjan.png` / `.tif` — lumières nocturnes 2025,
  échelle 0–30 nW/cm²/sr, palette noir → violet → orange → jaune.

## Limites méthodologiques
- Le masque bâti (seuil NDBI > 0,1) est une approximation simple, pas une
  classification supervisée validée — il peut confondre certains sols nus
  très réfléchissants avec du bâti.
- VIIRS a une résolution native d'environ 500 m : la carte nocturne montre
  l'intensité lumineuse agrégée à l'échelle du quartier, pas du bâtiment.
- Composite Sentinel-2 sur 15 mois : bon pour la couverture spatiale, mais
  mélange des dates différentes (pas un instantané unique).

## Script
Voir `scripts/urban_analysis_abidjan.js` (éditeur Google Earth Engine).
