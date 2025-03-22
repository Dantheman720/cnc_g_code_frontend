<!-- src/lib/Operations.svelte -->
<script lang="ts">
    import { onMount } from 'svelte';

    let loading: boolean = false;
    let error: string | null = null;

    const API_URL = 'http://192.168.4.187:8000/api/generate-gcode';

    async function generateDefaultWorkZero() {
        try {
            loading = true;
            error = null;

            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Accept': 'application/octet-stream'
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to generate G-code: ${response.statusText}`);
            }

            // Get the blob from the response
            const blob = await response.blob();

            // Create a temporary URL for the blob
            const url = window.URL.createObjectURL(blob);

            // Create a temporary link element to trigger download
            const link = document.createElement('a');
            link.href = url;
            link.download = 'DEFAULT_WORK_ZERO.tap'; // Match the filename from the backend
            document.body.appendChild(link);
            link.click();

            // Clean up
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

        } catch (err) {
            error = err instanceof Error ? err.message : 'Failed to generate G-code';
            console.error('G-code generation error:', err);
        } finally {
            loading = false;
        }
    }

    onMount(() => {
        // Optional: Load initial state if needed
    });
</script>

<section class="operations">
    <h2>Operations</h2>

    <div class="controls">
        <button
                on:click={generateDefaultWorkZero}
                disabled={loading}
        >
            {#if loading}
                Generating...
            {:else}
                Generate default work zero
            {/if}
        </button>
    </div>

    {#if error}
        <p class="error">Error: {error}</p>
    {/if}
</section>

<style>
    .operations {
        padding: 1rem;
    }

    .controls {
        margin: 1rem 0;
    }

    button {
        padding: 0.5rem 1rem;
        background-color: #007bff;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        transition: background-color 0.2s;
    }

    button:hover:not(:disabled) {
        background-color: #0056b3;
    }

    button:disabled {
        background-color: #cccccc;
        cursor: not-allowed;
    }

    .error {
        color: red;
        margin: 1rem 0;
    }
</style>