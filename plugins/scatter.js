(function() {
  window.plugins.scatter = {
    bind: function(div, item) {},
    emit: function(div, item) {
      return wiki.getScript('/js/d3/d3.js', function() {
        return wiki.getScript('/js/d3/d3.time.js', function() {
          var data, extent, fill, h, horz, p, round, title, value, vert, vis, w, who, x, xdat, y, ydat;
          div.append(' <style>\n svg {\n   font: 10px sans-serif;\n   background: #eee;\n }\n circle {\n   fill: gray;\n   stroke: white;\n }\n</style>');
          value = function(obj) {
            if (obj == null) {
              return NaN;
            }
            switch (obj.constructor) {
              case Number:
                return obj;
              case String:
                return +obj;
              case Array:
                return value(obj[0]);
              case Object:
                return value(obj.value);
              case Function:
                return obj();
              default:
                return NaN;
            }
          };
          round = function(n) {
            if (n == null) {
              return '?';
            }
            if (n.toString().match(/\.\d\d\d/)) {
              return n.toFixed(2);
            } else {
              return n;
            }
          };
          who = $('.chart,.data,.calculator').last();
          data = who.data('item').data;
          horz = "Water / Land Intensity Total";
          vert = "Total Score";
          xdat = function(d) {
            return value(d[horz]);
          };
          ydat = function(d) {
            return value(d[vert]);
          };
          title = function(d) {
            return "" + d.Material + "\n" + horz + ": " + (round(xdat(d))) + "\n" + vert + ": " + (round(ydat(d))) + "\nRank: " + (value(d['Rank']));
          };
          who.bind('thumb', function(e, thumb) {
            var x;
            if (thumb === horz) {
              return;
            }
            wiki.log('thumb', thumb);
            horz = thumb;
            x = d3.scale.linear().domain(extent(xdat)).range([0, w]);
            return d3.selectAll("circle").transition().duration(500).delay(function(d, i) {
              return i * 10;
            }).attr("cx", function(d) {
              return x(xdat(d));
            }).selectAll("title").text(title);
          });
          extent = function(f) {
            var hi, lo, step, _ref;
            _ref = [d3.min(data, f), d3.max(data, f)], lo = _ref[0], hi = _ref[1];
            step = Math.pow(10, Math.floor(Math.log(hi - lo) / Math.log(10)));
            return [step * Math.floor(lo / step), step * Math.ceil(hi / step)];
          };
          w = 360;
          h = 275;
          p = 20;
          x = d3.scale.linear().domain(extent(xdat)).range([0, w]);
          y = d3.scale.linear().domain(extent(ydat)).range([h, 0]);
          fill = d3.scale.category20();
          vis = d3.select(div.get(0)).data([data]).append("svg:svg").attr("width", w + p * 2).attr("height", h + p * 2).append("svg:g").attr("transform", "translate(" + p + "," + p + ")");
          return vis.selectAll("circle").data(data).enter().append("svg:circle").attr("cx", function(d) {
            return x(xdat(d));
          }).attr("cy", function(d) {
            return y(ydat(d));
          }).style("fill", function(d, i) {
            return fill(d.Cluster || d.Material.split(/\s+/).reverse()[0]);
          }).style("cursor", 'pointer').attr("r", 10).on("click", function(d) {
            return wiki.doInternalLink(d.Material, div.parents('.page'));
          }).append("svg:title").text(title);
        });
      });
    }
  };

}).call(this);

//# sourceMappingURL=scatter.js.map
