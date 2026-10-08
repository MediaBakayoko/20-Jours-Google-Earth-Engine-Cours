# Cartographie du bâti et de l'intensité lumineuse nocturne du District d'Abidjan par télédétection multi-capteurs (Sentinel-2, VIIRS)

**Auteur :** Média Marcel Bakayoko
**Zone d'étude :** District d'Abidjan, Côte d'Ivoire
**Données :** Google Earth Engine — Sentinel-2 SR Harmonized, VIIRS DNB Monthly
**Date d'analyse :** Octobre 2026

## Résumé

Cette étude cartographie l'empreinte urbaine du District d'Abidjan à partir de
deux approches complémentaires : un indice spectral optique (NDBI, Normalized
Difference Built-up Index) calculé sur un composite Sentinel-2 de 77 images, et
une mesure directe de l'intensité lumineuse nocturne issue du capteur VIIRS
(Visible Infrared Imaging Radiometer Suite). L'objectif est de déterminer dans
quelle mesure ces deux signaux, de nature physique différente (réflectance de
surface le jour vs émission lumineuse la nuit), convergent pour délimiter
l'extension urbaine réelle d'Abidjan, et d'identifier les limites propres à
chaque capteur. La surface bâtie estimée par seuillage NDBI (> 0,1) est de
321,6 km², avec une intensité lumineuse nocturne moyenne de 11,4 nW/cm²/sr et
un maximum de 370,5 nW/cm²/sr concentré sur le cœur urbain.

## 1. Introduction

Le suivi de l'étalement urbain est un enjeu central pour la planification
territoriale en Afrique de l'Ouest, où les grandes agglomérations côtières
comme Abidjan connaissent une croissance rapide et souvent peu documentée par
les méthodes cadastrales classiques. La télédétection satellite offre une
alternative reproductible et peu coûteuse pour quantifier cette extension,
à condition d'en comprendre les limites physiques.

Deux familles d'indicateurs sont mobilisées ici :
1. **Les indices spectraux optiques** (NDBI), sensibles à la réflectance des
   matériaux de construction (béton, tôle, bitume) dans le proche infrarouge
   et le moyen infrarouge (SWIR).
2. **Les données de luminosité nocturne** (VIIRS DNB), qui mesurent
   directement l'activité humaine émettrice de lumière artificielle
   (éclairage public, zones résidentielles et industrielles actives).

## 2. Zone d'étude et données

La zone d'étude couvre le rectangle `[-4.20°, 5.20°, -3.80°, 5.55°]`, englobant
le District d'Abidjan et sa lagune Ébrié, cohérente avec les zones d'étude
utilisées dans les analyses précédentes de température de surface et de
classification d'occupation du sol sur la même agglomération.

| Source | Capteur | Résolution native | Période |
|---|---|---|---|
| COPERNICUS/S2_SR_HARMONIZED | Sentinel-2 MSI | 10–20 m (B8, B11) | Juillet 2025 – Septembre 2026 |
| NOAA/VIIRS/DNB/MONTHLY_V1/VCMSLCFG | VIIRS DNB | ~500 m | Moyenne annuelle 2025 |

La fenêtre temporelle Sentinel-2 a été délibérément élargie à 15 mois (plutôt
qu'une seule saison sèche) après qu'une analyse antérieure sur la même zone
(cartographie LST/NDVI) a montré qu'une fenêtre courte laissait des trous de
couverture nuageuse significatifs sur Abidjan, zone à forte nébulosité
équatoriale. Un seuil de couverture nuageuse de 40 % a également été retenu
pour maximiser le nombre de scènes exploitables (77 images collectées), au
prix d'un composite médian intégrant des conditions atmosphériques variées.

## 3. Méthode

### 3.1 Indice de bâti normalisé (NDBI)

Le NDBI est calculé selon la formule classique (Zha et al., 2003) :

```
NDBI = (SWIR - NIR) / (SWIR + NIR) = (B11 - B8) / (B11 + B8)
```

Les surfaces artificielles (béton, tôle) présentent une réflectance plus
élevée dans le SWIR que dans le NIR, produisant des valeurs de NDBI positives,
à l'inverse de la végétation dense (NDBI négatif) et de l'eau (NDBI très
négatif).

Un masque binaire de bâti a été appliqué avec un seuil NDBI > 0,1, seuil
empirique couramment utilisé dans la littérature pour discriminer les
surfaces artificielles denses, sans validation terrain spécifique à ce stade.

### 3.2 Lumières nocturnes VIIRS

Le produit VIIRS DNB Monthly (bande `avg_rad`, radiance moyenne) a été moyenné
sur l'année 2025 pour lisser les variations liées à la couverture nuageuse
nocturne, aux feux saisonniers et au bruit de capteur ponctuel, conformément
aux pratiques standards d'utilisation de ce produit pour l'analyse de
l'urbanisation (Elvidge et al., 2017).

## 4. Résultats

| Indicateur | Valeur |
|---|---|
| Nombre d'images Sentinel-2 utilisées | 77 |
| NDBI — minimum | -0,68 |
| NDBI — moyenne | -0,07 |
| NDBI — maximum | 0,53 |
| Surface bâtie estimée (NDBI > 0,1) | 321,6 km² |
| Luminosité nocturne — moyenne | 11,4 nW/cm²/sr |
| Luminosité nocturne — maximum | 370,5 nW/cm²/sr |

La carte NDBI (figure 1) révèle une structure spatiale cohérente avec la
géographie connue d'Abidjan : la lagune Ébrié se distingue nettement en valeurs
très négatives (eau), encerclée par un bâti dense (NDBI > 0,2) concentré sur
les communes centrales (Le Plateau, Cocody, Adjamé, Treichville), avec une
diminution progressive de la densité bâtie vers la périphérie.

La carte VIIRS (figure 2) montre une concentration de la luminosité maximale
(370,5 nW/cm²/sr) sur un noyau restreint, vraisemblablement la zone portuaire
et le quartier d'affaires du Plateau, avec une décroissance marquée vers les
zones périurbaines moins équipées en éclairage public ou à activité nocturne
réduite.

## 5. Discussion et limites méthodologiques

**Divergence attendue entre les deux signaux.** Le NDBI capture la *présence
physique* de matériaux de construction, qu'un bâtiment soit habité, éclairé ou
non ; VIIRS capture l'*activité lumineuse*, qui dépend de l'accès à
l'électricité, de la densité d'éclairage public et de l'activité nocturne
réelle. Une zone peut donc apparaître bâtie en NDBI sans ressortir en VIIRS
(habitat informel peu éclairé, zones industrielles diurnes), et inversement.
Cette étude ne quantifie pas statistiquement cette divergence (pas de
corrélation pixel-à-pixel calculée à ce stade) — un prolongement naturel
serait une régression spatiale NDBI/VIIRS pour identifier les zones de
désaccord significatif.

**Seuil NDBI non validé au terrain.** Le seuil de 0,1 est une convention de
littérature, pas un seuil calibré sur des données de vérité terrain pour
Abidjan spécifiquement. Il peut sur- ou sous-estimer la surface bâtie réelle
selon la nature des sols nus locaux (certains sols latéritiques exposés
peuvent présenter un signal spectral proche du bâti).

**Résolution VIIRS grossière.** À ~500 m de résolution native, VIIRS ne permet
aucune analyse à l'échelle du bâtiment ou du quartier fin ; les valeurs
rapportées ici décrivent une tendance d'agglomération, pas une cartographie
fine de l'éclairage.

**Composite temporel hétérogène.** Le composite Sentinel-2 sur 15 mois mélange
des conditions de végétation et d'humidité du sol variables (saison sèche et
saison des pluies), ce qui peut introduire du bruit dans le NDBI sur les zones
de transition bâti/végétation en périphérie.

## 6. Conclusion

Le couplage NDBI/VIIRS confirme, de façon qualitative et reproductible,
l'existence d'un noyau urbain dense centré sur le Plateau/Cocody/Adjamé avec
une décroissance vers la périphérie, cohérente avec la connaissance empirique
du territoire. Les deux indicateurs restent cependant des proxys indirects de
l'urbanisation réelle, chacun avec ses propres limites physiques et sans
validation terrain à ce stade — une prochaine étape méthodologique
consisterait à croiser ces résultats avec des données de recensement de
population par commune pour évaluer la correspondance entre signal satellite
et densité de population réelle.

## Références

- Zha, Y., Gao, J., & Ni, S. (2003). Use of normalized difference built-up
  index in automatically mapping urban areas from TM imagery. *International
  Journal of Remote Sensing*, 24(3), 583-594.
- Elvidge, C. D., Baugh, K., Zhizhin, M., Hsu, F. C., & Ghosh, T. (2017). VIIRS
  night-time lights. *International Journal of Remote Sensing*, 38(21),
  5860-5879.
