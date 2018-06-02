function lineIntersection(line1, line2) {
    var x1 = line1.x1, x2 = line1.x2, x3 = line2.x1, x4 = line2.x2;
    var y1 = line1.y1, y2 = line1.y2, y3 = line2.y1, y4 = line2.y2;
    var pt_denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
    var pt_x_num = (x1*y2 - y1*x2) * (x3 - x4) - (x1 - x2) * (x3*y4 - y3*x4);
    var pt_y_num = (x1*y2 - y1*x2) * (y3 - y4) - (y1 - y2) * (x3*y4 - y3*x4);
    if (pt_denom == 0) { 
        return 'parallel'; 
    } else { 
      var pt = {'x': pt_x_num / pt_denom, 'y': pt_y_num / pt_denom}; 
      if (btwn(pt.x, x1, x2) && btwn(pt.y, y1, y2) && btwn(pt.x, x3, x4) && btwn(pt.y, y3, y4)) {
          pt.x = (pt.x).round();
          pt.y = (pt.y).round(); 
          return pt; 
      } else { 
        return 'not in range'; 
      }
    }
}

function btwn(a, b1, b2) {
    if ((a >= b1) && (a <= b2)) { return true; }
    if ((a >= b2) && (a <= b1)) { return true; }
    return false;
  }

export {
    lineIntersection,
}