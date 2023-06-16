import { NextApiRequest, NextApiResponse } from 'next'
import { v4 as uuidv4 } from 'uuid';
import { createClient, ApiKeyStrategy } from '@wix/api-client';
import { collections } from '@wix/data';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {

    if (req.method !== 'POST') {
        res.status(404).json({ error: 'not found' })
        return
    }

    const siteId = req.headers['x-wix-site-id'] as string
    const apiKey = req.headers['x-wix-api-key'] as string
    const dataCollectionId = JSON.parse(req.body).dataCollectionId

    const wixClient = createClient({ modules: { collections }, auth: ApiKeyStrategy({ siteId, apiKey }) });

    const target = await wixClient.collections.getDataCollection(dataCollectionId);

    const response = await wixClient.collections.createDataCollection({
        _id: uuidv4(),
        displayName: target.displayName + ' copy',
        displayNamespace: target.displayNamespace,
        fields: target.fields,
        permissions: target.permissions,
        plugins: target.plugins,
    });

    res.status(200).json(response)
}

export default handler
