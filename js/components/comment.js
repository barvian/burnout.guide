(function(window, document) {
  window.Comment = function (el, options) {
    this.el = el
    this.options = options
    this._replying = false

    this.handleReplyClick = this.handleReplyClick.bind(this)
    this.handleOtherReplyClick = this.handleOtherReplyClick.bind(this)
    this.handleNewCommentPost = this.handleNewCommentPost.bind(this)
    this.cancel = this.cancel.bind(this)

    this.replies = this.el.querySelector('.comment__replies')
    this.toplevel = this.el.querySelector('.comment__toplevel')

    if (
      (!this.el.classList.contains('is-reply')) &&
      this.options.reply
    ) {
      this.addReplyButton()
    }

    window.addEventListener('comment-reply-click', this.handleOtherReplyClick)
    window.addEventListener('new-comment-post', this.handleNewCommentPost)
  }

  Comment.prototype.addReplyButton = function () {
    this.footer = document.createElement('footer')
    this.footer.classList.add('comment__footer')
    this.replyButton = document.createElement('button')
    this.replyButton.classList.add('unstyled', 'comment__reply', 'hidden-link')
    this.replyButton.innerText = 'Reply'
    this.replyButton.addEventListener('click', this.handleReplyClick)
    this.footer.appendChild(this.replyButton)

    this.el.appendChild(this.footer)
  }

  Comment.prototype.handleReplyClick = function (event) {
    // Propagate so others can adjust
    const customEvent = new CustomEvent('comment-reply-click', {
      detail: { comment: this, originalEvent: event }
    })
    window.dispatchEvent(customEvent)

    if (this._replying) this.cancel()
    else this.reply()
  }

  Comment.prototype.handleOtherReplyClick = function (event) {
    if (event.detail.comment === this) return
    if (this._replying) this.cancel()
  }

  Comment.prototype.handleNewCommentPost = function (event) {
    if (this._replying) this.cancel(true)
  }

  Comment.prototype.reply = function () {
    const reply = this.options.reply
    reply.replyTo(this.el.id)
    reply.el.removeAttribute('hidden')
    this.el.appendChild(reply.el)
    reply.body.focus()
    this.replyButton.innerText = 'Cancel reply'
    this._replying = true
  }

  Comment.prototype.cancel = function (stayVisible) {
    const reply = this.options.reply
    if (!stayVisible) reply.el.setAttribute('hidden', 'hidden')
    reply.reset()
    this.replyButton.innerText = 'Reply'
    this._replying = false
  }

  // Bootstrap
  Comment.bootstrap = function (options) {
    return Array.from(document.querySelectorAll('.js-comment'))
      .map(function (el) { return new Comment(el, options) })
  }
})(window, document)
