import { NextApiRequest, NextApiResponse } from 'next'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {

    if (req.method !== 'POST') {
        res.status(404).json({ error: 'not found' })
        return
    }

    try {
        const sqlEndPoint = JSON.parse(req.body).sqlEndPoint as string;
        let sqlStr = JSON.parse(req.body).sqlStr as string;

        if (sqlStr.endsWith(";")) {
            sqlStr = sqlStr.slice(0, -1);
        }

        const result = await fetch(sqlEndPoint, {
            method: "POST",
            headers: {
                "Accept": "*/*",
                "Content-Type": "application/json"
            },
            cache: "no-cache",
            body: JSON.stringify({ sqlStr })
        })
            .then(r => r.json())

        res.status(200).json(result)
    } catch (error) {
        res.status(500).json(error)
    }

}

export default handler
