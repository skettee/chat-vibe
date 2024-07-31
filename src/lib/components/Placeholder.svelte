<script>
    import { fade } from 'svelte/transition';
    import {user} from '$lib/store.js'
    import charactersJson from '$lib/data/characters.json'
</script>

<div class="m-auto w-full max-w-5xl px-8 lg:px-24 pb-16">
    <div class="flex justify-start">
        <!-- Zuru hello image -->
        <img 
            src={charactersJson[$user.char].greeting.image}
            class="max-w-[240px] object-cover rounded-xl bg-[#b37eb5]"
            alt="profile"
            draggable="false"> 
    </div>
    <div class=" mt-2 mb-4 font-serif text-3xl text-gray-800 dark:text-gray-100 font-semibold text-left flex items-center gap-4">
        <div>
            <div class=" capitalize line-clamp-1" in:fade={{ duration: 200 }}>
                {charactersJson[$user.char].greeting.text}, {$user.name}
            </div>
            <div in:fade={{ duration: 200, delay: 200 }}>
                <div class=" font-medium text-gray-400 dark:text-gray-500">
                    How can I help you today?
                </div>
            </div>
        </div>
    </div>
</div>