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

window.wait = window.wait || async function (milliseconds = 0) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve();
        }, milliseconds);
    })
};

// @prepros-append ./datepicker.js
// @prepros-append ./timepicker.js
// @prepros-append ./rangepicker.js
// @prepros-append ./autohook.js
