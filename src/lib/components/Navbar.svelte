<script>
    import { DropdownMenu } from 'bits-ui'
    import { user, mobile } from '$lib/store.js'
    import charactersJson from '$lib/data/characters.json'

    export let state;

    $: disabled = $state != 'ready'

</script>

<nav id="nav" class="sticky py-2.5 top-0 flex flex-row justify-center z-30">
    <div class=" flex max-w-full w-full mx-auto px-5 pt-0.5 md:px-[1rem]">
        <div class="flex items-center w-full max-w-full">
            <div class="flex-1 overflow-hidden max-w-full">
                <div class="flex flex-col w-full items-center md:items-start">
                    <div class="flex w-full max-w-fit">
                        <div class="overflow-hidden w-full">
                            <div class="mr-1 max-w-full">
                                <DropdownMenu.Root>
                                    <DropdownMenu.Trigger class="relative w-full" aria-label="Select Character">
                                        <div class="flex w-full text-left px-0.5 outline-none bg-transparent truncate text-lg font-semibold placeholder-gray-400 focus:outline-none">
                                            {charactersJson[$user.char].name}
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke-width="2.5"
                                                stroke="currentColor"
                                                class="self-center ml-2 size-3"
                                            >
                                                <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                                            </svg>
                                        </div>
                                    </DropdownMenu.Trigger>
                                    <DropdownMenu.Content 
                                        class=" {$mobile? `w-full`: `w-[30rem]`} max-w-[calc(100vw-1rem)] justify-start rounded-xl  bg-white dark:bg-gray-850 dark:text-white 
                                                shadow-lg border border-gray-300/30 dark:border-gray-700/50 outline-none z-50"
                                        side={$mobile ? 'bottom' : 'bottom-start'} 
                                        sideOffset={4}
                                    >
                                        {#each Object.keys(charactersJson) as key }
                                        <div class="px-3 my-2 max-h-64 overflow-y-auto scrollbar-hidden">
                                            <a
                                                id="char-item"
                                                class="flex w-full text-left font-medium line-clamp-1 select-none items-center rounded-button 
                                                py-2 pl-3 pr-1.5 text-sm text-gray-700 dark:text-gray-100 outline-none transition-all duration-75 
                                              dark:hover:bg-gray-800 rounded-lg data-[highlighted]:bg-muted
                                                {disabled? '' : 'hover:bg-gray-100 cursor-pointer'}"
                                                data-sveltekit-reload href={disabled? "javascript:void(0)" : "/"} 
				                                draggable="false"
                                                on:click={() => {
                                                    // save char and restart chat
                                                    if(!disabled) {
                                                        localStorage.user = JSON.stringify(
                                                        {
                                                            name: $user.name,
                                                            char: key

                                                        })
                                                        sessionStorage.removeItem('session')
                                                    }
                                                }}
                                            >
                                                <div class="mr-4">
                                                    <img 
                                                        src={charactersJson[key].image}
                                                        class="max-w-[28px] object-cover rounded-full bg-[#b37eb5]"
                                                        alt="profile"
                                                        draggable="false"> 
                                                </div>
                                                <div class="flex items-center gap-2">
                                                    <div class="line-clamp-1">
                                                        {charactersJson[key].name}
                                                    </div>
                                                </div>
                                                {#if charactersJson[key].name == charactersJson[$user.char].name}
                                                    <div class="ml-auto">
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                            stroke-width="1.5"
                                                            stroke="currentColor"
                                                            class="w-4 h-4"
                                                        >
                                                            <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                                        </svg>
                                                    </div>
                                                {/if}
                                            </a>
                                        </div>
                                        {/each}
                                    </DropdownMenu.Content>
                                </DropdownMenu.Root>
                            </div>
                        </div>
                    </div>
                </div>
			</div>
        </div>
        <div class="self-start flex flex-none items-center text-gray-600 dark:text-gray-400">
            <button
                id="setting-button"
                class=" flex cursor-pointer px-2 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-850 transition"
                on:click={() => {
                    
                }}
            >
                <div class=" m-auto self-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
                        <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    </svg>
                </div>
            </button>
        </div>
    </div>
</nav>