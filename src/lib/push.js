import runtime from 'serviceworker-webpack-plugin/lib/runtime'
import { Observable } from 'rxjs'
import { distinctUntilChanged } from 'rxjs/operators'
import urljoin from 'url-join'
import xhr from './xhr'
import { urlBase64ToUint8Array } from './utils'

export default async () => {
  if ('serviceWorker' in navigator) {
    const vapidPublicKey = 'BIC_uLpr7vgeD5IT3VODhd5KgvaIAsr_r4WXOducC6fn12lVZnGRj0WyKb4b5agSZb5mMzDgIevvraIRRhDgzWg'
    const registration = await runtime.register()
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
    })
    const listeners = {}
    navigator.serviceWorker.addEventListener('message', ev => {
      const listener = listeners[ev.data.path]
      if (listener) listener(ev.data.data)
    })
    return {
      getSubscription: () => subscription,
      getListeners: () => listeners,
      subscribe: (backend, ...parts) => {
        return Observable.create(o => {
          try {
            if (subscription) {
              const path = urljoin(...parts)
              listeners[path] = data => o.next(data)
              xhr.post([backend, 'push/subscribe', path], subscription)
                .then(data => o.next(data))
                .catch(err => o.error(err))
            }
            else {
              o.error(new Error('Webpush Error: subscription is undefined'))
            }
          }
          catch (err) {
            o.error(err)
          }
        }).pipe(distinctUntilChanged(o => JSON.stringify(o)))
      },
      unsubscribe: parts => {
        delete listeners[urljoin(...parts)]
        if (subscription) {
          return xhr.post(['push/unsubscribe'].concat(parts), subscription)
            .then(data => o.next(data))
            .catch(err => o.error(err))
        }
        else {
          throw new Error('Webpush Error: subscription is undefined')
        }
      }
    }
  } else {
    throw new Error('serviceWorker not found in navigator')
  }
}
