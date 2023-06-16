export type ConvertionObj = {
    expType: string;
    collectionName: string;
    toInsert: {
        columns: string[];
        values: any[];
    };
    joinedCollectionName: string;
    joinOn: { [key: string]: string };
    limit: number;
    orderBy: { [key: string]: string }[];
    queriedColumns: {
        star: boolean;
        columns: string[];
    };
    functionsQueriedColumns: { functionName: string; columnName: string }[];
    toUpdateObj: { [key: string]: any };
    filterObj: { [key: string]: any }[];
    anotherCondType: string;
    columnsMap: { [key: string]: string[] };
    condsMap: { [key: string]: any[] };
    orderByMap: { [key: string]: { [key: string]: string }[] };
    timeStart: Date;
    timeEndExecution?: Date;
};
