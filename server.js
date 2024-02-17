const express = require('express');
const path = require('path');
const querystring = require('querystring');


const app = express();
const PORT = process.env.PORT || 3010;

const clientId = '1e401c0abab646b198424c8ba42a5463';
const clientSecret = 'f911e9426fe44b7785d03b932b18ba16';
const redirectUri = 'http://localhost:3010/callback'; // Update with your actual redirect URI
const scopes = 'user-read-recently-played user-read-currently-playing'; // Add any other scopes as needed

app.use(express.static(path.join(__dirname, 'public')));

// Serve the HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Route for initiating the authentication flow
app.get('/login', (req, res) => {
  const authorizeUrl = 'https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: clientId,
      scope: scopes,
      redirect_uri: redirectUri,
    });
  res.redirect(authorizeUrl);
});

// Route for handling callback after authentication
app.get('/callback', async (req, res) => {
  const { code } = req.query;

  // Exchange authorization code for access token
  const tokenParams = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: redirectUri,
  });
  const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
    },
    body: tokenParams,
  });
  const tokenData = await tokenResponse.json();

  // Use the access token to get the user's currently playing track
  const accessToken = tokenData.access_token;
  const currentlyPlayingResponse = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (currentlyPlayingResponse.status === 204) {
    res.redirect('/callback.html'); // Redirect to a different route if no track is currently playing
    return;
  }

  // Parse the response as JSON
  const currentlyPlayingData = await currentlyPlayingResponse.json();

  console.log(currentlyPlayingData.item.name);
  // Redirect to callback.html and pass currently playing data as query parameters
  res.redirect(`/callback.html?trackName=${encodeURIComponent(currentlyPlayingData.item.name)}`);
});



app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
