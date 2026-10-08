// ═══════════════════════════════════════════════════════════════
// Jour 1 : Introduction a Google Earth Engine - NDVI avec Sentinel-2
// Adapte au District d'Abidjan (Cote d'Ivoire)
//
// Objectifs d'apprentissage :
//    • Comprendre ce qu'est Google Earth Engine et son fonctionnement
//    • Charger des donnees satellite (ImageCollection)
//    • Filtrer les donnees par lieu, date et qualite
//    • Calculer des indices de vegetation (NDVI)
//    • Visualiser les resultats avec une legende personnalisee
// ═══════════════════════════════════════════════════════════════

// ─── 1. ZONE D'ETUDE - District d'Abidjan ─────────────────────
// Meme emprise que les jours precedents (coherence du cours).
var studyArea = ee.Geometry.Rectangle({
  coords: [
    [-4.20, 5.20],
    [-3.80, 5.55]
  ], // [Ouest, Sud], [Est, Nord]
  geodesic: false
});

var centerPoint = studyArea.centroid(1);

// ─── 2. CHARGEMENT ET FILTRAGE DE LA COLLECTION SENTINEL-2 ────
// Fenetre elargie a 15 mois + seuil nuage 40% : un seuil strict (10%) sur
// une seule annee ne renvoie AUCUNE scene exploitable sur Abidjan (verifie
// empiriquement), zone a forte nebulosite equatoriale.
var s2 = ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED")
  .filterBounds(studyArea)
  .filterDate("2025-07-01", "2026-09-30")
  .filterMetadata("CLOUDY_PIXEL_PERCENTAGE", "less_than", 40);

// ─── 3. COMPOSITE SANS NUAGES ──────────────────────────────────
var image = s2.median();

// ─── 4. CALCUL DU NDVI ─────────────────────────────────────────
var ndvi = image.normalizedDifference(["B8", "B4"]).rename("NDVI");

// ─── 5. AFFICHAGE DES INFORMATIONS ────────────────────────────
print("Nombre de scenes utilisees :", s2.size());

print("NDVI moyen (zone d'etude) :", ndvi.reduceRegion({
  reducer: ee.Reducer.mean(),
  geometry: studyArea,
  scale: 10,
  maxPixels: 1e9
}));

// ─── 6. VISUALISATION ──────────────────────────────────────────
Map.centerObject(centerPoint, 11);

var trueColorVis = {
  bands: ["B4", "B3", "B2"],
  min: 0,
  max: 3000
};

var ndviVis = {
  min: -0.2,
  max: 0.8,
  palette: ["#7f1d1d", "#b45309", "#fef08a", "#4ade80", "#166534"]
};

var clippedImage = image.clip(studyArea);
var clippedNDVI = ndvi.clip(studyArea);

Map.addLayer(clippedImage, trueColorVis, "Composite vraies couleurs 2025-2026");
Map.addLayer(clippedNDVI, ndviVis, "NDVI 2025-2026");
Map.addLayer(studyArea, {color: "red"}, "Zone d'etude");

// ─── 7. LEGENDE NDVI ───────────────────────────────────────────
var legend = ui.Panel({
  style: {
    position: "bottom-left",
    padding: "8px 15px",
    backgroundColor: "rgba(255,255,255,0.85)"
  }
});

var legendTitle = ui.Label({
  value: "Legende NDVI",
  style: {
    fontWeight: "bold",
    fontSize: "14px",
    margin: "0 0 6px 0"
  }
});

legend.add(legendTitle);

var gradient = ee.Image.pixelLonLat().select("longitude");

var colorBar = ui.Thumbnail({
  image: gradient,
  params: {
    bbox: [0, 0, 100, 10],
    dimensions: "200x20",
    min: 0,
    max: 100,
    palette: ["#7f1d1d", "#b45309", "#fef08a", "#4ade80", "#166534"]
  },
  style: {
    stretch: "horizontal",
    margin: "0px 8px"
  }
});

legend.add(colorBar);

var labels = ui.Panel({
  layout: ui.Panel.Layout.flow("horizontal"),
  style: {
    stretch: "horizontal"
  }
});

var minLabel = ui.Label("-0.2");
minLabel.style().set({ width: "65px", textAlign: "left" });

var midLabel = ui.Label("0.3");
midLabel.style().set({ width: "70px", textAlign: "center" });

var maxLabel = ui.Label("0.8");
maxLabel.style().set({ width: "65px", textAlign: "right" });

labels.add(minLabel);
labels.add(midLabel);
labels.add(maxLabel);
legend.add(labels);

Map.add(legend);
