/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { kubeApiInjectionToken } from "../kube-api/kube-api-injection-token";
import podMetricsApiInjectable from "./pod-metrics.api.injectable";

const podMetricsKubeApiInjectable = getInjectable({
  id: "pod-metrics-kube-api",
  instantiate: (di) => di.inject(podMetricsApiInjectable),
  injectionToken: kubeApiInjectionToken,
});


export default podMetricsKubeApiInjectable;