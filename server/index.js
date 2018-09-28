'use strict'

const bodyParser = require('body-parser')
const express = require('express')
const corser = require('corser')
const http = require('http')
const ip = require('ip')

const firebaseApi = require('./firebase-api')
const api = firebaseApi()

const app = express()
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(corser.create({
  methods: corser.simpleMethods.concat(['PUT', 'DELETE'])
}))

app.get('/:root/online', (req, res) => {
  api.fetchOnline(req.params.root)
    .then(data => {
      if (data) res.send(data)
      else res.sendStatus(404)
    })
    .catch(err => res.send(err.message || err))
})

// Moderation

app.get('/:root/flagged-messages', (req, res) => {
  api.fetchFlaggedMessages(req.params.root)
    .then(data => {
      if (data) res.send(data)
      else res.sendStatus(404)
    })
    .catch(err => res.send(err.message || err))
})

app.put('/:root/flag-message/:tid/:mid', (req, res) => {
  api.flagMessage(req.params.root, req.params.mid, req.params.tid)
    .then(data => {
      if (data) res.send(data)
      else res.sendStatus(404)
    })
    .catch(err => res.send(err.message || err))
})

app.put('/:root/unflag-message/:mid', (req, res) => {
  api.unflagMessage(req.params.root, req.params.mid)
    .then(() => res.sendStatus(200))
    .catch(() => res.sendStatus(500))
})

app.delete('/:root/flagged-messages/:mid', (req, res) => {
  api.deleteFlaggedMessage(req.params.root, req.params.mid)
    .then(() => res.sendStatus(200))
    .catch(() => res.sendStatus(500))
})

// Threads

app.get('/:root/threads', (req, res) => {
  api.fetchThreads(req.params.root)
    .then(data => {
      if (data) res.send(data)
      else res.sendStatus(404)
    })
    .catch(err => res.send(err.message || err))
})

app.get('/:root/public-threads', (req, res) => {
  api.fetchPublicThreads(req.params.root)
    .then(data => {
      if (data) res.send(data)
      else res.sendStatus(404)
    })
    .catch(err => res.send(err.message || err))
})

app.get('/:root/threads/:tid', (req, res) => {
  api.fetchThread(req.params.root, req.params.tid)
    .then(data => {
      if (data) res.send(data)
      else res.sendStatus(404)
    })
    .catch(err => res.send(err.message || err))
})

app.get('/:root/threads/:tid/meta', (req, res) => {
  api.fetchThreadMeta(req.params.root, req.params.tid)
    .then(data => {
      if (data) res.send(data)
      else res.sendStatus(404)
    })
    .catch(err => res.send(err.message || err))
})

app.get('/:root/threads/:tid/messages', (req, res) => {
  api.fetchThreadMessages(req.params.root, req.params.tid)
    .then(data => {
      if (data) res.send(data)
      else res.sendStatus(404)
    })
    .catch(err => res.send(err.message || err))
})

app.get('/:root/threads/:tid/messages/:mid', (req, res) => {
  api.fetchThreadMessage(req.params.root, req.params.tid, req.params.mid)
    .then(data => {
      if (data) res.send(data)
      else res.sendStatus(404)
    })
    .catch(err => res.send(err.message || err))
})

app.get('/:root/threads/:tid/users', (req, res) => {
  api.fetchThreadUsers(req.params.root, req.params.tid)
    .then(data => {
      if (data) res.send(data)
      else res.sendStatus(404)
    })
    .catch(err => res.send(err.message || err))
})

app.get('/:root/threads/:tid/users/:uid', (req, res) => {
  api.fetchThreadUser(req.params.root, req.params.tid, req.params.uid)
    .then(data => {
      if (data) res.send(data)
      else res.sendStatus(404)
    })
    .catch(err => res.send(err.message || err))
})

app.post('/:root/threads/:tid/meta', (req, res) => {
  api.updateThreadMeta(req.params.root, req.params.tid, req.body)
    .then(() => res.sendStatus(200))
    .catch(() => res.sendStatus(500))
})

app.delete('/:root/threads/:tid/messages/:mid', (req, res) => {
  api.deleteThreadMessage(req.params.root, req.params.tid, req.params.mid)
    .then(() => res.sendStatus(200))
    .catch(() => res.sendStatus(500))
})

app.delete('/:root/threads/:tid/users/:uid', (req, res) => {
  api.deleteThreadUser(req.params.root, req.params.tid, req.params.uid)
    .then(() => res.sendStatus(200))
    .catch(() => res.sendStatus(500))
})

app.delete('/:root/threads/:tid', (req, res) => {
  api.deleteThread(req.params.root, req.params.tid)
    .then(() => res.sendStatus(200))
    .catch(() => res.sendStatus(500))
})

// Users

app.get('/:root/users', (req, res) => {
  api.fetchUsers(req.params.root)
    .then(data => {
      if (data) res.send(data)
      else res.sendStatus(404)
    })
    .catch(err => res.send(err.message || err))
})

app.get('/:root/users/:uid', (req, res) => {
  api.fetchUser(req.params.root, req.params.uid)
    .then(data => {
      if (data) res.send(data)
      else res.sendStatus(404)
    })
    .catch(err => res.send(err.message || err))
})

app.get('/:root/users/by/:index/:value', (req, res) => {
  api.fetchUsersByMetaValue(req.params.root, req.params.index, req.params.value)
    .then(data => {
      if (data) res.send(data)
      else res.sendStatus(404)
    })
    .catch(err => res.send(err.message || err))
})

app.get('/:root/users/:uid/meta', (req, res) => {
  api.fetchUserMeta(req.params.root, req.params.uid)
    .then(data => {
      if (data) res.send(data)
      else res.sendStatus(404)
    })
    .catch(err => res.send(err.message || err))
})

app.get('/:root/users/:uid/meta/:index', (req, res) => {
  api.fetchUserMetaValue(req.params.root, req.params.uid, req.params.index)
    .then(data => {
      if (data) res.send(data)
      else res.sendStatus(404)
    })
    .catch(err => res.send(err.message || err))
})

app.get('/:root/users/:uid/threads', (req, res) => {
  api.fetchUserThreads(req.params.root, req.params.uid)
    .then(data => {
      if (data) res.send(data)
      else res.sendStatus(404)
    })
    .catch(err => res.send(err.message || err))
})

app.post('/:root/users/:uid/meta', (req, res) => {
  api.updateUserMeta(req.params.root, req.params.uid, req.body)
    .then(() => res.sendStatus(200))
    .catch(() => res.sendStatus(500))
})

app.delete('/:root/users/:uid', (req, res) => {
  api.deleteUser(req.params.root, req.params.uid)
    .then(() => res.sendStatus(200))
    .catch(() => res.sendStatus(500))
})

const port = Number(process.env.PORT || 3000)
http.createServer(app).listen(port, ip.address(), err => {
  if (err) {
    console.error(err)
    process.exit(1)
  } else {
    console.log(`Server running on http://${ip.address()}:${port}`)
  }
})
