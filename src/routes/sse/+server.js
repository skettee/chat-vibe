import { env } from '$env/dynamic/private';
import { json } from '@sveltejs/kit'
import agentJson from './agent.json'
import toolsJson from './tools.json'
import personaJson from './persona.json'
import yaml from 'yaml'

export const POST = async({request}) => {
    try{
        const requestData = await request.json()

        if(!requestData) {
            throw new Error("No request data")
        }

        const { target, name, char, messages, references } = requestData
        // console.log(target)
        // console.log(name)
        // console.log(char)
        // console.log(messages)
        // console.log(references)

        let url = ''
        let requestHeaders = {}
        let requestBody = {}

        switch(target) {
            case 'agent':
                url = agentJson.url
                requestHeaders = {
                    'anthropic-version': agentJson.headers['anthropic-version'],
                    'x-api-key': `${env.ANTHROPIC_API_KEY}`,
                    'content-type': 'application/json',
                }
                requestBody = {
                    system: agentJson.system_tpl.replace("${today}", Date()),
                    messages: messages,
                    model: agentJson.data['model'],
                    max_tokens: agentJson.data['max_tokens'],
                    tools: toolsJson['tools'],
                    tool_choice: {type: "auto"},
                    stream: true,
                }
                break
            case 'tool':
                switch(name) {
                    case 'web_search':
                        const webSearchJson = toolsJson[name]['perplexity']
                        url = webSearchJson.url
                        const apiKey = env['perplexity'.toUpperCase() + "_API_KEY"]
                        requestHeaders = {
                            Authorization: `Bearer ${apiKey}`,
                            'Content-Type': 'application/json'
                        }
                        requestBody = {
                            model: webSearchJson.data['model'],
                            messages: messages,
                            stream: true
                        }
                        break
                    default:
                        throw new Error('Invalid error');
                }
                break
            case 'persona':
                let userChats = ''
                for (const index in messages) {
                    userChats += `${messages[index].role}: ${messages[index].content}\n`
                }

                let referenceChats = ''
                for (const index in references) {
                    referenceChats += `${references[index].role}: ${references[index].content}\n`
                }

                const charStr = yaml.stringify(char)
                const content = personaJson["prompt_tpl"]
                    .replace(/\$\{char\}/g, char.name)
                    .replace(/\$\{user\}/g, name)
                    .replace(/\$\{character\}/g, charStr.trim())
                    .replace(/\$\{userChats\}/g, userChats.trim())
                    .replace(/\$\{referenceChats\}/g, referenceChats.trim())
                    .replace(/\$\{today\}/g, Date())
                const requestMessages = [{ 'role': 'user', 'content': content}]

                // console.log(content)

                url = agentJson.url
                requestHeaders = {
                    'anthropic-version': personaJson.headers['anthropic-version'],
                    'x-api-key': `${env.ANTHROPIC_API_KEY}`,
                    'content-type': 'application/json',
                }
                requestBody = {
                    system: personaJson.system_tpl.replace(/\$\{char\}/g, char.name).replace(/\$\{user\}/g, name),
                    messages: requestMessages,
                    model: personaJson.data['model'],
                    max_tokens: personaJson.data['max_tokens'],
                    stream: true,
                }
                break
        }

        const chatResponse = await fetch(url, {
			headers: requestHeaders,
			method: 'POST',
			body: JSON.stringify(requestBody)
		})

		// console.log(target, chatResponse.body)

		return new Response(chatResponse.body, {
			headers: {
				'Content-Type': 'text/event-stream'
			}
		})

    } catch(err) {
        console.error(err)
        return json({ error: 'There was an error processing your request' }, { status: 500 })
    }
}