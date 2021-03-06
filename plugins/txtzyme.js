(function() {
  var apply, bind, emit, parse, report, value;

  parse = function(text) {
    var defn, line, prev, word, words, _i, _j, _len, _len1, _ref, _ref1;
    defn = {};
    _ref = text.split(/\n+/);
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      line = _ref[_i];
      words = line.split(/\s+/);
      if (words[0]) {
        defn[words[0]] = prev = words.slice(1, 1000);
      } else {
        _ref1 = words.slice(1, 1000);
        for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
          word = _ref1[_j];
          prev.push(word);
        }
      }
    }
    return defn;
  };

  value = function(type, number, arg) {
    var string;
    switch (type) {
      case 'A':
        if (number.length) {
          return arg[+number];
        } else {
          return arg;
        }
        break;
      case 'B':
        return 1 & (arg >> (number || 0));
      case 'C':
        string = arg.toString();
        if (number < string.length) {
          return string.charCodeAt(number);
        } else {
          return 32;
        }
        break;
      case 'D':
        return 48 + Math.floor(+arg / (Math.pow(10, number)) % 10);
      case '':
        return number;
    }
  };

  apply = function(defn, call, arg, emit) {
    var words, _ref;
    if (!(words = (_ref = defn[call]) != null ? _ref.slice(0) : void 0)) {
      return;
    }
    return (function(stack, result) {
      var next, send;
      send = function() {
        var text;
        if (!result.length) {
          return;
        }
        text = "" + (result.join(' ')) + "\n";
        result = [];
        return emit(text, stack, next);
      };
      next = function() {
        var m, word, _ref1, _ref2, _ref3;
        if (!stack.length) {
          return;
        }
        word = (_ref1 = stack[stack.length - 1]) != null ? _ref1.words.shift() : void 0;
        arg = (_ref2 = stack[stack.length - 1]) != null ? _ref2.arg : void 0;
        if (word === void 0) {
          stack.pop();
        } else if (word === 'NL') {
          return send();
        } else if (m = word.match(/^([ABCD])([0-9]*)$/)) {
          result.push(value(m[1], m[2], arg));
        } else if (m = word.match(/^([A-Z][A-Z0-9]*)(\/([ABCD]?)([0-9]*))?$/)) {
          if (stack.length < 10 && (words = (_ref3 = defn[m[1]]) != null ? _ref3.slice(0) : void 0)) {
            if (m[2]) {
              arg = value(m[3], m[4], arg);
            }
            stack.push({
              call: word,
              arg: arg,
              words: words
            });
          }
        } else {
          result.push(word);
        }
        if (stack.length) {
          return next();
        } else {
          return send();
        }
      };
      if (words.length) {
        return next();
      }
    })([
      {
        call: call,
        arg: arg,
        words: words
      }
    ], []);
  };

  report = function(defn) {
    var key, word, words, _i, _len;
    report = [];
    for (key in defn) {
      words = defn[key];
      report.push("<li class=\"" + key + "\"><span>" + key + "</span>");
      for (_i = 0, _len = words.length; _i < _len; _i++) {
        word = words[_i];
        report.push("<span>" + word + "</span>");
      }
    }
    return report.join(' ');
  };

  if (typeof module !== "undefined" && module !== null) {
    module.exports = {
      parse: parse,
      apply: apply
    };
  }

  emit = function($item, item) {
    return $item.append("<div style=\"width:93%; background:#eee; padding:.8em; margin-bottom:5px;\">\n  <p class=\"report\" style=\"white-space: pre; white-space: pre-wrap;\">" + item.text + "</p>\n  <p class=\"caption\">status here</p>\n</div>");
  };

  bind = function($item, item) {
    var $page, defn, dialog, frame, host, oldresponse, progress, rcvd, response, rrept, sent, socket, srept, startTicking, tick, timer, trigger;
    defn = parse(item.text);
    $page = $item.parents('.page:first');
    host = $page.data('site') || location.host;
    if (host === 'origin' || host === 'local') {
      host = location.host;
    }
    socket = new WebSocket("ws://" + host + "/plugin/txtzyme");
    sent = rcvd = 0;
    srept = rrept = "";
    oldresponse = response = [];
    if (item.text.replace(/_.*?_/g, '').match(/p/)) {
      $item.addClass('sequence-source');
      $item.get(0).getSequenceData = function() {
        if (response.length) {
          return response;
        } else {
          return oldresponse;
        }
      };
    }
    tick = function() {
      var arg, now;
      now = new Date();
      arg = [now.getSeconds(), now.getMinutes(), now.getHours()];
      trigger('SECOND', arg);
      if (arg[0]) {
        return;
      }
      trigger('MINUTE', arg);
      if (arg[1]) {
        return;
      }
      trigger('HOUR', arg);
      if (arg[2]) {
        return;
      }
      return trigger('DAY', arg);
    };
    timer = null;
    startTicking = function() {
      timer = setInterval(tick, 1000);
      return tick();
    };
    setTimeout(startTicking, 1000 - (new Date().getMilliseconds()));
    $item.dblclick(function() {
      clearInterval(timer);
      if (socket != null) {
        socket.close();
      }
      return wiki.textEditor($item, item);
    });
    $(".main").on('thumb', function(evt, thumb) {
      return trigger('THUMB', thumb);
    });
    dialog = null;
    $item.delegate('.rcvd', 'click', function() {
      dialog = wiki.dialog("Txtzyme Responses", "<pre>" + (response.join("\n")));
      return dialog.on("dialogclose", function() {
        return dialog = null;
      });
    });
    trigger = function(word, arg) {
      if (arg == null) {
        arg = 0;
      }
      return apply(defn, word, arg, function(message, stack, done) {
        var call, todo, words;
        todo = ((function() {
          var _i, _len, _ref, _results;
          _results = [];
          for (_i = 0, _len = stack.length; _i < _len; _i++) {
            _ref = stack[_i], call = _ref.call, words = _ref.words;
            _results.push("" + call + " " + (words.join(' ')) + "<br>");
          }
          return _results;
        })()).join('');
        $item.find('p.report').html("" + todo + message);
        if (socket) {
          progress((srept = " " + (++sent) + " sent ") + rrept);
          frame();
          socket.send(message);
        }
        return setTimeout(done, 200);
      });
    };
    progress = function(m) {
      return $item.find('p.caption').html(m);
    };
    frame = function() {
      var _ref;
      if (response.length) {
        if (dialog != null) {
          dialog.html("<pre>" + (response.join("\n")));
        }
        $item.trigger('sequence', [response]);
      }
      return _ref = [[], response], response = _ref[0], oldresponse = _ref[1], _ref;
    };
    socket.onopen = function() {
      progress("opened");
      return trigger('OPEN');
    };
    socket.onmessage = function(e) {
      var line, _i, _len, _ref, _results;
      _ref = e.data.split(/\r?\n/);
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        line = _ref[_i];
        if (line) {
          progress(srept + (rrept = "<span class=rcvd> " + (++rcvd) + " rcvd " + line + " </span>"));
          response.push(line);
          if (line.match(/^[A-Z][A-Z0-9]*$/)) {
            trigger(line, response);
            _results.push(frame());
          } else {
            _results.push(void 0);
          }
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };
    return socket.onclose = function() {
      progress("closed");
      return socket = null;
    };
  };

  if (typeof window !== "undefined" && window !== null) {
    window.plugins.txtzyme = {
      emit: emit,
      bind: bind
    };
  }

}).call(this);

//# sourceMappingURL=txtzyme.js.map
