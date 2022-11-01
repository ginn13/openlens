/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { createInitializableState } from "../../../common/initializable-state/create";
import { buildVersionInjectionToken } from "../../../common/vars/build-semantic-version.injectable";
import { beforeApplicationIsLoadingInjectionToken } from "../../start-main-application/runnable-tokens/before-application-is-loading-injection-token";
import getBuildVersionInjectable from "./get-build-version.injectable";

const {
  value: buildVersionInjectable,
  initializer: initializeBuildVersionInjectable,
} = createInitializableState({
  id: "build-version",
  init: (di) => {
    const getBuildVersion = di.inject(getBuildVersionInjectable);

    return getBuildVersion();
  },
  injectionToken: buildVersionInjectionToken,
  when: beforeApplicationIsLoadingInjectionToken,
});

export { initializeBuildVersionInjectable };

export default buildVersionInjectable;
