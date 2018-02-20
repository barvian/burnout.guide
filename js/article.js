---
---

{% include_relative lib/textarea-autogrow/textarea-autogrow.js %}

function onLoadRecaptcha() {
  // New comment form
  Array.from(document.querySelectorAll('.js-new-comment')).forEach(function (form) {
    form.__recaptcha_widget_id = grecaptcha.render(form.querySelector('.new-comment__captcha'), {
      callback: function (response) { onNewCommentCaptcha(response, form) }
    })
    form.addEventListener('submit', onNewCommentSubmit)
    form.querySelector('[type="submit"]').removeAttribute('disabled')
  })
}

function onNewCommentSubmit(event) {
  event.preventDefault()
  const form = event.target

  grecaptcha.execute(form.__recaptcha_widget_id)
}

function onNewCommentCaptcha(response, form) {
  fetch('https://www.google.com/recaptcha/api/siteverify?secret={{site.secrets.recaptcha.secret}}&response=' + response, {
    method: 'POST'
  })
    .then(function (response) {
      if (!response.ok) throw response
      return response.json()
    })
    .then(function (response) {
      const params = Array.from(form.elements).reduce(function (params, control) {
        if (!control.name || control.name.includes('recaptcha')) return params
        if (control.type === 'checkbox' && !control.checked) return params
        return params.concat([encodeURIComponent(control.name) + '=' + encodeURIComponent(control.value)])
      }, [])
      return fetch(form.getAttribute('action') + '?' + params.join('&'), {
        method: form.getAttribute('method') || 'GET'
      })
    })
    .then(function (response) {
      if (!response.ok) throw response
      console.log('submitted')
    })
}

// Expanding textboxes
Array.from(document.querySelectorAll('textarea[data-grow]'))
  .forEach(function (textarea) { new Autogrow(textarea) })
