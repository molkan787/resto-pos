import config from '@/config';
console.log(config.devMode);
const ApiBase = 'http://142.93.43.100';
let ApiBaseURI = 'http://localhost:8085/';
let ApiBaseURIDemo = 'http://localhost:8085/';
// if (config.devMode) {
//   ApiBaseURI = 'http://localhost:8081/';
//   ApiBaseURIDemo = 'http://localhost:8081/';
// }else{
//   ApiBaseURI = ApiBase + '/';
//   ApiBaseURIDemo = ApiBase + ':81/';
  
// }

function _url(path: string) {
  if (config.demoMode) {
    return ApiBaseURIDemo + path;
  } else {
    return ApiBaseURI + path;
  }
}

export default _url;

// @ts-ignore
window._url = _url;
