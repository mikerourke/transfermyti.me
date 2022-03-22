<script lang="ts">
  import { onMount } from "svelte";
  import { Route, Router } from "svelte-routing";

  import { navigateToRoute } from "~/modules/app/navigateToRoute";
  import { RoutePath } from "~/typeDefs";

  import Footer from "~/layout/Footer.svelte";
  import Header from "~/layout/Header.svelte";
  import Notifications from "~/layout/Notifications.svelte";
  import EnterApiKeysStep from "~/steps/enterApiKeysStep/EnterApiKeysStep.svelte";
  import PickToolActionStep from "~/steps/pickToolActionStep/PickToolActionStep.svelte";
  import SelectWorkspacesStep from "~/steps/selectWorkspacesStep/SelectWorkspacesStep.svelte";

  onMount(() => {
    navigateToRoute(RoutePath.PickToolAction, { replace: true });
  });

  // Used for SSR. A falsy value is ignored by the Router.
  export let url = "";
</script>

<Router {url}>
  <Notifications />

  <Header />

  <Route path={RoutePath.PickToolAction}>
    <PickToolActionStep />
  </Route>

  <Route path={RoutePath.EnterApiKeys}>
    <EnterApiKeysStep />
  </Route>

  <Route path={RoutePath.SelectWorkspaces}>
    <SelectWorkspacesStep />
  </Route>

  <Route path={RoutePath.SelectInclusions}>
    <div>Yo</div>
  </Route>

  <Route path={RoutePath.ToolActionSuccess}>
    <div>Yo</div>
  </Route>

  <Footer />
</Router>
