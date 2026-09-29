import json, io, math

# Lambert conformal conic — Statistics Canada's standard parameters for
# national maps (standard parallels 49N and 77N, central meridian 91.867W).
# Public-domain geometry from Natural Earth, projected here rather than
# lifted from someone's SVG, so nothing carries a share-alike licence.
LAT1, LAT2, LAT0, LON0 = 49.0, 77.0, 49.0, -91.866667
r = math.radians
n = math.log(math.cos(r(LAT1)) / math.cos(r(LAT2))) / math.log(
    math.tan(math.pi/4 + r(LAT2)/2) / math.tan(math.pi/4 + r(LAT1)/2))
F = math.cos(r(LAT1)) * math.tan(math.pi/4 + r(LAT1)/2)**n / n
rho0 = F / math.tan(math.pi/4 + r(LAT0)/2)**n

def proj(lon, lat):
    lat = max(min(lat, 89.5), -89.5)
    rho = F / math.tan(math.pi/4 + r(lat)/2)**n
    th = n * r(lon - LON0)
    return rho * math.sin(th), rho0 - rho * math.cos(th)

def perp(p, a, b):
    (x,y),(x1,y1),(x2,y2)=p,a,b
    dx,dy=x2-x1,y2-y1
    if dx==dy==0: return math.hypot(x-x1,y-y1)
    t=max(0,min(1,((x-x1)*dx+(y-y1)*dy)/(dx*dx+dy*dy)))
    return math.hypot(x-(x1+t*dx), y-(y1+t*dy))

def simplify(pts, tol):
    if len(pts) < 3: return pts
    dmax, idx = 0, 0
    for i in range(1, len(pts)-1):
        d = perp(pts[i], pts[0], pts[-1])
        if d > dmax: dmax, idx = d, i
    if dmax > tol:
        return simplify(pts[:idx+1], tol)[:-1] + simplify(pts[idx:], tol)
    return [pts[0], pts[-1]]

d = json.load(io.open("ne50.geojson", encoding="utf-8"))
feats = [f for f in d["features"] if f["properties"].get("iso_3166_2","").startswith("CA-")]

rings_by = {}
allpts = []
for f in feats:
    g = f["geometry"]; polys = g["coordinates"] if g["type"]=="MultiPolygon" else [g["coordinates"]]
    rs = []
    for poly in polys:
        outer = [proj(x,y) for x,y in poly[0]]
        if len(outer) < 4: continue
        rs.append(outer); allpts += outer
    rings_by[f["properties"]["iso_3166_2"]] = (f["properties"]["name"], rs)

xs=[p[0] for p in allpts]; ys=[p[1] for p in allpts]
minx,maxx,miny,maxy=min(xs),max(xs),min(ys),max(ys)
W,H=960.0,760.0
sc=min((W-20)/(maxx-minx),(H-20)/(maxy-miny))
def tx(p): return ((p[0]-minx)*sc+10, (maxy-p[1])*sc+10)

out=[]
for iso,(name,rs) in sorted(rings_by.items()):
    parts=[]; big=[]
    for ring in rs:
        pr=[tx(p) for p in ring]
        # Drop specks: a 1px island is noise at this size.
        w=max(q[0] for q in pr)-min(q[0] for q in pr); h=max(q[1] for q in pr)-min(q[1] for q in pr)
        if w<1.2 and h<1.2: continue
        s=simplify(pr,0.35)
        if len(s)<3: continue
        parts.append("M"+"L".join(f"{x:.1f},{y:.1f}" for x,y in s)+"Z")
        big += s
    if not parts: continue
    cx=sum(p[0] for p in big)/len(big); cy=sum(p[1] for p in big)/len(big)
    out.append({"code":iso.split("-")[1],"name":name,"d":"".join(parts),"c":[round(cx),round(cy)]})

io.open("geo-canada.json","w",encoding="utf-8").write(json.dumps(out,ensure_ascii=False,separators=(",",":"))+"\n")
import os
print(f"  {len(out)} provinces, {os.path.getsize('geo-canada.json')/1024:.0f} KB, viewBox 0 0 {int(W)} {int(H)}")
for o in out: print(f"   {o['code']:3} {o['name'][:26]:26} {len(o['d']):6} chars  c={o['c']}")
