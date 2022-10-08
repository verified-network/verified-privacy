const IpfsClient = require('ipfs-http-client');
const itToStream = require('it-to-stream');
import bs58 from 'bs58';

const fetchFileUrl = 'https://ipfs.io/ipfs/';

class Ipfs {
  constructor(host, port, id, secret) {
    const auth = 'Basic ' + Buffer.from(id + ':' + secret).toString('base64');

    this.client = IpfsClient.create({
      protocol: 'https',
      host: host,
      port: port,
      headers: {
        authorization: auth,
      },
    });
  }

  /**
   * Save an javascript File to IPFS store and return its path
   * @param {File} file Javascript File (https://developer.mozilla.org/en-US/docs/Web/API/File)
   * @return {Promise<String>} Path of the file saved in the IPFS store
   */
  add(file) {
    return this.client.add(file).then((res) => {
      return res.path;
    });
  }

  /**
   * Return url of a file in IPFS
   * @param {String} filePath IPFS file path
   *
   * @return {String} Url of File in IPFS
   */
  static fileUrl(filePath) {
    return fetchFileUrl + filePath;
  }

  /**
   *
   * @param {String} filePath
   * @return {Promise<File>}
   */
  cat(filePath) {
    // FIXME: Not tested, We dont need this for now

    return new Promise((resolve, reject) => {
      const readable = itToStream.readable(this.client.cat('QmYT3JvVmSHPPxHdWL9aY9CJqU59nVHJY83PfzUKgz4kRt'));
      // eslint-disable-next-line no-unused-vars
      const decoder = new TextDecoder();

      readable.on('data', (chunk) => {
        // console.log(decoder.decode(chunk));
      });

      readable.on('end', () => {
        // console.log('done');
      });
    });
  }

  /**
   * Return bytes32 hex string from base58 encoded ipfs hash,
   * stripping leading 2 bytes from 34 byte IPFS hash
   * Assume IPFS defaults: function:0x12=sha2, size:0x20=256 bits
   * E.g. "QmNSUYVKDSvPUnRLKmuxk9diJ6yS96r1TrAXzjTiBcCLAL" -->
   * "0x017dfd85d4f6cb4dcd715a88101f7b1f06cd1e009b2327a0809d01eb9c91f231"
   * @param {String} ipfsListing
   * @return {string}
   */
  static getBytes32FromIpfsHash(ipfsListing) {
    return '0x' + bs58.decode(ipfsListing).slice(2).toString('hex');
  }

  /**
   * Return base58 encoded ipfs hash from bytes32 hex string,
   * E.g. "0x017dfd85d4f6cb4dcd715a88101f7b1f06cd1e009b2327a0809d01eb9c91f231"
   * --> "QmNSUYVKDSvPUnRLKmuxk9diJ6yS96r1TrAXzjTiBcCLAL
   * @param {String} bytes32Hex
   * @return {*}
   */
  static getIpfsHashFromBytes32(bytes32Hex) {
    // Add our default ipfs values for first 2 bytes:
    // function:0x12=sha2, size:0x20=256 bits
    // and cut off leading "0x"
    const hashHex = '1220' + bytes32Hex.slice(2);
    const hashBytes = Buffer.from(hashHex, 'hex');
    return bs58.encode(hashBytes);
  }
}

export default Ipfs;
