/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { RenderResult } from "@testing-library/react";
import type { ApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import { getApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";

describe("preferences - navigation to kubernetes preferences", () => {
  let applicationBuilder: ApplicationBuilder;

  beforeEach(() => {
    applicationBuilder = getApplicationBuilder();
  });

  describe("given in preferences, when rendered", () => {
    let rendered: RenderResult;

    beforeEach(async () => {
      applicationBuilder.beforeRender(() => {
        applicationBuilder.preferences.navigate();
      });

      rendered = await applicationBuilder.render();
    });

    it("renders", () => {
      expect(rendered.container).toMatchSnapshot();
    });

    it("does not show kubernetes preferences yet", () => {
      const page = rendered.queryByTestId("kubernetes-preferences-page");

      expect(page).toBeNull();
    });

    describe("when navigating to kubernetes preferences using navigation", () => {
      beforeEach(() => {
        applicationBuilder.preferences.navigation.click("kubernetes");
      });

      it("renders", () => {
        expect(rendered.container).toMatchSnapshot();
      });

      it("shows kubernetes preferences", () => {
        const page = rendered.getByTestId("kubernetes-preferences-page");

        expect(page).not.toBeNull();
      });
    });
  });
});