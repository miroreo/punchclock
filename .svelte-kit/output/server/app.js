var __accessCheck = (obj, member, msg) => {
  if (!member.has(obj))
    throw TypeError("Cannot " + msg);
};
var __privateGet = (obj, member, getter) => {
  __accessCheck(obj, member, "read from private field");
  return getter ? getter.call(obj) : member.get(obj);
};
var __privateAdd = (obj, member, value) => {
  if (member.has(obj))
    throw TypeError("Cannot add the same private member more than once");
  member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
};
var __privateSet = (obj, member, value, setter) => {
  __accessCheck(obj, member, "write to private field");
  setter ? setter.call(obj, value) : member.set(obj, value);
  return value;
};
var _map;
import cookie from "cookie";
import { v4 } from "@lukeed/uuid";
import { ApolloServer } from "apollo-server-lambda";
import pkg from "graphql-iso-date";
import axios from "axios";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
function get_single_valued_header(headers, key) {
  const value = headers[key];
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return void 0;
    }
    if (value.length > 1) {
      throw new Error(`Multiple headers provided for ${key}. Multiple may be provided only for set-cookie`);
    }
    return value[0];
  }
  return value;
}
function coalesce_to_error(err) {
  return err instanceof Error || err && err.name && err.message ? err : new Error(JSON.stringify(err));
}
function lowercase_keys(obj) {
  const clone = {};
  for (const key in obj) {
    clone[key.toLowerCase()] = obj[key];
  }
  return clone;
}
function error(body) {
  return {
    status: 500,
    body,
    headers: {}
  };
}
function is_string(s2) {
  return typeof s2 === "string" || s2 instanceof String;
}
function is_content_type_textual(content_type) {
  if (!content_type)
    return true;
  const [type] = content_type.split(";");
  return type === "text/plain" || type === "application/json" || type === "application/x-www-form-urlencoded" || type === "multipart/form-data";
}
async function render_endpoint(request, route, match) {
  const mod = await route.load();
  const handler2 = mod[request.method.toLowerCase().replace("delete", "del")];
  if (!handler2) {
    return;
  }
  const params = route.params(match);
  const response = await handler2({ ...request, params });
  const preface = `Invalid response from route ${request.path}`;
  if (!response) {
    return;
  }
  if (typeof response !== "object") {
    return error(`${preface}: expected an object, got ${typeof response}`);
  }
  let { status = 200, body, headers = {} } = response;
  headers = lowercase_keys(headers);
  const type = get_single_valued_header(headers, "content-type");
  const is_type_textual = is_content_type_textual(type);
  if (!is_type_textual && !(body instanceof Uint8Array || is_string(body))) {
    return error(`${preface}: body must be an instance of string or Uint8Array if content-type is not a supported textual content-type`);
  }
  let normalized_body;
  if ((typeof body === "object" || typeof body === "undefined") && !(body instanceof Uint8Array) && (!type || type.startsWith("application/json"))) {
    headers = { ...headers, "content-type": "application/json; charset=utf-8" };
    normalized_body = JSON.stringify(typeof body === "undefined" ? {} : body);
  } else {
    normalized_body = body;
  }
  return { status, body: normalized_body, headers };
}
var chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_$";
var unsafeChars = /[<>\b\f\n\r\t\0\u2028\u2029]/g;
var reserved = /^(?:do|if|in|for|int|let|new|try|var|byte|case|char|else|enum|goto|long|this|void|with|await|break|catch|class|const|final|float|short|super|throw|while|yield|delete|double|export|import|native|return|switch|throws|typeof|boolean|default|extends|finally|package|private|abstract|continue|debugger|function|volatile|interface|protected|transient|implements|instanceof|synchronized)$/;
var escaped$1 = {
  "<": "\\u003C",
  ">": "\\u003E",
  "/": "\\u002F",
  "\\": "\\\\",
  "\b": "\\b",
  "\f": "\\f",
  "\n": "\\n",
  "\r": "\\r",
  "	": "\\t",
  "\0": "\\0",
  "\u2028": "\\u2028",
  "\u2029": "\\u2029"
};
var objectProtoOwnPropertyNames = Object.getOwnPropertyNames(Object.prototype).sort().join("\0");
function devalue(value) {
  var counts = new Map();
  function walk(thing) {
    if (typeof thing === "function") {
      throw new Error("Cannot stringify a function");
    }
    if (counts.has(thing)) {
      counts.set(thing, counts.get(thing) + 1);
      return;
    }
    counts.set(thing, 1);
    if (!isPrimitive(thing)) {
      var type = getType(thing);
      switch (type) {
        case "Number":
        case "String":
        case "Boolean":
        case "Date":
        case "RegExp":
          return;
        case "Array":
          thing.forEach(walk);
          break;
        case "Set":
        case "Map":
          Array.from(thing).forEach(walk);
          break;
        default:
          var proto = Object.getPrototypeOf(thing);
          if (proto !== Object.prototype && proto !== null && Object.getOwnPropertyNames(proto).sort().join("\0") !== objectProtoOwnPropertyNames) {
            throw new Error("Cannot stringify arbitrary non-POJOs");
          }
          if (Object.getOwnPropertySymbols(thing).length > 0) {
            throw new Error("Cannot stringify POJOs with symbolic keys");
          }
          Object.keys(thing).forEach(function(key) {
            return walk(thing[key]);
          });
      }
    }
  }
  walk(value);
  var names = new Map();
  Array.from(counts).filter(function(entry) {
    return entry[1] > 1;
  }).sort(function(a, b) {
    return b[1] - a[1];
  }).forEach(function(entry, i) {
    names.set(entry[0], getName(i));
  });
  function stringify(thing) {
    if (names.has(thing)) {
      return names.get(thing);
    }
    if (isPrimitive(thing)) {
      return stringifyPrimitive(thing);
    }
    var type = getType(thing);
    switch (type) {
      case "Number":
      case "String":
      case "Boolean":
        return "Object(" + stringify(thing.valueOf()) + ")";
      case "RegExp":
        return "new RegExp(" + stringifyString(thing.source) + ', "' + thing.flags + '")';
      case "Date":
        return "new Date(" + thing.getTime() + ")";
      case "Array":
        var members = thing.map(function(v, i) {
          return i in thing ? stringify(v) : "";
        });
        var tail = thing.length === 0 || thing.length - 1 in thing ? "" : ",";
        return "[" + members.join(",") + tail + "]";
      case "Set":
      case "Map":
        return "new " + type + "([" + Array.from(thing).map(stringify).join(",") + "])";
      default:
        var obj = "{" + Object.keys(thing).map(function(key) {
          return safeKey(key) + ":" + stringify(thing[key]);
        }).join(",") + "}";
        var proto = Object.getPrototypeOf(thing);
        if (proto === null) {
          return Object.keys(thing).length > 0 ? "Object.assign(Object.create(null)," + obj + ")" : "Object.create(null)";
        }
        return obj;
    }
  }
  var str = stringify(value);
  if (names.size) {
    var params_1 = [];
    var statements_1 = [];
    var values_1 = [];
    names.forEach(function(name, thing) {
      params_1.push(name);
      if (isPrimitive(thing)) {
        values_1.push(stringifyPrimitive(thing));
        return;
      }
      var type = getType(thing);
      switch (type) {
        case "Number":
        case "String":
        case "Boolean":
          values_1.push("Object(" + stringify(thing.valueOf()) + ")");
          break;
        case "RegExp":
          values_1.push(thing.toString());
          break;
        case "Date":
          values_1.push("new Date(" + thing.getTime() + ")");
          break;
        case "Array":
          values_1.push("Array(" + thing.length + ")");
          thing.forEach(function(v, i) {
            statements_1.push(name + "[" + i + "]=" + stringify(v));
          });
          break;
        case "Set":
          values_1.push("new Set");
          statements_1.push(name + "." + Array.from(thing).map(function(v) {
            return "add(" + stringify(v) + ")";
          }).join("."));
          break;
        case "Map":
          values_1.push("new Map");
          statements_1.push(name + "." + Array.from(thing).map(function(_a) {
            var k = _a[0], v = _a[1];
            return "set(" + stringify(k) + ", " + stringify(v) + ")";
          }).join("."));
          break;
        default:
          values_1.push(Object.getPrototypeOf(thing) === null ? "Object.create(null)" : "{}");
          Object.keys(thing).forEach(function(key) {
            statements_1.push("" + name + safeProp(key) + "=" + stringify(thing[key]));
          });
      }
    });
    statements_1.push("return " + str);
    return "(function(" + params_1.join(",") + "){" + statements_1.join(";") + "}(" + values_1.join(",") + "))";
  } else {
    return str;
  }
}
function getName(num) {
  var name = "";
  do {
    name = chars[num % chars.length] + name;
    num = ~~(num / chars.length) - 1;
  } while (num >= 0);
  return reserved.test(name) ? name + "_" : name;
}
function isPrimitive(thing) {
  return Object(thing) !== thing;
}
function stringifyPrimitive(thing) {
  if (typeof thing === "string")
    return stringifyString(thing);
  if (thing === void 0)
    return "void 0";
  if (thing === 0 && 1 / thing < 0)
    return "-0";
  var str = String(thing);
  if (typeof thing === "number")
    return str.replace(/^(-)?0\./, "$1.");
  return str;
}
function getType(thing) {
  return Object.prototype.toString.call(thing).slice(8, -1);
}
function escapeUnsafeChar(c) {
  return escaped$1[c] || c;
}
function escapeUnsafeChars(str) {
  return str.replace(unsafeChars, escapeUnsafeChar);
}
function safeKey(key) {
  return /^[_$a-zA-Z][_$a-zA-Z0-9]*$/.test(key) ? key : escapeUnsafeChars(JSON.stringify(key));
}
function safeProp(key) {
  return /^[_$a-zA-Z][_$a-zA-Z0-9]*$/.test(key) ? "." + key : "[" + escapeUnsafeChars(JSON.stringify(key)) + "]";
}
function stringifyString(str) {
  var result = '"';
  for (var i = 0; i < str.length; i += 1) {
    var char = str.charAt(i);
    var code = char.charCodeAt(0);
    if (char === '"') {
      result += '\\"';
    } else if (char in escaped$1) {
      result += escaped$1[char];
    } else if (code >= 55296 && code <= 57343) {
      var next = str.charCodeAt(i + 1);
      if (code <= 56319 && (next >= 56320 && next <= 57343)) {
        result += char + str[++i];
      } else {
        result += "\\u" + code.toString(16).toUpperCase();
      }
    } else {
      result += char;
    }
  }
  result += '"';
  return result;
}
function noop$1() {
}
function safe_not_equal$1(a, b) {
  return a != a ? b == b : a !== b || (a && typeof a === "object" || typeof a === "function");
}
Promise.resolve();
const subscriber_queue$1 = [];
function writable$1(value, start = noop$1) {
  let stop;
  const subscribers = new Set();
  function set(new_value) {
    if (safe_not_equal$1(value, new_value)) {
      value = new_value;
      if (stop) {
        const run_queue = !subscriber_queue$1.length;
        for (const subscriber of subscribers) {
          subscriber[1]();
          subscriber_queue$1.push(subscriber, value);
        }
        if (run_queue) {
          for (let i = 0; i < subscriber_queue$1.length; i += 2) {
            subscriber_queue$1[i][0](subscriber_queue$1[i + 1]);
          }
          subscriber_queue$1.length = 0;
        }
      }
    }
  }
  function update(fn) {
    set(fn(value));
  }
  function subscribe2(run2, invalidate = noop$1) {
    const subscriber = [run2, invalidate];
    subscribers.add(subscriber);
    if (subscribers.size === 1) {
      stop = start(set) || noop$1;
    }
    run2(value);
    return () => {
      subscribers.delete(subscriber);
      if (subscribers.size === 0) {
        stop();
        stop = null;
      }
    };
  }
  return { set, update, subscribe: subscribe2 };
}
function hash(value) {
  let hash2 = 5381;
  let i = value.length;
  if (typeof value === "string") {
    while (i)
      hash2 = hash2 * 33 ^ value.charCodeAt(--i);
  } else {
    while (i)
      hash2 = hash2 * 33 ^ value[--i];
  }
  return (hash2 >>> 0).toString(36);
}
const escape_json_string_in_html_dict = {
  '"': '\\"',
  "<": "\\u003C",
  ">": "\\u003E",
  "/": "\\u002F",
  "\\": "\\\\",
  "\b": "\\b",
  "\f": "\\f",
  "\n": "\\n",
  "\r": "\\r",
  "	": "\\t",
  "\0": "\\0",
  "\u2028": "\\u2028",
  "\u2029": "\\u2029"
};
function escape_json_string_in_html(str) {
  return escape$1(str, escape_json_string_in_html_dict, (code) => `\\u${code.toString(16).toUpperCase()}`);
}
const escape_html_attr_dict = {
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;"
};
function escape_html_attr(str) {
  return '"' + escape$1(str, escape_html_attr_dict, (code) => `&#${code};`) + '"';
}
function escape$1(str, dict, unicode_encoder) {
  let result = "";
  for (let i = 0; i < str.length; i += 1) {
    const char = str.charAt(i);
    const code = char.charCodeAt(0);
    if (char in dict) {
      result += dict[char];
    } else if (code >= 55296 && code <= 57343) {
      const next = str.charCodeAt(i + 1);
      if (code <= 56319 && next >= 56320 && next <= 57343) {
        result += char + str[++i];
      } else {
        result += unicode_encoder(code);
      }
    } else {
      result += char;
    }
  }
  return result;
}
const s$1 = JSON.stringify;
async function render_response({
  branch,
  options: options2,
  $session,
  page_config,
  status,
  error: error2,
  page
}) {
  const css2 = new Set(options2.entry.css);
  const js = new Set(options2.entry.js);
  const styles = new Set();
  const serialized_data = [];
  let rendered;
  let is_private = false;
  let maxage;
  if (error2) {
    error2.stack = options2.get_stack(error2);
  }
  if (page_config.ssr) {
    branch.forEach(({ node, loaded, fetched, uses_credentials }) => {
      if (node.css)
        node.css.forEach((url) => css2.add(url));
      if (node.js)
        node.js.forEach((url) => js.add(url));
      if (node.styles)
        node.styles.forEach((content) => styles.add(content));
      if (fetched && page_config.hydrate)
        serialized_data.push(...fetched);
      if (uses_credentials)
        is_private = true;
      maxage = loaded.maxage;
    });
    const session = writable$1($session);
    const props = {
      stores: {
        page: writable$1(null),
        navigating: writable$1(null),
        session
      },
      page,
      components: branch.map(({ node }) => node.module.default)
    };
    for (let i = 0; i < branch.length; i += 1) {
      props[`props_${i}`] = await branch[i].loaded.props;
    }
    let session_tracking_active = false;
    const unsubscribe = session.subscribe(() => {
      if (session_tracking_active)
        is_private = true;
    });
    session_tracking_active = true;
    try {
      rendered = options2.root.render(props);
    } finally {
      unsubscribe();
    }
  } else {
    rendered = { head: "", html: "", css: { code: "", map: null } };
  }
  const include_js = page_config.router || page_config.hydrate;
  if (!include_js)
    js.clear();
  const links = options2.amp ? styles.size > 0 || rendered.css.code.length > 0 ? `<style amp-custom>${Array.from(styles).concat(rendered.css.code).join("\n")}</style>` : "" : [
    ...Array.from(js).map((dep) => `<link rel="modulepreload" href="${dep}">`),
    ...Array.from(css2).map((dep) => `<link rel="stylesheet" href="${dep}">`)
  ].join("\n		");
  let init2 = "";
  if (options2.amp) {
    init2 = `
		<style amp-boilerplate>body{-webkit-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-moz-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-ms-animation:-amp-start 8s steps(1,end) 0s 1 normal both;animation:-amp-start 8s steps(1,end) 0s 1 normal both}@-webkit-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-moz-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-ms-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-o-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}</style>
		<noscript><style amp-boilerplate>body{-webkit-animation:none;-moz-animation:none;-ms-animation:none;animation:none}</style></noscript>
		<script async src="https://cdn.ampproject.org/v0.js"><\/script>`;
  } else if (include_js) {
    init2 = `<script type="module">
			import { start } from ${s$1(options2.entry.file)};
			start({
				target: ${options2.target ? `document.querySelector(${s$1(options2.target)})` : "document.body"},
				paths: ${s$1(options2.paths)},
				session: ${try_serialize($session, (error3) => {
      throw new Error(`Failed to serialize session data: ${error3.message}`);
    })},
				host: ${page && page.host ? s$1(page.host) : "location.host"},
				route: ${!!page_config.router},
				spa: ${!page_config.ssr},
				trailing_slash: ${s$1(options2.trailing_slash)},
				hydrate: ${page_config.ssr && page_config.hydrate ? `{
					status: ${status},
					error: ${serialize_error(error2)},
					nodes: [
						${(branch || []).map(({ node }) => `import(${s$1(node.entry)})`).join(",\n						")}
					],
					page: {
						host: ${page && page.host ? s$1(page.host) : "location.host"}, // TODO this is redundant
						path: ${s$1(page && page.path)},
						query: new URLSearchParams(${page ? s$1(page.query.toString()) : ""}),
						params: ${page && s$1(page.params)}
					}
				}` : "null"}
			});
		<\/script>`;
  }
  if (options2.service_worker) {
    init2 += `<script>
			if ('serviceWorker' in navigator) {
				navigator.serviceWorker.register('${options2.service_worker}');
			}
		<\/script>`;
  }
  const head2 = [
    rendered.head,
    styles.size && !options2.amp ? `<style data-svelte>${Array.from(styles).join("\n")}</style>` : "",
    links,
    init2
  ].join("\n\n		");
  const body = options2.amp ? rendered.html : `${rendered.html}

			${serialized_data.map(({ url, body: body2, json }) => {
    let attributes = `type="application/json" data-type="svelte-data" data-url=${escape_html_attr(url)}`;
    if (body2)
      attributes += ` data-body="${hash(body2)}"`;
    return `<script ${attributes}>${json}<\/script>`;
  }).join("\n\n	")}
		`;
  const headers = {
    "content-type": "text/html"
  };
  if (maxage) {
    headers["cache-control"] = `${is_private ? "private" : "public"}, max-age=${maxage}`;
  }
  if (!options2.floc) {
    headers["permissions-policy"] = "interest-cohort=()";
  }
  return {
    status,
    headers,
    body: options2.template({ head: head2, body })
  };
}
function try_serialize(data, fail) {
  try {
    return devalue(data);
  } catch (err) {
    if (fail)
      fail(coalesce_to_error(err));
    return null;
  }
}
function serialize_error(error2) {
  if (!error2)
    return null;
  let serialized = try_serialize(error2);
  if (!serialized) {
    const { name, message, stack } = error2;
    serialized = try_serialize({ ...error2, name, message, stack });
  }
  if (!serialized) {
    serialized = "{}";
  }
  return serialized;
}
function normalize(loaded) {
  const has_error_status = loaded.status && loaded.status >= 400 && loaded.status <= 599 && !loaded.redirect;
  if (loaded.error || has_error_status) {
    const status = loaded.status;
    if (!loaded.error && has_error_status) {
      return {
        status: status || 500,
        error: new Error()
      };
    }
    const error2 = typeof loaded.error === "string" ? new Error(loaded.error) : loaded.error;
    if (!(error2 instanceof Error)) {
      return {
        status: 500,
        error: new Error(`"error" property returned from load() must be a string or instance of Error, received type "${typeof error2}"`)
      };
    }
    if (!status || status < 400 || status > 599) {
      console.warn('"error" returned from load() without a valid status code \u2014 defaulting to 500');
      return { status: 500, error: error2 };
    }
    return { status, error: error2 };
  }
  if (loaded.redirect) {
    if (!loaded.status || Math.floor(loaded.status / 100) !== 3) {
      return {
        status: 500,
        error: new Error('"redirect" property returned from load() must be accompanied by a 3xx status code')
      };
    }
    if (typeof loaded.redirect !== "string") {
      return {
        status: 500,
        error: new Error('"redirect" property returned from load() must be a string')
      };
    }
  }
  if (loaded.context) {
    throw new Error('You are returning "context" from a load function. "context" was renamed to "stuff", please adjust your code accordingly.');
  }
  return loaded;
}
const s = JSON.stringify;
async function load_node({
  request,
  options: options2,
  state,
  route,
  page,
  node,
  $session,
  stuff,
  prerender_enabled,
  is_leaf,
  is_error,
  status,
  error: error2
}) {
  const { module } = node;
  let uses_credentials = false;
  const fetched = [];
  let set_cookie_headers = [];
  let loaded;
  const page_proxy = new Proxy(page, {
    get: (target, prop, receiver) => {
      if (prop === "query" && prerender_enabled) {
        throw new Error("Cannot access query on a page with prerendering enabled");
      }
      return Reflect.get(target, prop, receiver);
    }
  });
  if (module.load) {
    const load_input = {
      page: page_proxy,
      get session() {
        uses_credentials = true;
        return $session;
      },
      fetch: async (resource, opts = {}) => {
        let url;
        if (typeof resource === "string") {
          url = resource;
        } else {
          url = resource.url;
          opts = {
            method: resource.method,
            headers: resource.headers,
            body: resource.body,
            mode: resource.mode,
            credentials: resource.credentials,
            cache: resource.cache,
            redirect: resource.redirect,
            referrer: resource.referrer,
            integrity: resource.integrity,
            ...opts
          };
        }
        const resolved = resolve(request.path, url.split("?")[0]);
        let response;
        const filename = resolved.replace(options2.paths.assets, "").slice(1);
        const filename_html = `${filename}/index.html`;
        const asset = options2.manifest.assets.find((d2) => d2.file === filename || d2.file === filename_html);
        if (asset) {
          response = options2.read ? new Response(options2.read(asset.file), {
            headers: asset.type ? { "content-type": asset.type } : {}
          }) : await fetch(`http://${page.host}/${asset.file}`, opts);
        } else if (resolved.startsWith("/") && !resolved.startsWith("//")) {
          const relative = resolved;
          const headers = {
            ...opts.headers
          };
          if (opts.credentials !== "omit") {
            uses_credentials = true;
            headers.cookie = request.headers.cookie;
            if (!headers.authorization) {
              headers.authorization = request.headers.authorization;
            }
          }
          if (opts.body && typeof opts.body !== "string") {
            throw new Error("Request body must be a string");
          }
          const search = url.includes("?") ? url.slice(url.indexOf("?") + 1) : "";
          const rendered = await respond({
            host: request.host,
            method: opts.method || "GET",
            headers,
            path: relative,
            rawBody: opts.body == null ? null : new TextEncoder().encode(opts.body),
            query: new URLSearchParams(search)
          }, options2, {
            fetched: url,
            initiator: route
          });
          if (rendered) {
            if (state.prerender) {
              state.prerender.dependencies.set(relative, rendered);
            }
            response = new Response(rendered.body, {
              status: rendered.status,
              headers: rendered.headers
            });
          }
        } else {
          if (resolved.startsWith("//")) {
            throw new Error(`Cannot request protocol-relative URL (${url}) in server-side fetch`);
          }
          if (typeof request.host !== "undefined") {
            const { hostname: fetch_hostname } = new URL(url);
            const [server_hostname] = request.host.split(":");
            if (`.${fetch_hostname}`.endsWith(`.${server_hostname}`) && opts.credentials !== "omit") {
              uses_credentials = true;
              opts.headers = {
                ...opts.headers,
                cookie: request.headers.cookie
              };
            }
          }
          const external_request = new Request(url, opts);
          response = await options2.hooks.externalFetch.call(null, external_request);
        }
        if (response) {
          const proxy = new Proxy(response, {
            get(response2, key, receiver) {
              async function text() {
                const body = await response2.text();
                const headers = {};
                for (const [key2, value] of response2.headers) {
                  if (key2 === "set-cookie") {
                    set_cookie_headers = set_cookie_headers.concat(value);
                  } else if (key2 !== "etag") {
                    headers[key2] = value;
                  }
                }
                if (!opts.body || typeof opts.body === "string") {
                  fetched.push({
                    url,
                    body: opts.body,
                    json: `{"status":${response2.status},"statusText":${s(response2.statusText)},"headers":${s(headers)},"body":"${escape_json_string_in_html(body)}"}`
                  });
                }
                return body;
              }
              if (key === "text") {
                return text;
              }
              if (key === "json") {
                return async () => {
                  return JSON.parse(await text());
                };
              }
              return Reflect.get(response2, key, response2);
            }
          });
          return proxy;
        }
        return response || new Response("Not found", {
          status: 404
        });
      },
      stuff: { ...stuff }
    };
    if (is_error) {
      load_input.status = status;
      load_input.error = error2;
    }
    loaded = await module.load.call(null, load_input);
  } else {
    loaded = {};
  }
  if (!loaded && is_leaf && !is_error)
    return;
  if (!loaded) {
    throw new Error(`${node.entry} - load must return a value except for page fall through`);
  }
  return {
    node,
    loaded: normalize(loaded),
    stuff: loaded.stuff || stuff,
    fetched,
    set_cookie_headers,
    uses_credentials
  };
}
const absolute = /^([a-z]+:)?\/?\//;
function resolve(base2, path) {
  const base_match = absolute.exec(base2);
  const path_match = absolute.exec(path);
  if (!base_match) {
    throw new Error(`bad base path: "${base2}"`);
  }
  const baseparts = path_match ? [] : base2.slice(base_match[0].length).split("/");
  const pathparts = path_match ? path.slice(path_match[0].length).split("/") : path.split("/");
  baseparts.pop();
  for (let i = 0; i < pathparts.length; i += 1) {
    const part = pathparts[i];
    if (part === ".")
      continue;
    else if (part === "..")
      baseparts.pop();
    else
      baseparts.push(part);
  }
  const prefix = path_match && path_match[0] || base_match && base_match[0] || "";
  return `${prefix}${baseparts.join("/")}`;
}
async function respond_with_error({ request, options: options2, state, $session, status, error: error2 }) {
  const default_layout = await options2.load_component(options2.manifest.layout);
  const default_error = await options2.load_component(options2.manifest.error);
  const page = {
    host: request.host,
    path: request.path,
    query: request.query,
    params: {}
  };
  const loaded = await load_node({
    request,
    options: options2,
    state,
    route: null,
    page,
    node: default_layout,
    $session,
    stuff: {},
    prerender_enabled: is_prerender_enabled(options2, default_error, state),
    is_leaf: false,
    is_error: false
  });
  const branch = [
    loaded,
    await load_node({
      request,
      options: options2,
      state,
      route: null,
      page,
      node: default_error,
      $session,
      stuff: loaded ? loaded.stuff : {},
      prerender_enabled: is_prerender_enabled(options2, default_error, state),
      is_leaf: false,
      is_error: true,
      status,
      error: error2
    })
  ];
  try {
    return await render_response({
      options: options2,
      $session,
      page_config: {
        hydrate: options2.hydrate,
        router: options2.router,
        ssr: options2.ssr
      },
      status,
      error: error2,
      branch,
      page
    });
  } catch (err) {
    const error3 = coalesce_to_error(err);
    options2.handle_error(error3, request);
    return {
      status: 500,
      headers: {},
      body: error3.stack
    };
  }
}
function is_prerender_enabled(options2, node, state) {
  return options2.prerender && (!!node.module.prerender || !!state.prerender && state.prerender.all);
}
async function respond$1(opts) {
  const { request, options: options2, state, $session, route } = opts;
  let nodes;
  try {
    nodes = await Promise.all(route.a.map((id) => id ? options2.load_component(id) : void 0));
  } catch (err) {
    const error3 = coalesce_to_error(err);
    options2.handle_error(error3, request);
    return await respond_with_error({
      request,
      options: options2,
      state,
      $session,
      status: 500,
      error: error3
    });
  }
  const leaf = nodes[nodes.length - 1].module;
  let page_config = get_page_config(leaf, options2);
  if (!leaf.prerender && state.prerender && !state.prerender.all) {
    return {
      status: 204,
      headers: {},
      body: ""
    };
  }
  let branch = [];
  let status = 200;
  let error2;
  let set_cookie_headers = [];
  ssr:
    if (page_config.ssr) {
      let stuff = {};
      for (let i = 0; i < nodes.length; i += 1) {
        const node = nodes[i];
        let loaded;
        if (node) {
          try {
            loaded = await load_node({
              ...opts,
              node,
              stuff,
              prerender_enabled: is_prerender_enabled(options2, node, state),
              is_leaf: i === nodes.length - 1,
              is_error: false
            });
            if (!loaded)
              return;
            set_cookie_headers = set_cookie_headers.concat(loaded.set_cookie_headers);
            if (loaded.loaded.redirect) {
              return with_cookies({
                status: loaded.loaded.status,
                headers: {
                  location: encodeURI(loaded.loaded.redirect)
                }
              }, set_cookie_headers);
            }
            if (loaded.loaded.error) {
              ({ status, error: error2 } = loaded.loaded);
            }
          } catch (err) {
            const e = coalesce_to_error(err);
            options2.handle_error(e, request);
            status = 500;
            error2 = e;
          }
          if (loaded && !error2) {
            branch.push(loaded);
          }
          if (error2) {
            while (i--) {
              if (route.b[i]) {
                const error_node = await options2.load_component(route.b[i]);
                let node_loaded;
                let j = i;
                while (!(node_loaded = branch[j])) {
                  j -= 1;
                }
                try {
                  const error_loaded = await load_node({
                    ...opts,
                    node: error_node,
                    stuff: node_loaded.stuff,
                    prerender_enabled: is_prerender_enabled(options2, error_node, state),
                    is_leaf: false,
                    is_error: true,
                    status,
                    error: error2
                  });
                  if (error_loaded.loaded.error) {
                    continue;
                  }
                  page_config = get_page_config(error_node.module, options2);
                  branch = branch.slice(0, j + 1).concat(error_loaded);
                  break ssr;
                } catch (err) {
                  const e = coalesce_to_error(err);
                  options2.handle_error(e, request);
                  continue;
                }
              }
            }
            return with_cookies(await respond_with_error({
              request,
              options: options2,
              state,
              $session,
              status,
              error: error2
            }), set_cookie_headers);
          }
        }
        if (loaded && loaded.loaded.stuff) {
          stuff = {
            ...stuff,
            ...loaded.loaded.stuff
          };
        }
      }
    }
  try {
    return with_cookies(await render_response({
      ...opts,
      page_config,
      status,
      error: error2,
      branch: branch.filter(Boolean)
    }), set_cookie_headers);
  } catch (err) {
    const error3 = coalesce_to_error(err);
    options2.handle_error(error3, request);
    return with_cookies(await respond_with_error({
      ...opts,
      status: 500,
      error: error3
    }), set_cookie_headers);
  }
}
function get_page_config(leaf, options2) {
  return {
    ssr: "ssr" in leaf ? !!leaf.ssr : options2.ssr,
    router: "router" in leaf ? !!leaf.router : options2.router,
    hydrate: "hydrate" in leaf ? !!leaf.hydrate : options2.hydrate
  };
}
function with_cookies(response, set_cookie_headers) {
  if (set_cookie_headers.length) {
    response.headers["set-cookie"] = set_cookie_headers;
  }
  return response;
}
async function render_page(request, route, match, options2, state) {
  if (state.initiator === route) {
    return {
      status: 404,
      headers: {},
      body: `Not found: ${request.path}`
    };
  }
  const params = route.params(match);
  const page = {
    host: request.host,
    path: request.path,
    query: request.query,
    params
  };
  const $session = await options2.hooks.getSession(request);
  const response = await respond$1({
    request,
    options: options2,
    state,
    $session,
    route,
    page
  });
  if (response) {
    return response;
  }
  if (state.fetched) {
    return {
      status: 500,
      headers: {},
      body: `Bad request in load function: failed to fetch ${state.fetched}`
    };
  }
}
function read_only_form_data() {
  const map = new Map();
  return {
    append(key, value) {
      if (map.has(key)) {
        (map.get(key) || []).push(value);
      } else {
        map.set(key, [value]);
      }
    },
    data: new ReadOnlyFormData(map)
  };
}
class ReadOnlyFormData {
  constructor(map) {
    __privateAdd(this, _map, void 0);
    __privateSet(this, _map, map);
  }
  get(key) {
    const value = __privateGet(this, _map).get(key);
    return value && value[0];
  }
  getAll(key) {
    return __privateGet(this, _map).get(key);
  }
  has(key) {
    return __privateGet(this, _map).has(key);
  }
  *[Symbol.iterator]() {
    for (const [key, value] of __privateGet(this, _map)) {
      for (let i = 0; i < value.length; i += 1) {
        yield [key, value[i]];
      }
    }
  }
  *entries() {
    for (const [key, value] of __privateGet(this, _map)) {
      for (let i = 0; i < value.length; i += 1) {
        yield [key, value[i]];
      }
    }
  }
  *keys() {
    for (const [key] of __privateGet(this, _map))
      yield key;
  }
  *values() {
    for (const [, value] of __privateGet(this, _map)) {
      for (let i = 0; i < value.length; i += 1) {
        yield value[i];
      }
    }
  }
}
_map = new WeakMap();
function parse_body(raw, headers) {
  if (!raw)
    return raw;
  const content_type = headers["content-type"];
  const [type, ...directives] = content_type ? content_type.split(/;\s*/) : [];
  const text = () => new TextDecoder(headers["content-encoding"] || "utf-8").decode(raw);
  switch (type) {
    case "text/plain":
      return text();
    case "application/json":
      return JSON.parse(text());
    case "application/x-www-form-urlencoded":
      return get_urlencoded(text());
    case "multipart/form-data": {
      const boundary = directives.find((directive) => directive.startsWith("boundary="));
      if (!boundary)
        throw new Error("Missing boundary");
      return get_multipart(text(), boundary.slice("boundary=".length));
    }
    default:
      return raw;
  }
}
function get_urlencoded(text) {
  const { data, append } = read_only_form_data();
  text.replace(/\+/g, " ").split("&").forEach((str) => {
    const [key, value] = str.split("=");
    append(decodeURIComponent(key), decodeURIComponent(value));
  });
  return data;
}
function get_multipart(text, boundary) {
  const parts = text.split(`--${boundary}`);
  if (parts[0] !== "" || parts[parts.length - 1].trim() !== "--") {
    throw new Error("Malformed form data");
  }
  const { data, append } = read_only_form_data();
  parts.slice(1, -1).forEach((part) => {
    const match = /\s*([\s\S]+?)\r\n\r\n([\s\S]*)\s*/.exec(part);
    if (!match) {
      throw new Error("Malformed form data");
    }
    const raw_headers = match[1];
    const body = match[2].trim();
    let key;
    const headers = {};
    raw_headers.split("\r\n").forEach((str) => {
      const [raw_header, ...raw_directives] = str.split("; ");
      let [name, value] = raw_header.split(": ");
      name = name.toLowerCase();
      headers[name] = value;
      const directives = {};
      raw_directives.forEach((raw_directive) => {
        const [name2, value2] = raw_directive.split("=");
        directives[name2] = JSON.parse(value2);
      });
      if (name === "content-disposition") {
        if (value !== "form-data")
          throw new Error("Malformed form data");
        if (directives.filename) {
          throw new Error("File upload is not yet implemented");
        }
        if (directives.name) {
          key = directives.name;
        }
      }
    });
    if (!key)
      throw new Error("Malformed form data");
    append(key, body);
  });
  return data;
}
async function respond(incoming, options2, state = {}) {
  if (incoming.path !== "/" && options2.trailing_slash !== "ignore") {
    const has_trailing_slash = incoming.path.endsWith("/");
    if (has_trailing_slash && options2.trailing_slash === "never" || !has_trailing_slash && options2.trailing_slash === "always" && !(incoming.path.split("/").pop() || "").includes(".")) {
      const path = has_trailing_slash ? incoming.path.slice(0, -1) : incoming.path + "/";
      const q = incoming.query.toString();
      return {
        status: 301,
        headers: {
          location: options2.paths.base + path + (q ? `?${q}` : "")
        }
      };
    }
  }
  const headers = lowercase_keys(incoming.headers);
  const request = {
    ...incoming,
    headers,
    body: parse_body(incoming.rawBody, headers),
    params: {},
    locals: {}
  };
  try {
    return await options2.hooks.handle({
      request,
      resolve: async (request2) => {
        if (state.prerender && state.prerender.fallback) {
          return await render_response({
            options: options2,
            $session: await options2.hooks.getSession(request2),
            page_config: { ssr: false, router: true, hydrate: true },
            status: 200,
            branch: []
          });
        }
        const decoded = decodeURI(request2.path);
        for (const route of options2.manifest.routes) {
          const match = route.pattern.exec(decoded);
          if (!match)
            continue;
          const response = route.type === "endpoint" ? await render_endpoint(request2, route, match) : await render_page(request2, route, match, options2, state);
          if (response) {
            if (response.status === 200) {
              const cache_control = get_single_valued_header(response.headers, "cache-control");
              if (!cache_control || !/(no-store|immutable)/.test(cache_control)) {
                const etag = `"${hash(response.body || "")}"`;
                if (request2.headers["if-none-match"] === etag) {
                  return {
                    status: 304,
                    headers: {},
                    body: ""
                  };
                }
                response.headers["etag"] = etag;
              }
            }
            return response;
          }
        }
        const $session = await options2.hooks.getSession(request2);
        return await respond_with_error({
          request: request2,
          options: options2,
          state,
          $session,
          status: 404,
          error: new Error(`Not found: ${request2.path}`)
        });
      }
    });
  } catch (err) {
    const e = coalesce_to_error(err);
    options2.handle_error(e, request);
    return {
      status: 500,
      headers: {},
      body: options2.dev ? e.stack : e.message
    };
  }
}
function noop() {
}
function run(fn) {
  return fn();
}
function blank_object() {
  return Object.create(null);
}
function run_all(fns) {
  fns.forEach(run);
}
function safe_not_equal(a, b) {
  return a != a ? b == b : a !== b || (a && typeof a === "object" || typeof a === "function");
}
function subscribe(store, ...callbacks) {
  if (store == null) {
    return noop;
  }
  const unsub = store.subscribe(...callbacks);
  return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
}
const is_client = typeof window !== "undefined";
let now = is_client ? () => window.performance.now() : () => Date.now();
let raf = is_client ? (cb) => requestAnimationFrame(cb) : noop;
const tasks = new Set();
function run_tasks(now2) {
  tasks.forEach((task) => {
    if (!task.c(now2)) {
      tasks.delete(task);
      task.f();
    }
  });
  if (tasks.size !== 0)
    raf(run_tasks);
}
function loop(callback2) {
  let task;
  if (tasks.size === 0)
    raf(run_tasks);
  return {
    promise: new Promise((fulfill) => {
      tasks.add(task = { c: callback2, f: fulfill });
    }),
    abort() {
      tasks.delete(task);
    }
  };
}
let current_component;
function set_current_component(component) {
  current_component = component;
}
function get_current_component() {
  if (!current_component)
    throw new Error("Function called outside component initialization");
  return current_component;
}
function setContext(key, context) {
  get_current_component().$$.context.set(key, context);
}
Promise.resolve();
const escaped = {
  '"': "&quot;",
  "'": "&#39;",
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;"
};
function escape(html) {
  return String(html).replace(/["'&<>]/g, (match) => escaped[match]);
}
function each(items, fn) {
  let str = "";
  for (let i = 0; i < items.length; i += 1) {
    str += fn(items[i], i);
  }
  return str;
}
const missing_component = {
  $$render: () => ""
};
function validate_component(component, name) {
  if (!component || !component.$$render) {
    if (name === "svelte:component")
      name += " this={...}";
    throw new Error(`<${name}> is not a valid SSR component. You may need to review your build config to ensure that dependencies are compiled, rather than imported as pre-compiled modules`);
  }
  return component;
}
let on_destroy;
function create_ssr_component(fn) {
  function $$render(result, props, bindings, slots, context) {
    const parent_component = current_component;
    const $$ = {
      on_destroy,
      context: new Map(context || (parent_component ? parent_component.$$.context : [])),
      on_mount: [],
      before_update: [],
      after_update: [],
      callbacks: blank_object()
    };
    set_current_component({ $$ });
    const html = fn(result, props, bindings, slots);
    set_current_component(parent_component);
    return html;
  }
  return {
    render: (props = {}, { $$slots = {}, context = new Map() } = {}) => {
      on_destroy = [];
      const result = { title: "", head: "", css: new Set() };
      const html = $$render(result, props, {}, $$slots, context);
      run_all(on_destroy);
      return {
        html,
        css: {
          code: Array.from(result.css).map((css2) => css2.code).join("\n"),
          map: null
        },
        head: result.title + result.head
      };
    },
    $$render
  };
}
function add_attribute(name, value, boolean) {
  if (value == null || boolean && !value)
    return "";
  return ` ${name}${value === true ? "" : `=${typeof value === "string" ? JSON.stringify(escape(value)) : `"${value}"`}`}`;
}
function afterUpdate() {
}
var root_svelte_svelte_type_style_lang = "";
const css$4 = {
  code: "#svelte-announcer.svelte-1j55zn5{position:absolute;left:0;top:0;clip:rect(0 0 0 0);clip-path:inset(50%);overflow:hidden;white-space:nowrap;width:1px;height:1px}",
  map: `{"version":3,"file":"root.svelte","sources":["root.svelte"],"sourcesContent":["<!-- This file is generated by @sveltejs/kit \u2014 do not edit it! -->\\n<script>\\n\\timport { setContext, afterUpdate, onMount } from 'svelte';\\n\\n\\t// stores\\n\\texport let stores;\\n\\texport let page;\\n\\n\\texport let components;\\n\\texport let props_0 = null;\\n\\texport let props_1 = null;\\n\\texport let props_2 = null;\\n\\n\\tsetContext('__svelte__', stores);\\n\\n\\t$: stores.page.set(page);\\n\\tafterUpdate(stores.page.notify);\\n\\n\\tlet mounted = false;\\n\\tlet navigated = false;\\n\\tlet title = null;\\n\\n\\tonMount(() => {\\n\\t\\tconst unsubscribe = stores.page.subscribe(() => {\\n\\t\\t\\tif (mounted) {\\n\\t\\t\\t\\tnavigated = true;\\n\\t\\t\\t\\ttitle = document.title || 'untitled page';\\n\\t\\t\\t}\\n\\t\\t});\\n\\n\\t\\tmounted = true;\\n\\t\\treturn unsubscribe;\\n\\t});\\n<\/script>\\n\\n<svelte:component this={components[0]} {...(props_0 || {})}>\\n\\t{#if components[1]}\\n\\t\\t<svelte:component this={components[1]} {...(props_1 || {})}>\\n\\t\\t\\t{#if components[2]}\\n\\t\\t\\t\\t<svelte:component this={components[2]} {...(props_2 || {})}/>\\n\\t\\t\\t{/if}\\n\\t\\t</svelte:component>\\n\\t{/if}\\n</svelte:component>\\n\\n{#if mounted}\\n\\t<div id=\\"svelte-announcer\\" aria-live=\\"assertive\\" aria-atomic=\\"true\\">\\n\\t\\t{#if navigated}\\n\\t\\t\\t{title}\\n\\t\\t{/if}\\n\\t</div>\\n{/if}\\n\\n<style>\\n\\t#svelte-announcer {\\n\\t\\tposition: absolute;\\n\\t\\tleft: 0;\\n\\t\\ttop: 0;\\n\\t\\tclip: rect(0 0 0 0);\\n\\t\\tclip-path: inset(50%);\\n\\t\\toverflow: hidden;\\n\\t\\twhite-space: nowrap;\\n\\t\\twidth: 1px;\\n\\t\\theight: 1px;\\n\\t}\\n</style>"],"names":[],"mappings":"AAsDC,iBAAiB,eAAC,CAAC,AAClB,QAAQ,CAAE,QAAQ,CAClB,IAAI,CAAE,CAAC,CACP,GAAG,CAAE,CAAC,CACN,IAAI,CAAE,KAAK,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CACnB,SAAS,CAAE,MAAM,GAAG,CAAC,CACrB,QAAQ,CAAE,MAAM,CAChB,WAAW,CAAE,MAAM,CACnB,KAAK,CAAE,GAAG,CACV,MAAM,CAAE,GAAG,AACZ,CAAC"}`
};
const Root = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { stores } = $$props;
  let { page } = $$props;
  let { components } = $$props;
  let { props_0 = null } = $$props;
  let { props_1 = null } = $$props;
  let { props_2 = null } = $$props;
  setContext("__svelte__", stores);
  afterUpdate(stores.page.notify);
  if ($$props.stores === void 0 && $$bindings.stores && stores !== void 0)
    $$bindings.stores(stores);
  if ($$props.page === void 0 && $$bindings.page && page !== void 0)
    $$bindings.page(page);
  if ($$props.components === void 0 && $$bindings.components && components !== void 0)
    $$bindings.components(components);
  if ($$props.props_0 === void 0 && $$bindings.props_0 && props_0 !== void 0)
    $$bindings.props_0(props_0);
  if ($$props.props_1 === void 0 && $$bindings.props_1 && props_1 !== void 0)
    $$bindings.props_1(props_1);
  if ($$props.props_2 === void 0 && $$bindings.props_2 && props_2 !== void 0)
    $$bindings.props_2(props_2);
  $$result.css.add(css$4);
  {
    stores.page.set(page);
  }
  return `


${validate_component(components[0] || missing_component, "svelte:component").$$render($$result, Object.assign(props_0 || {}), {}, {
    default: () => `${components[1] ? `${validate_component(components[1] || missing_component, "svelte:component").$$render($$result, Object.assign(props_1 || {}), {}, {
      default: () => `${components[2] ? `${validate_component(components[2] || missing_component, "svelte:component").$$render($$result, Object.assign(props_2 || {}), {}, {})}` : ``}`
    })}` : ``}`
  })}

${``}`;
});
let base$1 = "";
let assets = "";
function set_paths(paths) {
  base$1 = paths.base;
  assets = paths.assets || base$1;
}
function set_prerendering(value) {
}
const handle = async ({ request, resolve: resolve2 }) => {
  const cookies = cookie.parse(request.headers.cookie || "");
  request.locals.userid = cookies.userid || v4();
  if (request.query.has("_method")) {
    request.method = request.query.get("_method").toUpperCase();
  }
  const response = await resolve2(request);
  if (!cookies.userid) {
    response.headers["set-cookie"] = cookie.serialize("userid", request.locals.userid, {
      path: "/",
      httpOnly: true
    });
  }
  return response;
};
var user_hooks = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  handle
});
const template = ({ head: head2, body }) => '<!DOCTYPE html>\n<html lang="en">\n	<head>\n		<meta charset="utf-8" />\n		<link rel="icon" href="/favicon.png" />\n		<meta name="viewport" content="width=device-width, initial-scale=1" />\n\n		' + head2 + '\n	</head>\n	<body>\n		<div id="svelte">' + body + "</div>\n	</body>\n</html>\n";
let options = null;
const default_settings = { paths: { "base": "", "assets": "" } };
function init(settings = default_settings) {
  set_paths(settings.paths);
  set_prerendering(settings.prerendering || false);
  const hooks = get_hooks(user_hooks);
  options = {
    amp: false,
    dev: false,
    entry: {
      file: assets + "/_app/start-42a36133.js",
      css: [assets + "/_app/assets/start-d977ffc4.css"],
      js: [assets + "/_app/start-42a36133.js", assets + "/_app/chunks/vendor-8b3525a6.js"]
    },
    fetched: void 0,
    floc: false,
    get_component_path: (id) => assets + "/_app/" + entry_lookup[id],
    get_stack: (error2) => String(error2),
    handle_error: (error2, request) => {
      hooks.handleError({ error: error2, request });
      error2.stack = options.get_stack(error2);
    },
    hooks,
    hydrate: true,
    initiator: void 0,
    load_component,
    manifest,
    paths: settings.paths,
    prerender: true,
    read: settings.read,
    root: Root,
    service_worker: null,
    router: true,
    ssr: true,
    target: "#svelte",
    template,
    trailing_slash: "never"
  };
}
const d = (s2) => s2.replace(/%23/g, "#").replace(/%3[Bb]/g, ";").replace(/%2[Cc]/g, ",").replace(/%2[Ff]/g, "/").replace(/%3[Ff]/g, "?").replace(/%3[Aa]/g, ":").replace(/%40/g, "@").replace(/%26/g, "&").replace(/%3[Dd]/g, "=").replace(/%2[Bb]/g, "+").replace(/%24/g, "$");
const empty = () => ({});
const manifest = {
  assets: [{ "file": "favicon.png", "size": 1571, "type": "image/png" }, { "file": "robots.txt", "size": 67, "type": "text/plain" }, { "file": "svelte-welcome.png", "size": 360807, "type": "image/png" }, { "file": "svelte-welcome.webp", "size": 115470, "type": "image/webp" }],
  layout: "src/routes/__layout.svelte",
  error: "src/routes/__error.svelte",
  routes: [
    {
      type: "page",
      pattern: /^\/$/,
      params: empty,
      a: ["src/routes/__layout.svelte", "src/routes/index.svelte"],
      b: ["src/routes/__error.svelte"]
    },
    {
      type: "endpoint",
      pattern: /^\/graphql\/?$/,
      params: empty,
      load: () => Promise.resolve().then(function() {
        return graphql;
      })
    },
    {
      type: "page",
      pattern: /^\/about\/?$/,
      params: empty,
      a: ["src/routes/__layout.svelte", "src/routes/about.svelte"],
      b: ["src/routes/__error.svelte"]
    },
    {
      type: "page",
      pattern: /^\/login\/?$/,
      params: empty,
      a: ["src/routes/__layout.svelte", "src/routes/login.svelte"],
      b: ["src/routes/__error.svelte"]
    },
    {
      type: "endpoint",
      pattern: /^\/todos\.json$/,
      params: empty,
      load: () => Promise.resolve().then(function() {
        return index_json;
      })
    },
    {
      type: "page",
      pattern: /^\/todos\/?$/,
      params: empty,
      a: ["src/routes/__layout.svelte", "src/routes/todos/index.svelte"],
      b: ["src/routes/__error.svelte"]
    },
    {
      type: "endpoint",
      pattern: /^\/todos\/([^/]+?)\.json$/,
      params: (m) => ({ uid: d(m[1]) }),
      load: () => Promise.resolve().then(function() {
        return _uid__json;
      })
    },
    {
      type: "endpoint",
      pattern: /^\/auth\/github\/?$/,
      params: empty,
      load: () => Promise.resolve().then(function() {
        return index$2;
      })
    },
    {
      type: "endpoint",
      pattern: /^\/auth\/github\/callback\/?$/,
      params: empty,
      load: () => Promise.resolve().then(function() {
        return callback;
      })
    },
    {
      type: "endpoint",
      pattern: /^\/api\/hello\/?$/,
      params: empty,
      load: () => Promise.resolve().then(function() {
        return hello;
      })
    }
  ]
};
const get_hooks = (hooks) => ({
  getSession: hooks.getSession || (() => ({})),
  handle: hooks.handle || (({ request, resolve: resolve2 }) => resolve2(request)),
  handleError: hooks.handleError || (({ error: error2 }) => console.error(error2.stack)),
  externalFetch: hooks.externalFetch || fetch
});
const module_lookup = {
  "src/routes/__layout.svelte": () => Promise.resolve().then(function() {
    return __layout;
  }),
  "src/routes/__error.svelte": () => Promise.resolve().then(function() {
    return __error;
  }),
  "src/routes/index.svelte": () => Promise.resolve().then(function() {
    return index$1;
  }),
  "src/routes/about.svelte": () => Promise.resolve().then(function() {
    return about;
  }),
  "src/routes/login.svelte": () => Promise.resolve().then(function() {
    return login;
  }),
  "src/routes/todos/index.svelte": () => Promise.resolve().then(function() {
    return index;
  })
};
const metadata_lookup = { "src/routes/__layout.svelte": { "entry": "pages/__layout.svelte-4fc6b948.js", "css": ["assets/pages/__layout.svelte-53684cb8.css"], "js": ["pages/__layout.svelte-4fc6b948.js", "chunks/vendor-8b3525a6.js"], "styles": [] }, "src/routes/__error.svelte": { "entry": "pages/__error.svelte-b41eb08f.js", "css": [], "js": ["pages/__error.svelte-b41eb08f.js", "chunks/vendor-8b3525a6.js"], "styles": [] }, "src/routes/index.svelte": { "entry": "pages/index.svelte-db055285.js", "css": ["assets/pages/index.svelte-7523914d.css"], "js": ["pages/index.svelte-db055285.js", "chunks/vendor-8b3525a6.js"], "styles": [] }, "src/routes/about.svelte": { "entry": "pages/about.svelte-1724db51.js", "css": ["assets/pages/about.svelte-eab7e969.css"], "js": ["pages/about.svelte-1724db51.js", "chunks/vendor-8b3525a6.js"], "styles": [] }, "src/routes/login.svelte": { "entry": "pages/login.svelte-f978eb9b.js", "css": [], "js": ["pages/login.svelte-f978eb9b.js", "chunks/vendor-8b3525a6.js"], "styles": [] }, "src/routes/todos/index.svelte": { "entry": "pages/todos/index.svelte-3d16c66c.js", "css": ["assets/pages/todos/index.svelte-28da250b.css"], "js": ["pages/todos/index.svelte-3d16c66c.js", "chunks/vendor-8b3525a6.js"], "styles": [] } };
async function load_component(file) {
  const { entry, css: css2, js, styles } = metadata_lookup[file];
  return {
    module: await module_lookup[file](),
    entry: assets + "/_app/" + entry,
    css: css2.map((dep) => assets + "/_app/" + dep),
    js: js.map((dep) => assets + "/_app/" + dep),
    styles
  };
}
function render(request, {
  prerender: prerender2
} = {}) {
  const host = request.headers["host"];
  return respond({ ...request, host }, options, { prerender: prerender2 });
}
var schema = "directive @auth(requires: Role = ADMIN) on OBJECT | FIELD_DEFINITION\n\nenum Role {\n	ADMIN\n	TEACHER\n	STUDENT\n	USER\n}\n\ntype Query {\n	getHello: String!\n	currentUser: User\n	userById(id: String): User\n	entryById(id: String): Entry\n	getAllUsers: [User]! @auth(requires: ADMIN)\n	getAllJobs: [Job]! @auth(requires: ADMIN)\n}\n\ntype Mutation {\n	clockIn(jobId: String!): ClockStatus\n}\n\ntype ClockStatus {\n	clockedIn: Boolean!\n	job: Job\n	clockInTime: DateTime\n}\n\ntype User {\n	id: String!\n	username: String\n	email: String\n	jobs: [Job]\n	status: ClockStatus\n}\n\ntype Job {\n	id: String!\n}\n\ntype Entry {\n	id: String!\n	job: Job\n}\nscalar DateTime\n";
const genUUID = () => {
  return "xxxxxxxx-xxxx-4xxx-xxxx-xxxxxxxxxxxx".replace(/x/g, (_) => (Math.random() * 16 | 0).toString(16));
};
const userSchema = new mongoose.Schema({
  _id: { type: String, default: () => genUUID() },
  username: String,
  authProvider: {
    name: String,
    userId: mongoose.Schema.Types.Mixed
  },
  email: String,
  oauthToken: String,
  jobs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Job" }],
  status: {
    clockedIn: Boolean,
    job: { type: mongoose.Schema.Types.ObjectId, ref: "Job" },
    time: Date
  }
});
const User = mongoose.model("User", userSchema, "Users");
const jobSchema = new mongoose.Schema({
  _id: { type: String, default: () => genUUID() },
  name: String,
  payPerHour: Number,
  entries: [{ type: mongoose.Schema.Types.ObjectId, ref: "Entry" }],
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
});
mongoose.model("Job", jobSchema, "Jobs");
const entrySchema = new mongoose.Schema({
  _id: { type: String, default: () => genUUID() },
  startTime: Date,
  endTime: Date,
  comment: String,
  payMultiplier: Number,
  basePay: Number,
  job: { type: mongoose.Schema.Types.ObjectId, ref: "Job" }
});
mongoose.model("Entry", entrySchema, "Entries");
const uri = "mongodb+srv://punchclock:quXXqiPL31E90vie@rbh01.fm2l3.mongodb.net/punchclock?retryWrites=true&w=majority";
const getConnection = async () => {
  if (mongoose.connection.readyState >= 1) {
    return;
  }
  return mongoose.connect(uri);
};
const { GraphQLDateTime } = pkg;
var resolvers = {
  DateTime: GraphQLDateTime,
  Query: {
    userById: async (parent, args, context, info) => {
      await getConnection();
      return User.findOne({ _id: args.id }).select("-oauthToken");
    },
    getHello: async () => {
      return new Promise((res) => "Hello World!");
    },
    currentUser: () => Promise.resolve("currentUser query response here")
  }
};
const apolloServer = new ApolloServer({
  typeDefs: schema,
  resolvers,
  playground: true,
  introspection: true,
  tracing: true
});
const graphqlHandler = apolloServer.createHandler();
const handler = async (args) => {
  const reqBod = Buffer.from(args.rawBody).toString("utf-8");
  console.log(reqBod);
  return await new Promise((resolve2, reject) => {
    graphqlHandler({
      httpMethod: args.method,
      headers: args.headers,
      path: args.path,
      body: reqBod
    }, {}, (err, result) => {
      console.log(err, result);
      if (err) {
        reject(err);
      } else {
        resolve2({
          status: result.statusCode,
          body: result.body,
          headers: result.headers
        });
      }
    });
  });
};
const head = handler;
const get$4 = handler;
const post$1 = handler;
var graphql = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  head,
  get: get$4,
  post: post$1
});
const base = "https://api.svelte.dev";
async function api(request, resource, data) {
  if (!request.locals.userid) {
    return { status: 401 };
  }
  const res = await fetch(`${base}/${resource}`, {
    method: request.method,
    headers: {
      "content-type": "application/json"
    },
    body: data && JSON.stringify(data)
  });
  if (res.ok && request.method !== "GET" && request.headers.accept !== "application/json") {
    return {
      status: 303,
      headers: {
        location: "/todos"
      }
    };
  }
  return {
    status: res.status,
    body: await res.json()
  };
}
const get$3 = async (request) => {
  const response = await api(request, `todos/${request.locals.userid}`);
  if (response.status === 404) {
    return { body: [] };
  }
  return response;
};
const post = async (request) => {
  const response = await api(request, `todos/${request.locals.userid}`, {
    text: request.body.get("text")
  });
  return response;
};
var index_json = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  get: get$3,
  post
});
const patch = async (request) => {
  return api(request, `todos/${request.locals.userid}/${request.params.uid}`, {
    text: request.body.get("text"),
    done: request.body.has("done") ? !!request.body.get("done") : void 0
  });
};
const del = async (request) => {
  return api(request, `todos/${request.locals.userid}/${request.params.uid}`);
};
var _uid__json = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  patch,
  del
});
const get$2 = (args) => {
  const currentURL = "https://punchclock.vercel.app";
  return {
    status: 303,
    headers: {
      location: `https://github.com/login/oauth/authorize?client_id=${"36f6c7eecba684a2ce94"}&redirect_uri=${currentURL}/auth/github/callback&scope=read:user,user:email`
    },
    body: "Redirecting..."
  };
};
var index$2 = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  get: get$2
});
const get$1 = async (args) => {
  const cookies = cookie.parse(args.headers.cookie || "");
  const currentURL = "https://punchclock.vercel.app";
  await getConnection();
  const code = args.query.get("code") || null;
  args.query.get("state") || null;
  if (!code)
    return { status: 404, body: "No code provided." };
  const resp = await axios.post("https://github.com/login/oauth/access_token", `client_id=${"36f6c7eecba684a2ce94"}&client_secret=${"e82cf8249df95daee958798972bbcf7165be3ba5"}&code=${code}`, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json"
    }
  });
  console.log("Running OAuth Callback for code " + code);
  if (resp.data.error) {
    return {
      status: 400,
      body: `Error: ${resp.data.error}, ${resp.data.error_description}`
    };
  }
  const userAuthToken = resp.data.access_token;
  const userResp = await axios.get("https://api.github.com/user", {
    headers: {
      Authorization: `token ${userAuthToken}`,
      Accept: "application/json"
    }
  });
  const userEmail = await axios.get("https://api.github.com/user/emails", {
    headers: {
      Authorization: `token ${userAuthToken}`,
      Accept: "application/json"
    }
  });
  let user = await User.findOne({
    authProvider: {
      name: "github",
      userId: userResp.data.id
    }
  });
  if (!user)
    user = await User.create({
      username: userResp.data.login,
      authProvider: {
        name: "github",
        userId: userResp.data.id
      },
      email: userEmail.data[0].email,
      oauthToken: userAuthToken,
      status: {
        clockedIn: false
      }
    });
  let token;
  if (!cookies.punchclock_auth || !jwt.verify(cookies.punchclock_auth, "VPGzfBv1yj"))
    token = jwt.sign({
      id: user._id,
      auth_provider: "github",
      username: userResp.data.login,
      iat: Math.floor(Date.now() / 1e3)
    }, "VPGzfBv1yj", { expiresIn: "1yr" });
  else
    token = cookies.punchclock_auth;
  return {
    status: 303,
    headers: {
      "Set-Cookie": `punchclock_auth=${token};path=/`,
      location: currentURL + "/"
    },
    body: "Redirecting..."
  };
};
var callback = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  get: get$1
});
const get = (req) => {
  return {
    status: 200,
    body: `Hello ${req.query.name ? req.query.name : "World"}!`
  };
};
var hello = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  get
});
const ClockIn = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `<button>Clock In</button>`;
});
var app = "";
const load$2 = async ({ fetch: fetch2 }) => {
  const res = await fetch2("/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      "operationName": null,
      "query": "{\n  getHello\n}",
      "variables": null
    })
  });
  let data = await res.text();
  return { props: { data } };
};
const _layout = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { data } = $$props;
  if ($$props.data === void 0 && $$bindings.data && data !== void 0)
    $$bindings.data(data);
  return `<div class="${"bg-gray-900 min-h-screen min-w-full text-white p-5 flex flex-col"}"><div class="${"flex flex-row my-5 place-items-center"}"><div class="${"sm:text-3xl text-2xl font-bold flex-grow"}" as="${"h1"}">Time Tracker</div>
		<div class="${"border-solid border-2 p-3 rounded-lg border-green-500 text-green-300 flex flex-row gap-x-2"}"><svg xmlns="${"http://www.w3.org/2000/svg"}" class="${"h-6 w-6"}" fill="${"none"}" viewBox="${"0 0 24 24"}" stroke="${"currentColor"}"><path stroke-linecap="${"round"}" stroke-linejoin="${"round"}" stroke-width="${"2"}" d="${"M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"}"></path></svg>
			${validate_component(ClockIn, "ClockIn").$$render($$result, {}, {}, {})}</div></div>
	${slots.default ? slots.default({}) : ``}
	<div class="${"flex flex-row bottom place-items-center"}"><div class="${"flex flex-row flex-grow gap-x-2 text-lg place-items-center"}"><svg class="${"w-6 h-6"}" fill="${"currentColor"}" viewBox="${"0 0 20 20"}" xmlns="${"http://www.w3.org/2000/svg"}"><path fill-rule="${"evenodd"}" d="${"M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"}" clip-rule="${"evenodd"}"></path></svg>
			</div>
		<button class="${"border-2 border-blue-400 px-2 py-1 rounded-lg"}">Sign Out</button></div>
	${escape(JSON.stringify(data))}</div>
`;
});
var __layout = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": _layout,
  load: load$2
});
function load$1({ error: error2, status }) {
  return {
    props: { title: `${status}: ${error2.message}` }
  };
}
const _error = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { title } = $$props;
  if ($$props.title === void 0 && $$bindings.title && title !== void 0)
    $$bindings.title(title);
  return `<h1>${escape(title)}</h1>`;
});
var __error = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": _error,
  load: load$1
});
const subscriber_queue = [];
function writable(value, start = noop) {
  let stop;
  const subscribers = new Set();
  function set(new_value) {
    if (safe_not_equal(value, new_value)) {
      value = new_value;
      if (stop) {
        const run_queue = !subscriber_queue.length;
        for (const subscriber of subscribers) {
          subscriber[1]();
          subscriber_queue.push(subscriber, value);
        }
        if (run_queue) {
          for (let i = 0; i < subscriber_queue.length; i += 2) {
            subscriber_queue[i][0](subscriber_queue[i + 1]);
          }
          subscriber_queue.length = 0;
        }
      }
    }
  }
  function update(fn) {
    set(fn(value));
  }
  function subscribe2(run2, invalidate = noop) {
    const subscriber = [run2, invalidate];
    subscribers.add(subscriber);
    if (subscribers.size === 1) {
      stop = start(set) || noop;
    }
    run2(value);
    return () => {
      subscribers.delete(subscriber);
      if (subscribers.size === 0) {
        stop();
        stop = null;
      }
    };
  }
  return { set, update, subscribe: subscribe2 };
}
function is_date(obj) {
  return Object.prototype.toString.call(obj) === "[object Date]";
}
function tick_spring(ctx, last_value, current_value, target_value) {
  if (typeof current_value === "number" || is_date(current_value)) {
    const delta = target_value - current_value;
    const velocity = (current_value - last_value) / (ctx.dt || 1 / 60);
    const spring2 = ctx.opts.stiffness * delta;
    const damper = ctx.opts.damping * velocity;
    const acceleration = (spring2 - damper) * ctx.inv_mass;
    const d2 = (velocity + acceleration) * ctx.dt;
    if (Math.abs(d2) < ctx.opts.precision && Math.abs(delta) < ctx.opts.precision) {
      return target_value;
    } else {
      ctx.settled = false;
      return is_date(current_value) ? new Date(current_value.getTime() + d2) : current_value + d2;
    }
  } else if (Array.isArray(current_value)) {
    return current_value.map((_, i) => tick_spring(ctx, last_value[i], current_value[i], target_value[i]));
  } else if (typeof current_value === "object") {
    const next_value = {};
    for (const k in current_value) {
      next_value[k] = tick_spring(ctx, last_value[k], current_value[k], target_value[k]);
    }
    return next_value;
  } else {
    throw new Error(`Cannot spring ${typeof current_value} values`);
  }
}
function spring(value, opts = {}) {
  const store = writable(value);
  const { stiffness = 0.15, damping = 0.8, precision = 0.01 } = opts;
  let last_time;
  let task;
  let current_token;
  let last_value = value;
  let target_value = value;
  let inv_mass = 1;
  let inv_mass_recovery_rate = 0;
  let cancel_task = false;
  function set(new_value, opts2 = {}) {
    target_value = new_value;
    const token = current_token = {};
    if (value == null || opts2.hard || spring2.stiffness >= 1 && spring2.damping >= 1) {
      cancel_task = true;
      last_time = now();
      last_value = new_value;
      store.set(value = target_value);
      return Promise.resolve();
    } else if (opts2.soft) {
      const rate = opts2.soft === true ? 0.5 : +opts2.soft;
      inv_mass_recovery_rate = 1 / (rate * 60);
      inv_mass = 0;
    }
    if (!task) {
      last_time = now();
      cancel_task = false;
      task = loop((now2) => {
        if (cancel_task) {
          cancel_task = false;
          task = null;
          return false;
        }
        inv_mass = Math.min(inv_mass + inv_mass_recovery_rate, 1);
        const ctx = {
          inv_mass,
          opts: spring2,
          settled: true,
          dt: (now2 - last_time) * 60 / 1e3
        };
        const next_value = tick_spring(ctx, last_value, value, target_value);
        last_time = now2;
        last_value = value;
        store.set(value = next_value);
        if (ctx.settled) {
          task = null;
        }
        return !ctx.settled;
      });
    }
    return new Promise((fulfil) => {
      task.promise.then(() => {
        if (token === current_token)
          fulfil();
      });
    });
  }
  const spring2 = {
    set,
    update: (fn, opts2) => set(fn(target_value, value), opts2),
    subscribe: store.subscribe,
    stiffness,
    damping,
    precision
  };
  return spring2;
}
var Counter_svelte_svelte_type_style_lang = "";
const css$3 = {
  code: ".counter.svelte-139m1ow.svelte-139m1ow{display:flex;border-top:1px solid rgba(0, 0, 0, 0.1);border-bottom:1px solid rgba(0, 0, 0, 0.1);margin:1rem 0}.counter.svelte-139m1ow button.svelte-139m1ow{width:2em;padding:0;display:flex;align-items:center;justify-content:center;border:0;background-color:transparent;color:var(--text-color);font-size:2rem}.counter.svelte-139m1ow button.svelte-139m1ow:hover{background-color:var(--secondary-color)}svg.svelte-139m1ow.svelte-139m1ow{width:25%;height:25%}path.svelte-139m1ow.svelte-139m1ow{vector-effect:non-scaling-stroke;stroke-width:2px;stroke:var(--text-color)}.counter-viewport.svelte-139m1ow.svelte-139m1ow{width:8em;height:4em;overflow:hidden;text-align:center;position:relative}.counter-viewport.svelte-139m1ow strong.svelte-139m1ow{position:absolute;display:flex;width:100%;height:100%;font-weight:400;color:var(--accent-color);font-size:4rem;align-items:center;justify-content:center}.counter-digits.svelte-139m1ow.svelte-139m1ow{position:absolute;width:100%;height:100%}",
  map: `{"version":3,"file":"Counter.svelte","sources":["Counter.svelte"],"sourcesContent":["<script lang=\\"ts\\">import { spring } from 'svelte/motion';\\nlet count = 0;\\nconst displayed_count = spring();\\n$: displayed_count.set(count);\\n$: offset = modulo($displayed_count, 1);\\nfunction modulo(n, m) {\\n    // handle negative numbers\\n    return ((n % m) + m) % m;\\n}\\n<\/script>\\n\\n<div class=\\"counter\\">\\n\\t<button on:click={() => (count -= 1)} aria-label=\\"Decrease the counter by one\\">\\n\\t\\t<svg aria-hidden=\\"true\\" viewBox=\\"0 0 1 1\\">\\n\\t\\t\\t<path d=\\"M0,0.5 L1,0.5\\" />\\n\\t\\t</svg>\\n\\t</button>\\n\\n\\t<div class=\\"counter-viewport\\">\\n\\t\\t<div class=\\"counter-digits\\" style=\\"transform: translate(0, {100 * offset}%)\\">\\n\\t\\t\\t<strong style=\\"top: -100%\\" aria-hidden=\\"true\\">{Math.floor($displayed_count + 1)}</strong>\\n\\t\\t\\t<strong>{Math.floor($displayed_count)}</strong>\\n\\t\\t</div>\\n\\t</div>\\n\\n\\t<button on:click={() => (count += 1)} aria-label=\\"Increase the counter by one\\">\\n\\t\\t<svg aria-hidden=\\"true\\" viewBox=\\"0 0 1 1\\">\\n\\t\\t\\t<path d=\\"M0,0.5 L1,0.5 M0.5,0 L0.5,1\\" />\\n\\t\\t</svg>\\n\\t</button>\\n</div>\\n\\n<style>\\n\\t.counter {\\n\\t\\tdisplay: flex;\\n\\t\\tborder-top: 1px solid rgba(0, 0, 0, 0.1);\\n\\t\\tborder-bottom: 1px solid rgba(0, 0, 0, 0.1);\\n\\t\\tmargin: 1rem 0;\\n\\t}\\n\\n\\t.counter button {\\n\\t\\twidth: 2em;\\n\\t\\tpadding: 0;\\n\\t\\tdisplay: flex;\\n\\t\\talign-items: center;\\n\\t\\tjustify-content: center;\\n\\t\\tborder: 0;\\n\\t\\tbackground-color: transparent;\\n\\t\\tcolor: var(--text-color);\\n\\t\\tfont-size: 2rem;\\n\\t}\\n\\n\\t.counter button:hover {\\n\\t\\tbackground-color: var(--secondary-color);\\n\\t}\\n\\n\\tsvg {\\n\\t\\twidth: 25%;\\n\\t\\theight: 25%;\\n\\t}\\n\\n\\tpath {\\n\\t\\tvector-effect: non-scaling-stroke;\\n\\t\\tstroke-width: 2px;\\n\\t\\tstroke: var(--text-color);\\n\\t}\\n\\n\\t.counter-viewport {\\n\\t\\twidth: 8em;\\n\\t\\theight: 4em;\\n\\t\\toverflow: hidden;\\n\\t\\ttext-align: center;\\n\\t\\tposition: relative;\\n\\t}\\n\\n\\t.counter-viewport strong {\\n\\t\\tposition: absolute;\\n\\t\\tdisplay: flex;\\n\\t\\twidth: 100%;\\n\\t\\theight: 100%;\\n\\t\\tfont-weight: 400;\\n\\t\\tcolor: var(--accent-color);\\n\\t\\tfont-size: 4rem;\\n\\t\\talign-items: center;\\n\\t\\tjustify-content: center;\\n\\t}\\n\\n\\t.counter-digits {\\n\\t\\tposition: absolute;\\n\\t\\twidth: 100%;\\n\\t\\theight: 100%;\\n\\t}\\n</style>\\n"],"names":[],"mappings":"AAiCC,QAAQ,8BAAC,CAAC,AACT,OAAO,CAAE,IAAI,CACb,UAAU,CAAE,GAAG,CAAC,KAAK,CAAC,KAAK,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,GAAG,CAAC,CACxC,aAAa,CAAE,GAAG,CAAC,KAAK,CAAC,KAAK,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,GAAG,CAAC,CAC3C,MAAM,CAAE,IAAI,CAAC,CAAC,AACf,CAAC,AAED,uBAAQ,CAAC,MAAM,eAAC,CAAC,AAChB,KAAK,CAAE,GAAG,CACV,OAAO,CAAE,CAAC,CACV,OAAO,CAAE,IAAI,CACb,WAAW,CAAE,MAAM,CACnB,eAAe,CAAE,MAAM,CACvB,MAAM,CAAE,CAAC,CACT,gBAAgB,CAAE,WAAW,CAC7B,KAAK,CAAE,IAAI,YAAY,CAAC,CACxB,SAAS,CAAE,IAAI,AAChB,CAAC,AAED,uBAAQ,CAAC,qBAAM,MAAM,AAAC,CAAC,AACtB,gBAAgB,CAAE,IAAI,iBAAiB,CAAC,AACzC,CAAC,AAED,GAAG,8BAAC,CAAC,AACJ,KAAK,CAAE,GAAG,CACV,MAAM,CAAE,GAAG,AACZ,CAAC,AAED,IAAI,8BAAC,CAAC,AACL,aAAa,CAAE,kBAAkB,CACjC,YAAY,CAAE,GAAG,CACjB,MAAM,CAAE,IAAI,YAAY,CAAC,AAC1B,CAAC,AAED,iBAAiB,8BAAC,CAAC,AAClB,KAAK,CAAE,GAAG,CACV,MAAM,CAAE,GAAG,CACX,QAAQ,CAAE,MAAM,CAChB,UAAU,CAAE,MAAM,CAClB,QAAQ,CAAE,QAAQ,AACnB,CAAC,AAED,gCAAiB,CAAC,MAAM,eAAC,CAAC,AACzB,QAAQ,CAAE,QAAQ,CAClB,OAAO,CAAE,IAAI,CACb,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,IAAI,CACZ,WAAW,CAAE,GAAG,CAChB,KAAK,CAAE,IAAI,cAAc,CAAC,CAC1B,SAAS,CAAE,IAAI,CACf,WAAW,CAAE,MAAM,CACnB,eAAe,CAAE,MAAM,AACxB,CAAC,AAED,eAAe,8BAAC,CAAC,AAChB,QAAQ,CAAE,QAAQ,CAClB,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,IAAI,AACb,CAAC"}`
};
function modulo(n, m) {
  return (n % m + m) % m;
}
const Counter = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let offset;
  let $displayed_count, $$unsubscribe_displayed_count;
  let count = 0;
  const displayed_count = spring();
  $$unsubscribe_displayed_count = subscribe(displayed_count, (value) => $displayed_count = value);
  $$result.css.add(css$3);
  {
    displayed_count.set(count);
  }
  offset = modulo($displayed_count, 1);
  $$unsubscribe_displayed_count();
  return `<div class="${"counter svelte-139m1ow"}"><button aria-label="${"Decrease the counter by one"}" class="${"svelte-139m1ow"}"><svg aria-hidden="${"true"}" viewBox="${"0 0 1 1"}" class="${"svelte-139m1ow"}"><path d="${"M0,0.5 L1,0.5"}" class="${"svelte-139m1ow"}"></path></svg></button>

	<div class="${"counter-viewport svelte-139m1ow"}"><div class="${"counter-digits svelte-139m1ow"}" style="${"transform: translate(0, " + escape(100 * offset) + "%)"}"><strong style="${"top: -100%"}" aria-hidden="${"true"}" class="${"svelte-139m1ow"}">${escape(Math.floor($displayed_count + 1))}</strong>
			<strong class="${"svelte-139m1ow"}">${escape(Math.floor($displayed_count))}</strong></div></div>

	<button aria-label="${"Increase the counter by one"}" class="${"svelte-139m1ow"}"><svg aria-hidden="${"true"}" viewBox="${"0 0 1 1"}" class="${"svelte-139m1ow"}"><path d="${"M0,0.5 L1,0.5 M0.5,0 L0.5,1"}" class="${"svelte-139m1ow"}"></path></svg></button>
</div>`;
});
var index_svelte_svelte_type_style_lang$1 = "";
const css$2 = {
  code: "section.svelte-mjk9ig.svelte-mjk9ig{display:flex;flex-direction:column;justify-content:center;align-items:center;flex:1}h1.svelte-mjk9ig.svelte-mjk9ig{width:100%}.welcome.svelte-mjk9ig.svelte-mjk9ig{position:relative;width:100%;height:0;padding:0 0 calc(100% * 495 / 2048) 0}.welcome.svelte-mjk9ig img.svelte-mjk9ig{position:absolute;width:100%;height:100%;top:0;display:block}",
  map: `{"version":3,"file":"index.svelte","sources":["index.svelte"],"sourcesContent":["<script context=\\"module\\" lang=\\"ts\\">export const prerender = true;\\n<\/script>\\n\\n<script lang=\\"ts\\">import Counter from '$lib/Counter.svelte';\\n<\/script>\\n\\n<svelte:head>\\n\\t<title>Home</title>\\n</svelte:head>\\n\\n<section>\\n\\t<h1>\\n\\t\\t<div class=\\"welcome\\">\\n\\t\\t\\t<picture>\\n\\t\\t\\t\\t<source srcset=\\"svelte-welcome.webp\\" type=\\"image/webp\\" />\\n\\t\\t\\t\\t<img src=\\"svelte-welcome.png\\" alt=\\"Welcome\\" />\\n\\t\\t\\t</picture>\\n\\t\\t</div>\\n\\n\\t\\tto your new<br />SvelteKit app\\n\\t</h1>\\n\\n\\t<h2>\\n\\t\\ttry editing <strong>src/routes/index.svelte</strong>\\n\\t</h2>\\n\\n\\t<Counter />\\n</section>\\n\\n<style>\\n\\tsection {\\n\\t\\tdisplay: flex;\\n\\t\\tflex-direction: column;\\n\\t\\tjustify-content: center;\\n\\t\\talign-items: center;\\n\\t\\tflex: 1;\\n\\t}\\n\\n\\th1 {\\n\\t\\twidth: 100%;\\n\\t}\\n\\n\\t.welcome {\\n\\t\\tposition: relative;\\n\\t\\twidth: 100%;\\n\\t\\theight: 0;\\n\\t\\tpadding: 0 0 calc(100% * 495 / 2048) 0;\\n\\t}\\n\\n\\t.welcome img {\\n\\t\\tposition: absolute;\\n\\t\\twidth: 100%;\\n\\t\\theight: 100%;\\n\\t\\ttop: 0;\\n\\t\\tdisplay: block;\\n\\t}\\n</style>\\n"],"names":[],"mappings":"AA8BC,OAAO,4BAAC,CAAC,AACR,OAAO,CAAE,IAAI,CACb,cAAc,CAAE,MAAM,CACtB,eAAe,CAAE,MAAM,CACvB,WAAW,CAAE,MAAM,CACnB,IAAI,CAAE,CAAC,AACR,CAAC,AAED,EAAE,4BAAC,CAAC,AACH,KAAK,CAAE,IAAI,AACZ,CAAC,AAED,QAAQ,4BAAC,CAAC,AACT,QAAQ,CAAE,QAAQ,CAClB,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,CAAC,CACT,OAAO,CAAE,CAAC,CAAC,CAAC,CAAC,KAAK,IAAI,CAAC,CAAC,CAAC,GAAG,CAAC,CAAC,CAAC,IAAI,CAAC,CAAC,CAAC,AACvC,CAAC,AAED,sBAAQ,CAAC,GAAG,cAAC,CAAC,AACb,QAAQ,CAAE,QAAQ,CAClB,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,IAAI,CACZ,GAAG,CAAE,CAAC,CACN,OAAO,CAAE,KAAK,AACf,CAAC"}`
};
const prerender$1 = true;
const Routes = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  $$result.css.add(css$2);
  return `${$$result.head += `${$$result.title = `<title>Home</title>`, ""}`, ""}

<section class="${"svelte-mjk9ig"}"><h1 class="${"svelte-mjk9ig"}"><div class="${"welcome svelte-mjk9ig"}"><picture><source srcset="${"svelte-welcome.webp"}" type="${"image/webp"}">
				<img src="${"svelte-welcome.png"}" alt="${"Welcome"}" class="${"svelte-mjk9ig"}"></picture></div>

		to your new<br>SvelteKit app
	</h1>

	<h2>try editing <strong>src/routes/index.svelte</strong></h2>

	${validate_component(Counter, "Counter").$$render($$result, {}, {}, {})}
</section>`;
});
var index$1 = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": Routes,
  prerender: prerender$1
});
const browser = false;
const dev = false;
var about_svelte_svelte_type_style_lang = "";
const css$1 = {
  code: ".content.svelte-cf77e8{width:100%;max-width:var(--column-width);margin:var(--column-margin-top) auto 0 auto}",
  map: `{"version":3,"file":"about.svelte","sources":["about.svelte"],"sourcesContent":["<script context=\\"module\\">\\n\\timport { browser, dev } from '$app/env';\\n\\n\\t// we don't need any JS on this page, though we'll load\\n\\t// it in dev so that we get hot module replacement...\\n\\texport const hydrate = dev;\\n\\n\\t// ...but if the client-side router is already loaded\\n\\t// (i.e. we came here from elsewhere in the app), use it\\n\\texport const router = browser;\\n\\n\\t// since there's no dynamic data here, we can prerender\\n\\t// it so that it gets served as a static asset in prod\\n\\texport const prerender = true;\\n<\/script>\\n\\n<svelte:head>\\n\\t<title>About</title>\\n</svelte:head>\\n\\n<div class=\\"content\\">\\n\\t<h1>About this app</h1>\\n\\n\\t<p>\\n\\t\\tThis is a <a href=\\"https://kit.svelte.dev\\">SvelteKit</a> app. You can make your own by typing the\\n\\t\\tfollowing into your command line and following the prompts:\\n\\t</p>\\n\\n\\t<!-- TODO lose the @next! -->\\n\\t<pre>npm init svelte@next</pre>\\n\\n\\t<p>\\n\\t\\tThe page you're looking at is purely static HTML, with no client-side interactivity needed.\\n\\t\\tBecause of that, we don't need to load any JavaScript. Try viewing the page's source, or opening\\n\\t\\tthe devtools network panel and reloading.\\n\\t</p>\\n\\n\\t<p>\\n\\t\\tThe <a href=\\"/todos\\">TODOs</a> page illustrates SvelteKit's data loading and form handling. Try using\\n\\t\\tit with JavaScript disabled!\\n\\t</p>\\n</div>\\n\\n<style>\\n\\t.content {\\n\\t\\twidth: 100%;\\n\\t\\tmax-width: var(--column-width);\\n\\t\\tmargin: var(--column-margin-top) auto 0 auto;\\n\\t}\\n</style>\\n"],"names":[],"mappings":"AA4CC,QAAQ,cAAC,CAAC,AACT,KAAK,CAAE,IAAI,CACX,SAAS,CAAE,IAAI,cAAc,CAAC,CAC9B,MAAM,CAAE,IAAI,mBAAmB,CAAC,CAAC,IAAI,CAAC,CAAC,CAAC,IAAI,AAC7C,CAAC"}`
};
const hydrate = dev;
const router = browser;
const prerender = true;
const About = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  $$result.css.add(css$1);
  return `${$$result.head += `${$$result.title = `<title>About</title>`, ""}`, ""}

<div class="${"content svelte-cf77e8"}"><h1>About this app</h1>

	<p>This is a <a href="${"https://kit.svelte.dev"}">SvelteKit</a> app. You can make your own by typing the
		following into your command line and following the prompts:
	</p>

	
	<pre>npm init svelte@next</pre>

	<p>The page you&#39;re looking at is purely static HTML, with no client-side interactivity needed.
		Because of that, we don&#39;t need to load any JavaScript. Try viewing the page&#39;s source, or opening
		the devtools network panel and reloading.
	</p>

	<p>The <a href="${"/todos"}">TODOs</a> page illustrates SvelteKit&#39;s data loading and form handling. Try using
		it with JavaScript disabled!
	</p>
</div>`;
});
var about = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": About,
  hydrate,
  router,
  prerender
});
const Login = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { loginWithGithub } = $$props;
  let { overrideFirebase } = $$props;
  if ($$props.loginWithGithub === void 0 && $$bindings.loginWithGithub && loginWithGithub !== void 0)
    $$bindings.loginWithGithub(loginWithGithub);
  if ($$props.overrideFirebase === void 0 && $$bindings.overrideFirebase && overrideFirebase !== void 0)
    $$bindings.overrideFirebase(overrideFirebase);
  return `<div class="${"bg-gray-900 min-h-screen flex-grow min-w-full text-white p-5 flex flex-col"}"><div class="${"flex flex-col place-items-center m-auto gap-y-4 my-auto"}"><div class="${"sm:text-3xl text-2xl font-bold flex-grow"}" as="${"h1"}">Time Tracker</div>
		<button type="${"button"}" class="${"flex flex-row gap-x-2 p-2 bg-black text-lg font-semibold place-items-center border-2 rounded-lg"}"><svg fill="${"currentColor"}" viewBox="${"0 0 16 16"}" xmlns="${"http://www.w3.org/2000/svg"}" class="${"w-5 h-5"}"><path d="${"M7.975 16a9.39 9.39 0 003.169-.509c-.473.076-.652-.229-.652-.486l.004-.572c.003-.521.01-1.3.01-2.197 0-.944-.316-1.549-.68-1.863 2.24-.252 4.594-1.108 4.594-4.973 0-1.108-.39-2.002-1.032-2.707.1-.251.453-1.284-.1-2.668 0 0-.844-.277-2.77 1.032A9.345 9.345 0 008 .717c-.856 0-1.712.113-2.518.34C3.556-.24 2.712.025 2.712.025c-.553 1.384-.2 2.417-.1 2.668-.642.705-1.033 1.612-1.033 2.707 0 3.852 2.342 4.72 4.583 4.973-.29.252-.554.692-.642 1.347-.58.264-2.027.692-2.933-.831-.19-.302-.756-1.045-1.549-1.032-.843.012-.34.478.013.667.428.239.919 1.133 1.032 1.422.201.567.856 1.65 3.386 1.184 0 .55.006 1.079.01 1.447l.003.428c0 .265-.189.567-.692.479 1.007.34 1.926.516 3.185.516z"}"></path></svg>
			Sign in with GitHub
		</button></div></div>`;
});
const Login_1 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `${validate_component(Login, "Login").$$render($$result, { overrideFirebase: true }, {}, {})}`;
});
var login = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": Login_1
});
var index_svelte_svelte_type_style_lang = "";
const css = {
  code: `.todos.svelte-dmxqmd.svelte-dmxqmd.svelte-dmxqmd{width:100%;max-width:var(--column-width);margin:var(--column-margin-top) auto 0 auto;line-height:1}.new.svelte-dmxqmd.svelte-dmxqmd.svelte-dmxqmd{margin:0 0 0.5rem 0}input.svelte-dmxqmd.svelte-dmxqmd.svelte-dmxqmd{border:1px solid transparent}input.svelte-dmxqmd.svelte-dmxqmd.svelte-dmxqmd:focus-visible{box-shadow:inset 1px 1px 6px rgba(0, 0, 0, 0.1);border:1px solid #ff3e00 !important;outline:none}.new.svelte-dmxqmd input.svelte-dmxqmd.svelte-dmxqmd{font-size:28px;width:100%;padding:0.5em 1em 0.3em 1em;box-sizing:border-box;background:rgba(255, 255, 255, 0.05);border-radius:8px;text-align:center}.todo.svelte-dmxqmd.svelte-dmxqmd.svelte-dmxqmd{display:grid;grid-template-columns:2rem 1fr 2rem;grid-gap:0.5rem;align-items:center;margin:0 0 0.5rem 0;padding:0.5rem;background-color:white;border-radius:8px;filter:drop-shadow(2px 4px 6px rgba(0, 0, 0, 0.1));transform:translate(-1px, -1px);transition:filter 0.2s, transform 0.2s}.done.svelte-dmxqmd.svelte-dmxqmd.svelte-dmxqmd{transform:none;opacity:0.4;filter:drop-shadow(0px 0px 1px rgba(0, 0, 0, 0.1))}form.text.svelte-dmxqmd.svelte-dmxqmd.svelte-dmxqmd{position:relative;display:flex;align-items:center;flex:1}.todo.svelte-dmxqmd input.svelte-dmxqmd.svelte-dmxqmd{flex:1;padding:0.5em 2em 0.5em 0.8em;border-radius:3px}.todo.svelte-dmxqmd button.svelte-dmxqmd.svelte-dmxqmd{width:2em;height:2em;border:none;background-color:transparent;background-position:50% 50%;background-repeat:no-repeat}button.toggle.svelte-dmxqmd.svelte-dmxqmd.svelte-dmxqmd{border:1px solid rgba(0, 0, 0, 0.2);border-radius:50%;box-sizing:border-box;background-size:1em auto}.done.svelte-dmxqmd .toggle.svelte-dmxqmd.svelte-dmxqmd{background-image:url("data:image/svg+xml,%3Csvg width='22' height='16' viewBox='0 0 22 16' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20.5 1.5L7.4375 14.5L1.5 8.5909' stroke='%23676778' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")}.delete.svelte-dmxqmd.svelte-dmxqmd.svelte-dmxqmd{background-image:url("data:image/svg+xml,%3Csvg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M4.5 5V22H19.5V5H4.5Z' fill='%23676778' stroke='%23676778' stroke-width='1.5' stroke-linejoin='round'/%3E%3Cpath d='M10 10V16.5' stroke='white' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3Cpath d='M14 10V16.5' stroke='white' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3Cpath d='M2 5H22' stroke='%23676778' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3Cpath d='M8 5L9.6445 2H14.3885L16 5H8Z' fill='%23676778' stroke='%23676778' stroke-width='1.5' stroke-linejoin='round'/%3E%3C/svg%3E%0A");opacity:0.2}.delete.svelte-dmxqmd.svelte-dmxqmd.svelte-dmxqmd:hover,.delete.svelte-dmxqmd.svelte-dmxqmd.svelte-dmxqmd:focus{transition:opacity 0.2s;opacity:1}.save.svelte-dmxqmd.svelte-dmxqmd.svelte-dmxqmd{position:absolute;right:0;opacity:0;background-image:url("data:image/svg+xml,%3Csvg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20.5 2H3.5C2.67158 2 2 2.67157 2 3.5V20.5C2 21.3284 2.67158 22 3.5 22H20.5C21.3284 22 22 21.3284 22 20.5V3.5C22 2.67157 21.3284 2 20.5 2Z' fill='%23676778' stroke='%23676778' stroke-width='1.5' stroke-linejoin='round'/%3E%3Cpath d='M17 2V11H7.5V2H17Z' fill='white' stroke='white' stroke-width='1.5' stroke-linejoin='round'/%3E%3Cpath d='M13.5 5.5V7.5' stroke='%23676778' stroke-width='1.5' stroke-linecap='round'/%3E%3Cpath d='M5.99844 2H18.4992' stroke='%23676778' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E%0A")}.todo.svelte-dmxqmd input.svelte-dmxqmd:focus+.save.svelte-dmxqmd,.save.svelte-dmxqmd.svelte-dmxqmd.svelte-dmxqmd:focus{transition:opacity 0.2s;opacity:1}`,
  map: `{"version":3,"file":"index.svelte","sources":["index.svelte"],"sourcesContent":["<script context=\\"module\\" lang=\\"ts\\">import { enhance } from '$lib/form';\\n// see https://kit.svelte.dev/docs#loading\\nexport const load = async ({ fetch }) => {\\n    const res = await fetch('/todos.json');\\n    if (res.ok) {\\n        const todos = await res.json();\\n        return {\\n            props: { todos }\\n        };\\n    }\\n    const { message } = await res.json();\\n    return {\\n        error: new Error(message)\\n    };\\n};\\n<\/script>\\n\\n<script lang=\\"ts\\">import { scale } from 'svelte/transition';\\nimport { flip } from 'svelte/animate';\\nexport let todos;\\nasync function patch(res) {\\n    const todo = await res.json();\\n    todos = todos.map((t) => {\\n        if (t.uid === todo.uid)\\n            return todo;\\n        return t;\\n    });\\n}\\n<\/script>\\n\\n<svelte:head>\\n\\t<title>Todos</title>\\n</svelte:head>\\n\\n<div class=\\"todos\\">\\n\\t<h1>Todos</h1>\\n\\n\\t<form\\n\\t\\tclass=\\"new\\"\\n\\t\\taction=\\"/todos.json\\"\\n\\t\\tmethod=\\"post\\"\\n\\t\\tuse:enhance={{\\n\\t\\t\\tresult: async (res, form) => {\\n\\t\\t\\t\\tconst created = await res.json();\\n\\t\\t\\t\\ttodos = [...todos, created];\\n\\n\\t\\t\\t\\tform.reset();\\n\\t\\t\\t}\\n\\t\\t}}\\n\\t>\\n\\t\\t<input name=\\"text\\" aria-label=\\"Add todo\\" placeholder=\\"+ tap to add a todo\\" />\\n\\t</form>\\n\\n\\t{#each todos as todo (todo.uid)}\\n\\t\\t<div\\n\\t\\t\\tclass=\\"todo\\"\\n\\t\\t\\tclass:done={todo.done}\\n\\t\\t\\ttransition:scale|local={{ start: 0.7 }}\\n\\t\\t\\tanimate:flip={{ duration: 200 }}\\n\\t\\t>\\n\\t\\t\\t<form\\n\\t\\t\\t\\taction=\\"/todos/{todo.uid}.json?_method=patch\\"\\n\\t\\t\\t\\tmethod=\\"post\\"\\n\\t\\t\\t\\tuse:enhance={{\\n\\t\\t\\t\\t\\tpending: (data) => {\\n\\t\\t\\t\\t\\t\\ttodo.done = !!data.get('done');\\n\\t\\t\\t\\t\\t},\\n\\t\\t\\t\\t\\tresult: patch\\n\\t\\t\\t\\t}}\\n\\t\\t\\t>\\n\\t\\t\\t\\t<input type=\\"hidden\\" name=\\"done\\" value={todo.done ? '' : 'true'} />\\n\\t\\t\\t\\t<button class=\\"toggle\\" aria-label=\\"Mark todo as {todo.done ? 'not done' : 'done'}\\" />\\n\\t\\t\\t</form>\\n\\n\\t\\t\\t<form\\n\\t\\t\\t\\tclass=\\"text\\"\\n\\t\\t\\t\\taction=\\"/todos/{todo.uid}.json?_method=patch\\"\\n\\t\\t\\t\\tmethod=\\"post\\"\\n\\t\\t\\t\\tuse:enhance={{\\n\\t\\t\\t\\t\\tresult: patch\\n\\t\\t\\t\\t}}\\n\\t\\t\\t>\\n\\t\\t\\t\\t<input aria-label=\\"Edit todo\\" type=\\"text\\" name=\\"text\\" value={todo.text} />\\n\\t\\t\\t\\t<button class=\\"save\\" aria-label=\\"Save todo\\" />\\n\\t\\t\\t</form>\\n\\n\\t\\t\\t<form\\n\\t\\t\\t\\taction=\\"/todos/{todo.uid}.json?_method=delete\\"\\n\\t\\t\\t\\tmethod=\\"post\\"\\n\\t\\t\\t\\tuse:enhance={{\\n\\t\\t\\t\\t\\tpending: () => (todo.pending_delete = true),\\n\\t\\t\\t\\t\\tresult: () => {\\n\\t\\t\\t\\t\\t\\ttodos = todos.filter((t) => t.uid !== todo.uid);\\n\\t\\t\\t\\t\\t}\\n\\t\\t\\t\\t}}\\n\\t\\t\\t>\\n\\t\\t\\t\\t<button class=\\"delete\\" aria-label=\\"Delete todo\\" disabled={todo.pending_delete} />\\n\\t\\t\\t</form>\\n\\t\\t</div>\\n\\t{/each}\\n</div>\\n\\n<style>\\n\\t.todos {\\n\\t\\twidth: 100%;\\n\\t\\tmax-width: var(--column-width);\\n\\t\\tmargin: var(--column-margin-top) auto 0 auto;\\n\\t\\tline-height: 1;\\n\\t}\\n\\n\\t.new {\\n\\t\\tmargin: 0 0 0.5rem 0;\\n\\t}\\n\\n\\tinput {\\n\\t\\tborder: 1px solid transparent;\\n\\t}\\n\\n\\tinput:focus-visible {\\n\\t\\tbox-shadow: inset 1px 1px 6px rgba(0, 0, 0, 0.1);\\n\\t\\tborder: 1px solid #ff3e00 !important;\\n\\t\\toutline: none;\\n\\t}\\n\\n\\t.new input {\\n\\t\\tfont-size: 28px;\\n\\t\\twidth: 100%;\\n\\t\\tpadding: 0.5em 1em 0.3em 1em;\\n\\t\\tbox-sizing: border-box;\\n\\t\\tbackground: rgba(255, 255, 255, 0.05);\\n\\t\\tborder-radius: 8px;\\n\\t\\ttext-align: center;\\n\\t}\\n\\n\\t.todo {\\n\\t\\tdisplay: grid;\\n\\t\\tgrid-template-columns: 2rem 1fr 2rem;\\n\\t\\tgrid-gap: 0.5rem;\\n\\t\\talign-items: center;\\n\\t\\tmargin: 0 0 0.5rem 0;\\n\\t\\tpadding: 0.5rem;\\n\\t\\tbackground-color: white;\\n\\t\\tborder-radius: 8px;\\n\\t\\tfilter: drop-shadow(2px 4px 6px rgba(0, 0, 0, 0.1));\\n\\t\\ttransform: translate(-1px, -1px);\\n\\t\\ttransition: filter 0.2s, transform 0.2s;\\n\\t}\\n\\n\\t.done {\\n\\t\\ttransform: none;\\n\\t\\topacity: 0.4;\\n\\t\\tfilter: drop-shadow(0px 0px 1px rgba(0, 0, 0, 0.1));\\n\\t}\\n\\n\\tform.text {\\n\\t\\tposition: relative;\\n\\t\\tdisplay: flex;\\n\\t\\talign-items: center;\\n\\t\\tflex: 1;\\n\\t}\\n\\n\\t.todo input {\\n\\t\\tflex: 1;\\n\\t\\tpadding: 0.5em 2em 0.5em 0.8em;\\n\\t\\tborder-radius: 3px;\\n\\t}\\n\\n\\t.todo button {\\n\\t\\twidth: 2em;\\n\\t\\theight: 2em;\\n\\t\\tborder: none;\\n\\t\\tbackground-color: transparent;\\n\\t\\tbackground-position: 50% 50%;\\n\\t\\tbackground-repeat: no-repeat;\\n\\t}\\n\\n\\tbutton.toggle {\\n\\t\\tborder: 1px solid rgba(0, 0, 0, 0.2);\\n\\t\\tborder-radius: 50%;\\n\\t\\tbox-sizing: border-box;\\n\\t\\tbackground-size: 1em auto;\\n\\t}\\n\\n\\t.done .toggle {\\n\\t\\tbackground-image: url(\\"data:image/svg+xml,%3Csvg width='22' height='16' viewBox='0 0 22 16' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20.5 1.5L7.4375 14.5L1.5 8.5909' stroke='%23676778' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E\\");\\n\\t}\\n\\n\\t.delete {\\n\\t\\tbackground-image: url(\\"data:image/svg+xml,%3Csvg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M4.5 5V22H19.5V5H4.5Z' fill='%23676778' stroke='%23676778' stroke-width='1.5' stroke-linejoin='round'/%3E%3Cpath d='M10 10V16.5' stroke='white' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3Cpath d='M14 10V16.5' stroke='white' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3Cpath d='M2 5H22' stroke='%23676778' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3Cpath d='M8 5L9.6445 2H14.3885L16 5H8Z' fill='%23676778' stroke='%23676778' stroke-width='1.5' stroke-linejoin='round'/%3E%3C/svg%3E%0A\\");\\n\\t\\topacity: 0.2;\\n\\t}\\n\\n\\t.delete:hover,\\n\\t.delete:focus {\\n\\t\\ttransition: opacity 0.2s;\\n\\t\\topacity: 1;\\n\\t}\\n\\n\\t.save {\\n\\t\\tposition: absolute;\\n\\t\\tright: 0;\\n\\t\\topacity: 0;\\n\\t\\tbackground-image: url(\\"data:image/svg+xml,%3Csvg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20.5 2H3.5C2.67158 2 2 2.67157 2 3.5V20.5C2 21.3284 2.67158 22 3.5 22H20.5C21.3284 22 22 21.3284 22 20.5V3.5C22 2.67157 21.3284 2 20.5 2Z' fill='%23676778' stroke='%23676778' stroke-width='1.5' stroke-linejoin='round'/%3E%3Cpath d='M17 2V11H7.5V2H17Z' fill='white' stroke='white' stroke-width='1.5' stroke-linejoin='round'/%3E%3Cpath d='M13.5 5.5V7.5' stroke='%23676778' stroke-width='1.5' stroke-linecap='round'/%3E%3Cpath d='M5.99844 2H18.4992' stroke='%23676778' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E%0A\\");\\n\\t}\\n\\n\\t.todo input:focus + .save,\\n\\t.save:focus {\\n\\t\\ttransition: opacity 0.2s;\\n\\t\\topacity: 1;\\n\\t}\\n</style>\\n"],"names":[],"mappings":"AAuGC,MAAM,0CAAC,CAAC,AACP,KAAK,CAAE,IAAI,CACX,SAAS,CAAE,IAAI,cAAc,CAAC,CAC9B,MAAM,CAAE,IAAI,mBAAmB,CAAC,CAAC,IAAI,CAAC,CAAC,CAAC,IAAI,CAC5C,WAAW,CAAE,CAAC,AACf,CAAC,AAED,IAAI,0CAAC,CAAC,AACL,MAAM,CAAE,CAAC,CAAC,CAAC,CAAC,MAAM,CAAC,CAAC,AACrB,CAAC,AAED,KAAK,0CAAC,CAAC,AACN,MAAM,CAAE,GAAG,CAAC,KAAK,CAAC,WAAW,AAC9B,CAAC,AAED,+CAAK,cAAc,AAAC,CAAC,AACpB,UAAU,CAAE,KAAK,CAAC,GAAG,CAAC,GAAG,CAAC,GAAG,CAAC,KAAK,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,GAAG,CAAC,CAChD,MAAM,CAAE,GAAG,CAAC,KAAK,CAAC,OAAO,CAAC,UAAU,CACpC,OAAO,CAAE,IAAI,AACd,CAAC,AAED,kBAAI,CAAC,KAAK,4BAAC,CAAC,AACX,SAAS,CAAE,IAAI,CACf,KAAK,CAAE,IAAI,CACX,OAAO,CAAE,KAAK,CAAC,GAAG,CAAC,KAAK,CAAC,GAAG,CAC5B,UAAU,CAAE,UAAU,CACtB,UAAU,CAAE,KAAK,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,IAAI,CAAC,CACrC,aAAa,CAAE,GAAG,CAClB,UAAU,CAAE,MAAM,AACnB,CAAC,AAED,KAAK,0CAAC,CAAC,AACN,OAAO,CAAE,IAAI,CACb,qBAAqB,CAAE,IAAI,CAAC,GAAG,CAAC,IAAI,CACpC,QAAQ,CAAE,MAAM,CAChB,WAAW,CAAE,MAAM,CACnB,MAAM,CAAE,CAAC,CAAC,CAAC,CAAC,MAAM,CAAC,CAAC,CACpB,OAAO,CAAE,MAAM,CACf,gBAAgB,CAAE,KAAK,CACvB,aAAa,CAAE,GAAG,CAClB,MAAM,CAAE,YAAY,GAAG,CAAC,GAAG,CAAC,GAAG,CAAC,KAAK,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,GAAG,CAAC,CAAC,CACnD,SAAS,CAAE,UAAU,IAAI,CAAC,CAAC,IAAI,CAAC,CAChC,UAAU,CAAE,MAAM,CAAC,IAAI,CAAC,CAAC,SAAS,CAAC,IAAI,AACxC,CAAC,AAED,KAAK,0CAAC,CAAC,AACN,SAAS,CAAE,IAAI,CACf,OAAO,CAAE,GAAG,CACZ,MAAM,CAAE,YAAY,GAAG,CAAC,GAAG,CAAC,GAAG,CAAC,KAAK,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,GAAG,CAAC,CAAC,AACpD,CAAC,AAED,IAAI,KAAK,0CAAC,CAAC,AACV,QAAQ,CAAE,QAAQ,CAClB,OAAO,CAAE,IAAI,CACb,WAAW,CAAE,MAAM,CACnB,IAAI,CAAE,CAAC,AACR,CAAC,AAED,mBAAK,CAAC,KAAK,4BAAC,CAAC,AACZ,IAAI,CAAE,CAAC,CACP,OAAO,CAAE,KAAK,CAAC,GAAG,CAAC,KAAK,CAAC,KAAK,CAC9B,aAAa,CAAE,GAAG,AACnB,CAAC,AAED,mBAAK,CAAC,MAAM,4BAAC,CAAC,AACb,KAAK,CAAE,GAAG,CACV,MAAM,CAAE,GAAG,CACX,MAAM,CAAE,IAAI,CACZ,gBAAgB,CAAE,WAAW,CAC7B,mBAAmB,CAAE,GAAG,CAAC,GAAG,CAC5B,iBAAiB,CAAE,SAAS,AAC7B,CAAC,AAED,MAAM,OAAO,0CAAC,CAAC,AACd,MAAM,CAAE,GAAG,CAAC,KAAK,CAAC,KAAK,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,GAAG,CAAC,CACpC,aAAa,CAAE,GAAG,CAClB,UAAU,CAAE,UAAU,CACtB,eAAe,CAAE,GAAG,CAAC,IAAI,AAC1B,CAAC,AAED,mBAAK,CAAC,OAAO,4BAAC,CAAC,AACd,gBAAgB,CAAE,IAAI,uQAAuQ,CAAC,AAC/R,CAAC,AAED,OAAO,0CAAC,CAAC,AACR,gBAAgB,CAAE,IAAI,yrBAAyrB,CAAC,CAChtB,OAAO,CAAE,GAAG,AACb,CAAC,AAED,iDAAO,MAAM,CACb,iDAAO,MAAM,AAAC,CAAC,AACd,UAAU,CAAE,OAAO,CAAC,IAAI,CACxB,OAAO,CAAE,CAAC,AACX,CAAC,AAED,KAAK,0CAAC,CAAC,AACN,QAAQ,CAAE,QAAQ,CAClB,KAAK,CAAE,CAAC,CACR,OAAO,CAAE,CAAC,CACV,gBAAgB,CAAE,IAAI,gpBAAgpB,CAAC,AACxqB,CAAC,AAED,mBAAK,CAAC,mBAAK,MAAM,CAAG,mBAAK,CACzB,+CAAK,MAAM,AAAC,CAAC,AACZ,UAAU,CAAE,OAAO,CAAC,IAAI,CACxB,OAAO,CAAE,CAAC,AACX,CAAC"}`
};
const load = async ({ fetch: fetch2 }) => {
  const res = await fetch2("/todos.json");
  if (res.ok) {
    const todos = await res.json();
    return { props: { todos } };
  }
  const { message } = await res.json();
  return { error: new Error(message) };
};
const Todos = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { todos } = $$props;
  if ($$props.todos === void 0 && $$bindings.todos && todos !== void 0)
    $$bindings.todos(todos);
  $$result.css.add(css);
  return `${$$result.head += `${$$result.title = `<title>Todos</title>`, ""}`, ""}

<div class="${"todos svelte-dmxqmd"}"><h1>Todos</h1>

	<form class="${"new svelte-dmxqmd"}" action="${"/todos.json"}" method="${"post"}"><input name="${"text"}" aria-label="${"Add todo"}" placeholder="${"+ tap to add a todo"}" class="${"svelte-dmxqmd"}"></form>

	${each(todos, (todo) => `<div class="${["todo svelte-dmxqmd", todo.done ? "done" : ""].join(" ").trim()}"><form action="${"/todos/" + escape(todo.uid) + ".json?_method=patch"}" method="${"post"}"><input type="${"hidden"}" name="${"done"}"${add_attribute("value", todo.done ? "" : "true", 0)} class="${"svelte-dmxqmd"}">
				<button class="${"toggle svelte-dmxqmd"}" aria-label="${"Mark todo as " + escape(todo.done ? "not done" : "done")}"></button></form>

			<form class="${"text svelte-dmxqmd"}" action="${"/todos/" + escape(todo.uid) + ".json?_method=patch"}" method="${"post"}"><input aria-label="${"Edit todo"}" type="${"text"}" name="${"text"}"${add_attribute("value", todo.text, 0)} class="${"svelte-dmxqmd"}">
				<button class="${"save svelte-dmxqmd"}" aria-label="${"Save todo"}"></button></form>

			<form action="${"/todos/" + escape(todo.uid) + ".json?_method=delete"}" method="${"post"}"><button class="${"delete svelte-dmxqmd"}" aria-label="${"Delete todo"}" ${todo.pending_delete ? "disabled" : ""}></button></form>
		</div>`)}
</div>`;
});
var index = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": Todos,
  load
});
export { init, render };
