class FacebookWebAuth {
  constructor (options) {
    this.appId = options.appId;
  }

  async prepareAuthAsync () {
    if (this.fbAuth) {
      return;
    }

    await new Promise((resolve, reject) => {
      (function (d, s, id, onload) {
        let js;
        let fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) return;
        js = d.createElement(s); js.id = id;
        js.onload = onload;
        js.src = '//connect.facebook.net/en_US/sdk.js';
        fjs.parentNode.insertBefore(js, fjs);
      }(document, 'script', 'facebook-jssdk', () => {
        window.FB.init({
          appId: this.appId,
          xfbml: true,
          version: 'v2.8',
        });

        this.fbAuth = window.FB;
        // window.FB.AppEvents.logPageView()
        resolve();
      }));
    });
  }

  async isSignedIn () {
    await this.prepareAuthAsync();
    return new Promise(resolve => {
      this.fbAuth.getLoginStatus(response => {
        resolve(Boolean(response.authResponse));
      });
    });
  }

  async signIn () {
    this.profile = undefined;

    await this.prepareAuthAsync();

    return new Promise((resolve, reject) => {
      this.fbAuth.login(response => {
        if (!response.authResponse) {
          return reject(new Error('No auth response'));
        }

        this.accessToken = response.authResponse.accessToken;

        resolve();
      }, {scope: 'public_profile,email'});
    });
  }

  async getProfile () {
    if (!this.profile) {
      this.profile = new Promise((resolve, reject) => {
        this.fbAuth.api('/me', {fields: 'first_name,last_name,email,gender,picture'}, response => {
          if (response.error) {
            return reject(response.error);
          }

          this.profile = {
            id: response.id,
            firstName: response.first_name,
            lastName: response.last_name,
            imageUrl: response.picture.data.url,
            email: response.email,
            accessToken: this.accessToken,
          };

          resolve();
        });
      });
    }

    return this.profile;
  }
}

export default FacebookWebAuth;
