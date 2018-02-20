function setup() {
  // Recaptcha
  Array.from(document.querySelectorAll('.js-new-comment')).forEach(function (form) {
    form.__recaptcha_widget_id = grecaptcha.render(
      form.querySelector('.new-comment__captcha'),
      { callback: function (response) { postComment(form) } }
    )
    form.elements['fields[message]'].addEventListener('input', onInputMessage)
    form.addEventListener('submit', onNewCommentSubmit)
    form.querySelector('[type="submit"]').removeAttribute('disabled')
  })

  // Add reply buttons
  Array.from(document.querySelectorAll('.comment:not(.is-reply)')).forEach(function (comment) {
    const replies = comment.querySelector('.comment__replies')
    const footer = document.createElement('footer')
    footer.classList.add('comment__footer')
    const button = document.createElement('button')
    button.classList.add('unstyled', 'comment__reply', 'hidden-link')
    button.innerText = 'Reply'
    button.addEventListener('click', function (event) {
      event.preventDefault()
      if (button.innerText === 'Reply') {
        replyTo(comment)
        button.innerText = 'Cancel reply'
      } else {
        cancelReply(comment)
        button.innerText = 'Reply'
      }
    })
    footer.appendChild(button)

    let appendingTo = comment;
    if (replies) appendingTo = replies.querySelector('.comment:last-of-type')
    appendingTo.querySelector('.comment__toplevel').appendChild(footer)
  })
}

function onInputMessage(event) {
  const someValid = Array.from(document.querySelectorAll('.js-new-comment:not([hidden]) .new-comment__message'))
    .some(function(message) { return message.validity.valid })
  toggleRecaptchaBadge(someValid)
}

function onNewCommentSubmit(event) {
  event.preventDefault()
  const form = event.target

  if (grecaptcha.getResponse(form.__recaptcha_widget_id)) {
    postComment(form)
  } else if (grecaptcha) {
    grecaptcha.execute(form.__recaptcha_widget_id)
  }
}

function toggleRecaptchaBadge(state) {
  const badge = document.querySelector('.grecaptcha-badge:not([data-style="none"])')
  if (!badge) return
  if (state) badge.parentNode.removeAttribute('hidden')
  else badge.parentNode.setAttribute('hidden', 'hidden')
}

function postComment(form) {
  const params = Array.from(form.elements).reduce(function (params, control) {
    if (!control.name) return params
    if (control.type === 'checkbox' && !control.checked) return params
    return params.concat([encodeURIComponent(control.name) + '=' + encodeURIComponent(control.value)])
  }, [])
  return fetch(form.getAttribute('action') + '?' + params.join('&'), {
    method: form.getAttribute('method') || 'POST'
  })
    .then(function (response) {
      if (!response.ok) throw response
      console.log('submitted')
    })
}

function replyTo(comment) {
  // "Collapse" previous replies
  document.querySelectorAll('.comment__reply').forEach(function (button) {
    button.innerText = 'Reply'
  })
  
  // Init form
  const form = document.getElementById('reply-form')
  form.elements['fields[replying_to]'].value = comment.id
  form.removeAttribute('hidden')
  comment.appendChild(form)
  form.elements['fields[message]'].focus()
}

function cancelReply(comment) {
  const form = document.getElementById('reply-form')
  form.setAttribute('hidden', 'hidden')
  form.elements['fields[message]'].value = ''
  form.elements['fields[message]'].blur()
}
