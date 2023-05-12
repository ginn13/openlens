/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";

import clusterRoleBindingsRouteInjectable from "../../../../common/front-end-routing/routes/cluster/user-management/cluster-role-bindings/cluster-role-bindings-route.injectable";
import { sidebarItemInjectionToken } from "@k8slens/cluster-sidebar";
import routeIsActiveInjectable from "../../../routes/route-is-active.injectable";
import navigateToClusterRoleBindingsInjectable from "../../../../common/front-end-routing/routes/cluster/user-management/cluster-role-bindings/navigate-to-cluster-role-bindings.injectable";
import userManagementSidebarItemInjectable from "../user-management-sidebar-items.injectable";

const clusterRoleBindingsSidebarItemInjectable = getInjectable({
  id: "cluster-role-bindings-sidebar-item",

  instantiate: (di) => {
    const route = di.inject(clusterRoleBindingsRouteInjectable);

    return {
      id: "cluster-role-bindings",
      parentId: di.inject(userManagementSidebarItemInjectable).id,
      title: "Cluster Role Bindings",
      onClick: di.inject(navigateToClusterRoleBindingsInjectable),
      isActive: di.inject(routeIsActiveInjectable, route),
      isVisible: route.isEnabled,
      orderNumber: 40,
    };
  },

  injectionToken: sidebarItemInjectionToken,
});

export default clusterRoleBindingsSidebarItemInjectable;
