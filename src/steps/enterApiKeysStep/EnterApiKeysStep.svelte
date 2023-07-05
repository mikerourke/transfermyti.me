<script lang="ts">
  import { onMount, tick } from "svelte";

  import { toolHelpDetailsByMappingSelector } from "~/redux/allEntities/allEntitiesSelectors";
  import {
    navigateToWorkflowStep,
    WorkflowStep,
  } from "~/redux/app/workflowStep";
  import {
    apiKeysUpdated,
    credentialsStored,
    validateCredentials,
    validationFetchStatusUpdated,
  } from "~/redux/credentials/credentialsActions";
  import {
    credentialsByMappingSelector,
    hasValidationErrorsSelector,
    validationErrorsByMappingSelector,
    validationFetchStatusSelector,
  } from "~/redux/credentials/credentialsSelectors";
  import { dispatchAction, select } from "~/redux/reduxToStore";
  import { FetchStatus, Mapping, ToolName } from "~/types";
  import { setFocusTo } from "~/utilities/domElements";

  import HelpDetails from "~/components/HelpDetails.svelte";
  import NavigationButtonsRow from "~/components/NavigationButtonsRow.svelte";

  import ApiKeyInputField from "./ApiKeyInputField.svelte";

  const credentialsByMapping = select(credentialsByMappingSelector);
  const hasValidationErrors = select(hasValidationErrorsSelector);
  const toolHelpDetailsByMapping = select(toolHelpDetailsByMappingSelector);
  const validationErrorsByMapping = select(validationErrorsByMappingSelector);
  const validationFetchStatus = select(validationFetchStatusSelector);

  let values: Record<Mapping, string> = {
    source: $credentialsByMapping.source.apiKey ?? "",
    target: $credentialsByMapping.target.apiKey ?? "",
  };

  let errors: Dictionary<string | null> = {
    source: null,
    target: null,
  };

  // Used to ensure the page doesn't immediately navigate to the
  // "Select Workspaces" step if the API keys are present in state:
  let wasMounted: boolean = false;

  const unsubscribers = [
    hasValidationErrors.subscribe((hasErrors) => {
      if (hasErrors) {
        errors = {
          ...errors,
          ...$validationErrorsByMapping,
        };
      }
    }),

    validationFetchStatus.subscribe((fetchStatus) => {
      if (
        fetchStatus === FetchStatus.Success &&
        values.source !== "" &&
        wasMounted
      ) {
        navigateToWorkflowStep(WorkflowStep.SelectWorkspaces);
      }
    }),
  ];

  onMount(() => {
    dispatchAction(credentialsStored());

    setFocusTo("input:first-of-type");

    wasMounted = true;

    return () => {
      unsubscribers.forEach((unsubscribe) => unsubscribe());
    };
  });

  function handleBackClick(): void {
    navigateToWorkflowStep(WorkflowStep.PickToolAction);
  }

  async function handleNextClick(): Promise<void> {
    dispatchAction(apiKeysUpdated(values));

    await tick();

    validateForm();
  }

  function handleResetClick(): void {
    dispatchAction(validationFetchStatusUpdated(FetchStatus.Pending));

    values = { source: "", target: "" };

    errors = { source: null, target: null };
  }

  function validateForm(): void {
    let isValid = true;

    errors = {
      source: null,
      target: null,
    };

    for (const [mapping, value] of Object.entries(values)) {
      // @ts-expect-error
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

<main data-step={WorkflowStep.EnterApiKeys}>
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
