const https = require('https')
const fs = require('fs')
const privKeyPath = './privkey.pem'
const fullChainPath = './fullchain.pem'
const httpsPort = 8443

https
  .createServer(
    {
      key: fs.readFileSync(privKeyPath),
      cert: fs.readFileSync(fullChainPath),
    },
    (_, res) => res.end('Listening HTTPS Server!!')
  )
  .listen(httpsPort, () => {
    console.log(`Listening HTTPS on :${httpsPort}`)
  })