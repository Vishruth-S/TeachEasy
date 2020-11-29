const socket = io('/')

const videoGrid = document.getElementById('video-grid')
var peer = new Peer(undefined, {
    path: "/peerjs",
    host: "/",
    port: "3030",
});
const myVideo = document.createElement('video')
myVideo.muted = true



let myVideoStream


var getUserMedia =
    navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia;

navigator.mediaDevices
    .getUserMedia({
        video: true,
        audio: true,
    }).then(stream => {
        myVideoStream = stream
        addVideoStream(myVideo, stream)

        peer.on('call', call => {
            call.answer(stream)
            const video = document.createElement('video')
            call.on('stream', userVideoStream => {
                addVideoStream(video, userVideoStream)
            })
        })
        socket.on('user-connected', (userId) => {
            connectToNewUser(userId, stream)
        })
    })

peer.on("call", (call) => {
    getUserMedia(
        { video: true, audio: true },
        (stream) => {
            call.answer(stream); // Answer the call with an A/V stream.
            const video = document.createElement("video");
            call.on("stream", function (remoteStream) {
                addVideoStream(video, remoteStream);
            });
        },
        (err) => {
            console.log("Failed to get local stream", err);
        }
    );
});


peer.on('open', id => {
    socket.emit('join-room', ROOM_ID, id)
})



const connectToNewUser = (userId, stream) => {
    console.log(stream)
    const call = peer.call(userId, stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
        console.log(video)
        addVideoStream(video, userVideoStream)
        console.log(userVideoStream)
    })
    call.on('close', () => {
        video.remove()
    })
    console.log('new user', userId)
}


const addVideoStream = (video, stream) => {
    video.srcObject = stream
    video.addEventListener('loadedmetadata', () => {
        video.play()
    })
    videoGrid.append(video)
    console.log(videoGrid)
}

//=================================

// const socket = io('/')
// const videoGrid = document.getElementById('video-grid')
// const myPeer = new Peer(undefined, {
//     path: '/peerjs',
//     host: '/',
//     port: '3030'
// })
// const myVideo = document.createElement('video')
// myVideo.muted = true
// const peers = {}
// navigator.mediaDevices.getUserMedia({
//     video: true,
//     audio: true
// }).then(stream => {
//     addVideoStream(myVideo, stream)

//     myPeer.on('call', call => {
//         call.answer(stream)
//         const video = document.createElement('video')
//         call.on('stream', userVideoStream => {
//             addVideoStream(video, userVideoStream)
//         })
//     })

//     socket.on('user-connected', userId => {
//         connectToNewUser(userId, stream)
//     })
// })

// socket.on('user-disconnected', userId => {
//     if (peers[userId]) peers[userId].close()
// })

// myPeer.on('open', id => {
//     socket.emit('join-room', ROOM_ID, id)
// })

// function connectToNewUser(userId, stream) {
//     const call = myPeer.call(userId, stream)
//     const video = document.createElement('video')
//     call.on('stream', userVideoStream => {
//         addVideoStream(video, userVideoStream)
//     })
//     call.on('close', () => {
//         video.remove()
//     })

//     peers[userId] = call
// }

// function addVideoStream(video, stream) {
//     video.srcObject = stream
//     video.addEventListener('loadedmetadata', () => {
//         video.play()
//     })
//     videoGrid.append(video)
// }