const homePage = function (
  { 
    messages = [],
    csrfToken = undefined,
    username = undefined
  }
) {
  const signupForm = `
    <div>
      <h2>Sign Up</h2>
      <form method="post" action="/signup">
        <input type="hidden" name="_csrf" value="${csrfToken()}">
        <label>username:</label>
        <input name="username" type="text" />
        <label>password:</label>
        <input name="password" type="password" />
        <button>login</submit>
      </form>
    </div>
  `;
  const loginForm = `
    <div>
      <h2>Sign In</h2>
      <form method="post" action="/login">
        <input type="hidden" name="_csrf" value="${csrfToken()}">
        <label>username:</label>
        <input name="username" type="text"/>
        <label>password:</label>
        <input name="password" type="password"/>
        <button>login</button>
      </form>
    </div>
  `;
  const logoutForm = `
    <form method="post" action="/logout">
      <input type="hidden" name="_csrf" value="${csrfToken()}">
      <button>logout</button>
    </form>
  `;
  const newMessageForm = `
    <form method="post" action="/messages">
      <input type="hidden" name="_csrf" value="${csrfToken()}">
      <label>message:</label>
      <input name="message" type="text"/>
      <button>send</button>
    </form>
  `;

  const messageDelete = (message) => `
    <form method="post" action="/messages/delete">
      <input type="hidden" name="_csrf" value="${csrfToken()}">
      <input type="hidden" name="username" value="${message.username}" />
      <input type="hidden" name="value" value="${message.value}" />
      <input type="hidden" name="key" value="${message.key}" />
      <button>delete</button>
    </form>
  `;

  const messageList = function() {
    return messages.map((message) => `<li>
      ${message.username !== username 
        ? ''
        : messageDelete(message)
      }
      <b>@${message.username}</b> : ${message.value}
    </li>`).join('')
  }

  return `
    <!doctype html>
    <html lang="fr">
    <head>
      <meta charset="utf-8">
      <title>Demo App</title>
    </head>
      <body>
        <h1>HTML page over TLS</h1>
          <div>
          ${ username === undefined ? loginForm : logoutForm }
          ${ username === undefined ? signupForm : '' }
        </div>
        <h1>Messages</h1>
        <div>
          <ul>
            ${ messageList() }
          </ul>
        </div>
        <div>
          ${ username === undefined ? "" : newMessageForm }
        </div>
      </body>
    </head>
  `;
};

module.exports = homePage
