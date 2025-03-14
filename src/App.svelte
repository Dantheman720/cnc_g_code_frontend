<!-- src/App.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { v4 as uuidv4 } from 'uuid';
  import type { Tool } from './types';

  let tools: Tool[] = [];
  let selectedTool: Tool | null = null;
  let showForm: boolean = false;
  let loading: boolean = false;
  let error: string | null = null;

  const API_URL = 'http://192.168.4.187:8000/api/router-bits';

  async function fetchTools(): Promise<void> {
    try {
      loading = true;
      error = null;
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      tools = await response.json() as Tool[];
    } catch (err) {
      error = err instanceof Error ? err.message : 'An error occurred';
      console.error('Failed to fetch tools:', err);
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
      tool_vendor: null
    };
    showForm = true;
  }

  function editTool(tool: Tool): void {
    selectedTool = { ...tool };
    showForm = true;
  }

  function saveTool(): void {
    if (selectedTool) {
      if (!selectedTool.id) {
        tools = [...tools, selectedTool];
      } else {
        tools = tools.map(t => t.id === selectedTool!.id ? selectedTool! : t);
      }
      showForm = false;
      selectedTool = null;
    }
  }

  function deleteTool(id: string): void {
    if (confirm('Are you sure you want to delete this tool?')) {
      tools = tools.filter(t => t.id !== id);
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

      <div>
        <label>Tool Number:
          <input type="number" bind:value={selectedTool.tool_number} required />
        </label>
      </div>

      <div>
        <label>Flute Length:
          <input type="number" step="0.0001" bind:value={selectedTool.tool_flute_length} required />
        </label>
      </div>

      <div>
        <label>Number of Flutes:
          <input type="number" bind:value={selectedTool.tool_number_of_flutes} required />
        </label>
      </div>

      <div>
        <label>Overall Length:
          <input type="number" step="0.0001" bind:value={selectedTool.tool_overall_length} required />
        </label>
      </div>

      <div>
        <label>Spindle Speed:
          <input type="number" bind:value={selectedTool.tool_spindle_speed} required />
        </label>
      </div>

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