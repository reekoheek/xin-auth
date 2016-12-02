class GoogleWebAuth {
  constructor (options) {
    this.clientId = options.clientId;
  }

  async prepareAuthAsync () {
    if (this.gapiAuth) {
      return;
    }

    let gapi = await getGapiAsync('auth2');

    let auth = gapi.auth2.init({
      client_id: this.clientId,
      scope: 'profile',
    });

    await auth.then(auth => {
      this.gapiAuth = auth;
    });
  }

  async isSignedIn () {
    await this.prepareAuthAsync();
    return this.gapiAuth.isSignedIn.get();
  }

  async signIn () {
    await this.prepareAuthAsync();
    await this.gapiAuth.signIn();
    this.profile = undefined;
  }

  getUser () {
    if (!this.gapiAuth) {
      return;
    }

    return this.gapiAuth.currentUser.get();
  }

  getProfile () {
    if (this.profile) {
      return this.profile;
    }

    let user = this.getUser();
    if (!user) {
      return;
    }

    let profile = user.getBasicProfile();

    this.profile = {
      id: profile.getId(),
      // displayName: profile.getName(),
      firstName: profile.getGivenName(),
      lastName: profile.getFamilyName(),
      imageUrl: profile.getImageUrl(),
      email: profile.getEmail(),
      accessToken: user.getAuthResponse().access_token,
    };

    return this.profile;
  }
}

function getGapiAsync () {
  if (window.gapi) {
    return Promise.resolve(window.gapi);
  }

  let args = [...arguments];

  return new Promise((resolve, reject) => {
    getGapiAsync._gapiResolvers.push(resolve);

    if (getGapiAsync._gapiResolvers.length > 1) {
      return;
    }

    let script = document.createElement('script');
    script.onload = async () => {
      await Promise.all(args.map(arg => (new Promise(resolve => window.gapi.load(arg, resolve)))));

      getGapiAsync._gapiResolvers.forEach(resolve => resolve(window.gapi));
    };
    script.onerror = () => console.error('google/platform request error');
    script.src = 'https://apis.google.com/js/platform.js';
    document.head.appendChild(script);
  });
}
getGapiAsync._gapiResolvers = [];

export default GoogleWebAuth;
