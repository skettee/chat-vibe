import { env } from '$env/dynamic/private';
import { json } from '@sveltejs/kit'
import expressJson from './express.json'

export const POST = async({request}) => {
    const requestData = await request.json()

    if(!requestData) {
        throw new Error("No request data")
    }

    const { expressTemplate, message } = requestData

    const url = expressJson.url
    const requestHeaders = {
        Authorization: `Bearer ${env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
    }

    // system prompt
    const system_tpl = expressJson["system_tpl"].replace(/\$\{express_template\}/g, expressTemplate)

    // messages
    const requestMessages = [{ 'role': 'system', 'content': system_tpl}, { 'role': 'user', 'content': message}]
    // console.log(requestMessages)

    const requestBody = {
        model: expressJson.data['model'],
        messages: requestMessages,
        response_format: expressJson.response_format
    }

    const response = await fetch(url, {
        headers: requestHeaders,
        method: 'POST',
        body: JSON.stringify(requestBody)
    })

    const expression = await response.json()
    if (response.ok) {
        // console.log(expression)
        return json(expression) // Json Response
    }

    return {
        status: response.status,
        error: new Error('Could not get  expression.')
    }
}