<script>
    import hljs from 'highlight.js';
	import 'highlight.js/styles/github-dark.min.css';

    export let id = '';
    export let lang = '';
    export let code = '';

    // temporary
    const tokenIdx = id

    $: highlightedCode = code ? hljs.highlightAuto(code, hljs.getLanguage(lang)?.aliases).value : '';
</script>

{#if code}
<pre class="hljs p-2 overflow-x-auto scrollbar"><code class="language-{lang} whitespace-pre-line">{@html highlightedCode || code}</code></pre>
{/if}
