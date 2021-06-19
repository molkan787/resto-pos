const io = require('socket.io');
const { Service } = require('../../core/Service');

class RealtimeCommunicationService extends Service{

    constructor(services){
        super(services, RealtimeCommunicationService.name);
        this.serverSocket = null;
    }

    async init(server){
        this.serverSocket = io(server.server);
        this.serverSocket.on('connection', (client, ...args) => {
            console.log('client connected!')
            client.emit('command', 'test', { foo: 'bar' })
            console.log('command emitted!')
        })
    }

}

module.exports.RealtimeCommunicationService = RealtimeCommunicationService;