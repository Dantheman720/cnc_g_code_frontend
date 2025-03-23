<!-- src/lib/Settings.svelte -->
<script lang="ts">
    import { onMount } from 'svelte';

    // Default work zero coordinates
    let defaultWorkZero: { x: number; y: number; z: number } = { x: 0, y: 0, z: 0 };
    let currentZMinimum: number = 0;
    let loading: boolean = false;
    let error: string | null = null;

    const API_URL = 'http://192.168.4.187:8000/api/settings';

    // Fetch current settings on mount
    async function fetchSettings(): Promise<void> {
        try {
            loading = true;
            error = null;

            const response = await fetch(`${API_URL}`);
            if (!response.ok) throw new Error('Failed to fetch settings');

            const data = await response.json();
            defaultWorkZero = data.default_work_zero || { x: 0, y: 0, z: 0 };
            currentZMinimum = data.current_z_minimum || 0;
        } catch (err) {
            error = err instanceof Error ? err.message : 'Failed to fetch settings';
            console.error('Settings fetch error:', err);
        } finally {
            loading = false;
        }
    }

    // Save updated settings
    async function saveSettings(): Promise<void> {
        try {
            loading = true;
            error = null;

            const response = await fetch(`${API_URL}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    default_work_zero: defaultWorkZero,
                    current_z_minimum: currentZMinimum
                })
            });

            if (!response.ok) throw new Error('Failed to save settings');

            alert('Settings saved successfully!');
        } catch (err) {
            error = err instanceof Error ? err.message : 'Failed to save settings';
            console.error('Settings save error:', err);
        } finally {
            loading = false;
        }
    }

    onMount(fetchSettings);
</script>

<section class="settings">
    <h2>Settings</h2>

    {#if loading}
        <p>Loading settings...</p>
    {:else if error}
        <p class="error">Error: {error}</p>
        <button on:click={fetchSettings}>Retry</button>
    {:else}
        <form on:submit|preventDefault={saveSettings}>
            <h3>Default Work Zero</h3>
            <div class="coordinate-inputs">
                <label>
                    X:
                    <input
                            type="number"
                            step="0.0001"
                            bind:value={defaultWorkZero.x}
                            required
                    />
                </label>
                <label>
                    Y:
                    <input
                            type="number"
                            step="0.0001"
                            bind:value={defaultWorkZero.y}
                            required
                    />
                </label>
                <label>
                    Z:
                    <input
                            type="number"
                            step="0.0001"
                            bind:value={defaultWorkZero.z}
                            required
                    />
                </label>
            </div>

            <h3>Current Z Minimum</h3>
            <div class="z-minimum">
                <label>
                    Z Minimum:
                    <input
                            type="number"
                            step="0.0001"
                            bind:value={currentZMinimum}
                            required
                    />
                </label>
            </div>

            <div class="form-actions">
                <button type="submit" disabled={loading}>
                    {#if loading}
                        Saving...
                    {:else}
                        Save Settings
                    {/if}
                </button>
            </div>
        </form>
    {/if}
</section>

<style>
    .settings {
        padding: 1rem;
        max-width: 600px;
        margin: 0 auto;
    }

    h3 {
        margin-top: 1.5rem;
        margin-bottom: 0.5rem;
    }

    .coordinate-inputs {
        display: flex;
        gap: 1rem;
        margin-bottom: 1rem;
    }

    .z-minimum {
        margin-bottom: 1rem;
    }

    label {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        flex: 1;
    }

    input {
        padding: 0.5rem;
        border: 1px solid #ddd;
        border-radius: 4px;
    }

    .form-actions {
        margin-top: 1rem;
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