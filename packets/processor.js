const prettyjson = require('prettyjson')
config = require('../config')

// -- NaCl -- //
const NaCl = require('../crypto/nacl/nacl');
const nacl = new NaCl();

// -- RC4 -- //
const RC4 = require('../crypto/rc4/rc4');
const rc4 = new RC4();

function Processor(server) {
    this.server = server
}

Processor.prototype.send = function (code, payload) {
    if (config.PepperEnabled) // If enabled then use NaCl
    {
        let crypted = nacl.encrypt(code, payload)
        let header = Buffer.alloc(7)
        header.writeUInt16BE(code, 0)
        header.writeUIntBE(crypted.length, 2, 3)
        header.writeUInt16BE(0, 5)

        this.server.write(Buffer.concat([header, Buffer.from(crypted)]))
        console.log('[*] 📤 ' + (packets[code] && packets[code].name ? packets[code].name : code) + ' (' + code + ') handled')
    }
    else // If disabled then use RC4
    {
        let crypted = rc4.encrypt(code, payload)
        let header = Buffer.alloc(7)
        header.writeUInt16BE(code, 0)
        header.writeUIntBE(crypted.length, 2, 3)
        header.writeUInt16BE(0, 5)

        this.server.write(Buffer.concat([header, Buffer.from(crypted)]))
        console.log('[*] 📤 ' + (packets[code] && packets[code].name ? packets[code].name : code) + ' (' + code + ') handled')
    }
}

Processor.prototype.parse = (code, buffer) => {
    if (packets[code]) {
        if (typeof packets[code].decode == 'function') {
            try {
                let data = packets[code].decode(buffer)
                console.log(prettyjson.render(data))
                if (typeof packets[code].callback == 'function') packets[code].callback(data)
            } catch (e) {
                console.error('[*] ✖️ Error decoding ' + code + ' packet')
                console.log(e)
            }
        } else if (typeof packets[code].callback == 'function') packets[code].callback()
    }
}

module.exports = Processor