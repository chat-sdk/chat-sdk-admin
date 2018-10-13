const sendMessageToClient = (client, msg) => {
  return new Promise((resolve, reject) => {
    const channel = new MessageChannel()
    channel.port1.onmessage = ev => {
      if (ev.data.error) reject(ev.data.error)
      else resolve(ev.data)
    }
    client.postMessage(msg, [channel.port2]);
  })
}

const sendMessageToAllClients = msg => {
  clients.matchAll().then(clients => {
    clients.forEach(client => {
      sendMessageToClient(client, msg)
      .catch(console.error)
    })
  })
}

self.addEventListener('push', event => {
  const data = event.data.json()
  sendMessageToAllClients(data)
})
