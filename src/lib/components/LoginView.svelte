<script>
    import {user, showLogin} from '$lib/store.js'
    import { onMount, tick } from 'svelte';
    let name = ''

    const handleSubmit = () => {
        $user.name = name.trim()
        // Save user name to localStorage
        localStorage.user = JSON.stringify(
            {
                name: $user.name,
                char: 'default'

            })
        name = ''
        $showLogin = false
    }

    let nameInputElement

    onMount( async() => {
        await tick()
        nameInputElement.focus()
    })

</script>

<div class="w-screen h-screen fixed top-0 left-0  text-stone-900 bg-stone-200 dark:text-gray-100 dark:bg-gray-900 opacity-95
    flex justify-center items-center z-50">
    <form class="flex flex-col items-center" on:submit|preventDefault={handleSubmit}>
        <input id="name_input" bind:this={nameInputElement} 
            class="bg-gray-50 dark:bg-gray-900 dark:text-gray-100 outline-none w-full py-3 px-3 pl-4 m-4
            border border-gray-100 dark:border-gray-850 rounded-xl resize-none h-[48px] text-center placeholder-gray-400 dark:placeholder-gray-800" 
            type="text" placeholder="Enter your chat name" maxlength="10" required
            bind:value={name}>
        <!-- <button class=" flex cursor-pointer px-2 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-850 transition">Submit</button> -->
         <button class="{name !== ''
         ? 'bg-[#b37eb5] text-white hover:bg-[#87588e] dark:bg-[#87588e] dark:text-black dark:hover:bg-[#b37eb5] '
         : 'text-gray-200 bg-gray-300 dark:text-gray-900 dark:bg-gray-800 disabled'} transition rounded-xl p-1.5 self-center">
            Submit
         </button>
    </form>
</div>