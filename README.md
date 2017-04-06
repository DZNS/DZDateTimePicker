# DZDateTimePicker
Functional, Extensible &amp; Simple Date and Time picker without any dependencies.  

DZDateTimePicker also automatically adds support for:  
```html
input[type="date"]
input[type="time"]
input[type="datetime-local"]
```
if they are not supported natively. You don't have to do anything extra. The library will handle the setup for you. You simply have to query the `.value` of your original input elements and you're all set.  

### Demos  
The related demos are in the `demo` folder of this repo.  
On a related note:   
- All source files are in the `src` directory.
- All distribution files are in the `dist` directory (which you should use for production sites)

### Setup
Via NPM
```sh
npm install --save dzdatetimepicker
```

```html
<script src="dzdatetimepicker-dist.js"></script>

<!-- The stylesheet. You can include your own instead -->
<link rel="stylesheet" href="dzdatetimepicker.css" />
```

### Date Picker Usage
Simply,
```html
<input type="datetime-local" name="epoch-start" />
```
DZDateTimePicker will allow native browser implementations to take over if they exist. If they don't, the library will do it's own wiring for you. 


You can optionally initiate the date picker by wiring up a *trigger* element like so:
```html
<button class="date-trigger" data-date-max="2016-05-09" data-date-min="2016-01-01" data-onset="didSetDate">Trigger</button>
```

The few important things to note are:  
- when `dzdatetimepicker-dsit.js` runs, it automatically finds elements with the class `date-trigger` and hooks on to them. No futher configuration is required.
- You can set additional, *optional* dataset items like `date-max` and `date-min` to control the selectable items within a range. Both are optional, and you can use only one if desired.
- the last parameter, `onset` is required if you need a callback when the user selects a date. This is optional, however, your implementation will require it if you need to update the UI. The implementation for this is intentionally left out.

### Timer Picker Usage
Simply,
```html
<input type="time" name="epoch-start" />
```

You can optionally initiate the time picker by wiring up a *trigger* element like so:
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

### Range Picker Usage
To setup a range picker, include the `rangepicker-dist.js` file along with the date-picker sources as mentioned above. Then you can can write simple markup as follows:  
```html
<div id="range-picker">
    <div role="button" class="trigger range-start" data-date-max="2017-05-09" data-date-min="2016-01-01" data-onset="didSetDate">Start</div>
    <div role="button" class="trigger range-end" data-date-max="2017-05-09" data-date-min="2016-01-01" data-onset="didSetDate">End</div>
</div>
```

You can then initialise the range picker as follows:
```js
const myRangePicker = new RangePicker(document.getElementById("range-picker"))
```

The `RangePicker` will then automatically handle all the setup for you and adjust the min-max ranges for the date picker based on the user's input. 

### Notes
- Both the datepicker and timepicker automatically idenity `<input>` elements. They hook on to the `focus` and `blur` events so the user can use the pickers to set the values directly. 
- If the pickers detect an `<input>` element, the pickers will update the `value` attribute when the user updates their selection. 
- When not using an `<input>` element, you can optionally set the attribute `data-date-val=""` and it'll be updated similarly. 

### Todo
- [x] Remove dependencies 
- [x] Structure the repo properly
- [x] Add source maps to distribution files
- [x] Prepros for handling distribution process
- [x] lint all source js files

### License
DZDateTimePicker is licensed under the MIT License. Please refer to the LICENSE file for more information. 

### Author
Nikhil Nigade (Dezine Zync Studios)
