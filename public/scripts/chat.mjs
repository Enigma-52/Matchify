import pkg from './firebaseConfig.mjs';
const {
    firebaseApp,
    db,
    doc,
    setDoc,
    getDocs,
    getDoc,
    collection,
    addDoc,
    onSnapshot
} = pkg;

var globalUserId;
async function fetchDataAndStart() {
    try {
        const response = await fetch('/globalUserId');
        if (!response.ok) {
            throw new Error('Failed to fetch data');
        }
        const data = await response.text(); // Use text() instead of json()
        globalUserId = data; // Assign the string response to globalUserId
        await displayChatUsers(globalUserId);
        } catch (error) {
        console.error('Error fetching data:', error);
        // Handle errors
    }
}



// Display chat users in the sidebar
async function displayChatUsers() {
    try {
        const response = await fetch('/getChatIds');
        const userListData = await response.json();
        console.log(userListData);

        const userList = document.getElementById('userList');
        userList.innerHTML = '';

        await updateLatestMessagesForAllUsers(userListData);

        userListData.forEach(async user => {
            const li = document.createElement('li');
            li.classList.add('user-box');
            li.innerHTML = `
                <div class="user-name">${user.slice(-6)}</div>
                <div class="latest-message">${await getLatestMessage(user)}</div>
                <div class="close-chat">X</div>
            `;
            li.onclick = () => startChatWithUser(user);
            li.querySelector('.close-chat').addEventListener('click', async (event) => 
            {
                const querySnapshot = await getDocs(collection(db, "users"));
                console.log("close clicked");
                // Update chats for globalUserId
                for (const doc of querySnapshot.docs) {
                    if (doc.id === globalUserId) {
                        const chats = doc.data().chats || [];
                        const updatedChats = chats.filter(id => id !== user);
                        await setDoc(doc.ref, { chats: updatedChats }, { merge: true });
                    }
                }

                // Update chats for requester
                for (const doc of querySnapshot.docs) {
                    if (doc.id === user) {
                        const chats = doc.data().chats || [];
                        const updatedChats = chats.filter(id => id !== globalUserId);
                        await setDoc(doc.ref, { chats: updatedChats }, { merge: true });
                    }
                }

                li.remove();
                const chatArea = document.getElementById('chat-area');
                chatArea.innerHTML = '';
            });
            userList.appendChild(li);
        });
    } catch (error) {
        console.error('Error displaying chat users:', error);
    }
}

async function getLatestMessage(user) {
    try {
        const usersCollectionRef = collection(db, 'users');
        const querySnapshot = await getDocs(usersCollectionRef);

        let latestMessage = null;

        querySnapshot.forEach(doc => {
            const userData = doc.data();
            const messages = userData.messages || [];

            messages.forEach(message => {
                if ((message.sender === globalUserId && message.receiver === user) || (message.sender === user && message.receiver === globalUserId)) {
                    if (!latestMessage || message.timestamp > latestMessage.timestamp) {
                        latestMessage = message;
                    }
                }
            });
        });

        console.log("latest: ", latestMessage);
        var text='';
        if(latestMessage && latestMessage.sender == globalUserId)
        {
            text="You: " + latestMessage.message;
        }
        else text=latestMessage.message;

        return latestMessage ? text : '';
    } catch (error) {
        console.error('Error fetching latest message:', error);
        return ''; // Return empty string in case of error
    }
}

var userId;
// Start chat with a user
async function startChatWithUser(user) {
    userId = user;
    document.getElementById('currentChatUser').textContent = `Chatting with: ${userId.slice(-6)}`;
    
    var chatInput = document.querySelector('.chat-input');
    chatInput.removeAttribute('hidden');

    // Display chat messages between the current user and the selected user
    const chatMessagesContainer = document.getElementById('chat-messages');
    chatMessagesContainer.innerHTML = '';

    // Reference to the collection of users
    const usersCollectionRef = collection(db, 'users');

    // Set up a real-time listener for the selected user's document
    onSnapshot(doc(usersCollectionRef, user), (doc) => {
        if (doc.exists()) {
            const userData = doc.data();
            const messages = userData.messages || []; // Assuming messages are stored in an array within each user document

            // Update the chat messages
            updateChatMessages(messages);
        }
    });
}

// Helper function to update the chat messages in the UI
function updateChatMessages(messages) {
    const chatMessagesContainer = document.getElementById('chat-messages');
    chatMessagesContainer.innerHTML = ''; // Clear existing messages

    messages.forEach(msg => {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message');
        if (msg.sender === globalUserId) {
            messageDiv.classList.add('sent');
        } else {
            messageDiv.classList.add('received');
        }
        messageDiv.innerHTML = `<span class="sender"></span>${msg.message}`;
        chatMessagesContainer.appendChild(messageDiv);
    });
}

async function sendMessage() {
    const messageInput = document.getElementById('message-input');
    const message = messageInput.value.trim();
    messageInput.value='';
    const currentChatUser = userId;
    console.log("sending");
    if (message !== '') {
        try {
            if(1){
            const querySnapshot = await getDocs(collection(db, "users"));
            let userData = {}; // Declare userData outside the if block

            querySnapshot.forEach(doc => {
                if (doc.id === globalUserId) {
                    userData = doc.data();
                }
            });
            const messages = userData.messages || [];

            const newMessage = {
                sender: globalUserId,
                receiver: currentChatUser,
                message: message,
                timestamp: new Date()
            };

            messages.push(newMessage);

            // Update the Firestore document with the updated messages array
            try {
                await setDoc(doc(db, "users", globalUserId), { messages: messages }, { merge: true });
                console.log('Message added successfully');
            } catch (error) {
                console.error('Error adding message:', error);
            }
            }
            if(2)
            {
                const querySnapshot = await getDocs(collection(db, "users"));
            let userData = {}; // Declare userData outside the if block

            querySnapshot.forEach(doc => {
                if (doc.id === currentChatUser) {
                    userData = doc.data();
                }
            });
            const messages = userData.messages || [];

            const newMessage = {
                sender: globalUserId,
                receiver: currentChatUser,
                message: message,
                timestamp: new Date()
            };

            messages.push(newMessage);

            // Update the Firestore document with the updated messages array
            try {
                await setDoc(doc(db, "users", currentChatUser), { messages: messages }, { merge: true });
                console.log('Message added successfully');
            } catch (error) {
                console.error('Error adding message:', error);
            }
            }
            
            // Refresh the chat messages display
            startChatWithUser(currentChatUser);
            displayChatUsers();

            messageInput.value = ''; // Clear the message input field
        } catch (error) {
            console.error('Error sending message:', error);
        }
    }
}



function updateLatestMessagesForAllUsers(userListData) {
   userListData.forEach(user => {
      getLatestMessage(user); // Call getLatestMessage for each user
   });
}

fetchDataAndStart();

export {sendMessage};
