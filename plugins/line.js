(function() {
  var extent;

  extent = function(data, f) {
    var hi, lo, step, _ref;
    _ref = [d3.min(data, f), d3.max(data, f)], lo = _ref[0], hi = _ref[1];
    step = Math.pow(10, Math.floor(Math.log(hi - lo) / Math.log(10)));
    return [step * Math.floor(lo / step), step * Math.ceil(hi / step)];
  };

  window.plugins.line = {
    bind: function(div, item) {},
    emit: function(div, item) {
      return wiki.getScript('/js/d3/d3.js', function() {
        return wiki.getScript('/js/d3/d3.time.js', function() {
          var candidates, choice, data, h, lastThumb, line, p, series, start, vis, w, who, x, xrules, y, yrules;
          w = 350;
          h = 275;
          p = 40;
          div.append('<style>\n  svg { font: 10px sans-serif; }\n  .rule line { stroke: #eee; shape-rendering: crispEdges; }\n  .rule line.axis { stroke: #000; }\n  .line { fill: none; stroke: steelblue; stroke-width: 1.5px; }\n  .line text { stroke-width: 1px; }\n  circle.line { fill: #fff; }\n</style>');
          candidates = $(".item:lt(" + ($('.item').index(div)) + ")");
          if ((who = candidates.filter(".sequence-source")).size()) {
            choice = who[who.length - 1];
            data = (function() {
              var _i, _len, _ref, _results;
              _ref = choice.getSequenceData();
              _results = [];
              for (x = _i = 0, _len = _ref.length; _i < _len; x = ++_i) {
                y = _ref[x];
                _results.push({
                  x: x,
                  y: +y
                });
              }
              return _results;
            })();
            x = d3.scale.linear().domain(extent(data, function(p) {
              return p.x;
            })).range([0, w]);
            y = d3.scale.linear().domain(extent(data, function(p) {
              return p.y;
            })).range([h, 0]);
          } else {
            series = wiki.getData();
            data = (start = series[0][0]) > 1000000000000 ? (function() {
              var _i, _len, _ref, _results;
              _results = [];
              for (_i = 0, _len = series.length; _i < _len; _i++) {
                _ref = series[_i], x = _ref[0], y = _ref[1];
                _results.push({
                  t: new Date(x),
                  x: x,
                  y: y
                });
              }
              return _results;
            })() : start > 1000000000 ? (function() {
              var _i, _len, _ref, _results;
              _results = [];
              for (_i = 0, _len = series.length; _i < _len; _i++) {
                _ref = series[_i], x = _ref[0], y = _ref[1];
                _results.push({
                  t: new Date(x * 1000),
                  x: x,
                  y: y
                });
              }
              return _results;
            })() : (function() {
              var _i, _len, _results;
              _results = [];
              for (_i = 0, _len = series.length; _i < _len; _i++) {
                p = series[_i];
                _results.push({
                  t: new Date(p.Date),
                  y: p.Price * 1
                });
              }
              return _results;
            })();
            x = d3.time.scale().domain(extent(data, function(p) {
              return p.t;
            })).range([0, w]);
            y = d3.scale.linear().domain(extent(data, function(p) {
              return p.y;
            })).range([h, 0]);
          }
          lastThumb = null;
          $('.main').bind('thumb', function(e, thumb) {
            if (thumb === lastThumb) {
              return;
            }
            lastThumb = thumb;
            return d3.selectAll("circle.line").attr('r', function(d) {
              if (d.x === thumb) {
                return 8;
              } else {
                return 3.5;
              }
            });
          });
          vis = d3.select(div.get(0)).data([data]).append("svg:svg").attr("width", w + p * 2).attr("height", h + p * 2).append("svg:g").attr("transform", "translate(" + p + "," + p + ")");
          xrules = vis.selectAll("g.xrule").data(x.ticks(5)).enter().append("svg:g").attr("class", "rule");
          xrules.append("svg:line").attr("x1", x).attr("x2", x).attr("y1", 0).attr("y2", h - 1);
          xrules.append("svg:text").attr("x", x).attr("y", h + 3).attr("dy", ".71em").attr("text-anchor", "middle").text(x.tickFormat(10));
          yrules = vis.selectAll("g.yrule").data(y.ticks(10)).enter().append("svg:g").attr("class", "rule");
          yrules.append("svg:line").attr("class", function(d) {
            if (d) {
              return null;
            } else {
              return "axis";
            }
          }).attr("y1", y).attr("y2", y).attr("x1", 0).attr("x2", w + 1);
          yrules.append("svg:text").attr("y", y).attr("x", -3).attr("dy", ".35em").attr("text-anchor", "end").text(y.tickFormat(10));
          line = d3.svg.line().x(function(d) {
            return x(d.t || d.x);
          }).y(function(d) {
            return y(d.y);
          });
          vis.append("svg:path").attr("class", "line").attr("d", line);
          vis.selectAll("circle.line").data(data).enter().append("svg:circle").attr("class", "line").attr("cx", function(d) {
            return x(d.t || d.x);
          }).attr("cy", function(d) {
            return y(d.y);
          }).attr("r", 3.5).on('mouseover', function(d) {
            div.trigger('thumb', lastThumb = d.x);
            return d3.select(this).attr('r', 8);
          }).on('mouseout', function() {
            return d3.select(this).attr('r', 3.5);
          });
          if (choice) {
            return $(choice).on('sequence', function(e, sequence) {
              var xx, yy;
              data = (function() {
                var _i, _len, _results;
                _results = [];
                for (xx = _i = 0, _len = sequence.length; _i < _len; xx = ++_i) {
                  yy = sequence[xx];
                  _results.push({
                    x: xx,
                    y: +yy
                  });
                }
                return _results;
              })();
              vis.selectAll('circle.line').data(data).transition().attr("cy", function(d) {
                return y(d.y);
              });
              return vis.selectAll('path').data([data]).transition().attr("d", line);
            });
          }
        });
      });
    }
  };

}).call(this);

//# sourceMappingURL=line.js.map
