#!/usr/bin/env python3
"""
Regenere les PNG avec legende du Jour 18 a partir des GeoTIFF deja
exportes -- correction de lisibilite : legende avec police chargee a
taille proportionnelle a la resolution de l'image (le rendu precedent
utilisait la police par defaut PIL, minuscule sur des images 2000px+).
"""
from pathlib import Path

import numpy as np
import rasterio
from PIL import Image, ImageDraw, ImageFont

BASE_DIR = Path(__file__).resolve().parent.parent
MAPS_DIR = BASE_DIR / "maps"

FONT_BOLD = "C:/Windows/Fonts/arialbd.ttf"
FONT_REGULAR = "C:/Windows/Fonts/arial.ttf"

COLOR_STOPS_NDVI = [
    (0.0, (127, 29, 29)), (0.25, (180, 83, 9)), (0.5, (254, 240, 138)),
    (0.75, (74, 222, 128)), (1.0, (22, 101, 52)),
]
CLASS_COLORS = {1: (215, 48, 39), 2: (253, 174, 97), 3: (166, 217, 106), 4: (26, 152, 80)}
CLASS_LABELS_THRESHOLD = {
    1: "Eau / sol nu / bati (NDVI < 0.1)",
    2: "Vegetation clairsemee (0.1 - 0.3)",
    3: "Vegetation moderee (0.3 - 0.5)",
    4: "Vegetation dense (NDVI >= 0.5)",
}
CLUSTER_LABELS = {
    1: "Cluster 1 (non supervise)",
    2: "Cluster 2 (non supervise)",
    3: "Cluster 3 (non supervise)",
    4: "Cluster 4 (non supervise)",
}


def interpolate_color(value, stops):
    positions = [s[0] for s in stops]
    r = np.interp(value, positions, [s[1][0] for s in stops])
    g = np.interp(value, positions, [s[1][1] for s in stops])
    b = np.interp(value, positions, [s[1][2] for s in stops])
    return r, g, b


def scaled_fonts(img_width):
    """Taille de police proportionnelle a la largeur reelle de l'image,
    avec un plancher lisible meme sur les petites images."""
    unit = max(img_width / 70, 22)
    title_size = int(unit * 1.5)
    subtitle_size = int(unit * 1.05)
    label_size = int(unit * 1.15)
    return (
        ImageFont.truetype(FONT_BOLD, title_size),
        ImageFont.truetype(FONT_REGULAR, subtitle_size),
        ImageFont.truetype(FONT_BOLD, label_size),
    )


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
    if img.width < 1400:
        scale = 1400 / img.width
        img = img.resize((int(img.width * scale), int(img.height * scale)), Image.NEAREST)

    font_title, font_subtitle, font_label = scaled_fonts(img.width)
    margin = int(img.width * 0.02)
    bar_h = int(img.width * 0.022)
    legend_h = int(img.width * 0.14)

    canvas = Image.new("RGB", (img.width, img.height + legend_h), (255, 255, 255))
    canvas.paste(img.convert("RGB"), (0, legend_h))
    draw = ImageDraw.Draw(canvas)

    y = margin
    draw.text((margin, y), title, fill=(20, 20, 20), font=font_title)
    y += int(font_title.size * 1.3)
    draw.text((margin, y), subtitle, fill=(90, 90, 90), font=font_subtitle)
    y += int(font_subtitle.size * 1.5)

    bar_w = img.width - 2 * margin
    bar_y = y
    for x in range(bar_w):
        t = x / bar_w
        rr, gg, bb = interpolate_color(t, COLOR_STOPS_NDVI)
        draw.line([(margin + x, bar_y), (margin + x, bar_y + bar_h)], fill=(int(rr), int(gg), int(bb)))
    draw.rectangle([margin, bar_y, margin + bar_w, bar_y + bar_h], outline=(60, 60, 60), width=2)

    label_y = bar_y + bar_h + int(font_label.size * 0.3)
    draw.text((margin, label_y), f"{vmin}", fill=(20, 20, 20), font=font_label)
    max_text = f"{vmax}"
    tw = draw.textlength(max_text, font=font_label)
    draw.text((margin + bar_w - tw, label_y), max_text, fill=(20, 20, 20), font=font_label)
    mid_text = "NDVI"
    mtw = draw.textlength(mid_text, font=font_label)
    draw.text((margin + bar_w / 2 - mtw / 2, label_y), mid_text, fill=(20, 20, 20), font=font_label)

    canvas.save(out_path)
    print(f"PNG regenere : {out_path} ({canvas.width}x{canvas.height})")


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
    if img.width < 1400:
        scale = 1400 / img.width
        img = img.resize((int(img.width * scale), int(img.height * scale)), Image.NEAREST)

    font_title, font_subtitle, font_label = scaled_fonts(img.width)
    margin = int(img.width * 0.02)
    swatch = int(font_label.size * 1.3)
    n_classes = len(labels)
    legend_h = margin + int(font_title.size * 1.3) + int(font_subtitle.size * 1.6) + n_classes * int(swatch * 1.35) + margin

    canvas = Image.new("RGB", (img.width, img.height + legend_h), (255, 255, 255))
    canvas.paste(img.convert("RGB"), (0, legend_h))
    draw = ImageDraw.Draw(canvas)

    y = margin
    draw.text((margin, y), title, fill=(20, 20, 20), font=font_title)
    y += int(font_title.size * 1.3)
    draw.text((margin, y), subtitle, fill=(90, 90, 90), font=font_subtitle)
    y += int(font_subtitle.size * 1.6)

    for class_val, label in labels.items():
        color = CLASS_COLORS.get(class_val, (128, 128, 128))
        draw.rectangle([margin, y, margin + swatch, y + swatch], fill=color, outline=(60, 60, 60), width=2)
        draw.text((margin + swatch + int(margin * 0.6), y + swatch // 2 - font_label.size // 2), label, fill=(20, 20, 20), font=font_label)
        y += int(swatch * 1.35)

    canvas.save(out_path)
    print(f"PNG regenere : {out_path} ({canvas.width}x{canvas.height})")


def main():
    render_continuous_png(
        MAPS_DIR / "01_ndvi_abidjan.tif", MAPS_DIR / "01_ndvi_abidjan.png",
        vmin=-0.2, vmax=0.8,
        title="Jour 18 - NDVI, District d'Abidjan",
        subtitle="Sentinel-2 (Cloud Score+ >= 0.65), composite median, 77 scenes",
    )
    render_classes_png(
        MAPS_DIR / "02_classes_seuillage_abidjan.tif", MAPS_DIR / "02_classes_seuillage_abidjan.png",
        title="Jour 18 - Classes par seuillage NDVI",
        subtitle="Regles manuelles fixes (methode 1) - District d'Abidjan",
        labels=CLASS_LABELS_THRESHOLD,
    )
    render_classes_png(
        MAPS_DIR / "03_classes_kmeans_abidjan.tif", MAPS_DIR / "03_classes_kmeans_abidjan.png",
        title="Jour 18 - Classes KMeans (non supervise)",
        subtitle="4 clusters, bandes B2/B3/B4/B8 + NDVI (methode 2)",
        labels=CLUSTER_LABELS,
    )


if __name__ == "__main__":
    main()
