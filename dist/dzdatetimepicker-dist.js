'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var slice = Array.prototype.slice;

var findParent = function findParent(elem, id) {

  var checker = function checker(i) {
    return i.getAttribute('id') === id || i.classList.contains(id);
  };

  if (checker(elem)) return elem;

  while (elem.parentNode) {

    elem = elem.parentNode;

    if (elem === document.body || elem === document) return undefined;

    if (checker(elem)) return elem;
  }

  return undefined;
};

var inputFocus = function inputFocus(evt) {
  if (evt && evt.preventDefault) evt.preventDefault();
  evt.target.blur();
  return false;
};

var inputBlur = function inputBlur(evt) {
  if (evt && evt.preventDefault) evt.preventDefault();
  return false;
};

// @prepros-append ./datepicker.js
// @prepros-append ./timepicker.js
// @prepros-append ./rangepicker.js
// @prepros-append ./autohook.js
(function (glob) {
  var DatePicker = function () {
    function DatePicker(customClass) {
      _classCallCheck(this, DatePicker);

      this.customClass = customClass;
      this.init();
    }

    _createClass(DatePicker, [{
      key: 'init',
      value: function init() {
        if (this.initialized) return false;

        this.initialized = true;

        this.setupHooks();
      }
    }, {
      key: 'setupHooks',
      value: function setupHooks() {
        var _this = this;

        var prevClick = function prevClick(evt) {

          if (evt && evt.preventDefault) evt.preventDefault();

          var calendar = _this.getCalendar();
          var currentString = calendar.dataset.current.split('-');
          var current = new Date(currentString[0], currentString[1]);

          var previous = new Date(current.getFullYear(), current.getMonth() - 1);

          var newDates = _this.drawDates(_this.getDaysArrayByMonth(previous));
          var currentDates = document.querySelector('#dz-calendar .dz-dates');

          calendar.insertAdjacentHTML('beforeEnd', newDates);
          newDates = calendar.children[calendar.children.length - 1];

          calendar.removeChild(currentDates);

          var year = previous.getFullYear();
          var month = previous.getMonth();

          calendar.dataset.current = year + ' - ' + month;
          calendar.children[0].children[0].innerHTML = _this.getMonthName(month) + ', ' + year;

          hookDates();

          return false;
        };

        var nextClick = function nextClick(evt) {

          if (evt && evt.preventDefault) evt.preventDefault();

          var calendar = _this.getCalendar();
          var currentString = calendar.dataset.current.split('-');
          var current = new Date(currentString[0], currentString[1]);

          var next = new Date(current.getFullYear(), current.getMonth() + 1);

          var newDates = _this.drawDates(_this.getDaysArrayByMonth(next));
          var currentDates = document.querySelector('#dz-calendar .dz-dates');

          calendar.insertAdjacentHTML('beforeEnd', newDates);
          newDates = calendar.children[calendar.children.length - 1];

          calendar.removeChild(currentDates);

          var year = next.getFullYear();
          var month = next.getMonth();

          calendar.dataset.current = year + ' - ' + month;
          calendar.children[0].children[0].innerHTML = _this.getMonthName(month) + ', ' + year;

          hookDates();

          return false;
        };

        this.bodyClick = function (evt) {

          var calendar = _this.getCalendar();

          if (calendar) if (!calendar.classList.contains('active')) document.body.removeChild(calendar);else if (!_this.isInCalendar(evt.target)) {
            return _this.cleanupCalendar(evt, calendar);
          }
        };

        var dateClick = function dateClick(evt) {

          var calendar = _this.getCalendar();
          var date = parseInt(evt.target.innerHTML);

          var currentString = calendar.dataset.current.split('-');
          date = new Date(currentString[0], currentString[1], date);

          var fn = window[_this.source.dataset.onset];
          if (fn) fn(date);

          // zero pad the month if needed
          var month = date.getMonth() + 1;
          if (month.toString().length === 1) month = "0" + month;
          // zero pad the date if needed
          var dateStr = date.getDate();
          if (dateStr.toString().length === 1) dateStr = "0" + dateStr;

          var val = [date.getFullYear(), month, dateStr].join('-');

          if (_this.source.nodeName === 'INPUT') {
            _this.source.value = val;
            if ('InputEvent' in window) _this.source.dispatchEvent(new InputEvent('input'));else _this.source.dispatchEvent(new Event('input'));
          } else if (_this.source.dataset.dateVal) _this.source.dataset.dateVal = val;

          if (_this.callback) _this.callback(_this.source, val);

          return _this.cleanupCalendar(evt, calendar);
        };

        var hookDates = function hookDates() {

          var calendar = _this.getCalendar();
          if (!calendar) return;

          var dates = slice.call(document.querySelectorAll('#dz-calendar .dz-dates div'));
          dates.forEach(function (item) {
            if (!item.classList.contains('disabled')) item.addEventListener('click', dateClick, false);
          });
        };

        var triggerClick = function triggerClick(evt) {

          // check if calendar is already being shown
          var phantom = _this.getCalendar();

          if (phantom) {
            _this.cleanupCalendar(evt, phantom);
            setTimeout(function () {
              triggerClick(evt);
            }, 300);
            return false;
          }

          var rect = evt.target.getBoundingClientRect();
          var center = {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height
          };

          var target = evt.target.nodeName === "INPUT" ? evt.target : findParent(evt.target, _this.customClass || 'date-trigger');

          _this.source = target;

          var calendar = _this.drawCalendar();

          document.body.insertAdjacentHTML('beforeEnd', calendar);

          calendar = document.getElementById('dz-calendar');

          // position the calendar near the origin point
          var calendarRect = calendar.getBoundingClientRect();

          // the width before showing = actual width * 0.25 
          var width = calendarRect.width * 4;

          calendar.style.left = center.x - width / 2 + 'px';
          calendar.style.top = center.y + 16 + 'px';

          var prev = calendar.children[0].children[1];
          var next = calendar.children[0].children[2];

          prev.addEventListener('click', prevClick, false);
          next.addEventListener('click', nextClick, false);

          calendar.classList.add('active');

          hookDates();

          var fn = 'didShowDatePicker';
          if (window[fn]) window[fn](calendar);

          setTimeout(function () {
            // this needs to be added a second later to prevent ghost click
            document.body.addEventListener('click', _this.bodyClick, false);
          }, 500);

          return false;
        };

        var triggers = document.querySelectorAll(this.customClass ? "." + this.customClass : '.date-trigger');
        triggers = slice.call(triggers);

        var attachTrigger = function attachTrigger(elem) {
          if (!elem) return;
          elem.addEventListener('click', triggerClick, false);
          if (elem.nodeName === "INPUT") {
            elem.addEventListener('focus', inputFocus, false);
            elem.addEventListener('blur', inputBlur, false);
          }
        };

        triggers.forEach(function (item) {
          attachTrigger(item);
        });

        glob.attachDateTrigger = attachTrigger;
      }
    }, {
      key: 'getCalendar',
      value: function getCalendar() {
        return document.getElementById("dz-calendar");
      }
    }, {
      key: 'isInCalendar',
      value: function isInCalendar(elem) {
        var parent = findParent(elem, 'dz-calendar');
        return parent !== document.body && parent != undefined;
      }
    }, {
      key: 'getMonthName',
      value: function getMonthName(idx) {
        return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].splice(idx, 1);
      }
    }, {
      key: 'getDaysArrayByMonth',
      value: function getDaysArrayByMonth(date) {

        var year = date.getFullYear();
        var month = date.getMonth();
        var monthRange = new Date(year, month + 1, 0).getDate();
        var days = [];

        while (monthRange > 0) {
          days.push(new Date(year, month, monthRange));
          monthRange--;
        }

        return days.reverse();
      }
    }, {
      key: 'drawDates',
      value: function drawDates(dates) {

        var now = new Date();

        if (this.source.nodeName === 'INPUT' && this.source.value) now = new Date(this.source.value);else if (this.source.dataset.dateVal) now = new Date(this.source.dataset.dateVal);

        var markup = '<div class="dz-dates">';
        var calendar = this.getCalendar();

        var _source$dataset = this.source.dataset,
            dateMax = _source$dataset.dateMax,
            dateMin = _source$dataset.dateMin;


        if (dateMax) dateMax = new Date(dateMax);
        if (dateMin) dateMin = new Date(dateMin);

        var val = null;
        if (this.source.nodeName === 'INPUT') val = new Date(this.source.value);else if (this.source.dataset.dateVal) val = new Date(this.source.dataset.dateVal);

        // find offset of first date.
        var offsetDay = dates[0].getDay();

        var dateEqual = function dateEqual(base, compare) {
          return base.getDate() === compare.getDate() && base.getMonth() === compare.getMonth() && base.getYear() && compare.getYear();
        };

        dates.forEach(function (date, idx) {

          var classes = [];

          // check if the date is today
          if (dateEqual(now, date)) classes.push('today');

          // check if this is the selected value
          if (val && dateEqual(date, val)) classes.push('selected');

          // check if the date is within the min range, if one is set
          if (dateMin && dateMin.getTime() - date.getTime() > 0) classes.push('disabled');

          // check if the date is within the max range, if one is set
          if (dateMax && dateMax.getTime() - date.getTime() < 0) classes.push('disabled');

          classes = classes.join(' ');

          if (idx !== 0) markup += '<div role="button" class="' + classes + '">' + date.getDate() + '</div>';else markup += '<div style="margin-left:' + offsetDay * 35 + 'px;" role="button" class="' + classes + '">' + date.getDate() + '</div>';
        });

        markup += '</div>';

        return markup;
      }
    }, {
      key: 'drawCalendar',
      value: function drawCalendar() {

        var now = new Date();

        var year = now.getFullYear();
        var month = now.getMonth();

        var dates = this.getDaysArrayByMonth(now);
        var days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

        var markup = '<div id="dz-calendar" class="inline-container" data-current="' + year + '-' + month + '">\n        <div class="dz-title"> \n           <h4>' + this.getMonthName(now.getMonth()) + ', ' + now.getFullYear() + '</h4>\n           <button id="dz-prev"><svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>keyboard_arrow_left</title><path d="M14.422 16.078l-1.406 1.406-6-6 6-6 1.406 1.407-4.594 4.593z" fill="#8FCB14" fill-rule="evenodd"/></svg></button>\n           <button id="dz-next"><svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>keyboard_arrow_right</title><path d="M8.578 16.36l4.594-4.594-4.594-4.594 1.406-1.406 6 6-6 6z" fill="#8FCB14" fill-rule="evenodd"/></svg></button>\n        </div>\n        <div class="dz-days">';

        days.forEach(function (day) {
          markup += '<div>' + day + '</div>';
        });

        markup += '</div>\n        ' + this.drawDates(dates) + '\n      </div>';

        return markup;
      }
    }, {
      key: 'cleanupCalendar',
      value: function cleanupCalendar(evt, calendar) {
        var _this2 = this;

        if (evt && evt.preventDefault) evt.preventDefault();

        if (calendar) {

          calendar.classList.remove('active');

          setTimeout(function () {
            if (calendar && calendar.parentNode) calendar.parentNode.removeChild(calendar);
            _this2.source = undefined;
          }, 300);
        }

        document.body.removeEventListener('click', this.bodyClick, false);

        return false;
      }
    }]);

    return DatePicker;
  }();

  if (glob && glob.exports) glob.exports = Object.assign({}, {
    'DatePicker': DatePicker,
    'datePicker': new DatePicker()
  });else {
    glob.DatePicker = DatePicker;
    glob.datePicker = new DatePicker();
  }
})(typeof module === "undefined" ? window : module);

(function (glob) {
  var TimePicker = function () {
    function TimePicker() {
      _classCallCheck(this, TimePicker);

      this.init();
    }

    _createClass(TimePicker, [{
      key: 'init',
      value: function init() {

        if (this.initialized) return false;

        this.initialized = true;
        this.setupHooks();
      }
    }, {
      key: 'setupHooks',
      value: function setupHooks() {
        var _this3 = this;

        this.bodyClick = function (evt) {

          if (evt.target.nodeName === 'SELECT') return false;

          var timer = _this3.getTimer();

          if (timer) if (!timer.classList.contains('active')) document.body.removeChild(timer);else if (!_this3.isInTimer(evt.target)) {
            return _this3.cleanupTimer(evt, timer);
          }

          document.body.removeEventListener('click', _this3.bodyClick, false);
        };

        var didChange = function didChange() {

          // let target = evt.target
          var timer = _this3.getTimer();

          var hours = parseInt(timer.children[0].value);
          var minutes = parseInt(timer.children[1].value);
          var shift = parseInt(timer.children[2].value);

          if (shift === 1 && hours != 12) hours += 12;

          if (hours === 12 && shift === 0) hours = '00';

          if (_this3.source.nodeName === 'INPUT') {
            _this3.source.value = hours + ':' + minutes;
            if ('InputEvent' in window) _this3.source.dispatchEvent(new InputEvent('input'));else _this3.source.dispatchEvent(new Event('input'));
          }

          var fn = window[_this3.source.dataset.onchange];
          if (fn) fn({
            string: hours + ':' + minutes,
            hours: parseInt(hours),
            minutes: minutes
          });
        };

        var triggerClick = function triggerClick(evt) {

          var phantom = _this3.getTimer();

          if (phantom) {
            _this3.cleanupTimer(evt, phantom);
            setTimeout(function () {
              triggerClick(evt);
            }, 300);
            return false;
          }

          var rect = evt.target.getBoundingClientRect();
          var center = {
            x: rect.left,
            y: rect.top + rect.height
          };

          _this3.source = evt.target;
          var timer = _this3.drawTimer();

          document.body.insertAdjacentHTML('beforeEnd', timer);

          timer = _this3.getTimer();

          // set the current time
          if (_this3.source.nodeName !== 'INPUT' || !_this3.source.value.length) {
            var date = new Date();
            var hours = date.getHours(),
                minutes = date.getMinutes();

            timer.children[0].value = hours > 12 ? hours - 12 : hours;
            timer.children[1].value = minutes;
            timer.children[2].value = hours >= 12 ? 1 : 0;
          }

          // add the hooks
          slice.call(timer.children).forEach(function (item) {
            item.addEventListener('change', didChange, false);
          });

          // if(evt.target.dataset.onchange)
          //    timer.dataset.onchange = evt.target.dataset.onchange

          // position the calendar near the origin point
          var timerRect = timer.getBoundingClientRect();

          // the width before showing = actual width * 0.25 
          var width = timerRect.width * 4;

          timer.style.left = center.x - 16 + 'px';
          timer.style.top = center.y + 16 + 'px';

          timer.classList.add('active');

          setTimeout(function () {
            // this needs to be added a second later to prevent ghost click
            document.body.addEventListener('click', _this3.bodyClick, false);
          }, 500);

          return false;
        };

        var attachTrigger = function attachTrigger(elem) {
          if (!elem) return;
          elem.addEventListener('click', triggerClick, false);
          if (elem.nodeName === "INPUT") {
            elem.addEventListener('focus', inputFocus, false);
            elem.addEventListener('blur', inputBlur, false);
          }
        };

        var triggers = slice.call(document.querySelectorAll('.timer-trigger'));

        triggers.forEach(function (item) {
          attachTrigger(item);
        });

        window.attachTimeTrigger = attachTrigger;
      }
    }, {
      key: 'getTimer',
      value: function getTimer() {
        return document.getElementById('dz-timer');
      }
    }, {
      key: 'isInTimer',
      value: function isInTimer(elem) {
        var parent = findParent(elem, 'dz-timer');
        return parent !== document.body && parent != undefined;
      }
    }, {
      key: 'drawTimer',
      value: function drawTimer() {

        var val = null,
            hoursVal = void 0,
            minVal = void 0,
            shiftVal = false;
        if (this.source.nodeName === 'INPUT') val = this.source.value;

        if (val) {
          val = val.split(':');
          hoursVal = parseInt(val[0]);
          minVal = val[1];
          if (hoursVal > 12) {
            hoursVal -= 12;
            shiftVal = true;
          }
        }

        var markup = '<div id="dz-timer" class="inline-container">\n        <select class="hours">';

        // draw hours dropdown
        var hours = Array.from(Array(13).keys());
        hours.shift();
        markup += hours.map(function (item) {
          if (item === hoursVal) return '<option value=\'' + item + '\' selected=\'selected\'>' + item + '</option>';
          return '<option value=\'' + item + '\'>' + item + '</option>';
        }).join(' ');

        markup += '</select>\n        <select class="minutes">';

        // draw minutes dropdown
        markup += Array.from(Array(60).keys()).map(function (item) {
          if (item.toString().length === 1) item = '0' + item;
          if (item.toString() === minVal) return '<option value=\'' + item + '\' selected=\'selected\'>' + item + '</option>';
          return '<option value=\'' + item + '\'>' + item + '</option>';
        }).join(' ');

        // AM, PM
        markup += '</select>\n        <select class="shift">\n          <option value=\'0\' ' + (!shiftVal ? "selected='selected'" : '') + '>AM</option>\n          <option value=\'1\' ' + (shiftVal ? "selected='selected'" : '') + '>PM</option>\n        </select>';

        markup += '</select>\n      </div>';

        return markup;
      }
    }, {
      key: 'cleanupTimer',
      value: function cleanupTimer(evt, timer) {
        var _this4 = this;

        if (evt && evt.preventDefault) evt.preventDefault();

        if (timer) {

          timer.classList.remove('active');

          setTimeout(function () {
            _this4.source = undefined;
            if (timer.parentNode) document.body.removeChild(timer);
          }, 300);
        }

        document.body.removeEventListener('click', this.bodyClick, false);

        return false;
      }
    }]);

    return TimePicker;
  }();

  if (glob && glob.exports) {
    glob.exports = Object.assign({}, {
      'TimePicker': TimePicker,
      'timePicker': new TimePicker()
    });
  } else {
    glob.TimePicker = TimePicker;
    glob.timePicker = new TimePicker();
  }
})(typeof module === "undefined" ? window : module);

(function (glob) {
  var RangePicker = function () {
    function RangePicker(elem) {
      _classCallCheck(this, RangePicker);

      this.elem = elem;
      this.initialized = false;
      this.init();
    }

    _createClass(RangePicker, [{
      key: 'init',
      value: function init() {
        if (!this.elem) return;

        if (this.initialized) return;
        this.initialized = true;

        var time = +new Date();

        this.startElem = this.elem.querySelector('.range-start');
        this.endElem = this.elem.querySelector('.range-end');
        this.startElem.classList.add('start' + time);
        this.endElem.classList.add('end' + time);

        this.startController = new DZDatePicker('start' + time);
        this.endController = new DZDatePicker('end' + time);

        this.startController.callback = this.callback.bind(this);
        this.endController.callback = this.startController.callback;
      }
    }, {
      key: 'callback',
      value: function callback() {
        var args = [].concat(Array.prototype.slice.call(arguments));
        var elem = args[0];
        var val = args[1];

        var isStart = elem.classList.contains('range-start');

        if (isStart) this.start = val;else this.end = val;

        if (isStart) {
          // update the min-date of the end-range
          this.endElem.dataset.dateMin = val;
        } else {
          // update the max-date of the start-range
          this.startElem.dataset.dateMax = val;
        }
      }
    }]);

    return RangePicker;
  }();

  if (glob.hasOwnProperty('exports')) glob.exports = Object.assign({}, glob.exports, RangePicker);else glob.RangePicker = RangePicker;
})(typeof module === "undefined" ? window : module);

(function (glob) {

  if (!glob) return; // exit early as we only wish to target the browser environment

  /*
   * we check early if the browser natively supports 
   * input[type="date"], 
   * input[type="time"], 
   * input[type="datetime-local"]
   */

  var checks = {
    'date': false,
    'time': false,
    'datetime-local': false
  };

  var input = document.createElement("input");

  Object.keys(checks).forEach(function (key) {
    input.type = key;
    // if the input type is the same as we set it, it is supported by the browser
    checks[key] = input.type === key;
  });

  var hookTime = function hookTime() {
    var inputs = slice.call(document.querySelectorAll('input[type="time"]'));
    inputs.forEach(attachTimeTrigger);
  };

  var hookDate = function hookDate() {
    var inputs = slice.call(document.querySelectorAll('input[type="date"]'));
    inputs.forEach(attachDateTrigger);
  };

  var hookDateTime = function hookDateTime() {
    /* 
     * when datetime-local is not supported, 
     * we split the current input into two separate inputs. 
     * One for date, the other for time.
     * We set the original input elem to "hidden" and manipulate
     * it's value so the user still retains the name of that field in the form
     */
    var inputs = slice.call(document.querySelectorAll('input[type="datetime-local"]'));
    inputs.forEach(function (elem) {

      // create a reference for the parent node because we need it later
      var input = elem;
      var container = input.parentNode;
      var getTarget = function getTarget() {
        return container.querySelector("input[data-original='datetime-local']");
      };

      var dateChange = function dateChange(evt) {
        var target = getTarget();
        target.dataset.date = evt.target.value;
      };

      var timeChange = function timeChange(evt) {
        var target = getTarget();
        target.dataset.time = evt.target.value;
      };

      // define a custom getter for value which utilizes the above two dataset values
      input.__defineGetter__("value", function () {
        return ((this.dataset.date || "") + " " + (this.dataset.time || "")).trim();
      });

      // set the type to hidden so it's still in the DOM, but not visible to the user
      input.type = "hidden";
      // set this custom dataset prop so we can query for it later
      input.dataset.original = "datetime-local";

      // create our new date input
      var inDate = document.createElement("input");
      inDate.type = checks.date ? "date" : "text";
      inDate.placeholder = "Date";
      inDate.oninput = dateChange;

      // create our new time input
      var inTime = document.createElement("input");
      inTime.type = checks.time ? "time" : "text";
      inTime.placeholder = "Time";
      inTime.oninput = timeChange;

      [inDate, inTime].forEach(function (inp) {
        inp.__defineGetter__("required", function () {
          return input.required;
        });

        inp.__defineGetter__("validity", function () {
          return input.validity;
        });

        inp.__defineGetter__("pattern", function () {
          return input.pattern;
        });

        inp.__defineGetter__("validationMessage", function () {
          return input.validationMessage;
        });

        inp.__defineSetter__("validationMessage", function (val) {
          input.validationMessage = val;
        });
      });

      // add them to the DOM after the OG
      container.insertAdjacentElement("beforeEnd", inDate);
      container.insertAdjacentElement("beforeEnd", inTime);

      // attach the triggers
      attachDateTrigger(inDate);
      attachTimeTrigger(inTime);
    });
  };

  if (!checks.date) hookDate();
  if (!checks.time) hookTime();
  if (!checks['datetime-local']) hookDateTime();
})(typeof module === "undefined" ? window : undefined);
//# sourceMappingURL=dzdatetimepicker-dist.js.map