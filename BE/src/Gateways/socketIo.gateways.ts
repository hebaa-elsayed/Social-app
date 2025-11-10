import { Socket, Server } from "socket.io";
import { Server as HttpServer } from "http";
import { verifyToken } from "../Utils";



export const connectedSockets = new Map<string, string[]>() //key: userId, value: socketId[]
let io : Server | null = null


function socketAuthentication (socket: Socket, next: Function) {
        const token = socket.handshake.auth.authorization

        const decodedData = verifyToken(token, process.env.JWT_ACCESS_SECRET as string)
        socket.data = { userId: decodedData._id}

        const userTabs = connectedSockets.get(socket.data.userId)        
        if(!userTabs) connectedSockets.set(socket.data.userId, [socket.id])
        else userTabs.push(socket.id)
        
        next();
    }


function socketDisconnection (socket: Socket) {
    socket.on('disconnect', () => {
        const userId = socket.data.userId
        let userTabs = connectedSockets.get(userId)
        if(userTabs && userTabs.length ) {
            userTabs = userTabs.filter((tab) => tab !== socket.id)
            if(!userTabs.length) connectedSockets.delete(userId)
        }
        socket.broadcast.emit('user-disconnected', {userId, socketId: socket.id})
    })
}

export const ioInitializer = (server : HttpServer) => {
    
    io = new Server(server, {cors: {origin: "*"}})
    
    io.use(socketAuthentication);
    
   
   
    io.on('connection', (socket: Socket) => {
        socketDisconnection(socket)
    })
    }


export const getIo = ()=>{
    try {
        if(!io){ throw new Error('Socket.io is not initialized')}
        return io
    } catch (error) {
        console.log(error)
    }
}