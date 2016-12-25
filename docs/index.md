# DZDateTimePicker
Functional, Extensible &amp; Simple Date-picker without any dependencies..

Demo: http://codepen.io/dezinezync/pen/jqvZYp

### Setup
```html
<!-- For Dev -->
<script src="dzdatetimepicker.js"></script>
<!-- For Production -->
<script src="dzdtp.min.js"></script>

<!-- The stylesheet. You can include your own instead -->
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

### Notes
- Both the datepicker and timepicker automatically idenity `<input>` elements. They hook on to the `focus` and `blur` events so the user can use the pickers to set the values directly. 
- If the pickers detect an `<input>` element, the pickers will update the `value` attribute when the user updates their selection. 
- When not using an `<input>` element, you can optionally set the attribute `data-date-val=""` and it'll be updated similarly. 

### Todo
- [x] Remove dependencies 

### License
DZDateTimePicker is licensed under the MIT License. Please refer to the LICENSE file for more information. 

### Author
Nikhil Nigade (Dezine Zync Studios)
