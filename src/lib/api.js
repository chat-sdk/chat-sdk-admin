import { from } from 'rxjs'
import xhr from './xhr'
import push from './push'

const state = {
  backend: null,
  rootPath: null,
  push: null
}

const combinePathAndArgs = (path, args) => {
  if (!args || args.length === 0) return path
  for (const arg of args) {
    const index = path.indexOf(null)
    if (index >= 0) path[index] = arg
  }
  return path
}

const createFetcher = (...path) => {
  const f = (...args) => xhr.get(combinePathAndArgs(path, args))
  f.asObservable = (...args) => {
    if (state.push) {
      return state.push.subscribe(...combinePathAndArgs(path, args))
    } else {
      return from(f())
    }
  }
  return f
}

// Moderation

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

const setUserMeta = (uid, meta) => {
  return xhr.post([state.backend, state.rootPath, 'users', uid, 'meta'], meta)
}

const deleteUser = uid => {
  return xhr.delete([state.backend, state.rootPath, 'users', uid])
}

// Threads

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
  try {
    state.push = await push()
  } catch (err) {
    console.error('Push Error:', err.message || err)
  }
  return {
    setBackend: value => state.backend = value,
    setRootPath: value => state.rootPath = value,
    getBackend: () => state.backend,
    getRootPath: () => state.rootPath,
    isReady: () => typeof state.backend === 'string'
      && typeof state.rootPath === 'string'
      && state.backend.length > 0
      && state.rootPath.length > 0,

    fetchFlaggedMessages: createFetcher(state.backend, state.rootPath, 'flagged-messages'),
    flagMessage,
    unflagMessage,
    deleteFlaggedMessage,

    fetchOnline: createFetcher(state.backend, state.rootPath, 'online'),
    fetchUsers: createFetcher(state.backend, state.rootPath, 'users'),
    fetchUser: createFetcher(state.backend, state.rootPath, 'users', null),
    fetchUserMeta: createFetcher(state.backend, state.rootPath, 'users', null, 'meta'),
    setUserMeta,
    deleteUser,

    fetchThreads: createFetcher(state.backend, state.rootPath, 'threads'),
    fetchPublicThreads: createFetcher(state.backend, state.rootPath, 'public-threads'),
    fetchThread: createFetcher(state.backend, state.rootPath, 'threads', null),
    fetchThreadMeta: createFetcher(state.backend, state.rootPath, 'threads', null, 'meta'),
    setThreadMeta,
    deleteThreadMessage,
    deleteThread
  }
}
