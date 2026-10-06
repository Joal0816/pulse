(function () {
  "use strict";
  try {
    var script = document.currentScript || document.querySelector("script[data-site]");
    if (!script) return;
    var siteId = script.getAttribute("data-site");
    if (!siteId) return;

    // Detect if localhost or preview environment
    var isLocal = location.hostname === "localhost" || location.hostname === "127.0.0.1";
    var ignoreLocal = script.getAttribute("data-ignore-local") !== "false";
    if (isLocal && ignoreLocal) return;

    // Find host API endpoint
    var scriptSrc = script.src;
    var host = scriptSrc.split("/p.js")[0] || "";
    var endpoint = host + "/api/track";

    // Session ID in sessionStorage (persists across navigation in tab, zero cookies)
    var sessionKey = "_pulse_sid";
    var sessionId = "";
    try {
      sessionId = sessionStorage.getItem(sessionKey);
      if (!sessionId) {
        sessionId = "s_" + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
        sessionStorage.setItem(sessionKey, sessionId);
      }
    } catch (e) {
      sessionId = "s_anon_" + Math.random().toString(36).substring(2, 9);
    }

    function send(eventType, extra) {
      try {
        var payload = {
          site: siteId,
          type: eventType || "pageview",
          path: location.pathname + location.search,
          title: document.title || "",
          referrer: document.referrer || "",
          session: sessionId,
          screen: screen.width + "x" + screen.height,
          lang: navigator.language || "",
          extra: extra || {},
          timestamp: Date.now(),
        };

        if (navigator.sendBeacon) {
          navigator.sendBeacon(endpoint, JSON.stringify(payload));
        } else {
          var xhr = new XMLHttpRequest();
          xhr.open("POST", endpoint, true);
          xhr.setRequestHeader("Content-Type", "application/json");
          xhr.send(JSON.stringify(payload));
        }
      } catch (err) {
        // Silently fail, do not disturb host site
      }
    }

    // Auto-track initial pageview
    if (document.readyState === "complete" || document.readyState === "interactive") {
      send("pageview");
    } else {
      window.addEventListener("DOMContentLoaded", function () {
        send("pageview");
      });
    }

    // History state change tracking for SPAs (Next.js, Vue, Svelte, React Router)
    var origPushState = history.pushState;
    if (origPushState) {
      history.pushState = function () {
        var ret = origPushState.apply(this, arguments);
        setTimeout(function () {
          send("pageview");
        }, 50);
        return ret;
      };
      window.addEventListener("popstate", function () {
        send("pageview");
      });
    }

    // Expose minimal API for custom event tracking
    window.pulse = {
      track: function (eventName, data) {
        send("event", { name: eventName, data: data });
      },
    };
  } catch (globalErr) {}
})();
