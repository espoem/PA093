ArrayList<Point> points_g = new ArrayList();
int strokeWeight = 15;
Point selectedPoint;
int randomPointsCount = 20;

void setup() {
  size(640, 480);
  
  points_g = generateRandomPoints(randomPointsCount);
}

void draw() {
  background(255);
  fill(0);
  strokeWeight(strokeWeight);
  
  for (Point p: points_g) {
    point(p.x, p.y);
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
}
