<!-- src/lib/ToolManager.svelte -->
<script lang="ts">
    import { onMount } from 'svelte';
    import { v4 as uuidv4 } from 'uuid';
    import type { Tool, BitCoordinate } from '../types';

    export let tools: Tool[] = [];
    let selectedTool: Tool | null = null;
    let showForm: boolean = false;
    let loading: boolean = false;
    let error: string | null = null;
    let searchTerm: string = '';

    const API_URL = 'http://192.168.4.187:8000/api/router-bits';
    const COORDINATES_API_URL = 'http://192.168.4.187:8000/api/router-bits/coordinates';
    const GCODE_API_URL = 'http://192.168.4.187:8000/api/gcode';

    async function fetchTools(): Promise<void> {
        try {
            loading = true;
            error = null;
            const [toolsResponse, coordsResponse] = await Promise.all([
                fetch(API_URL),
                fetch(COORDINATES_API_URL)
            ]);

            if (!toolsResponse.ok || !coordsResponse.ok) {
                throw new Error('Failed to fetch data');
            }

            const toolsData = await toolsResponse.json() as Tool[];
            const coordsData = await coordsResponse.json() as BitCoordinate[];

            tools = toolsData
                .map(tool => ({
                    ...tool,
                    coordinate: coordsData.find(coord => coord.bit_id === tool.id)
                }))
                .sort((a, b) => a.name.localeCompare(b.name));
        } catch (err) {
            error = err instanceof Error ? err.message : 'An error occurred';
            console.error('Failed to fetch data:', err);
        } finally {
            loading = false;
        }
    }

    $: filteredTools = tools.filter(tool =>
        tool.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    async function saveCoordinate(coordinate: BitCoordinate): Promise<void> {
        try {
            const response = await fetch(`${COORDINATES_API_URL}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(coordinate)
            });
            if (!response.ok) throw new Error('Failed to save coordinate');
            await fetchTools();
        } catch (err) {
            error = err instanceof Error ? err.message : 'Failed to save coordinate';
            console.error('Coordinate save error:', err);
        }
    }

    async function updateCoordinateZ(coordinate: BitCoordinate): Promise<void> {
        try {
            const response = await fetch(`${COORDINATES_API_URL}/${coordinate.bit_id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(coordinate)
            });
            if (!response.ok) throw new Error('Failed to update coordinate');
            await fetchTools();
        } catch (err) {
            error = err instanceof Error ? err.message : 'Failed to update coordinate';
            console.error('Coordinate update error:', err);
        }
    }

    async function generateGcode(tool: Tool): Promise<void> {
        try {
            loading = true;
            error = null;

            // Basic G-code generation logic (customize as needed)
            const gcode = [
                `T${tool.tool_number} M6`, // Tool change
                `S${tool.tool_spindle_speed}`, // Spindle speed
                'G90', // Absolute positioning
                'G21', // Units in mm (adjust based on tool_unit)
                tool.coordinate ? `G00 Z${tool.coordinate.z}` : 'G00 Z0', // Rapid to Z position
                'G00 X0 Y0', // Move to origin
                `F${tool.tool_feed_cutting}`, // Feed rate
                'M3', // Spindle on
                // Add more G-code commands as needed
                'M5', // Spindle off
                'M30' // Program end
            ].join('\n');

            // Optional: Send to API
            const response = await fetch(`${GCODE_API_URL}/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tool_id: tool.id, gcode })
            });

            if (!response.ok) throw new Error('Failed to generate G-code');

            const result = await response.json();
            console.log('Generated G-code:', result.gcode || gcode);

            // For now, we'll just download the G-code
            const blob = new Blob([gcode], { type: 'text/plain' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${tool.name}_gcode.gcode`;
            a.click();
            window.URL.revokeObjectURL(url);

        } catch (err) {
            error = err instanceof Error ? err.message : 'Failed to generate G-code';
            console.error('G-code generation error:', err);
        } finally {
            loading = false;
        }
    }

    onMount(fetchTools);

    function createTool(): void {
        selectedTool = {
            id: uuidv4(),
            name: '',
            type: 'flat end mill',
            diameter: 0,
            description: '',
            tool_number: 0,
            tool_unit: 'inches',
            tool_assembly_gauge_length: 0,
            tool_body_length: 0,
            tool_feed_cutting: 0,
            tool_feed_entry: 0,
            tool_feed_exit: 0,
            tool_feed_per_revolution: 0,
            tool_feed_per_tooth: 0,
            tool_feed_plunge: 0,
            tool_feed_ramp: 0,
            tool_feed_transition: 0,
            tool_flute_length: 0,
            tool_number_of_flutes: 0,
            tool_overall_length: 0,
            tool_product_id: null,
            tool_product_link: null,
            tool_ramp_spindle_speed: 0,
            tool_shaft_diameter: 0,
            tool_shoulder_diameter: 0,
            tool_shoulder_length: 0,
            tool_spindle_speed: 0,
            tool_surface_speed: 0,
            tool_vendor: null,
        };
        showForm = true;
    }

    function editTool(tool: Tool): void {
        selectedTool = { ...tool, coordinate: tool.coordinate ? { ...tool.coordinate } : undefined };
        showForm = true;
    }

    function addCoordinate(): void {
        if (selectedTool) {
            selectedTool.coordinate = { bit_id: selectedTool.id, name: '', z: 0 };
        }
    }

    async function saveTool(): Promise<void> {
        if (selectedTool) {
            try {
                const isNew = !tools.some(t => t.id === selectedTool!.id);
                const method = isNew ? 'POST' : 'PUT';
                const url = isNew ? API_URL : `${API_URL}/${selectedTool.id}`;

                const toolResponse = await fetch(url, {
                    method,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...selectedTool, coordinate: undefined })
                });

                if (!toolResponse.ok) throw new Error('Failed to save tool');

                if (selectedTool.coordinate) await saveCoordinate(selectedTool.coordinate);

                await fetchTools();
                showForm = false;
                selectedTool = null;
            } catch (err) {
                error = err instanceof Error ? err.message : 'Failed to save tool';
            }
        }
    }

    function deleteTool(id: string): void {
        if (confirm('Are you sure you want to delete this tool?')) {
            fetch(`${API_URL}/${id}`, { method: 'DELETE' })
                .then(() => fetchTools())
                .catch(err => {
                    error = err instanceof Error ? err.message : 'Failed to delete tool';
                    console.error('Delete error:', err);
                });
        }
    }

    function cancelEdit(): void {
        showForm = false;
        selectedTool = null;
    }
</script>

<main>
    <h1>Tool Manager</h1>

    {#if loading}
        <p>Loading tools...</p>
    {:else if error}
        <p class="error">Error: {error}</p>
        <button on:click={fetchTools}>Retry</button>
    {:else if !showForm}
        <div class="controls">
            <button on:click={createTool}>Add New Tool</button>
            <button on:click={fetchTools}>Refresh</button>
            <input
                    type="text"
                    placeholder="Search by name..."
                    bind:value={searchTerm}
                    class="search-input"
            >
        </div>

        {#if filteredTools.length === 0}
            <p>No tools found</p>
        {:else}
            <table>
                <thead>
                <tr>
                    <th>Name</th>
                    <th>Type</th>
                    <th>Diameter</th>
                    <th>Description</th>
                    <th>Coordinate</th>
                    <th>Actions</th>
                </tr>
                </thead>
                <tbody>
                {#each filteredTools as tool (tool.id)}
                    <tr>
                        <td>{tool.name}</td>
                        <td>{tool.type}</td>
                        <td>{tool.diameter} {tool.tool_unit}</td>
                        <td>{tool.description}</td>
                        <td>
                            {#if tool.coordinate}
                                {tool.coordinate.name}:
                                <input
                                        type="number"
                                        step="0.0001"
                                        bind:value={tool.coordinate.z}
                                        on:blur={() => updateCoordinateZ(tool.coordinate)}
                                />
                            {:else}
                                None
                            {/if}
                        </td>
                        <td>
                            <button on:click={() => editTool(tool)}>Edit</button>
                            <button on:click={() => deleteTool(tool.id)}>Delete</button>
                            <button on:click={() => generateGcode(tool)}>Generate G-code</button>
                        </td>
                    </tr>
                {/each}
                </tbody>
            </table>
        {/if}
    {:else if selectedTool}
        <form on:submit|preventDefault={saveTool}>
            <h2>{selectedTool.id ? 'Edit' : 'Create'} Tool</h2>

            <div>
                <label>Name:
                    <input bind:value={selectedTool.name} required />
                </label>
            </div>

            <div>
                <label>Type:
                    <select bind:value={selectedTool.type} required>
                        <option value="flat end mill">Flat End Mill</option>
                        <option value="face mill">Face Mill</option>
                        <option value="chamfer mill">Chamfer Mill</option>
                        <option value="dovetail mill">Dovetail Mill</option>
                    </select>
                </label>
            </div>

            <div>
                <label>Diameter:
                    <input type="number" step="0.0001" bind:value={selectedTool.diameter} required />
                </label>
            </div>

            <div>
                <label>Unit:
                    <select bind:value={selectedTool.tool_unit}>
                        <option value="inches">Inches</option>
                        <option value="millimeters">Millimeters</option>
                    </select>
                </label>
            </div>

            <div>
                <label>Description:
                    <textarea bind:value={selectedTool.description}></textarea>
                </label>
            </div>

            <h3>Coordinate</h3>
            {#if !selectedTool.coordinate}
                <button type="button" on:click={addCoordinate}>Add Coordinate</button>
            {:else}
                <div class="coordinate-row">
                    <label>Name:
                        <input bind:value={selectedTool.coordinate.name} required />
                    </label>
                    <label>Z:
                        <input type="number" step="0.0001" bind:value={selectedTool.coordinate.z} required />
                    </label>
                </div>
            {/if}

            <div class="form-actions">
                <button type="submit">Save</button>
                <button type="button" on:click={cancelEdit}>Cancel</button>
            </div>
        </form>
    {/if}
</main>

<style>
    main {
        max-width: 1200px;
        margin: 0 auto;
        padding: 1rem;
    }

    table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 1rem;
    }

    th, td {
        padding: 0.5rem;
        border: 1px solid #ddd;
        text-align: left;
    }

    th {
        background-color: #f5f5f5;
    }

    form {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        max-width: 600px;
    }

    div {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
    }

    .controls {
        display: flex;
        gap: 1rem;
        margin-bottom: 1rem;
        align-items: center;
    }

    .search-input {
        padding: 0.5rem;
        flex-grow: 1;
        max-width: 300px;
    }

    .coordinate-row {
        flex-direction: row;
        gap: 1rem;
        align-items: flex-end;
        border: 1px solid #eee;
        padding: 0.5rem;
        margin-bottom: 0.5rem;
    }

    .form-actions {
        flex-direction: row;
        gap: 1rem;
    }

    button {
        padding: 0.5rem 1rem;
        cursor: pointer;
        margin-right: 0.5rem; /* Added spacing between buttons */
    }

    .error {
        color: red;
        margin: 1rem 0;
    }
</style>