class FacebookCordovaAuth {
  constructor (options) {
    if (!window.facebookConnectPlugin) {
      throw new Error('Cordova plugin facebookConnect not found');
    }
  }

  isSignedIn () {
    return new Promise((resolve, reject) => {
      window.facebookConnectPlugin.getLoginStatus(
        response => {
          if (response.authResponse) {
            this.accessToken = response.authResponse.accessToken;
            resolve(true);
          } else {
            resolve(false);
          }
        },
        err => {
          console.error('is signed in err', err);
          resolve(false);
        }
      );
    });
  }

  signIn () {
    this.accessToken = undefined;
    this.profile = undefined;
    return new Promise((resolve, reject) => {
      window.facebookConnectPlugin.login(
        [ 'public_profile', 'email' ],
        response => {
          if (response.authResponse) {
            this.accessToken = response.authResponse.accessToken;
            resolve();
          } else {
            reject(new Error('Cannot login to facebook'));
          }
        },
        err => {
          console.error('is signed in err', err);
          window.facebookConnectPlugin.logout();
          reject(new Error(err.errMessage));
        },
      );
    });
  }

  async getProfile () {
    if (this.profile) {
      return this.profile;
    }

    if (!this.accessToken) {
      return;
    }

    return await new Promise((resolve, reject) => {
      window.facebookConnectPlugin.api(
        '/me?fields=first_name,last_name,email,gender,picture',
        [],
        response => {
          if (response.error) {
            reject(response);
            return;
          }

          this.profile = {
            id: response.id,
            firstName: response.first_name,
            lastName: response.last_name,
            imageUrl: response.picture.data.url,
            email: response.email,
            accessToken: this.accessToken,
          };

          resolve(this.profile);
        },
        err => {
          console.error('err', err);
          reject(err);
        }
      );
    });
  }
}

export default FacebookCordovaAuth;
