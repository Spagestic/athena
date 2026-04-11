/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as CustomPassword from "../CustomPassword.js";
import type * as auth from "../auth.js";
import type * as dashboard from "../dashboard.js";
import type * as demo from "../demo.js";
import type * as exa from "../exa.js";
import type * as firecrawl from "../firecrawl.js";
import type * as firecrawl_crawl from "../firecrawl/crawl.js";
import type * as firecrawl_map from "../firecrawl/map.js";
import type * as firecrawl_scrape from "../firecrawl/scrape.js";
import type * as firecrawl_search from "../firecrawl/search.js";
import type * as folders from "../folders.js";
import type * as http from "../http.js";
import type * as mistral from "../mistral.js";
import type * as modules from "../modules.js";
import type * as notes from "../notes.js";
import type * as ocr from "../ocr.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  CustomPassword: typeof CustomPassword;
  auth: typeof auth;
  dashboard: typeof dashboard;
  demo: typeof demo;
  exa: typeof exa;
  firecrawl: typeof firecrawl;
  "firecrawl/crawl": typeof firecrawl_crawl;
  "firecrawl/map": typeof firecrawl_map;
  "firecrawl/scrape": typeof firecrawl_scrape;
  "firecrawl/search": typeof firecrawl_search;
  folders: typeof folders;
  http: typeof http;
  mistral: typeof mistral;
  modules: typeof modules;
  notes: typeof notes;
  ocr: typeof ocr;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
