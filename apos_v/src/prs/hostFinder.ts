// @ts-nocheck
const Evilscan = imp('evilscan');

export default function hostFinder(port){
    return new Promise((resolve, reject) => {
        const scanner = new Evilscan({
            target: '192.168.1.1-254',
            port: port.toString(),
            status: 'O',
            timeout: 3000,
        });

        scanner.on('result', data => {
            if(data.status == 'open'){
                resolve(data.ip);
                scanner.pause();
            }
        });

        scanner.on('done', () => reject('Could not find server host/ip'));

        scanner.run();
    });
}