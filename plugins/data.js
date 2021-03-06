(function() {
  var summary, thumbs,
    __hasProp = {}.hasOwnProperty;

  window.plugins.data = {
    emit: function(div, item) {
      $('<p />').addClass('readout').appendTo(div).text(summary(item));
      return $('<p />').addClass('label').appendTo(div).html(wiki.resolveLinks(item.text || 'data'));
    },
    bind: function(div, item) {
      var average, label, lastThumb, readout, refresh, value;
      lastThumb = null;
      div.find('.readout').mousemove(function(e) {
        var thumb;
        thumb = thumbs(item)[Math.floor(thumbs(item).length * e.offsetX / e.target.offsetWidth)];
        if (thumb === lastThumb || null === (lastThumb = thumb)) {
          return;
        }
        refresh(thumb);
        return $(div).trigger('thumb', thumb);
      }).dblclick(function(e) {
        return wiki.dialog("JSON for " + item.text, $('<pre/>').text(JSON.stringify(item, null, 2)));
      });
      div.find('.label').dblclick(function() {
        return wiki.textEditor(div, item);
      });
      $(".main").on('thumb', function(evt, thumb) {
        if (!(thumb === lastThumb || -1 === (thumbs(item).indexOf(thumb)))) {
          return refresh(thumb);
        }
      });
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
      average = function(thumb) {
        var result, values;
        values = _.map(item.data, function(obj) {
          return value(obj[thumb]);
        });
        values = _.reject(values, function(obj) {
          return isNaN(obj);
        });
        result = _.reduce(values, (function(m, n) {
          return m + n;
        }), 0) / values.length;
        return result.toFixed(2);
      };
      readout = function(thumb) {
        var field;
        if (item.columns != null) {
          return average(thumb);
        }
        if (item.data.object == null) {
          return summary(item);
        }
        field = item.data[thumb];
        if (field.value != null) {
          return "" + field.value;
        }
        if (field.constructor === Number) {
          return "" + (field.toFixed(2));
        }
        return NaN;
      };
      label = function(thumb) {
        if ((item.columns != null) && item.data.length > 1) {
          return "Averaged:<br>" + thumb;
        }
        return thumb;
      };
      return refresh = function(thumb) {
        div.find('.readout').text(readout(thumb));
        return div.find('.label').html(label(thumb));
      };
    }
  };

  summary = function(item) {
    if (item.columns != null) {
      return "" + item.data.length + "x" + item.columns.length;
    }
    if ((item.data != null) && (item.data.nodes != null) && (item.data.links != null)) {
      return "" + item.data.nodes.length + "/" + item.data.links.length;
    }
    return "1x" + (thumbs(item).length);
    return "data";
  };

  thumbs = function(item) {
    var key, _ref, _results;
    if (item.columns != null) {
      return item.columns;
    }
    _ref = item.data;
    _results = [];
    for (key in _ref) {
      if (!__hasProp.call(_ref, key)) continue;
      _results.push(key);
    }
    return _results;
  };

}).call(this);

//# sourceMappingURL=data.js.map
