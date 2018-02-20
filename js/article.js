---
---

{% include_relative components/autogrow.js %}
{% include_relative components/comment.js %}
{% include_relative components/subscription.js %}
{% include_relative components/new-comment.js %}

function setup() {
  const comment = new NewComment(document.getElementById('comment'))
  const reply = new NewComment(document.getElementById('reply'))

  const forms = [comment.form, reply.form, comment.subscription.el, reply.subscription.el]
  forms.forEach(function (form) {
    form.addEventListener('focus', showCaptchaBadge, true)
    form.addEventListener('blur', hideCaptchaBadge, true)
  })
  
  function showCaptchaBadge (event) {
    const firstVisibleBadge = document.querySelector('.grecaptcha-badge:not([data-style="none"])')
    firstVisibleBadge.parentNode.removeAttribute('hidden')
  }

  function hideCaptchaBadge(event) {
    const firstVisibleBadge = document.querySelector('.grecaptcha-badge:not([data-style="none"])')
    firstVisibleBadge.parentNode.setAttribute('hidden', 'hidden')
  }

  Comment.bootstrap({ reply: reply })
  Autogrow.bootstrap()
}
