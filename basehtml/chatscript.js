var socket = io.connect('http://localhost:5001');
var user_id = localStorage.getItem('user_id');
if (!user_id) {
    // If no user ID exists, generate one and store it in localStorage
    user_id = generateUserId();
    localStorage.setItem('user_id', user_id);
}        
console.log(user_id)
socket.emit('join_room', {'room': user_id});



function sendMessage() {

  const userMessage = document.getElementById('user-message').value;

  // Display user's message in the chat
  displayUserMessage(userMessage);

  console.log(userMessage)
  // Send the message to the backend through WebSocket
  socket.emit('ask_gpt', {'user_id': user_id, 'message': userMessage});


  // Clear the input field
  document.getElementById('user-message').value = '';

  // Scroll to the bottom of the chat container
  const chatMessages = document.getElementById('chat-messages');
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Function to generate a unique user ID
function generateUserId() {
  return 'user_' + Math.random().toString(36).substr(2, 9);
}


function displayUserMessage(message){
  var chatContainer = document.getElementById('chat-messages');
  messageElement = document.createElement('div');
  messageElement.className = 'message User-message';
  messageElement.innerHTML = "<b>User:</b> <br> " + message;
  chatContainer.appendChild(messageElement);
}

// Function to display a message in the chat
function displayStream(message) {
  var chatContainer = document.getElementById('chat-messages');
  var messageElement = chatContainer.lastChild;//document.createElement('span');
  
  messageElement.innerHTML += message;

  str = messageElement.innerHTML
  let result = str.indexOf("\\ref{");
  if(result > 0){
    result += 5
    end = str.indexOf("}",result)
    if(end > 0){
      label = str.substring(result,end)
      console.log("LABREL",label,result,end)
      replacement = String.raw`<a href="javascript:selectNode(getCyNode('` + label + String.raw`'),true)" >` + label + "</a>"
      str = str.replace("\\ref{"+label+"}",replacement)
      messageElement.innerHTML = str 
    }
  }

  console.log(message)
  chatContainer.appendChild(messageElement);
}

function startMessage(){
  var chatContainer = document.getElementById('chat-messages');
  messageElement = document.createElement('div');
  messageElement.className = 'message Chatbot-message';
  messageElement.innerHTML = "<b>GPT</b> <br> \n";
  chatContainer.appendChild(messageElement);
}

function endMessage(){

}

// Listen for responses from the server and update the chat
socket.on('gpt_response', function(data) {
  var type = data.type
  console.log('msg',data)
  if(type == 'end'){
      endMessage()
  }
  if(type == 'start'){
      console.log('start')
      startMessage()
  }
  if(type == 'stream'){
      var response = data.response;
      var chat_history = data.chat_history;
      console.log(response)

      console.log(data)
      console.log("sdfsdf")
      // Display GPT's response in the chat
      displayStream(response);
  }
});






/*
function sendMessage() {
    const userMessage = document.getElementById('user-message').value;
    if (userMessage.trim() === '') return;
  
    // Display user message
    displayMessage('user', userMessage);
  
    // Simulate response from the chatbot (replace with your actual chatbot logic)
    const botResponse = simulateBotResponse(userMessage);
  
    // Display bot response
    displayMessage('bot', botResponse);
  
    // Clear the input field
    document.getElementById('user-message').value = '';
  
    // Scroll to the bottom of the chat container
    const chatMessages = document.getElementById('chat-messages');
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
  
  function simulateBotResponse(userMessage) {
    // Replace this with your actual chatbot logic or API call
    // For demonstration purposes, it echoes the user's message
    return `You said: "${userMessage}"`;
  }
  
  function displayMessage(sender, message) {
    const chatMessages = document.getElementById('chat-messages');
    const messageElement = document.createElement('div');
    
    // Create a label indicating whether the message is from the user or chatbot
    const label = document.createElement('span');
    label.style.fontWeight = 'bold';
    label.textContent = sender === 'user' ? 'User:' : 'Chatbot:';
  
    // Add a line break after the label
    label.innerHTML += '<br>';
  
    // Set the message text
    const messageText = document.createElement('span');
    messageText.textContent = message;
  
    // Append label and message text to the message element
    messageElement.appendChild(label);
    messageElement.appendChild(messageText);
  
    // Dynamically set the class based on the sender
    messageElement.className = `message ${sender}-message`;
  
    // Append the message element to the chat container
    chatMessages.appendChild(messageElement);
  
    // Scroll to the bottom of the chat container
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
  */