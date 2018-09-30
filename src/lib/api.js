const state = {
  backend: null
}

const init = backend => state.backend = backend

// Moderation

const fetchFlaggedMessages = () => {
  return fetch(state.backend + '/flagged-messages')
}

const flagMessage = (tid, mid) => {
  return fetch(state.backend + '/flag-message/' + tid + '/' + mid, { method: 'PUT' })
}

const unflagMessage = mid => {
  return fetch(state.backend + '/unflag-message/' + mid, { method: 'PUT' })
}

const deleteFlaggedMessage = mid => {
  return fetch(state.backend + '/flagged-messages/' + mid, { method: 'DELETE' })
}

// Users

const fetchUsers = () => {
  return fetch(state.backend + '/users')
}

const fetchUser = uid => {
  return fetch(state.backend + '/users/' + uid)
}

const fetchUserMeta = uid => {
  return fetch(state.backend + '/users/' + uid + '/meta')
}

const setUserMeta = (uid, meta) => {
  return fetch(state.backend + '/users/' + uid + '/meta', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify(meta)
  })
}

const deleteUser = uid => {
  return fetch(state.backend + '/users/' + uid, { method: 'DELETE' })
}

// Threads

const fetchThreads = () => {
  return fetch(state.backend + '/threads')
}

const fetchPublicThreads = () => {
  return fetch(state.backend + '/public-threads')
}

const fetchThread = tid => {
  return fetch(state.backend + '/threads/' + tid)
}

const fetchThreadMeta = tid => {
  return fetch(state.backend + '/threads/' + tid + '/meta')
}

const setThreadMeta = (tid, meta) => {
  return fetch(state.backend + '/threads/' + tid + '/meta', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify(meta)
  })
}

const deleteThread = tid => {
  return fetch(state.backend + '/threads/' + tid, { method: 'DELETE' })
}

const deleteThreadMessage = (tid, mid) => {
  return fetch(state.backend + '/threads/' + tid + '/messages/' + mid, { method: 'DELETE' })
}

export default {
  init,

  fetchFlaggedMessages,
  flagMessage,
  unflagMessage,
  deleteFlaggedMessage,

  fetchUsers,
  fetchUser,
  fetchUserMeta,
  setUserMeta,
  deleteUser,

  fetchThreads,
  fetchPublicThreads,
  fetchThread,
  fetchThreadMeta,
  setThreadMeta,
  deleteThreadMessage,
  deleteThread
}
