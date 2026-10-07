# -*- coding: utf-8 -*-
"""Generate avatars/expert.png for soul-expert CodeBuddy plugin.

Theme: dual-agent loop - two agent orbs (blue/orange) orbiting a shared
center, connected by a circular loop arrow, with an evolution star in the
middle. Rendered at 4x supersampling for anti-aliasing, downsampled to
512x512 PNG (<=500KB target).
"""
import os

from PIL import Image, ImageDraw, ImageFilter, ImageFont

OUT = r"D:\stigmergy-CLI-Multi-Agents\docs\strategy\soul-expert\avatars\expert.png"
SS = 4                # supersample factor
SIZE = 512 * SS       # canvas at 4x
S = 512               # final size

BG_TOP = (23, 22, 52)        # deep indigo
BG_BOT = (38, 38, 88)        # slightly lighter indigo
ORB_A = (66, 133, 244)       # blue
ORB_B = (244, 160, 66)       # orange
LOOP = (200, 200, 230)       # loop arrow color
STAR = (255, 214, 90)        # gold star

CX = SIZE / 2
CY = SIZE / 2
R_ORB = SIZE * 0.145
R_ORBIT = SIZE * 0.30
R_STAR = SIZE * 0.115


def lerp(a, b, t):
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))


def make_bg(draw):
    for y in range(SIZE):
        t = y / SIZE
        draw.line([(0, y), (SIZE, y)], fill=lerp(BG_TOP, BG_BOT, t))


def draw_orb(draw, cx, cy, r, color, glow=True):
    # glow
    if glow:
        g = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
        gd = ImageDraw.Draw(g)
        for ring in range(6, 0, -1):
            alpha = int(26 / ring)
            rr = r * (1 + ring * 0.14)
            gd.ellipse([cx - rr, cy - rr, cx + rr, cy + rr],
                       fill=(color[0], color[1], color[2], alpha))
        g = g.filter(ImageFilter.GaussianBlur(SIZE * 0.02))
        draw._image.alpha_composite(g)
    # main ball with radial highlight
    grad = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    gd = ImageDraw.Draw(grad)
    gd.ellipse([cx - r, cy - r, cx + r, cy + r], fill=color + (255,))
    grad = grad.filter(ImageFilter.GaussianBlur(SIZE * 0.004))
    draw._image.alpha_composite(grad)
    # specular highlight
    hx, hy = cx - r * 0.35, cy - r * 0.4
    hr = r * 0.42
    gd2 = ImageDraw.Draw(draw._image)
    gd2.ellipse([hx - hr, hy - hr, hx + hr, hy + hr],
                fill=(255, 255, 255, 60))
    gd2.ellipse([hx - hr * 0.5, hy - hr * 0.5, hx + hr * 0.35, hy + hr * 0.35],
                fill=(255, 255, 255, 110))


def draw_loop_arrow(draw):
    """Two arc-arrows on the orbit circle, showing continuous loop."""
    for (start_deg, end_deg, color) in [
        (-20, 160, ORB_A),      # upper arc (blue)
        (160, 340, ORB_B),      # lower arc (orange)
    ]:
        draw.arc([CX - R_ORBIT, CY - R_ORBIT, CX + R_ORBIT, CY + R_ORBIT],
                 start=start_deg, end=end_deg, fill=color + (230,),
                 width=int(SIZE * 0.022))
        # arrowheads at arc ends
        import math
        for deg in (end_deg, start_deg):
            rad = math.radians(deg)
            x = CX + R_ORBIT * math.cos(rad)
            y = CY + R_ORBIT * math.sin(rad)
            tip = (x, y)
            # tangent direction
            t = rad + math.pi / 2
            tx = math.cos(t)
            ty = math.sin(t)
            if deg == start_deg:
                tx, ty = -tx, -ty
            base1 = (x - tx * SIZE * 0.045 - math.cos(rad) * SIZE * 0.0,
                     y - ty * SIZE * 0.045 - math.sin(rad) * SIZE * 0.0)
            wing = SIZE * 0.034
            # draw triangle tip
            p1 = (x + tx * wing, y + ty * wing)
            p2 = (x - tx * wing, y - ty * wing)
            p3 = (x - math.cos(rad) * wing, y - math.sin(rad) * wing)
            draw.polygon([p1, p2, p3], fill=color + (255,))


def draw_star(draw, cx, cy, r):
    """5-point star (evolution/growth symbol)."""
    import math
    pts = []
    for i in range(10):
        ang = -math.pi / 2 + i * math.pi / 5
        rr = r if i % 2 == 0 else r * 0.45
        pts.append((cx + rr * math.cos(ang), cy + rr * math.sin(ang)))
    draw.polygon(pts, fill=STAR + (255,))
    # glow
    g = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    gd = ImageDraw.Draw(g)
    gd.ellipse([cx - r * 2, cy - r * 2, cx + r * 2, cy + r * 2],
               fill=(255, 214, 90, 36))
    g = g.filter(ImageFilter.GaussianBlur(SIZE * 0.012))
    draw._image.alpha_composite(g)


def main():
    img = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    make_bg(draw)

    # soft rounded-square mask (avatar platform look)
    mask = Image.new("L", (SIZE, SIZE), 0)
    md = ImageDraw.Draw(mask)
    rad = SIZE * 0.16
    md.rounded_rectangle([0, 0, SIZE - 1, SIZE - 1], radius=rad, fill=255)
    img.putalpha(mask)

    draw = ImageDraw.Draw(img)

    # orbit arcs with arrowheads
    draw_loop_arrow(draw)

    # two agent orbs on the orbit
    import math
    a1 = math.radians(70)
    a2 = math.radians(250)
    draw_orb(draw, CX + R_ORBIT * math.cos(a1), CY + R_ORBIT * math.sin(a1),
             R_ORB, ORB_A)
    draw_orb(draw, CX + R_ORBIT * math.cos(a2), CY + R_ORBIT * math.sin(a2),
             R_ORB, ORB_B)

    # evolution star in center
    draw_star(draw, CX, CY, R_STAR)

    # downscale with anti-aliasing
    img = img.resize((S, S), Image.Resampling.LANCZOS).convert("RGB")
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    img.save(OUT, "PNG", optimize=True)
    size_kb = os.path.getsize(OUT) / 1024
    print(f"OK {OUT} {img.size[0]}x{img.size[1]} {size_kb:.1f}KB")


if __name__ == "__main__":
    main()