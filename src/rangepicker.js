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
        // this needs to be adjusted such that
        // the min-date also includes the selected date
        // for single day ranges.
        
        const selected = new Date(val);

        const newMax = new Date(selected.setDate(selected.getDate() - 1));

        const month = DatePicker.zeroPaddedFormatMonth(newMax);
        const dateStr = DatePicker.zeroPaddedFormatDate(newMax);
        
        this.endElem.dataset.dateMin = `${newMax.getFullYear()}-${month}-${dateStr}`
      }

    }
  }

  if (glob.hasOwnProperty('exports'))
    glob.exports = Object.assign({}, glob.exports, RangePicker)
  else
    glob.RangePicker = RangePicker

})(typeof module === "undefined" ? window : module);
