<!-- src/App.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { v4 as uuidv4 } from 'uuid';
  import type { Tool, BitCoordinate } from './types';

  let tools: Tool[] = [];
  let selectedTool: Tool | null = null;
  let showForm: boolean = false;
  let loading: boolean = false;
  let error: string | null = null;

  const API_URL = 'http://192.168.4.187:8000/api/router-bits';
  const COORDINATES_API_URL = 'http://192.168.4.187:8000/api/router-bits/coordinates';

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

      // Join coordinates with tools
      tools = toolsData.map(tool => ({
        ...tool,
        coordinates: coordsData.filter(coord => coord.bit_id === tool.id)
      }));
    } catch (err) {
      error = err instanceof Error ? err.message : 'An error occurred';
      console.error('Failed to fetch data:', err);
    } finally {
      loading = false;
    }
  }

  async function saveCoordinates(bitId: string, coordinates: BitCoordinate[]): Promise<void> {
    try {
      await fetch(`${COORDINATES_API_URL}/${bitId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(coordinates)
      });
    } catch (err) {
      console.error('Failed to save coordinates:', err);
      throw err;
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
      coordinates: []
    };
    showForm = true;
  }

  function editTool(tool: Tool): void {
    selectedTool = { ...tool, coordinates: tool.coordinates ? [...tool.coordinates] : [] };
    showForm = true;
  }

  function addCoordinate(): void {
    if (selectedTool) {
      selectedTool.coordinates = [
        ...(selectedTool.coordinates || []),
        { bit_id: selectedTool.id, name: '', z: 0 }
      ];
    }
  }

  function removeCoordinate(index: number): void {
    if (selectedTool && selectedTool.coordinates) {
      selectedTool.coordinates = selectedTool.coordinates.filter((_, i) => i !== index);
    }
  }

  async function saveTool(): Promise<void> {
    if (selectedTool) {
      try {
        const isNew = !tools.some(t => t.id === selectedTool!.id);
        const method = isNew ? 'POST' : 'PUT';
        const url = isNew ? API_URL : `${API_URL}/${selectedTool.id}`;

        // Save tool
        const toolResponse = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...selectedTool, coordinates: undefined })
        });

        if (!toolResponse.ok) {
          throw new Error('Failed to save tool');
        }

        // Save coordinates
        if (selectedTool.coordinates) {
          await saveCoordinates(selectedTool.id, selectedTool.coordinates);
        }

        await fetchTools(); // Refresh data
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
    <button on:click={createTool}>Add New Tool</button>
    <button on:click={fetchTools}>Refresh</button>

    {#if tools.length === 0}
      <p>No tools found</p>
    {:else}
      <table>
        <thead>
        <tr>
          <th>Name</th>
          <th>Type</th>
          <th>Diameter</th>
          <th>Description</th>
          <th>Coordinates</th>
          <th>Actions</th>
        </tr>
        </thead>
        <tbody>
        {#each tools as tool (tool.id)}
          <tr>
            <td>{tool.name}</td>
            <td>{tool.type}</td>
            <td>{tool.diameter} {tool.tool_unit}</td>
            <td>{tool.description}</td>
            <td>{tool.coordinates?.length || 0}</td>
            <td>
              <button on:click={() => editTool(tool)}>Edit</button>
              <button on:click={() => deleteTool(tool.id)}>Delete</button>
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

      <h3>Coordinates</h3>
      {#if selectedTool.coordinates?.length}
        {#each selectedTool.coordinates as coord, index (coord.name)}
          <div class="coordinate-row">
            <label>Name:
              <input bind:value={coord.name} required />
            </label>
            <label>Z:
              <input type="number" step="0.0001" bind:value={coord.z} required />
            </label>
            <button type="button" on:click={() => removeCoordinate(index)}>Remove</button>
          </div>
        {/each}
      {/if}
      <button type="button" on:click={addCoordinate}>Add Coordinate</button>

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
  }

  .error {
    color: red;
    margin: 1rem 0;
  }
</style>