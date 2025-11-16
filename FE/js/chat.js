
const baseURL = 'http://localhost:3000'
const JWT_PREFIX = "social-app"
function getToken() {
    const token = localStorage.getItem("token")
    if(!token){
        alert("Please login first")
        window.location.href = "/"
        throw new Error("Please login first")
    }
    return token
}



let globalProfile = {};
const token = getToken()
const headers = {
    'Content-Type': 'application/json; charset=UTF-8',
    'authorization': `${JWT_PREFIX} ${token}`
};
const clientIo = io(baseURL, {auth: { authorization: `${JWT_PREFIX} ${token}` }})

clientIo.on("server_error", (err) => {
    console.log("custom_error:", err.message);
});

clientIo.on('connected', ({user})=>{
    console.log({user});
    globalProfile = user
})

// get online status 
clientIo.on("online-users", users=>{
    $(".closeSpan").text("🔴").show();
    users.forEach(id => {
        $(`.chatUser[data-user-id='${id}'] .closeSpan`).text("🟢").show();
    });
})

// get typing status
clientIo.on("typing", (data)=>{
    if (data.from !== globalProfile._id){
        $("#typingIndicator").text("typing...");
        setTimeout(()=>{
            $("#typingIndicator").text("");
        }, 200000)
    }    
})

clientIo.on("disconnected_user", data => {
    console.log({ data });
})

$("#messageBody").on("input", function(){
    const targetUserId = $('.chatUser.active').data('userId')
    if(targetUserId){
        clientIo.emit('typing', {targetUserId})
    }
})


//images links
let avatar = './avatar/Avatar-No-Background.png'
let meImage = './avatar/Avatar-No-Background.png'
let friendImage = './avatar/Avatar-No-Background.png'


// collect messageInfo
function sendMessage(sendTo, type) {
    if (type == "ovo") {
        const data = {
            text: $("#messageBody").val(),
            targetUserId:sendTo,
        }
        clientIo.emit('send-private-message', data)
    } else if (type == "ovm") {        
        const data = {
            text: $("#messageBody").val(),
            targetGroupId: sendTo,
        }        
        clientIo.emit('send-group-message', data)
    }
}

//sendCompleted
clientIo.on('message-sent', (data) => {
    
    const { text , senderId } = data
    const div = document.createElement('div');

    div.className = 'me text-end p-2';

    if(senderId.toString()  == globalProfile._id)  div.dir = 'rtl';
    else  div.dir = 'ltr';

    const imagePath= avatar;
    div.innerHTML = `
        <img class="chatImage" src="${imagePath}" alt="" srcset="">
        <span class="mx-2">${text}</span>
    `;
    document.getElementById('messageList').appendChild(div);
    $(".noResult").hide()
    $("#messageBody").val('')

    const audio = document.getElementById("notifyTone");
    audio.currentTime = 0; // restart from beginning
    audio.play().catch(err => console.log("Audio play blocked:", err));
})

function renderMyMessage(text) {
    const div = document.createElement('div');
    div.className = 'me text-end p-2';
    div.dir = 'rtl';
    div.innerHTML = `
    <img class="chatImage" src="${meImage}" alt="" srcset="">
    <span class="mx-2">${text}</span>
    `;
    document.getElementById('messageList').appendChild(div);
}

function renderFriendMessage(text) {
    const div = document.createElement('div');
    div.className = 'myFriend p-2';
    div.dir = 'ltr';
    div.innerHTML = `
    <img class="chatImage" src="${friendImage}" alt="" srcset="">
    <span class="mx-2">${text}</span>
    `;
    document.getElementById('messageList').appendChild(div);
}

function SayHi(){
    const div = document.createElement('div');
    div.className = 'noResult text-center  p-2';
    div.dir = 'ltr';
    div.innerHTML = `
    <span class="mx-2">Say Hi to start the conversation.</span>
    `;
    document.getElementById('messageList').appendChild(div);
}


// Show Friends list  and groups list
function getUserData() {
    axios({
        method: 'get',
        url: `${baseURL}/api/users/list-friend-requests?status=accepted`,
        headers
    }).then(function (response) {
        console.log(response);
        
        const data = response.data.data.data;

        let imagePath = avatar;
        document.getElementById("profileImage").src = imagePath
        document.getElementById("userName").innerHTML = `${globalProfile.firstName}`
        
        showUsersData(data.requests)
        showGroupList(data.groups)
    }).catch(function (error) {
        console.log(error);
    });
}


//=========================================== PRIVATE CHAT ====================================//
// Show friends list
function showUsersData(users = []) {

    let cartonna = ``
    for (let i = 0; i < users.length; i++) {
        let friend ;        
        if(globalProfile._id == users[i].requestToId._id.toString()){
            friend = users[i].requestFromId            
        }else{
            friend = users[i].requestToId
        }
        
        console.log({friend});
        

        let imagePath = avatar;
        cartonna += `
        <div onclick="displayChatUser('${friend._id}')" class="chatUser my-2" data-user-id="${friend._id}">
        <img class="chatImage" src="${imagePath}" alt="" srcset="">
        <span class="ps-2">${friend?.firstName}  ${friend?.lastName}</span>
        <span id="${"c_" + friend._id}" class="ps-2 closeSpan">
            🟢
        </span>
        </div>
        
        `
    }
    document.getElementById('chatUsers').innerHTML = cartonna;
}

//  Show chat conversation when sending new message
function showData(sendTo, chat) { 
    console.log(sendTo);
       
    document.getElementById("sendMessage").setAttribute("onclick", `sendMessage('${sendTo}' , "ovo")`);
    document.getElementById('messageList').innerHTML = ''
    if (chat?.length) {
        $(".noResult").hide()
        for (const message of chat) {

            if (message.senderId.toString() == globalProfile._id.toString()) {
                renderMyMessage(message.text, meImage)
            } else {
                renderFriendMessage(message.text, friendImage)
            }
        }
    } else {
        SayHi()
    }
    $(`#c_${sendTo}`).hide();
}

// get chat conversation between 2 users and pass it to ShowData fun
function displayChatUser(userId) {
    clientIo.emit('get-chat-history',userId )
    clientIo.on('chat-history', (chat)=>{
        if(chat.length) showData(userId, chat) 
        else showData(userId, 0)
    })
}

//=========================================== GROUPS ====================================//
// Show groups list
function showGroupList(groups = []) {    
    let cartonna = ``
    for (let i = 0; i < groups.length; i++) {
        let imagePath = avatar;
        cartonna += `
        <div onclick="displayGroupChat('${groups[i]._id}')" class="chatUser my-2">
        <img class="chatImage" src="${imagePath}" alt="" srcset="">
        <span class="ps-2">${groups[i].name}</span>
           <span id="${"g_" + groups[i]._id}" class="ps-2 closeSpan">
        </span>
        </div>
        `
    }
    document.getElementById('chatGroups').innerHTML = cartonna;
}

// Show  group chat conversation history
function showGroupData(sendTo, chat) {    
    document.getElementById("sendMessage").setAttribute("onclick", `sendMessage('${sendTo}' , "ovm")`);

    document.getElementById('messageList').innerHTML = ''
    if (chat?.length) {
        $(".noResult").hide()
        for (const message of chat) {
            if (message.senderId.toString() == globalProfile._id.toString()) {
                renderMyMessage(message.text, meImage)
            } else {
                renderFriendMessage(message.text, friendImage)
            }
        }
    } else {
        SayHi()
    }
    $(`#g_${sendTo}`).hide();
}

// get group chat conversation between 2 users and pass it to ShowData fun
function displayGroupChat(groupId) {
    clientIo.emit("get-group-chat", groupId)
    clientIo.on("group-chat-history", (chat)=>{
        if(chat?.length){
            showGroupData(groupId, chat)
        }else{
            showGroupData(groupId, 0)
        }
    })
}

getUserData()




