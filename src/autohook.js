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