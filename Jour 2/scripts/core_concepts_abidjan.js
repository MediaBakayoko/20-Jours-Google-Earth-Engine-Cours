// ═══════════════════════════════════════════════════════════════
// Jour 2 : Concepts de base & JavaScript dans Google Earth Engine
// Adapte au District d'Abidjan (Cote d'Ivoire)
//
// Objectifs d'apprentissage :
//    • Maitriser variables, fonctions et structures de controle en GEE
//    • Comprendre et manipuler les Geometries (Point, Ligne, Polygone, Rectangle)
//    • Creer et gerer des Features et FeatureCollections
//    • Utiliser des Dictionnaires pour stocker des metadonnees
//    • Comprendre la difference critique Client vs Serveur
//    • Construire des fonctions reutilisables pour un code plus propre
// ═══════════════════════════════════════════════════════════════

// ─── 1. ZONE D'ETUDE (reprise du Jour 1) ──────────────────────
var studyArea = ee.Geometry.Rectangle({
  coords: [
    [-4.20, 5.20],
    [-3.80, 5.55]
  ],
  geodesic: false
});

var centerPoint = studyArea.centroid(1);

// ─── 2. MANIPULATION DES GEOMETRIES ───────────────────────────
// Point : Le Plateau (centre administratif/affaires d'Abidjan)
var point = ee.Geometry.Point([-4.0219, 5.3200]);
// Ligne : axe routier approximatif Plateau -> Cocody
var line = ee.Geometry.LineString([[-4.0219, 5.3200], [-3.9850, 5.3550]]);
// Polygone : zone urbaine centrale approximative
var polygon = ee.Geometry.Polygon([[
  [-4.05, 5.28],
  [-3.95, 5.28],
  [-3.95, 5.37],
  [-4.05, 5.37],
  [-4.05, 5.28]
]]);

// ─── 3. FEATURES & FEATURECOLLECTION ──────────────────────────
var feature = ee.Feature(point, {
  name: "Le Plateau (centre d'affaires)",
  type: "Centre administratif",
  population_estimee: 15000
});

var cities = ee.FeatureCollection([
  feature,
  ee.Feature(line, {name: "Axe Plateau-Cocody", type: "Infrastructure"}),
  ee.Feature(polygon, {name: "Zone urbaine centrale", type: "Zone"})
]);

// ─── 4. DICTIONNAIRES & VARIABLES ─────────────────────────────
var metadata = ee.Dictionary({
  cours: "20 Jours Google Earth Engine",
  jour: 2,
  theme: "Concepts de base & JavaScript",
  auteur: "Media Marcel Bakayoko",
  zone: "District d'Abidjan"
});

print("Metadonnees du cours:", metadata);

// ─── 5. CREATION D'UNE FONCTION REUTILISABLE ──────────────────
var addStudyLayers = function(geometry, name, color) {
  Map.addLayer(geometry, {color: color}, name);
  return geometry;
};

addStudyLayers(studyArea, "Zone d'etude (Rectangle)", "red");
addStudyLayers(point, "Point d'interet (Le Plateau)", "blue");
addStudyLayers(line, "Axe Plateau-Cocody (Ligne)", "yellow");

// ─── 6. CONCEPTS CLIENT vs SERVEUR ────────────────────────────
print("=== DEMONSTRATION CLIENT vs SERVEUR ===");

// Cote serveur (Earth Engine calcule reellement sur l'infrastructure Google)
var serverArea = studyArea.area(100).divide(1e6); // km2
print("Aire cote serveur (km2):", serverArea);

var polygonArea = polygon.area(100).divide(1e6);
print("Aire du polygone 'zone urbaine centrale' (km2):", polygonArea);

var lineLength = line.length(1).divide(1000);
print("Longueur de la ligne 'axe Plateau-Cocody' (km):", lineLength);

// Infos necessitant un aller-retour serveur pour recuperer la valeur
var clientInfo = {
  studyAreaType: studyArea.type(),
  featureCount: cities.size()
};
print("Infos (requete serveur) :", clientInfo);

// ─── 7. VISUALISATION ET CENTRAGE DE LA CARTE ─────────────────
Map.centerObject(centerPoint, 11);

Map.addLayer(cities, {color: "white"}, "FeatureCollection");

// ─── 8. PANNEAU D'INFORMATION ─────────────────────────────────
var infoPanel = ui.Panel({
  style: {
    position: "bottom-left",
    padding: "8px 15px",
    backgroundColor: "rgba(255,255,255,0.85)"
  }
});

var title = ui.Label({
  value: "Jour 2 : Concepts de base",
  style: {fontWeight: "bold", fontSize: "16px", margin: "0 0 8px 0"}
});

infoPanel.add(title);
infoPanel.add(ui.Label("• ee.Geometry -> Points, Lignes, Polygones, Rectangles"));
infoPanel.add(ui.Label("• ee.Feature -> Geometrie + Proprietes"));
infoPanel.add(ui.Label("• ee.FeatureCollection -> Groupe de features"));
infoPanel.add(ui.Label("• ee.Dictionary -> Metadonnees cle-valeur"));
infoPanel.add(ui.Label("• Fonctions -> Code reutilisable"));
infoPanel.add(ui.Label("• Client vs Serveur -> Concept cle de GEE"));

Map.add(infoPanel);
