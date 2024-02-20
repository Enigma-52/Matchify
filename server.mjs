import pkg from './firebaseConfig.mjs';
const {
    firebaseApp,
    db,
    doc,
    setDoc,
    getDocs,
    getDoc,
    collection
} = pkg;

import {
    fileURLToPath
} from 'url';
import {
    dirname
} from 'path';
import express from 'express';
import path from 'path';
import querystring from 'querystring';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(express.json())

const PORT = process.env.PORT || 3010;

const clientId = '1e401c0abab646b198424c8ba42a5463';
const clientSecret = 'f911e9426fe44b7785d03b932b18ba16';
const redirectUri = 'http://localhost:3010/callback'; // Update with your actual redirect URI
const scopes = 'user-read-recently-played user-read-currently-playing user-library-read'; // Add any other scopes as needed

app.use(express.static('public'));

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

var matchData;
var globalUserId;

app.get('/callback', async (req, res) => {
    try {
        const {
            code
        } = req.query;

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

        if (!tokenResponse.ok) {
            throw new Error('Failed to fetch access token');
        }

        const tokenData = await tokenResponse.json();
        const accessToken = tokenData.access_token;

        // Fetch user's profile to retrieve user ID
        const userProfileResponse = await fetch('https://api.spotify.com/v1/me', {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        if (!userProfileResponse.ok) {
            throw new Error('Failed to fetch user profile');
        }

        const userProfileData = await userProfileResponse.json();
        const userId = userProfileData.id;
        globalUserId = userId;
        // Fetch user's saved tracks with a limit of 50
        const savedTracksResponse = await fetch('https://api.spotify.com/v1/me/tracks?limit=50', {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        if (!savedTracksResponse.ok) {
            throw new Error('Failed to fetch user\'s saved tracks');
        }

        const savedTracksData = await savedTracksResponse.json();
        const tracks = savedTracksData.items.map(item => ({
            name: item.track.name,
            artist: item.track.artists.map(artist => artist.name).join(', '),
            album: item.track.album.name
        }));

        try {
            const docRef = doc(db, "users", userId); // Replace "documentId" with the actual document ID you want to update
            const data = {
                likedSongs: tracks
            };
            await setDoc(docRef, data, {
                merge: true
            });
        } catch (e) {
            console.error("Error updating document: ", e);
        }

        const querySnapshot = await getDocs(collection(db, "users"));
        const matchingSongsCounts = [];

        querySnapshot.forEach(doc => {
            if (doc.id !== userId) {
                const otherUserId = doc.id;
                const otherUserLikedSongs = doc.data().likedSongs;
                const matchingSongs = tracks.filter(track => otherUserLikedSongs.some(otherTrack => track.name === otherTrack.name && track.artist === otherTrack.artist && track.album === otherTrack.album));
                matchingSongsCounts.push({
                    userId: otherUserId,
                    matchingSongsCount: matchingSongs.length,
                    globalUserId:globalUserId
                });
            }
        });

        matchData = matchingSongsCounts;
        const docSnapshot = await getDocs(collection(db, "users"));
        let userData = {};

        docSnapshot.forEach(doc => {
            if (doc.id === userId) {
                userData = doc.data();
            }
        });

        // Add the new request to the existing requests array or create a new array if it doesn't exist
        const requests = userData.matchData || [];
        for (const key in matchData) {
            if (Object.hasOwnProperty.call(matchData, key)) {
                requests.push({ [key]: matchData[key] });
            }
        }
        const data = {
            matches: requests
        };

        // Update the document with the new requests array
        await setDoc(doc(db, "users", userId), data, { merge: true });
        res.redirect('callback.html');

    } catch (error) {
        console.error("Error updating document or retrieving matching songs:", error);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/reqSender', async (req, res) => {
    const { userId, input1, input2, input3 } = req.body;

    try {
        // Reference the existing document in Firestore
        const querySnapshot = await getDocs(collection(db, "users"));
        let userData = {}; // Declare userData outside the if block

        querySnapshot.forEach(doc => {
            if (doc.id === userId) {
                userData = doc.data();
            }
        });

        if (Object.keys(userData).length === 0) {
            console.log("Document does not exist");
        }

        // Create a new request object with the input data
        const newRequest = { input1, input2, input3 };

        // Add the new request to the existing requests array or create a new array if it doesn't exist
        const requests = userData.requests || [];
        requests.push(newRequest);
        const data = {
            requests: requests
        };

        // Update the document with the new requests array
        await setDoc(doc(db, "users", userId), data, { merge: true });

        // Send a success response to the client
        res.status(200).json({ message: 'Data added to document successfully' });
    } catch (error) {
        console.error('Error adding data to document:', error);
        res.status(500).json({ error: 'An error occurred while adding data to document' });
    }
});

// Define a new endpoint to fetch the requests for a specific user
app.get('/fetchRequests', async (req, res) => {
    try {
        const userId = globalUserId; 
        const querySnapshot = await getDocs(collection(db, "users"));
        let userData = {}; // Declare userData outside the if block

        querySnapshot.forEach(doc => {
            if (doc.id === userId) {
                userData = doc.data();
            }
        });
        console.log(userData.requests);
        res.send(userData.requests);
    } catch (error) {
        console.error('Error fetching requests:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});




app.get('/fetcher', async (req, res) => {
    return res.send(matchData);
});

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});