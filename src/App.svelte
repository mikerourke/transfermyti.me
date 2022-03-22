<script lang="ts">
  import { onMount } from "svelte";
  import { Route, Router } from "svelte-routing";

  import { navigateToRoute } from "~/modules/app/navigateToRoute";
  import { RoutePath } from "~/typeDefs";

  import Footer from "~/layout/Footer.svelte";
  import Header from "~/layout/Header.svelte";
  import Notifications from "~/layout/Notifications.svelte";
  import PickToolActionStep from "~/steps/pickToolActionStep/PickToolActionStep.svelte";

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
    <div>Yo</div>
  </Route>

  <Route path={RoutePath.SelectWorkspaces}>
    <div>Yo</div>
  </Route>

  <Route path={RoutePath.SelectInclusions}>
    <div>Yo</div>
  </Route>

  <Route path={RoutePath.ToolActionSuccess}>
    <div>Yo</div>
  </Route>

  <Footer />
</Router>
