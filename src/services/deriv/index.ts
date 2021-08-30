import getAllSymbolsImport from "./GetAllSymbols";
import getHistoricalDataImport from "./GetHistoricalData";
import getServerTimeImport from "./GetServerTime";
import getSupportedResolutionsImport from "./GetSupportedRes";
import * as subscribeOHLCImport from "./SubscribeOHLC";
import subscribeToWSOpenImport from "./SubscribeToWSCon";

export const subscribeToWSOpen = subscribeToWSOpenImport;
export const getHistoricalData = getHistoricalDataImport;
export const getSupportedResolutions = getSupportedResolutionsImport;
export const subscribeToOHLC = subscribeOHLCImport.subscribeToOHLC;
export const unsubscribeFromOHLC = subscribeOHLCImport.unsubscribeFromOHLC;
export const getAllSymbols = getAllSymbolsImport;
export const getServerTime = getServerTimeImport;
