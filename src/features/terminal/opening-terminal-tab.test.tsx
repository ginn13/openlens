/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { RenderResult } from "@testing-library/react";
import { prettyDOM, waitFor } from "@testing-library/react";
import assert from "assert";
import type { IObservableValue } from "mobx";
import { observable } from "mobx";
import type { IPty } from "node-pty";
import { waitUntilDefined } from "../../common/utils";
import createKubeconfigManagerInjectable from "../../main/kubeconfig-manager/create-kubeconfig-manager.injectable";
import type { KubeconfigManager } from "../../main/kubeconfig-manager/kubeconfig-manager";
import type { SpawnPty } from "../../main/shell-session/spawn-pty.injectable";
import spawnPtyInjectable from "../../main/shell-session/spawn-pty.injectable";
import type { ApplicationBuilder } from "../test-utils/application-builder";
import { setupInitializingApplicationBuilder } from "../test-utils/application-builder";
import type { FindByTextWithMarkup } from "../../test-utils/findByTextWithMarkup";
import { findByTextWithMarkupFor } from "../../test-utils/findByTextWithMarkup";
import terminalStoreInjectable from "../../renderer/components/dock/terminal/store.injectable";
import { flushPromises } from "../../common/test-utils/flush-promises";

describe("test for opening terminal tab within cluster frame", () => {
  let builder: ApplicationBuilder;
  let result: RenderResult;
  let findByTextWithMarkup: FindByTextWithMarkup;
  let spawnPtyMock: jest.MockedFunction<SpawnPty>;

  setupInitializingApplicationBuilder(b => builder = b);

  beforeEach(async () => {
    builder.mainDi.override(createKubeconfigManagerInjectable, () => (cluster) => {
      return {
        getPath: async () => `/some-kubeconfig-managed-path-for-${cluster.id}`,
        clear: async () => {},
      } as KubeconfigManager;
    });

    builder.setEnvironmentToClusterFrame();

    spawnPtyMock = jest.fn();
    builder.mainDi.override(spawnPtyInjectable, () => spawnPtyMock);

    result = await builder.render();
    findByTextWithMarkup = findByTextWithMarkupFor(result);
  });

  describe("when new terminal tab is opened", () => {
    beforeEach(() => {
      result.getByTestId("dock-tab-for-terminal").click();
    });

    it("renders", () => {
      expect(result.baseElement).toMatchSnapshot();
    });

    it("opens tab", () => {
      const terminalTabContents = result.queryByTestId("dock-tab-content-for-terminal");

      expect(terminalTabContents).toBeInTheDocument();
    });

    it("shows connecting message", async () => {
      await findByTextWithMarkup("Connecting ...");
    });

    describe("when the websocket connection is established", () => {
      let pty: IObservableValue<IPty | undefined>;
      let sendData: (e: string) => any;

      beforeEach(async () => {
        pty = observable.box(undefined, {
          deep: false,
        });

        spawnPtyMock.mockImplementationOnce(() => {
          const val: IPty = {
            cols: 80,
            handleFlowControl: false,
            kill: jest.fn(),
            onData: (handler) => {
              sendData = handler;

              return {
                dispose: () => {},
              };
            },
            onExit: jest.fn(),
            pause: jest.fn(),
            pid: 12345,
            process: "my-term",
            resize: jest.fn(),
            resume: jest.fn(),
            rows: 40,
            write: jest.fn(),
            on: jest.fn(),
          };

          pty.set(val);

          return val;
        });

        await waitUntilDefined(pty);
      });

      describe("when the first data is sent", () => {
        beforeEach(() => {
          sendData("");
        });

        it("clears the screen", async () => {
          await waitFor(() => hasNoTextContent(result.baseElement, ".xterm-rows"));
        });

        describe("when the next data is sent", () => {
          beforeEach(async () => {
            const terminalStore = builder.applicationWindow.only.di.inject(terminalStoreInjectable);
            const terminalApi = terminalStore.getTerminalApi("terminal");

            assert(terminalApi);

            const waitForData = new Promise<void>(resolve => terminalApi.on("data", (message) => {
              if (message) {
                resolve();
              }
            }));

            await flushPromises();
            sendData("I am a prompt");
            await waitForData;
          });

          it("renders the new data", async () => {
            await findByTextWithMarkup("I am a prompt");
          });
        });
      });
    });
  });
});

function hasNoTextContent(baseElement: HTMLElement, selector: string) {
  const root = baseElement.querySelector(selector);

  assert(root, `Did not find "${selector}" in:\n${prettyDOM(baseElement)}`);

  const assertChildrenHasNoTextContent = (elem: HTMLElement | Element) => {
    for (const child of elem.children) {
      expect(child.textContent?.trim()).toBe("");
      assertChildrenHasNoTextContent(child);
    }
  };

  expect(root.textContent?.trim()).toBe("");
  assertChildrenHasNoTextContent(root);
}