console.clear()

const figlet = require('figlet');

const net = require('net')
const fs = require('fs')
const Processor = require('./packets/processor')
const Packetizer = require('./utils/packetizer')

var packetizer = new Packetizer()
var server = new net.Socket()

processor = new Processor(server)
const config = require('./config')

// -- NaCl -- //
const NaCl = require('./crypto/nacl/nacl');
const nacl = new NaCl();

// -- RC4 -- //
const RC4 = require('./crypto/rc4/rc4');
const rc4 = new RC4();

// -- Packets -- //
packets = {}


fs.readdir('./packets/client', (err, files) => {
    files.forEach(file => {
        let packet = require(`./packets/client/${file}`)
        packets[packet.code] = Object.assign({ name: file }, packet)
        packets[file] = packet
    })

    fs.readdir('./packets/server', (err, files) => {
        files.forEach(file => {
            let packet = require(`./packets/server/${file}`)
            packets[packet.code] = Object.assign({ name: file }, packet)
            packets[file] = packet
        })
        
        console.log('[*] Loaded ' + Object.keys(packets).length + ' packets')
    })
})

// -- Server shit -- //
// Checks to see if the server is online
function isServerOnline(host, port, timeout = 2000) {
    return new Promise((resolve) => {
        const sock = new net.Socket();
        sock.setTimeout(timeout);
        sock.on('connect', () => { sock.destroy(); resolve(true); });
        sock.on('timeout', () => { sock.destroy(); resolve(false); });
        sock.on('error', () => { resolve(false); });
        sock.connect(port, host);
    });
}

(async () => {
    console.log(figlet.textSync('RetroRoyale Client'));
    console.log('RetroRoyale client created by @Greedycell on Github!');
    const online = await isServerOnline(config.gameServerUrl, config.gamePort);
    console.log('[*] Attempting to connect to ' + config.gameServerUrl + ':' + config.gamePort + '...')
    if (!online) {
        console.error('[*] Server is offline!');
        process.exit(1);
    }
})();

server.connect(config.gamePort, config.gameServerUrl, () => {
    console.log('[*] Successfully connected to ' +  config.gameServerUrl + ':' + config.gamePort + '!')
    processor.send(packets.Handshake.code, packets.Handshake.payload())
})

server.on('data', chunk => {
    packetizer.packetize(chunk, (packet) => {
        let message = {
            code: packet.readUInt16BE(0),
            length: packet.readUIntBE(2, 3),
            payload: packet.slice(7, packet.length)
        }

        if (config.PepperEnabled) // If enabled then use NaCl
        {
            let decrypted = nacl.processPacket(message)
            processor.parse(message.code, decrypted)
        }
        else // If disabled then use RC4
        {
            let decrypted = rc4.processPacket(message)
            processor.parse(message.code, decrypted)
        }
    })
})