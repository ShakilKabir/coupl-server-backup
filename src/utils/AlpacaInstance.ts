import axios from "axios";
import { getAlpacaAuth } from "./generic.utils";

const ALPACA_BASE_URL = "https://broker-api.sandbox.alpaca.markets";
const ALPACA_DATA_BASE_URL = "https://data.sandbox.alpaca.markets";

const AlpacaInstance = axios.create({
    baseURL: ALPACA_BASE_URL,
    withCredentials: true,
});

export const getAlpacaInstance = () => {
    const auth = getAlpacaAuth();
    // console.log(`auth =`, auth, "=");
    const instance = axios.create({
        baseURL: ALPACA_BASE_URL,
        headers: {
            "content-type": "application/json",
            accept: "application/json",
            Authorization: `Basic ${auth}`,
        },
    });

    return instance;
};
export const getAlpacaDataInstance = () => {
    const auth = getAlpacaAuth();
    // console.log(`auth =`, auth, "=");
    const instance = axios.create({
        baseURL: ALPACA_DATA_BASE_URL,
        headers: {
            "content-type": "application/json",
            accept: "application/json",
            Authorization: `Basic ${auth}`,
        },
    });

    return instance;
};

export const BrokerInstance = getAlpacaInstance();
export const DataInstance = getAlpacaDataInstance();
