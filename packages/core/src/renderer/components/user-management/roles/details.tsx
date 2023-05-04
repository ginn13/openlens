/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./details.scss";

import { observer } from "mobx-react";
import React from "react";

import type { Role } from "@k8slens/kube-object";
import { DrawerTitle } from "../../drawer";
import type { KubeObjectDetailsProps } from "../../kube-object-details";

export const RoleDetails = observer((props: KubeObjectDetailsProps) => {
  const role = props.object as Role;

  const rules = role.getRules();

  return (
    <div className="RoleDetails">
      <DrawerTitle>Rules</DrawerTitle>
      {rules.map(({ resourceNames, apiGroups, resources, verbs }, index) => (
        <div className="rule" key={index}>
          {resources && (
            <>
              <div className="name">Resources</div>
              <div className="value">{resources.join(", ")}</div>
            </>
          )}

          <div className="name">Verbs</div>
          <div className="value">{verbs.join(", ")}</div>

          {apiGroups && (
            <>
              <div className="name">Api Groups</div>
              <div className="value">
                {apiGroups
                  .map(apiGroup => apiGroup === "" ? `'${apiGroup}'` : apiGroup)
                  .join(", ")}
              </div>
            </>
          )}
          {resourceNames && (
            <>
              <div className="name">Resource Names</div>
              <div className="value">{resourceNames.join(", ")}</div>
            </>
          )}
        </div>
      ))}
    </div>
  );
});

