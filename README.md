# 20 Jours — Google Earth Engine (Cours)

Série d'exercices quotidiens Google Earth Engine, chacun centré sur un phénomène
géospatial différent et une zone d'étude donnée (principalement en Côte d'Ivoire).
Chaque script GEE JS fourni en cours est adapté à une vraie zone d'étude, exécuté
réellement via l'API Python Earth Engine, et accompagné de cartes géoréférencées
(GeoTIFF) exportées avec leurs statistiques.

## Structure

Chaque jour a son propre dossier `Jour N/` contenant :
- `scripts/` — script(s) Google Earth Engine (JavaScript, éditeur GEE)
- `maps/` — cartes exportées : GeoTIFF géoréférencé (exploitable dans QGIS) + PNG
  avec légende intégrée pour prévisualisation rapide
- `data/` — statistiques calculées (JSON), quand pertinent

## Sommaire des jours

| Jour | Thème | Zone d'étude | Article |
|------|-------|--------------|---------|
| [Jour 17](./Jour%2017/) | Analyse urbaine — NDBI, bâti, lumières nocturnes VIIRS | District d'Abidjan, Côte d'Ivoire | [ARTICLE.md](./Jour%2017/ARTICLE.md) |

## Méthodologie

- Zone d'étude et période adaptées à chaque phénomène (ex. fenêtre élargie
  pour compenser la couverture nuageuse sur Abidjan).
- Chaque export est vérifié visuellement (légende lisible, pas de
  chevauchement, couverture spatiale réelle) avant publication.
- Les limites méthodologiques de chaque analyse sont documentées dans le
  README du jour concerné (résolution des capteurs, biais éventuels,
  comparaison entre produits plutôt que vérité terrain absolue quand
  applicable).
