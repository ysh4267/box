/*
 * 상자는 누르면 위로 튀어 오르며 기울고, 윗날개가 들렸다가 내려앉는다.
 * 면을 매 프레임 원근 투영해 캔버스에 벡터로 그리므로 어떤 화면에서도 선이 깨끗하다.
 * 치수, 곡선, 각도는 레퍼런스 영상을 프레임별로 추적해서 잰 값이다.
 * 길이 단위는 설계 픽셀(2012x1480 구도), 시간은 초, 각도는 도.
 */

// 구도와 카메라
const VIEW_W = 2012;
const VIEW_H = 1480;
const CENTER_X = 1010;
const CENTER_Y = 743;
const PERSPECTIVE = 10400;
const REST_ELEVATION = -30.18;
const REST_AZIMUTH = 45.02;

// 상자
const SIDE = 571;
const HEIGHT = 364.5;
const LID_GAP = 3.5;
const LINE = 2;
const RADIUS = 12;
const BG = '#0f0f11';
const LINE_COLOR = 'rgb(255 255 255 / 0.4)';
const LINE_FOCUS = 'rgb(255 255 255 / 0.72)';
const PRINT_DIM = 'rgb(255 255 255 / 0.26)';
const PRINT_MID = 'rgb(255 255 255 / 0.41)';
const PRINT_HI = 'rgb(255 255 255 / 0.56)';
const FOLD_COLOR = 'rgb(255 255 255 / 0.12)';
const GRIP_FILL = 'rgb(11 11 13)';
const FONT = '"JetBrains Mono", "Cascadia Mono", Consolas, ui-monospace, monospace';

// 겉면 인쇄
const print = {
  stamp: ['HOON-STD-01', 'HANDLE WITH CARE'],
  mark: 'ysh4267',
  credit: 'POWERED BY HOON',
};
// 웃는 얼굴 로고 (187x146). 사용자 아이콘의 얼굴을 따라 새로 그렸다.
const logo = {
  eyes: new Path2D('M0 40 68 50 20 102 6 86 30 64 2 62ZM178 0 187 16 160 28H187V48L122 38Z'),
  mouth: new Path2D('M51 96C72 78 105 62 147 55 152 85 153 110 140 128 130 141 118 143 106 142 88 140 66 124 51 96Z'),
  stroke: 11,
  rotate: 14,
  width: 54,
  u: 66,
  v: 266,
};
// https://github.com/ysh4267 로 가는 QR (버전 2-M, 25칸)
const QR_MODULES = 25;
const QR_QUIET = 2;
const QR_PATH = 'M0 0h7v1h-7zM8 0h2v1h-2zM11 0h1v1h-1zM14 0h1v1h-1zM18 0h7v1h-7zM0 1h1v1h-1zM6 1h1v1h-1zM8 1h1v1h-1zM11 1h1v1h-1zM13 1h1v1h-1zM16 1h1v1h-1zM18 1h1v1h-1zM24 1h1v1h-1zM0 2h1v1h-1zM2 2h3v1h-3zM6 2h1v1h-1zM8 2h3v1h-3zM13 2h2v1h-2zM18 2h1v1h-1zM20 2h3v1h-3zM24 2h1v1h-1zM0 3h1v1h-1zM2 3h3v1h-3zM6 3h1v1h-1zM12 3h5v1h-5zM18 3h1v1h-1zM20 3h3v1h-3zM24 3h1v1h-1zM0 4h1v1h-1zM2 4h3v1h-3zM6 4h1v1h-1zM8 4h1v1h-1zM12 4h3v1h-3zM16 4h1v1h-1zM18 4h1v1h-1zM20 4h3v1h-3zM24 4h1v1h-1zM0 5h1v1h-1zM6 5h1v1h-1zM9 5h2v1h-2zM13 5h2v1h-2zM18 5h1v1h-1zM24 5h1v1h-1zM0 6h7v1h-7zM8 6h1v1h-1zM10 6h1v1h-1zM12 6h1v1h-1zM14 6h1v1h-1zM16 6h1v1h-1zM18 6h7v1h-7zM9 7h2v1h-2zM13 7h1v1h-1zM15 7h1v1h-1zM0 8h1v1h-1zM3 8h6v1h-6zM10 8h1v1h-1zM12 8h1v1h-1zM14 8h4v1h-4zM20 8h1v1h-1zM22 8h3v1h-3zM0 9h4v1h-4zM5 9h1v1h-1zM8 9h4v1h-4zM13 9h1v1h-1zM15 9h1v1h-1zM19 9h5v1h-5zM1 10h1v1h-1zM4 10h1v1h-1zM6 10h1v1h-1zM8 10h3v1h-3zM12 10h1v1h-1zM14 10h2v1h-2zM17 10h1v1h-1zM19 10h1v1h-1zM21 10h1v1h-1zM24 10h1v1h-1zM1 11h5v1h-5zM7 11h5v1h-5zM14 11h2v1h-2zM18 11h2v1h-2zM21 11h4v1h-4zM2 12h2v1h-2zM5 12h2v1h-2zM12 12h1v1h-1zM16 12h1v1h-1zM18 12h2v1h-2zM24 12h1v1h-1zM0 13h2v1h-2zM4 13h2v1h-2zM7 13h3v1h-3zM12 13h2v1h-2zM15 13h1v1h-1zM17 13h1v1h-1zM20 13h1v1h-1zM23 13h1v1h-1zM0 14h2v1h-2zM5 14h4v1h-4zM10 14h1v1h-1zM12 14h1v1h-1zM15 14h4v1h-4zM20 14h5v1h-5zM0 15h1v1h-1zM2 15h4v1h-4zM12 15h1v1h-1zM15 15h2v1h-2zM18 15h2v1h-2zM21 15h2v1h-2zM24 15h1v1h-1zM0 16h1v1h-1zM2 16h1v1h-1zM5 16h2v1h-2zM8 16h1v1h-1zM10 16h2v1h-2zM13 16h1v1h-1zM15 16h6v1h-6zM22 16h2v1h-2zM8 17h1v1h-1zM10 17h1v1h-1zM13 17h1v1h-1zM16 17h1v1h-1zM20 17h1v1h-1zM22 17h2v1h-2zM0 18h7v1h-7zM8 18h1v1h-1zM11 18h4v1h-4zM16 18h1v1h-1zM18 18h1v1h-1zM20 18h1v1h-1zM24 18h1v1h-1zM0 19h1v1h-1zM6 19h1v1h-1zM8 19h1v1h-1zM11 19h6v1h-6zM20 19h1v1h-1zM0 20h1v1h-1zM2 20h3v1h-3zM6 20h1v1h-1zM8 20h6v1h-6zM15 20h6v1h-6zM23 20h2v1h-2zM0 21h1v1h-1zM2 21h3v1h-3zM6 21h1v1h-1zM8 21h1v1h-1zM11 21h2v1h-2zM15 21h4v1h-4zM23 21h2v1h-2zM0 22h1v1h-1zM2 22h3v1h-3zM6 22h1v1h-1zM10 22h1v1h-1zM14 22h1v1h-1zM17 22h1v1h-1zM20 22h5v1h-5zM0 23h1v1h-1zM6 23h1v1h-1zM10 23h3v1h-3zM15 23h1v1h-1zM17 23h1v1h-1zM19 23h2v1h-2zM22 23h3v1h-3zM0 24h7v1h-7zM8 24h2v1h-2zM11 24h1v1h-1zM13 24h2v1h-2zM16 24h3v1h-3zM21 24h1v1h-1zM24 24h1v1h-1z';
const qr = { right: 532.2, bottom: 332.4, size: 116, plate: 'rgb(122 122 124)' };

// 뛰는 곡선: 빠르게 올라가 멈췄다가(지수) 가속하며 떨어진다(세제곱).
const RISE = 0.0415;
const FALL_START = 0.19;
const LAND = 0.385;
const PEAK = 0.9926;
const FLAP_RISE_NEAR = 0.06;
const FLAP_CLOSE_TIME = 0.215;
const LIFETIME = 0.8;

// 공중에서 또 누르면 처음부터 다시 뛰되 더 높이 뛴다.
const HOP_HEIGHT = 65;
const HOP_STEP = 18.7;
const MAX_LEVEL = 8;

// 영상에서 잰 자세들. a: 고도, b: 방위, c: 기울기, l·r: 날개 각도, close: 날개가 닫히기 시작하는 시각.
const POSES = [
  [
    { a: -3.26, b: -0.17, c: 4.39, l: 7.5, r: 11, close: 0.332 },
    { a: 2.93, b: 4.44, c: -2.18, l: 7.5, r: 7, close: 0.225 },
    { a: 1.85, b: 1.19, c: -2.69, l: 9, r: 8, close: 0.26 },
    { a: -5.19, b: -0.67, c: 4.48, l: 6.5, r: 9, close: 0.3 },
    { a: -0.71, b: -3.6, c: -1.45, l: 10.5, r: 9, close: 0.315 },
    { a: -6.1, b: 5.15, c: 4.97, l: 8.5, r: 7.5, close: 0.26 },
    { a: -2.1, b: -3.42, c: 1.96, l: 6.5, r: 8, close: 0.28 },
  ],
  [
    { a: 8.75, b: -4.2, c: -1.9, l: 10.5, r: 9, close: 0.24 },
    { a: -9.95, b: 1.96, c: 5.55, l: 9.5, r: 8, close: 0.195 },
    { a: -2, b: -3.4, c: -0.94, l: 10, r: 10, close: 0.25 },
    { a: 0.87, b: -4.53, c: -0.55, l: 10.5, r: 9, close: 0.265 },
  ],
  [
    { a: 4.78, b: 4.6, c: 2.95, l: 7.5, r: 7, close: 0.225 },
    { a: -2.69, b: -2.35, c: 6.18, l: 10.5, r: 9, close: 0.255 },
  ],
];

// 클릭 자리에서 퍼지는 고리: 일정하게 커지고 선은 얇아지며 사라진다.
const RING_LIFE = 0.34;
const RING_COLOR = [50, 112, 240, 0.4];
const RING_OPACITY = [[0, 0.2], [0.03, 0.43], [0.06, 0.53], [0.09, 0.95], [0.18, 1], [0.21, 0.84], [0.26, 0.54], [0.31, 0.21], [0.34, 0]];

const COUNT_KEY = 'box.count';

const canvas = document.getElementById('scene');
const ctx = canvas.getContext('2d');
const countEl = document.getElementById('count');
const pressButton = document.getElementById('press');
const stillMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

const pose = { a: 0, b: 0, c: 0, ty: 0, l: 0, r: 0 };
const view = { scale: 1, k: 0.5, ox: 0, oy: 0, dpr: 1 };
let hop = null;
let rings = [];
let frame = 0;
let count = 0;
let focused = false;

/* ------------------------------------------------------------- 투영 */

const RAD = Math.PI / 180;
let m = [1, 0, 0, 0, 1, 0, 0, 0, 1];

/** 화면 기울기(c) · 고도(a) · 방위(b) 순서의 회전 행렬. */
function updateMatrix() {
  const sa = Math.sin((REST_ELEVATION + pose.a) * RAD);
  const ca = Math.cos((REST_ELEVATION + pose.a) * RAD);
  const sb = Math.sin((REST_AZIMUTH + pose.b) * RAD);
  const cb = Math.cos((REST_AZIMUTH + pose.b) * RAD);
  const sc = Math.sin(pose.c * RAD);
  const cc = Math.cos(pose.c * RAD);
  // Rx · Ry
  const r00 = cb;
  const r01 = 0;
  const r02 = sb;
  const r10 = sa * sb;
  const r11 = ca;
  const r12 = -sa * cb;
  const r20 = -ca * sb;
  const r21 = sa;
  const r22 = ca * cb;
  // Rz · (Rx · Ry)
  m = [
    cc * r00 - sc * r10, cc * r01 - sc * r11, cc * r02 - sc * r12,
    sc * r00 + cc * r10, sc * r01 + cc * r11, sc * r02 + cc * r12,
    r20, r21, r22,
  ];
}

/** 상자 좌표를 캔버스 픽셀로. */
function project(x, y, z) {
  const px = m[0] * x + m[1] * y + m[2] * z;
  const py = m[3] * x + m[4] * y + m[5] * z;
  const pz = m[6] * x + m[7] * y + m[8] * z;
  const depth = PERSPECTIVE / (PERSPECTIVE - pz);
  return [
    (CENTER_X + px * depth) * view.k + view.ox,
    (CENTER_Y + pose.ty + py * depth) * view.k + view.oy,
  ];
}

/* ------------------------------------------------------------- 면 */

const half = SIDE / 2;
const top = -HEIGHT / 2;

function makeFace(o, u, v, w, h) {
  return { o, u, v, w, h };
}

const FACES = {
  back: makeFace([half, top, -half], [-1, 0, 0], [0, 1, 0], SIDE, HEIGHT),
  right: makeFace([half, top, half], [0, 0, -1], [0, 1, 0], SIDE, HEIGHT),
  floor: makeFace([-half, -top, -half], [1, 0, 0], [0, 0, 1], SIDE, SIDE),
  left: makeFace([-half, top, -half], [0, 0, 1], [0, 1, 0], SIDE, HEIGHT),
  front: makeFace([-half, top, half], [1, 0, 0], [0, 1, 0], SIDE, HEIGHT),
  innerFar: makeFace([-half, top, -half], [1, 0, 0], [0, 0, 1], SIDE, half),
  innerNear: makeFace([-half, top, 0], [1, 0, 0], [0, 0, 1], SIDE, half),
};

function facePoint(face, a, b) {
  return project(
    face.o[0] + face.u[0] * a + face.v[0] * b,
    face.o[1] + face.u[1] * a + face.v[1] * b,
    face.o[2] + face.u[2] * a + face.v[2] * b,
  );
}

/** 둥근 사각형 윤곽을 면 위 좌표 목록으로 만든다. */
function roundedOutline(x, y, w, h, r, steps = 8) {
  const points = [];
  const corner = (cx, cy, from) => {
    for (let i = 0; i <= steps; i += 1) {
      const angle = from + (i / steps) * (Math.PI / 2);
      points.push([cx + Math.cos(angle) * r, cy + Math.sin(angle) * r]);
    }
  };
  corner(x + w - r, y + r, -Math.PI / 2);
  corner(x + w - r, y + h - r, 0);
  corner(x + r, y + h - r, Math.PI / 2);
  corner(x + r, y + r, Math.PI);
  return points;
}

const outlineCache = new Map();

function outlineFor(x, y, w, h, r) {
  const key = `${x},${y},${w},${h},${r}`;
  if (!outlineCache.has(key)) outlineCache.set(key, roundedOutline(x, y, w, h, Math.max(0, r)));
  return outlineCache.get(key);
}

function traceOutline(face, outline) {
  outline.forEach(([a, b], index) => {
    const [x, y] = facePoint(face, a, b);
    if (index === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.closePath();
}

function drawPanel(face, lineColor) {
  drawRoundedBox(face, 0, 0, face.w, face.h, RADIUS, BG, lineColor);
}

function drawRoundedBox(face, x, y, w, h, r, fill, lineColor) {
  const outer = outlineFor(x, y, w, h, r);
  ctx.beginPath();
  traceOutline(face, outer);
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.beginPath();
  traceOutline(face, outer);
  traceOutline(face, outlineFor(x + LINE, y + LINE, w - LINE * 2, h - LINE * 2, r - LINE));
  ctx.fillStyle = lineColor;
  ctx.fill('evenodd');
}

/** 면 위 한 점 주변의 원근을 아핀 변환으로 맞춘다. 작은 인쇄물에는 이 근사로 충분하다. */
function setFaceTransform(face, a, b) {
  const [x, y] = facePoint(face, a, b);
  const [ux, uy] = facePoint(face, a + 1, b);
  const [vx, vy] = facePoint(face, a, b + 1);
  ctx.setTransform(ux - x, uy - y, vx - x, vy - y, x, y);
}

function drawText(face, text, startU, baseline, size, advance, color) {
  ctx.fillStyle = color;
  ctx.font = `300 ${size}px ${FONT}`;
  ctx.textBaseline = 'alphabetic';
  ctx.textAlign = 'left';
  for (let i = 0; i < text.length; i += 1) {
    if (text[i] === ' ') continue;
    setFaceTransform(face, startU + i * advance, baseline);
    ctx.fillText(text[i], 0, 0);
  }
  ctx.setTransform(1, 0, 0, 1, 0, 0);
}

const qrPath = new Path2D(QR_PATH);

function drawLeftPrint(face) {
  print.stamp.forEach((line, index) => drawText(face, line, 37.8, 52.8 + 28.8 * index, 20, 13.44, PRINT_DIM));

  // 접는 선
  ctx.fillStyle = FOLD_COLOR;
  ctx.beginPath();
  for (let start = 2; start < SIDE - 2; start += 13.1) {
    const end = Math.min(start + 7, SIDE - 2);
    const [x0, y0] = facePoint(face, start, 112.3);
    const [x1, y1] = facePoint(face, end, 112.3);
    const [x2, y2] = facePoint(face, end, 114.3);
    const [x3, y3] = facePoint(face, start, 114.3);
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineTo(x3, y3);
    ctx.closePath();
  }
  ctx.fill();

  drawText(face, print.mark, 37.8, 326.2, 36, 22.4, PRINT_HI);

  // QR
  const unit = qr.size / (QR_MODULES + QR_QUIET * 2);
  const left = qr.right - qr.size;
  const upper = qr.bottom - qr.size;
  setFaceTransform(face, left + qr.size / 2, upper + qr.size / 2);
  ctx.transform(1, 0, 0, 1, -qr.size / 2, -qr.size / 2);
  ctx.fillStyle = qr.plate;
  ctx.fillRect(0, 0, qr.size, qr.size);
  ctx.transform(unit, 0, 0, unit, unit * QR_QUIET, unit * QR_QUIET);
  ctx.fillStyle = BG;
  ctx.fill(qrPath);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
}

function drawFrontPrint(face) {
  // 손잡이 구멍
  drawRoundedBox(face, 213.6, 90.6, 145, 41.4, 20.7, GRIP_FILL, LINE_COLOR);

  // 로고
  const unit = logo.width / 187;
  setFaceTransform(face, logo.u, logo.v);
  ctx.scale(1.12, 1);
  ctx.rotate(logo.rotate * RAD);
  ctx.scale(unit, unit);
  ctx.translate(-187 / 2, -146 / 2);
  ctx.fillStyle = PRINT_MID;
  ctx.fill(logo.eyes);
  ctx.strokeStyle = PRINT_MID;
  ctx.lineWidth = logo.stroke;
  ctx.lineJoin = 'round';
  ctx.stroke(logo.mouth);
  ctx.setTransform(1, 0, 0, 1, 0, 0);

  drawText(face, print.credit, 39.2, 328.8, 20, 13.44, PRINT_DIM);
}

/** 큰 날개: 바깥 모서리가 경첩이고 각도만큼 들린다. */
function flapFace(side, angle) {
  const cos = Math.cos(angle * RAD);
  const sin = Math.sin(angle * RAD);
  return makeFace(
    [side * half, top - LID_GAP, -half],
    [-side * cos, -sin, 0],
    [0, 0, 1],
    half,
    SIDE,
  );
}

function drawRings(now) {
  const alive = [];
  for (const ring of rings) {
    const t = (now - ring.start) / 1000;
    if (t >= RING_LIFE) continue;
    alive.push(ring);
    if (t < 0) continue;
    let opacity = 0;
    for (let i = 1; i < RING_OPACITY.length; i += 1) {
      const [t0, o0] = RING_OPACITY[i - 1];
      const [t1, o1] = RING_OPACITY[i];
      if (t <= t1) {
        opacity = o0 + (o1 - o0) * ((t - t0) / (t1 - t0));
        break;
      }
    }
    const radius = (34.6 + 104 * t) * view.k;
    ctx.beginPath();
    ctx.arc(ring.x * view.k + view.ox, ring.y * view.k + view.oy, radius, 0, Math.PI * 2);
    ctx.lineWidth = Math.max(0.5, (9 - 15 * t) * view.k);
    ctx.strokeStyle = `rgb(${RING_COLOR[0]} ${RING_COLOR[1]} ${RING_COLOR[2]} / ${RING_COLOR[3] * opacity})`;
    ctx.stroke();
  }
  rings = alive;
}

function draw(now = performance.now()) {
  updateMatrix();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const line = focused ? LINE_FOCUS : LINE_COLOR;
  drawPanel(FACES.floor, line);
  drawPanel(FACES.back, line);
  drawPanel(FACES.right, line);
  drawPanel(FACES.innerFar, line);
  drawPanel(FACES.innerNear, line);
  drawPanel(FACES.left, line);
  drawLeftPrint(FACES.left);
  drawPanel(FACES.front, line);
  drawFrontPrint(FACES.front);
  drawPanel(flapFace(1, pose.r), line);
  drawPanel(flapFace(-1, pose.l), line);
  drawRings(now);
}

/* ------------------------------------------------------------- 뛰기 */

const cubeIn = (x) => {
  const clamped = Math.min(1, Math.max(0, x));
  return clamped * clamped * clamped;
};

const riseFall = (t) => (1 - Math.exp(-t / RISE)) * (1 - cubeIn((t - FALL_START) / (LAND - FALL_START))) / PEAK;

/** 바닥에 닿은 뒤 살짝 눌렸다 돌아오는 값. */
const settle = (t) => {
  const since = t - LAND;
  return (1 - Math.exp(-since / 0.006)) * Math.exp(-Math.max(0, since - 0.02) / 0.035);
};

function applyHop(current, t) {
  const inAir = t < LAND;
  const lift = inAir ? riseFall(t) : -0.055 * settle(t);
  const tilt = inAir ? riseFall(t) : -0.11 * settle(t);
  const close = 1 - cubeIn((t - current.close) / FLAP_CLOSE_TIME);
  pose.ty = -current.height * lift;
  pose.a = current.a * tilt;
  pose.b = current.b * tilt;
  pose.c = current.c * tilt;
  pose.l = current.l * (1 - Math.exp(-t / FLAP_RISE_NEAR)) * close;
  pose.r = current.r * (1 - Math.exp(-t / RISE)) * close;
}

function clearPose() {
  Object.assign(pose, { a: 0, b: 0, c: 0, ty: 0, l: 0, r: 0 });
}

function tick(now) {
  frame = 0;
  if (hop) {
    const t = (now - hop.start) / 1000;
    if (t >= LIFETIME) {
      hop = null;
      clearPose();
    } else {
      applyHop(hop, Math.max(0, t));
    }
  }
  draw(now);
  if (hop || rings.length > 0) frame = requestAnimationFrame(tick);
}

function wake() {
  if (!frame) frame = requestAnimationFrame(tick);
}

let lastPick = null;

function pickPose(level) {
  const pool = POSES[Math.min(level, POSES.length) - 1];
  let pick = pool[Math.floor(Math.random() * pool.length)];
  if (pick === lastPick) pick = pool[(pool.indexOf(pick) + 1) % pool.length];
  lastPick = pick;
  return pick;
}

function jump(now) {
  const airborne = hop && (now - hop.start) / 1000 < LAND;
  const level = airborne ? Math.min(hop.level + 1, MAX_LEVEL) : 1;
  const soften = stillMotion.matches ? 0.25 : 1;
  const picked = pickPose(level);
  hop = {
    start: now,
    level,
    height: (HOP_HEIGHT + HOP_STEP * (level - 1)) * soften,
    a: picked.a * soften,
    b: picked.b * soften,
    c: picked.c * soften,
    l: picked.l * soften,
    r: picked.r * soften,
    close: picked.close,
  };
}

/* ------------------------------------------------------------- 소리 */

let audio = null;
let noise = null;

function makeNoise(context) {
  const buffer = context.createBuffer(1, Math.ceil(context.sampleRate * 0.04), context.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i += 1) data[i] = Math.random() * 2 - 1;
  return buffer;
}

/** 빈 상자를 손가락으로 건드린 듯한 둔탁한 "툭". 합성이라 소리 파일이 필요 없다. */
function thud(context, destination, when, tone, noiseBuffer) {
  const out = context.createGain();
  out.gain.value = 0.34;
  out.connect(destination);

  // 몸통: 짧게 떨어지는 낮은 음
  const body = context.createOscillator();
  body.type = 'sine';
  body.frequency.setValueAtTime(270 * tone, when);
  body.frequency.exponentialRampToValueAtTime(140 * tone, when + 0.05);
  const bodyGain = context.createGain();
  bodyGain.gain.setValueAtTime(0.0001, when);
  bodyGain.gain.exponentialRampToValueAtTime(0.85, when + 0.003);
  bodyGain.gain.exponentialRampToValueAtTime(0.001, when + 0.1);
  body.connect(bodyGain).connect(out);

  // 판지가 울리는 짧은 음. 작은 스피커에서도 들리게 해 준다.
  const knock = context.createOscillator();
  knock.type = 'triangle';
  knock.frequency.setValueAtTime(560 * tone, when);
  knock.frequency.exponentialRampToValueAtTime(330 * tone, when + 0.025);
  const knockGain = context.createGain();
  knockGain.gain.setValueAtTime(0.0001, when);
  knockGain.gain.exponentialRampToValueAtTime(0.5, when + 0.002);
  knockGain.gain.exponentialRampToValueAtTime(0.001, when + 0.045);
  knock.connect(knockGain).connect(out);

  // 닿는 순간의 결: 낮게 거른 아주 짧은 잡음
  const hit = context.createBufferSource();
  hit.buffer = noiseBuffer;
  const filter = context.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 900;
  filter.Q.value = 0.6;
  const hitGain = context.createGain();
  hitGain.gain.setValueAtTime(0.5, when);
  hitGain.gain.exponentialRampToValueAtTime(0.001, when + 0.025);
  hit.connect(filter).connect(hitGain).connect(out);

  body.start(when);
  body.stop(when + 0.11);
  knock.start(when);
  knock.stop(when + 0.05);
  hit.start(when);
  hit.stop(when + 0.03);
}

function wakeAudio() {
  const Context = window.AudioContext || window.webkitAudioContext;
  if (!Context) return null;
  if (!audio) {
    audio = new Context({ latencyHint: 'interactive' });
    noise = makeNoise(audio);
  }
  if (audio.state === 'suspended') audio.resume().catch(() => {});
  return audio;
}

function playThud() {
  const context = wakeAudio();
  if (!context) return;
  const tone = 1 + (Math.random() - 0.5) * 0.1;
  const play = () => thud(context, context.destination, context.currentTime, tone, noise);
  if (context.state === 'running') play();
  else context.resume().then(play).catch(() => {});
}

/* ------------------------------------------------------------- 횟수 */

function readCount() {
  try {
    const saved = Number.parseInt(window.localStorage.getItem(COUNT_KEY) ?? '0', 10);
    return Number.isFinite(saved) && saved > 0 ? saved : 0;
  } catch {
    return 0;
  }
}

function showCount() {
  countEl.textContent = count.toLocaleString('en-US');
}

function addCount() {
  count += 1;
  showCount();
  try {
    window.localStorage.setItem(COUNT_KEY, String(count));
  } catch {
    // 저장이 막힌 창에서는 이번 방문 동안만 센다.
  }
}

/* ------------------------------------------------------------- 입력 */

function convexContains(points, x, y) {
  // 점들의 볼록 껍질을 만든 뒤 안쪽인지 본다.
  const sorted = [...points].sort((p, q) => p[0] - q[0] || p[1] - q[1]);
  const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lower = [];
  for (const p of sorted) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) lower.pop();
    lower.push(p);
  }
  const upper = [];
  for (const p of sorted.reverse()) {
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) upper.pop();
    upper.push(p);
  }
  const hull = [...lower.slice(0, -1), ...upper.slice(0, -1)];
  return hull.every((p, i) => cross(p, hull[(i + 1) % hull.length], [x, y]) >= 0);
}

function boxOutlinePoints() {
  const points = [];
  for (const y of [top - LID_GAP, HEIGHT / 2]) {
    for (const x of [-half, half]) {
      for (const z of [-half, half]) points.push(project(x, y, z));
    }
  }
  for (const face of [flapFace(1, pose.r), flapFace(-1, pose.l)]) {
    points.push(facePoint(face, half, 0), facePoint(face, half, SIDE));
  }
  return points;
}

let restOutline = [];

/** 쉬는 자리의 상자 또는 지금 떠 있는 상자 위면 누른 것이다. 공중에서도 같은 자리를 연달아 누를 수 있다. */
function isOnBox(cx, cy) {
  updateMatrix();
  return convexContains(restOutline, cx, cy) || convexContains(boxOutlinePoints(), cx, cy);
}

function press(x, y) {
  const now = performance.now();
  if (!stillMotion.matches) rings.push({ x, y, start: now });
  playThud();
  jump(now);
  addCount();
  wake();
}

canvas.addEventListener('pointerdown', (event) => {
  if (event.button !== 0) return;
  const cx = event.clientX * view.dpr;
  const cy = event.clientY * view.dpr;
  if (!isOnBox(cx, cy)) return;
  press((cx - view.ox) / view.k, (cy - view.oy) / view.k);
});

canvas.addEventListener('pointermove', (event) => {
  if (event.pointerType !== 'mouse') return;
  const onBox = isOnBox(event.clientX * view.dpr, event.clientY * view.dpr);
  canvas.style.cursor = onBox ? 'pointer' : '';
});

// 터치는 손을 뗄 때에야 소리를 낼 권한이 생긴다.
window.addEventListener('pointerup', wakeAudio, { passive: true });

// 키보드와 보조 기술의 누름은 좌표 없는 click 으로 온다. 상자 한가운데에서 시작한다.
pressButton.addEventListener('click', (event) => {
  if (event.detail === 0) press(CENTER_X, CENTER_Y);
});
pressButton.addEventListener('keydown', (event) => {
  if (event.repeat && (event.key === 'Enter' || event.key === ' ')) event.preventDefault();
});
pressButton.addEventListener('focus', () => {
  focused = pressButton.matches(':focus-visible');
  wake();
});
pressButton.addEventListener('blur', () => {
  focused = false;
  wake();
});

/* ------------------------------------------------------------- 맞추기 */

/** 레퍼런스 구도(1006x740)를 창에 맞춘다. 좁은 창에서는 상자 폭 기준으로 맞춘다. */
function fit() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  view.dpr = Math.min(window.devicePixelRatio || 1, 3);
  view.scale = Math.min(width * 0.84 / 405, height / 740);
  view.k = view.scale * 0.5 * view.dpr;
  view.ox = (width * view.dpr) / 2 - (VIEW_W / 2) * view.k;
  view.oy = (height * view.dpr) / 2 - (VIEW_H / 2) * view.k;
  canvas.width = Math.round(width * view.dpr);
  canvas.height = Math.round(height * view.dpr);

  const savedPose = { ...pose };
  clearPose();
  updateMatrix();
  restOutline = boxOutlinePoints();
  Object.assign(pose, savedPose);

  const offsetY = (height - VIEW_H * 0.5 * view.scale) / 2;
  countEl.style.setProperty('--count-size', String(18 * view.scale));
  countEl.style.setProperty('--count-top', String(Math.max(12, offsetY + 31 * view.scale)));
  draw();
}

window.addEventListener('resize', fit);
fit();
count = readCount();
showCount();

// 인쇄용 글꼴이 도착하면 다시 그린다.
if (document.fonts?.load) {
  document.fonts.load('300 20px "JetBrains Mono"', 'HANDLE WITH CARE ysh4267').then(() => draw()).catch(() => {});
}
