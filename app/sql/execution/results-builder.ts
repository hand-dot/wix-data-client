import { errors } from '../engine/errors';
import type { ConvertionObj } from '../types';

export function buildTableOfFunctionsResults(funcResults: any) {
    const columnsArr = [];
    const rowObj: { [key: string]: any } = {};
    for (const [funcNameColumnName, value] of Object.entries(funcResults)) {
        if (funcNameColumnName !== '_id') {
            columnsArr.push(funcNameColumnName);
            rowObj[funcNameColumnName] = value;
        }
    }
    return {
        data: {
            columns: columnsArr,
            rows: [rowObj]
        }
    }
}

export function buildTableFromJoinResults(funcResultsItems: any[], joinedFuncResultsItems: any[], convertionObj: ConvertionObj) {
    let rows = [];
    const queryColumnsNames = convertionObj.columnsMap[convertionObj.collectionName].map(column => `${convertionObj.collectionName}_${column}`);
    const joinColumnsNames = convertionObj.columnsMap[convertionObj.joinedCollectionName].map(column => `${convertionObj.joinedCollectionName}_${column}`);
    const columns = queryColumnsNames.concat(joinColumnsNames);

    for (const [collectionAndColumnKey, collectionAndColumnVal] of Object.entries(convertionObj.joinOn)) {
        const [collectionNameKey, columnNameKey] = collectionAndColumnKey.split('.');
        const [collectionNameVal, columnNameVal] = collectionAndColumnVal.split('.');

        for (let i = 0; i < funcResultsItems.length; i++) {
            const matchedValue = funcResultsItems[i][columnNameKey];
            let matchedItem = joinedFuncResultsItems.find(item => item[columnNameVal] === matchedValue);

            let itemObj: { [key: string]: any } = {};
            for (const [key, value] of Object.entries(funcResultsItems[i])) {
                const newKey = convertionObj.collectionName + '_' + key;
                if (queryColumnsNames.includes(newKey)) {
                    itemObj[newKey] = value;
                }
            }

            if (matchedItem) {
                let joinItemObj: { [key: string]: any } = {};
                for (const [key, value] of Object.entries(matchedItem)) {
                    const newKey = convertionObj.joinedCollectionName + '_' + key;
                    if (joinColumnsNames.includes(newKey)) {
                        joinItemObj[newKey] = value;
                    }
                }
                rows.push({
                    ...itemObj,
                    ...joinItemObj
                });
            } else if (convertionObj.expType === 'LEFT JOIN') {
                rows.push(itemObj);
            }
        }
    }
    return { data: { columns, rows } };
}

export function buildTableFromResults(resultItems: any[], queriedColumns: any, expType: string) {

    let rows;
    if (expType === 'SELECT') {
        if (queriedColumns.star) {
            rows = resultItems.map(item => {
                let itemObj: { [key: string]: any } = {};
                Object.keys(resultItems[0]).forEach(column => {
                    itemObj[column] = item[column];
                });
                return itemObj;
            });
        } else {
            rows = resultItems.map(item => {
                let itemObj: { [key: string]: any } = {};
                queriedColumns.columns.forEach((column: string) => {
                    itemObj[column] = item[column];
                });
                return itemObj;
            });
        }
    } else if (expType === 'SELECT DISTINCT') {
        rows = resultItems.map(item => {
            let itemObj: { [key: string]: any } = {};
            itemObj[queriedColumns.columns[0]] = item;
            return itemObj;
        });
    }
    const tableDataObj = {
        data: {
            columns: createColumns(resultItems, queriedColumns, expType),
            rows
        }
    }
    return tableDataObj;
}

// builds the columns array for the results' table 
function createColumns(resultItems: any[], queriedColumns: any, expType: string) {
    if (expType === 'SELECT') {
        let tableFields = Object.keys(resultItems[0]);
        if (queriedColumns.columns.length > 0) {
            validateExistingColumns(tableFields, queriedColumns.columns);
        }
        if (queriedColumns.star === false) {
            tableFields = queriedColumns.columns;
        }
        return tableFields;
    } else if (expType === 'SELECT DISTINCT') {
        return [queriedColumns.columns[0]];
    } else if (expType === 'INNER JOIN' || expType === 'LEFT JOIN') {
        return queriedColumns;
    }
}

// validates that each queried column exists in the table
function validateExistingColumns(tableFields: any[], queriedColumns: any[]) {
    for (const column of queriedColumns) {
        if (!tableFields.includes(column)) {
            throw new Error(errors[17].message + ' ' + column);
        }
    }
}