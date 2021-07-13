const URL = 'https://chat-lets.herokuapp.com/'
const socket = io(URL);

const myPeer = new Peer(undefined, {
  host: "peerjs-server.herokuapp.com",
  port: 443
});

const videoGrid = document.getElementById('video-grid');
let myVideoStream;
const myVideo = document.createElement('video');
myVideo.muted = true;
const peers = {};

//getUserMedia Promise
navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
}).then((stream) => {

  myVideoStream = stream;

  //pause video and mute audio when establishing connection
  document.getElementById("muteButton").click();
  document.getElementById("playPauseVideo").click();
  addVideoStream(myVideo, stream)

  //On peer call, create a video element
  myPeer.on('call', (call) => {
    call.answer(stream);

    const video = document.createElement('video');
    call.on('stream', (userVideoStream) => {
      //on stream add user video stream
      addVideoStream(video, userVideoStream);
    });
  });

  //on User connection call function connectToNewUser
  socket.on('user-connected', (userId) => {
    setTimeout(() => {
      console.log('New User Connected ' + userId);
      connectToNewUser(userId, stream);
    }
      , 1000)

  })
})

//on disconnect 
socket.on('user-disconnected', (userId) => {
  if (peers[userId]) {
    peers[userId].close();
  }
  console.log('User disconnected ' + userId);
});

myPeer.on('open', (id) => {
  socket.emit('join-room', ROOM_ID, id);
})

//Connect to new user
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

//Add Video Stream to webpage
function addVideoStream(video, stream) {
  video.srcObject = stream;
  video.addEventListener('loadedmetadata', () => {
    video.play();
  })
  videoGrid.append(video);
}


//Invite people functionality
document.getElementById("invite-button").addEventListener("click", getURL);

function getURL() {
  const c_url = window.location.href;
  copyToClipboard(c_url);
  alert("Joning Link Copied to Clipboard,\nShare this with your friends!\nUrl: " + c_url);
}

function copyToClipboard(text) {
  var dummy = document.createElement("textarea");
  document.body.appendChild(dummy);
  dummy.value = text;
  dummy.select();
  document.execCommand("copy");
  document.body.removeChild(dummy);
}

//Mute and Unmute functionality
const muteUnmute = () => {
  console.log('object');
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


//Play and Pause video functionality
const PlayStop = () => {
  console.log('object');
  let enabled = myVideoStream.getVideoTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getVideoTracks()[0].enabled = false;
    SetStartVideo()
  } else {
    SetStopVideo()
    myVideoStream.getVideoTracks()[0].enabled = true
  }
}

function SetStartVideo() {
  const html = `
    <i class="stop fa fa-video-slash"></i>
    <span>Start Video</span>
  `
  document.querySelector('.main__video_button').innerHTML = html;
}

function SetStopVideo() {
  const html = `
    <i class="fa fa-video-camera"></i>
    <span>Pause Video</span>
  `
  document.querySelector('.main__video_button').innerHTML = html;
}

//Sending Chat Message functionality
let msg = document.getElementById('chat_message') //jquery

//send message on pressing enter key
document.getElementById("chat_message").addEventListener("keydown", (e) => {
  if (e.key == "Enter") {
    document.getElementById("sendMsg").click();
  }
})
//send message on button click
function SendMyMsg() {
  if (msg.value.length != 0) {
    console.log(msg.value);
    socket.emit("send_msg", msg.value)
    msg.value = '';
  }
}
//create message and keep saving messages
let local_chat_storage = document.getElementById('all_messages').innerHTML;
socket.on('create_message', message => {
  local_chat_storage += `<li class = 'message'><b>user</b><br/>${message}</li>`
  document.getElementById('all_messages').innerHTML = local_chat_storage;
})

//Leave Meeting functionality

document.getElementById("leave_button").addEventListener("click", endCall);

function endCall() {
  document.querySelector('.main__right').style.cssText = "flex: 1;";
  document.querySelector('.main__left').style.display = "none";
  document.querySelector('.start_video_call').style.display = "flex";
  document.getElementById('all_messages').innerHTML = local_chat_storage;
  myVideoStream.getVideoTracks()[0].enabled = false;
  myVideoStream.getAudioTracks()[0].enabled = false;

}

//Start Video Call on Button Click
function StartVideoCall() {
  document.querySelector('.main__left').style.display = "flex";
  document.querySelector('.main__right').style.cssText = "flex: 0.2;";
  document.querySelector('.start_video_call').style.display = "none";
  document.querySelector('.chat_invite_button').style.display = "none";

  document.getElementById("muteButton").click();
  document.getElementById("playPauseVideo").click();
  document.getElementById("muteButton").click();
  document.getElementById("playPauseVideo").click();
}

//Send claps feature
document.getElementById('send-claps').addEventListener('click', SendClaps)

function SendClaps() {
  socket.emit("send_msg", "👏")
  msg.value = '';
}
