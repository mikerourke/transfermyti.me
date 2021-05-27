import React from "react";

import { ModalDialog, ExternalLink } from "~/components";
import { ToolAction } from "~/typeDefs";

const LinkToIssues: React.FC = () => (
  <ExternalLink
    color="primary"
    href="https://github.com/mikerourke/transfermyti.me/issues"
  >
    file a GitHub issue
  </ExternalLink>
);

const MailTo: React.FC = () => (
  <a
    href="mailto:mike.w.rourke@gmail.com"
    css={{ textDecoration: "underline" }}
  >
    contact the developer
  </a>
);

interface Props {
  isOpen: boolean;
  toolAction: ToolAction;
  onClose: VoidFunction;
}

const NoSelectionsModal: React.FC<Props> = (props) => (
  <ModalDialog isOpen={props.isOpen} title="Error" onClose={props.onClose}>
    <p>You haven&apos;t selected any records to {props.toolAction}.</p>
    <p>
      Please ensure you have checked the checkbox next to the records you&apos;d
      like to include before proceeding.
    </p>
    {props.toolAction !== ToolAction.Delete && (
      <p>
        Alternatively, all of the records may already exist on the target tool.
        If you believe this is an error, please <LinkToIssues /> or <MailTo />.
      </p>
    )}
  </ModalDialog>
);

export default NoSelectionsModal;
