<script lang="ts">
  import type { EntityGroup } from "~/types";
  import { getEntityGroupDisplay } from "~/utilities/textTransforms";

  export let entityGroup: EntityGroup;
  export let completedCount: number;
  export let totalCount: number;

  let percentage: number;
  $: percentage = calculatePercentage(completedCount, totalCount);

  function calculatePercentage(completed: number, total: number): number {
    let value = Math.round((completed / total) * 100);

    value = Math.min(value, 100);

    return Number.isNaN(value) ? 0 : value;
  }
</script>

<style>
  h2 {
    font-size: 1.25rem;
    font-weight: var(--font-weight-body);
    margin: 0 0 0.5rem 0.5rem;
  }

  [role="progressbar"] {
    position: relative;
    height: 1.5rem;
    width: 100%;
    border-radius: 3rem;
    background-color: var(--color-white);
    box-shadow: var(--elevation-dp2);
  }

  span {
    display: block;
    height: 100%;
    border-radius: inherit;
    background-color: var(--color-green);
    box-shadow: var(--elevation-dp2);
    transition: width 0.5s ease-in;
  }

  h3 {
    font-size: 1.125rem;
    margin: 0.5rem 0 0 0.75rem;
  }
</style>

<div>
  <h2 id="{entityGroup}-progress">{getEntityGroupDisplay(entityGroup)}</h2>

  <div
    role="progressbar"
    aria-valuenow={percentage}
    aria-valuemin={0}
    aria-valuemax={100}
    aria-labelledby="{entityGroup}-progress"
  >
    <span style="width: {percentage}%;" />
  </div>

  <h3>
    {completedCount} / {totalCount}
  </h3>
</div>
