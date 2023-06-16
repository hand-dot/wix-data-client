import { errors } from '../engine/errors';
import { convertCondExp } from './where'
import { convertCollectionName, convertValueExp } from './general';
import type { ConvertionObj } from '../types';


export function convertUpdateExp(convertionObj: ConvertionObj, parsedInputArr: string[], index: number) {
    convertionObj.expType = 'UPDATE';
    convertionObj.toUpdateObj = {};
    convertCollectionName(convertionObj, parsedInputArr, index);
    return convertSetExp(convertionObj, parsedInputArr, index + 1);
}

function convertSetExp(convertionObj: ConvertionObj, parsedInputArr: string[], index: number) {
    if (index >= parsedInputArr.length || parsedInputArr[index].toUpperCase() !== 'SET') {
        throw new Error(errors[3].message);
    }
    return convertToUpdateObj(convertionObj, parsedInputArr, index);
}

function convertToUpdateObj(convertionObj: ConvertionObj, parsedInputArr: string[], index: number) {
    let foundWHERE = false;
    let expectAnotherTriplet = true;
    let jumpToIndex, columnName, operator, curr;
    for (let i = index + 1; i < parsedInputArr.length && !foundWHERE; i++) {
        curr = parsedInputArr[i].toUpperCase();
        if (curr === 'WHERE') {
            foundWHERE = true;
            jumpToIndex = i + 1;
        } else {
            if (!expectAnotherTriplet) {
                throw new Error(errors[5].message);
            }
            columnName = parsedInputArr[i];
            operator = parsedInputArr[i + 1];
            if (operator !== '=') {
                throw new Error(errors[6].message + ' ' + operator);
            }
            let [value, jumpToIndex, expectAnother] = Object.values(convertValueExp(parsedInputArr, i + 2));
            i = jumpToIndex;
            if (value.length === 0) {
                throw new Error(errors[19].message);
            }
            if (expectAnother) {
                if (value[value.length - 1] === ',') {
                    value = value.slice(0, -1);
                }
            } else {
                expectAnotherTriplet = false;
            }
            if ((value.length >= 2) && ((value[0] === '"' || value[0] === '\'') && (value[value.length - 1] === '"' || value[value.length - 1] === '\''))) {
                value = value.slice(1, -1);
            }
            convertionObj.toUpdateObj[columnName] = value;
        }
    }
    analyzeToUpdateObjRes(foundWHERE, expectAnotherTriplet);
    return convertCondExp(convertionObj, parsedInputArr, jumpToIndex as number)
}

function analyzeToUpdateObjRes(foundWHERE: boolean, expectAnotherTriplet: boolean) {
    if (expectAnotherTriplet) {
        throw new Error(errors[7].message);
    }
    if (!foundWHERE) {
        throw new Error(errors[18].message);
    }
}