import config from '../config';
const cs = config.app.currencySign;

export default function price(value: any){
  let val = parseFloat(value) / 100;
  if(val < 0)
      return '- ' + cs + (-val).toFixed(2);
  else
      return cs + val.toFixed(2);
}