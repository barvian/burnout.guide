;(function(window, document) {
  window.__subscribedParents = []
  window.Subscription = function (el) {
    this.el = el

    this.subscribe = this.subscribe.bind(this)
    this.serialize = this.serialize.bind(this)

    this.captcha = this.el.querySelector('.captcha')
    this.recaptcha_widget_id = grecaptcha.render(this.captcha, {
      callback: this.subscribe
    })
    this.wrapper = this.el.querySelector('fieldset')
    this.email = this.el.elements['fields[email]']
    this.parent = this.el.elements['options[parent]']
    this._originalParent = this.parent.value
    this.submit = this.el.querySelector('[type="submit"]')

    this.el.addEventListener('submit', this.subscribe)
    this.submit.removeAttribute('disabled')
  }

  Subscription.prototype.subscribe = function (event) {
    if (event && event.preventDefault) event.preventDefault()
    const grecaptchaResponse = grecaptcha.getResponse(this.recaptcha_widget_id)
    if (!grecaptchaResponse) {
      grecaptcha.execute(this.recaptcha_widget_id)
      return
    }

    const body = this.serialize()
    this.submit.classList.add('is-loading')
    this.wrapper.disabled = true
    
    const self = this
    return fetch(this.el.getAttribute('action'), {
      method: this.el.getAttribute('method') || 'post',
      body: body
    })
      .then(function (response) {
        if (!response.ok) throw response
        return response.json()
      })
      .then(function (response) {
        if (!response.success) throw response
        self.el.classList.add('did-subscribe')
        __subscribedParents.push(self.parent.value)
      })
      .then(function () {
        self.submit.classList.remove('is-loading')
        self.wrapper.disabled = false
      })
      .catch(function (error) {
        self.submit.classList.remove('is-loading')
        self.submit.classList.add('did-error')
      })
  }

  Subscription.prototype.setParent = function (id) {
    const newParent = id == null ? this._originalParent : id
    this.parent.value = newParent
    if (__subscribedParents.includes(newParent)) {
      this.el.classList.add('did-subscribe')
    } else {
      this.el.classList.remove('did-subscribe')
    }
  }

  Subscription.prototype.serialize = function () {
    const data = new URLSearchParams()
    for (const pair of new FormData(this.el)) {
      data.append(pair[0], pair[1])
    }
    return data
  }

  // Bootstrap
  Subscription.bootstrap = function () {
    return Array.from(document.querySelectorAll('.js-subscription'))
      .map(function (el) { return new Subscription(el) })
  }
})(window, document);
