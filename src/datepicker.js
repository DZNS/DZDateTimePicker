((glob) => {

  const prevSVG = `<svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>Previous Month</title><path d="M14.422 16.078l-1.406 1.406-6-6 6-6 1.406 1.407-4.594 4.593z" fill="#8FCB14" fill-rule="evenodd"/></svg></button>`;
  const nextSVG = `<svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>Next Month</title><path d="M8.578 16.36l4.594-4.594-4.594-4.594 1.406-1.406 6 6-6 6z" fill="#8FCB14" fill-rule="evenodd"/></svg>`;

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
console.log(evt)
        if (keyCode >= 37 && keyCode <= 40) {
          // up or down arrow keys
          const current = Number(document.activeElement.innerHTML)
          
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