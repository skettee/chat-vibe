<script>
    import { marked } from 'marked'
    import auto_render from 'katex/dist/contrib/auto-render.min.js';
    import 'katex/dist/katex.min.css';
    import CodeBlock from './CodeBlock.svelte';
    import { onMount } from 'svelte';
    import assistantsJson from '$lib/data/assistants.json'
    import dayjs from 'dayjs'
    
    export let message
    const timestamp = dayjs(message.timestamp).format('MM/DD/YYYY HH:mm')


    let messageElement;

    const renderLatex = () => {
        if (messageElement) {
            auto_render(messageElement, {
                // customised options
                // • auto-render specific keys, e.g.:
                delimiters: [
                    { left: '$$', right: '$$', display: false },
                    { left: '$ ', right: ' $', display: false },
                    { left: '\\(', right: '\\)', display: false },
                    { left: '\\[', right: '\\]', display: false },
                    { left: '[ ', right: ' ]', display: false }
                ],
                // • rendering keys, e.g.:
                throwOnError: false
            });
        }
    };


    onMount(()=>{
        messageElement = document.getElementById('chat-agent');
        // console.log(messageElement)
        renderLatex()
    })

    let tokens
    let renderer

    $: if(message) {
        tokens = marked.lexer(message.content);
        // console.log(tokens)

        renderer = new marked.Renderer();

        renderer.codespan = (token) => {
            // console.log(token.text)
            return `<code>${token.text.replaceAll('&amp;', '&')}</code>`;
        };
    }

</script>

<div class="flex w-full message-4c4165f1-0119-4d5e-88ca-59dbd4b5a0f5" id="message-4c4165f1-0119-4d5e-88ca-59dbd4b5a0f5">
    <div class="mr-2">
        <img 
            src={assistantsJson[message.role].image}
            class="max-w-[28px] object-cover rounded-full"
            alt="profile"
            draggable="false"> 
    </div>
    <div class="w-full overflow-hidden">
        <div class="self-center font-bold mb-0.5 capitalize line-clamp-1">
            {assistantsJson[message.role].name}
            <span class="invisible group-hover:visible text-gray-400 text-xs font-medium">{timestamp}</span>
        </div>
        <div id="chat-agent" class="prose text-sm w-full max-w-full dark:prose-invert prose-headings:my-0 prose-p:m-0 prose-pre:my-2 prose-table:my-0 prose-blockquote:my-0 prose-img:my-0 prose-ul:-my-4 prose-ol:-my-4 prose-li:-my-2 whitespace-pre-line">
            <div>
                <div class="w-full">
                    {#each tokens as token, tokenIdx}
                        {#if token.type === 'code'}
                            <CodeBlock
                                id={`${tokenIdx}`}
                                lang={token.lang}
                                code={token.text}
                            />
                        {:else}
                            {@html marked.parse(token.raw, {
                                ...marked.getDefaults(),
                                gfm: true,
                                breaks: true,
                                renderer
                            })}
                        {/if}
                    {/each}
                </div>
            </div>
        </div>
    </div>
</div>
