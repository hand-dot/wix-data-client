import { errors } from '../engine/errors';
import type { ConvertionObj } from '../types';

export function convertLimitExp(convertionObj: ConvertionObj, parsedInputArr: string[], index: number) {
    if (index >= parsedInputArr.length) {
        throw new Error(errors[26].message);
    }
    const limitationValue = parseInt(parsedInputArr[index]);
    convertionObj.limit = limitationValue;
    return index;
}