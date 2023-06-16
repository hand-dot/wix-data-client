import { errors } from '../engine/errors';
import { convertCollectionName } from './general';
import { convertCondExp } from './where';
import type { ConvertionObj } from '../types';


export function convertDeleteExp(convertionObj: ConvertionObj, parsedInputArr: string[], index: number) {
    convertionObj.expType = 'DELETE';
    if (parsedInputArr[index].toUpperCase() !== 'FROM') {
        throw new Error(errors[49].message);
    }
    convertCollectionName(convertionObj, parsedInputArr, index + 1);
    if (index + 2 >= parsedInputArr.length || parsedInputArr[index + 2].toUpperCase() !== 'WHERE') {
        throw new Error(errors[40].message);
    }
    return convertCondExp(convertionObj, parsedInputArr, index + 3);
}