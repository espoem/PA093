class Menu {
  constructor() {
    this.msgs = {
      GENERATE_POINTS: 'g - Add random points',
      REMOVE_POINTS: 'c - Remove all points',
      GIFT_WRAPPING: 'q - Gift wrapping convex hull',
      GRAHAM_SCAN: 'w - Graham scan convex hull',
      TRIANGULATION_SL: 'e - Sweeping line triangulation',
      KDTREE: 'r - KDTree',
      DELAUNAY: 't - Delaunay triangulation',
      VORONOI: 'a - Voronoi diagram',
      POLYGON_SELECT: 'L - Select points to create a polygon',
      POLYGON_CLEAR: 'Esc - Clear polygon and deselect algorithm',
    };
    this.algorithms = {};
    for (let v in this.msgs) {
      this.algorithms[v] = v;
    }
    this.text_size = 14;
    this.padding_top = 10;
    this.padding_left = 10;
    this.text_color = {
      r: 0,
      g: 200,
      b: 50,
    };
  }

  draw() {
    // noStroke();
    let oldTextSize = textSize();
    textSize(this.text_size);
    let i = 1;
    for (let key in this.msgs) {
      text(
        this.msgs[key],
        this.padding_left,
        this.text_size * i + this.padding_top
      );
      ++i;
    }
    textSize(oldTextSize);
  }
}
