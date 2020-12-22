///////////////////////////////////////////////////////////
const socket = io('/')
const videoGrid = document.getElementById('videoGrid')
const myVideo = document.createElement('video')
myVideo.muted = true

var peer = new Peer()

const myPeer = new Peer(undefined, {
    path: '/peerjs',
    host: '/',
    port: '3030',
    // port: '443'
})

const peers = {}
let peerlist = []
let myVideoStream
navigator.mediaDevices
    .getUserMedia({
        video: true,
        audio: true,
    })
    .then((stream) => {
        myVideoStream = stream
        addVideoStream(myVideo, stream)

        socket.on('user-connected', (userId, username) => {
            peerlist.push(userId)
            connectToNewUser(userId, stream)
            // alert('Somebody connected', userId)
        })

        socket.on('users-in-room', (usersInroom) => {
            console.log("im here")
            console.log(usersInroom)
        })

        peer.on('call', (call) => {
            call.answer(stream)
            const video = document.createElement('video')
            call.on('stream', (userVideoStream) => {
                addVideoStream(video, userVideoStream)
            })
        })

        let text = $('#chatMessage')

        $('html').keydown(function (e) {
            if (e.which == 13 && text.val().length !== 0) {
                socket.emit('message', text.val())
                text.val('')
            }
        })

        socket.on('createMessage', (message, username) => {
            $('ul').append(`<li >
								<span class="messageHeader">
									<span>
										<span class="messageSender">${username}</span> 
									</span>

									${new Date().toLocaleString('en-US', {
                hour: 'numeric',
                minute: 'numeric',
                hour12: true,
            })}
								</span>

								<span class="message">${message}</span>
							
							</li>`)
            scrollToBottom()
        })
    })
socket.on('user-disconnected', (userId) => {
    peerlist = peerlist.filter(item => item !== userId)
    // console.log(peerlist)
    if (peers[userId]) peers[userId].close()
})

peer.on('open', (id) => {
    peerlist.push(id)
    socket.emit('join-room', ROOM_ID, id, USERNAME)
})

const connectToNewUser = (userId, stream) => {
    const call = peer.call(userId, stream)
    const video = document.createElement('video')
    call.on('stream', (userVideoStream) => {
        addVideoStream(video, userVideoStream)
    })
    call.on('close', () => {
        video.remove()
    })

    peers[userId] = call
}

const addVideoStream = (video, stream) => {
    video.srcObject = stream
    video.addEventListener('loadedmetadata', () => {
        video.play()
    })
    videoGrid.append(video)
}

const scrollToBottom = () => {
    var d = $('.mainChatWindow')
    d.scrollTop(d.prop('scrollHeight'))
}

const muteUnmute = () => {
    const enabled = myVideoStream.getAudioTracks()[0].enabled
    if (enabled) {
        myVideoStream.getAudioTracks()[0].enabled = false
        setUnmuteButton()
    } else {
        setMuteButton()
        myVideoStream.getAudioTracks()[0].enabled = true
    }
}

const setMuteButton = () => {
    const html = `
	  <i class="fas fa-microphone"></i>
	  <span>Mute</span>
	`
    document.querySelector('.mainMuteButton').innerHTML = html
}

const setUnmuteButton = () => {
    const html = `
	  <i class="unmute fas fa-microphone-slash"></i>
	  <span>Unmute</span>
	`
    document.querySelector('.mainMuteButton').innerHTML = html
}

const playStop = () => {
    let enabled = myVideoStream.getVideoTracks()[0].enabled
    if (enabled) {
        myVideoStream.getVideoTracks()[0].enabled = false
        setPlayVideo()
    } else {
        setStopVideo()
        myVideoStream.getVideoTracks()[0].enabled = true
    }
}

const setStopVideo = () => {
    const html = `
	  <i class="fas fa-video"></i>
	  <span>Stop Video</span>
	`
    document.querySelector('.mainVideoButton').innerHTML = html
}

const setPlayVideo = () => {
    const html = `
	<i class="stop fas fa-video-slash"></i>
	  <span>Play Video</span>
	`
    document.querySelector('.mainVideoButton').innerHTML = html
}

///////////////////////////////////
// const stopScreenShare = () => {
//     let videoTrack = myVideoStream.getVideoTracks()[0]
//     var sender = currentPeer.getSenders().find(s => {
//         return s.track.kind == videoTrack.kind
//     })
//     sender.replaceTrack(videoTrack)
//     // sender.removeTrack()

// }
//============screen=============

// document.getElementById("shareScreen").addEventListener('click', e => {
//     navigator.mediaDevices.getDisplayMedia({
//         video: {
//             cursor: "always"
//         },
//         audio: {
//             echoCancellation: true,
//             noiseSuppression: true
//         }
//     }).then(stream => {
//         let screenVideo = document.createElement('video')
//         screenVideo.muted = true
//         let videoTrack = stream.getVideoTracks()[0]
//         videoTrack.onended = () => {
//             stopScreenShare()
//         }
//         addVideoStream(screenVideo, stream)
//         peer.on('call', (call) => {
//             call.answer(stream)
//             const video = document.createElement('video')
//             call.on('stream', (userVideoStream) => {
//                 addVideoStream(video, userVideoStream)
//             })
//             call.on('close', () => {
//                 video.remove()
//             })
//         })
//         // let sender = currentPeer.getSenders().find(s => {
//         //     console.log(s.track.kind)
//         //     return s.track.kind == videoTrack.kind
//         // })
//         // console.log("sender", sender)
//         // sender.replaceTrack(videoTrack)
//     }).catch(err => {
//         console.log("unable to share screen", err)
//     })
// })
// })


