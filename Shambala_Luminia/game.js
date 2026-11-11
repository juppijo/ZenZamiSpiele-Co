(() => {
'use strict';
const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const T = 3, H = 4, PI = Math.PI;

/* ---------- Einstellungen ---------- */
const DEF = { vol:.6, sens:1, view:1, speed:1, quality:'mid', time:'dawn', cam:'third', map:true, joy:true, arrow:true, dist:4.2, fov:65, eye:1.4, tilt:.38, inv:false, hedge:'natur', glass:0 };
const S = Object.assign({}, DEF);
try { Object.assign(S, JSON.parse(localStorage.getItem('shambala-luminia') || '{}')); } catch (e) {}
const save = () => { try { localStorage.setItem('shambala-luminia', JSON.stringify(S)); } catch (e) {} };

/* ---------- Szene ---------- */
const renderer = new THREE.WebGLRenderer({ antialias:true });
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
$('#game').appendChild(renderer.domElement);
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(65, 1, .1, 220);
const hemi = new THREE.HemisphereLight(0xffffff, 0x446644, 1);
const sun = new THREE.DirectionalLight(0xffffff, .8); sun.position.set(30, 50, 20);
sun.castShadow = true; const sc = sun.shadow.camera; sc.left = -24; sc.right = 24; sc.top = 24; sc.bottom = -24; sc.near = 1; sc.far = 140;
sun.shadow.mapSize.set(1024, 1024); sun.shadow.bias = -.0006; let lastQ;
scene.add(hemi, sun, sun.target);

const sg = new THREE.BufferGeometry(), sp = [];
for (let i = 0; i < 500; i++) { const u = Math.random() * PI * 2, v = Math.acos(Math.random() * .9 + .1); sp.push(90*Math.sin(v)*Math.cos(u), 90*Math.cos(v), 90*Math.sin(v)*Math.sin(u)); }
sg.setAttribute('position', new THREE.Float32BufferAttribute(sp, 3));
const stars = new THREE.Points(sg, new THREE.PointsMaterial({ color:0xffffff, size:2, sizeAttenuation:false, transparent:true, fog:false }));
scene.add(stars);

function applyTime() {
  const t = TIMES[S.time] || TIMES.dawn;
  scene.background = new THREE.Color(t.sky);
  scene.fog = new THREE.Fog(t.fog, 4, 12 + 34 * S.view);
  hemi.intensity = t.hemi; sun.color.setHex(t.sun); sun.intensity = t.si;
  stars.material.opacity = t.stars; stars.visible = t.stars > 0;
}
function resize() {
  const pr = { low:.6, mid:1, high:Math.min(devicePixelRatio || 1, 2) }[S.quality] || 1;
  renderer.setPixelRatio(pr); renderer.setSize(innerWidth, innerHeight);
  camera.aspect = innerWidth / innerHeight; camera.fov = S.fov; camera.updateProjectionMatrix();
}
addEventListener('resize', resize);

/* ---------- Figuren ---------- */
const mk = (geo, col, x = 0, y = 0, z = 0, sc) => { const m = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ color:col })); m.position.set(x, y, z); m.castShadow = true; if (sc) m.scale.set(...sc); return m; };
function noiseTex() { const c = document.createElement('canvas'); c.width = c.height = 256; const x = c.getContext('2d'); x.fillStyle = '#e4e4e4'; x.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 6000; i++) { const v = 150 + Math.random() * 105 | 0; x.fillStyle = `rgba(${v},${v},${v},.55)`; const r = Math.random() * 1.8 + .5; x.fillRect(Math.random() * 256, Math.random() * 256, r, r * (1 + Math.random() * 3)); }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 4; return t; }
const gtex = noiseTex();
const zami = new THREE.Group();
const legL = mk(new THREE.CylinderGeometry(.08, .08, .45, 10), 0x6b4a3a, -.15, .22, 0), legR = mk(new THREE.CylinderGeometry(.08, .08, .45, 10), 0x6b4a3a, .15, .22, 0);
const armL = mk(new THREE.CylinderGeometry(.06, .06, .5, 10), 0xffd9bf, -.36, 1.0, 0), armR = mk(new THREE.CylinderGeometry(.06, .06, .5, 10), 0xffd9bf, .36, 1.0, 0);
armL.rotation.z = .25; armR.rotation.z = -.25;
zami.add(legL, legR, armL, armR,
  mk(new THREE.CylinderGeometry(.22, .5, 1.1, 24), 0xe8758a, 0, .75, 0),
  mk(new THREE.SphereGeometry(.3, 24, 18), 0xffd9bf, 0, 1.5, 0),
  mk(new THREE.SphereGeometry(.34, 24, 18), 0xd9341f, 0, 1.57, -.1),
  mk(new THREE.SphereGeometry(.13, 12, 10), 0xd9341f, 0, 1.25, -.4),
  mk(new THREE.SphereGeometry(.035, 8, 8), 0x2a2140, -.1, 1.52, .285), mk(new THREE.SphereGeometry(.035, 8, 8), 0x2a2140, .1, 1.52, .285));
const luna = new THREE.Group();
luna.add(mk(new THREE.BoxGeometry(.3, .28, .6), 0xffffff, 0, .28, 0), mk(new THREE.BoxGeometry(.24, .22, .22), 0xffffff, 0, .42, .38),
  mk(new THREE.BoxGeometry(.07, .13, .05), 0xd9534f, -.08, .59, .4), mk(new THREE.BoxGeometry(.07, .13, .05), 0xd9534f, .08, .59, .4),
  mk(new THREE.BoxGeometry(.31, .1, .22), 0xd9534f, 0, .4, -.1), mk(new THREE.BoxGeometry(.07, .07, .4), 0xffffff, 0, .4, -.45));
const FN = 120, fpos = new Float32Array(FN * 3), fseed = Array.from({ length:FN }, () => [Math.random() * 6.28, Math.random() * 6.28, Math.random() * 6.28]);
const fgeo = new THREE.BufferGeometry(); fgeo.setAttribute('position', new THREE.BufferAttribute(fpos, 3));
const flies = new THREE.Points(fgeo, new THREE.PointsMaterial({ color:0xfff2b0, size:.22, transparent:true, opacity:.85, blending:THREE.AdditiveBlending, depthWrite:false }));
flies.frustumCulled = false; scene.add(flies);
scene.add(zami, luna);

/* ---------- Spielzustand ---------- */
let state = 'menu', prev = 'menu', lv = 0, lvGot = 0, wall, G, visited, stones = [], crystal, world = new THREE.Group(), journal = [], cur = null, river;
scene.add(world);
const keys = {}; let jx = 0, jy = 0, cy = 0, cp = .38, tt = 0, toastT = 0, crystalMsg = 0;
const pos = new THREE.Vector3(), face = { a:0, t:0 }, lpos = { x:0, z:0 };

const blocked = (x, z) => { const i = Math.floor(x / T), j = Math.floor(z / T); return i < 0 || j < 0 || i >= G || j >= G || wall[j][i] === 1; };
const hit = (x, z, r = .5) => blocked(x + r, z + r) || blocked(x - r, z + r) || blocked(x + r, z - r) || blocked(x - r, z - r);

/* ---------- Level bauen ---------- */
let curSeed, started = false, hedge, magicT = 0, magicCd = 0, lastOp = 1, lastMf = 1; const MAGIC = 3;
function mulberry(a) { return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function build(i, seed) {
  seed = seed || ((Math.random() * 2147483646 | 0) + 1); curSeed = seed; const rnd = mulberry(seed);
  scene.remove(world); world = new THREE.Group(); scene.add(world);
  lv = i; lvGot = 0; stones = [];
  const L = LEVELS[i], n = L.size; G = 2 * n + 1;
  wall = Array.from({ length:G }, () => Array(G).fill(1)); wall[1][1] = 0;
  const st = [[1, 1]];
  while (st.length) {
    const [x, y] = st[st.length - 1];
    const d = [[2,0],[-2,0],[0,2],[0,-2]].filter(([a, b]) => { const X = x + a, Y = y + b; return X > 0 && Y > 0 && X < G-1 && Y < G-1 && wall[Y][X]; });
    if (!d.length) { st.pop(); continue; }
    const [a, b] = d[rnd() * d.length | 0]; wall[y + b/2][x + a/2] = 0; wall[y + b][x + a] = 0; st.push([x + a, y + b]);
  }
  for (let k = 0; k < n; k++) { const x = 1 + (rnd() * (G-2) | 0), y = 1 + (rnd() * (G-2) | 0); if (wall[y][x] && ((x % 2 && !(y % 2)) || (!(x % 2) && y % 2))) wall[y][x] = 0; }
  visited = Array.from({ length:G }, () => Array(G).fill(false));

  const ws = [], open = [];
  for (let y = 0; y < G; y++) for (let x = 0; x < G; x++) (wall[y][x] ? ws : open).push([x, y]);
  const m4 = new THREE.Matrix4(), c = new THREE.Color();
  const mat = new THREE.MeshLambertMaterial({ color:0xffffff });
  const HP = HEDGES[S.hedge] || null, NB = 9, wr = rnd, bp = [], bc = [];
  const hm = new THREE.InstancedMesh(new THREE.BoxGeometry(T * .92, H, T * .92), mat, ws.length);
  const bm = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 1), mat, ws.length * NB);
  const q = new THREE.Quaternion(), eu = new THREE.Euler(), sv = new THREE.Vector3(), pv = new THREE.Vector3(), bl = (HP && HP.fl) || [0xff8fb8, 0xffc2dc, 0xffffff, 0xffe27a, 0xc9b3ff, 0xff9a5c], pv2 = new THREE.Vector3(), iq = new THREE.Quaternion();
  const fl = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(.14, 0), new THREE.MeshLambertMaterial({ color:0xffffff, emissive:0x2a1a20 }), ws.length * NB * 3); let fi = 0;
  ws.forEach(([x, y], k) => {
    const h = HP ? HP.h[0] + wr() * (HP.h[1] - HP.h[0]) : L.hue + wr() * .04;
    m4.makeScale(1, 1, 1).setPosition((x + .5) * T, H / 2, (y + .5) * T); hm.setMatrixAt(k, m4); hm.setColorAt(k, c.setHSL(h, .4, .1));
    for (let b = 0; b < NB; b++) {
      const s = .55 + wr() * .3;
      pv.set((x + .5) * T + (wr() - .5) * 1.3, .5 + b / (NB - 1) * (H - .5) + (wr() - .5) * .5, (y + .5) * T + (wr() - .5) * 1.3);
      sv.set(s * (1 + wr() * .2), s * .9, s * (1 + wr() * .2)); q.setFromEuler(eu.set(wr() * 3, wr() * 3, wr() * 3));
      m4.compose(pv, q, sv); bm.setMatrixAt(k * NB + b, m4);
      bm.setColorAt(k * NB + b, (HP ? c.setHSL(HP.h[0] + wr() * (HP.h[1] - HP.h[0]), HP.s + wr() * .15, HP.l + wr() * .14 + pv.y / H * .06) : c.setHSL(h + (wr() - .5) * .03, .4 + wr() * .2, .2 + wr() * .16 + pv.y / H * .08)));
      if (wr() < .8) { const a2 = wr() * PI * 2, e2 = wr() * PI - PI / 2; bp.push(pv.x + Math.cos(a2) * Math.cos(e2) * s, pv.y + Math.sin(e2) * s, pv.z + Math.sin(a2) * Math.cos(e2) * s); const cc = new THREE.Color(bl[wr() * 6 | 0]); bc.push(cc.r, cc.g, cc.b); }
      if (wr() < .65) { const a3 = wr() * PI * 2, e3 = wr() * PI - PI / 2, col = bl[wr() * 6 | 0], fx = pv.x + Math.cos(a3) * Math.cos(e3) * s, fy = pv.y + Math.sin(e3) * s, fz = pv.z + Math.sin(a3) * Math.cos(e3) * s;
        for (let f = 0; f < 3; f++) { const fs = .8 + wr() * .7; sv.set(fs, fs, fs); m4.compose(pv2.set(fx + (wr() - .5) * .4, fy + (wr() - .5) * .4, fz + (wr() - .5) * .4), iq, sv); fl.setMatrixAt(fi, m4); fl.setColorAt(fi++, c.setHex(col)); } }
    }
  });
  fl.count = fi; hm.castShadow = bm.castShadow = bm.receiveShadow = true;
  const bg = new THREE.BufferGeometry(); bg.setAttribute('position', new THREE.Float32BufferAttribute(bp, 3)); bg.setAttribute('color', new THREE.Float32BufferAttribute(bc, 3));
  const bmat = new THREE.PointsMaterial({ size:.28, vertexColors:true });
  const fm = new THREE.InstancedMesh(new THREE.PlaneGeometry(T, T), new THREE.MeshLambertMaterial({ color:0xffffff, map:gtex }), open.length); fm.receiveShadow = true;
  open.forEach(([x, y], k) => { m4.makeRotationX(-PI / 2).setPosition((x + .5) * T, .02, (y + .5) * T); fm.setMatrixAt(k, m4); fm.setColorAt(k, c.setHex(L.path).offsetHSL(0, 0, (rnd() - .5) * .06)); });
  const ground = mk(new THREE.PlaneGeometry(500, 500), L.ground, G * T / 2, 0, G * T / 2); ground.rotation.x = -PI / 2;
  ground.receiveShadow = true; ground.castShadow = false; const gt = gtex.clone(); gt.needsUpdate = true; gt.repeat.set(125, 125); ground.material.map = gt;
  const bpts = new THREE.Points(bg, bmat); hedge = { mats:[mat], fx:[fl.material, bmat], meshes:[hm, bm] }; lastOp = lastMf = -1; world.add(hm, bm, fl, fm, ground, bpts);

  // leuchtende Blumen
  const fp = [], fc = [], pal = [0xff9ec4, 0xffe27a, 0xb8a6ff, 0xffffff];
  for (let k = 0; k < 14 * n; k++) { const [x, y] = open[rnd() * open.length | 0]; fp.push((x + rnd()) * T, .25, (y + rnd()) * T); const q = new THREE.Color(pal[k % 4]); fc.push(q.r, q.g, q.b); }
  const fg = new THREE.BufferGeometry(); fg.setAttribute('position', new THREE.Float32BufferAttribute(fp, 3)); fg.setAttribute('color', new THREE.Float32BufferAttribute(fc, 3));
  world.add(new THREE.Points(fg, new THREE.PointsMaterial({ size:.4, vertexColors:true })));

  // Bewusstseinsfluss + goldene Berge
  river = new THREE.Mesh(new THREE.PlaneGeometry(6, 400), new THREE.MeshBasicMaterial({ color:0x9fe8ff, transparent:true, opacity:.75 }));
  river.rotation.x = -PI / 2; river.position.set(-9, .04, G * T / 2); world.add(river);
  const R = G * T * .5 + 60;
  for (let k = 0; k < 16; k++) { const a = k / 16 * PI * 2, h = 26 + (k * 37 % 17), r = 15 + (k * 13 % 7);
    world.add(mk(new THREE.ConeGeometry(r, h, 6), k % 3 ? 0xe6b84a : 0xf4d77a, G * T / 2 + Math.cos(a) * R, h / 2 - 2, G * T / 2 + Math.sin(a) * R)); }
  world.children.slice(-16).forEach(m => m.material.fog = false);

  // Weisheitssteine
  const pts = []; let tries = 0;
  while (pts.length < 3 && tries++ < 600) {
    const [x, y] = open[rnd() * open.length | 0];
    if (x + y < n + 1 || (x > G - 4 && y > G - 4)) continue;
    if (pts.every(p => Math.abs(p[0] - x) + Math.abs(p[1] - y) >= Math.max(4, n + 2 - tries / 50))) pts.push([x, y]);
  }
  while (pts.length < 3) pts.push(open[rnd() * open.length | 0]);
  pts.forEach(([x, y], k) => {
    const g = new THREE.Group(); g.position.set((x + .5) * T, 0, (y + .5) * T);
    const gem = new THREE.Mesh(new THREE.OctahedronGeometry(.5), new THREE.MeshBasicMaterial({ color:0xffd36b }));
    const halo = new THREE.Mesh(new THREE.OctahedronGeometry(.8), new THREE.MeshBasicMaterial({ color:0xfff0b8, wireframe:true, transparent:true, opacity:.6 }));
    const beam = new THREE.Mesh(new THREE.CylinderGeometry(.06, .06, 7, 6), new THREE.MeshBasicMaterial({ color:0xffd36b, transparent:true, opacity:.28 })); beam.position.y = 3.5;
    gem.add(halo); g.add(gem, beam); world.add(g);
    stones.push({ g, gem, tx:x, ty:y, q:WISDOMS[i * 3 + k], done:false });
  });

  // Kristall am Ausgang
  const cg = new THREE.Group(); cg.position.set((G - 1.5) * T, 0, (G - 1.5) * T);
  const cr = new THREE.Mesh(new THREE.OctahedronGeometry(.7), new THREE.MeshBasicMaterial({ color:0x8a8fa8 })); cr.scale.y = 2.2; cr.position.y = 1.7;
  const cb = new THREE.Mesh(new THREE.CylinderGeometry(.15, .15, 9, 8), new THREE.MeshBasicMaterial({ color:0xffd6ec, transparent:true, opacity:.35 })); cb.position.y = 4.5; cb.visible = false;
  cg.add(cr, cb);
  for (let k = 0; k < 8; k++) { const a = k / 8 * PI * 2; cg.add(mk(new THREE.DodecahedronGeometry(.2), pal[k % 4], Math.cos(a) * 1.15, .25, Math.sin(a) * 1.15)); }
  const cl = new THREE.PointLight(0xffe0b0, 0, 16); cl.position.y = 2; cg.add(cl); world.add(cg);
  crystal = { g:cg, cr, cb, cl, tx:G - 2, ty:G - 2 };

  pos.set(1.5 * T, 0, 1.5 * T); lpos.x = pos.x; lpos.z = pos.z; cy = wall[1][2] ? PI : -PI / 2; cp = S.tilt; magicT = 0;
  hud();
}

/* ---------- HUD, Panels, Toast ---------- */
const hud = () => { $('#level').textContent = `Ebene ${lv + 1} von ${LEVELS.length} · ${LEVELS[lv].name}`; $('#count').textContent = `Weisheiten ${lvGot} / 3`; };
function toast(t, ms = 4200) { const e = $('#toast'); e.textContent = t; e.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(() => e.classList.remove('on'), ms); }
const show = id => { $('#' + id).hidden = false; }, hide = id => { $('#' + id).hidden = true; };
function openP(id) { if (state !== 'play' && state !== 'menu') return; prev = state; state = 'pause'; show(id); }
function closeP(id) { hide(id); state = prev; }
$$('[data-close]').forEach(b => b.onclick = () => closeP(b.dataset.close));
$('#bSet').onclick = () => openP('settings');
$('#goSet').onclick = () => openP('settings');
$('#bJournal').onclick = () => { $('#jlist').innerHTML = journal.length ? journal.map(w => `<li>${w}</li>`).join('') : '<li>Noch keine Weisheit gefunden. Folge den goldenen Lichtsäulen.</li>'; openP('journal'); };
$('#bFs').onclick = () => {
  const d = document, e = d.documentElement;
  if (d.fullscreenElement || d.webkitFullscreenElement) (d.exitFullscreen || d.webkitExitFullscreen).call(d);
  else { const f = e.requestFullscreen || e.webkitRequestFullscreen; if (f) f.call(e); else toast('Vollbild geht hier nicht. Auf dem iPhone: Teilen › „Zum Home-Bildschirm“.'); }
};

/* ---------- Spielstand ---------- */
const SK = 'shambala-luminia-save';
const readSave = () => { try { return JSON.parse(localStorage.getItem(SK)); } catch (e) { return null; } };
const clearSave = () => { try { localStorage.removeItem(SK); } catch (e) {} $('#cont').hidden = true; };
function unlockCrystal() { crystal.cr.material.color.setHex(0xffd6ec); crystal.cb.visible = true; crystal.cl.intensity = 1.4; }
function enterPlay() { audioInit(); started = true; ['start', 'settings', 'journal', 'end', 'riddle'].forEach(hide); state = 'play'; }
function saveGame(msg) {
  if (!started) return;
  try { localStorage.setItem(SK, JSON.stringify({ lv, seed:curSeed, journal, done:stones.map(o => o.done), x:+pos.x.toFixed(2), z:+pos.z.toFixed(2), cy:+cy.toFixed(2), vis:visited.map(r => r.map(v => v ? 1 : 0).join('')).join('') }));
    $('#cont').hidden = false; if (msg) toast('Spielstand gespeichert.', 2500); }
  catch (e) { if (msg) toast('Speichern nicht möglich – der Browser blockiert den Speicher.'); }
}
function loadGame() {
  const d = readSave(); if (!d || !d.seed || !LEVELS[d.lv]) { toast('Kein Spielstand gefunden.'); return; }
  journal = d.journal || []; build(d.lv, d.seed);
  (d.done || []).forEach((f, i) => { if (f && stones[i]) { stones[i].done = true; world.remove(stones[i].g); } });
  lvGot = stones.filter(o => o.done).length; if (lvGot === 3) unlockCrystal();
  pos.set(d.x, 0, d.z); lpos.x = d.x; lpos.z = d.z; cy = d.cy;
  if (d.vis && d.vis.length === G * G) for (let y = 0; y < G; y++) for (let x = 0; x < G; x++) visited[y][x] = d.vis[y * G + x] === '1';
  enterPlay(); hud(); toast('Spielstand geladen.', 3000);
}
function newGame() { journal = []; clearSave(); build(0); enterPlay(); saveGame(); toast(LEVELS[0].intro, 6000); }
$('#go').onclick = () => { if (readSave() && !confirm('Den gespeicherten Spielstand überschreiben und neu beginnen?')) return; newGame(); };
$('#cont').onclick = loadGame;
$('#sSave').onclick = () => { if (!started) return toast('Starte zuerst die Reise.'); saveGame(true); };
$('#sLoad').onclick = loadGame;
$('#sNew').onclick = () => { if (confirm('Neu beginnen? Der gespeicherte Spielstand wird gelöscht.')) newGame(); };
setInterval(() => { if (state === 'play') saveGame(); }, 8000);
addEventListener('pagehide', () => saveGame()); document.addEventListener('visibilitychange', () => { if (document.hidden) saveGame(); });

/* ---------- Hecken-Farbe neu aufbauen (Stand bleibt) ---------- */
function rebuild() {
  if (!stones.length || !started) { build(lv, curSeed); return; }
  const d = stones.map(o => o.done), px = pos.x, pz = pos.z, vv = visited, c0 = cy, c1 = cp;
  build(lv, curSeed); d.forEach((f, i) => { if (f) { stones[i].done = true; world.remove(stones[i].g); } });
  lvGot = d.filter(Boolean).length; if (lvGot === 3) unlockCrystal();
  pos.set(px, 0, pz); lpos.x = px; lpos.z = pz; cy = c0; cp = c1; visited = vv; hud();
}

/* ---------- Hecken-Zauber ---------- */
function castMagic() {
  if (state !== 'play') return;
  if (magicCd > 0) { toast(`Der Zauber ruht noch ${Math.ceil(magicCd)} Sekunden.`, 1500); return; }
  magicT = MAGIC; magicCd = 12; chime(true); toast('✨ Die Hecken werden für einen Moment durchsichtig …', 2800);
}
$('#bMagic').onclick = castMagic;

/* ---------- Rätsel ---------- */
function openRiddle(s) {
  cur = s; state = 'riddle'; const q = s.q;
  $('#rwho').textContent = q.who + ' fragt'; $('#rq').textContent = q.q; $('#rhint').textContent = ''; $('#rwis').hidden = true; $('#rnext').hidden = true;
  const box = $('#ropts'); box.innerHTML = '';
  q.a.forEach((t, i) => { const b = document.createElement('button'); b.className = 'btn opt'; b.textContent = t; b.onclick = () => answer(i, b); box.appendChild(b); });
  show('riddle'); flute(293.7, .04);
}
function answer(i, b) {
  const q = cur.q;
  if (i === q.c) { chime(true); $$('.opt').forEach(x => x.disabled = true); b.classList.add('ok'); $('#rhint').textContent = ''; $('#rwis').textContent = '✦ ' + q.w; $('#rwis').hidden = false; $('#rnext').hidden = false; }
  else { chime(false); b.disabled = true; b.classList.add('no'); $('#rhint').textContent = 'Sanfter Hinweis: ' + q.h; }
}
$('#rnext').onclick = () => { cur.done = true; world.remove(cur.g); journal.push(cur.q.w); lvGot++; hide('riddle'); state = 'play'; hud(); saveGame();
  if (lvGot === 3) { unlockCrystal(); toast('Der Kristall erwacht! Folge dem rosa Licht.', 5000); }
  else toast(`Weisheit gefunden – noch ${3 - lvGot} bis zum Kristall.`); };

function finishLevel() {
  state = 'end'; const last = lv === LEVELS.length - 1;
  $('#etitle').textContent = last ? 'Die Reise ist vollendet' : `${LEVELS[lv].name} – geschafft`;
  $('#etext').textContent = LEVELS[lv].outro + (last ? `  Du trägst ${journal.length} Weisheiten im Herzen. Hier darf alles atmen.` : '');
  $('#enext').textContent = last ? 'Noch einmal wandern' : 'Nächste Ebene';
  show('end'); chime(true, 1.6);
}
$('#enext').onclick = () => { hide('end'); if (lv === LEVELS.length - 1) { journal = []; build(0); } else build(lv + 1); state = 'play'; saveGame(); toast(LEVELS[lv].intro, 6000); };

/* ---------- Klang (Zen) ---------- */
let ac, master, wet; const SC = [146.8, 164.8, 174.6, 220, 233.1, 293.7, 329.6, 349.2, 440, 466.2]; // Hirajoshi in D
const out = g => { g.connect(master); g.connect(wet); };
function bowl(f, v = .08, d = 9) { if (!ac) return; const t = ac.currentTime;
  [[1, 1], [2.76, .35], [5.4, .12]].forEach(([m, a], i) => { const o = ac.createOscillator(), g = ac.createGain(); o.frequency.value = f * m * (1 + (Math.random() - .5) * .002);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v * a, t + .02); g.gain.exponentialRampToValueAtTime(.0001, t + d / (1 + i * .7)); o.connect(g); out(g); o.start(t); o.stop(t + d + .2); }); }
function flute(f, v = .045) { if (!ac) return; const t = ac.currentTime, o = ac.createOscillator(), o2 = ac.createOscillator(), g = ac.createGain(), g2 = ac.createGain(), vb = ac.createOscillator(), vg = ac.createGain();
  o.type = 'sine'; o2.type = 'triangle'; o.frequency.value = o2.frequency.value = f; vb.frequency.value = 4.6; vg.gain.value = f * .006; vb.connect(vg); vg.connect(o.frequency); vg.connect(o2.frequency);
  g2.gain.value = .25; o2.connect(g2); g2.connect(g); o.connect(g);
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + 1.1); g.gain.linearRampToValueAtTime(v * .7, t + 2.4); g.gain.exponentialRampToValueAtTime(.0001, t + 5);
  out(g); [o, o2, vb].forEach(n => { n.start(t); n.stop(t + 5.2); }); }
function chime(ok) { if (!ac) return; if (ok) { bowl(587.3, .07, 6); setTimeout(() => bowl(880, .05, 6), 350); setTimeout(() => bowl(1174.7, .03, 6), 800); } else flute(220, .04); }
function audioInit() {
  if (ac) { ac.resume && ac.resume(); return; }
  try {
    ac = new (window.AudioContext || window.webkitAudioContext)(); master = ac.createGain(); master.gain.value = S.vol * .6; master.connect(ac.destination);
    const conv = ac.createConvolver(), ib = ac.createBuffer(2, ac.sampleRate * 3.5, ac.sampleRate), wg = ac.createGain(); wg.gain.value = .55;
    for (let c = 0; c < 2; c++) { const d = ib.getChannelData(c); for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 2.5); }
    conv.buffer = ib; conv.connect(wg); wg.connect(master); wet = conv;
    [[73.4, .06], [110, .04], [146.8, .025]].forEach(([f, v], i) => { const o = ac.createOscillator(), g = ac.createGain(), l = ac.createOscillator(), lg = ac.createGain();
      o.frequency.value = f; o.detune.value = i * 3; g.gain.value = v; l.frequency.value = .05 + i * .02; lg.gain.value = v * .3; l.connect(lg); lg.connect(g.gain); o.connect(g); out(g); o.start(); l.start(); });
    const nb = ac.createBuffer(1, ac.sampleRate * 4, ac.sampleRate), nd = nb.getChannelData(0); for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
    const ns = ac.createBufferSource(), bp = ac.createBiquadFilter(), wgn = ac.createGain(), wl = ac.createOscillator(), wlg = ac.createGain();
    ns.buffer = nb; ns.loop = true; bp.type = 'bandpass'; bp.frequency.value = 600; bp.Q.value = .7; wgn.gain.value = .018; wl.frequency.value = .06; wlg.gain.value = .012;
    wl.connect(wlg); wlg.connect(wgn.gain); ns.connect(bp); bp.connect(wgn); wgn.connect(master); ns.start(); wl.start();
    let tb = 0, tf = performance.now() + 3000;
    setInterval(() => { if (state !== 'play' && state !== 'menu') return; const n = performance.now();
      if (n > tb) { bowl(Math.random() < .5 ? 293.7 : 220, .07, 10); tb = n + 16000 + Math.random() * 12000; }
      if (n > tf) { flute(SC[Math.random() * SC.length | 0]); tf = n + 6000 + Math.random() * 9000; } }, 1000);
  } catch (e) { ac = null; }
}

/* ---------- Eingabe ---------- */
addEventListener('keydown', e => { keys[e.code] = true; if (e.code.startsWith('Arrow') || e.code === 'Space') e.preventDefault(); if (e.code === 'Space' && !e.repeat) castMagic();
  if (e.code === 'Escape') { if (!$('#settings').hidden) closeP('settings'); else if (!$('#journal').hidden) closeP('journal'); else openP('settings'); } });
addEventListener('keyup', e => keys[e.code] = false);
addEventListener('blur', () => { for (const k in keys) keys[k] = false; });
const el = renderer.domElement; let look = null, joyId = null, jo = null;
el.addEventListener('contextmenu', e => e.preventDefault());
el.addEventListener('pointerdown', e => {
  if (state !== 'play') return; el.setPointerCapture(e.pointerId);
  if (e.pointerType === 'touch' && S.joy && e.clientX < innerWidth * .45 && joyId === null) { joyId = e.pointerId; jo = { x:e.clientX, y:e.clientY }; const j = $('#joy'); j.style.left = e.clientX + 'px'; j.style.top = e.clientY + 'px'; j.classList.add('on'); }
  else if (!look) look = { id:e.pointerId, x:e.clientX, y:e.clientY };
});
el.addEventListener('pointermove', e => {
  if (e.pointerId === joyId) { let dx = (e.clientX - jo.x) / 45, dy = (e.clientY - jo.y) / 45; const l = Math.hypot(dx, dy); if (l > 1) { dx /= l; dy /= l; } jx = dx; jy = dy; $('#knob').style.transform = `translate(${dx * 35}px,${dy * 35}px)`; }
  else if (look && e.pointerId === look.id) { cy -= (e.clientX - look.x) * .005 * S.sens; cp = Math.max(-.4, Math.min(1.2, cp + (e.clientY - look.y) * .004 * S.sens * (S.inv ? -1 : 1))); look.x = e.clientX; look.y = e.clientY; }
});
const up = e => { if (e.pointerId === joyId) { joyId = null; jx = jy = 0; $('#joy').classList.remove('on'); $('#knob').style.transform = ''; } if (look && e.pointerId === look.id) look = null; };
el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);

/* ---------- Einstellungen-UI ---------- */
function sync() { $$('[data-k]').forEach(e => { const k = e.dataset.k; if (e.type === 'checkbox') e.checked = S[k]; else e.value = S[k]; }); }
function apply() {
  resize(); applyTime(); zami.visible = S.cam === 'third';
  sun.castShadow = S.quality !== 'low';
  if (lastQ !== S.quality) { lastQ = S.quality; const m = S.quality === 'high' ? 2048 : 1024; sun.shadow.mapSize.set(m, m); if (sun.shadow.map) { sun.shadow.map.dispose(); sun.shadow.map = null; } }
  $('#map').style.display = S.map ? 'block' : 'none'; $('#arrow').style.display = S.arrow ? 'grid' : 'none';
  if (master) master.gain.value = S.vol * .6;
}
$$('[data-k]').forEach(e => e.oninput = () => { const k = e.dataset.k; S[k] = e.type === 'checkbox' ? e.checked : e.type === 'range' ? +e.value : e.value; if (k === 'tilt') cp = S.tilt; save(); apply(); if (k === 'hedge') rebuild(); });
$('#reset').onclick = () => { Object.assign(S, DEF); save(); sync(); apply(); };

/* ---------- Karte ---------- */
const mc = $('#map'), mx = mc.getContext('2d');
function drawMap() {
  if (!S.map) return; const s = mc.width / G; mx.clearRect(0, 0, mc.width, mc.height);
  for (let y = 0; y < G; y++) for (let x = 0; x < G; x++) if (visited[y][x]) { mx.fillStyle = wall[y][x] ? '#2d5a3d' : '#f3e6c4'; mx.fillRect(x * s, y * s, s + .5, s + .5); }
  const dot = (tx, ty, col, r) => { mx.fillStyle = col; mx.beginPath(); mx.arc((tx + .5) * s, (ty + .5) * s, r, 0, PI * 2); mx.fill(); };
  stones.forEach(o => { if (!o.done && visited[o.ty][o.tx]) dot(o.tx, o.ty, '#ffb81c', s * .45); });
  if (visited[crystal.ty][crystal.tx]) dot(crystal.tx, crystal.ty, lvGot === 3 ? '#ff7eb6' : '#8a8fa8', s * .5);
  dot(pos.x / T - .5, pos.z / T - .5, '#e8341f', s * .55);
}

/* ---------- Update ---------- */
function step(dx, dz) { if (!hit(pos.x + dx, pos.z)) pos.x += dx; if (!hit(pos.x, pos.z + dz)) pos.z += dz; }
function update(dt) {
  tt += dt; let mv = 0;
  if (magicT > 0) magicT = Math.max(0, magicT - dt); if (magicCd > 0) magicCd -= dt;
  const mf = magicT > 0 ? 1 - Math.min(1, (MAGIC - magicT) / .5, magicT / .5) * .97 : 1, op = (1 - S.glass) * mf;
  if (hedge && (op !== lastOp || mf !== lastMf)) { lastOp = op; lastMf = mf;
    const setM = (m, v) => { const tr = v < 1; if (m.transparent !== tr) { m.transparent = tr; m.needsUpdate = true; } m.opacity = v; m.depthWrite = !tr; };
    hedge.mats.forEach(m => setM(m, op)); hedge.fx.forEach(m => setM(m, mf)); hedge.meshes.forEach(m => { m.castShadow = op > .6; }); }
  $('#bMagic').style.opacity = magicCd > 0 ? .45 : 1;
  if (state === 'menu') cy += dt * .15;
  if (state === 'play') {
    cy += ((keys.ArrowLeft || keys.KeyQ ? 1 : 0) - (keys.ArrowRight || keys.KeyE ? 1 : 0)) * dt * 1.8 * S.sens;
    const fwd = (keys.KeyW || keys.ArrowUp ? 1 : 0) - (keys.KeyS || keys.ArrowDown ? 1 : 0) - jy, str = (keys.KeyD ? 1 : 0) - (keys.KeyA ? 1 : 0) + jx;
    let dx = -Math.sin(cy) * fwd + Math.cos(cy) * str, dz = -Math.cos(cy) * fwd - Math.sin(cy) * str; const l = Math.hypot(dx, dz);
    if (l > 1) { dx /= l; dz /= l; } mv = Math.min(1, l);
    if (mv > .05) { const sp = 5 * S.speed * dt; step(dx * sp, dz * sp); face.t = Math.atan2(dx, dz); }
    const ti = Math.floor(pos.x / T), tj = Math.floor(pos.z / T);
    for (let a = -2; a <= 2; a++) for (let b = -2; b <= 2; b++) { const X = ti + a, Y = tj + b; if (X >= 0 && Y >= 0 && X < G && Y < G) visited[Y][X] = true; }
    for (const s of stones) if (!s.done && Math.hypot(s.g.position.x - pos.x, s.g.position.z - pos.z) < 1.7) { openRiddle(s); break; }
    if (state === 'play' && Math.hypot(crystal.g.position.x - pos.x, crystal.g.position.z - pos.z) < 2) {
      if (lvGot === 3) finishLevel(); else if (tt > crystalMsg) { crystalMsg = tt + 6; toast(`Der Kristall schläft noch. Es fehlen ${3 - lvGot} Weisheiten.`); }
    }
  }
  let d = ((face.t - face.a + PI * 3) % (PI * 2)) - PI; face.a += d * Math.min(1, dt * 10);
  zami.position.copy(pos); zami.rotation.y = face.a; zami.position.y = Math.abs(Math.sin(tt * 10)) * .06 * mv;
  legL.rotation.x = Math.sin(tt * 10) * mv * .8; legR.rotation.x = -Math.sin(tt * 10) * mv * .8;
  armL.rotation.x = -Math.sin(tt * 10) * mv * .6; armR.rotation.x = Math.sin(tt * 10) * mv * .6;
  sun.position.set(pos.x + 25, 45, pos.z + 18); sun.target.position.copy(pos);
  for (let i = 0; i < FN; i++) { const sd = fseed[i]; fpos[i * 3] = pos.x + Math.sin(sd[0] + tt * .2) * 16 + Math.sin(sd[1] * 2 + tt * .5) * 1.5; fpos[i * 3 + 1] = 1.2 + (Math.sin(sd[2] + tt * .6) + 1) * 1.4; fpos[i * 3 + 2] = pos.z + Math.cos(sd[1] + tt * .17) * 16 + Math.cos(sd[2] * 2 + tt * .4) * 1.5; }
  fgeo.attributes.position.needsUpdate = true;

  let tx = pos.x - Math.sin(face.a) * 1.3 + Math.cos(face.a) * .8, tz = pos.z - Math.cos(face.a) * 1.3 - Math.sin(face.a) * .8;
  if (hit(tx, tz, .2)) { tx = pos.x; tz = pos.z; }
  const ox = lpos.x, oz = lpos.z, k = Math.min(1, dt * 3.5); lpos.x += (tx - lpos.x) * k; lpos.z += (tz - lpos.z) * k;
  if (Math.hypot(lpos.x - ox, lpos.z - oz) > .002) luna.rotation.y = Math.atan2(lpos.x - ox, lpos.z - oz);
  luna.position.set(lpos.x, Math.abs(Math.sin(tt * 12)) * .05 * Math.min(1, Math.hypot(lpos.x - ox, lpos.z - oz) * 60), lpos.z);

  stones.forEach((s, i) => { s.gem.rotation.y += dt * 1.5; s.gem.position.y = 1.4 + Math.sin(tt * 2 + i) * .2; });
  crystal.cr.rotation.y += dt * .8; crystal.cr.scale.y = 2.2 + Math.sin(tt * 2) * (lvGot === 3 ? .25 : .05);
  river.material.opacity = .65 + Math.sin(tt * 1.5) * .1;

  const ty = S.eye, p = S.cam === 'third' ? Math.max(cp, .08) : cp;
  if (S.cam === 'third') {
    const cpx = Math.cos(p); let kk = S.dist;
    for (; kk > .7; kk -= .3) { const x = pos.x + Math.sin(cy) * cpx * kk, z = pos.z + Math.cos(cy) * cpx * kk; if (ty + Math.sin(p) * kk > H || !blocked(x, z)) break; }
    camera.position.set(pos.x + Math.sin(cy) * cpx * kk, ty + Math.sin(p) * kk, pos.z + Math.cos(cy) * cpx * kk); camera.lookAt(pos.x, ty, pos.z);
  } else {
    const q = cp - .38; camera.position.set(pos.x, 1.5, pos.z);
    camera.lookAt(pos.x - Math.sin(cy) * Math.cos(q), 1.5 - Math.sin(q), pos.z - Math.cos(cy) * Math.cos(q));
  }
  stars.position.copy(camera.position);

  if (S.arrow) {
    let tg = crystal.g.position; if (lvGot < 3) { let b = 1e9; stones.forEach(s => { if (!s.done) { const q = Math.hypot(s.g.position.x - pos.x, s.g.position.z - pos.z); if (q < b) { b = q; tg = s.g.position; } } }); }
    const ex = tg.x - pos.x, ez = tg.z - pos.z, rel = Math.atan2(ex * Math.cos(cy) - ez * Math.sin(cy), -ex * Math.sin(cy) - ez * Math.cos(cy));
    $('#arrow').style.setProperty('--r', rel + 'rad');
  }
  drawMap();
}

let last = performance.now();
function loop(now) { requestAnimationFrame(loop); const dt = Math.min(.05, (now - last) / 1000); last = now; update(dt); renderer.render(scene, camera); }

sync(); build(0); apply(); $('#cont').hidden = !readSave(); requestAnimationFrame(loop);
})();
