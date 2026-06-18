import { MessagingService } from './messaging.service';
import { ChatbotService } from './chatbot.service';
export declare class MessagingController {
    private readonly service;
    private readonly chatbot;
    constructor(service: MessagingService, chatbot: ChatbotService);
    getThreadsForBranch(branchId: string): Promise<import("./entities/message.entity").Message[]>;
    getOrCreateThread(req: any, body: {
        branchId: string;
    }): Promise<import("./entities/message.entity").Message>;
    getHistory(id: string): Promise<import("./entities/message-history.entity").MessageHistory[]>;
    send(id: string, req: any, body: {
        text: string;
    }): Promise<import("./entities/message-history.entity").MessageHistory>;
    markRead(id: string): Promise<{
        message: string;
    }>;
    askChatbot(req: any, body: {
        message: string;
    }): Promise<{
        reply: string;
        type: string;
    }>;
}
