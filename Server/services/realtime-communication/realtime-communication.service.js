const io = require('socket.io');
const { Service } = require('../../core/Service');

class RealtimeCommunicationService extends Service{

    constructor(services){
        super(services, RealtimeCommunicationService.name);
        this.serverSocket = null;
    }

    async init(server){
        this.serverSocket = io(server.server);
        this.serverSocket.on('connection', client => {
            this.emit('clientConnected', client);
            client.on('command', (name, payload, callback) => this.onCommand(client, name, payload, callback));
        })
    }

    onCommand(client, name, payload, callback){
        this.emit(name, payload, client, callback);
    }

    // ---- Public Methods ----

    emitCommand(name, payload){
        this.serverSocket.emit('command', name, payload);
    }

}

module.exports.RealtimeCommunicationService = RealtimeCommunicationService;