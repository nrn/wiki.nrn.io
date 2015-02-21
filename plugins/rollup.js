(function() {
  window.plugins.rollup = {
    emit: function(div, item) {},
    bind: function(div, item) {
      var $row, $table, asValue, attach, delay, display, perform, radar, recalculate, reference, reindex, remaining, results, row, rows, slug, state, timeout, _i, _len, _results;
      div.dblclick(function() {
        return wiki.textEditor(div, item);
      });
      div.append("<style>\n  td.material {overflow:hidden;}\n  td.score {text-align:right; width:25px}\n</style>");
      asValue = function(obj) {
        if (obj == null) {
          return NaN;
        }
        switch (obj.constructor) {
          case Number:
            return obj;
          case String:
            return +obj;
          case Array:
            return asValue(obj[0]);
          case Object:
            return asValue(obj.value);
          case Function:
            return obj();
          default:
            return NaN;
        }
      };
      attach = function(search) {
        var elem, source, _i, _len, _ref;
        wiki.log('attach', wiki.getDataNodes(div));
        _ref = wiki.getDataNodes(div);
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          elem = _ref[_i];
          wiki.log('attach loop', $(elem).data('item').text);
          if ((source = $(elem).data('item')).text.indexOf(search) >= 0) {
            return source;
          }
        }
        throw new Error("can't find dataset with caption " + search);
      };
      reference = attach("Materials Summary");
      display = function(calculated, state) {
        var $row, col, color, e, errors, label, now, old, row, title, _i, _len, _ref, _results;
        row = state.row;
        $row = state.$row;
        _ref = reference.columns;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          col = _ref[_i];
          if (col === 'Material') {
            label = wiki.resolveLinks("[[" + row.Material + "]]");
            if (calculated) {
              if (state.errors.length > 0) {
                errors = ((function() {
                  var _j, _len1, _ref1, _results1;
                  _ref1 = state.errors;
                  _results1 = [];
                  for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
                    e = _ref1[_j];
                    _results1.push(e.message.replace(/"/g, "'"));
                  }
                  return _results1;
                })()).join("\n");
                _results.push($row.append("<td class=\"material\">" + label + " <span style=\"color:red;\" title=\"" + errors + "\">✘</span></td>"));
              } else {
                _results.push($row.append("<td class=\"material\">" + label + "</td>"));
              }
            } else {
              _results.push($row.append("<td class=\"material\">" + label + "</td>"));
            }
          } else {
            old = asValue(row[col]);
            now = asValue(state.input[col]);
            if (calculated && (now != null)) {
              color = old.toFixed(4) === now.toFixed(4) ? 'green' : old.toFixed(0) === now.toFixed(0) ? 'orange' : 'red';
              title = "" + row.Material + "\n" + col + "\nold " + (old.toFixed(4)) + "\nnow " + (now.toFixed(4));
              _results.push($row.append("<td class=\"score\" title=\"" + title + "\" data-thumb=\"" + col + "\" style=\"color:" + color + ";\">" + (old.toFixed(0)) + "</td>"));
            } else {
              title = "" + row.Material + "\n" + col + "\n" + (old.toFixed(4));
              _results.push($row.append("<td class=\"score\" title=\"" + title + "\" data-thumb=\"" + col + "\">" + (old.toFixed(0)) + "</td>"));
            }
          }
        }
        return _results;
      };
      perform = function(state, plugin, done) {
        if (state.methods.length > 0) {
          return plugin["eval"](state, state.methods.shift(), state.input, function(state, output) {
            state.output = output;
            _.extend(state.input, output);
            return perform(state, plugin, done);
          });
        } else {
          return done(state);
        }
      };
      timeout = function(delay, done) {
        return setTimeout(done, delay);
      };
      recalculate = function(delay, state, done) {
        return timeout(delay, function() {
          return wiki.getPlugin('method', function(plugin) {
            return $.getJSON("/" + state.slug + ".json", function(data) {
              state.methods = _.filter(data.story, function(item) {
                return item.type === 'method';
              });
              return perform(state, plugin, done);
            });
          });
        });
      };
      radar = function(input) {
        var candidates, elem, output, _i, _len;
        if (input == null) {
          input = {};
        }
        candidates = $(".item:lt(" + ($('.item').index(div)) + ")");
        output = _.extend({}, input);
        for (_i = 0, _len = candidates.length; _i < _len; _i++) {
          elem = candidates[_i];
          elem = $(elem);
          if (elem.hasClass('radar-source')) {
            _.extend(output, elem.get(0).radarData());
          } else if (elem.hasClass('data')) {
            _.extend(output, elem.data('item').data[0]);
          }
        }
        return output;
      };
      reindex = function(results) {
        var index, sorted, state, _i, _j, _len, _len1, _results;
        wiki.log('reindex', results);
        sorted = _.sortBy(results, function(state) {
          return -asValue(state.input['Total Score']);
        });
        for (index = _i = 0, _len = sorted.length; _i < _len; index = ++_i) {
          state = sorted[index];
          state.input.Rank = "" + (index + 1);
        }
        _results = [];
        for (_j = 0, _len1 = results.length; _j < _len1; _j++) {
          state = results[_j];
          state.$row.empty();
          _results.push(display(true, state));
        }
        return _results;
      };
      div.append(($table = $("<table/>")));
      rows = _.sortBy(reference.data, function(row) {
        return -asValue(row['Total Score']);
      });
      delay = 0;
      results = [];
      remaining = rows.length;
      _results = [];
      for (_i = 0, _len = rows.length; _i < _len; _i++) {
        row = rows[_i];
        slug = wiki.asSlug(row.Material);
        $table.append(($row = $("<tr class=\"" + slug + "\">")));
        state = {
          $row: $row,
          row: row,
          slug: slug,
          input: radar(),
          errors: []
        };
        display(false, state);
        delay += 200;
        _results.push(recalculate(delay, state, function(state) {
          state.$row.empty();
          state.input.Rank = state.row.Rank;
          display(true, state);
          results.push(state);
          remaining -= 1;
          if (!remaining) {
            return reindex(results);
          }
        }));
      }
      return _results;
    }
  };

}).call(this);

//# sourceMappingURL=rollup.js.map
