;(function(window, document) {
  window.NewComment = function (el) {
    this.el = el

    this.post = this.post.bind(this)
    this.serialize = this.serialize.bind(this)

    this.form = this.el.querySelector('.new-comment__form')
    this.captcha = this.form.querySelector('.captcha')
    this.recaptcha_widget_id = grecaptcha.render(this.captcha, {
      callback: this.post
    })
    this.body = this.form.querySelector('.new-comment__message')
    this.replyingTo = this.form.elements['fields[replying_to]']
    this.wrapper = this.form.querySelector('.new-comment__wrapper')
    this.submit = this.form.querySelector('[type="submit"]')
    this.subscription = new Subscription(this.el.querySelector('.js-subscription'))

    this.form.addEventListener('submit', this.post)
    this.submit.removeAttribute('disabled')
  }

  NewComment.prototype.post = function (event) {
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
    return fetch(this.form.getAttribute('action'), {
      method: this.form.getAttribute('method') || 'post',
      body: body
    })
      .then(function (response) {
        if (!response.ok) throw response
        return response.json()
      })
      .then(function (response) {
        if (!response.success) throw response
        self.el.classList.add('did-submit')
        const customEvent = new CustomEvent('new-comment-post', {
          detail: { newComment: self, response: response }
        })
        window.dispatchEvent(customEvent)
      })
      .then(function () {
        self.submit.classList.remove('is-loading')
        this.wrapper.disabled = false
      })
      .catch(function (error) {
        self.submit.classList.remove('is-loading')
        self.submit.classList.add('did-error')
      })
  }

  NewComment.prototype.reset = function () {
    this.body.value = ''
    this.body.blur()
  }

  NewComment.prototype.replyTo = function (id) {
    this.reset()
    this.replyingTo.value = id
    this.el.classList.remove('did-submit')
    this.subscription.setParent(id)
  }

  NewComment.prototype.serialize = function () {
    const data = new URLSearchParams()
    for (const pair of new FormData(this.form)) {
      data.append(pair[0], pair[1])
    }
    return data
  }

  // Bootstrap
  NewComment.bootstrap = function () {
    return Array.from(document.querySelectorAll('.js-new-comment'))
      .map(function (el) { return new NewComment(el) })
  }
})(window, document);
