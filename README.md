# DZDatePicker
Functional, Extensible &amp; Simple Date-picker based on moment.js

### Setup
Include `moment.js` in your HTML file
```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.13.0/moment.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/moment-range/2.2.0/moment-range.min.js"></script>

<script src="dzcalendar.js"></script>
<link type="text/css" href="dzcalendar.css" />
```

### Usage
You can initiate the calendar by writing a *trigger* element like so:
```html
<button class="date-trigger" data-date-max="2016-05-09" data-date-min="2016-01-01" data-onset="didSetDate">Trigger</button>
```

The few important things to note are:  
- when `dzcalendar.js` runs, it automatically finds elements with the class `date-trigger` and hooks on to them. No futher configuration is required.
- You can set additional, *optional* dataset items like `date-max` and `date-min` to control the selectable items within a range. Both are optional, and you can use only one if desired.
- the last parameter, `onset` is required if you need a callback when the user selects a date. This is optional, however, your implementation will require it if you need to update the UI. The implementation for this is intentionally left out.

### License
DZDatePicker is licensed under the MIT License. Please refer to the LICENSE file for more information. 

### Author
Nikhil Nigade (Dezine Zync Studios)
