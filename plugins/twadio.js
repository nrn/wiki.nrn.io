(function() {
  var bind, emit, parse;

  parse = function(text) {
    var defn;
    return defn = {
      freq: 14.042,
      tune: 30,
      sufix: 'Notes'
    };
  };

  emit = function($item, item) {
    var defn;
    defn = parse(item.text);
    return $item.append("<div style=\"background-color:#eee; padding: 1em;\">\n	<button class=\"send\">Send</button> psk-31 on " + defn.freq + " MHz<br>\n	<button class=\"tune\">Tune</button> for " + defn.tune + " seconds<br>\n	<p class=\"caption\">status here</p>\n	<h4>Pages Ready to Send</h4>\n	<div class=\"schedule\">\n		<a href=\"#\">Jeremy McDermond NH6Z Notes</a><br>\n		<a href='#'>Ward Cunningham K9OX Notes</a>\n	</div>\n</div>");
  };

  bind = function($item, item) {
    var $page, $schedule, $send, $tune, defn, each, host, payload, progress, request, schedule, select, socket, status;
    defn = parse(item.text);
    status = {};
    wiki.log(defn);
    $send = $item.find('button.send');
    $tune = $item.find('button.tune');
    $schedule = $item.find('div.schedule');
    $page = $item.parents('.page:first');
    host = $page.data('site') || location.host;
    if (host === 'origin' || host === 'local') {
      host = location.host;
    }
    socket = new WebSocket("ws://" + host + "/plugin/twadio");
    $item.dblclick(function() {
      return wiki.textEditor($item, item);
    });
    progress = function(m) {
      return $item.find('p.caption').html(m);
    };
    schedule = [];
    select = function(sufix) {
      var each, elem, _i, _len, _ref, _results;
      schedule = [];
      _ref = $('.page');
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        elem = _ref[_i];
        each = $(elem).data('data');
        if (each.title.match(/Notes$/i)) {
          _results.push(schedule.push(each));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };
    select('Notes');
    $schedule.html(schedule.length ? ((function() {
      var _i, _len, _results;
      _results = [];
      for (_i = 0, _len = schedule.length; _i < _len; _i++) {
        each = schedule[_i];
        _results.push(each.title);
      }
      return _results;
    })()).join('<br/>') : "<i>We look left for pages to transmit.<br>None found with required sufix 'Notes'.</i>");
    payload = function() {
      var result, _i, _j, _len, _len1, _ref;
      select('Notes');
      result = [];
      for (_i = 0, _len = schedule.length; _i < _len; _i++) {
        each = schedule[_i];
        wiki.log('each', each);
        result.push(each.title);
        _ref = each.story;
        for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
          item = _ref[_j];
          if (item.type === 'paragraph') {
            result.push(item.text);
          }
        }
      }
      return result.join("\n");
    };
    request = function(action) {
      var message;
      if (action.action === 'send') {
        action.text = payload();
      }
      progress("send " + (message = JSON.stringify(action)));
      if (socket) {
        return socket.send(message);
      }
    };
    $send.on('click', function() {
      return request({
        action: status.mode === 'send' ? 'stop' : 'send'
      });
    });
    $tune.on('click', function() {
      return request({
        action: status.mode === 'tune' ? 'stop' : 'tune'
      });
    });
    socket.onopen = function() {
      return progress("opened");
    };
    socket.onmessage = function(e) {
      progress("message " + e.data);
      status = JSON.parse(e.data);
      $send.html(status.mode === 'send' ? 'Stop' : 'Send');
      return $tune.html(status.mode === 'tune' ? 'Stop' : 'Tune');
    };
    return socket.onclose = function() {
      progress("closed");
      return socket = null;
    };
  };

  if (typeof window !== "undefined" && window !== null) {
    window.plugins.twadio = {
      emit: emit,
      bind: bind
    };
  }

}).call(this);

//# sourceMappingURL=twadio.js.map
