(function(window, document) {
  window.Autogrow = function (textarea) {
    this.el = textarea

    this.handleFocus = this.handleFocus.bind(this)
    this.handleInput = this.handleInput.bind(this)

    this.el.addEventListener('focus', this.handleFocus)
    this.el.addEventListener('input', this.handleInput)
  }

  Autogrow.prototype.handleFocus = function (event) {
    this.el.removeEventListener('focus', this.handleFocus)
    const savedValue = this.el.value
    this.el.rows = this.el.rows || this.el.getAttribute('data-min-rows') || 1
    this.el.value = ''
    this.baseScrollHeight = this.el.scrollHeight
    this.el.value = savedValue
  }

  Autogrow.prototype.handleInput = function (event) {
    const minRows = this.el.getAttribute('data-min-rows') || 1
    this.el.rows = minRows // zero out

    const lineHeight = parseInt(window.getComputedStyle(this.el, null).lineHeight, 10)
    const rows = Math.ceil((this.el.scrollHeight - this.baseScrollHeight) / lineHeight)
    this.el.rows = minRows + rows
  }

  // Bootstrap
  function setup () {
    Array.from(document.querySelectorAll('textarea.js-autogrow'))
      .forEach(function (textarea) { new Autogrow(textarea) })
  }
  if (document.readyState !== 'loading') setup()
  else document.addEventListener('DOMContentLoaded', setup)
})(window, document)
