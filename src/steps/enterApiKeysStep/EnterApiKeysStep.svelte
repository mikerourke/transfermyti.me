<script lang="ts">
  import { onDestroy, onMount, tick } from "svelte";

  import { toolHelpDetailsByMappingSelector } from "~/modules/allEntities/allEntitiesSelectors";
  import { navigateToRoute } from "~/modules/app/navigateToRoute";
  import {
    storeCredentials,
    updateCredentials,
    updateValidationFetchStatus,
    validateCredentials,
  } from "~/modules/credentials/credentialsActions";
  import {
    credentialsByMappingSelector,
    hasValidationErrorsSelector,
    validationErrorsByMappingSelector,
    validationFetchStatusSelector,
  } from "~/modules/credentials/credentialsSelectors";
  import { dispatchAction, selectorToStore } from "~/redux/reduxToStore";
  import { FetchStatus, Mapping, RoutePath, ToolName } from "~/typeDefs";

  import HelpDetails from "~/components/HelpDetails.svelte";
  import NavigationButtonsRow from "~/components/NavigationButtonsRow.svelte";

  import ApiKeyInputField from "./ApiKeyInputField.svelte";

  const credentialsByMapping = selectorToStore(credentialsByMappingSelector);
  const hasValidationErrors = selectorToStore(hasValidationErrorsSelector);
  const toolHelpDetailsByMapping = selectorToStore(
    toolHelpDetailsByMappingSelector,
  );
  const validationErrorsByMapping = selectorToStore(
    validationErrorsByMappingSelector,
  );
  const validationFetchStatus = selectorToStore(validationFetchStatusSelector);

  let values: Dictionary<string> = {
    source: $credentialsByMapping.source.apiKey ?? "",
    target: $credentialsByMapping.target.apiKey ?? "",
  };

  let errors: Dictionary<string | null> = {
    source: null,
    target: null,
  };

  const unsubscribers = [
    hasValidationErrors.subscribe((value) => {
      if (value) {
        errors = {
          ...errors,
          ...$validationErrorsByMapping,
        };
      }
    }),

    validationFetchStatus.subscribe((value) => {
      if (value === FetchStatus.Success) {
        navigateToRoute(RoutePath.SelectWorkspaces);
      }
    }),
  ];

  onMount(() => {
    dispatchAction(storeCredentials());

    document.querySelector<HTMLInputElement>("input:first-of-type")?.focus();
  });

  onDestroy(() => {
    unsubscribers.forEach((unsubscribe) => unsubscribe());
  });

  function handleBackClick(): void {
    navigateToRoute(RoutePath.PickToolAction);
  }

  // TODO: Change this to a single action.
  async function handleNextClick(): Promise<void> {
    const source = { mapping: Mapping.Source, apiKey: values.source };
    const target = { mapping: Mapping.Target, apiKey: values.target };

    dispatchAction(updateCredentials(source));
    await tick();

    dispatchAction(updateCredentials(target));
    await tick();

    validateForm();
  }

  function handleResetClick(): void {
    console.log("WOO");
    dispatchAction(updateValidationFetchStatus(FetchStatus.Pending));

    values = { source: "", target: "" };

    errors = { source: null, target: null };
  }

  function validateForm(): void {
    let isValid = true;

    for (const [mapping, value] of Object.entries(values)) {
      const { toolName } = $toolHelpDetailsByMapping[mapping];

      if (value === "" && toolName !== ToolName.None) {
        isValid = false;

        errors = { ...errors, [mapping]: "This field is required" };
      }
    }

    // If either of the inputs are empty, we don't want to move onto the next
    // step where we check the credentials, because we know they'll be
    // invalid:
    if (!isValid) {
      return;
    }

    dispatchAction(validateCredentials.request());
  }
</script>

<style>
  form {
    margin: 0 1rem;
  }
</style>

<main>
  <h1>Step 2: Enter API Keys</h1>

  <HelpDetails>
    <p>
      Enter your the API key for each tool in the input below. You can get the
      API key by clicking on the link above each input.
    </p>

    <p>
      These keys are needed to read and write data for the tools involved in the
      transfer. They are stored in global state while you use the tool. Once the
      transfer is complete, the values are cleared from state.
    </p>

    <p>
      Press the <strong>Next</strong> button to validate your keys and move on to
      the workspace selection step. If the key is invalid, an error message will
      be displayed below the invalid key.
    </p>
  </HelpDetails>

  <form on:submit|preventDefault autocomplete="off">
    <ApiKeyInputField
      mapping={Mapping.Source}
      toolHelpDetails={$toolHelpDetailsByMapping.source}
      bind:value={values.source}
      errorMessage={errors.source}
    />

    {#if $toolHelpDetailsByMapping.target.toolName !== ToolName.None}
      <ApiKeyInputField
        mapping={Mapping.Target}
        toolHelpDetails={$toolHelpDetailsByMapping.target}
        bind:value={values.target}
        errorMessage={errors.target}
      />
    {/if}
  </form>

  <NavigationButtonsRow
    loading={$validationFetchStatus === FetchStatus.InProcess}
    refreshLabel="Reset"
    on:back={handleBackClick}
    on:next={handleNextClick}
    on:refresh={handleResetClick}
  />
</main>
