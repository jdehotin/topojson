var tape = require("tape"),
    internals = require("../build/topojson-internals"),
    quantize = internals.prequantize;

tape("prequantize returns the quantization transform", function(test) {
  test.deepEqual(quantize({}, [0, 0, 1, 1], 1e4), {
    scale: [1 / 9999, 1 / 9999],
    translate: [0, 0]
  });
  test.end();
});

tape("prequantize converts coordinates to fixed precision", function(test) {
  var objects = {
    foo: {
      type: "LineString",
      arcs: [[0, 0], [1, 0], [0, 1], [0, 0]]
    }
  };
  quantize(objects, [0, 0, 1, 1], 1e4);
  test.deepEqual(objects.foo.arcs, [[0, 0], [9999, 0], [0, 9999], [0, 0]]);
  test.end();
});

tape("prequantize observes the quantization parameter", function(test) {
  var objects = {
    foo: {
      type: "LineString",
      arcs: [[0, 0], [1, 0], [0, 1], [0, 0]]
    }
  };
  quantize(objects, [0, 0, 1, 1], 10);
  test.deepEqual(objects.foo.arcs, [[0, 0], [9, 0], [0, 9], [0, 0]]);
  test.end();
});

tape("prequantize observes the bounding box", function(test) {
  var objects = {
    foo: {
      type: "LineString",
      arcs: [[0, 0], [1, 0], [0, 1], [0, 0]]
    }
  };
  quantize(objects, [-1, -1, 2, 2], 10);
  test.deepEqual(objects.foo.arcs, [[3, 3], [6, 3], [3, 6], [3, 3]]);
  test.end();
});

tape("prequantize applies to points as well as arcs", function(test) {
  var objects = {
    foo: {
      type: "MultiPoint",
      coordinates: [[0, 0], [1, 0], [0, 1], [0, 0]]
    }
  };
  quantize(objects, [0, 0, 1, 1], 1e4);
  test.deepEqual(objects.foo.coordinates, [[0, 0], [9999, 0], [0, 9999], [0, 0]]);
  test.end();
});

tape("prequantize skips coincident points in lines", function(test) {
  var objects = {
    foo: {
      type: "LineString",
      arcs: [[0, 0], [0.9, 0.9], [1.1, 1.1], [2, 2]]
    }
  };
  quantize(objects, [0, 0, 2, 2], 3);
  test.deepEqual(objects.foo.arcs, [[0, 0], [1, 1], [2, 2]]);
  test.end();
});

tape("prequantize skips coincident points in polygons", function(test) {
  var objects = {
    foo: {
      type: "Polygon",
      arcs: [[[0, 0], [0.9, 0.9], [1.1, 1.1], [2, 2], [0, 0]]]
    }
  };
  quantize(objects, [0, 0, 2, 2], 3);
  test.deepEqual(objects.foo.arcs, [[[0, 0], [1, 1], [2, 2], [0, 0]]]);
  test.end();
});

tape("prequantize does not skip coincident points in points", function(test) {
  var objects = {
    foo: {
      type: "MultiPoint",
      coordinates: [[0, 0], [0.9, 0.9], [1.1, 1.1], [2, 2], [0, 0]]
    }
  };
  quantize(objects, [0, 0, 2, 2], 3);
  test.deepEqual(objects.foo.coordinates, [[0, 0], [1, 1], [1, 1], [2, 2], [0, 0]]);
  test.end();
});

tape("prequantize includes closing point in degenerate lines", function(test) {
  var objects = {
    foo: {
      type: "LineString",
      arcs: [[1, 1], [1, 1], [1, 1]]
    }
  };
  quantize(objects, [0, 0, 2, 2], 3);
  test.deepEqual(objects.foo.arcs, [[1, 1], [1, 1]]);
  test.end();
});

tape("prequantize includes closing point in degenerate polygons", function(test) {
  var objects = {
    foo: {
      type: "Polygon",
      arcs: [[[0.9, 1], [1.1, 1], [1.01, 1], [0.9, 1]]]
    }
  };
  quantize(objects, [0, 0, 2, 2], 3);
  test.deepEqual(objects.foo.arcs, [[[1, 1], [1, 1], [1, 1], [1, 1]]]);
  test.end();
});
