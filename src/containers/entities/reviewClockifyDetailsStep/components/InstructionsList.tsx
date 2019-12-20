import React from "react";
import { css } from "emotion";
import EntityTag, { EntityTagType } from "~/components/entityTag/EntityTag";

const InstructionsList: React.FC = () => (
  <div>
    <ul
      className={css({
        listStyle: "circle",
        marginLeft: "1rem",

        "li:not(:last-child)": {
          marginBottom: "0.75rem",
        },

        "li:last-child": {
          color: "var(--info)",
          fontWeight: 500,
        },

        "li:last-child > strong": {
          color: "var(--info)",
          fontWeight: 700,
        },

        span: {
          fontWeight: 700,
          margin: "0 4px",
          verticalAlign: "bottom",
        },
      })}
    >
      <li>
        Items with an
        <EntityTag size="small" tagType={EntityTagType.Existing} />
        tag already exist on Clockify, so they won&apos;t be transferred.
      </li>
      <li>
        Unfortunately, this tool <strong>does not</strong> check for duplicate
        time entries, so if you ran this tool on all your projects 6 times, you
        would end up with 6 copies of every time entry.
      </li>
      <li>
        There is some work being done to prevent duplicate time entries, but
        it&apos;s a lot trickier than just checking if the name is the same, so
        it might be a while until that&apos;s ready.
      </li>
      <li>
        Once you hit the <strong>Next</strong> button, you&apos;ll be asked to
        confirm the transfer before going buck wild.
      </li>
    </ul>
  </div>
);

export default InstructionsList;
