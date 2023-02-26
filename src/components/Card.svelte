<script lang="ts">
  export let title: string;

  let className: string | undefined = undefined;
  export { className as class };
</script>

<style>
  article {
    display: flex;
    flex-direction: column;
    flex: 0 0 20rem;
    margin: 0 1rem 2rem;
    padding: 1rem;
    border-radius: 0.5rem;
    background-color: var(--color-primary);
    box-shadow: var(--elevation-dp4);
    color: var(--color-secondary);
  }

  @media (max-width: 32rem) {
    article {
      flex-basis: 16rem;
    }
  }
</style>

<article class={className}>
  <h2>{title}</h2>

  <slot />
</article>
