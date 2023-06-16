import { errors } from '../engine/errors';
import { convertCollectionName, convertValueExp } from './general';
import type { ConvertionObj } from '../types';


export function convertInsertExp(convertionObj: ConvertionObj, parsedInputArr: string[], index: number) {
    convertionObj.expType = 'INSERT';
    if (parsedInputArr[index].toUpperCase() !== 'INTO') {
        throw new Error(errors[29].message);
    }
    convertCollectionName(convertionObj, parsedInputArr, index + 1);
    convertionObj.toInsert = { columns: [], values: [] };
    return convertColumnsToInsert(convertionObj, parsedInputArr, index + 2);
}

function convertColumnsToInsert(convertionObj: ConvertionObj, parsedInputArr: string[], index: number) {
    if (parsedInputArr[index] !== '(') {
        throw new Error(errors[33].message);
    }
    let jumpToIndex;
    let expectAnotherColumn = true;
    let curr;
    let foundEndOfList = false;
    for (let i = index + 1; i < parsedInputArr.length && !foundEndOfList; i++) {
        curr = parsedInputArr[i];
        if (curr === ')') {
            foundEndOfList = true;
            jumpToIndex = i + 1;
        } else if (!expectAnotherColumn) {
            throw new Error(errors[30].message);
        } else {
            if (curr.slice(-1) === ',') {
                convertionObj.toInsert.columns.push(curr.slice(0, -1));
            } else {
                expectAnotherColumn = false;
                convertionObj.toInsert.columns.push(curr);
            }
        }
    }
    analyzeColumnsToInsertRes(parsedInputArr, expectAnotherColumn, foundEndOfList, jumpToIndex);
    return convertValuesToInsert(convertionObj, parsedInputArr, jumpToIndex as number);
}

function analyzeColumnsToInsertRes(parsedInputArr: string[], expectAnotherColumn: boolean, foundEndOfList: boolean, jumpToIndex: number | undefined) {
    if (expectAnotherColumn) {
        throw new Error(errors[31].message);
    }
    if (!foundEndOfList) {
        throw new Error(errors[33].message);
    }
    if (!jumpToIndex || jumpToIndex >= parsedInputArr.length) {
        throw new Error(errors[32].message);
    }
}

function convertValuesToInsert(convertionObj: ConvertionObj, parsedInputArr: string[], index: number) {
    if (parsedInputArr[index].toUpperCase() !== 'VALUES') {
        throw new Error(errors[32].message);
    }
    let expectAnotherColumn = true;
    let foundEndOflist = false;
    if (index + 1 >= parsedInputArr.length) {
        throw new Error(errors[34].message);
    }
    if (parsedInputArr[index + 1] !== '(') {
        throw new Error(errors[35].message);
    }
    for (let i = index + 2; i < parsedInputArr.length && !foundEndOflist; i++) {
        if (parsedInputArr[i] === ')') {
            foundEndOflist = true;
            expectAnotherColumn = false;
        } else if (!expectAnotherColumn) {
            throw new Error(errors[36].message);
        } else {
            let [value, jumpToIndex, expectAnother] = Object.values(convertValueExp(parsedInputArr, i));
            i = jumpToIndex;
            if (expectAnother) {
                if (value[value.length - 1] === ',') {
                    value = value.slice(0, -1);
                }
            } else {
                expectAnotherColumn = false;
            }
            if ((value.length >= 2) && ((value[0] === '"' || value[0] === '\'') && (value[value.length - 1] === '"' || value[value.length - 1] === '\''))) {
                value = value.slice(1, -1);
            }
            convertionObj.toInsert.values.push(value);
        }
    }
    analyzeValuesToInsertRes(expectAnotherColumn, foundEndOflist);
    return parsedInputArr.length;
}

function analyzeValuesToInsertRes(expectAnotherColumn: boolean, foundEndOflist: boolean) {
    if (expectAnotherColumn) {
        throw new Error(errors[37].message);
    }
    if (!foundEndOflist) {
        throw new Error(errors[35].message);
    }
}