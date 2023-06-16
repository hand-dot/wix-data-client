import { errors } from '../engine/errors';
import type { ConvertionObj } from '../types';


export function convertJoinExp(convertionObj: ConvertionObj, parsedInputArr: string[], index: number) {
    convertionObj.expType = parsedInputArr[index].toUpperCase() + ' ' + 'JOIN';
    if (parsedInputArr[index + 1].toUpperCase() !== 'JOIN') {
        throw new Error(errors[46].message);
    }
    convertionObj.joinedCollectionName = parsedInputArr[index + 2];
    if (parsedInputArr[index + 3].toUpperCase() !== 'ON') {
        throw new Error(errors[47].message);
    }
    convertionObj.joinOn = {
        [parsedInputArr[index + 4]]: parsedInputArr[index + 6]
    };
    return index + 6;
}