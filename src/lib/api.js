import xhr from './xhr'
import push from './push'

const state = {
  backend: null,
  rootPath: null,
  push: null
}

// Moderation

const fetchFlaggedMessages = () => {
  return state.push.subscribe(state.backend, state.rootPath, 'flagged-messages')
  return xhr.get([state.backend, state.rootPath, 'flagged-messages'])
}

const flagMessage = (tid, mid) => {
  return xhr.put([state.backend, state.rootPath, 'flag-message', tid, mid])
}

const unflagMessage = mid => {
  return xhr.put([state.backend, state.rootPath, 'unflag-message', mid])
}

const deleteFlaggedMessage = mid => {
  return xhr.delete([state.backend, state.rootPath, 'flagged-messages', mid])
}

// Users

const fetchOnline = () => {
  return state.push.subscribe(state.backend, state.rootPath, 'online')
  return xhr.get([state.backend, state.rootPath, 'online'])
}

const fetchUsers = () => {
  return state.push.subscribe(state.backend, state.rootPath, 'users')
  return xhr.get([state.backend, state.rootPath, 'users'])
}

const fetchUser = uid => {
  return state.push.subscribe(state.backend, state.rootPath, 'users', uid)
  return xhr.get([state.backend, state.rootPath, 'users', uid])
}

const fetchUserMeta = uid => {
  return state.push.subscribe(state.backend, state.rootPath, 'users', uid, 'meta')
  return xhr.get([state.backend, state.rootPath, 'users', uid, 'meta'])
}

const setUserMeta = (uid, meta) => {
  return xhr.post([state.backend, state.rootPath, 'users', uid, 'meta'], meta)
}

const deleteUser = uid => {
  return xhr.delete([state.backend, state.rootPath, 'users', uid])
}

// Threads

const fetchThreads = () => {
  return state.push.subscribe(state.backend, state.rootPath, 'threads')
  return xhr.get([state.backend, state.rootPath, 'threads'])
}

const fetchPublicThreads = () => {
  return state.push.subscribe(state.backend, state.rootPath, 'public-threads')
  return xhr.get([state.backend, state.rootPath, 'public-threads'])
}

const fetchThread = tid => {
  return state.push.subscribe(state.backend, state.rootPath, 'threads', tid)
  return xhr.get([state.backend, state.rootPath, 'threads', tid])
}

const fetchThreadMeta = tid => {
  return state.push.subscribe(state.backend, state.rootPath, 'threads', tid, 'meta')
  return xhr.get([state.backend, state.rootPath, 'threads', tid, 'meta'])
}

const setThreadMeta = (tid, meta) => {
  return xhr.post([state.backend, state.rootPath, 'threads', tid, 'meta'], meta)
}

const deleteThread = tid => {
  return xhr.delete([state.backend, state.rootPath, 'threads', tid])
}

const deleteThreadMessage = (tid, mid) => {
  return xhr.delete([state.backend, state.rootPath, 'threads', tid, 'messages', mid])
}

export default async (backend, rootPath) => {
  state.backend = backend
  state.rootPath = rootPath  
  state.push = await push()
  return {
    setBackend: value => state.backend = value,
    setRootPath: value => state.rootPath = value,
    getBackend: () => state.backend,
    getRootPath: () => state.rootPath,
    isReady: () => typeof state.backend === 'string'
      && typeof state.rootPath === 'string'
      && state.backend.length > 0
      && state.rootPath.length > 0,

    fetchFlaggedMessages,
    flagMessage,
    unflagMessage,
    deleteFlaggedMessage,

    fetchOnline,
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
}
