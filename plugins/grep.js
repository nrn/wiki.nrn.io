(function() {
  var bind, emit, escape, evalPage, evalPart, parse, run, word;

  escape = function(line) {
    return line.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  };

  word = function(string) {
    if (!string.match(/^[a-z]*$/)) {
      throw {
        message: "expecting type for '" + string + "'"
      };
    }
    return string;
  };

  parse = function(text) {
    var arg, err, errors, html, line, listing, match, op, program, _i, _len, _ref, _ref1;
    program = [];
    listing = [];
    errors = 0;
    _ref = text.split("\n");
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      line = _ref[_i];
      html = escape(line);
      try {
        _ref1 = line.match(/^\s*(\w*)\s*(.*)$/), match = _ref1[0], op = _ref1[1], arg = _ref1[2];
        switch (op) {
          case '':
            break;
          case 'ITEM':
          case 'ACTION':
            program.push({
              op: op,
              type: word(arg)
            });
            break;
          case 'TEXT':
          case 'TITLE':
          case 'SITE':
          case 'ID':
          case 'ALIAS':
          case 'JSON':
            program.push({
              op: op,
              regex: new RegExp(arg, 'mi')
            });
            break;
          default:
            throw {
              message: "don't know '" + op + "' command"
            };
        }
      } catch (_error) {
        err = _error;
        errors++;
        html = "<span style=\"background-color:#fdd;width:100%;\" title=\"" + err.message + "\">" + html + "</span>";
      }
      listing.push(html);
    }
    return [program, listing.join('<br>'), errors];
  };

  evalPage = function(page, steps, count) {
    var action, item, step, _i, _j, _len, _len1, _ref, _ref1;
    if (!(count < steps.length)) {
      return true;
    }
    step = steps[count];
    switch (step.op) {
      case 'ITEM':
        count++;
        _ref = page.story || [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          item = _ref[_i];
          if (step.type === '') {
            if (evalPart(item, steps, count)) {
              return true;
            }
          } else {
            if (item.type === step.type) {
              if (evalPart(item, steps, count)) {
                return true;
              }
            }
          }
        }
        return false;
      case 'ACTION':
        count++;
        _ref1 = page.journal || [];
        for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
          action = _ref1[_j];
          if (step.type === '') {
            if (evalPart(action, steps, count)) {
              return true;
            }
          } else {
            if (action.type === step.type) {
              if (evalPart(action, steps, count)) {
                return true;
              }
            }
          }
        }
        return false;
    }
    return evalPart(page, steps, count);
  };

  evalPart = function(part, steps, count) {
    var json, key, step, _ref;
    if (!(count < steps.length)) {
      return true;
    }
    step = steps[count++];
    switch (step.op) {
      case 'TEXT':
      case 'TITLE':
      case 'SITE':
      case 'ID':
      case 'ALIAS':
        key = step.op.toLowerCase();
        if ((part[key] || ((_ref = part.item) != null ? _ref[key] : void 0) || '').match(step.regex)) {
          return true;
        }
        break;
      case 'JSON':
        json = JSON.stringify(part, null, ' ');
        if (json.match(step.regex)) {
          return true;
        }
    }
    return false;
  };

  run = function($item, program) {
    var status, want;
    status = function(text) {
      return $item.find('.caption').text(text);
    };
    want = function(page) {
      return evalPage(page, program, 0);
    };
    status("fetching sitemap");
    return $.getJSON("http://" + location.host + "/system/sitemap.json", function(sitemap) {
      var checked, found, place, _i, _len, _results;
      checked = 0;
      found = 0;
      _results = [];
      for (_i = 0, _len = sitemap.length; _i < _len; _i++) {
        place = sitemap[_i];
        _results.push($.getJSON("http://" + location.host + "/" + place.slug + ".json", function(page) {
          var report, text;
          text = "[[" + page.title + "]] (" + page.story.length + ")";
          if (want(page)) {
            found++;
            $item.find('.result').append("" + (wiki.resolveLinks(text)) + "<br>");
          }
          checked++;
          report = "found " + found + " pages of " + checked + " checked";
          if (checked < sitemap.length) {
            report += ", " + (sitemap.length - checked) + " remain";
          }
          return status(report);
        }));
      }
      return _results;
    });
  };

  emit = function($item, item) {
    var errors, listing, program, _ref;
    _ref = parse(item.text), program = _ref[0], listing = _ref[1], errors = _ref[2];
    $item.append("<div style=\"background-color:#eee;padding:15px;\">\n  <div class=listing>" + listing + "</div>\n  <p class=\"caption\">" + errors + " errors</p>\n  <p class=\"result\"></p>\n</div>");
    if (!errors) {
      return run($item, program);
    }
  };

  bind = function($item, item) {
    return $item.dblclick(function() {
      return wiki.textEditor($item, item);
    });
  };

  if (typeof window !== "undefined" && window !== null) {
    window.plugins.grep = {
      emit: emit,
      bind: bind
    };
  }

  if (typeof module !== "undefined" && module !== null) {
    module.exports = {
      parse: parse,
      evalPart: evalPart,
      evalPage: evalPage
    };
  }

}).call(this);

//# sourceMappingURL=grep.js.map
