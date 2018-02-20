(function(window, document) {
  window.NewComment = function (el, options) {
    this.el = el
    this.options = options

    this.handleBodyInput = this.handleBodyInput.bind(this)
    this.toggleRecaptchaBadge = this.toggleRecaptchaBadge.bind(this)
    this.post = this.post.bind(this)
    this.subscribe = this.subscribe.bind(this)

    this.form = this.el.querySelector('.new-comment__form')
    this.captcha = this.form.querySelector('.new-comment__captcha')
    this.recaptcha_widget_id = grecaptcha.render(this.captcha, {
      callback: this.post
    })
    this.body = this.form.querySelector('.new-comment__message')
    this.replyingTo = this.form.elements['fields[replying_to]']
    this.submit = this.form.querySelector('[type="submit"]')
    this.success = this.el.querySelector('.new-comment__success')
    this.subscribeButton = this.success.querySelector('[type="submit"]')

    this.body.addEventListener('input', this.handleBodyInput)
    this.form.addEventListener('submit', this.post)
    this.success.addEventListener('submit', this.subscribe)
    window.addEventListener('new-comment-subscribe', this.handleSubscribe)

    this.submit.removeAttribute('disabled')
    this.subscribeButton.removeAttribute('disabled')
  }

  NewComment.prototype.handleBodyInput = function (event) {
    if (this.options.onBodyInput) {
      this.options.onBodyInput(event, this)
    }
  }

  NewComment.prototype.post = function (event) {
    if (event && event.preventDefault) event.preventDefault()
    const grecaptchaResponse = grecaptcha.getResponse(this.recaptcha_widget_id)
    if (!grecaptchaResponse) {
      grecaptcha.execute(this.recaptcha_widget_id)
      return
    }
    this.success.elements['g-recaptcha-response'].value = grecaptchaResponse

    return fetch(this.form.getAttribute('action'), {
      method: this.form.getAttribute('method') || 'post',
      body: buildParamsForForm(this.form)
    })
      .then(function (response) {
        if (!response.ok) throw response
        return response.json()
      })
      .then(function (response) {
        if (!response.success) throw response
        this.el.classList.add('did-submit')
        const customEvent = new CustomEvent('new-comment-post', {
          detail: { newComment: this, response: response }
        })
        window.dispatchEvent(customEvent)
      })
      .catch(function (error) {
        console.log('error', error)
      })
  }

  NewComment.prototype.subscribe = function (event) {
    if (event && event.preventDefault) event.preventDefault()

    return fetch(this.success.getAttribute('action'), {
      method: this.success.getAttribute('method') || 'post',
      body: buildParamsForForm(this.success)
    })
      .then(function (response) {
        if (!response.ok) throw response
        return response.json()
      })
      .then(function (response) {
        if (!response.success) throw response
        const customEvent = new CustomEvent('new-comment-subscribe', {
          detail: { newComment: this, response: response }
        })
        window.dispatchEvent(customEvent)
      })
      .catch(function (error) {
        console.log('subscription error', error)
      })
  }

  NewComment.prototype.handleSubscribe = function (event) {
    this.success.classList.add('did-subscribe')
  }

  NewComment.prototype.reset = function () {
    this.body.value = ''
    this.body.blur()
  }

  NewComment.prototype.replyTo = function (id) {
    this.replyingTo.value = id
    this.el.classList.remove('did-submit')
  }

  NewComment.prototype.toggleRecaptchaBadge = function (state) {
    const badge = this.el.querySelector('.grecaptcha-badge:not([data-style="none"])')
    if (!badge) return
    if (state) this.captcha.removeAttribute('hidden')
    else this.captcha.setAttribute('hidden', 'hidden')
  }

  function buildParamsForForm (el) {
    const data = new URLSearchParams()
    for (const pair of new FormData(el)) {
      data.append(pair[0], pair[1])
    }
    return data
  }

  // Bootstrap
  NewComment.bootstrap = function (options) {
    return Array.from(document.querySelectorAll('.js-new-comment'))
      .map(function (el) { return new NewComment(el, options) })
  }
})(window, document)
