<!-- src/lib/Settings.svelte -->
<script lang="ts">
    import { onMount } from 'svelte';

    // All settings from the database
    let settings: { id: string; key: string; value: string; description?: string }[] = [];
    let loading: boolean = false;
    let error: string | null = null;

    // New setting input
    let newSetting: { key: string; value: string; description: string } = { key: '', value: '', description: '' };

    const API_URL = 'http://192.168.4.187:8000/api/settings';

    // Fetch current settings on mount
    async function fetchSettings(): Promise<void> {
        try {
            loading = true;
            error = null;

            const response = await fetch(API_URL);
            if (!response.ok) throw new Error('Failed to fetch settings');

            settings = await response.json();
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

            // Update existing settings
            for (const setting of settings) {
                const response = await fetch(`${API_URL}/${setting.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        key: setting.key,
                        value: setting.value,
                        description: setting.description
                    })
                });

                if (!response.ok) throw new Error(`Failed to update setting: ${setting.key}`);
            }

            alert('Settings updated successfully!');
        } catch (err) {
            error = err instanceof Error ? err.message : 'Failed to save settings';
            console.error('Settings save error:', err);
        } finally {
            loading = false;
        }
    }

    // Add a new setting
    async function addSetting(): Promise<void> {
        if (!newSetting.key || !newSetting.value) {
            error = 'Key and value are required for a new setting';
            return;
        }

        try {
            loading = true;
            error = null;

            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    key: newSetting.key,
                    value: newSetting.value,
                    description: newSetting.description || undefined
                })
            });

            if (!response.ok) throw new Error('Failed to add new setting');

            const savedSetting = await response.json();
            settings = [...settings, savedSetting]; // Add to the list
            newSetting = { key: '', value: '', description: '' }; // Reset form

            alert('New setting added successfully!');
        } catch (err) {
            error = err instanceof Error ? err.message : 'Failed to add setting';
            console.error('Add setting error:', err);
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
        <!-- Existing Settings -->
        <form on:submit|preventDefault={saveSettings}>
            <h3>Current Settings</h3>
            {#if settings.length === 0}
                <p>No settings found.</p>
            {:else}
                <table>
                    <thead>
                    <tr>
                        <th>Key</th>
                        <th>Value</th>
                        <th>Description</th>
                    </tr>
                    </thead>
                    <tbody>
                    {#each settings as setting (setting.id)}
                        <tr>
                            <td>
                                <input
                                        type="text"
                                        bind:value={setting.key}
                                        required
                                />
                            </td>
                            <td>
                                <input
                                        type="text"
                                        bind:value={setting.value}
                                        required
                                />
                            </td>
                            <td>
                                <input
                                        type="text"
                                        bind:value={setting.description}
                                />
                            </td>
                        </tr>
                    {/each}
                    </tbody>
                </table>
            {/if}

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

        <!-- Add New Setting -->
        <h3>Add New Setting</h3>
        <form on:submit|preventDefault={addSetting}>
            <div class="new-setting-inputs">
                <label>
                    Key:
                    <input
                            type="text"
                            bind:value={newSetting.key}
                            placeholder="Enter key"
                            required
                    />
                </label>
                <label>
                    Value:
                    <input
                            type="text"
                            bind:value={newSetting.value}
                            placeholder="Enter value"
                            required
                    />
                </label>
                <label>
                    Description:
                    <input
                            type="text"
                            bind:value={newSetting.description}
                            placeholder="Optional description"
                    />
                </label>
            </div>

            <div class="form-actions">
                <button type="submit" disabled={loading}>
                    {#if loading}
                        Adding...
                    {:else}
                        Add Setting
                    {/if}
                </button>
            </div>
        </form>
    {/if}
</section>

<style>
    .settings {
        padding: 1rem;
        max-width: 800px;
        margin: 0 auto;
    }

    h3 {
        margin-top: 1.5rem;
        margin-bottom: 0.5rem;
    }

    table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 1rem;
    }

    th, td {
        padding: 0.5rem;
        border: 1px solid #ddd;
        text-align: left;
    }

    th {
        background-color: #f5f5f5;
    }

    .new-setting-inputs {
        display: flex;
        gap: 1rem;
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