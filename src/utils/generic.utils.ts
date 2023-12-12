import mongoose from 'mongoose';
export const toBase64 = (str: string) => {
  const encoded = Buffer.from(str).toString('base64');
  return encoded;
};

export const getAlpacaAuth = () => {
  const key = process.env.ALPACA_API_KEY;
  const secret = process.env.ALPACA_API_SECRET;

  // if (!key || !secret) {
  //   throw 'alpaca key/secret is missing.check env';
  // }
  const buildString = `${key}:${secret}`;
  return toBase64(buildString);
};

// export const getAppPort = () => {
//     const portText = "--port";
//     let __PORT__: string | number = 5678;
//     const argList = process.argv.slice(2);
//     const idx = argList.indexOf(portText);
//     if (idx !== -1 && Number(argList[idx + 1])) {
//         __PORT__ = argList[idx + 1];
//     } else if (process.env?.PORT) {
//         __PORT__ = process.env.PORT;
//     }
//     return __PORT__;
// };

export const strToId = (str: any) => {
  const id = new mongoose.Schema.Types.ObjectId(str);
  return id;
};
// trade auth

// export const getAlphaTradeAuth = () => {
//     const key = process.env.TRADE_API_KEY_ID;
//     const secret = process.env.TRADE_SECRET_KEY;
//     if (!key || !secret) {
//         throw "alpaca Trade key/secret is missing.check env";
//     }
//     const buildString = `${key}:${secret}`;
//     return toBase64(buildString);
// };
export function getYYYYMMDD(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
