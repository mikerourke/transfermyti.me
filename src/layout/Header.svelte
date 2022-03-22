<script lang="ts">
  import { Link } from "svelte-routing";

  import { RoutePath } from "~/typeDefs";

  import Logo from "~/layout/Logo.svelte";

  function getProps(): Dictionary<unknown> {
    return { style: "color: var(--color-secondary); font-size: 1.5rem;" };
  }
</script>

<style>
  header {
    display: flex;
    align-items: center;
    height: var(--height-header);
    padding: 0 1rem;
    width: 100%;
    background-color: var(--color-primary);
    color: var(--color-secondary);
  }
</style>

<header>
  <Logo />

  <Link to={RoutePath.PickToolAction} {getProps}>transfermyti.me</Link>
</header>
