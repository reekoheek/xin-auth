class GoogleCordovaAuth {
  constructor (options) {
    if (!window.plugins.googleplus) {
      throw new Error('Cordova plugin googleplus not found');
    }

    options = options || {};
    this.loginOptions = {
      webClientId: options.clientId,
      offline: Boolean(options.offline),
    };
  }

  isSignedIn () {
    return new Promise((resolve, reject) => {
      window.plugins.googleplus.trySilentLogin(
        this.loginOptions,
        profile => {
          this.setProfile(profile);
          resolve(this.profile);
        },
        msg => {
          console.error('silent login err', msg);
          resolve(false);
        },
      );
    });
  }

  signIn () {
    this.profile = undefined;

    return new Promise((resolve, reject) => {
      window.plugins.googleplus.login(
        this.loginOptions,
        profile => {
          this.setProfile(profile);
          resolve(this.profile);
        },
        msg => {
          console.log('signin err', msg);
          resolve(false);
        }
      );
    });
  }

  setProfile (profile) {
    this.profile = {
      id: profile.userId,
      firstName: profile.givenName,
      lastName: profile.familyName,
      imageUrl: profile.imageUrl,
      email: profile.email,
      accessToken: profile.idToken,
    };
  }

  async getProfile () {
    return this.profile;
  }
}

export default GoogleCordovaAuth;
