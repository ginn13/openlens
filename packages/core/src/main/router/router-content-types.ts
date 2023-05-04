/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { isDefined } from "@k8slens/utilities";
import type { LensApiResult } from "./route";

export interface LensApiResultContentType {
  resultMapper: (result: LensApiResult<unknown>) => ({
    statusCode: number;
    content: unknown;
    headers: Record<string, string>;
  });
}

const resultMapperFor =
  (contentType: string): LensApiResultContentType["resultMapper"] =>
    ({ response, error, statusCode = isDefined(error) ? 200 : 400, headers = {}}) => ({
      statusCode,
      content: isDefined(error) ? error : response,
      headers: { ...headers, "Content-Type": contentType },
    });

export type SupportedFileExtension = "json" | "txt" | "html" | "css" | "gif" | "jpg" | "png" | "svg" | "js" | "woff2" | "ttf";

export const contentTypes: Record<SupportedFileExtension, LensApiResultContentType> = {
  json: {
    resultMapper: (result: LensApiResult<unknown>) => {
      const resultMapper = resultMapperFor("application/json");

      const mappedResult = resultMapper(result);

      const contentIsObject = typeof mappedResult.content === "object";
      const contentIsBuffer = mappedResult.content instanceof Buffer;
      const contentShouldBeStringified = contentIsObject && !contentIsBuffer;

      const content = contentShouldBeStringified
        ? JSON.stringify(mappedResult.content)
        : mappedResult.content;

      return {
        ...mappedResult,
        content,
      };
    },
  },

  txt: {
    resultMapper: resultMapperFor("text/plain"),
  },

  html: {
    resultMapper: resultMapperFor("text/html"),
  },

  css: {
    resultMapper: resultMapperFor("text/css"),
  },

  gif: {
    resultMapper: resultMapperFor("image/gif"),
  },

  jpg: {
    resultMapper: resultMapperFor("image/jpeg"),
  },

  png: {
    resultMapper: resultMapperFor("image/png"),
  },

  svg: {
    resultMapper: resultMapperFor("image/svg+xml"),
  },

  js: {
    resultMapper: resultMapperFor("application/javascript"),
  },

  woff2: {
    resultMapper: resultMapperFor("font/woff2"),
  },

  ttf: {
    resultMapper: resultMapperFor("font/ttf"),
  },
};
