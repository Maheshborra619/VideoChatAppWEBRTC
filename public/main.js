let Peer = require('simple-peer');
let socket = io();
const video =document.querySelector("video");

const filter = document.querySelector('#filter')
const checkboxtheme = document.querySelector('#theme')
let client = {}
let currentFilter

//get stream
navigator.mediaDevices.getUserMedia({video : true, audio : true})
.then(stream =>{
    socket.emit('newClient')
    video.srcObject = stream
    video.play();

    filter.addEventListener('change',(event)=>{
    currentFilter = event.target.value
      video.style.filter = currentFilter
  SendFilter(currentFilter)
      event.preventDefault
    })

    //use to initialize a peer
    function InitPeer(type){
let peer = new Peer({initiator: (type == 'init') ? true : false, stream : stream,trickle:false})
   peer.on('stream',function(stream) {
       CreateVideo(stream)
   })
  //  peer.on('close',function(){
  //      document.getElementById("peerVideo").remove();
  //      peer.destroy();
  //  })
   peer.on('data', function(data){
     let decodedData = new TextDecoder('utf-8').decode(data)
     let peerVideo = document.querySelector('#peerVideo')
     peerVideo.style.filter = decodedData
   })
   return peer
    }

    function RemoveVideo(){
      document.getElementById("peerVideo").remove();
    }

    //for peer of type init 
    function MakePeer(){
      client.gotAnswer = false
      let peer = new InitPeer('init')
      peer.on('signal',function(data){
        if(!client.gotAnswer){
            socket.emit("Offer",data)
        }
      })
      client.peer = peer
    }


   //for peer of type not init 
    function FrontAnswer(offer){
  let peer = InitPeer('notInit')
    peer.on('signal',(data)=>{
          socket.emit('Answer',data)
    })
    peer.signal(offer);
    client.peer = peer
    }

    function SignalAnswer(answer){
    client.gotAnswer = true
    let peer = client.peer
    peer.signal(answer)
    }

    function CreateVideo(stream){
   let div = document.createElement('div')
   div.setAttribute('class','centered')
   div.id = "muteText"
   div.innerHTML = "Click to mute/unmute"
   document.querySelector('#peerDiv').appendChild(div)
   
   
      let video = document.createElement('video')
    video.id = 'peerVideo'
    video.srcObject = stream
    video.setAttribute('class','embed-responsive-item')
    document.querySelector('#peerDiv').appendChild(video)
    video.play();
  setTimeout(() => SendFilter(currentFilter),500);   
}

function RemovePeer(){
  document.getElementById("peerVideo").remove();
  document.getElementById("muteText").remove();
  if(client.peer){
    client.peer.destroy();
  }
}

    function SessionActive(){
  document.write('Session Active already 2members joined.Please come back later');
    }

    function SendFilter(filter){
      if(client.peer){
        client.peer.send(filter)
      }
    }

    socket.on('BackOffer', FrontAnswer);
    socket.on('BackAnswer', SignalAnswer);
    socket.on('SessionActive', SessionActive);
    socket.on('CreatePeer', MakePeer);
    socket.on('Disconnect', RemovePeer);
    socket.on('RemoveVideo', RemoveVideo);
})
.catch(err => document.write(err));


checkboxtheme.addEventListener('click',()=>{
  if(checkboxtheme.checked == true){
    document.body.style.backgroundColor = "#212529"
    if(document.querySelector('#muteText')){
      document.querySelector('#muteText').style.color = '#fff'
    }
  }
  else{
    document.body.style.backgroundColor = '#fff'
    if(document.querySelector('#muteText')){
      document.querySelector('#muteText').style.color = "#212529"
    }
  }
})