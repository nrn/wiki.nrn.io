(function() {
  var advance, bind, emit, enumerate, explain, hours, human, intervals, months, parse, primAdvance, soon, summarize, wdays,
    __slice = [].slice;

  enumerate = function() {
    var i, k, keys, obj, _i, _len;
    keys = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    obj = {
      keys: keys
    };
    for (i = _i = 0, _len = keys.length; _i < _len; i = ++_i) {
      k = keys[i];
      obj[k] = i + 1;
    }
    return obj;
  };

  intervals = enumerate('HOURLY', 'DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY');

  hours = enumerate('MIDNIGHT', 'MORNING', 'NOON', 'EVENING');

  wdays = enumerate('SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY');

  months = enumerate('JANUARY', 'FEBUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER');

  parse = function(text) {
    var e, issue, schedule, word, _i, _len, _ref;
    schedule = [];
    issue = null;
    _ref = text.match(/\S+/g) || [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      word = _ref[_i];
      try {
        if (intervals[word]) {
          schedule.push(issue = {
            interval: word,
            recipients: [],
            offsets: []
          });
        } else if (months[word] || wdays[word] || hours[word]) {
          issue.offsets.push(word);
        } else if (word.match(/@/)) {
          issue.recipients.push(word);
        } else {
          schedule.push({
            trouble: word
          });
        }
      } catch (_error) {
        e = _error;
        schedule.push({
          trouble: e.message
        });
      }
    }
    return schedule;
  };

  human = function(msecs) {
    var days, hrs, mins, secs, weeks, years;
    if ((secs = msecs / 1000) < 2) {
      return "" + (Math.floor(msecs)) + " milliseconds";
    }
    if ((mins = secs / 60) < 2) {
      return "" + (Math.floor(secs)) + " seconds";
    }
    if ((hrs = mins / 60) < 2) {
      return "" + (Math.floor(mins)) + " minutes";
    }
    if ((days = hrs / 24) < 2) {
      return "" + (Math.floor(hrs)) + " hours";
    }
    if ((weeks = days / 7) < 2) {
      return "" + (Math.floor(days)) + " days";
    }
    if ((months = days / 30.5) < 2) {
      return "" + (Math.floor(weeks)) + " weeks";
    }
    if ((years = days / 365) < 2) {
      return "" + (Math.floor(months)) + " months";
    }
    return "" + (Math.floor(years)) + " years";
  };

  primAdvance = function(date, issue, count) {
    var d, h, m, offset, result, y, _i, _len, _ref, _ref1, _ref2;
    _ref = [date.getFullYear(), date.getMonth(), date.getDate(), date.getHours()], y = _ref[0], m = _ref[1], d = _ref[2], h = _ref[3];
    result = (function() {
      switch (issue.interval) {
        case 'HOURLY':
          return new Date(y, m, d, h + count);
        case 'DAILY':
          return new Date(y, m, d + count);
        case 'WEEKLY':
          return new Date(y, m, d - date.getDay() + 7 * count);
        case 'MONTHLY':
          return new Date(y, m + count);
        case 'YEARLY':
          return new Date(y + count, 0);
      }
    })();
    _ref1 = issue.offsets;
    for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
      offset = _ref1[_i];
      _ref2 = [result.getFullYear(), result.getMonth(), result.getDate(), result.getHours()], y = _ref2[0], m = _ref2[1], d = _ref2[2], h = _ref2[3];
      result = months[offset] ? new Date(y, months[offset] - 1, d, h) : wdays[offset] ? new Date(y, m, d + (7 - result.getDay() + wdays[offset] - 1) % 7, h) : hours[offset] ? new Date(y, m, d, h + 6 * (hours[offset] - 1)) : void 0;
    }
    return result;
  };

  advance = function(date, issue, count) {
    var prim;
    prim = primAdvance(date, issue, 0);
    if (prim > date) {
      return primAdvance(date, issue, count - 1);
    } else {
      return primAdvance(date, issue, count);
    }
  };

  soon = function(issue) {
    var next, now;
    now = new Date();
    next = advance(now, issue, 1);
    return human(next.getTime() - now.getTime());
  };

  explain = function(issue) {
    if (issue.interval != null) {
      return "reporting " + issue.interval + " for " + issue.recipients.length + " recipients in " + (soon(issue));
    } else if (issue.trouble != null) {
      return "don't expect: <span class=error>" + issue.trouble + "</span>";
    } else {
      return "trouble";
    }
  };

  if (typeof module !== "undefined" && module !== null) {
    module.exports = {
      intervals: intervals,
      parse: parse,
      explain: explain,
      advance: advance
    };
  }

  summarize = function(schedule) {
    var issue;
    return ((function() {
      var _i, _len, _results;
      _results = [];
      for (_i = 0, _len = schedule.length; _i < _len; _i++) {
        issue = schedule[_i];
        _results.push(explain(issue));
      }
      return _results;
    })()).join("<br>");
  };

  emit = function($item, item) {
    return $item.append($("<p>" + (summarize(parse(item.text))) + "</p>"));
  };

  bind = function($item, item) {
    return $item.dblclick(function() {
      return wiki.textEditor($item, item);
    });
  };

  if (typeof window !== "undefined" && window !== null) {
    window.plugins.report = {
      emit: emit,
      bind: bind
    };
  }

}).call(this);

//# sourceMappingURL=report.js.map
