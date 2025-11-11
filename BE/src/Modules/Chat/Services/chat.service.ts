import { Socket } from "socket.io"
import { ConversationRepository, MessageRepository } from "../../../DB/Repositories"
import { IConversation } from "../../../Common"
import { getIo } from "../../../Gateways/socketIo.gateways"

export class ChatService {
    
    private conversationRepository: ConversationRepository = new ConversationRepository()
    private messageRepository: MessageRepository = new MessageRepository()

    async joinPrivateChat (socket:Socket , targetUserId :string){
        let conversation = await this.conversationRepository.findOneDocument({
            type: 'direct',
            members: { $all: [socket.data.userId, targetUserId] }
        })
        if(!conversation){
            conversation = await this.conversationRepository.createNewDocument({
                type: 'direct',
                members: [socket.data.userId, targetUserId]
            })
        }
        socket.join(conversation._id.toString())
        return conversation
    }

    async sendPrivateMessage(   socket:Socket , data : unknown){
        const {text, targetUserId}= data as {text: string, targetUserId:string}
        const conversation = await this.joinPrivateChat(socket, targetUserId)
        
        // Create message
        const message = await this.messageRepository.createNewDocument({
            text,
            conversationId: conversation._id,
            senderId: socket.data.userId
        })

        getIo()?.to(conversation._id.toString()).emit('message-sent', message)
    }


    async getConversationMessages(socket:Socket , targetUserId :string){
        const conversation = await this.joinPrivateChat(socket, targetUserId)
        const messages = await this.messageRepository.findDocuments({conversationId: conversation._id})
        socket.emit('chat-history', messages)
    }


    async joinChatGroup(socket:Socket , targetGroupId :string){
        let conversation = await this.conversationRepository.findOneDocument({
            _id: targetGroupId,
            type: 'group'
        });
        if(!conversation){
            throw new Error('Conversation not found')
        }
        socket.join(conversation._id.toString())
        return conversation
    }

    async sendGroupMessage(socket:Socket , data : unknown){
        const {text, targetGroupId}= data as {text: string, targetGroupId:string}
        const conversation = await this.joinChatGroup(socket, targetGroupId)
        
        // Create message
        const message = await this.messageRepository.createNewDocument({
            text,
            conversationId: conversation._id,
            senderId: socket.data.userId
        })

        getIo()?.to(conversation._id.toString()).emit('message-sent', message)
    }

    async getGroupHistory(socket:Socket , targetGroupId :string){
        const messages = await this.messageRepository.findDocuments({conversationId: targetGroupId})
        socket.emit('group-chat-history', messages)
    }

}


export default new ChatService()
