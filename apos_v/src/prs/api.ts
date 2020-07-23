// @ts-nocheck
import config from '@/config';
import findHost from './hostFinder';
const SERVER_PORT = 8085;
let ApiBaseURI = 'http://localhost:8085/';
let ApiBaseURIDemo = 'http://localhost:8085/';

async function prepare(){
  const slaveMode = getGlobal('slave_mode');
  if(!slaveMode) return;
  const host = await findHost(SERVER_PORT);
  ApiBaseURI = `http://${host}:${SERVER_PORT}/`;
  ApiBaseURIDemo = ApiBaseURI;
}

function _url(path: string) {
  if (config.demoMode) {
    return ApiBaseURIDemo + path;
  } else {
    return ApiBaseURI + path;
  }
}

export default _url;
export { prepare };

// @ts-ignore
window._url = _url;
window.prepare_api = prepare;
