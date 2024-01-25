
export function sleep(time: number): Promise<void>{
    return new Promise(r => setTimeout(r, time));
}

export function readFile(filename: import('fs').PathLike, options: { encoding?: BufferEncoding, flags?: string }){
    return new Promise((resolve, reject) => {
        // @ts-ignore
        imp('fs').readFile(filename, options, (err, data) => {
            if(err) reject(err)
            else resolve(data)
        })
    })
}

export function deleteFile(filename: import('fs').PathLike){
    return new Promise((resolve, reject) => {
        // @ts-ignore
        imp('fs').unlink(filename, (err) => {
            if(err) reject(err)
            else resolve(true)
        })
    })
}