/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { createInitializableState } from "../../common/initializable-state/create";
import { requestFromChannelInjectionToken } from "../../common/utils/channel/request-from-channel-injection-token";
import { buildVersionChannel, buildVersionInjectionToken } from "../../common/vars/build-semantic-version.injectable";
import { beforeFrameStartsInjectionToken } from "../before-frame-starts/before-frame-starts-injection-token";

const {
  value: buildVersionInjectable,
  initializer: initializeBuildVersionOnRendererInjectable,
} = createInitializableState({
  id: "build-version",
  init: (di) => {
    const requestFromChannel = di.inject(requestFromChannelInjectionToken);

    return requestFromChannel(buildVersionChannel);
  },
  injectionToken: buildVersionInjectionToken,
  when: beforeFrameStartsInjectionToken,
});

export { initializeBuildVersionOnRendererInjectable };

export default buildVersionInjectable;
