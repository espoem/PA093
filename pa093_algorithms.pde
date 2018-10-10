import java.util.*;

ArrayList<Point> points_g = new ArrayList();
int strokeWeight = 15;
Point selectedPoint;
int randomPointsCount = 20;
boolean useGrahamScan = false;

void setup() {
  size(640, 640);

  points_g = generateRandomPoints(randomPointsCount);
}

void draw() {
  background(240);

  fill(0);
  stroke(0);
  strokeWeight(strokeWeight);
  for (Point p: points_g) {
    point(p.x, p.y);
  }

  if (!points_g.isEmpty()) {
    if (useGrahamScan) {
      List<Point> hullPoints = grahamScan(points_g);
      hullPoints.add(hullPoints.get(0));

      strokeWeight(2);
      for (int i = 1; i < hullPoints.size(); i++) {
        float c = map(i, 0, hullPoints.size(), 0, 255);
        stroke(c);
        line(hullPoints.get(i-1).x, hullPoints.get(i-1).y, hullPoints.get(i).x, hullPoints.get(i).y);
      }
    }
  }

  drawMenu();
}

enum Menu {
  CLEAR_WINDOW("c - clear window"),
  ADD_RANDOM_POINTS("g - add random points"),
  GRAHAM_SCAN("w - Graham scan convex hull");

  private String text;

  private Menu(String text) {
    this.text = text;
  }

  String toString() {
    return text;
  }
}

void drawMenu() {
  final int TEXT_SIZE = 14;
  final int PADDING_TOP = 10;
  final int PADDING_LEFT = 10;
  textSize(TEXT_SIZE);
  fill(0, 200, 50);
  int idx = 1;
  for (Menu item: Menu.values()) {
    text(item.toString(), PADDING_LEFT, TEXT_SIZE*idx + PADDING_TOP);
    idx++;
  }
}

void mousePressed() {
  for (Point p: points_g) {
    if (overPoint(p, mouseX, mouseY, strokeWeight/2f)) {
      selectedPoint = p;
      return;
    }
  }
  selectedPoint = null;
}

void mouseClicked() {
  addRemovePoint();
}

void mouseDragged() {
  if (selectedPoint != null) {
    selectedPoint.x = mouseX;
    selectedPoint.y = mouseY;
  }
}

void keyPressed() {
  if (key == 'c' || key == 'C') {
    points_g.clear();
  } else if (key == 'g' || key == 'G') {
    points_g = generateRandomPoints(randomPointsCount);
  } else if (key == 'w' || key == 'W') {
    useGrahamScan = !useGrahamScan;
  }
}

void clear() {
  points_g.clear();
}

void addRemovePoint() {
  Point point = new Point(mouseX, mouseY);
  selectedPoint = point;
  ArrayList<Point> points_new = new ArrayList();
  boolean removed = false;

  for (Point p: points_g) {
    if (removed || !overPoint(p, mouseX, mouseY, strokeWeight/2)) {
      points_new.add(p);
    } else {
      removed = true;
      selectedPoint = p;
    }
  }

  points_g = points_new;
  if (!removed) {
    points_g.add(point);
  }
}

ArrayList<Point> generateRandomPoints(int count_) {
  ArrayList<Point> points = new ArrayList();
  for (int i = 0; i < count_; i++) {
    float ratio = 8/10f;
    float point_x = ratio*random(width) + 0.1*width;
    float point_y = ratio*random(height) + 0.1*height;
    points.add(new Point(point_x, point_y));
  }
  return points;
}

boolean overPoint(Point point_, float x_, float y_, float r_) {
  return (dist(point_.x, point_.y, x_, y_) <= r_);
}

class Point {
  float x;
  float y;

  Point(float x_, float y_) {
    x = x_;
    y = y_;
  }

  String toString() {
   return "<Point: x=" + this.x + ", y=" + this.y + ">";
  }
}

// COMPARATORS

class PointBiggestXSmallestYComparator implements Comparator<Point> {
  int compare(Point first, Point second) {
    if (first.x > second.x) {
      return -1;
    } else if (first.x == second.x && first.y < second.y) {
      return -1;
    } else if (first.x == second.x && first.y == second.y) {
      return 0;
    } else {
      return 1;
    }
  }
}

class PointSmallestYBiggestXComparator implements Comparator<Point> {
  int compare(Point first, Point second) {
    if (first.y < second.y) {
      return -1;
    } else if (first.y == second.y && first.x > second.x) {
      return -1;
    } else if (first.y == second.y && first.x == second.x) {
      return 0;
    } else {
      return 1;
    }
  }
}

// HELPER FUNCTIONS

double crossProduct(Point a, Point b, Point c) {
  return (b.x - a.x)*(c.y - a.y) - (b.y - a.y)*(c.x - a.x);
}

boolean isTurnLeft(Point a, Point b, Point c) {
  return crossProduct(a, b, c) > 0;
}

// CONVEX HULL ALGORITHMS

List<Point> grahamScan(List<Point> points_) {
  if (points_ == null || points_.isEmpty()) {
    println("List of points can't be empty");
    return points_;
  }
  // sort points by coordinates and get pivot
  List<Point> pointsSorted = new ArrayList(points_);
  Collections.sort(pointsSorted, new PointSmallestYBiggestXComparator());

  Point pivot = pointsSorted.get(0);

  // sort points by angle with pivot
  PVector pivotVector = new PVector(1, 0);
  List<Float> angles = new ArrayList();
  float angleMax = 0f;
  SortedMap<Float, Point> pointsSortedAngles = new TreeMap();
  pointsSortedAngles.put(0f, pivot);

  for (int i = 1; i < pointsSorted.size(); i++) {
    PVector otherVector = new PVector(pivot.x-pointsSorted.get(i).x, pivot.y-pointsSorted.get(i).y);
    float angle = degrees(PVector.angleBetween(pivotVector, otherVector));

    pointsSortedAngles.put(angle, pointsSorted.get(i));
  }

  pointsSorted = new ArrayList(pointsSortedAngles.values());
  angles = new ArrayList(pointsSortedAngles.keySet());

  if (pointsSorted.size() < 3) {
    return pointsSorted;
  }

  // convex hull
  Stack<Point> pointStack = new Stack();
  pointStack.push(pointsSorted.get(0));
  pointStack.push(pointsSorted.get(1));
  int j = 2;
  while (j < pointsSorted.size()) {
    int stackSize = pointStack.size();
    if (isTurnLeft(pointsSorted.get(j), pointStack.get(stackSize-1), pointStack.get(stackSize-2))) {
      pointStack.push(pointsSorted.get(j));
      j++;
    } else {
      pointStack.pop();
    }
  }

  return pointStack;
}
