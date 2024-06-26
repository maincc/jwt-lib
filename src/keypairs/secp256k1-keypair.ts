import KeyPair from "./keypair";
import KeyEncoder from "../key-encoder";
import { fromByteArray } from "base64-js";
import * as formatter from "ecdsa-sig-formatter";
import { TokenSigner, TokenVerifier } from "jsontokens";
import { escape } from "jsontokens/lib/base64Url";
import { IKeyPair } from "../type";

export default class Secp256k1KeyPair extends KeyPair {
  private keyEncoder: KeyEncoder;
  private tokenSigner: TokenSigner;
  constructor(keypair: IKeyPair) {
    super(keypair);
    this.keyEncoder = new KeyEncoder("secp256k1");
    this.tokenSigner = new TokenSigner("ES256k", this.privateKey);
  }

  public sign(data): string {
    const customHeader = {
      typ: undefined,
      alg: undefined,
      ...data.header
    };

    const token = this.tokenSigner.sign(data.payload, false, customHeader);
    const [header, payload, signature] = token.split(".");
    return header + "." + payload + "." + escape(fromByteArray(formatter.joseToDer(signature, "ES256")));
  }

  public getPublicPem(): string {
    return this.keyEncoder.encodePublic(this.publicKey);
  }

  public verify(token: string): boolean {
    try {
      const [header, payload, signature] = token.split(".");
      token = header + "." + payload + "." + formatter.derToJose(signature, "ES256");
    } catch (_) {
      return false;
    }
    return new TokenVerifier("ES256k", this.publicKey).verify(token);
  }
}
