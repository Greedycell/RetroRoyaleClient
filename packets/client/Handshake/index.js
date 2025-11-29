const ByteBuffer = require('../../../utils/bytebuffer-sc')
config = require('../../../config')

module.exports.code = 10100
module.exports.payload = () => {
    let buf = ByteBuffer.allocate(72)

    buf.writeInt32(1)
    buf.writeInt32(14)
    buf.writeInt32(config.MajorVersion) // Major
    buf.writeInt32(config.MinorVersion) // Minor
    buf.writeInt32(config.BuildVersion) // Build
    buf.writeIString(config.resourceSha)
    buf.writeInt32(2)
    buf.writeInt32(2)
    return buf.buffer
}