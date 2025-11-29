const nacl = require('tweetnacl')
const blake2 = require('blakejs')

function Nonce(arg) {
    if (arg !== undefined && arg.publicKey) {
        const chunks = [];
        if (arg.bytes) {
            chunks.push(Buffer.from(arg.bytes));
        }
        chunks.push(Buffer.from(arg.publicKey));
        chunks.push(Buffer.from(arg.serverKey));
        const input = Buffer.concat(chunks);
        const hash = blake2.blake2b(input, null, 24);
        this.payload = Buffer.from(hash);
    } else if (arg !== undefined && arg.bytes) {
        this.payload = Buffer.from(arg.bytes, 'hex');
    } else {
        this.payload = Buffer.from(nacl.randomBytes(nacl.box.nonceLength));
    }
}

Nonce.prototype.increment = function (increment) {
    let val = this.payload.readInt16LE(0);
    val = val % 32767;
    this.payload.writeInt16LE(val + increment, 0);
}

module.exports = Nonce;