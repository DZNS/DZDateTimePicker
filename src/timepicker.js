((glob) => {

  const measure = (fn = function() {}) => new Promise((resolve, reject) => {
     window.requestAnimationFrame(() => {
      const retval = fn()
      resolve(retval)
    })
  })

  const mutate = (fn = function() {}) => new Promise((resolve, reject) => {
    window.requestAnimationFrame(() => {
      const retval = fn()
      resolve(retval)
    })
  })

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

      let markup = `<div id="dz-timer" class="inline-container" role="dialog" aria-lable="Time picker">
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
