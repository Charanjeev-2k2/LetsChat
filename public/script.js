

const socket = io('/');
const videoGrid = document.getElementById('video-grid');
const myPeer = new Peer(undefined, {
  host: '/',
  port: '3001'
});

/////////
let myVideoStream;
////////

const myVideo = document.createElement('video');
myVideo.muted = true;
const peers = {};
navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
}).then((stream) => {

  //////
  myVideoStream = stream;
  //////
  addVideoStream(myVideo, stream)

  myPeer.on('call', (call) => {
    call.answer(stream);
    const video = document.createElement('video');
    call.on('stream', (userVideoStream) => {
      addVideoStream(video, userVideoStream);
    });
  });

  socket.on('user-connected', (userId) => {
    setTimeout(() => 
    {console.log('New User Connected ' + userId);
    connectToNewUser(userId, stream);}
    ,1000)
    
  })
})

socket.on('user-disconnected', (userId) => {
  if (peers[userId]) {
    peers[userId].close();
  }
  console.log('User disconnected ' + userId);
});

myPeer.on('open', (id) => {
  socket.emit('join-room', ROOM_ID, id);
})

function connectToNewUser(userId, stream) {
  const call = myPeer.call(userId, stream);
  const video = document.createElement('video');
  call.on('stream', (userVideoStream) => {
    addVideoStream(video, userVideoStream);
  });
  call.on('close', () => {
    video.remove();
  });

  peers[userId] = call;
}

function addVideoStream(video, stream) {
  video.srcObject = stream;
  video.addEventListener('loadedmetadata', () => {
    video.play();
  })
  videoGrid.append(video);
}



//////////////////////////////////////////////
/*const ShowChat = () => {
  if(document.getElementsByClassName("main__right").innerHTML == undefined)
  {
    const chat_html =`<!--chat area-->
    <div class="main__chat_header">
      <h6><span class="live_chat"></span>Chat</h6>
    </div>
    <div class="main__chat__window" id="main__chat__window">
      <ul class="messages" id="all_messages">

      </ul>
    </div>
    <!--message container-->
    <div class="main__message_container">
      <input type="text" id="chat_message" placeholder="Type message here.."/>
      <button class="sendMsg" id="sendMsg">
        <i class="fa fa-paper-plane"></i>
      </button>
    </div>`

    document.getElementsByClassName("main__right").innerHTML = chat_html;

  }

  else
  {
    document.getElementsByClassName("main__right").innerHTML = undefined;
  }
  
}
*/
















////Invite people

document.getElementById("invite-button").addEventListener("click", getURL);

function getURL() {
  const c_url = window.location.href;
  copyToClipboard(c_url);
  alert("Url Copied to Clipboard,\nShare it with your Friends!\nUrl: " + c_url);
}

function copyToClipboard(text) {
  var dummy = document.createElement("textarea");
  document.body.appendChild(dummy);
  dummy.value = text;
  dummy.select();
  document.execCommand("copy");
  document.body.removeChild(dummy);
}

/////////////////
const muteUnmute = () => {
  const enabled = myVideoStream.getAudioTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getAudioTracks()[0].enabled = false;
    setUnmuteButton();
  } else {
    setMuteButton();
    myVideoStream.getAudioTracks()[0].enabled = true;
  }
}


const setMuteButton = () => {
  const html = `
    <i class="fa fa-microphone"></i>
    <span>Mute</span>
  `
  document.querySelector('.main__mute_button').innerHTML = html;
}

const setUnmuteButton = () => {
  const html = `
    <i class="unmute fa fa-microphone-slash"></i>
    <span>Unmute</span>
  `
  document.querySelector('.main__mute_button').innerHTML = html;
}


////////////////////
const PlayStop = () => {
  console.log('object');
  let enabled = myVideoStream.getVideoTracks()[0].enabled;
  if(enabled) {
    myVideoStream.getVideoTracks()[0].enabled = false;
    SetStartVideo()
  } else {
    SetStopVideo()
    myVideoStream.getVideoTracks()[0].enabled = true
  }
}


function SetStartVideo()
{
  const html = `
    <i class="stop fa fa-video-slash"></i>
    <span>Start Video</span>
  `
  document.querySelector('.main__video_button').innerHTML = html;
}

function SetStopVideo()
{
  const html = `
    <i class="fa fa-video-camera"></i>
    <span>Pause Video</span>
  `
  document.querySelector('.main__video_button').innerHTML = html;
}
//////////////



////////////////////
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



////////////////////////
//Leave Meeting feature

document.getElementById("leave_button").addEventListener("click", endCall);

function endCall() {
  window.location.href = "/";
}

///////////////

