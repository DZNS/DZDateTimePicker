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
};

const inputFocus = (evt) => {
  if(evt && evt.preventDefault)
    evt.preventDefault()
  evt.target.blur()
  return false
};

const inputBlur = (evt) => {
  if(evt && evt.preventDefault)
    evt.preventDefault()
  return false
};

const measure = (fn = function() {}) => new Promise((resolve, reject) => {
   window.requestAnimationFrame(() => {
    const retval = fn()
    resolve(retval)
  })
});

const mutate = (fn = function() {}) => new Promise((resolve, reject) => {
  window.requestAnimationFrame(() => {
    const retval = fn()
    resolve(retval)
  })
});

// @prepros-append ./datepicker.js
// @prepros-append ./timepicker.js
// @prepros-append ./rangepicker.js
// @prepros-append ./autohook.js
((glob) => {

  const prevSVG = `<svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>Previous Month</title><path d="M14.422 16.078l-1.406 1.406-6-6 6-6 1.406 1.407-4.594 4.593z" fill="#007AFF" fill-rule="evenodd"/></svg></button>`;
  const nextSVG = `<svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>Next Month</title><path d="M8.578 16.36l4.594-4.594-4.594-4.594 1.406-1.406 6 6-6 6z" fill="#007AFF" fill-rule="evenodd"/></svg>`;

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

      this.bodyInput = (evt) => {
        const {keyCode} = evt
        
        const calendar = this.getCalendar()

        if (keyCode == 36 || keyCode == 35) {
          // pressed Home or End
          const elem = calendar.querySelector(`.dz-dates button:${keyCode == 36 ? 'first-child' : 'last-child'}`)
          if (elem)
            elem.focus()
          return true
        }

        if (keyCode >= 37 && keyCode <= 40) {
          // up or down arrow keys
          const current = Number(document.activeElement.innerHTML) || 0
          
          let expected = current
          if (keyCode == 40) expected += 7; // down
          else if (keyCode == 38) expected -= 7; // up
          else if (keyCode == 37) expected -= 1; // left
          else expected += 1; // right

          const elem = calendar.querySelector(`.dz-dates button:nth-child(${expected})`)
          if (elem)
            elem.focus()
          return true
        }

        if (keyCode == 33) {
          calendar.querySelector("#dz-prev").click()
          return true
        }

        if (keyCode == 34) {
          calendar.querySelector("#dz-next").click()
          return true
        }

        if (keyCode != 13 && keyCode != 27 || keyCode != 32)
          return true

        if (keyCode == 13 || keyCode == 32) {
           // user has pressed the enter or space key. Assume to be a confirmation
           document.activeElement.getAttribute("aria-label").click()
           // the above click will automatically clean up the calendar
        }

        return true
      }
      
      const dateClick = (evt) => {
        
        let calendar = this.getCalendar()
        let date = parseInt(evt.target.innerHTML)

        let currentString = calendar.dataset.current.split('-')
        date = new Date(currentString[0],currentString[1],date)

        let fn = window[this.source.dataset.onset]
        if(fn) 
          fn(date)

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
           
        let dates = Array.prototype.slice.call(document.querySelectorAll('#dz-calendar .dz-dates button'))
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

        mutate(() => {
          document.body.insertAdjacentHTML('beforeEnd', calendar)
        })
        .then(() => {
          calendar = document.getElementById('dz-calendar')
          return measure(() => calendar.getBoundingClientRect())
        })
        .then(result => {
          // position the calendar near the origin point
          const calendarRect = result
          
          // the width before showing = actual width * 0.25 
          let width = calendarRect.width * 4

          calendar.style.left = (center.x - width/2) + 'px'
          calendar.style.top = (center.y + 16) + 'px'

          let prev = calendar.children[0].children[1]
          let next = calendar.children[0].children[2]

          prev.addEventListener('click', prevClick, false)
          next.addEventListener('click', nextClick, false)          

          return mutate(() => {
            calendar.classList.add('active')
            this.source.setAttribute("aria-expanded", "true")
            if (this.source.hasAttribute("id")) {
              calendar.setAttribute("aria-describedby", this.source.getAttribute("id"))
            }
          })
        })
        .then(() => {
          hookDates()

          let fn = 'didShowDatePicker'
          if(window[fn])
            window[fn](calendar)
        })
        .then(() => {
          const date = (this.source.hasAttribute("value") ? new Date(this.source.value) : new Date()).getDate()
          return measure(() => calendar.querySelector(`button:nth-child(${date})`))
        })
        .then(result => {
          if (result) {
            result.focus()
          }
          document.body.addEventListener('click', this.bodyClick, false)
          document.body.addEventListener('keydown', this.bodyInput, false)
        })
        .then(result => {
          setTimeout(() => {
            this.repositionCalendarWithinViewport()
          }, 100)
        })
        .catch(err => {
          console.error(err)
        })

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
          elem.setAttribute("aria-haspopup", "true")
          elem.setAttribute("aria-expanded", "false")
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

    getFullMonthName(idx) {
      return ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].splice(idx, 1)
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
      
      const dateEqual = (base, compare) => base.getDate() === compare.getDate() && base.getMonth() === compare.getMonth() && base.getYear() == compare.getYear()

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

        const days = {
          "Mon": "Monday",
          "Tue": "Tuesday",
          "Wed": "Wednesday",
          "Thu": "Thursday",
          "Fri": "Friday",
          "Sat": "Saturday",
          "Sun": "Sunday"
        }

        let ariaString = date.toDateString()
        ariaString = [ariaString.substr(0,3), ariaString.substr(4)]
        ariaString[0] = `${days[ariaString[0]]}, `

        ariaString[1] = [ariaString[1].substr(0,3), ariaString[1].substr(4)]
        ariaString[1][0] = this.getFullMonthName(date.getMonth())
        ariaString[1] = ariaString[1].join(" ")
        ariaString = ariaString.join("")

        if (idx !== 0)
          markup += `<button aria-label="${ariaString}" class="${classes}">${date.getDate()}</button>`
        else
          markup += `<button style="margin-left:${offsetDay * 35}px;" aria-label="${ariaString}" class="${classes}">${date.getDate()}</button>`

      })

      markup += `</div>`

      return markup

    }

    drawCalendar() {

      let now = this.source.hasAttribute("value") ? new Date(this.source.value) : new Date()

      let year = now.getFullYear()
      let month = now.getMonth()

      let dates = this.getDaysArrayByMonth(now)
      let days = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
      
      let markup = `<div id="dz-calendar" class="inline-container" data-current="${year}-${month}"  role="dialog" aria-label="Calendar">
        <div class="dz-title"> 
           <h4 aria-role="Presentation" aria-label="${this.getFullMonthName(now.getMonth())}, ${now.getFullYear()}">${this.getMonthName(now.getMonth())}, ${now.getFullYear()}</h4>
           <button id="dz-prev" aria-label="Previous Month" title="Previous Month">${prevSVG}</button>
           <button id="dz-next" aria-label="Next Month" title="Next Month">${nextSVG}</button>
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

    repositionCalendarWithinViewport () {

      const calendar = this.getCalendar()

      if (!calendar)
        return;

      const rect = calendar.getBoundingClientRect().toJSON();
      
      if (rect.x < 0) {
        // move it to the right
        const left = rect.x - Number(calendar.style.left.replace("px", ""));
        calendar.style.left = left + "px"
      }

    }

    cleanupCalendar(evt, calendar) {

      if(evt && evt.preventDefault)
        evt.preventDefault()
      
      if(calendar) {
        
        mutate(() => {
          calendar.classList.remove('active')
        })
        .then(() => {
          if (calendar && calendar.parentNode)
            calendar.parentNode.removeChild(calendar)
        })
        .then(() => {
          if (this.source) {
            return mutate(() => this.source.setAttribute("aria-expanded", "false"))
          }

          return Promise.resolve()
        })
        .then(() => {
          document.body.removeEventListener('click', this.bodyClick, false)
          document.body.removeEventListener('keydown', this.bodyInput, false)
        })
        .catch(err => {
          console.error(err)
        })
        
      }

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

      this.bodyInput = (evt) => {
        const {keyCode} = evt
        
        if (keyCode != 13 && keyCode != 27)
          return true

        if (keyCode == 27) {
          // user is dismissing by pressing the Esc. key
          // reset the value back to the original value
          if (this.hasOwnProperty("originalValue")) {
            this.source.value = this.originalValue
          }
        }

        // user has pressed the enter key. Assume to be a confirmation
        if (this.hasOwnProperty("originalValue"))
          delete [this.originalValue]

        this.cleanupTimer(undefined, this.getTimer())

        return true
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

        mutate(() => {
          document.body.insertAdjacentHTML('beforeEnd', timer)
        })
        .then(() => {
          timer = this.getTimer()

          // set the current time
          if(this.source.nodeName !== 'INPUT' || !this.source.value.length) {
            let date = new Date()
            let hours = date.getHours(), 
              minutes = date.getMinutes()
            
            return mutate(() => {
              timer.children[0].value = hours > 12 ? hours - 12 : hours
              timer.children[1].value = minutes
              timer.children[2].value = hours >= 12 ? 1 : 0
            })
          }

          return Promise.resolve()
        })
        .then(() => {
          // add the hooks
          Array.prototype.slice.call(timer.children).forEach((item) => {
            item.addEventListener('change', didChange, false)
          })

          return measure(() => timer.getBoundingClientRect())
        })
        .then(result => {
          // position the calendar near the origin point
          const timerRect = result
          
          // the width before showing = actual width * 0.25 
          const width = timerRect.width * 4

          timer.style.left = (center.x - 16) + 'px'
          timer.style.top = (center.y + 16) + 'px'

          return mutate(() => {
            timer.classList.add('active')

            this.source.setAttribute("aria-expanded", "true")
            if (this.source.hasAttribute("id")) {
              timer.setAttribute("aria-describedby", this.source.getAttribute("id"))
            }
          })
        })
        .then(() => {
          timer.querySelector("select").focus()
          this.originalValue = this.source.value
          document.body.addEventListener('click', this.bodyClick, false)
          document.body.addEventListener('keydown', this.bodyInput, false)
        })
        .catch(err => {
          console.error(err)
        })

        return false
        
      }

      const attachTrigger = (elem) => {
        if(!elem) return
        elem.addEventListener('click', triggerClick, false)
        if(elem.nodeName === "INPUT") {
          elem.addEventListener('focus', inputFocus, false)
          elem.addEventListener('blur', inputBlur, false)
          elem.setAttribute("aria-haspopup", "true")
          elem.setAttribute("aria-expanded", "false")
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

        if(hoursVal >= 12)
          shiftVal = true
      }

      let markup = `<div id="dz-timer" class="inline-container" role="dialog" aria-label="Time picker">
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
        
        mutate(() => {
          timer.classList.remove('active')
        })
        .then(() => {
          this.source = undefined
          if(timer.parentNode)
            document.body.removeChild(timer)
        })
        .catch(err => {
          console.error(err)
        })
        
      }

      document.body.removeEventListener('click', this.bodyClick, false)
      document.body.removeEventListener('keydown', this.bodyInput, false)

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

      this.startElem.setAttribute("type", "text")
      this.endElem.setAttribute("type", "text")
      
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

  const DATE_TIME_EXP = /([\d]{4}\-[\d]{2}\-[\d]{2})T([\d]{2}\:[\d]{2})/

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

      let value = input.value,
        hasValue = value.trim().length > 0,
        date = null,
        time = null
      
      if (hasValue && DATE_TIME_EXP.test(value)) {
        date = value.replace(DATE_TIME_EXP, "$1")
        time = value.replace(DATE_TIME_EXP, "$2")
      }
      
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
      inDate.oninput = dateChange;

      if (date)
        inDate.value = date

      // check if date-min and date-max are set
      let {dateMin, dateMax} = input.dataset
      if (dateMin)
        inDate.dataset.dateMin = dateMin
      if (dateMax)
        inDate.dataset.dateMax = dateMax

      // create our new time input
      let inTime = document.createElement("input")
      inTime.type = checks.time ? "time" : "text"
      inTime.placeholder = "Time"
      inTime.oninput = timeChange;

      if (time)
        inTime.value = time;
      
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