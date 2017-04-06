'use strict';

const findParent = (elem, id) => {
    
  const checker = i => i.getAttribute('id') === id || i.classList.contains(id)
  
  if(checker(elem))
    return elem;
    
  while(elem.parentNode) {

    elem = elem.parentNode

    if(elem === document.body || elem === document)
      return undefined

    if(checker(elem))
      return elem

  }

  return undefined
}

const inputFocus = (evt) => {
  if(evt && evt.preventDefault)
    evt.preventDefault()
  evt.target.blur()
  return false
}

const inputBlur = (evt) => {
  if(evt && evt.preventDefault)
    evt.preventDefault()
  return false
}

// @prepros-append ./datepicker.js
// @prepros-append ./timepicker.js
// @prepros-append ./rangepicker.js
// @prepros-append ./autohook.js
((glob) => {

  class DatePicker {

    constructor(customClass) {
      this.customClass = customClass
      this.init()
    }

    init() {
      if(this.initialized)
        return false

      this.initialized = true

      this.setupHooks()
    }

    setupHooks() {

      const prevClick = (evt) => {

        if(evt && evt.preventDefault)
          evt.preventDefault()
        
        let calendar = this.getCalendar()
        let currentString = calendar.dataset.current.split('-')
        let current = new Date(currentString[0], currentString[1])

        let previous = new Date(current.getFullYear(), current.getMonth() - 1)

        let newDates = this.drawDates(this.getDaysArrayByMonth(previous))
        let currentDates = document.querySelector('#dz-calendar .dz-dates')
        
        calendar.insertAdjacentHTML('beforeEnd', newDates)
        newDates = calendar.children[calendar.children.length-1]
        
        calendar.removeChild(currentDates)
        
        let year = previous.getFullYear()
        let month = previous.getMonth()
        
        calendar.dataset.current = `${year} - ${month}`
        calendar.children[0].children[0].innerHTML = `${this.getMonthName(month)}, ${year}`
        
        hookDates()

        return false

      }
      
      const nextClick = (evt) => {

        if(evt && evt.preventDefault)
          evt.preventDefault()
        
        let calendar = this.getCalendar()
        let currentString = calendar.dataset.current.split('-')
        let current = new Date(currentString[0], currentString[1])
        
        let next = new Date(current.getFullYear(), current.getMonth() + 1)

        let newDates = this.drawDates(this.getDaysArrayByMonth(next))
        let currentDates = document.querySelector('#dz-calendar .dz-dates')
        
        calendar.insertAdjacentHTML('beforeEnd', newDates)
        newDates = calendar.children[calendar.children.length-1]
        
        calendar.removeChild(currentDates)
        
        let year = next.getFullYear()
        let month = next.getMonth()
        
        calendar.dataset.current = `${year} - ${month}`
        calendar.children[0].children[0].innerHTML = `${this.getMonthName(month)}, ${year}`
        
        hookDates()

        return false

      }
      
      this.bodyClick = (evt) => {

        let calendar = this.getCalendar()

        if(calendar)
          if(!calendar.classList.contains('active'))
            document.body.removeChild(calendar)
          else if(!this.isInCalendar(evt.target)) {
            return this.cleanupCalendar(evt, calendar)
          }
      
      }
      
      const dateClick = (evt) => {
        
        let calendar = this.getCalendar()
        let date = parseInt(evt.target.innerHTML)

        let currentString = calendar.dataset.current.split('-')
        date = new Date(currentString[0],currentString[1],date)

        let fn = window[this.source.dataset.onset]
        if(fn) fn(date)

        // zero pad the month if needed
        let month = date.getMonth() + 1
        if(month.toString().length === 1)
          month = "0" + month
        // zero pad the date if needed
        let dateStr = date.getDate()
        if(dateStr.toString().length === 1)
          dateStr = "0" + dateStr

        let val = [date.getFullYear(), month, dateStr].join('-')

        if(this.source.nodeName === 'INPUT') {
          this.source.value = val
          if ('InputEvent' in window)
            this.source.dispatchEvent(new InputEvent('input'))
          else
            this.source.dispatchEvent(new Event('input'))
        }
        else if(this.source.dataset.dateVal)
          this.source.dataset.dateVal = val
        
        if (this.callback)
          this.callback(this.source, val)

        return this.cleanupCalendar(evt, calendar)
        
      }
      
      const hookDates = () => {
        
        let calendar = this.getCalendar()
        if(!calendar)
          return
           
        let dates = Array.prototype.slice.call(document.querySelectorAll('#dz-calendar .dz-dates div'))
        dates.forEach((item) => {
          if(!item.classList.contains('disabled'))
            item.addEventListener('click', dateClick, false)
        })
        
      }

      const triggerClick = (evt) => {
        
        // check if calendar is already being shown
        let phantom = this.getCalendar()
        
        if(phantom) {
          this.cleanupCalendar(evt, phantom)
          setTimeout(() => {
            triggerClick(evt)
          }, 300)
          return false
        }

        let rect = evt.target.getBoundingClientRect()
        let center = {
          x: rect.left + (rect.width / 2),
          y: rect.top + rect.height
        }

        let target = evt.target.nodeName === "INPUT" ? 
                      evt.target : 
                      findParent(evt.target, this.customClass || 'date-trigger')

        this.source = target

        let calendar = this.drawCalendar()

        document.body.insertAdjacentHTML('beforeEnd', calendar)

        calendar = document.getElementById('dz-calendar')
        
        // position the calendar near the origin point
        let calendarRect = calendar.getBoundingClientRect()
        
        // the width before showing = actual width * 0.25 
        let width = calendarRect.width * 4

        calendar.style.left = (center.x - width/2) + 'px'
        calendar.style.top = (center.y + 16) + 'px'

        let prev = calendar.children[0].children[1]
        let next = calendar.children[0].children[2]

        prev.addEventListener('click', prevClick, false)
        next.addEventListener('click', nextClick, false)

        calendar.classList.add('active')
           
        hookDates()

        let fn = 'didShowDatePicker'
        if(window[fn])
          window[fn](calendar)
           
        setTimeout(() => {
          // this needs to be added a second later to prevent ghost click
          document.body.addEventListener('click', this.bodyClick, false)
        }, 500)

        return false

      }

      let triggers = document.querySelectorAll(this.customClass ? "." + this.customClass : '.date-trigger')
      triggers = Array.prototype.slice.call(triggers)

      const attachTrigger = (elem) => {
        if(!elem) return
        elem.addEventListener('click', triggerClick, false)
        if(elem.nodeName === "INPUT") {
          elem.addEventListener('focus', inputFocus, false)
          elem.addEventListener('blur', inputBlur, false)
        }
      }

      triggers.forEach((item) => {
        attachTrigger(item)
      })

      glob.attachDateTrigger = attachTrigger

    }

    getCalendar() {
      return document.getElementById("dz-calendar")
    }

    isInCalendar(elem) {
      let parent = findParent(elem, 'dz-calendar')
      return parent !== document.body && parent != undefined
    }

    getMonthName(idx) {
      return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].splice(idx, 1)
    }

    getDaysArrayByMonth(date) {
      
      let year = date.getFullYear()
      let month = date.getMonth()
      let monthRange = new Date(year, month + 1, 0).getDate()
      let days = []

      while(monthRange > 0) {
        days.push(new Date(year, month, monthRange))
        monthRange--;
      }

      return days.reverse()
    }

    drawDates(dates) {

      let now = new Date()

      if(this.source.nodeName === 'INPUT' && this.source.value)
        now = new Date(this.source.value)
      else if (this.source.dataset.dateVal)
        now = new Date(this.source.dataset.dateVal)
      
      let markup = `<div class="dz-dates">`
      let calendar = this.getCalendar()
      
      let {dateMax, dateMin} = this.source.dataset
      
      if(dateMax)
        dateMax = new Date(dateMax)
      if(dateMin)
        dateMin = new Date(dateMin)

      let val = null
      if(this.source.nodeName === 'INPUT')
        val = new Date(this.source.value)
      else if (this.source.dataset.dateVal)
        val = new Date(this.source.dataset.dateVal)

      // find offset of first date.
      let offsetDay = dates[0].getDay()
      
      const dateEqual = (base, compare) => base.getDate() === compare.getDate() && base.getMonth() === compare.getMonth() && base.getYear() && compare.getYear()

      dates.forEach((date, idx) => {

        let classes = [];
        
        // check if the date is today
        if (dateEqual(now, date))
          classes.push('today')

        // check if this is the selected value
        if(val && dateEqual(date, val))
          classes.push('selected')
          
        // check if the date is within the min range, if one is set
        if(dateMin && (dateMin.getTime() - date.getTime()) > 0)
          classes.push('disabled')
          
        // check if the date is within the max range, if one is set
        if(dateMax && (dateMax.getTime() - date.getTime()) < 0)
          classes.push('disabled')
          
        classes = classes.join(' ')

        if (idx !== 0)
          markup += `<div role="button" class="${classes}">${date.getDate()}</div>`
        else
          markup += `<div style="margin-left:${offsetDay * 35}px;" role="button" class="${classes}">${date.getDate()}</div>`

      })

      markup += `</div>`

      return markup

    }

    drawCalendar() {

      let now = new Date()

      let year = now.getFullYear()
      let month = now.getMonth()
      
      let dates = this.getDaysArrayByMonth(now)
      let days = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
      
      let markup = `<div id="dz-calendar" class="inline-container" data-current="${year}-${month}">
        <div class="dz-title"> 
           <h4>${this.getMonthName(now.getMonth())}, ${now.getFullYear()}</h4>
           <button id="dz-prev"><svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>keyboard_arrow_left</title><path d="M14.422 16.078l-1.406 1.406-6-6 6-6 1.406 1.407-4.594 4.593z" fill="#8FCB14" fill-rule="evenodd"/></svg></button>
           <button id="dz-next"><svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>keyboard_arrow_right</title><path d="M8.578 16.36l4.594-4.594-4.594-4.594 1.406-1.406 6 6-6 6z" fill="#8FCB14" fill-rule="evenodd"/></svg></button>
        </div>
        <div class="dz-days">`

      days.forEach((day) => {
        markup += `<div>${day}</div>`
      })

      markup += `</div>
        ${this.drawDates(dates)}
      </div>`

      return markup
    }

    cleanupCalendar(evt, calendar) {

      if(evt && evt.preventDefault)
        evt.preventDefault()
      
      if(calendar) {
        
        calendar.classList.remove('active')
        
        setTimeout(() => {
          if (calendar && calendar.parentNode)
            calendar.parentNode.removeChild(calendar)
          this.source = undefined
        }, 300)
        
      }

      document.body.removeEventListener('click', this.bodyClick, false)

      return false

    }

  }

  if(glob && glob.exports)
    glob.exports = Object.assign({}, {
      'DatePicker': DatePicker,
      'datePicker': new DatePicker()
    })

  else {
    glob.DatePicker = DatePicker
    glob.datePicker = new DatePicker()
  }

})(typeof module === "undefined" ? window : module);
((glob) => {

  class TimePicker {

    constructor() {
      this.init()
    }

    init() {

      if(this.initialized)
        return false

      this.initialized = true
      this.setupHooks()

    }

    setupHooks() {

      this.bodyClick = (evt) => {

        if(evt.target.nodeName === 'SELECT')
          return false
      
        let timer = this.getTimer()

        if(timer)
          if(!timer.classList.contains('active'))
            document.body.removeChild(timer)
          else if(!this.isInTimer(evt.target)) {
            return this.cleanupTimer(evt, timer)
          }
        
        document.body.removeEventListener('click', this.bodyClick, false);
      
      }
      
      const didChange = () => {
           
        // let target = evt.target
        let timer = this.getTimer()
        
        let hours = parseInt(timer.children[0].value)
        let minutes = parseInt(timer.children[1].value)
        let shift = parseInt(timer.children[2].value)
      
        if(shift === 1 && hours != 12)
          hours += 12
          
        if(hours === 12 && shift === 0)
          hours = '00'

        if(this.source.nodeName === 'INPUT') {
          this.source.value = hours + ':' + minutes
          if ('InputEvent' in window)
            this.source.dispatchEvent(new InputEvent('input'))
          else
            this.source.dispatchEvent(new Event('input'))
        }
          
        let fn = window[this.source.dataset.onchange]
        if(fn) fn({
          string: hours + ':' + minutes,
          hours: parseInt(hours),
          minutes: minutes
        })
        
      }
      
      const triggerClick = (evt) => {
        
        let phantom = this.getTimer()
        
        if(phantom) {
          this.cleanupTimer(evt, phantom)
          setTimeout(() => {
            triggerClick(evt)
          }, 300)
          return false
        }
        
        let rect = evt.target.getBoundingClientRect()
        let center = {
          x: rect.left,
          y: rect.top + rect.height
        }

        this.source = evt.target
        let timer = this.drawTimer()

        document.body.insertAdjacentHTML('beforeEnd', timer)

        timer = this.getTimer()
        
        // set the current time
        if(this.source.nodeName !== 'INPUT' || !this.source.value.length) {
          let date = new Date()
          let hours = date.getHours(), minutes = date.getMinutes()
          
          timer.children[0].value = hours > 12 ? hours - 12 : hours
          timer.children[1].value = minutes
          timer.children[2].value = hours >= 12 ? 1 : 0
        }
        
        // add the hooks
        Array.prototype.slice.call(timer.children).forEach((item) => {
          item.addEventListener('change', didChange, false)
        })
        
        // if(evt.target.dataset.onchange)
        //    timer.dataset.onchange = evt.target.dataset.onchange
        
        // position the calendar near the origin point
        let timerRect = timer.getBoundingClientRect()
        
        // the width before showing = actual width * 0.25 
        let width = timerRect.width * 4

        timer.style.left = (center.x - 16) + 'px'
        timer.style.top = (center.y + 16) + 'px'

        timer.classList.add('active')
        
        setTimeout(() => {
          // this needs to be added a second later to prevent ghost click
          document.body.addEventListener('click', this.bodyClick, false)
        }, 500)

        return false
        
      }

      const attachTrigger = (elem) => {
        if(!elem) return
        elem.addEventListener('click', triggerClick, false)
        if(elem.nodeName === "INPUT") {
          elem.addEventListener('focus', inputFocus, false)
          elem.addEventListener('blur', inputBlur, false)
        }
      }

      let triggers = Array.prototype.slice.call(document.querySelectorAll('.timer-trigger'))
      
      triggers.forEach((item) => {
        attachTrigger(item)
      })

      window.attachTimeTrigger = attachTrigger

    }

    getTimer() {
      return document.getElementById('dz-timer')
    }

    isInTimer(elem) {
      let parent = findParent(elem, 'dz-timer')
      return parent !== document.body && parent != undefined
    }

    drawTimer() {

      let val = null, hoursVal, minVal, shiftVal = false
      if(this.source.nodeName === 'INPUT')
        val = this.source.value

      if(val) {
        val = val.split(':')
        hoursVal = parseInt(val[0])
        minVal = val[1]
        if(hoursVal > 12) {
          hoursVal -= 12
          shiftVal = true
        }
      }

      let markup = `<div id="dz-timer" class="inline-container">
        <select class="hours">`
      
      // draw hours dropdown
      let hours = Array.from(Array(13).keys())
      hours.shift()
      markup += hours
        .map((item) => {
          if(item === hoursVal)
            return `<option value='${item}' selected='selected'>${item}</option>` 
          return `<option value='${item}'>${item}</option>`    
        }).join(' ')
      
      markup += `</select>
        <select class="minutes">`
      
      // draw minutes dropdown
      markup += Array.from(Array(60).keys())
      .map((item) => {
        if(item.toString().length === 1)
          item = '0' + item
        if(item.toString() === minVal)
          return `<option value='${item}' selected='selected'>${item}</option>`
        return `<option value='${item}'>${item}</option>`
      }).join(' ')
      
      // AM, PM
      markup += `</select>
        <select class="shift">
          <option value='0' ${!shiftVal?"selected='selected'" : ''}>AM</option>
          <option value='1' ${shiftVal?"selected='selected'" : ''}>PM</option>
        </select>`
         
      markup +=`</select>
      </div>`
      
      return markup
    }

    cleanupTimer(evt, timer) {
      if(evt && evt.preventDefault)
        evt.preventDefault()
      
      if(timer) {
        
        timer.classList.remove('active')
        
        setTimeout(() => {
          this.source = undefined
          if(timer.parentNode)
            document.body.removeChild(timer)
        }, 300)
        
      }

      document.body.removeEventListener('click', this.bodyClick, false)

      return false
    }

  }
    
  if(glob && glob.exports) {
    glob.exports = Object.assign({}, {
      'TimePicker': TimePicker,
      'timePicker': new TimePicker()
    })
  }
  else {
    glob.TimePicker = TimePicker
    glob.timePicker = new TimePicker()
  }

})(typeof module === "undefined" ? window : module);

((glob) => {
  class RangePicker {
    constructor(elem) {
        this.elem = elem
        this.initialized = false
        this.init()
    }

    init () {
      if (!this.elem)
        return

      if (this.initialized)
        return
      this.initialized = true

      let time = +new Date()

      this.startElem = this.elem.querySelector('.range-start')
      this.endElem = this.elem.querySelector('.range-end')
      this.startElem.classList.add('start'+time)
      this.endElem.classList.add('end'+time)

      this.startController = new DatePicker('start'+time)
      this.endController = new DatePicker('end'+time)

      this.startController.callback = this.callback.bind(this)
      this.endController.callback = this.startController.callback
    }

    callback() {
      let args = [...arguments]
      let elem = args[0]
      let val = args[1]

      let isStart = elem.classList.contains('range-start')

      if (isStart)
        this.start = val
      else
        this.end = val

      if (isStart) {
        // update the min-date of the end-range
        this.endElem.dataset.dateMin = val
      }
      else {
        // update the max-date of the start-range
        this.startElem.dataset.dateMax = val
      }
    }
  }

  if (glob.hasOwnProperty('exports'))
    glob.exports = Object.assign({}, glob.exports, RangePicker)
  else
    glob.RangePicker = RangePicker

})(typeof module === "undefined" ? window : module);

((glob) => {

  if (!glob)
    return; // exit early as we only wish to target the browser environment

  /*
   * we check early if the browser natively supports 
   * input[type="date"], 
   * input[type="time"], 
   * input[type="datetime-local"]
   */

  let checks = {
    'date': false,
    'time': false,
    'datetime-local': false
  }

  let input = document.createElement("input")
  
  Object.keys(checks).forEach(key => {
    input.type = key
    // if the input type is the same as we set it, it is supported by the browser
    checks[key] = input.type === key 
  })

  const hookTime = () => {
    let inputs = Array.prototype.slice.call(document.querySelectorAll('input[type="time"]'))
    inputs.forEach(attachTimeTrigger)
  }

  const hookDate = () => {
    let inputs = Array.prototype.slice.call(document.querySelectorAll('input[type="date"]'))
    inputs.forEach(attachDateTrigger)
  }

  const hookDateTime = () => {
    /* 
     * when datetime-local is not supported, 
     * we split the current input into two separate inputs. 
     * One for date, the other for time.
     * We set the original input elem to "hidden" and manipulate
     * it's value so the user still retains the name of that field in the form
     */
    let inputs = Array.prototype.slice.call(document.querySelectorAll('input[type="datetime-local"]'))
    inputs.forEach(elem => {
      
      // create a reference for the parent node because we need it later
      const input = elem
      const container = input.parentNode
      const getTarget = () => container.querySelector("input[data-original='datetime-local']")
      
      const dateChange = evt => {
        let target = getTarget()
        target.dataset.date = evt.target.value
      }

      const timeChange = evt => {
        let target = getTarget()
        target.dataset.time = evt.target.value
      }

      // define a custom getter for value which utilizes the above two dataset values
      input.__defineGetter__("value", function() {
        return ((this.dataset.date||"" )+ " " + (this.dataset.time||"")).trim()
      })

      // set the type to hidden so it's still in the DOM, but not visible to the user
      input.type = "hidden"
      // set this custom dataset prop so we can query for it later
      input.dataset.original = "datetime-local"
      
      // create our new date input
      let inDate = document.createElement("input")
      inDate.type = checks.date ? "date" : "text"
      inDate.placeholder = "Date"
      inDate.oninput = dateChange

      // create our new time input
      let inTime = document.createElement("input")
      inTime.type = checks.time ? "time" : "text"
      inTime.placeholder = "Time"
      inTime.oninput = timeChange;
      
      [inDate, inTime].forEach(inp => {
        inp.__defineGetter__("required", function() {
          return input.required
        })

        inp.__defineGetter__("validity", function() {
          return input.validity
        })

        inp.__defineGetter__("pattern", function() {
          return input.pattern
        })

        inp.__defineGetter__("validationMessage", function() {
          return input.validationMessage
        })

        inp.__defineSetter__("validationMessage", function(val) {
          input.validationMessage = val
        })
      })

      // add them to the DOM after the OG
      container.insertAdjacentElement("beforeEnd", inDate)
      container.insertAdjacentElement("beforeEnd", inTime)

      // attach the triggers
      attachDateTrigger(inDate)
      attachTimeTrigger(inTime)
    })
  }

  if (!checks.date)
    hookDate()
  if (!checks.time)
    hookTime()
  if (!checks['datetime-local'])
    hookDateTime()

})(typeof module === "undefined" ? window : undefined);

//# sourceMappingURL=dzdatetimepicker-dist.js.map