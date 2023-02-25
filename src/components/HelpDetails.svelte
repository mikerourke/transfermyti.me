<script lang="ts">
  import classes from "./HelpDetails.module.css";

  export let title: string = "Show/Hide Help";
  export let open: boolean = false;
</script>

<style>
  details {
    width: 100%;
    margin-bottom: 1rem;
    color: var(--color-primary);
  }

  div,
  summary {
    margin: 0;
    padding: 0.5rem 0.25rem;
  }

  div {
    margin: 0 1rem;
  }

  summary {
    cursor: default;
    font-weight: var(--font-weight-bold);
  }
</style>

<details class={classes.helpDetails} {open} {...$$restProps}>
  <summary>
    {title}
  </summary>

  <div>
    <slot />
  </div>

  <hr />
</details>
