const axios = require("axios");
const { wrapper } = require("axios-cookiejar-support");
const { CookieJar } = require("tough-cookie");

const BlooketCryptoHelper = require("./BlooketCryptoHelper");
const Logger = require("./logger");

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min);
}

class BlooketAccount {
  constructor(email, password) {
    this.email = email;
    this.password = password;
    this.session, (this.successfulLogin = false);

    const jar = new CookieJar();
    const accountAxios = axios.create({ jar });
    const accountAxiosCookie = wrapper(accountAxios);

    this.axios = accountAxiosCookie;
  }

  async _initialize() {
    if (!this.initializationPromise) {
      this.initializationPromise = this._doInitialize();
    }
    return this.initializationPromise;
  }

  async _doInitialize() {
    await this._getCookie();
    await this._login();
    await this._verifySession();
  }

  async _getCookie() {
    await this.axios.get("https://id.blooket.com/api/users/check-auth", {
      headers: {
        "X-Blooket-Build": await BlooketCryptoHelper.getBuildId(),
      },
    });
  }

  async _login() {
    await this.axios
      .post(
        "https://id.blooket.com/api/users/login",
        {
          name: await this.email,
          password: await this.password,
        },
        {
          headers: {
            "X-Blooket-Build": await BlooketCryptoHelper.getBuildId(),
            "Content-Type": "text/plain",
          },
        }
      )
      .then((res) => (this.successfulLogin = res.data.success));
  }

  async _verifySession() {
    this.session = await this.axios
      .get("https://id.blooket.com/api/users/verify-session", {
        headers: {
          "X-Blooket-Build": await BlooketCryptoHelper.getBuildId(),
        },
      })
      .then((res) => res.data);
  }

  async dailyTokens() {
    await this._initialize();

    let randomTokens = [];
    for (let i = 1; i <= 4; i++) {
      randomTokens.push(getRandomInt(70, 100));
    }
    randomTokens.push(
      500 - randomTokens.reduce((partialSum, n) => partialSum + n, 0)
    );

    let randomXp = [];
    for (let i = 1; i <= 4; i++) {
      randomXp.push(getRandomInt(40, 60));
    }
    randomXp.push(300 - randomXp.reduce((partialSum, n) => partialSum + n, 0));

    for (let i = 0; i < 5; i++) {
      Logger.debug(
        `Adding ${randomTokens[i]} tokens and ${randomXp[i]} xp to account ${this.session.name}`
      );
      await this.axios
        .put(
          "https://api.blooket.com/api/users/add-rewards",
          await BlooketCryptoHelper.encrypt({
            name: this.session.name,
            addTokens: randomTokens[i],
            addedXp: randomXp[i],
          }),
          {
            headers: {
              "X-Blooket-Build": await BlooketCryptoHelper.getBuildId(),
              "Content-Type": "text/plain",
            },
          }
        )
        .catch((e) => {
          Logger.error(e);
        });
    }
  }

  async getLoginSuccess() {
    await this._initialize();
    return this.successfulLogin;
  }

  async getAccountInfo() {
    await this._initialize();
    await this._verifySession();
    return this.session;
  }
}

module.exports = BlooketAccount;
