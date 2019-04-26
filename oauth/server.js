/* OAuth callback requires a server */
const express = require('express');
const qs = require('qs');
// Import the axios library, to make HTTP requests
const axios = require('axios');
const auth = require('../functions/authentication.js');

module.exports = (app, client, r, authReq) => app.get('/', (req, res) => {
  res.send("Snooping around, aren't you?");
});

module.exports = (app, client, r, authReq) => app.get('/oauth/redirect', (req, res) => {
    const error = req.query.error;
    // Request token
    const code = req.query.code;
    const state = req.query.state;

    if (error) {
        console.log(error);
        res.redirect(`/welcome.html?authenticated=false`);
        auth.authFailure(client, r, authReq, res, state);
        return;
    }

    const base64EncodedCredentials = Buffer.from(client.config.redditAuth.clientID + ":" + client.config.redditAuth.clientSecret).toString('base64');

    const data = {
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: client.config.defaultSettings.oauthRedirectUri
    };

    // Get access token
    axios({
        method: "post",
        url: 'https://www.reddit.com/api/v1/access_token',
        data: qs.stringify(data),
        headers: {
            "Authorization": "Basic " + base64EncodedCredentials,
            "Content-Type": "application/x-www-form-urlencoded"
        }
    }).then(response => {
        if (response.data.error) {
            console.log(response.data.error);
            res.redirect(`/welcome.html?authenticated=false`);
            auth.authFailure(client, r, authReq, response, state);
        } else {
            const accessToken = response.data.access_token;
            res.redirect(`/welcome.html?authenticated=true`);
            getRedditUsernameAndAuthenticate(client, r, authReq, accessToken, state);
        }
    });
});

function getRedditUsernameAndAuthenticate(client, r, authReq, token, state) {
    axios({
        method: "get",
        url: 'https://oauth.reddit.com/api/v1/me',
        headers: {
            "Authorization": 'Bearer ' + token
        }
    }).then(response => {
        if (response.data.error) {
            console.log(response.data.error);
        } else {
            console.log("Success!");
            //console.log(response);
            console.log(response.data.name);

            auth.authSuccess(client, r, authReq, response, state);
        }
    });
};