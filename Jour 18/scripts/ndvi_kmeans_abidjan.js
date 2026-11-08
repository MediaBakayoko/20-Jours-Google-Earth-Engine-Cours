// ═══════════════════════════════════════════════════════════════
// Jour 18 : Classification occupation du sol par seuillage NDVI + KMeans
// Adapte au District d'Abidjan (Cote d'Ivoire)
// Inspire de la serie de tutoriels PySTAC "Sentinel-2 Land Cover
// Threshold Analysis using NDVI and KMeans in Python"
//
// Objectifs d'apprentissage :
//    • Calculer un NDVI a partir d'un composite Sentinel-2 propre
//    • Classer l'occupation du sol par seuillage simple du NDVI
//    • Comparer ce seuillage a un clustering non supervise (KMeans)
//    • Comprendre les limites d'une classification non supervisee
//      sans donnees d'entrainement reelles
// ═══════════════════════════════════════════════════════════════

// ─── 1. ZONE D'ETUDE (meme emprise que les jours precedents) ──
var studyArea = ee.Geometry.Rectangle({
  coords: [
    [-4.20, 5.20],
    [-3.80, 5.55]
  ],
  geodesic: false
});

var centerPoint = studyArea.centroid(1);

// ─── 2. COMPOSITE SENTINEL-2 SANS NUAGE (Cloud Score+) ────────
// Fenetre elargie a 15 mois + seuil nuage assoupli : lecon tiree des
// Jours 1/3/17 sur cette meme zone (forte nebulosite equatoriale).
var s2 = ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED")
  .filterBounds(studyArea)
  .filterDate("2025-07-01", "2026-09-30")
  .filterMetadata("CLOUDY_PIXEL_PERCENTAGE", "less_than", 40);

var csPlus = ee.ImageCollection("GOOGLE/CLOUD_SCORE_PLUS/V1/S2_HARMONIZED");
var s2WithCs = s2.linkCollection(csPlus, ["cs_cdf"]);

var composite = s2WithCs
  .map(function (img) {
    return img.updateMask(img.select("cs_cdf").gte(0.65));
  })
  .median()
  .clip(studyArea);

// ─── 3. CALCUL DU NDVI ──────────────────────────────────────────
var ndvi = composite.normalizedDifference(["B8", "B4"]).rename("NDVI");

// ─── 4. CLASSIFICATION PAR SEUILLAGE NDVI (methode 1) ──────────
// 4 classes inspirees du tutoriel : eau/sol nu, sol clairseme,
// vegetation moderee, vegetation dense.
var thresholdClasses = ee.Image(0)
  .where(ndvi.lt(0.1), 1)   // Eau / sol nu / bati
  .where(ndvi.gte(0.1).and(ndvi.lt(0.3)), 2)   // Vegetation clairsemee
  .where(ndvi.gte(0.3).and(ndvi.lt(0.5)), 3)   // Vegetation moderee
  .where(ndvi.gte(0.5), 4)   // Vegetation dense
  .rename("classe_seuillage")
  .clip(studyArea);

// ─── 5. CLASSIFICATION NON SUPERVISEE KMEANS (methode 2) ───────
var trainingBands = composite.select(["B2", "B3", "B4", "B8"]).addBands(ndvi);
var training = trainingBands.sample({
  region: studyArea,
  scale: 20,
  numPixels: 5000,
  seed: 42
});

var clusterer = ee.Clusterer.wekaKMeans(4).train(training);
var kmeansResult = trainingBands.cluster(clusterer).rename("classe_kmeans").clip(studyArea);

// ─── 6. VISUALISATION ────────────────────────────────────────────
Map.centerObject(centerPoint, 11);

var visRGB = {bands: ["B4", "B3", "B2"], min: 0, max: 3000};
var visNDVI = {min: -0.2, max: 0.8, palette: ["#7f1d1d", "#b45309", "#fef08a", "#4ade80", "#166534"]};
var visClasses = {min: 1, max: 4, palette: ["#d73027", "#fdae61", "#a6d96a", "#1a9850"]};

Map.addLayer(composite, visRGB, "Composite vraies couleurs");
Map.addLayer(ndvi, visNDVI, "NDVI");
Map.addLayer(thresholdClasses, visClasses, "Classes par seuillage NDVI");
Map.addLayer(kmeansResult, {min: 0, max: 3, palette: ["#d73027", "#fdae61", "#a6d96a", "#1a9850"]}, "Classes KMeans");
Map.addLayer(studyArea, {color: "white"}, "Zone d'etude (District Abidjan)");

// ─── 7. STATISTIQUES ─────────────────────────────────────────────
var histThreshold = thresholdClasses.reduceRegion({
  reducer: ee.Reducer.frequencyHistogram(),
  geometry: studyArea,
  scale: 20,
  maxPixels: 1e9
});

var histKmeans = kmeansResult.reduceRegion({
  reducer: ee.Reducer.frequencyHistogram(),
  geometry: studyArea,
  scale: 20,
  maxPixels: 1e9
});

print("=== Jour 18 : NDVI + classification occupation du sol ===");
print("Histogramme classes par seuillage NDVI :", histThreshold);
print("Histogramme classes KMeans :", histKmeans);

// ─── 8. PANNEAU D'INFORMATION ────────────────────────────────────
var infoPanel = ui.Panel({
  style: {
    position: "bottom-left",
    padding: "8px 15px",
    backgroundColor: "rgba(255,255,255,0.85)"
  }
});

var title = ui.Label({
  value: "Jour 18 : NDVI + KMeans - District d'Abidjan",
  style: {fontWeight: "bold", fontSize: "16px", margin: "0 0 8px 0"}
});

infoPanel.add(title);
infoPanel.add(ui.Label("• NDVI -> indice de vegetation"));
infoPanel.add(ui.Label("• Seuillage -> 4 classes fixes (regles manuelles)"));
infoPanel.add(ui.Label("• KMeans -> 4 clusters non supervises"));
infoPanel.add(ui.Label("• Les 2 methodes ne se correspondent pas forcement"));
infoPanel.add(ui.Label("Voir la Console pour les histogrammes"));

Map.add(infoPanel);
