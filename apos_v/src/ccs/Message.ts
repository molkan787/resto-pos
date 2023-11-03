// @ts-nocheck
import MessageResponse from './MessageResponse';

export default class Message{

    private static component: any;

    static info(text: string, title?: string): Promise<MessageResponse>{
        return this.component.show({
            title: title || 'Information',
            text,
            type: 1
        });
    }

    static ask(text: string, title?: string): Promise<MessageResponse>{
        return this.component.show({
            title: title || 'Confirmation',
            text,
            type: 2
        });
    }

    static async quickAsk(text: string, title?: string){
        const result = await this.ask(text, title)
        result.hide()
        return result.answer
    }

    // ---------------------------

    static register(component: any){
        this.component = component;
    }

}

window.info = function() { return Message.info(...arguments) };
window.ask = function() { return Message.ask(...arguments) };
window.quickAsk = function() { return Message.quickAsk(...arguments) };