# Classification de l'occupation du sol par seuillage NDVI et clustering KMeans non supervisé : comparaison méthodologique sur le District d'Abidjan

**Auteur :** Média Marcel Bakayoko
**Zone d'étude :** District d'Abidjan, Côte d'Ivoire
**Données :** Google Earth Engine — Sentinel-2 SR Harmonized, Cloud Score+
**Date d'analyse :** Novembre 2026

## Résumé

Cette étude compare deux approches de classification de l'occupation du sol
à partir d'un même composite Sentinel-2 nettoyé (77 images, Cloud Score+ ≥
0,65) sur le District d'Abidjan : un seuillage manuel à 4 classes du NDVI
(Normalized Difference Vegetation Index), et un clustering non supervisé
KMeans à 4 clusters entraîné sur les bandes spectrales brutes (B2, B3, B4,
B8) augmentées du NDVI. Le seuillage NDVI identifie 811,32 km² de
végétation dense (NDVI ≥ 0,5) et 493,15 km² de surfaces à NDVI faible
(eau/sol nu/bâti). Le clustering KMeans, bien qu'entraîné sur les mêmes
données sous-jacentes, produit une partition spatialement différente : le
cluster le plus étendu (676,29 km²) regroupe majoritairement la zone
urbaine dense plutôt que la végétation, illustrant concrètement la nature
arbitraire de la numérotation des clusters non supervisés et l'importance
d'une inspection visuelle systématique avant toute interprétation.

## 1. Introduction

La classification de l'occupation du sol par télédétection repose
classiquement sur deux familles de méthodes : les règles de seuillage
d'indices spectraux (simples, interprétables, mais rigides) et les
algorithmes de classification automatique, supervisés ou non. Le
clustering non supervisé (K-means, ISODATA) est souvent présenté comme un
raccourci pratique en l'absence de données d'entraînement étiquetées,
mais son résultat dépend fortement du choix des bandes d'entrée et du
nombre de clusters (K), sans garantie de correspondance sémantique avec
des classes d'occupation du sol reconnaissables. Cette étude propose une
comparaison empirique directe des deux approches sur la même zone et le
même composite source, afin d'illustrer concrètement cette limite pour un
usage pédagogique.

## 2. Zone d'étude et données

La zone d'étude couvre le rectangle `[-4.20°, 5.20°, -3.80°, 5.55°]`,
englobant le District d'Abidjan et sa lagune Ébrié, cohérente avec les
analyses précédentes de la même série (NDVI, concepts de base, image vs
collection, analyse urbaine).

| Source | Capteur | Résolution native | Période |
|---|---|---|---|
| COPERNICUS/S2_SR_HARMONIZED | Sentinel-2 MSI | 10–20 m | Juillet 2025 – Septembre 2026 |
| GOOGLE/CLOUD_SCORE_PLUS/V1/S2_HARMONIZED | Cloud Score+ | 10 m | (lié à chaque scène S2) |

Le composite a été nettoyé via Cloud Score+ (seuil `cs_cdf >= 0,65`) plutôt
que le simple masque QA60, méthode confirmée plus efficace contre les
résidus nuageux sur cette zone côtière tropicale lors d'analyses
antérieures de la même série. 77 scènes Sentinel-2 ont été retenues
(fenêtre élargie à 15 mois, seuil `CLOUDY_PIXEL_PERCENTAGE < 40`, même
calibrage que les Jours 1, 3 et 17 sur cette zone).

## 3. Méthode

### 3.1 Seuillage NDVI (méthode 1)

Le NDVI est calculé classiquement : `NDVI = (B8 - B4) / (B8 + B4)`. Quatre
classes fixes sont définies par seuils manuels, choix de conception
reproduisant la logique usuelle des tutoriels de classification simple :

| Classe | Seuil NDVI | Interprétation |
|---|---|---|
| 1 | < 0,1 | Eau / sol nu / bâti |
| 2 | 0,1 – 0,3 | Végétation clairsemée |
| 3 | 0,3 – 0,5 | Végétation modérée |
| 4 | ≥ 0,5 | Végétation dense |

### 3.2 Clustering KMeans (méthode 2)

Un classificateur `ee.Clusterer.wekaKMeans(4)` est entraîné sur 5000
points échantillonnés à 20 m de résolution, à partir des bandes B2
(bleu), B3 (vert), B4 (rouge), B8 (proche infrarouge) et du NDVI calculé.
Le nombre de clusters (K=4) est fixé arbitrairement à 4 pour permettre une
comparaison directe avec les 4 classes du seuillage — ce choix n'est pas
optimisé par une méthode statistique (coude, silhouette), ce qui est
explicitement assumé comme une limite de cette démonstration pédagogique.

## 4. Résultats

| Classe (seuillage NDVI) | Surface (km²) |
|---|---|
| 1 — Eau / sol nu / bâti | 493,15 |
| 2 — Végétation clairsemée | 240,43 |
| 3 — Végétation modérée | 188,95 |
| 4 — Végétation dense | 811,32 |

| Cluster (KMeans) | Surface (km²) |
|---|---|
| 0 | 341,52 |
| 1 | 676,29 |
| 2 | 386,74 |
| 3 | 329,30 |

La carte de seuillage (figure 2) reproduit fidèlement la géographie
connue d'Abidjan : la lagune Ébrié et le cœur urbain ressortent nettement
en classe 1 (rouge), entourés d'une ceinture de végétation (classes 3-4,
vert) cohérente avec les forêts et zones agricoles périurbaines.

La carte KMeans (figure 3), bien qu'entraînée sur les mêmes bandes
sous-jacentes plus le NDVI, produit une partition visuellement différente
: le cluster le plus étendu (vert clair sur la carte, 676,29 km²) couvre
majoritairement la zone urbaine dense du centre d'Abidjan — l'inverse de
ce qu'on pourrait attendre d'une correspondance naïve avec les classes de
végétation du seuillage. Ce résultat n'est pas une erreur de calcul : il
illustre que KMeans regroupe les pixels par similarité dans l'espace des
5 bandes combinées (réflectance brute + NDVI), pas uniquement par niveau
de NDVI, et qu'une zone urbaine hétérogène en réflectance RGB peut
statistiquement ressembler davantage à un type de végétation clairsemée
qu'à la classe "eau/sol nu" attendue intuitivement.

## 5. Discussion et limites méthodologiques

**La numérotation des clusters KMeans est arbitraire.** Rien ne garantit
que le cluster 0 corresponde à la classe "eau", ou que les clusters
suivent un ordre croissant de végétation — chaque exécution peut produire
un ordre de cluster différent selon l'initialisation. Toute interprétation
doit passer par une inspection visuelle de la carte résultante (comme fait
ici), jamais par une correspondance numérique directe entre méthodes.

**Choix de K non optimisé.** K=4 a été choisi pour permettre la
comparaison directe avec le seuillage, pas par une méthode statistique
(méthode du coude, score de silhouette). Un K différent produirait une
partition différente, potentiellement plus ou moins interprétable.

**Aucune validation terrain.** Les deux méthodes sont comparées entre
elles, pas à une vérité de référence (points GPS de terrain, parcelles
labellisées). Aucune des deux classifications ne peut être présentée comme
une carte d'occupation du sol validée sans cette étape.

**Le seuillage NDVI confond plusieurs types de surface dans sa classe 1**
(eau, sol nu, bâti partagent un NDVI faible) — seul un indice
complémentaire (NDBI, NDWI, comme utilisé au Jour 17 de cette série)
permettrait de les séparer.

## 6. Conclusion

Cette comparaison directe démontre, sur un cas réel, que deux méthodes de
classification appliquées au même jeu de données peuvent produire des
partitions spatiales substantiellement différentes, pour des raisons
méthodologiques identifiables (nature des variables d'entrée, absence de
supervision) plutôt que par erreur de calcul. Pour un usage opérationnel
de cartographie d'occupation du sol, un prolongement naturel serait
l'entraînement d'un classificateur supervisé (Random Forest, comme
pratiqué dans l'analyse LULC_ML précédente de la même série) sur des
points d'entraînement réels, seule approche permettant une correspondance
sémantique fiable entre classes numériques et catégories d'occupation du
sol reconnaissables.

## Références

- Rouse, J. W., Haas, R. H., Schell, J. A., & Deering, D. W. (1974).
  Monitoring vegetation systems in the Great Plains with ERTS. *NASA
  Special Publication*, 351, 309.
- MacQueen, J. (1967). Some methods for classification and analysis of
  multivariate observations. *Proceedings of the Fifth Berkeley Symposium
  on Mathematical Statistics and Probability*, 1(14), 281-297.
