var globalUserId;

function createModal(userId) {
    // Create the modal container
    const modal = document.createElement('div');
    modal.className = 'modal';

    // Create the modal content
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close">&times;</span>
            <h2>Popup Modal for User ${userId}</h2>
            <label for="input1">Input 1:</label>
            <input type="text" id="input1" name="input1"><br><br>
            <label for="input2">Input 2:</label>
            <input type="text" id="input2" name="input2"><br><br>
            <label for="input3">Input 3:</label>
            <input type="text" id="input3" name="input3"><br><br>
            <button class="skip-button">Skip</button>
            <button class="send-button">Send</button>
        </div>
    `;

    // Append the modal to the document body
    document.body.appendChild(modal);

    // Get the close button
    const closeButton = modal.querySelector('.close');
    closeButton.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    const skipButton = modal.querySelector('.skip-button');
    skipButton.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    // Get the send button
    const sendButton = modal.querySelector('.send-button');

    // Add event listener for send button
    sendButton.addEventListener('click', () => {
        console.log('Send button clicked');
        const input1 = modal.querySelector('#input1').value;
        const input2 = modal.querySelector('#input2').value;
        const input3 = modal.querySelector('#input3').value;
        sendUserData(userId, input1, input2, input3); // Call function to send data to server
        modal.style.display = 'none'; // Close the modal after sending data
    });

    // Display the modal
    modal.style.display = 'block';
}

// Function to send user data to the server
function sendUserData(userId, input1, input2, input3) {
    // Construct the request body
    console.log(userId);
    const body = JSON.stringify({ userId, input1, input2, input3 });

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
}
// Fetch matching songs data from the server and update the table
fetch('/fetcher')
.then(response => response.json())
.then(data => {
    console.log('Matching Songs Counts:', data);
    
    // Update the table with the received data
    const matchingSongsBody = document.getElementById('matchingSongsBody');
    
    data.forEach(entry => {
        globalUserId = entry.globalUserId;
        console.log("id is " + globalUserId);
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${entry.userId}</td>
            <td>${entry.matchingSongsCount}</td>
            <td><button class="modal-button" onclick="createModal('${entry.userId}')">Open Modal</button></td>
        `;
        matchingSongsBody.appendChild(row);
    });
})
.catch(error => {
    console.error('Error fetching matching songs:', error);
    // Handle error
});

