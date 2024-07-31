<script>
    import UserMessage from "./message/UserMessage.svelte"
	import CharMessage from "./message/CharMessage.svelte"
    
    export let chatMessages

    const scrollToBottom = async (node) => {
        node.scroll({ top: node.scrollHeight, behavior: 'smooth' });
    }; 

</script>

<div class="h-full flex mb-16">
    
        <div class="w-full pt-2">
            {#each chatMessages as message}
                <div class=" w-full">
                    <div class="flex flex-col justify-between px-5 mb-3 max-w-5xl mx-auto rounded-lg group">
                        {#if message.role === 'user'}
                            <UserMessage {message}/>
                        {:else}
                            <CharMessage {message}/>
                        {/if}
                    </div>
                </div>
            {/each}
        </div>
</div>