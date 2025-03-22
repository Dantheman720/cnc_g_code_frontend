<!-- src/App.svelte -->
<script lang="ts">
  import ToolManager from './lib/ToolManager.svelte';
  import Operations from './lib/Operations.svelte';

  let activeTab: string = 'tools';

  function setActiveTab(tab: string) {
    activeTab = tab;
  }
</script>

<main class="console">
  <header>
    <h1>CNC Management Console</h1>
    <nav>
      <button class:active={activeTab === 'tools'} on:click={() => setActiveTab('tools')}>
        Tool Manager
      </button>
      <button class:active={activeTab === 'operations'} on:click={() => setActiveTab('operations')}>
        Operations
      </button>
      <button class:active={activeTab === 'settings'} on:click={() => setActiveTab('settings')}>
        Settings
      </button>
    </nav>
  </header>

  <section class="content">
    {#if activeTab === 'tools'}
      <ToolManager />
    {:else if activeTab === 'operations'}
      <Operations />
    {:else if activeTab === 'settings'}
      <div class="placeholder">
        <h2>Settings</h2>
        <p>Settings configuration coming soon...</p>
      </div>
    {/if}
  </section>

  <footer>
    <p>CNC Management Console v1.0 - {new Date().getFullYear()}</p>
  </footer>
</main>

<style>
  .console {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    font-family: Arial, sans-serif;
  }

  header {
    padding: 1rem;
    background-color: #f5f5f5;
    border-bottom: 1px solid #ddd;
  }

  h1 {
    margin: 0 0 1rem 0;
    color: #333;
  }

  nav {
    display: flex;
    gap: 0.5rem;
  }

  nav button {
    padding: 0.5rem 1rem;
    border: 1px solid #ddd;
    background-color: white;
    cursor: pointer;
    border-radius: 4px;
    transition: all 0.2s;
  }

  nav button.active {
    background-color: #007bff;
    color: white;
    border-color: #007bff;
  }

  nav button:hover:not(.active) {
    background-color: #f0f0f0;
  }

  .content {
    flex: 1;
    padding: 1rem;
  }

  .placeholder {
    padding: 2rem;
    text-align: center;
    color: #666;
  }

  footer {
    padding: 1rem;
    text-align: center;
    background-color: #f5f5f5;
    border-top: 1px solid #ddd;
    color: #666;
  }
</style>