import { ChainToken, EthWallet, RippleWallet, BitcoinWallet, JingtumWallet } from "../src/index"
import { getPrivatePem, getPublicPem } from "../src/utils/getPem"

const ethWallet = EthWallet.generate();
const bitcoinWallet = BitcoinWallet.generate();
const rippleWallet_secp256k1 = RippleWallet.generate('secp256k1');
const rippleWallet_ed25519 = RippleWallet.generate('ed25519');
const jingtumWallet_secp256k1 = JingtumWallet.generate();
const jingtumWallet_ed25519 = JingtumWallet.generate({ algorithm: 'ed25519' });

// 测试ChainToken的快速签名和验证
describe('quickSign and verify', () => {
  it('In Ethereum, fast cwt signature and verification', async () => {
    const ethCwt = ChainToken.quickSign(ethWallet.getPrivateKeyString(), "zhye", "ethereum");
    expect(ethCwt).toBeTruthy();
    const chainToken = new ChainToken("ethereum", ethWallet.getPublicKeyString(), "public");
    const result = chainToken.verify(ethCwt);
    expect(result).toBe(true);
  });
  it('In Bitcoin, fast cwt signature and verification', async () => {
    const bitcoinCwt = ChainToken.quickSign(bitcoinWallet.privateKey, "bitcoin_usr", "ethereum");
    expect(bitcoinCwt).toBeTruthy();
    const chainToken = new ChainToken("bitcoin", bitcoinWallet.publicKey, "public");
    const result = chainToken.verify(bitcoinCwt);
    expect(result).toBe(true);
  });
  it('In ripple, fast cwt signature and verification', async () => {
    // ripple secp256k1
    const rippleCwt_secp256k1 = ChainToken.quickSign(rippleWallet_secp256k1.privateKey, "ripple_secp256k1", "ripple");
    expect(rippleCwt_secp256k1).toBeTruthy();
    const chainToken_secp256k1 = new ChainToken("ripple", rippleWallet_secp256k1.publicKey, "public");
    const result_secp256k1 = chainToken_secp256k1.verify(rippleCwt_secp256k1);
    expect(result_secp256k1).toBe(true);
    // ripple ed25519
    const rippleCwt_ed25519 = ChainToken.quickSign(rippleWallet_ed25519.secret, "ripple_ed25519", "ripple");
    expect(rippleCwt_ed25519).toBeTruthy();
    const chainToken_ed25519 = new ChainToken("ripple", rippleWallet_ed25519.publicKey, "public");
    const result_ed25519 = chainToken_ed25519.verify(rippleCwt_ed25519);
    expect(result_ed25519).toBe(true);
  });
  it('In jingtum, fast cwt signature and verification', async () => {
    // jingtum secp256k1
    const jingtumCwt_secp256k1 = ChainToken.quickSign(jingtumWallet_secp256k1.privateKey, "jingtum_secp256k1", "ripple");
    expect(jingtumCwt_secp256k1).toBeTruthy();
    const chainToken_secp256k1 = new ChainToken("ripple", jingtumWallet_secp256k1.publicKey, "public");
    const result_secp256k1 = chainToken_secp256k1.verify(jingtumCwt_secp256k1);
    expect(result_secp256k1).toBe(true);
    // jingtum ed25519
    const jingtumCwt_ed25519 = ChainToken.quickSign(jingtumWallet_ed25519.secret, "jingtum_ed25519", "ripple");
    expect(jingtumCwt_ed25519).toBeTruthy();
    const chainToken_ed25519 = new ChainToken("ripple", jingtumWallet_ed25519.publicKey, "public");
    const result_ed25519 = chainToken_ed25519.verify(jingtumCwt_ed25519);
    expect(result_ed25519).toBe(true);
  });
  it("Error testing", async () => {
    expect(()=>{ChainToken.quickSign(rippleWallet_ed25519.secret, "jc_ripple", "network")})
    .toThrow(new Error('chain network is not supported'));
  });
});

// 测试ChainToken的签名、解码和验证
describe('sign, decode and verify', () => {
  it('In Ethereum, cwt signature, decode and verification', async () => {
    const data = {
      header: {
        x5c: [
          "*****public key*****"
        ],
        type: "CWT",
        chain: "ethereum",
      },
      payload: {
        usr: "zhye",
        time: 1718084540
      }
    };
    const privChainToken = new ChainToken("ethereum", ethWallet.getPrivateKeyString(), "private");
    const cwt = privChainToken.sign(data);
    expect(cwt).toBeTruthy();
    expect(ChainToken.decode(cwt)).toBeTruthy();
    const verify = privChainToken.verify(cwt);
    expect(verify).toBe(true);
  });
  it('In Ripple, cwt signature, decode and verification', async () => {
    const data = {
      header: {
        x5c: [
          "*****public key*****"
        ],
        type: "CWT",
        chain: "ripple",
      },
      payload: {
        usr: "jc_ripple",
        time: 1718084540
      }
    };
    // ripple secp256k1
    const privChainToken_secp256k1 = new ChainToken("ripple", rippleWallet_secp256k1.secret, "secret");
    const cwt_secp256k1 = privChainToken_secp256k1.sign(data);
    expect(cwt_secp256k1).toBeTruthy();
    expect(ChainToken.decode(cwt_secp256k1)).toBeTruthy();
    const verify_secp256k1 = privChainToken_secp256k1.verify(cwt_secp256k1);
    expect(verify_secp256k1).toBe(true);
    // ripple ed25519
    const privChainToken_ed25519 = new ChainToken("ripple", rippleWallet_ed25519.secret, "secret");
    const cwt_ed25519 = privChainToken_ed25519.sign(data);
    expect(cwt_ed25519).toBeTruthy();
    expect(ChainToken.decode(cwt_ed25519)).toBeTruthy();
    const verify_ed25519 = privChainToken_ed25519.verify(cwt_ed25519);
    expect(verify_ed25519).toBe(true);
  });
});

describe('Converts the public and private keys to pem format according to the algorithm', () => {
  it("Convert the public and private keys to pem format according to secp256k1", async () => {
    const { privateKey, publicKey } = rippleWallet_secp256k1;
    const privatePem = getPrivatePem(privateKey, 'secp256k1')
    expect(privatePem).toBeTruthy();
    const publicPem = getPublicPem(publicKey, 'secp256k1')
    expect(publicPem).toBeTruthy();
  });
  it("Convert the public and private keys to pem format according to ed25519", async () => {
    const { privateKey, publicKey } = rippleWallet_ed25519;
    const privatePem = getPrivatePem(privateKey, 'ed25519')
    expect(privatePem).toBeTruthy();
    const publicPem = getPublicPem(publicKey, 'ed25519')
    expect(publicPem).toBeTruthy();
  });
});

