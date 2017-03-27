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
        slice.call(timer.children).forEach((item) => {
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

      let triggers = slice.call(document.querySelectorAll('.timer-trigger'))
      
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
