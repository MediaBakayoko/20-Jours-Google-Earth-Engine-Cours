# Image vs ImageCollection : quantification de l'effet du mode de composite (mosaïque naïve vs médiane statistique) sur la contamination nuageuse résiduelle, District d'Abidjan

**Auteur :** Média Marcel Bakayoko
**Zone d'étude :** District d'Abidjan, Côte d'Ivoire
**Données :** Google Earth Engine — Sentinel-2 SR Harmonized
**Date d'analyse :** Octobre 2026

## Résumé

Ce troisième exercice compare deux méthodes usuelles de composition d'une
`ImageCollection` Sentinel-2 en une `Image` unique exploitable : la mosaïque
naïve (`.mosaic()`, dernière observation disponible par pixel) et le
composite médian (`.median()`, valeur statistique médiane par pixel sur
l'ensemble de la pile d'images). Sur la même collection de 77 images couvrant
le District d'Abidjan, la réflectance moyenne dans le proche infrarouge (NIR,
bande B8) atteint 5653 pour la mosaïque contre 2988 pour le composite médian
— un écart de facteur 1,9 directement attribuable à la contamination
nuageuse résiduelle non filtrée par `.mosaic()`. L'inspection visuelle des
composites confirme en outre que cette contamination persiste, dans une
moindre mesure, jusque dans le composite médian sur la moitié sud de la zone
d'étude, révélant une limite structurelle de couverture Sentinel-2 propre
sur cette portion du territoire pour la période considérée.

## 1. Introduction

La distinction entre `ee.Image` (une scène satellite unique, à un instant
donné) et `ee.ImageCollection` (un ensemble ordonné de scènes, filtrable et
réductible) est la première abstraction structurante de Google Earth Engine.
Le passage de l'une à l'autre — la *réduction temporelle* — conditionne
directement la qualité radiométrique du résultat final, en particulier sous
les tropiques où la nébulosité résiduelle reste la principale source de bruit
dans les composites optiques. Cet exercice quantifie, sur un cas réel, l'écart
entre une méthode de réduction naïve et une méthode statistiquement robuste.

## 2. Zone d'étude et données

Zone d'étude : rectangle `[-4.20°, 5.20°, -3.80°, 5.55°]`, District d'Abidjan
— identique aux jours précédents du cours. Collection Sentinel-2 SR
Harmonized filtrée sur juillet 2025 – septembre 2026 avec un seuil de
nébulosité de scène inférieur à 40 % (fenêtre déjà validée aux Jours 1 et 17
comme nécessaire sur cette zone), produisant une collection de **77 images**.

## 3. Méthode

### 3.1 Les deux modes de réduction comparés

- **`ImageCollection.mosaic()`** : pour chaque pixel, conserve la valeur de
  la *dernière* image de la collection qui couvre ce pixel (empilement
  simple, sans aucune pondération ni filtrage qualité).
- **`ImageCollection.median()`** : pour chaque pixel, calcule la *valeur
  médiane* sur l'ensemble des observations disponibles à cet endroit — une
  statistique robuste aux valeurs aberrantes (nuages, ombres, artefacts
  ponctuels), à condition qu'une majorité d'observations propres existe.

### 3.2 Protocole de comparaison

La réflectance moyenne de la bande NIR (B8) a été calculée par
`reduceRegion(ee.Reducer.mean())` sur l'intégralité de la zone d'étude, pour
les deux composites, à résolution native (20 m). Les nuages présentant une
réflectance NIR caractéristiquement élevée (contrairement à la végétation ou
à l'eau), cet indicateur sert de proxy direct du taux de contamination
nuageuse résiduelle de chaque composite.

Un test complémentaire d'ajout de bande (`Image.addBands()`) a été réalisé en
calculant le NDVI sur le composite médian puis en l'ajoutant comme 27ᵉ bande
à l'image clippée (26 bandes natives Sentinel-2 + 1 bande NDVI dérivée).

## 4. Résultats

| Indicateur | Valeur |
|---|---|
| Images dans la collection | 77 |
| Date de la première image | 2025-07-02 (28,9 % de nébulosité) |
| NIR moyen — composite médian | **2988** |
| NIR moyen — mosaïque | **5653** |
| Rapport mosaïque / médian | **1,89×** |
| Bandes après `addBands(NDVI)` | 27 |

L'écart de facteur 1,89 entre les deux méthodes constitue une preuve
quantitative directe de l'intérêt du composite médian pour réduire la
contamination nuageuse, sans recourir à un masquage pixel explicite
(`SCL`/`QA60`).

L'inspection visuelle des cartes RGB (figures 1 et 2) confirme ce résultat
statistique : la mosaïque présente une contamination nuageuse massive sur
l'ensemble de la moitié sud de la zone d'étude, tandis que le composite
médian, bien qu'imparfait, conserve une lisibilité nettement supérieure sur
le nord du territoire. Fait notable, **même le composite médian reste
fortement voilé sur la moitié sud** — signe que, pour cette portion précise
de la zone d'étude, une majorité (pas seulement une minorité) des 77 images
disponibles sont elles-mêmes nuageuses à cet endroit, ce qu'aucune méthode de
réduction statistique ne peut entièrement compenser sans données
supplémentaires.

Ce bruit résiduel se propage mécaniquement dans le calcul du NDVI (figure 3),
où la moitié sud présente des valeurs visuellement plus bruitées et des
teintes orangées (NDVI plus faible / plus incertain) que le nord.

## 5. Discussion et limites méthodologiques

**`.mosaic()` n'est pas adapté comme méthode de composite sans nuages.**
Ce résultat, illustré ici empiriquement plutôt qu'affirmé a priori, confirme
que `.mosaic()` doit être réservé à d'autres usages (fusion de scènes
adjacentes sans recouvrement temporel, visualisation d'une collection
pré-filtrée scène par scène) et non employé comme substitut rapide à
`.median()` pour produire un composite exploitable analytiquement.

**Limite de couverture structurelle, pas un artefact de méthode.** La
persistance de nébulosité sur la moitié sud *malgré* le composite médian
indique une contrainte physique de la zone (trajectoire orbitale, régime
nuageux local) plutôt qu'un mauvais choix de paramètres. Un prolongement
méthodologique naturel serait de comparer avec Sentinel-1 (radar SAR), dont
le signal traverse la couverture nuageuse, pour évaluer si cette portion de
territoire reste correctement caractérisable par voie optique sur une
fenêtre temporelle raisonnable.

**Choix du seuil de nébulosité (40 %).** Ce seuil, nécessaire pour obtenir
une collection suffisamment fournie (cf. Jour 1), admet par construction des
scènes individuellement très nuageuses dans la collection — ce qui explique
en partie pourquoi même le médian n'élimine pas totalement le bruit dans les
zones les moins bien couvertes.

## 6. Conclusion

Cette comparaison quantifiée (facteur 1,89 sur la réflectance NIR moyenne)
démontre concrètement pourquoi le choix de la méthode de réduction temporelle
d'une `ImageCollection` n'est pas un détail d'implémentation mais un choix
méthodologique déterminant pour la qualité d'un composite satellite,
particulièrement sous les tropiques. Elle révèle également une limite de
couverture structurelle du District d'Abidjan sur sa portion sud,
documentée ici de façon reproductible et à prendre en compte dans toute
analyse future de ce cours portant sur cette sous-zone spécifique.
