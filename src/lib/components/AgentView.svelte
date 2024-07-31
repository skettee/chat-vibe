<script>
    import AgentMessage from "./message/AgentMessage.svelte"
    import { tick, getContext, afterUpdate } from 'svelte'

    export let agentMessages

    const scrollToBottom = node => {
        const scroll = () => node.scroll({
            top: node.scrollHeight,
            behavior: 'smooth',
        });
        scroll();

        return { update: scroll }
    }

</script>
<div use:scrollToBottom={agentMessages} class="fixed h-[calc(100%-140px)] mr-4 flex border-0 bg-gray-50 dark:bg-gray-950 rounded-lg overflow-auto scrollbar">
    <div class="w-full pt-2">
        {#each agentMessages as message, messageIdx}
            <div class=" w-full">
                <div class="flex flex-col justify-between px-3 mb-3 max-w-[28rem] mx-auto rounded-lg group">
                        <AgentMessage {message}/>
                </div>
            </div>
        {/each}
    </div>
</div>