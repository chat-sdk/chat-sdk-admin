import urljoin from 'url-join'

const xhr = async (url, options) => {
  options = options || {}
  options.headers = { 'Content-Type': 'application/json; charset=utf-8', ...options.headers }
  options.method = options.method || 'GET'
  if (typeof options.body === 'object') {
    options.body = JSON.stringify(options.body)
  }
  if (typeof url === 'object') {
    url = urljoin(...url)
  }
  console.log(options.method + ':', url)
  const response = await fetch(url, options)
  if (response.ok) {
    return await response.json().catch(_ => response.text())
  } else {
    throw response.status
  }
}

xhr.get = url => xhr(url, { method: 'GET' })
xhr.put = url => xhr(url, { method: 'PUT' })
xhr.post = (url, body) => xhr(url, { method: 'POST', body })
xhr.delete = url => xhr(url, { method: 'DELETE' })

export default xhr
