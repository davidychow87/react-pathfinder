//from http://bl.ocks.org/elidupuis/11325438

//The slower the mouse moves, the more this function reduces the points
const simplifyRadialDistance = (data, sqTolerance) => {

    function getSquareDist(p1, p2) {
        let dx = p1.x - p2.x,
            dy = p1.y - p2.y;

        return dx * dx + dy * dy;
    }

    let prevPoint = data[0], newPoints = [prevPoint], point;

    for (let i = 0; i < data.length; i++) {
        point = data[i];

        if (getSquareDist(point, prevPoint) > sqTolerance) {
            newPoints.push(point);
            prevPoint = point;
        }
    }

    if (prevPoint != point) newPoints.push(point);

    return newPoints;
}

const simplifyDouglasPeuker = (points, sqTolerance) => {
    //square dist from point to a segment
    function getSqSegDist(p, p1, p2) {
        let x = p1.x,
            y = p1.y,
            dx = p2.x - x,
            dy = p2.y - y;

            if (dx !== 0 || dy !== 0) {
                let t = ((p.x - x) * dx + (p.y - y) * dy) / (dx * dx + dy * dy);

                if (t > 1) {
                    x = p2.x;
                    y = p2.y;
                } else if (t > 0) {
                    x += dx * t;
                    y += dy * t;
                }
            }

            dx = p.x - x;
            dy = p.y - y;

            return dx * dx + dy * dy;
    }

    let len = points.length,
     MarkerArray = typeof Uint8Array !== 'undefined' ? Uint8Array : Array,
     markers = new MarkerArray(len),
     first = 0, last = len -1,
     stack = [],
     newPoints = [],
     i, maxSqDist, sqDist, index;

    markers[first] = markers[last] = 1;

    while (last) {
        maxSqDist = 0;

        //find the max distance between segmetn
        for (i = first + 1; i < last; i++) {
            sqDist = getSqSegDist(points[i], points[first], points[last]);

            if (sqDist > maxSqDist) {
                index = i,
                maxSqDist = sqDist
            }
        }

        if (maxSqDist > sqTolerance) {
            markers[index] = 1;
            stack.push(first, index, index, last);
        }

        last = stack.pop();
        first = stack.pop();
    }

    for (i = 0; i < len; i++) {
        if (markers[i]) newPoints.push(points[i]);
    }

    return newPoints;
}

const reduce = (data, tolerance, highestQuality) => {
    let newData;
    // console.log('pts before', data);
    if (data.length <= 1) return data;

    let sqTolerance;
     if (tolerance) {
         sqTolerance = tolerance * tolerance;
     } else {
         sqTolerance = 1;
     }

     if (!highestQuality) {
         newData = simplifyRadialDistance(data, sqTolerance);
     }
    //  console.log('Data After Radila Simp', newData)
    newData = simplifyDouglasPeuker(newData, sqTolerance);
    // console.log('pts after doug', newData);
    return newData;
}

export default reduce;