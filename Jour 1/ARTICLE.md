# Cartographie de l'indice de végétation NDVI du District d'Abidjan par composite Sentinel-2 : premier exercice d'introduction à Google Earth Engine

**Auteur :** Média Marcel Bakayoko
**Zone d'étude :** District d'Abidjan, Côte d'Ivoire
**Données :** Google Earth Engine — Sentinel-2 SR Harmonized
**Date d'analyse :** Octobre 2026

## Résumé

Ce premier exercice de la série « 20 jours Google Earth Engine » introduit le
calcul du NDVI (Normalized Difference Vegetation Index) à partir d'un
composite médian Sentinel-2 sur le District d'Abidjan. Au-delà de l'aspect
pédagogique, l'exercice met en évidence une contrainte méthodologique
récurrente sur cette zone d'étude : les paramètres de filtrage standard
(fenêtre d'un an, seuil de nébulosité strict à 10 %) utilisés dans les
tutoriels génériques échouent à produire une collection exploitable sur
Abidjan, en raison de la nébulosité équatoriale persistante. Un ajustement
empirique (fenêtre élargie à 15 mois, seuil assoupli à 40 %) a permis
d'obtenir 77 scènes et un NDVI moyen de 0,291 sur la zone d'étude.

## 1. Introduction

Le NDVI (Rouse et al., 1974) reste l'indice de végétation le plus utilisé en
télédétection pour quantifier la densité et la vigueur du couvert végétal. Cet
exercice d'introduction vise à illustrer le pipeline de base d'une analyse
Google Earth Engine — chargement, filtrage, composite, calcul d'indice,
visualisation — tout en documentant une difficulté pratique rencontrée
spécifiquement sur la zone d'étude retenue pour l'ensemble du cours
(District d'Abidjan), qui diffère sensiblement de la zone d'origine du script
pédagogique (Mexico).

## 2. Zone d'étude et données

Zone d'étude : rectangle `[-4.20°, 5.20°, -3.80°, 5.55°]`, couvrant le District
d'Abidjan et sa lagune Ébrié — emprise identique aux exercices précédents du
cours pour permettre des comparaisons inter-jours cohérentes.

| Source | Capteur | Résolution native | Période finale retenue |
|---|---|---|---|
| COPERNICUS/S2_SR_HARMONIZED | Sentinel-2 MSI | 10 m (B4, B8) | Juillet 2025 – Septembre 2026 |

## 3. Méthode

### 3.1 Calcul du NDVI

```
NDVI = (NIR - RED) / (NIR + RED) = (B8 - B4) / (B8 + B4)
```

### 3.2 Ajustement du filtrage temporel et nuageux

Le script pédagogique d'origine filtre sur une seule année calendaire avec un
seuil `CLOUDY_PIXEL_PERCENTAGE < 10`. Appliqué tel quel sur le District
d'Abidjan pour l'année 2025, ce filtre retourne une collection **vide** (0
scène), empêchant tout calcul de NDVI (erreur `No band named 'B8'` côté
Earth Engine, consécutive à l'absence totale de bandes sur un composite
médian d'une collection vide). Ce résultat négatif est lui-même informatif :
il confirme, de façon reproductible, la limite déjà documentée lors des
exercices précédents du cours (Jour 17) — l'approche « une saison, seuil
nuage strict » n'est pas transposable telle quelle à une zone côtière
équatoriale sans adaptation.

Le filtre a donc été élargi à une fenêtre de 15 mois (juillet 2025 – septembre
2026) avec un seuil de nébulosité assoupli à 40 %, permettant de récupérer 77
scènes Sentinel-2 exploitables.

## 4. Résultats

| Indicateur | Valeur |
|---|---|
| Nombre de scènes Sentinel-2 utilisées | 77 |
| NDVI — moyenne (zone d'étude) | 0,291 |
| NDVI — minimum | -0,478 |
| NDVI — maximum | 0,896 |

La carte NDVI (figure 1) distingue nettement trois grandes classes spatiales :
la lagune Ébrié et le littoral en valeurs fortement négatives (NDVI < 0, eau),
une matrice urbaine mixte en teintes orangées/jaunes (NDVI 0–0,3, bâti et
végétation éparse), et des zones périphériques en vert soutenu (NDVI > 0,5,
forêt/végétation dense), cohérentes avec les écosystèmes periurbains et les
massifs forestiers résiduels connus autour d'Abidjan.

## 5. Discussion et limites méthodologiques

**Composite temporel hétérogène.** La fenêtre de 15 mois mélange saison sèche
et saison des pluies. Le NDVI obtenu représente donc un état moyen lissé dans
le temps, pas une photographie de la végétation à une date précise — une
limite déjà identifiée et documentée lors du Jour 17 de ce cours, et qui se
confirme être une contrainte structurelle de cette zone d'étude plutôt qu'une
anomalie ponctuelle.

**Absence de masque nuage résiduel fin.** Seul le filtre global sur le
pourcentage de nébulosité de la scène entière (`CLOUDY_PIXEL_PERCENTAGE`) a
été appliqué, sans masquage pixel-à-pixel des nuages résiduels (ex. bande
`SCL` ou `QA60`) — des artefacts nuageux isolés peuvent subsister localement
dans le composite médian final.

**Seuil de nébulosité élevé (40 %).** Ce choix, nécessaire pour obtenir une
collection non vide, dégrade potentiellement la qualité radiométrique moyenne
du composite par rapport à un seuil strict de 10 % — compromis documenté ici
entre couverture spatiale complète et qualité atmosphérique individuelle des
scènes, cohérent avec l'arbitrage déjà opéré lors des analyses LULC
précédentes de ce cours sur la même zone.

## 6. Conclusion

Cet exercice introductif confirme, par une tentative infructueuse puis
corrigée, que les paramètres de filtrage par défaut d'un tutoriel générique
ne sont pas transposables sans adaptation à une zone côtière tropicale comme
Abidjan. La valeur pédagogique de cet échec initial dépasse celle du résultat
final : il illustre concrètement pourquoi la zone d'étude et les conditions
atmosphériques locales doivent systématiquement être vérifiées avant de
figer des paramètres de filtrage dans un pipeline de télédétection
opérationnel.

## Références

- Rouse, J. W., Haas, R. H., Schell, J. A., & Deering, D. W. (1974). Monitoring
  vegetation systems in the Great Plains with ERTS. *NASA Special
  Publication*, 351, 309.
