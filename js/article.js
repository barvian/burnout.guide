---
---

{% include_relative lib/textarea-autogrow/textarea-autogrow.js %}

function onNewCommentSubmit(event) {
  event.preventDefault()
  const form = event.target

  window.onNewCommentCaptcha = function(response) {
    fetch('https://www.google.com/recaptcha/api/siteverify?secret={{site.secrets.recaptcha.secret}}&response=' + response, {
      method: 'POST'
    })
      .then(function(response) {
        if (!response.ok) throw response
        return response.json()
      })
      .then(function(response) {
        const params = Array.from(form.elements).reduce(function(params, control) {
          if (!control.name) return params
          return params.concat([encodeURIComponent(control.name)+'='+encodeURIComponent(control.value)])
        }, [])
        return fetch(form.getAttribute('action')+'?'+params.join('&'), {
          method: form.getAttribute('method') || 'GET'
        })
      })
      .then(function(response) {
        if (!response.ok) throw response
        console.log('submitted')
      })
  }
  grecaptcha.execute()
}

// New comment form
Array.from(document.querySelectorAll('.js-new-comment'))
  .forEach(function(form) { form.addEventListener('submit', onNewCommentSubmit) })

// Expanding textboxes
Array.from(document.querySelectorAll('textarea[data-grow]'))
  .forEach(function(textarea) { new Autogrow(textarea) })