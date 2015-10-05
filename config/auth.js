// expose our config directly to our application using module.exports
module.exports = {

    'facebookAuth' : {
        'clientID'      : '1655932444623560', // your App ID
        'clientSecret'  : '65de545a23abcb600dbdff79b2ce323d', // your App Secret
        'callbackURL'   : 'http://localhost:8080/auth/facebook/callback'
    },

    'twitterAuth' : {
        'consumerKey'       : '4iQbmJgMYu2MHgVgRzz3x0OnR',
        'consumerSecret'    : 'LAGHlY0HhES7Dp3X0PkI4WoCcHCshBqVzKHt0x2QwqRKoxdbTb',
        'callbackURL'       : 'http://localhost:8080/auth/twitter/callback'
    },

    'googleAuth' : {
        'clientID'      : '803180257883-2l75kit8dhbtni2aqbhrn7ob7i8kpcq9.apps.googleusercontent.com',
        'clientSecret'  : 'tmwG99HIom4QlNI02d_pasDR',
        'callbackURL'   : 'http://localhost:8080/auth/google/callback'
    },

    'linkedInAuth' : {
        'consumerKey'   : '77azdbmq7li11n',
        'consumerSecret': 'iJ5OwNwfvphQkw3z',
        'callbackURL'   : 'http://localhost:8080/auth/linkedin/callback'
    }

};





