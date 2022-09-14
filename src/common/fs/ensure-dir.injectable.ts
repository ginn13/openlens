/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { EnsureOptions } from "fs-extra";
import fsInjectable from "./fs.injectable";

export type EnsureDirectory = (path: string, options?: number | EnsureOptions | undefined) => Promise<void>;

const ensureDirInjectable = getInjectable({
  id: "ensure-dir",

  // TODO: Remove usages of ensureDir from business logic.
  // TODO: Read, Write, Watch etc. operations should do this internally.
  instantiate: (di): EnsureDirectory => di.inject(fsInjectable).ensureDir,
});

export default ensureDirInjectable;
