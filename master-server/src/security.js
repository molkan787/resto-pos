const md5 = require('md5');
const config = require('./config');
const { timestamp, btoa, atob } = require('./utils');

module.exports = class Security{

    static generateToken(data, expireIn){
        const expireTime = timestamp() + parseInt(expireIn);
        const content = `${expireTime}:${data}`;
        const signature = this.sign(content);
        const rawToken = `${signature}:${content}`;
        const token = btoa(rawToken);
        return token;
    }

    static getTokenData(token){
        if(!token || token.length == 0) throw new Error('Invalid argument');
        const { signature, expire, data } = this.parseToken(token);
        const content = `${expire}:${data}`;
        if(!this.verify(content, signature)){
            throw new Error('Invalid signature.');
        }
        if(expire < timestamp()){
            throw new Error('Token expired.');
        }
        return data;
    }

    static verify(content, signature){
        if(typeof signature != 'string' || signature.length < 1){
            throw new Error('Invalid signature, given input is a non string data type or an empty string.');
        }
        return this.sign(content) === signature;
    }

    static sign(content){
        if(typeof content != 'string' || content.length < 1){
            throw new Error('Invalid content, given input is a non string data type or an empty string.');
        }
        return md5(content + config.secret);
    }

    static parseToken(token){
        let raw;
        try {
            raw = atob(token);
        } catch (error) {
            throw new Error('Invalid Base64 encoding.');
        }
        const [ signature, expire ] = raw.split(':', 2);
        if(!signature || !expire) throw new Error('Invalid token format.');
        const data = raw.substr(signature.length + expire.length + 2);
        if(!data) throw new Error('Invalid token format.');
        return {
            signature,
            expire: parseInt(expire),
            data
        }
    }

}