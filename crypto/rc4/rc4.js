const RC4 = require('simple-rc4');
const config = require('../../config');

const key = Buffer.from(config.serverRC4Key + 'nonce', 'utf8');

module.exports = class RC4Crypto {
    constructor() {
        this.clientStream = new RC4(key);
        this.clientStream.update(Buffer.from(key));
        this.serverStream = new RC4(key);
        this.serverStream.update(Buffer.from(key));

        this.rc4 = true; // Set for encrypting 20103 on content update after rc4 patching
    }

    processPacket(message) {
        switch (message.code) {
            case 20100:
                this.rc4 = false;
                return message.payload;
            case 20103:
                return message.payload;
            default:
                return this.clientStream.update(message.payload);
        }
    }

    encrypt(code, payload) {
        if (code === 10100 && this.rc4 === false) {
            return payload;
        }
        else if (code === 10101) {
            return payload;
        } else {
            return this.serverStream.update(payload);
        }
    }
}