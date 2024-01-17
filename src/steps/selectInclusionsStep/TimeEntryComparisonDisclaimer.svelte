<script lang="ts">
  import HelpDetails from "~/components/HelpDetails.svelte";
</script>

<style>
  ul {
    margin-top: 0.75rem;
  }

  li {
    padding: 0.25rem 0;
  }
</style>

<!-- prettier-ignore -->
<HelpDetails
  title="Show/Hide Time Entry Duplication Check Disclaimer"
  style="margin-bottom: 0;"
>
  <p>
    The time tracking tools prevent duplicate records from being created by
    comparing the <strong>Name</strong> value (for clients, tags, projects, etc.)
    If you attempt to create one of these records on the target tool with the same
    name, the API returns an error. However, there is no mechanism for preventing
    duplicate time entries.
  </p>

  <p>
    In an effort to prevent time entries from being duplicated, I check for
    certain conditions that are likely to match for duplicate entries. If all of
    the conditions in the list below are true, the time entry is marked as
    existing on the target tool and it is disabled from inclusion.
  </p>

  <ul>
    <li>
      Do the <strong>description</strong> fields <i>exactly</i> match?
    </li>

    <li>
      Is the source and target entry in the same <strong>project</strong> (or are
      neither of them associated with a project)?
    </li>

    <li>
      Is there less than 1 minute of difference between the
      <strong> start date and time</strong> of the source and target entry?
    </li>

    <li>
      Is there less than 1 minute of difference between the
      <strong> end date and time</strong> of the source and target entry?
    </li>
  </ul>

  <p style="margin-top: 1rem; font-weight: var(--font-weight-bold);">
    You can disable this check by toggling the switch below.
  </p>
</HelpDetails>
