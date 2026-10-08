# Jour 1 — Introduction à Google Earth Engine : NDVI avec Sentinel-2

## Objectifs d'apprentissage
- Comprendre ce qu'est Google Earth Engine et son fonctionnement
- Charger des données satellite (ImageCollection)
- Filtrer les données par lieu, date et qualité
- Calculer des indices de végétation (NDVI)
- Visualiser les résultats avec une légende personnalisée

## Zone d'étude
District d'Abidjan, Côte d'Ivoire — rectangle `[-4.20, 5.20, -3.80, 5.55]`
(même emprise que les jours précédents du cours, pour cohérence).

## Données sources
- **Sentinel-2 SR Harmonized** (COPERNICUS/S2_SR_HARMONIZED), composite
  médian **77 images**.

## Ajustement méthodologique appliqué
Le script original (zone Mexico) utilisait un filtre strict : une seule année
(2023) avec un seuil de couverture nuageuse de 10 %. Appliqué tel quel sur
Abidjan, ce filtre renvoie **0 scène exploitable** — vérifié empiriquement
avant publication (zone à forte nébulosité équatoriale, cohérent avec les
constats des jours précédents du cours). Le filtre a donc été élargi à une
fenêtre de 15 mois (juillet 2025 – septembre 2026) avec un seuil nuage de 40 %,
ce qui a permis de récupérer 77 scènes.

## Résultats réels (calculés sur Google Earth Engine)
- Nombre de scènes utilisées : **77**
- NDVI moyen (zone d'étude) : **0,291**
- NDVI minimum : -0,478 (lagune Ébrié, eau)
- NDVI maximum : 0,896 (végétation dense)

## Carte
- `maps/01_ndvi_abidjan_jour1.png` / `.tif` — NDVI, échelle -0,2 à 0,8, palette
  rouge/brun (eau, sol nu) → jaune → vert (végétation dense). La lagune Ébrié
  et le tracé côtier sont nettement identifiables en rouge/brun (NDVI
  négatif).

## Limites méthodologiques
- Le composite médian sur 15 mois mélange saison sèche et saison des pluies :
  utile pour la couverture spatiale complète, mais le NDVI obtenu est une
  valeur « moyenne temporelle » et non un instantané à une date précise —
  il ne doit pas être interprété comme l'état de la végétation à un moment
  donné.
- Aucun masque nuage résiduel fin n'a été appliqué au-delà du filtre sur le
  pourcentage global de la scène (`CLOUDY_PIXEL_PERCENTAGE`) : quelques
  pixels nuageux isolés peuvent subsister dans le composite médian.

## Script
Voir `scripts/ndvi_intro_abidjan.js` (éditeur Google Earth Engine).

## Article scientifique
Voir [`ARTICLE.md`](./ARTICLE.md).
