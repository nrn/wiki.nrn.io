(function() {
  window.plugins.metabolism = {
    emit: function(div, item) {},
    bind: function(div, item) {
      var annotate, attach, avg, calculate, data, input, output, query, round, sum;
      data = [];
      input = {};
      output = {};
      div.addClass('radar-source');
      div.get(0).radarData = function() {
        return output;
      };
      div.mousemove(function(e) {
        return $(div).triggerHandler('thumb', $(e.target).text());
      });
      attach = function(search, callback) {
        var elem, new_data, source, _i, _len, _ref;
        if (callback == null) {
          callback = function() {};
        }
        _ref = wiki.getDataNodes(div);
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          elem = _ref[_i];
          if ((source = $(elem).data('item')).text.indexOf(search) >= 0) {
            new_data = _.select(source.data, function(row) {
              return row.Activity != null;
            });
            return callback(new_data);
          }
        }
        return $.get("/data/" + search, function(page) {
          var obj, _j, _len1, _ref1;
          if (!page) {
            throw new Error("can't find dataset '" + s + "'");
          }
          _ref1 = page.story;
          for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
            obj = _ref1[_j];
            if (obj.type === 'data' && (obj.text != null) && obj.text.indexOf(search) >= 0) {
              new_data = _.select(obj.data, function(row) {
                return row.Activity != null;
              });
              return callback(new_data);
            }
          }
          throw new Error("can't find dataset '" + s + "' in '" + page.title + "'");
        });
      };
      query = function(s) {
        var choices, k, keys, n, _i, _len;
        keys = $.trim(s).split(' ');
        choices = data;
        for (_i = 0, _len = keys.length; _i < _len; _i++) {
          k = keys[_i];
          if (k === ' ') {
            next;
          }
          n = choices.length;
          choices = _.select(choices, function(row) {
            return row.Activity.indexOf(k) >= 0 || row.Category.indexOf(k) >= 0;
          });
          if (choices.length === 0) {
            throw new Error("Can't find " + k + " in remaining " + n + " choices");
          }
        }
        return choices;
      };
      sum = function(v) {
        return _.reduce(v, function(s, n) {
          return s += n;
        });
      };
      avg = function(v) {
        return sum(v) / v.length;
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
      annotate = function(text) {
        if (text == null) {
          return '';
        }
        return " <span title=\"" + text + "\">*</span>";
      };
      calculate = function(item) {
        var allocated, dispatch, lines, list, report;
        list = [];
        allocated = 0;
        lines = item.text.split("\n");
        report = [];
        dispatch = function(list, allocated, lines, report, done) {
          var args, color, comment, err, hours, line, next_dispatch, result, row, value, _ref, _ref1;
          color = '#eee';
          value = comment = null;
          hours = '';
          line = lines.shift();
          if (line == null) {
            return done(report);
          }
          next_dispatch = function() {
            if ((value != null) && !isNaN(+value)) {
              list.push(+value);
            }
            report.push("<tr style=\"background:" + color + ";\"><td style=\"width: 70%;\">" + line + (annotate(comment)) + "<td>" + hours + "<td><b>" + (round(value)) + "</b>");
            return dispatch(list, allocated, lines, report, done);
          };
          try {
            if (args = line.match(/^USE ([\w ]+)$/)) {
              color = '#ddd';
              value = ' ';
              return attach((line = args[1]), function(new_data) {
                data = new_data;
                return next_dispatch();
              });
            } else if (args = line.match(/^([0-9.]+) ([\w ]+)$/)) {
              allocated += hours = +args[1];
              result = query(line = args[2]);
              output[line] = value = (input = result[0]).MET * hours;
              if (result.length > 1) {
                comment = ((function() {
                  var _i, _len, _results;
                  _results = [];
                  for (_i = 0, _len = result.length; _i < _len; _i++) {
                    row = result[_i];
                    _results.push("" + row.Category + " (" + row.MET + "): " + row.Activity);
                  }
                  return _results;
                })()).join("\n\n");
              }
            } else if (input[line] != null) {
              value = input[line];
              comment = input["" + line + " Assumptions"] || null;
            } else if (line.match(/^[0-9\.-]+$/)) {
              value = +line;
            } else if (line === 'REMAINDER') {
              value = 24 - allocated;
              allocated += value;
            } else if (line === 'SUM') {
              color = '#ddd';
              _ref = [sum(list), []], value = _ref[0], list = _ref[1];
            } else if (line === 'AVG') {
              color = '#ddd';
              _ref1 = [avg(list), []], value = _ref1[0], list = _ref1[1];
            } else {
              color = '#edd';
            }
          } catch (_error) {
            err = _error;
            color = '#edd';
            value = null;
            comment = err.message;
          }
          return next_dispatch();
        };
        return dispatch(list, allocated, lines, report, function(report) {
          var table, text;
          text = report.join("\n");
          table = $('<table style="width:100%; background:#eee; padding:.8em;"/>').html(text);
          div.append(table);
          return div.dblclick(function() {
            return wiki.textEditor(div, item);
          });
        });
      };
      return calculate(item);
    }
  };

}).call(this);

//# sourceMappingURL=metabolism.js.map
