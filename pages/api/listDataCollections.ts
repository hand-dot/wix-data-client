import { NextApiRequest, NextApiResponse } from 'next'
import { createClient, ApiKeyStrategy } from '@wix/api-client';
import { collections } from '@wix/data';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {

    if (req.method !== 'GET') {
        res.status(404).json({ error: 'not found' })
        return
    }

    const siteId = req.headers['x-wix-site-id'] as string
    const apiKey = req.headers['x-wix-api-key'] as string

    const wixClient = createClient({ modules: { collections }, auth: ApiKeyStrategy({ siteId, apiKey }) });

    const response = await wixClient.collections.listDataCollections();

    res.status(200).json(response)
}

export default handler
