// @ts-nocheck
const EventEmitter = require('events').EventEmitter;
const SerialPort = imp('serialport');
const InterByteTimeout = imp('@serialport/parser-inter-byte-timeout');
const { parse } = imp('comet-parser');

const COMET_SERIAL_NUMBER = 'COMET';
const COMET_BAUD_RATE = 1200;

export default class CometCallerId extends EventEmitter{

    constructor(){
        super();
        this.retryTime = 1000 * 15;
        this.maxRetryTime = 1000 * 60 * 1;
        this.retrytimer = null;
        this.startAttempts = 0;
        this.maxStartAttempts = 20;
    }

    start(autoRetry){
        this._start()
        .catch(err => {
            this.emit('error', err);
            if(autoRetry && this.startAttempts++ < this.maxStartAttempts){
                this.retrytimer = setTimeout(() => this.start(autoRetry), this.retryTime);
                this.retryTime *= 2;
                this.retryTime = Math.max(this.retryTime, this.maxRetryTime);
            }else{
                console.error(new Error('CometCallerId: max start attempts reached'));
            }
        });
    }

    stop(){
        if(this.started){
            this.stop();
        }
        if(this.retrytimer){
            clearTimeout(this.retrytimer);
        }
    }

    async _start(){
        const portname = await this._findPort();
        if(!portname) return
        const port = await this._openPort(portname);
        const parser = port.pipe(new InterByteTimeout({interval: 50}));
        parser.on('data', data => this.handleData(data));
        port.on('error', err => this.emit('error', err));
        this.port = port;
        this.parser = parser;
        this.started = true;
        this.emit('started');
    }

    _stop(){
        this.port.close();
        this.port.destroy();
        this.port = null;
        this.parser.destroy();
        this.parser = null;
        this.emit('stoped');
    }

    handleData(rawdata){
        const data = parse(rawdata);
        this.emit('got-call', data);
    }

    _openPort(portname){
        return new Promise((resolve, reject) => {
            const port = new SerialPort(`\\\\.\\${portname}`, { baudRate: COMET_BAUD_RATE }, function (err) {
                if (err) {
                    return reject(err);
                }else{
                    resolve(port);
                }
            })
        });
    }

    async _findPort(){
        const devices = await SerialPort.list();
        for(let device of devices){
            if(device.serialNumber === COMET_SERIAL_NUMBER){
                return device.path;
            }
        }
        return null
    }

}
