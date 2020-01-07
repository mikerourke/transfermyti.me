import React from "react";
import { HelpDetails } from "~/components";

const TimeEntryComparisonDisclaimer: React.FC = () => (
  <HelpDetails
    css={{ ul: { marginTop: "0.75rem" }, li: { padding: "0.25rem 0" } }}
    title="Show/Hide Disclaimer"
  >
    <p>
      The time tracking tools prevent duplicate records from being created by
      comparing the <strong>Name</strong> value (for clients, tags, projects,
      etc.) If you attempt to create one of these records on the target tool
      with the same name, the API returns an error. However, there is no
      mechanism for preventing duplicate time entries.
    </p>
    <p>
      In an effort to prevent time entries from being duplicated, I check for
      certain conditions that are likely to match for duplicate entries. If all
      of the conditions in the list below are true, the time entry is marked as
      existing on the target tool and it is disabled from inclusion.
    </p>
    <ul>
      <li>
        Do the <strong>description</strong> fields <i>exactly</i> match?
      </li>
      <li>
        Are the source and target entry both <strong>active</strong>?
      </li>
      <li>
        Are the source and target entry both <strong>billable</strong>?
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
  </HelpDetails>
);

export default TimeEntryComparisonDisclaimer;
