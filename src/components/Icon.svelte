<script lang="ts" context="module">
  export type IconName =
    | "circleAdd"
    | "circleRemove"
    | "close"
    | "github"
    | "heart"
    | "openExternal"
    | "linkedIn"
    | "twitter";
</script>

<script lang="ts">
  import CircleAddIcon from "~/components/icons/CircleAddIcon.svelte";
  import CircleRemoveIcon from "~/components/icons/CircleRemoveIcon.svelte";
  import CloseIcon from "~/components/icons/CloseIcon.svelte";
  import GitHubIcon from "~/components/icons/GitHubIcon.svelte";
  import HeartIcon from "~/components/icons/HeartIcon.svelte";
  import LinkedInIcon from "~/components/icons/LinkedInIcon.svelte";
  import OpenExternalIcon from "~/components/icons/OpenExternalIcon.svelte";
  import TwitterIcon from "~/components/icons/TwitterIcon.svelte";

  export let name: IconName;
  export let color: string;
  export let height: number | undefined = undefined;
  export let width: number | undefined = undefined;
  export let style: string | undefined = undefined;
</script>

{#if name === "circleAdd"}
  <CircleAddIcon {color} {height} {width} {style} />
{:else if name === "circleRemove"}
  <CircleRemoveIcon {color} {height} {width} {style} />
{:else if name === "close"}
  <CloseIcon {color} {height} {width} {style} />
{:else if name === "github"}
  <GitHubIcon {color} {height} {width} {style} />
{:else if name === "heart"}
  <HeartIcon {color} {height} {width} {style} />
{:else if name === "linkedIn"}
  <LinkedInIcon {color} {height} {width} {style} />
{:else if name === "openExternal"}
  <OpenExternalIcon {color} {height} {width} {style} />
{:else if name === "twitter"}
  <TwitterIcon {color} {height} {width} {style} />
{/if}
