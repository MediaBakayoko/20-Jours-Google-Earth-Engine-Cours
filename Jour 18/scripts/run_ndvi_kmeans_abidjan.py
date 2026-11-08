#!/usr/bin/env python3
"""
Jour 18 : Classification occupation du sol par seuillage NDVI + KMeans
District d'Abidjan, Cote d'Ivoire -- execution reelle via l'API Python
Earth Engine (traduction du script JS ndvi_kmeans_abidjan.js).

Produit :
- maps/01_ndvi_abidjan.tif / .png (avec legende)
- maps/02_classes_seuillage_abidjan.tif / .png (avec legende)
- maps/03_classes_kmeans_abidjan.tif / .png (avec legende)
- data/stats.json (histogrammes reels, surfaces par classe)
"""
import json
from pathlib import Path

import ee
import numpy as np
import rasterio
import requests
from PIL import Image, ImageDraw, ImageFont

CREDENTIALS_PATH = "C:/Users/ASUS/Downloads/ornate-serenity-509219-d5-08760d05d66d.json"
BASE_DIR = Path(__file__).resolve().parent.parent
MAPS_DIR = BASE_DIR / "maps"
DATA_DIR = BASE_DIR / "data"
MAPS_DIR.mkdir(parents=True, exist_ok=True)
DATA_DIR.mkdir(parents=True, exist_ok=True)

STUDY_AREA_COORDS = [[-4.20, 5.20], [-3.80, 5.55]]


def init_ee():
    with open(CREDENTIALS_PATH) as f:
        info = json.load(f)
    credentials = ee.ServiceAccountCredentials(info["client_email"], CREDENTIALS_PATH)
    ee.Initialize(credentials)
    print("GEE initialise avec le compte de service :", info["client_email"])


def build_study_area():
    return ee.Geometry.Rectangle(coords=STUDY_AREA_COORDS, geodesic=False)


def build_cloud_free_composite(study_area):
    s2 = (
        ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED")
        .filterBounds(study_area)
        .filterDate("2025-07-01", "2026-09-30")
        .filterMetadata("CLOUDY_PIXEL_PERCENTAGE", "less_than", 40)
    )
    n_scenes = s2.size().getInfo()
    print(f"Nombre de scenes Sentinel-2 (cloud < 40%) : {n_scenes}")

    cs_plus = ee.ImageCollection("GOOGLE/CLOUD_SCORE_PLUS/V1/S2_HARMONIZED")
    s2_with_cs = s2.linkCollection(cs_plus, ["cs_cdf"])

    def mask_clouds(img):
        return img.updateMask(img.select("cs_cdf").gte(0.65))

    composite = s2_with_cs.map(mask_clouds).median().clip(study_area)
    return composite, n_scenes


def download_geotiff(image, band_names, filename, region, scale=20):
    url = image.select(band_names).getDownloadURL({
        "region": region,
        "scale": scale,
        "format": "GEO_TIFF",
    })
    resp = requests.get(url, timeout=120)
    resp.raise_for_status()
    path = MAPS_DIR / filename
    path.write_bytes(resp.content)
    print(f"GeoTIFF ecrit : {path} ({len(resp.content)/1024:.0f} Ko)")
    return path


COLOR_STOPS_NDVI = [
    (0.0, (127, 29, 29)), (0.25, (180, 83, 9)), (0.5, (254, 240, 138)),
    (0.75, (74, 222, 128)), (1.0, (22, 101, 52)),
]
CLASS_COLORS = {1: (215, 48, 39), 2: (253, 174, 97), 3: (166, 217, 106), 4: (26, 152, 80)}
CLASS_LABELS_THRESHOLD = {
    1: "Eau / sol nu / bati (NDVI < 0.1)",
    2: "Vegetation clairsemee (0.1-0.3)",
    3: "Vegetation moderee (0.3-0.5)",
    4: "Vegetation dense (NDVI >= 0.5)",
}
CLUSTER_LABELS_NOTE = "Cluster KMeans (non supervise, sans correspondance directe garantie avec le seuillage)"


def interpolate_color(value, stops):
    positions = [s[0] for s in stops]
    r = np.interp(value, positions, [s[1][0] for s in stops])
    g = np.interp(value, positions, [s[1][1] for s in stops])
    b = np.interp(value, positions, [s[1][2] for s in stops])
    return r, g, b


def render_continuous_png(tif_path, out_path, vmin, vmax, title, subtitle):
    with rasterio.open(tif_path) as src:
        arr = src.read(1).astype(float)
        nodata_mask = src.read_masks(1) == 0

    norm = np.clip((arr - vmin) / (vmax - vmin), 0, 1)
    r, g, b = interpolate_color(norm, COLOR_STOPS_NDVI)
    rgb = np.stack([r, g, b], axis=-1).astype(np.uint8)
    alpha = np.where(nodata_mask, 0, 255).astype(np.uint8)
    rgba = np.dstack([rgb, alpha])

    img = Image.fromarray(rgba, mode="RGBA")
    if img.width < 450:
        scale = 450 / img.width
        img = img.resize((int(img.width * scale), int(img.height * scale)), Image.NEAREST)

    legend_h = 90
    canvas = Image.new("RGBA", (img.width, img.height + legend_h), (255, 255, 255, 255))
    canvas.paste(img, (0, legend_h))
    draw = ImageDraw.Draw(canvas)
    draw.text((10, 8), title, fill=(20, 20, 20))
    draw.text((10, 26), subtitle, fill=(80, 80, 80))

    bar_w = img.width - 20
    for x in range(bar_w):
        t = x / bar_w
        rr, gg, bb = interpolate_color(t, COLOR_STOPS_NDVI)
        draw.line([(10 + x, 50), (10 + x, 70)], fill=(int(rr), int(gg), int(bb)))
    draw.text((10, 72), f"{vmin}", fill=(20, 20, 20))
    draw.text((img.width - 40, 72), f"{vmax}", fill=(20, 20, 20))

    canvas.convert("RGB").save(out_path)
    print(f"PNG avec legende ecrit : {out_path}")


def render_classes_png(tif_path, out_path, title, subtitle, labels):
    with rasterio.open(tif_path) as src:
        arr = src.read(1)
        nodata_mask = src.read_masks(1) == 0

    rgb = np.zeros((*arr.shape, 3), dtype=np.uint8)
    for class_val, color in CLASS_COLORS.items():
        rgb[arr == class_val] = color
    alpha = np.where(nodata_mask, 0, 255).astype(np.uint8)
    rgba = np.dstack([rgb, alpha])

    img = Image.fromarray(rgba, mode="RGBA")
    if img.width < 450:
        scale = 450 / img.width
        img = img.resize((int(img.width * scale), int(img.height * scale)), Image.NEAREST)

    n_classes = len(labels)
    legend_h = 40 + n_classes * 22
    canvas = Image.new("RGBA", (img.width, img.height + legend_h), (255, 255, 255, 255))
    canvas.paste(img, (0, legend_h))
    draw = ImageDraw.Draw(canvas)
    draw.text((10, 8), title, fill=(20, 20, 20))
    draw.text((10, 26), subtitle, fill=(80, 80, 80))

    y = 44
    for class_val, label in labels.items():
        color = CLASS_COLORS.get(class_val, (128, 128, 128))
        draw.rectangle([10, y, 28, y + 16], fill=color)
        draw.text((34, y), label, fill=(20, 20, 20))
        y += 22

    canvas.convert("RGB").save(out_path)
    print(f"PNG classes avec legende ecrit : {out_path}")


def main():
    init_ee()
    study_area = build_study_area()
    composite, n_scenes = build_cloud_free_composite(study_area)

    ndvi = composite.normalizedDifference(["B8", "B4"]).rename("NDVI")

    threshold_classes = (
        ee.Image(0)
        .where(ndvi.lt(0.1), 1)
        .where(ndvi.gte(0.1).And(ndvi.lt(0.3)), 2)
        .where(ndvi.gte(0.3).And(ndvi.lt(0.5)), 3)
        .where(ndvi.gte(0.5), 4)
        .rename("classe_seuillage")
        .clip(study_area)
    )

    training_bands = composite.select(["B2", "B3", "B4", "B8"]).addBands(ndvi)
    training = training_bands.sample(region=study_area, scale=20, numPixels=5000, seed=42)
    clusterer = ee.Clusterer.wekaKMeans(4).train(training)
    kmeans_result = training_bands.cluster(clusterer).rename("classe_kmeans").clip(study_area)
    # Decalage +1 pour harmoniser l'echelle d'affichage avec le seuillage (1-4)
    kmeans_display = kmeans_result.add(1)

    region = study_area.bounds()

    ndvi_tif = download_geotiff(ndvi, ["NDVI"], "01_ndvi_abidjan.tif", region, scale=20)
    thresh_tif = download_geotiff(threshold_classes, ["classe_seuillage"], "02_classes_seuillage_abidjan.tif", region, scale=20)
    kmeans_tif = download_geotiff(kmeans_display, ["classe_kmeans"], "03_classes_kmeans_abidjan.tif", region, scale=20)

    render_continuous_png(
        ndvi_tif, MAPS_DIR / "01_ndvi_abidjan.png", vmin=-0.2, vmax=0.8,
        title="Jour 18 - NDVI, District d'Abidjan",
        subtitle="Sentinel-2 (Cloud Score+ >= 0.65), composite median",
    )
    render_classes_png(
        thresh_tif, MAPS_DIR / "02_classes_seuillage_abidjan.png",
        title="Jour 18 - Classes par seuillage NDVI",
        subtitle="Regles manuelles fixes (methode 1)",
        labels=CLASS_LABELS_THRESHOLD,
    )
    render_classes_png(
        kmeans_tif, MAPS_DIR / "03_classes_kmeans_abidjan.png",
        title="Jour 18 - Classes KMeans (non supervise)",
        subtitle="4 clusters, bandes B2/B3/B4/B8+NDVI (methode 2)",
        labels={k: f"Cluster {k} ({CLUSTER_LABELS_NOTE})" for k in CLASS_COLORS},
    )

    hist_threshold = threshold_classes.reduceRegion(
        reducer=ee.Reducer.frequencyHistogram(), geometry=study_area, scale=20, maxPixels=1e9
    ).getInfo()
    hist_kmeans = kmeans_result.reduceRegion(
        reducer=ee.Reducer.frequencyHistogram(), geometry=study_area, scale=20, maxPixels=1e9
    ).getInfo()

    pixel_area_m2 = 20 * 20
    stats = {
        "zone_etude": "District d'Abidjan, Cote d'Ivoire",
        "bbox": STUDY_AREA_COORDS,
        "periode_composite": "2025-07-01 a 2026-09-30",
        "n_scenes_sentinel2": n_scenes,
        "seuil_nuage_cloudy_pixel_pct": 40,
        "seuil_cloud_score_plus": 0.65,
        "resolution_export_m": 20,
        "histogramme_seuillage_pixels": hist_threshold.get("classe_seuillage", {}),
        "histogramme_kmeans_pixels": hist_kmeans.get("classe_kmeans", {}),
        "surface_par_classe_seuillage_km2": {
            k: round(v * pixel_area_m2 / 1e6, 2) for k, v in hist_threshold.get("classe_seuillage", {}).items()
        },
        "surface_par_classe_kmeans_km2": {
            k: round(v * pixel_area_m2 / 1e6, 2) for k, v in hist_kmeans.get("classe_kmeans", {}).items()
        },
        "labels_classes_seuillage": CLASS_LABELS_THRESHOLD,
        "avertissement_kmeans": (
            "Les clusters KMeans sont non supervises -- leur numerotation (0,1,2,3) n'a "
            "aucune correspondance garantie avec les classes de seuillage NDVI (1-4). "
            "Une interpretation des clusters requiert une inspection visuelle/qualitative, "
            "jamais une correspondance numerique automatique."
        ),
    }
    stats_path = DATA_DIR / "stats.json"
    stats_path.write_text(json.dumps(stats, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Statistiques ecrites : {stats_path}")
    print(json.dumps(stats, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
