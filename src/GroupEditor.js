import React from "react";
import { RouteComponentProps } from "react-router-dom";
import { SyncingEditor } from "./SyncingEditor";

export const GroupEditor = ({
  match: {
    params: { id },
  },
}) => {
  return (
    <div>
      <SyncingEditor groupId={id} />
    </div>
  );
};
