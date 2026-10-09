// ═══════════════════════════════════════════════════════════════
// Jour 3 : Image vs ImageCollection - Approfondissement
// Adapte au District d'Abidjan (Cote d'Ivoire)
//
// Objectifs d'apprentissage :
//    • Comprendre la difference entre Image et ImageCollection
//    • Apprendre a manipuler des images individuelles
//    • Maitriser mosaicking, clipping, selection de bandes, ajout de bandes
//    • Combiner plusieurs images et creer des composites
//    • Pratiquer les techniques courantes de manipulation d'images
// ═══════════════════════════════════════════════════════════════

// ─── 1. ZONE D'ETUDE (reprise des jours precedents) ───────────
var studyArea = ee.Geometry.Rectangle({
  coords: [
    [-4.20, 5.20],
    [-3.80, 5.55]
  ],
  geodesic: false
});

var centerPoint = studyArea.centroid(1);

// ─── 2. CHARGEMENT DE LA COLLECTION D'IMAGES ──────────────────
// Fenetre elargie a 15 mois + seuil nuage 40% (confirme necessaire aux
// Jours 1 et 17 sur cette meme zone, forte nebulosite equatoriale).
var s2 = ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED")
  .filterBounds(studyArea)
  .filterDate("2025-07-01", "2026-09-30")
  .filterMetadata("CLOUDY_PIXEL_PERCENTAGE", "less_than", 40);

// ─── 3. IMAGE UNIQUE vs COLLECTION ────────────────────────────
var firstImage = s2.first();                    // Image unique
var medianImage = s2.median();                  // Composite depuis la collection

print("ID de la premiere image :", firstImage.id());
print("Nombre d'images dans la collection :", s2.size());

// ─── 4. OPERATIONS DE BASE SUR LES IMAGES ─────────────────────
var clippedImage = medianImage.clip(studyArea);

var rgb = clippedImage.select(["B4", "B3", "B2"]);
var nir = clippedImage.select("B8");

var ndvi = clippedImage.normalizedDifference(["B8", "B4"]).rename("NDVI");
var imageWithNDVI = clippedImage.addBands(ndvi);

// ─── 5. MOSAICKING ─────────────────────────────────────────────
var mosaic = s2.mosaic().clip(studyArea);   // Mosaique simple (derniere image au-dessus)

// ─── 6. VISUALISATION ──────────────────────────────────────────
Map.centerObject(centerPoint, 11);

var visRGB = {bands: ["B4", "B3", "B2"], min: 0, max: 3000};
var visNDVI = {min: -0.2, max: 0.8, palette: ["#7f1d1d", "#b45309", "#fef08a", "#4ade80", "#166534"]};

Map.addLayer(rgb, visRGB, "RGB (Median)");
Map.addLayer(mosaic, visRGB, "Mosaic");
Map.addLayer(ndvi, visNDVI, "NDVI");
Map.addLayer(studyArea, {color: "red"}, "Zone d'etude");

// ─── 7. PANNEAU D'INFORMATION ─────────────────────────────────
var infoPanel = ui.Panel({
  style: {
    position: "bottom-left",
    padding: "8px 15px",
    backgroundColor: "rgba(255,255,255,0.85)"
  }
});

var title = ui.Label({
  value: "Jour 3 : Image vs ImageCollection",
  style: {fontWeight: "bold", fontSize: "16px", margin: "0 0 8px 0"}
});

infoPanel.add(title);
infoPanel.add(ui.Label("• Image = Scene unique"));
infoPanel.add(ui.Label("• ImageCollection = Pile d'images"));
infoPanel.add(ui.Label("• .clip() -> Restreindre a une zone"));
infoPanel.add(ui.Label("• .select() -> Choisir des bandes"));
infoPanel.add(ui.Label("• .addBands() -> Ajouter des bandes calculees"));
infoPanel.add(ui.Label("• .mosaic() -> Combiner des images"));

Map.add(infoPanel);
