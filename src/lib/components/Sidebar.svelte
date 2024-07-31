<script>
    import { user, mobile, showSidebar} from '$lib/store.js'
    import { onMount } from 'svelte';
    import { BREAKPOINT } from '$lib/constants.js'
    import { db } from "$lib/db"
    import { liveQuery } from "dexie";

    export let state;

    $: disabled = $state != 'ready'

    onMount(()=>{
        mobile.subscribe((e) => {
			if ($showSidebar && e) {
				showSidebar.set(false);
			}

			if (!$showSidebar && !e) {
				showSidebar.set(true);
			}
		});

		showSidebar.set(window.innerWidth > BREAKPOINT);
    })

    let sessions = liveQuery( () => db.session.orderBy("timestamp").reverse().filter( sess => sess.char === $user.char ).limit(10).toArray() )
</script>


<div class="h-screen max-h-[100dvh] min-h-screen select-none {$showSidebar
    ? 'md:relative w-[260px]'
    : '-translate-x-[260px] w-[0px] '} bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-200 text-sm transition fixed z-30 top-0 left-0 rounded-r-2xl">
    
    <div
        class="py-2.5 my-auto flex flex-col justify-between h-screen max-h-[100dvh] w-[260px] z-50 {$showSidebar
            ? ''
            : 'invisible'}"
        >
        <div class="px-2.5 flex justify-between space-x-1 text-gray-600 dark:text-gray-400">
            <!-- New Chat -->
            <a
				id="sidebar-new-chat-button"
				class="flex flex-1 justify-between rounded-xl px-2 py-2 
                    {disabled? '' : 'hover:bg-gray-100 dark:hover:bg-gray-850 transition'}"
				data-sveltekit-reload href={disabled? "javascript:void(0)" : "/"} 
				draggable="false"
				on:click={async () => {
                    if(!disabled) {
                        sessionStorage.removeItem('session')
                    }
				}}
			>
                <div class="self-center mx-1.5">
                    <img
                        src="./favicon.png"
                        class=" size-6 -translate-x-1.5 rounded-full"
                        alt="logo"
                    />
                </div>
                <div class=" self-center font-bold text-base text-gray-850 dark:text-white">
					Start new chat
				</div>
                <div class="self-center ml-auto">
					<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                      </svg>
				</div>
            </a>
        </div>
        <!-- Recents -->
        <div class="relative flex flex-col flex-1 overflow-y-auto">
            <div class="pl-2 my-2 flex-1 flex flex-col space-y-1 overflow-y-auto scrollbar-none">
                <div class="w-full pl-2.5 text-base text-gray-500 dark:text-gray-500 font-bold pt-5 pb-0.5">
                    Recents
                </div>
                {#each ($sessions || []) as session (session.id)}
                    {#if session.title}
                    <div class="w-full pr-2 relative group">
                        <!-- <a class="w-full flex justify-between rounded-xl px-3 py-2 whitespace-nowrap text-ellipsis 
                            {disabled? '': 'group-hover:bg-gray-100 dark:group-hover:bg-gray-850'}" 
                            href={disabled? "javascript:void(0)" : `/${session.id}`} 
                            draggable="false" 
                            on:click={() => {
                                if ($mobile) {
                                    showSidebar.set(false);
                                }
                            }}>
                            <div class="flex self-center flex-1 w-full">
                                <div class="text-left self-center overflow-hidden w-full h-[20px]">{session.title}</div>
                            </div>
                        </a> -->
                        <button class=" w-full flex px-2 py-2 rounded-xl {disabled? '': 'cursor-pointer group-hover:bg-gray-100 dark:group-hover:bg-gray-850 transition'}"
                            on:click={() => {
                                if ($mobile) {
                                    showSidebar.set(false);
                                }
                                // restore session from db
                                sessionStorage.session = JSON.stringify({
                                    id: session.id,
                                    char: session.char
                                })
                                // go to inital state
                                state.toInitial()
                            }}
                        >
                            <div class="flex self-center flex-1 w-full whitespace-nowrap text-ellipsis">
                                <div class="text-left self-center overflow-hidden w-full h-[20px]">{session.title}</div>
                            </div>
                        </button>
                    </div>
                    {/if}
                {/each}
            </div>
        </div>

        <div class="px-2.5">
            <div class="flex flex-col">
                <button
                    class=" flex rounded-xl py-3 px-3.5 w-full hover:bg-gray-100 dark:hover:bg-gray-900 transition"
                >
                    <div class=" self-center mr-3">
                        <div class='relative w-8 h-8 bg-orange-400 flex justify-center items-center rounded-full'>
                            <span class='text-gray-100 text-sm font-bold'>{$user.name.trim()[0].toUpperCase()}</span>
                        </div>
                    </div>
                    <div class=" self-center font-semibold">{$user.name}</div>
                </button>
            </div>
        </div>

    </div>


    <div
        id="sidebar-handle"
        class="fixed left-0 top-[50dvh] -translate-y-1/2 transition-transform translate-x-[255px] md:translate-x-[260px] rotate-0"
    >
        <button
            id="sidebar-toggle-button"
            class=" group"
            on:click={() => {
                showSidebar.set(!$showSidebar);
            }}>
            <span class="">
                <div class="flex h-[72px] w-8 items-center justify-center opacity-50 group-hover:opacity-100 transition">
                    <div class="flex h-6 w-6 flex-col items-center">
                        <div
                            class="h-3 w-1 rounded-full bg-[#0f0f0f] dark:bg-white rotate-0 translate-y-[0.15rem] {$showSidebar
                                ? 'group-hover:rotate-[15deg]'
                                : 'group-hover:rotate-[-15deg]'}"
                        />
                        <div
                            class="h-3 w-1 rounded-full bg-[#0f0f0f] dark:bg-white rotate-0 translate-y-[-0.15rem] {$showSidebar
                                ? 'group-hover:rotate-[-15deg]'
                                : 'group-hover:rotate-[15deg]'}"
                        />
                    </div>
                </div>
            </span>
        </button>
    </div>
</div>

