const crypto = require("crypto"),
  axios = require("axios");

class BlooketCrypto {
  constructor() {
    this.aesKey, this.buildId, this.cryptoKey;
  }
  async _initialize() {
    return (
      this.initializationPromise ||
        (this.initializationPromise = this._doInitialize()),
      this.initializationPromise
    );
  }
  async _doInitialize() {
    await this._initializeConfig(), await this._initializeCryptoKey();
  }
  async _initializeConfig() {
    const i = await this._getBuildConfigExternal();
    (this.aesKey = i.aesKey), (this.buildId = i.buildId);
  }
  async _initializeCryptoKey() {
    this.cryptoKey = await this._importKey();
  }
  async _getBuildConfigExternal() {
    const i = await axios
        .get("https://dashboard.blooket.com/api/config")
        .then((i) => i.data),
      t = await i.match(/<script src=".{59,67}">/g).slice(1);
    return new Promise((i) => {
      t.forEach(async (t) => {
        const e = await axios
          .get(`https://dashboard.blooket.com/${t.split('"')[1]}`)
          .then((i) => i.data);
        /\w{8}-\w{4}-\w{4}-\w{4}-\w{12}/.test(e) &&
          /\(new TextEncoder\)\.encode\("(.+?)"\)/.test(e) &&
          i({
            buildId: e.match(/\w{8}-\w{4}-\w{4}-\w{4}-\w{12}/)[0],
            aesKey: e.match(/\(new TextEncoder\)\.encode\("(.+?)"\)/)[1],
          });
      });
    });
  }
  async _importKey() {
    return await crypto.subtle.importKey(
      "raw",
      await crypto.subtle.digest(
        "SHA-256",
        new TextEncoder().encode(this.aesKey)
      ),
      { name: "AES-GCM" },
      !1,
      ["encrypt"]
    );
  }
  async encrypt(i) {
    await this._initialize();
    const t = await new TextEncoder().encode(JSON.stringify(i)),
      e = crypto.getRandomValues(new Uint8Array(12)),
      a = await crypto.subtle.encrypt(
        { name: "AES-GCM", iv: e },
        this.cryptoKey,
        t
      );
    return Buffer.from(
      Array.from(e)
        .map((i) => String.fromCharCode(i))
        .join("") +
        Array.from(new Uint8Array(a))
          .map((i) => String.fromCharCode(i))
          .join(""),
      "binary"
    ).toString("base64");
  }
  async getBuildId() {
    return await this._initialize(), this.buildId;
  }
  async getAesKey() {
    return await this._initialize(), this.aesKey;
  }
}
module.exports = new BlooketCrypto();
