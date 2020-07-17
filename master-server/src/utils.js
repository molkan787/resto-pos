module.exports.timestamp = () => Math.floor(new Date().getTime() / 1000);

module.exports.btoa = data => Buffer.from(data).toString('base64');

module.exports.atob = data => Buffer.from(data, 'base64').toString();

module.exports.sleep = time => new Promise(resolve => setTimeout(resolve, time));
