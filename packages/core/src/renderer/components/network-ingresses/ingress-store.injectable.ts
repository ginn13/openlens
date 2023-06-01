/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import assert from "assert";
import { kubeObjectStoreInjectionToken } from "../../../common/k8s-api/api-manager/kube-object-store-token";
import { ingressApiInjectable, storesAndApisCanBeCreatedInjectionToken } from "@k8slens/kube-api-specifics";
import { loggerInjectionToken } from "@k8slens/logger";
import clusterFrameContextForNamespacedResourcesInjectable from "../../cluster-frame-context/for-namespaced-resources.injectable";
import { IngressStore } from "./ingress-store";

const ingressStoreInjectable = getInjectable({
  id: "ingress-store",
  instantiate: (di) => {
    assert(di.inject(storesAndApisCanBeCreatedInjectionToken), "ingressStore is only available in certain environments");

    const api = di.inject(ingressApiInjectable);

    return new IngressStore({
      context: di.inject(clusterFrameContextForNamespacedResourcesInjectable),
      logger: di.inject(loggerInjectionToken),
    }, api);
  },
  injectionToken: kubeObjectStoreInjectionToken,
});

export default ingressStoreInjectable;
