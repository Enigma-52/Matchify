var globalUserId;

function createModal(userId) {
    // Create the modal container
    const modal = document.createElement('div');
    modal.className = 'modal';

    // Call the getUserDetails endpoint to fetch user details from the server
    fetch(`/getUserDetails?userId=${userId}`)
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error('Network response was not ok.');
        })
        .then(userData => {
            // Handle the user data returned from the server
            console.log(userData); // Log inside the Promise chain to ensure it's logged after fetching data
            
            // Create the modal content
            modal.innerHTML = `
            <div class="modal-content p-6">
            <span class="close">&times;</span>
            <h2 class="text-xl font-bold mb-4">User Details for ${userData.data.name}</h2>
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <p><strong>Name:</strong></p>
                    <p>${userData.data.name}</p>
                </div>
                <div>
                    <p><strong>Age:</strong></p>
                    <p>${userData.data.age}</p>
                </div>
                <div>
                    <p><strong>Sexuality:</strong></p>
                    <p>${userData.data.sexuality}</p>
                </div>
                <div>
                    <p><strong>Gender:</strong></p>
                    <p>${userData.data.gender}</p>
                </div>
                <div>
                    <p><strong>City:</strong></p>
                    <p>${userData.data.city}</p>
                </div>
                <div class="col-span-2">
                    <label for="input1" class="block">Input 1:</label>
                    <input type="text" id="input1" name="input1" class="input-field">
                </div>
                <div class="col-span-2">
                    <label for="input2" class="block">Input 2:</label>
                    <input type="text" id="input2" name="input2" class="input-field">
                </div>
                <div class="col-span-2">
                    <label for="input3" class="block">Input 3:</label>
                    <input type="text" id="input3" name="input3" class="input-field">
                </div>
            </div>
            <div class="mt-6 flex justify-between">
                <button class="button skip-button mr-4">Skip</button>
                <button class="button send-button">Send</button>
            </div>
        </div>
        
            `;
            
            // Append the modal to the document body
            document.body.appendChild(modal);

            // Get the close button
            const closeButton = modal.querySelector('.close');
            closeButton.addEventListener('click', () => {
                modal.style.display = 'none';
            });

            // Get the skip button
            const skipButton = modal.querySelector('.skip-button');
            skipButton.addEventListener('click', () => {
                console.log("Skip button working?");
                console.log(globalUserId);
                console.log(userId);
                fetch('/skipped', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ globalUserId, userId })
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Failed to send data to server');
                    }
                })
                .catch(error => {
                    console.error('Error sending data to server:', error);
                });
                fetchMatchingSongs();
                modal.style.display = 'none';
                setTimeout(function() {
                    location.reload();
                }, 500);
            });

            // Get the send button
            const sendButton = modal.querySelector('.send-button');
            sendButton.addEventListener('click', () => {
                console.log('Send button clicked');
                const input1 = modal.querySelector('#input1').value;
                const input2 = modal.querySelector('#input2').value;
                const input3 = modal.querySelector('#input3').value;
                sendUserData(globalUserId,userId, input1, input2, input3);
                fetch('/skipped', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ globalUserId, userId })
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Failed to send data to server');
                    }
                })
                .catch(error => {
                    console.error('Error sending data to server:', error);
                });
                fetchMatchingSongs();
                modal.style.display = 'none';
                setTimeout(function() {
                    location.reload();
                }, 500);

            });
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });

    // Display the modal
    modal.style.display = 'block';
}

async function sendUserData(globalUserId,userId, input1, input2, input3) {
    // Construct the request body
    console.log(userId);
    const body = JSON.stringify({ globalUserId,userId, input1, input2, input3 });
    //Remove this match from both sides
    console.log(body);
    // Send a POST request to the server endpoint
    fetch('/reqSender', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: body
    })
    .then(response => {
        if (response.ok) {
            console.log('Data sent successfully');
        } else {
            console.error('Failed to send data');
        }
    })
    .catch(error => {
        console.error('Error sending data:', error);
    });
    fetchMatchingSongs();
}


function fetchMatchingSongs() {
    // Fetch matching songs data from the server and update the table
    fetch('/fetcher')
        .then(response => response.json())
        .then(data => {
            console.log('Matching Songs Counts:', data);
            
            // Update the table with the received data
            const matchingSongsBody = document.getElementById('matchingSongsBody');
            matchingSongsBody.innerHTML = '';
            console.log("Data---");
            console.log(data);
            data.forEach(entry => {
                // Get the key of the entry object (0, 1, etc.)
                const key = Object.keys(entry)[0];
                // Access the data within the entry object using the key
                const entryData = entry[key];
                
                console.log(entryData);
                globalUserId=entryData.globalUserId;
                const userId = entryData.userId;
                const matchingSongsCount = entryData.matchingSongsCount;
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${userId.slice(-6)}</td>
                    <td>${matchingSongsCount}</td>
                    <td><button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"  onclick="createModal('${userId}')">Open Modal</button></td>
                `;
                matchingSongsBody.appendChild(row);
            });
        })
        .catch(error => {
            console.error('Error fetching matching songs:', error);
            // Handle error
        });
}







// Call the function initially
fetchMatchingSongs();

