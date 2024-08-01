<script>
    import { getContext, tick, onMount } from 'svelte';
    import fsm from 'svelte-fsm';
    import { SSE } from 'sse.js'
    import ChatInput from '$lib/components/ChatInput.svelte';
    import ChatView from '$lib/components/ChatView.svelte';
	import AgentView from '$lib/components/AgentView.svelte';
    import charactersJson from '$lib/data/characters.json'
    import { user, session, chat, showLogin, mobile, showSidebar } from '$lib/store.js'
    import { BREAKPOINT } from '$lib/constants.js'
    import { browser } from '$app/environment'
    import { db } from "$lib/db"
    import { v4 as uuidv4 } from 'uuid'
	import Sidebar from '$lib/components/Sidebar.svelte';
	import Navbar from '$lib/components/Navbar.svelte';
    import Placeholder from "$lib/components/Placeholder.svelte"

    // onMount(() => {
    //     mobile.subscribe((e) => {
	// 		if ($showSidebar && e) {
	// 			showSidebar.set(false);
	// 		}

	// 		if (!$showSidebar && !e) {
	// 			showSidebar.set(true);
	// 		}
	// 	});

    //     if(showLogin) {
    //         showSidebar.set(false);
    //     }
    //     else {
    //         showSidebar.set(window.innerWidth > BREAKPOINT);
    //     }
    // })

    // messages
    let prompt = ''
    let chatMessages = []  // chat messages
    let agentMessages = [] // agent messages
    let agentHistoryMessages = [] // agent history messages

    // stream
    let EventSource = undefined

    // fsm
    const state = fsm( 'initial', {
        initial: {
            _enter() {
                // read config, storage and database
                // check sessionStorage
                if(browser) {
                    if(localStorage.user) {
                        $user = JSON.parse(localStorage.user)
                    }
                    else {
                        // modal open
                        $showLogin = true
                    }
                    if(sessionStorage.session) {
                        $session = JSON.parse(sessionStorage.session)
                        console.log('restore session: ', $session.id)
                        // restore current messages
                        db.transaction('rw', db.chat, db.agent, db.history, async () => {
                            // chatMessages
                            const chatList = await db.chat.orderBy("timestamp").filter(chat => chat.sessionId === $session.id).toArray()
                            chatMessages = await chatList
                            // console.log('transaction chatMessages:', chatMessages)
                            // agentHistoryMessages
                            const historyList = await db.history.orderBy("timestamp").filter(history => history.sessionId === $session.id).toArray()
                            agentHistoryMessages = await historyList
                            // console.log('transaction agentHistoryMessages:', agentHistoryMessages)
                            // agentMessages
                            // get last user chatId
                            const userChatList = chatMessages.filter((chat) => chat.role === 'user')
                            if (userChatList.length > 0) {
                                const chatId = userChatList[userChatList.length-1].id
                                // console.log('chatId: ', chatId)
                                const agentList = await db.agent.orderBy("timestamp").filter(agent => agent.chatId === chatId).toArray()
                                agentMessages = await agentList
                                // console.log('transaction agentMessages:', agentMessages)
                            }
                        })
                        .then( this.success )
                        .catch( this.error )
                    }
                    else {
                        console.log('create session')
                        db.session.add({
                            id: uuidv4(),
                            timestamp: Date.now(),
                            title: '',
                            char: $user.char
                        }).then(function(id) { session.update(function(sess) {
                                sess.id = id
                                sess.char = $user.char
                                return sess
                                })
                            return id
                        })
                        .then( (id) => { 
                            sessionStorage.session = JSON.stringify($session)
                            return id
                        })
                        .then( this.success )
                        .catch( this.error )
                    }
                }
            },
            success() {
                return 'ready'
            },
            error(err) {
                console.log(err)
                // intialize tool config
                return 'initial'
            }
        },
        ready: {
            toInitial() {
                return 'initial'
            },
            toAgent() {
                return 'agent'
            },
        },
        agent: {
            _enter() {
                answer = ''
                is_text = false
                is_tool = false
                tool_id = ''
                tool_name = ''
                tool_input_partial = ''
                tool_input = {}
                agent_text = ''

                const requestHistoryMessage = agentHistoryMessages.map((item)=>{
                    return { role: item.role, content: item.content }
                })
                // console.log('state (agent) request messages: ', requestHistoryMessage)

                EventSource = new SSE('/sse', {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    payload: JSON.stringify({ 
                        target: 'agent',
                        name: '',
                        char: '',
                        messages: requestHistoryMessage,
                        references: []
                    })
		        })
                EventSource.addEventListener('error', handleError)
                EventSource.addEventListener('message_start', handleListener)
                EventSource.addEventListener('content_block_start', handleListener)
                EventSource.addEventListener('ping', handleListener)
                EventSource.addEventListener('content_block_delta', handleListener)
                EventSource.addEventListener('content_block_stop', handleListener)
                EventSource.addEventListener('message_delta', handleListener)
                EventSource.addEventListener('message_stop', handleListener)
                EventSource.stream()
            },
            _exit() {
                EventSource.removeEventListener('error', handleError)
                EventSource.removeEventListener('message_start', handleListener)
                EventSource.removeEventListener('content_block_start', handleListener)
                EventSource.removeEventListener('ping', handleListener)
                EventSource.removeEventListener('content_block_delta', handleListener)
                EventSource.removeEventListener('content_block_stop', handleListener)
                EventSource.removeEventListener('message_delta', handleListener)
                EventSource.removeEventListener('message_stop', handleListener)
                EventSource.close()
            },
            toTools() {
                return 'tools'
            },
            toPersona() {
                // intialize tool config
                return 'persona'
            },
            error(err) {
                console.log(err)
                // intialize tool config
                return 'initial'
            }
        },
        tools: {
            _enter() {
                const messages = [{ role: 'user', content: tool_input.message}]

                // console.log('state (tools) request messages: ', messages)

                EventSource = new SSE('/sse', {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    payload: JSON.stringify({ 
                        target: 'tool', 
                        name: tool_name,
                        char: '',
                        messages: messages,
                        references: []
                    })
                })

                EventSource.addEventListener('error', handleError)
		        EventSource.addEventListener('message', handleListener)
                EventSource.stream()
            },
            _exit() {
                EventSource.removeEventListener('error', handleError)
		        EventSource.removeEventListener('message', handleListener)
                EventSource.close()
            },
            toAgent() {
                return 'agent'
            },
            error(err) {
                console.log(err)
                return 'initial'
            }
        },
        persona: {
            _enter() {
                answer = '';

                const requestChatMessage = chatMessages.map((item)=>{
                    return { role: item.role, content: item.content }
                })
                const requestAgentMessage = agentMessages.map((item)=>{
                    return { role: item.role, content: item.content }
                })

                // console.log('state (persona) request messages: ', requestChatMessage)
                // console.log('state (persona) reference messages: ', requestAgentMessage)

                EventSource = new SSE('/sse', {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    payload: JSON.stringify({ 
                        target: 'persona',
                        name: $user.name,
                        char: charactersJson[$user.char].profile,
                        messages: requestChatMessage, 
                        references: requestAgentMessage
                    })
		        })
                EventSource.addEventListener('error', handleError)
                EventSource.addEventListener('message_start', handleListener)
                EventSource.addEventListener('content_block_start', handleListener)
                EventSource.addEventListener('ping', handleListener)
                EventSource.addEventListener('content_block_delta', handleListener)
                EventSource.addEventListener('content_block_stop', handleListener)
                EventSource.addEventListener('message_delta', handleListener)
                EventSource.addEventListener('message_stop', handleListener)
                EventSource.stream()
            },
            _exit() {
                EventSource.removeEventListener('error', handleError)
                EventSource.removeEventListener('message_start', handleListener)
                EventSource.removeEventListener('content_block_start', handleListener)
                EventSource.removeEventListener('ping', handleListener)
                EventSource.removeEventListener('content_block_delta', handleListener)
                EventSource.removeEventListener('content_block_stop', handleListener)
                EventSource.removeEventListener('message_delta', handleListener)
                EventSource.removeEventListener('message_stop', handleListener)
                EventSource.close()
            },
            toReady(){
                return 'ready'
            },
            error(err) {
                console.log(err)
                return 'initial'
            }
        }
    })

    // Listeners
    let answer = '';
    let is_text = false
    let is_tool = false
    let tool_id = ''
    let tool_name = ''
    let tool_input_partial = ''
    let tool_input = {}
    let agent_text = ''
    let currentMessages = []
    let start_stream = false

    function handleError(err) {
        console.log(err)
        // error and goto initial
        state.error(err)

    }

    async function handleListener(e) {
        const eventType = e.type
        let stream
        // console.log('handleListener: ', $state)

        switch($state) {
            case 'agent':
                switch(eventType) {
                    case 'content_block_start':
                        stream = JSON.parse(e.data)
                        if( stream.content_block.type === "text" && !is_tool ) {
                            is_text = true
                            currentMessages = agentMessages
                        }
                        if( stream.content_block.type === "tool_use" && !is_text ) {
                            is_tool = true
                            tool_name = stream.content_block.name
                            tool_id = stream.content_block.id
                        }
                        break
                    case 'content_block_stop':
                        if(is_text) {
                            is_text = false
                            agent_text = answer
                            answer = ''
                        }
                        if(is_tool) {
                            is_tool = false
                            tool_input = JSON.parse(tool_input_partial)
                            // console.log('tool_input: ', tool_input)
                        }
                        break
                    case 'content_block_delta':
                        stream = JSON.parse(e.data)
                        if( is_text && stream.delta.type === 'text_delta') {
                            answer = (answer ?? '') + stream.delta.text
                            agentMessages = [...currentMessages, { role: 'assistant', content: answer }]
                        }
                        if( is_tool && stream.delta.type === "input_json_delta") {
                            tool_input_partial += stream.delta.partial_json
                        }
                        break
                    case 'message_stop':
                        const agentMessage = {
                            id: uuidv4(),
                            timestamp: Date.now(),
                            chatId: $chat.id,
                            role: 'assistant', 
                            content: agent_text
                        }
                        agentMessages = [...currentMessages, agentMessage]
                        await db.agent.add(agentMessage)
                        
                        if( tool_name ) {
                            const toolUseContent = [
                                { 'text': agent_text, 'type':'text' },
                                { 'id': tool_id, 
                                  'input': tool_input, 
                                  'name': tool_name, 
                                  'type': 'tool_use'
	                            }
                            ]
                            const historyMessage = {
                                id: agentMessage.id,
                                timestamp: agentMessage.timestamp,
                                sessionId: $session.id,
                                role: agentMessage.role,
                                content: toolUseContent
                            }
                            agentHistoryMessages = [...agentHistoryMessages, historyMessage]
                            await db.history.add(historyMessage)
                            state.toTools()
                        }
                        else {
                            // save to db
                            
                            const historyMessage = {
                                id: agentMessage.id,
                                timestamp: agentMessage.timestamp,
                                sessionId: $session.id,
                                role: agentMessage.role,
                                content: agentMessage.content
                            }
                            agentHistoryMessages = [...agentHistoryMessages, historyMessage]
                            await db.history.add(historyMessage)
                            state.toPersona()
                        }
                        // save to db

                        break
                    case 'message':
                        // TBD for OpenAI
                        break
                }
                break
            case 'tools':
                switch(eventType) {
                    case 'message':
                        if (e.data === '[DONE]') {
                            start_stream = false
                            return
                        }
                        stream = JSON.parse(e.data)
                        const [{ finish_reason }] = stream.choices
                        if (finish_reason === 'stop') {
                            // save to array and db
                            const agentMessage = {
                                id: uuidv4(),
                                timestamp: Date.now(),
                                chatId: $chat.id,
                                role: tool_name, 
                                content: answer
                            }
                            agentMessages = [...currentMessages, agentMessage]

                            // tool_result needed
                            const toolResultMessage = {
                                id: uuidv4(),
                                timestamp: Date.now(),
                                sessionId: $session.id,
                                role: 'user',
                                content: [
                                    { type: 'tool_result',
                                      tool_use_id: tool_id,
                                      content: answer
                                    }
                                ]
                            }
                            agentHistoryMessages = [...agentHistoryMessages, toolResultMessage]

                            await db.agent.add(agentMessage)
                            await db.history.add(toolResultMessage)

                            answer = ''
                            start_stream = false
                            state.toAgent()
                            return
                        }
                        const [{ delta }] = stream.choices
                        if (delta.content) {
                            answer = (answer ?? '') + delta.content
                            if(start_stream == false) {
                                currentMessages = agentMessages
                                start_stream = true
                            }
                            agentMessages = [...currentMessages, { role: tool_name, content: answer }]
                        }
                        break
                    case 'content_block_delta':
                        // TBD for Anthropic
                        break
                }
                break
            case 'persona':
                switch(eventType) {
                    case 'content_block_start':
                        currentMessages = chatMessages
                        break
                    case 'content_block_delta':
                        stream = JSON.parse(e.data)
                        answer = (answer ?? '') + stream.delta.text
                        chatMessages = [...currentMessages, { role: 'assistant', content: answer }]
                        tick().then(() => scrollToBottom(messagesContainerElement))
                        break
                    case 'message_stop':
                        // save to array and db
                        const chatMessage = { 
                            id: uuidv4(),
                            timestamp: Date.now(),
                            sessionId: $session.id,
                            role: 'assistant',
                            content: answer
                        }
                        chatMessages = [...currentMessages, chatMessage]
                        await db.chat.add(chatMessage)

                        answer = ''
                        state.toReady()
                        break
                }
                break
        }
    }

    let messagesContainerElement;

    const scrollToBottom = async (node) => {
        node.scroll({ top: node.scrollHeight, behavior: 'smooth' });
    }; 
    
    const handleSubmit = async (userPrompt) => {
        const chatMessage = { 
            id: uuidv4(),
            timestamp: Date.now(),
            sessionId: $session.id,
            role: 'user', 
            content: userPrompt
        }
        chatMessages = [...chatMessages, chatMessage]
        agentHistoryMessages = [...agentHistoryMessages, chatMessage]
        agentMessages = []

        // save to db
        await db.session.update($session.id, {title: userPrompt});
        $chat.id = chatMessage.id
        await db.chat.add(chatMessage)
        await db.history.add(chatMessage)

        // console.log('handleSubmit(chat): ', chatMessages)
        // console.log('handleSubmit(agent): ', agentHistoryMessages)
        // console.log('handleSubmit(state): ', $state)
        
        await tick();
		scrollToBottom(messagesContainerElement);

        // Reset chat message textarea height
		document.getElementById('chat-textarea').style.height = '';
        // Reset chat input textarea
        prompt = ''
        
        // Send prompt
        state.toAgent()
    }

</script>

<!-- Sidebar -->
<Sidebar {state}/>
<!-- Main Container -->
<div class="min-h-screen max-h-screen {$showSidebar
		? 'md:max-w-[calc(100%-260px)]'
		: ''} w-full max-w-full flex flex-col">
    <!-- Nav -->
    <Navbar {state}/>
    <div class="flex flex-col flex-auto">
    {#if chatMessages.length == 0}
        <Placeholder />
    {:else}
        <!-- Message Container -->
        <div id="messages-container"
            bind:this={messagesContainerElement}
            class="pb-2.5 flex flex-col justify-between w-full flex-auto overflow-auto scrollbar h-0 max-w-full">
            <!-- Views -->
            <div class="relative flex flex-row"> 
                <!-- ChatView -->
                <div class="relative mx-auto flex h-full w-full max-w-3xl flex-1 flex-col md:px-2">
                    <ChatView bind:chatMessages/>
                </div> 
                <!-- AgentView -->
                <div style="width: auto;">
                    <div class="transition-[width] lg:w-[28rem]">
                        <AgentView bind:agentMessages/>
                    </div>
                </div>
                
            </div>
        </div>
    {/if}
    </div>
</div>
<ChatInput bind:prompt {handleSubmit} {state}/>


