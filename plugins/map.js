(function() {
  var uniqueId;

  window.plugins.map = {
    bind: function(div, item) {},
    emit: function(div, item) {
      if (!$("link[href='http://cdn.leafletjs.com/leaflet-0.7.2/leaflet.css']").length) {
        $('<link rel="stylesheet" href="http://cdn.leafletjs.com/leaflet-0.7.2/leaflet.css">').appendTo("head");
      }
      if (!$("link[href='/plugins/map/map.css']").length) {
        $('<link rel="stylesheet" href="/plugins/map/map.css" type="text/css">').appendTo("head");
      }
      return wiki.getScript("http://cdn.leafletjs.com/leaflet-0.7.2/leaflet.js", function() {
        var figure, map, mapId;
        mapId = 'map-' + uniqueId();
        figure = $("<figure></figure>").mouseout(function(e) {
          if (!figure.hasClass('mapEditing')) {
            return;
          }
          if (!$(e.relatedTarget).hasAnyClass("page", "story")) {
            return;
          }
          if (!map.getCenter().equals(item.latlng) || item.zoom !== map.getZoom() || item.text !== $("textarea").val()) {
            item.latlng = map.getCenter();
            item.zoom = map.getZoom();
            item.text = $("textarea").val();
            plugins.map.save(div, item);
          }
          figure.find("textarea").replaceWith("<figcaption>" + (wiki.resolveLinks(item.text)) + "</figcaption>");
          figure.removeClass('mapEditing');
          return null;
        }).dblclick(function() {
          var original, textarea, _ref;
          if (figure.hasClass('mapEditing')) {
            return;
          }
          figure.addClass('mapEditing');
          textarea = $("<textarea>" + (original = (_ref = item.text) != null ? _ref : '') + "</textarea>");
          figure.find("figcaption").replaceWith(textarea);
          return null;
        }).bind('keydown', function(e) {
          var page;
          if ((e.altKey || e.ctlKey || e.metaKey) && e.which === 83) {
            figure.mouseout();
            return false;
          }
          if ((e.altKey || e.ctlKey || e.metaKey) && e.which === 73) {
            e.preventDefault();
            if (!e.shiftKey) {
              page = $(e.target).parents('.page');
            }
            wiki.doInternalLink("about map plugin", page);
            return false;
          }
        });
        div.html(figure);
        figure.append("<div id='" + mapId + "' style='height: 300px;'></div>");
        map = L.map(mapId).setView(item.latlng || [40.735383, -73.984655], item.zoom || 13);
        map.doubleClickZoom.disable();
        L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);
        if (!item.text) {
          item.text = "Map Caption";
        }
        return figure.append("<figcaption>" + (wiki.resolveLinks(item.text)) + "</figcaption>");
      });
    },
    save: function(div, item) {
      return wiki.pageHandler.put(div.parents('.page:first'), {
        type: 'edit',
        id: item.id,
        item: item
      });
    }
  };

  uniqueId = function(length) {
    var id;
    if (length == null) {
      length = 8;
    }
    id = "";
    while (id.length < length) {
      id += Math.random().toString(36).substr(2);
    }
    return id.substr(0, length);
  };

  $.fn.hasAnyClass = function() {
    var i;
    i = 0;
    while (i < arguments.length) {
      if (this.hasClass(arguments[i])) {
        return true;
      }
      i++;
    }
    return false;
  };

}).call(this);

//# sourceMappingURL=map.js.map
