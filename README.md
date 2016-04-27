# DZDateTimePicker
Functional, Extensible &amp; Simple Date & Timer picker.

Demo: http://codepen.io/dezinezync/pen/jqvZYp

### Setup
Include `moment.js` in your HTML file
```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.13.0/moment.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/moment-range/2.2.0/moment-range.min.js"></script>
<!-- For Dev -->
<script src="dzdatetimepicker.js"></script>
<!-- For Production -->
<script src="dzdtp.min.js"></script>
<link rel="stylesheet" href="dzdatetimepicker.css" />
```

### Date Picker Usage
You can initiate the date picker by wiring up a *trigger* element like so:
```html
<button class="date-trigger" data-date-max="2016-05-09" data-date-min="2016-01-01" data-onset="didSetDate">Trigger</button>
```

The few important things to note are:  
- when `dzdatetimepicker.js` runs, it automatically finds elements with the class `date-trigger` and hooks on to them. No futher configuration is required.
- You can set additional, *optional* dataset items like `date-max` and `date-min` to control the selectable items within a range. Both are optional, and you can use only one if desired.
- the last parameter, `onset` is required if you need a callback when the user selects a date. This is optional, however, your implementation will require it if you need to update the UI. The implementation for this is intentionally left out.

### Timer Picker Usage
You can initiate the time picker by wiring up a *trigger* element like so:
```html
<div role="button" class="trigger timer-trigger" data-onchange="didSetTime">Time Trigger</div>
```
When the script loads, it automatically hooks on to elements with the class `timer-trigger`. No other configuration is necessary. Similar to the date picker, the last parameter, `onchange` is required if you need a callback when the user selects a date. This is optional, however, your implementation will require it if you need to update the UI. The implementation for this is intentionally left out.

The callback, unlike the date picker, responds with an object in the following format:
```json
{
  "string" : "14:26",
  "hours" : 14,
  "minutes" : 26
}
```

### Todo
- [ ] Remove dependencies 

### License
DZDateTimePicker is licensed under the MIT License. Please refer to the LICENSE file for more information. 

### Author
Nikhil Nigade (Dezine Zync Studios)
