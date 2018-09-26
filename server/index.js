'use strict'

const express = require('express')
const corser = require('corser')
const http = require('http')
const ip = require('ip')

const admin = require('firebase-admin')
const serviceAccount = require('./serviceAccountKey')
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://chat-sdk-v4.firebaseio.com"
})
const db = admin.database()

const app = express()
app.use(corser.create())

const getData = ref => ref.once('value').then(s => s.val())

app.get('/:root', (req, res) => {
  getData(db.ref(req.params.root))
    .then(data => res.send(data))
    .catch(err => res.send(err.message))
})

app.get('/:root/online', (req, res) => {
  getData(db.ref(req.params.root).child('online'))
    .then(data => res.send(data))
    .catch(err => res.send(err.message))
})

/////////////////////////////////////
////////////// THREADS //////////////
/////////////////////////////////////

app.get('/:root/threads', (req, res) => {
  const ref = db.ref(req.params.root).child('threads')
  getData(ref)
    .then(data => res.send(data))
    .catch(err => res.send(err.message))
})

app.get('/:root/public-threads', (req, res) => {
  const ref = db.ref(req.params.root).child('public-threads')
  getData(ref)
    .then(data => res.send(data))
    .catch(err => res.send(err.message))
})

app.get('/:root/threads/:tid', (req, res) => {
  const ref = db.ref(req.params.root).child('threads').child(req.params.tid)
  getData(ref)
    .then(data => res.send(data))
    .catch(err => res.send(err.message))
})

app.get('/:root/threads/:tid/meta', (req, res) => {
  const ref = db.ref(req.params.root).child('threads').child(req.params.tid).child(meta)
  getData(ref)
    .then(data => res.send(data))
    .catch(err => res.send(err.message))
})

app.get('/:root/threads/:tid/users', (req, res) => {
  const ref = db.ref(req.params.root).child('threads').child(req.params.tid).child('users')
  getData(ref)
    .then(data => res.send(data))
    .catch(err => res.send(err.message))
})

app.get('/:root/threads/:tid/users/:uid', (req, res) => {
  const ref = db.ref(req.params.root).child('threads').child(req.params.tid).child('users').child(req.params.uid)
  getData(ref)
    .then(data => res.send(data))
    .catch(err => res.send(err.message))
})

/////////////////////////////////////
/////////////// USERS ///////////////
/////////////////////////////////////

const getUserRef = params => {
  let ref = db.ref(params.root).child('users')
  if (params.uid) {
    ref = ref.child(params.uid)
  }
  if (params.meta_key) {
    ref = ref.child('meta').child(params.meta_key)
  }
  return ref
}

app.get('/:root/users', (req, res) => {
  getData(getUserRef(req.params))
    .then(data => res.send(data))
    .catch(err => res.send(err.message))
})

app.get('/:root/users/:uid', (req, res) => {
  getData(getUserRef(req.params))
    .then(data => res.send(data))
    .catch(err => res.send(err.message))
})

app.get('/:root/users/by/:filter_key/:filter_value', (req, res) => {
  const ref = getUserRef(req.params)
  ref.orderByChild('meta/' + req.params.filter_key)
    .equalTo(req.params.filter_value).once('value')
    .then(snapshot => res.send(snapshot.val()))
    .catch(err => res.send(err.message))
})

app.get('/:root/users/:uid/meta', (req, res) => {
  getData(getUserRef(req.params).child('meta'))
    .then(data => res.send(data))
    .catch(err => res.send(err.message))
})

app.get('/:root/users/:uid/meta/:meta_key', (req, res) => {
  getData(getUserRef(req.params))
    .then(data => res.send(data))
    .catch(err => res.send(err.message))
})

app.get('/:root/users/:uid/threads', (req, res) => {
  getData(getUserRef(req.params).child('threads'))
    .then(data => res.send(data))
    .catch(err => res.send(err.message))
})

/////////////////////////////////////

const port = Number(process.env.PORT || 3000)
http.createServer(app).listen(port, ip.address(), err => {
  if (err) {
    console.error(err)
    process.exit(1)
  } else {
    console.log(`Server running on http://${ip.address()}:${port}`)
  }
})
