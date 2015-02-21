(function() {
  window.plugins.logwatch = {
    bind: function(div, item) {},
    emit: function(div, item) {
      var print, socket;
      socket = new WebSocket('ws://' + window.document.location.host + '/system/logwatch');
      print = function(m) {
        return div.append($("<li>").html(m));
      };
      socket.onopen = function() {
        return print("WebSocket Connection Opened.");
      };
      socket.onmessage = function(e) {
        var msg;
        msg = JSON.parse(e.data);
        return print(wiki.resolveLinks("[[" + msg.title + "]] " + msg.listeners));
      };
      return socket.onclose = function() {
        return print("WebSocket Connection Closed.");
      };
    }
  };

}).call(this);

//# sourceMappingURL=logwatch.js.map
