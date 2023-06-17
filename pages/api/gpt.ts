import { Configuration, OpenAIApi } from "openai"
import { NextApiRequest, NextApiResponse } from 'next'

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const handler = async (req: NextApiRequest, res: NextApiResponse) => {

    if (req.method !== 'POST') {
        res.status(404).json({ error: 'not found' })
        return
    }

    const content = JSON.parse(req.body).content as string;

    const chatCompletion = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [
            { role: "system", content: "This conversation is being conducted to create the optimal SQL statement." },
            { role: "system", content: `The assistant must not return anything other than an SQL statement. If there is a need to return something other than an SQL statement, please return "ERROR".` },
            { role: "user", content }
        ],
    });

    res.status(200).json({ message: chatCompletion.data.choices[0].message })
}

export default handler
