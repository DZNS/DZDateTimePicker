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

      this.startController = new DZDatePicker('start'+time)
      this.endController = new DZDatePicker('end'+time)

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

})(typeof module === "undefined" ? window : module)

//# sourceMappingURL=rangepicker-dist.js.map