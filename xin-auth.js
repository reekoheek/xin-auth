import xin from 'xin';
import isCordova from 'xin-cordova/lib/is-cordova';

const ADAPTERS = {
  // google: [
  //   require('./lib/web-google-auth'),
  //   require('./lib/cordova-google-auth'),
  // ],
  // facebook: [
  //   require('./lib/cordova-facebook-auth'),
  //   require('./lib/web-facebook-auth'),
  // ],
};

class XinAuth extends xin.Component {
  setAdapter (name, adapters) {
    ADAPTERS[name] = adapters;
  }

  get props () {
    return Object.assign({}, super.props, {
      provider: {
        type: String,
        required: true,
      },
      options: {
        type: Object,
      },
    });
  }

  async getAuthAsync () {
    if (this.auth) {
      return this.auth;
    }

    if (this.provider in ADAPTERS === false) {
      ADAPTERS[this.provider] = (await Promise.all([
        System.import('./lib/' + this.provider + '/web-auth'),
        System.import('./lib/' + this.provider + '/cordova-auth'),
      ])).map(adapter => adapter.default);
    }

    this.auth = new ADAPTERS[this.provider][await isCordova() ? 1 : 0](this.options);

    return this.auth;
  }

  async signIn () {
    let auth = await this.getAuthAsync();

    if (await auth.isSignedIn()) {
      return true;
    }

    await auth.signIn();
    return true;
  }

  async getProfile () {
    let auth = await this.getAuthAsync();

    return await auth.getProfile();
  }
}

xin.define('xin-auth', XinAuth);

export default XinAuth;
