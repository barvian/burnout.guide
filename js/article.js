function setup() {
  const comment = new NewComment(document.getElementById('comment'), {
    onBodyInput: onBodyInput
  })
  const reply = new NewComment(document.getElementById('reply'), {
    onBodyInput: onBodyInput
  })
  function onBodyInput(event, newComment) {
    const someValid = comment.body.validity.valid ||
      reply.body.validity.valid
    comment.toggleRecaptchaBadge(someValid)
    reply.toggleRecaptchaBadge(someValid)
  }

  Comment.bootstrap({ reply: reply })
  Autogrow.bootstrap()
}
