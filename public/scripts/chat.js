var queryParams = new URLSearchParams(window.location.search);
var requester;
requester = queryParams.get('requester');
console.log(requester);

var globalUserId;
async function fetchDataAndStart() {
    try {
        const response = await fetch('/globalUserId');
        if (!response.ok) {
            throw new Error('Failed to fetch data');
        }
        const data = await response.text(); // Use text() instead of json()
        globalUserId = data; // Assign the string response to globalUserId
        console.log(globalUserId);
        await displayChatUsers(globalUserId);
        await updateLatestMessagesForAllUsers();
    } catch (error) {
        console.error('Error fetching data:', error);
        // Handle errors
    }
}


// Display chat users in the sidebar
function displayChatUsers() {
   const userList = document.getElementById('userList');
   userList.innerHTML = '';
   userListData.forEach(user => {
      const li = document.createElement('li');
      li.classList.add('user-box');
      li.innerHTML = `
        <div class="user-name">${user}</div>
        <div class="latest-message">${getLatestMessage(user)}</div>
      `;
      li.onclick = () => startChatWithUser(user);
      userList.appendChild(li);
   });
}

// Get the latest message in the chat with the specified user
function getLatestMessage(user) {
   const latestMsg = chatMessages.find(msg =>
      (msg.sender === user && msg.receiver === 'User1') ||
      (msg.sender === 'User1' && msg.receiver === user)
   );
   return latestMsg ? latestMsg.message : '';
}

// Start chat with a user
function startChatWithUser() {
   // Update the sidebar to indicate the current user being chat with
   document.getElementById('currentChatUser').textContent = `Chatting with: ${user}`;

   // Display chat messages between the current user and the selected user
   const chatMessagesContainer = document.getElementById('chat-messages');
   chatMessagesContainer.innerHTML = '';
   chatMessages.forEach(msg => {
      if ((msg.sender === 'User1' && msg.receiver === user) || (msg.sender === user && msg.receiver === 'User1')) {
         const messageDiv = document.createElement('div');
         messageDiv.classList.add('message');
         if (msg.sender === 'User1') {
            messageDiv.classList.add('sent');
         } else {
            messageDiv.classList.add('received');
         }
         messageDiv.innerHTML = `<span class="sender">${msg.sender}</span>: ${msg.message}`;
         chatMessagesContainer.appendChild(messageDiv);
      }
   });
}

// Function to send a message
function sendMessage() {
   const messageInput = document.getElementById('message-input');
   const message = messageInput.value.trim();
   const currentChatUser = document.getElementById('currentChatUser').textContent.split(':')[1].trim(); // Extract current chat user

   if (message !== '') {
      // Add the new message to the chat messages data
      chatMessages.push({
         sender: 'User1',
         receiver: currentChatUser,
         message: message
      });
      console.log
      // Refresh the chat messages display
      startChatWithUser(currentChatUser);
      updateLatestMessagesForAllUsers();
      messageInput.value = ''; // Clear the message input field
   }
}


function updateLatestMessagesForAllUsers() {
   userListData.forEach(user => {
      getLatestMessage(user); // Call getLatestMessage for each user
   });
}

fetchDataAndStart();
