/* p5 FUNCTIONS */
// points
let generatedPoints = [];
let POINTS_TO_GENERATE = 5;
let selectedPoint = null;
let mouseIsDragged = false;
// stroke
let STROKE_DEFAULT = 10;
// menu
let menu = new Menu();
let algorithm = null;
// hull polygon
let hull = [];
let drawHull = false;
// mouse pos
let lastMouseX, lastMouseY;

function setup() {
  createCanvas(960, 600);
  frameRate(15);
  strokeWeight(STROKE_DEFAULT);
}

function draw() {
  clear();

  // canvas border
  drawCanvasBorder();

  menu.draw();

  // setHeader('Header');
  showHullPointsInfo(hull);

  // draw points
  strokeWeight(STROKE_DEFAULT);
  for (let i = 0, len = generatedPoints.length; i < len; ++i) {
    point(generatedPoints[i].x, generatedPoints[i].y);
    text(
      `[${generatedPoints[i].x.toFixed(3)},${generatedPoints[i].y.toFixed(3)}]`,
      generatedPoints[i].x - 50,
      generatedPoints[i].y - 15
    );
  }

  if (generatedPoints.length < 1) {
    return;
  }

  strokeWeight(STROKE_DEFAULT * 0.1);

  if (drawHull && hull.length > 1) {
    let h = [...hull, hull[0]];
    let s = makeSegmentsFromPoints(h);
    drawLines(s);
  }

  let seg;
  switch (algorithm) {
    case menu.algorithms.GIFT_WRAPPING:
      setHeader('Gift Wrapping');
      hull = giftWrapping(generatedPoints);
      if (hull && hull.length > 2) {
        hull.push(hull[0]);
      }
      // console.log(hull);
      seg = makeSegmentsFromPoints(hull);
      drawLines(seg);
      break;
    case menu.algorithms.GRAHAM_SCAN:
      setHeader('Graham Scan');
      hull = grahamScan(generatedPoints);
      if (hull && hull.length > 2) {
        hull.push(hull[0]);
      }
      // console.log(hull);
      seg = makeSegmentsFromPoints(hull);
      drawLines(seg);
      break;
    case menu.algorithms.TRIANGULATION_SL:
      setHeader('Sweeping Line Triangulation');
      if (!drawHull || hull.length < 1) {
        hull = grahamScan(generatedPoints);
        if (hull && hull.length > 2) {
          hull.push(hull[0]);
        }
      }
      let triangulation = sweepingLineTriangulation(hull);
      // console.log(hSL);
      seg = makeSegmentsFromPoints(hull);
      drawLines(seg);
      drawLines(triangulation);
      break;
    case menu.algorithms.KDTREE:
      setHeader('KDTree');
      if (generatedPoints.length > 0) {
        let kdtree = KDTreeBuild(generatedPoints, 0, {
          xLeft: 0,
          xRight: width,
          yBottom: 0,
          yTop: height,
        });
        drawKDTree(kdtree);
      }
      break;
    case menu.algorithms.DELAUNAY:
      setHeader('Delaunay Triangulation');
      drawHull = false;
      console.log(generatedPoints);
      console.log(hull);
      if (generatedPoints.length > 0) {
        let triangles = delaunayTriangulation(
          hull.length === 0 ? generatedPoints : hull
        );
        drawTriangles(triangles);
      }
      break;
    case menu.algorithms.VORONOI:
      setHeader('Voronoi Diagram');
      drawHull = false;
      let t = delaunayTriangulation(hull.length === 0 ? generatedPoints : hull);
      let v = voronoi(t);
      drawLines(v);
      break;
  }
}

function drawCanvasBorder() {
  beginShape();
  vertex(0, 0);
  vertex(width, 0);
  vertex(width, height);
  vertex(0, height);
  endShape(CLOSE);
}

function setHeader(header) {
  let ots = textSize();
  textSize(20);
  text(header, width * 0.5, 30);
  textSize(ots);
}

function showHullPointsInfo(points) {
  let msg = 'Polygon points = [';
  if (points.length > 0) {
    points.forEach((point, idx) => {
      msg += `
p${idx}: ${point.x.toFixed(2)}, ${point.y.toFixed(2)}`;
    });
    msg += '\n';
  }
  msg += ']';
  text(msg, 10, height * 0.6);
}

function drawLines(seg) {
  for (let i = 0, len = seg.length; i < len; ++i) {
    line(seg[i].start.x, seg[i].start.y, seg[i].end.x, seg[i].end.y);
  }
}

function keyPressed() {
  switch (keyCode) {
    case 71: // G
    case 103: // g
      generatedPoints = [
        ...generatedPoints,
        ...generateRandomPoints(POINTS_TO_GENERATE),
      ];
      console.log('Generated points', generatedPoints);
      break;
    case 67: // C
    case 99: // c
      clearPoints(generatedPoints);
      console.log('Removed all points');
      algorithm = null;
      hull = [];
      break;
    case 81: // Q
    case 113: //q
      if (algorithm !== menu.algorithms.GIFT_WRAPPING) {
        algorithm = menu.algorithms.GIFT_WRAPPING;
        console.log('Gift wrapping selected');
      } else {
        algorithm = null;
        console.log('Gift wrapping unselected');
      }
      break;
    case 87: // W
    case 119: //w
      if (algorithm !== menu.algorithms.GRAHAM_SCAN) {
        algorithm = menu.algorithms.GRAHAM_SCAN;
        console.log('Graham scan selected');
      } else {
        algorithm = null;
        console.log('Graham scan unselected');
      }
      break;
    case 69: // E
    case 101: //e
      if (algorithm !== menu.algorithms.TRIANGULATION_SL) {
        algorithm = menu.algorithms.TRIANGULATION_SL;
        console.log('Sweeping line triangulation selected');
      } else {
        algorithm = null;
        console.log('Sweeping line triangulation unselected');
      }
      break;
    case 82: // R
    case 114: //r
      if (algorithm !== menu.algorithms.KDTREE) {
        algorithm = menu.algorithms.KDTREE;
        console.log('KDTree selected');
      } else {
        algorithm = null;
        console.log('KDTree unselected');
      }
      break;
    case 84: // T
    case 116: //t
      if (algorithm !== menu.algorithms.DELAUNAY) {
        algorithm = menu.algorithms.DELAUNAY;
        console.log('Delaunay triangulation selected');
      } else {
        algorithm = null;
        console.log('Delaunay triangulation unselected');
      }
      break;
    case 76: // L
    case 108: //l
      let x = mouseX;
      let y = mouseY;
      if (isGeneratedPoint(x, y)) {
        let hp = isHullPoint(x, y);
        if (hp != null) {
          hull.splice(hp, 1);
        } else {
          hull.push(selectedPoint);
        }
      }
      drawHull = true;
      break;
    case 65: // A
    case 97: // a
      if (algorithm !== menu.algorithms.VORONOI) {
        algorithm = menu.algorithms.VORONOI;
        console.log('Voronoi diagram selected');
      } else {
        algorithm = null;
        console.log('Voronoi diagram unselected');
      }
      break;
    case 27: // Esc
      hull = [];
      algorithm = null;
    default:
      drawHull = false;
      break;
  }
}

function deepCopyObject(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function deepCopyArrayObject(arr) {
  let out = [];
  arr.forEach(a => {
    out.push(deepCopyObject(a));
  });
  return out;
}

function isHullPoint(x, y) {
  for (let i = 0, len = hull.length; i < len; ++i) {
    if (insidePoint(hull[i], x, y, STROKE_DEFAULT * 0.5)) {
      return i;
    }
  }
  return null;
}

function isGeneratedPoint(x, y) {
  for (let i = 0, len = generatedPoints.length; i < len; ++i) {
    if (insidePoint(generatedPoints[i], x, y, STROKE_DEFAULT * 0.5)) {
      selectedPoint = generatedPoints[i];
      return true;
    }
  }
  return false;
}

function mousePressed() {
  if (!isGeneratedPoint(mouseX, mouseY)) {
    selectedPoint = null;
  }
}

function mouseClicked() {
  addRemovePoint();
  mouseIsDragged = false;
}

function mouseDragged() {
  mouseIsDragged = true;
  if (selectedPoint) {
    selectedPoint.x = mouseX;
    selectedPoint.y = mouseY;
  }
}

function drawTriangles(triangles) {
  for (let i = 0, len = triangles.length; i < len; ++i) {
    let e = triangles[i].edges;
    for (let j = 0; j < e.length; ++j) {
      line(e[j].start.x, e[j].start.y, e[j].end.x, e[j].end.y);
    }
  }
}
/* END OF P5 FUNCTIONS */

function generateRandomPoints(count) {
  let points = [];
  let ratio = 0.8;
  for (let i = 0; i < count; ++i) {
    let x = ratio * Math.random() * width + width * 0.15;
    let y = ratio * Math.random() * height + height * 0.15;
    points.push(new Point(x, y));
  }
  return points;
}

function clearPoints(points) {
  points.length = 0;
}

function addRemovePoint() {
  let newPoint = new Point(mouseX, mouseY);
  for (let i = 0, len = generatedPoints.length - 1; i <= len; --len) {
    if (
      insidePoint(
        generatedPoints[len],
        newPoint.x,
        newPoint.y,
        STROKE_DEFAULT * 0.5
      ) &&
      !mouseIsDragged
    ) {
      selectedPoint = generatedPoints[len];
      // for (let j = 0; j < hull.length; ++j) {
      //   if (selectedPoint.isEqual(hull[j])) {
      //     return selectedPoint;
      //   }
      // }
      console.log('Removing point', generatedPoints[len]);
      let oldPoint = generatedPoints.splice(len, 1);
      console.log('Generated points', generatedPoints);
      return oldPoint;
    }
  }

  if (mouseIsDragged) {
    return;
  }
  generatedPoints.push(newPoint);
  return newPoint;
}

function insidePoint(point, x, y, r) {
  return dist(point.x, point.y, x, y) <= r;
}

class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  static comparatorSmallestX(a, b) {
    return a.x - b.x;
  }

  static comparatorBiggestX(a, b) {
    return -this.comparatorSmallestX(a, b);
  }

  static comparatorBiggestXSmallestY(a, b) {
    return b.x - a.x == 0 ? (a.y - b.y == 0 ? 0 : a.y - b.y) : a.x - b.x;
  }

  static comparatorSmallestYBiggestX(a, b) {
    if (a.y === b.y) {
      return b.x - a.x;
    } else {
      return a.y - b.y;
    }
  }

  static hash(point) {
    return Math.floor((3 * point.x + 7 * point.y) * 10000);
  }

  static crossProduct(a, b, c) {
    return (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
  }

  static orientation(a, b, c) {
    let val = this.crossProduct(a, b, c);
    return val === 0 ? 0 : val > 0 ? 1 : -1; // 0 on line, positive on left, negative on right
  }

  static distance(a, b) {
    return Math.sqrt((a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y));
  }

  static circumCircle(a, b, c) {
    var cp = Point.crossProduct(a, b, c);
    if (cp === 0) {
      return { center: null, radius: null };
    }

    var z1 = a.x * a.x + a.y * a.y;
    var z2 = b.x * b.x + b.y * b.y;
    var z3 = c.x * c.x + c.y * c.y;
    var cx =
      (z1 * (b.y - c.y) + z2 * (c.y - a.y) + z3 * (a.y - b.y)) / (2 * cp);
    var cy =
      (z1 * (c.x - b.x) + z2 * (a.x - c.x) + z3 * (b.x - a.x)) / (2 * cp);

    var center = new Point(cx, cy);
    var radius = Point.distance(a, center);

    return { center, radius };
  }

  static isTurnLeft(a, b, c) {
    return this.crossProduct(a, b, c) > 0;
  }

  static computeAngle(a, b) {
    return Math.atan2(a.x * b.y - a.y * b.x, a.x * b.x + a.y * b.y);
  }

  isEqual(o) {
    if (!o && this !== o) {
      return false;
    }

    return Math.abs(this.x - o.x) < 0.0001 && Math.abs(this.y - o.y) < 0.0001;
  }

  static equals(a, b) {
    if ((!a || !b) && a !== b) {
      return false;
    }

    return Math.abs(a.x - b.x) < 0.0001 && Math.abs(a.y - b.y) < 0.0001;
  }
}

class Edge {
  constructor(pointStart, pointEnd) {
    this.start = pointStart;
    this.end = pointEnd;
  }

  toString() {
    return `${this.start.x}:${this.start.y}:${this.end.x}:${this.end.y}`;
  }
}

function makeSegmentsFromPoints(points) {
  if (!(points && points.length > 0)) {
    return [];
  }

  if (points.length === 1) {
    return [new Edge(points[0], points[0])];
  }

  let segments = [];
  for (let i = 1, len = points.length; i < len; ++i) {
    segments.push(new Edge(points[i - 1], points[i]));
  }
  return segments;
}

/* GIFT WRAPPING */
// DONE
function giftWrapping(points) {
  if (!(points && points.length > 2)) {
    return [];
  }

  var pSorted = deepCopyArrayObject(points).sort(
    Point.comparatorSmallestYBiggestX
  );
  var pivotIdx = 0;
  var startIdx = 0;
  var hull = [new Point(pSorted[0].x, pSorted[0].y)];

  var vector = createVector(1, 0);
  do {
    var minAngle = Infinity;
    var nextIdx = 0;
    var pivot = pSorted[pivotIdx];

    for (let i = 0, len = pSorted.length; i < len; ++i) {
      if (i === pivotIdx) {
        continue;
      }
      var angle = Point.computeAngle(
        vector,
        createVector(pSorted[i].x - pivot.x, pSorted[i].y - pivot.y)
      );
      if (angle < minAngle) {
        minAngle = angle;
        nextIdx = i;
      }
    }

    var nextPivot = pSorted[nextIdx];
    vector = createVector(nextPivot.x - pivot.x, nextPivot.y - pivot.y);
    if (!Point.equals(hull[0], nextPivot)) {
      hull.push(new Point(nextPivot.x, nextPivot.y));
    }
    pivotIdx = nextIdx;
  } while (pivotIdx !== startIdx);

  return hull;
}
/* END OF GIFT WRAPPING */

/* GRAHAM SCAN */
// DONE
function grahamScan(points) {
  if (!(points && points.length > 2)) {
    return [];
  }

  var pSorted = deepCopyArrayObject(points).sort(
    Point.comparatorSmallestYBiggestX
  );
  // console.log(pSorted);
  var pivotIdx = 0;
  var pSortedAngles = [];
  const vectorX = createVector(1, 0);

  var pivot = pSorted[pivotIdx];
  // sort by angle
  for (var i = 0, len = pSorted.length; i < len; ++i) {
    pSortedAngles.push({
      x: pSorted[i].x,
      y: pSorted[i].y,
      angleX: Point.computeAngle(
        vectorX,
        createVector(pSorted[i].x - pivot.x, pSorted[i].y - pivot.y)
      ),
    });
  }

  pSortedAngles.sort((a, b) => {
    var angleDiff = a.angleX - b.angleX;
    if (angleDiff === 0) {
      return (
        dist(b.x, b.y, pivot.x, pivot.y) - dist(a.x, a.y, pivot.x, pivot.y)
      );
    } else {
      return angleDiff;
    }
  });

  // console.log(pSortedAngles);
  var hull = [
    new Point(pSortedAngles[0].x, pSortedAngles[0].y),
    new Point(pSortedAngles[1].x, pSortedAngles[1].y),
  ];
  var j = 2;
  while (j < pSortedAngles.length) {
    var size = hull.length;
    if (
      Point.isTurnLeft(hull[size - 2], hull[size - 1], pSortedAngles[j]) > 0
    ) {
      hull.push(new Point(pSortedAngles[j].x, pSortedAngles[j].y));
      ++j;
    } else {
      hull.pop();
    }
  }

  return hull;
}
/* END OF GRAHAM SCAN */

/* SWEEEP LINE TRIANGULATION */
// DONE
function sweepingLineTriangulation(points) {
  console.log('points orig', points.slice());
  if (!(points && points.length > 2)) {
    return [];
  }

  var pSorted = deepCopyArrayObject(points).sort(
    Point.comparatorSmallestYBiggestX
  );
  divideToLeftRight(pSorted);

  var stack = [pSorted[0], pSorted[1]];
  var triangulation = [];

  for (var i = 2, len = pSorted.length; i < len; ++i) {
    var top = stack.pop();
    if (pSorted[i].flag === top.flag) {
      var q = stack.pop();
      while (stack.length > 0 && !Point.isTurnLeft(pSorted[i], top, q)) {
        triangulation.push(new Edge(pSorted[i], q));
        top = q;
        q = stack.pop();
      }
      stack.push(q);
    } else {
      triangulation.push(new Edge(pSorted[i], top));

      while (stack.length > 0) {
        triangulation.push(new Edge(pSorted[i], stack.pop()));
      }
    }
    stack.push(top);
    stack.push(pSorted[i]);
  }

  console.log('points', points);
  console.log('sorted', pSorted);
  return triangulation;
}

function divideToLeftRight(pointsSorted) {
  pointsSorted[0].flag = false;
  pointsSorted[pointsSorted.length - 1].flag = true;

  for (var i = 1, len = pointsSorted.length - 1; i < len; ++i) {
    if (
      Point.isTurnLeft(
        pointsSorted[0],
        pointsSorted[i],
        pointsSorted[pointsSorted.length - 1]
      )
    ) {
      pointsSorted[i].flag = false;
    } else {
      pointsSorted[i].flag = true;
    }
  }
}
/* END OF SWEEEP LINE TRIANGULATION */

/* KDTREE */
const KDTreeBuild = (points, depth, area) => {
  if (!(points && points.length > 0)) {
    return null;
  }

  if (points.length === 1) {
    return {
      x: points[0].x,
      y: points[0].y,
      depth,
      area,
    };
  }

  if (depth % 2 === 0) {
    points.sort(function(a, b) {
      return a.x - b.x;
    });
  } else {
    points.sort(function(a, b) {
      return a.y - b.y;
    });
  }

  const half = Math.floor(points.length / 2) - 1;

  let larea, rarea;
  if (depth % 2 === 0) {
    larea = {
      xLeft: area.xLeft,
      xRight: points[half].x,
      yBottom: area.yBottom,
      yTop: area.yTop,
    };
    rarea = {
      xLeft: points[half].x,
      xRight: area.xRight,
      yBottom: area.yBottom,
      yTop: area.yTop,
    };
  } else {
    larea = {
      xLeft: area.xLeft,
      xRight: area.xRight,
      yBottom: area.yBottom,
      yTop: points[half].y,
    };
    rarea = {
      xLeft: area.xLeft,
      xRight: area.xRight,
      yBottom: points[half].y,
      yTop: area.yTop,
    };
  }

  const ltree = KDTreeBuild(points.slice(0, half), depth + 1, larea);
  const rtree = KDTreeBuild(
    points.slice(half + 1, points.length),
    depth + 1,
    rarea
  );

  return {
    x: points[half].x,
    y: points[half].y,
    ltree,
    rtree,
    parent: points[half],
    depth,
    area,
  };
};

function drawKDTree(node) {
  if (node.depth % 2 === 0) {
    line(node.x, node.area.yBottom, node.x, node.area.yTop);
  } else {
    line(node.area.xLeft, node.y, node.area.xRight, node.y);
  }
  if (node.ltree) {
    drawKDTree(node.ltree);
  }
  if (node.rtree) {
    drawKDTree(node.rtree);
  }
}
/* END OF KDTREE */

/* DELAUNEY TRIANGULATION */
// DONE
class Triangle {
  constructor(point1, point2, point3) {
    this.a = point1;
    this.b = point2;
    this.c = point3;
    this.edges = [
      new Edge(this.a, this.b),
      new Edge(this.b, this.c),
      new Edge(this.c, this.a),
    ];
    this.edgesReversed = [
      new Edge(this.b, this.a),
      new Edge(this.c, this.b),
      new Edge(this.a, this.c),
    ];
  }

  static hash(triangle) {
    return Math.floor(
      Point.hash(triangle.a) *
        Point.hash(triangle.b) *
        Point.hash(triangle.c) *
        10000
    );
  }
}

function delaunayTriangulation(points) {
  console.log('Runing Delaunay triangulation');
  if (!(points && points.length > 2)) {
    return [];
  }

  var pSorted = deepCopyArrayObject(points).sort(
    Point.comparatorBiggestXSmallestY
  );
  var point1 = pSorted[0];
  var point2;

  let dist = Infinity;
  for (let i = 1, len = pSorted.length; i < len; ++i) {
    let d = Point.distance(point1, pSorted[i]);
    if (d < dist) {
      dist = d;
      point2 = pSorted[i];
      // console.log('lesser distance', dist, point1, point2);
    }
  }

  var edge = new Edge(point1, point2);
  var dp = findDelaunayPoint(edge, pSorted);
  if (dp == null) {
    edge = new Edge(point2, point1);
    dp = findDelaunayPoint(edge, pSorted);
  }
  // console.log('First edge', edge);
  // console.log('Delaunay point', dp);

  var ael = [edge, new Edge(edge.end, dp), new Edge(dp, edge.start)];
  var triangulation = [new Triangle(point1, point2, dp)];
  // console.log('initial ael', ael.slice());
  // console.log('initial triangulation', triangulation.slice());

  while (ael.length > 0) {
    var e = ael[0];
    var p = findDelaunayPoint(new Edge(e.end, e.start), pSorted);

    if (p != null) {
      addToAel(new Edge(e.start, p), ael, triangulation);
      addToAel(new Edge(p, e.end), ael, triangulation);
      triangulation.push(new Triangle(e.start, e.end, p));
    }
    ael.shift();
    // console.log('ael', ael.slice());
    // console.log('triangulation', triangulation.slice());
  }

  console.log(triangulation.slice());
  triangulation = removeDuplicateTriangles(triangulation);
  return triangulation;
}

function removeDuplicateTriangles(triangles) {
  let filtered = {};
  triangles.forEach(triangle => {
    if (filtered[Triangle.hash(triangle)] === undefined) {
      filtered[Triangle.hash(triangle)] = triangle;
    }
  });
  // console.log(filtered);
  return Object.values(filtered);
}

function addToAel(edge, ael, triangulation) {
  let idx = -1;
  for (let i = 0, len = ael.length; i < len; ++i) {
    let e = ael[i];
    if (
      (edge.start.x === e.end.x &&
        edge.start.y === e.end.y &&
        edge.end.x === e.start.x &&
        edge.end.y === e.start.y) ||
      (edge.start.x === e.start.x &&
        edge.start.y === e.start.y &&
        edge.end.x === e.end.x &&
        edge.end.y === e.end.y)
    ) {
      idx = i;
      break;
    }
  }

  if (idx === -1) {
    for (let i = 0, len = triangulation.length; i < len; ++i) {
      let t = triangulation[i].edges;
      for (let j = 0; j < t.length; ++j) {
        if (
          (edge.start.x === t[j].end.x &&
            edge.start.y === t[j].end.y &&
            edge.end.x === t[j].start.x &&
            edge.end.y === t[j].start.y) ||
          (edge.start.x === t[j].start.x &&
            edge.start.y === t[j].start.y &&
            edge.end.x === t[j].end.x &&
            edge.end.y === t[j].end.y)
        ) {
          idx = i;
          break;
        }
      }
    }
  }

  if (idx === -1) {
    ael.push(edge);
  }
}

function findDelaunayPoint(edge, points) {
  let dist = Infinity;
  let point = null;
  for (let i = 0, len = points.length; i < len; ++i) {
    if (Point.isTurnLeft(edge.start, edge.end, points[i])) {
      var d = delaunayDistance(edge, points[i]);
      if (d < dist) {
        dist = d;
        point = points[i];
      }
    }
  }
  return point;
}

function delaunayDistance(edge, point) {
  var a = edge.start;
  var b = edge.end;

  var { center, radius } = Point.circumCircle(a, b, point);
  if (!center) {
    return;
  }

  var abp = Point.isTurnLeft(a, b, point);
  var abc = Point.isTurnLeft(a, b, center);
  return abp && abc ? radius : -radius;
}
/* END OF DELAUNEY TRIANGULATION */

/* VORONOI DIAGRAM */
function voronoi(triangulation) {
  console.log('Start voronoi');
  var edges = {};

  for (let i = 0, len = triangulation.length; i < len; ++i) {
    var [edgeA, edgeB, edgeC] = triangulation[i].edges;
    addEdge(edgeA, triangulation[i]);
    addEdge(edgeB, triangulation[i]);
    addEdge(edgeC, triangulation[i]);
  }
  // console.log('edges', edges);
  var diagram = [];

  for (const e in edges) {
    var pair = edges[e];

    if (pair.fst && pair.snd) {
      var cr1 = Point.circumCircle(pair.fst.a, pair.fst.b, pair.fst.c);
      var cr2 = Point.circumCircle(pair.snd.a, pair.snd.b, pair.snd.c);

      diagram.push(new Edge(cr1.center, cr2.center));
    } else {
      if (pair.fst) {
        diagram.push(makeBorderEdge(pair.edge, pair.fst));
      } else if (pair.snd) {
        diagram.push(makeBorderEdge(pair.edge, pair.snd));
      }
    }
  }
  // console.log('VD diagram', diagram);

  console.log('End voronoi');
  return diagram;

  function addEdge(edge, triangle) {
    var pair1 = edges[edge.toString()];
    var er = new Edge(edge.end, edge.start);
    var pair2 = edges[er.toString()];

    if (!pair1) {
      if (!pair2) {
        edges[edge.toString()] = {
          edge: edge,
          fst: triangle,
          snd: null,
        };
      } else {
        pair2.snd = triangle;
      }
    } else {
      pair1.snd = triangle;
    }
  }

  function makeBorderEdge(edge, triangle) {
    var aCovered =
      Point.equals(edge.start, triangle.a) ||
      Point.equals(edge.end, triangle.a);
    var bCovered =
      Point.equals(edge.start, triangle.b) ||
      Point.equals(edge.end, triangle.b);
    var cCovered =
      Point.equals(edge.start, triangle.c) ||
      Point.equals(edge.end, triangle.c);

    var cr = Point.circumCircle(triangle.a, triangle.b, triangle.c);
    var eMid = new Point(
      (edge.start.x + edge.end.x) * 0.5,
      (edge.start.y + edge.end.y) * 0.5
    );
    var direction = norm(eMid, cr.center);

    // console.log(edge, triangle);
    // console.log(cr, eMid, direction);

    var uncovered;
    if (aCovered && bCovered) {
      uncovered = triangle.c;
    }
    if (aCovered && cCovered) {
      uncovered = triangle.b;
    }
    if (cCovered && bCovered) {
      uncovered = triangle.a;
    }

    // var xnor = (a, b) => (a && b) || (!a && !b);
    var circumCircleInTriangle = xnor(
      Point.isTurnLeft(edge.start, edge.end, cr.center),
      Point.isTurnLeft(edge.start, edge.end, uncovered)
    );
    var p;
    // console.log(triangle, cr, circumCircleInTriangle);
    if (circumCircleInTriangle) {
      p = new Point(eMid.x + direction.x * 1000, eMid.y + direction.y * 1000);
    } else {
      p = new Point(
        cr.center.x + direction.x * -1000,
        cr.center.y + direction.y * -1000
      );
    }
    // console.log(p);

    return new Edge(cr.center, p);
  }

  function xnor(a, b) {
    return (a && b) || (!a && !b);
  }

  function norm(p1, p2) {
    var p = {
      x: p1.x - p2.x,
      y: p1.y - p2.y,
    };
    var n = Math.sqrt(p.x * p.x + p.y * p.y);
    return {
      x: p.x / n,
      y: p.y / n,
    };
  }
}
/* END OF VORONOI DIAGRAM */
