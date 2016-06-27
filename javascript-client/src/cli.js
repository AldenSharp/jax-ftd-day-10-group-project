import net from 'net'
import vorpal from 'vorpal'

const cli = vorpal()

// cli config
cli
  .delimiter('>')

// connect mode
let server
let username = 'Unnamed User'

function getDate () {
  let date = new Date()
  let month = date.getMonth() + 1
  let day = date.getDate()
  let year = date.getFullYear()
  let ampm = date.getHours() < 12
    ? 'AM'
    : 'PM'
  let hours = date.getHours() % 12
    ? date.getHours() % 12
    : 12
  let minutes = date.getMinutes() < 10
    ? '0' + date.getMinutes()
    : date.getMinutes()
  let seconds = date.getSeconds() < 10
    ? '0' + date.getSeconds()
    : date.getSeconds()
  let datestring = `${month}/${day}/${year}, ${hours}:${minutes}:${seconds} ${ampm}`
  return datestring
}

cli
  .command('setname <username>')
  .action(function (args, callback) {
    username = args['username']
    this.log(`Successfully changed username to ${username}.`)
    callback()
  })

cli
  .mode('connect <port> [host]')
  .delimiter('connected >')
  .init(function (args, callback) {
    server = net.createConnection(args, () => {
      const address = server.address()
      this.log(`Connected to server ${address.address}:${address.port}`)
      server.write(`${getDate()} - ${username} has joined the chat.\n`)
      callback()
    })

    server.on('data', (data) => {
      this.log(`${data.toString()}`)
    })

    server.on('end', () => {
      this.log('Disconnected from server.')
    })
  })
  .action(function (command, callback) {
    if (command === 'disconnect') {
      server.write(`${getDate()} - ${username} has left.\n`)
      server.write('disconnect\n')
      server.end()
      callback()
    } else if (command.startsWith('setname ')) {
      let output = `${getDate()} - ${username}`
      username = command.substr(8)
      output += ` changed name to ${username}.\n`
      server.write(output)
      callback()
    } else {
      server.write(`${getDate()} - ${username}: ${command}\n`)
      callback()
    }
  })

export default cli
