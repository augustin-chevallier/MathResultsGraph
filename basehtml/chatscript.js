console.log(MathJax)

var socket = io.connect('http://mathgraph.duckdns.org/');//'http://localhost:5001');
var user_id = localStorage.getItem('user_id');
if (!user_id) {
    // If no user ID exists, generate one and store it in localStorage
    user_id = generateUserId();
    localStorage.setItem('user_id', user_id);
}        
console.log(user_id)
socket.emit('/gpt/join_room', {'room': user_id});



function sendMessage() {

  const userMessage = document.getElementById('user-message').value;

  // Display user's message in the chat
  displayUserMessage(userMessage);

  console.log(userMessage)
  // Send the message to the backend through WebSocket
  socket.emit('/gpt/ask_gpt', {'user_id': user_id, 'message': userMessage});


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
  messageElement.className = 'message user-message';
  messageElement.innerHTML = "<b>User:</b> <br> " + message + "<br><br>";
  chatContainer.appendChild(messageElement);
  MathJax.typeset([chatContainer]);
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
      replacement = String.raw`<a href="javascript:displayGraph.selectNode(displayGraph.getCyNode('` + label + String.raw`'),true)" style="display:inline">` + label + "</a>"
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
  messageElement.className = 'message bot-message';
  messageElement.innerHTML = "<b>GPT</b> <br> \n";
  chatContainer.appendChild(messageElement);
}

function endMessage(){
  var chatContainer = document.getElementById('chat-messages');
  var messageElement = chatContainer.lastChild;
  messageElement.innerHTML += "<br><br>";
  MathJax.typeset([chatContainer]);
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


function copyNode(){
  document.getElementById('user-message').value += selectedNode.data().latexMainText;

}