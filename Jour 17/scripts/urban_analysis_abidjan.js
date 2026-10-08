// ═══════════════════════════════════════════════════════════════
// Urban Analysis – NDBI, Built-up & Nighttime Lights
// Adapte au District d'Abidjan (Cote d'Ivoire)
//
// Objectifs :
// • Calculer le NDBI (Normalized Difference Built-up Index)
// • Cartographier les zones baties / urbaines
// • Utiliser les donnees VIIRS nighttime lights
// • Comparer donnees optiques et lumieres nocturnes
// • Visualiser l'extension et l'intensite urbaine
// ═══════════════════════════════════════════════════════════════

// ─── 1. ZONE D'ETUDE - District d'Abidjan ─────────────────────
// Meme emprise que les analyses LST/LULC precedentes sur Abidjan,
// pour rester coherent avec les cartes deja publiees.
var studyArea = ee.Geometry.Rectangle({
  coords: [
    [-4.20, 5.20],
    [-3.80, 5.55]
  ],
  geodesic: false
});

var centerPoint = studyArea.centroid(1);

// ─── 2. CHARGEMENT ET PREPARATION SENTINEL-2 ──────────────────
function maskS2clouds(image) {
  var scl = image.select("SCL");
  var mask = scl.eq(4).or(scl.eq(5)).or(scl.eq(6)).or(scl.eq(7));
  return image.updateMask(mask);
}

// Fenetre elargie a 15 mois (lecon tiree des analyses LULC/LST precedentes :
// une seule saison seche laisse souvent des trous de couverture nuageuse
// sur Abidjan). Seuil nuage assoupli a 40% pour la meme raison.
var s2 = ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED")
  .filterBounds(studyArea)
  .filterDate("2025-07-01", "2026-09-30")
  .filterMetadata("CLOUDY_PIXEL_PERCENTAGE", "less_than", 40)
  .map(maskS2clouds)
  .median()
  .clip(studyArea);

print("Nombre d'images Sentinel-2 utilisees :",
  ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED")
    .filterBounds(studyArea)
    .filterDate("2025-07-01", "2026-09-30")
    .filterMetadata("CLOUDY_PIXEL_PERCENTAGE", "less_than", 40)
    .size());

// ─── 3. CALCUL DU NDBI ─────────────────────────────────────────
// NDBI = (SWIR - NIR) / (SWIR + NIR)
var ndbi = s2.normalizedDifference(["B11", "B8"]).rename("NDBI");

// Masque bati simple
var builtUp = ndbi.gt(0.1).selfMask();

// ─── 4. DONNEES VIIRS NIGHTTIME LIGHTS ────────────────────────
var viirs = ee.ImageCollection("NOAA/VIIRS/DNB/MONTHLY_V1/VCMSLCFG")
  .filterBounds(studyArea)
  .filterDate("2025-01-01", "2025-12-31")
  .select("avg_rad")
  .mean()
  .clip(studyArea);

// ─── 5. VISUALISATION ──────────────────────────────────────────
Map.centerObject(centerPoint, 11);

var visRGB = {
  bands: ["B4", "B3", "B2"],
  min: 0,
  max: 3000
};

var visNDBI = {
  min: -0.4,
  max: 0.4,
  palette: ["#0c4a6e", "#38bdf8", "#fef08a", "#f97316", "#7c2d12"]
};

var visNight = {
  min: 0,
  max: 30,
  palette: ["#000000", "#1a1a40", "#4b0082", "#ff4500", "#ffff00"]
};

Map.addLayer(s2, visRGB, "Composite vraies couleurs");
Map.addLayer(ndbi, visNDBI, "NDBI");
Map.addLayer(builtUp, {palette: ["#ff4500"]}, "Masque bati (NDBI > 0.1)");
Map.addLayer(viirs, visNight, "VIIRS Nighttime Lights (2025)");
Map.addLayer(studyArea, {color: "white"}, "Zone d'etude (District Abidjan)");

// ─── 6. STATISTIQUES ───────────────────────────────────────────
var builtUpStats = builtUp.multiply(ee.Image.pixelArea()).reduceRegion({
  reducer: ee.Reducer.sum(),
  geometry: studyArea,
  scale: 10,
  maxPixels: 1e9
});

var nightStats = viirs.reduceRegion({
  reducer: ee.Reducer.mean().combine(ee.Reducer.max(), null, true),
  geometry: studyArea,
  scale: 500,
  maxPixels: 1e9
});

print("=== Statistiques urbaines - District d'Abidjan ===");
print("Surface batie (m2):", builtUpStats);
print("Statistiques lumieres nocturnes:", nightStats);

// ─── 7. PANNEAU D'INFORMATION ──────────────────────────────────
var infoPanel = ui.Panel({
  style: {
    position: "bottom-left",
    padding: "8px 15px",
    backgroundColor: "rgba(255,255,255,0.85)"
  }
});

var title = ui.Label({
  value: "Analyse urbaine - District d'Abidjan",
  style: {fontWeight: "bold", fontSize: "16px", margin: "0 0 8px 0"}
});

infoPanel.add(title);
infoPanel.add(ui.Label("• NDBI -> indice du bati (SWIR & NIR)"));
infoPanel.add(ui.Label("• Masque bati -> NDBI > 0.1"));
infoPanel.add(ui.Label("• VIIRS -> intensite des lumieres nocturnes"));
infoPanel.add(ui.Label("• Comparaison optique vs lumieres nocturnes"));
infoPanel.add(ui.Label("Voir la Console pour les statistiques"));

Map.add(infoPanel);
