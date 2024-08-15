<script>
    import { onMount, tick, getContext, afterUpdate } from 'svelte';

    export let prompt
    export let handleSubmit
    export let state

    let chatTextAreaElement

    $: if (prompt) {
		if (chatTextAreaElement) {
			chatTextAreaElement.style.height = '';
			chatTextAreaElement.style.height = Math.min(chatTextAreaElement.scrollHeight, 200) + 'px';
		}
	}

    $: disabled = $state != 'ready'

    // onMount( async () => {
    //     await tick()
    //     chatTextAreaElement.focus()
    // })

    afterUpdate( async ()=>{
        await tick()
        chatTextAreaElement.focus()
    })

</script>

<div class="fixed bottom-0 left-0 right-0 z-20">
    <div class="w-full">
    <div class="bg-stone-200 dark:bg-gray-900">
    <div class="max-w-3xl px-2.5 lg:px-16 mx-auto inset-x-0">
        <div class=" pb-2">
            <!-- Form -->
            <form class="flex flex-col relative w-full rounded-xl px-1.5 border border-gray-100 dark:border-gray-850 bg-white dark:bg-gray-900 dark:text-gray-100"
                    on:submit|preventDefault={() => {
                        handleSubmit(prompt);
                    }}>
                <fieldset disabled={disabled}>
                <!-- Text area and Buttons -->
                <div class="flex">
                    <!-- Textarea -->
                    <textarea
                        id="chat-textarea"
                        bind:this={chatTextAreaElement}
                        class="scrollbar-hidden bg-gray-50 dark:bg-gray-900 dark:text-gray-100 outline-none w-full py-3 px-3 pl-4 rounded-xl resize-none h-[48px] placeholder-gray-400 dark:placeholder-gray-800"
                        placeholder='Say something...'
                        rows="1"
                        bind:value={prompt}
                        on:keypress={(e) => {
                            
                            if (e.keyCode == 13 && !e.shiftKey) {
                                e.preventDefault();
                            }
                            if (prompt !== '' && e.keyCode == 13 && !e.shiftKey) {
                                handleSubmit(prompt);
                            }
                        }}
                        on:input={(e) => {
                            e.target.style.height = '';
                            e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px';
                        }}
                        on:focus={(e) => {
                            e.target.style.height = '';
                            e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px';
                        }}
                        on:paste={(e) => {
                            const clipboardData = e.clipboardData || window.clipboardData;
                        }}/>
                    <!-- Send button -->
                    <div class="self-end mb-2 flex space-x-1 mr-1">
                        <div aria-label="Send message">
                            <button id="send-message-button" 
                                    type="submit"
                                    class="{prompt !== ''
												? 'bg-[#b37eb5] text-white hover:bg-[#87588e] dark:bg-[#87588e] dark:text-black dark:hover:bg-[#b37eb5] '
												: 'text-white bg-gray-200 dark:text-gray-900 dark:bg-gray-700 disabled'} transition rounded-xl p-1.5 self-center"
                                    disabled={prompt === ''}>
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18" />
                                    </svg>
                            </button>
                        </div>
                    </div>
                </div>
                </fieldset>
            </form>
        </div>
        <div class="mt-1.5 text-xs text-gray-500 text-center">
            LLMs can make mistakes. Please double-check responses.
        </div>
    </div>
    </div>
    </div>
</div>

<style>
	.scrollbar-hidden:active::-webkit-scrollbar-thumb,
	.scrollbar-hidden:focus::-webkit-scrollbar-thumb,
	.scrollbar-hidden:hover::-webkit-scrollbar-thumb {
		visibility: visible;
	}
	.scrollbar-hidden::-webkit-scrollbar-thumb {
		visibility: hidden;
	}
</style>