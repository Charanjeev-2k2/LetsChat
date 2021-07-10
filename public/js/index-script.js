const socket = io('/');




let msg = document.getElementById('chat_message') //jquery

//chatt message////////////////////////
document.getElementById("chat_message").addEventListener("keydown", (e) =>{
  if(e.key == "Enter"){
    document.getElementById("sendMsg").click();
  }
})
document.getElementById("sendMsg").addEventListener("click", () =>{
  if(msg.value.length != 0){
    console.log(msg.value);
    socket.emit("send_msg", msg.value)
    msg.value = '';
  }
})

//create message //add to list of messages
socket.on('create_message', message => {
    document.getElementById('all_messages').innerHTML += `<li class = 'message'><b>user</b><br/>${message}</li>`;
  })
  