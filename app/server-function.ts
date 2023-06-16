"use server";
import { v4 as uuidv4 } from 'uuid';
import { createClient, ApiKeyStrategy } from '@wix/api-client';
import { collections } from '@wix/data';

export async function listDataCollections({ siteId, apiKey }: { siteId: string, apiKey: string }) {
    const wixClient = createClient({
        modules: { collections },
        auth: ApiKeyStrategy({ siteId, apiKey })
    });

    const response = await wixClient.collections.listDataCollections();
    return response;
}

export async function duplicateDataCollection({ siteId, apiKey, dataCollectionId }: { siteId: string, apiKey: string, dataCollectionId: string }) {
    const wixClient = createClient({
        modules: { collections },
        auth: ApiKeyStrategy({ siteId, apiKey })
    });

    const target = await wixClient.collections.getDataCollection(dataCollectionId);


    const response = await wixClient.collections.createDataCollection({
        _id: uuidv4(),
        displayName: target.displayName + ' copy',
        displayNamespace: target.displayNamespace,
        fields: target.fields,
        permissions: target.permissions,
        plugins: target.plugins,
    });
    return response;
}