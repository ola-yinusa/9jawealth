/**
 * Client interactions for PalmVille Agro Real Estate.
 * Kept external so strict Content-Security-Policy applies cleanly on both
 * palmville.9jawealth.com and www.9jawealth.com/palmville/.
 */
(function () {
  "use strict";

  var PALMVILLE_WA_URL = "https://wa.link/gv7ic6";
  var PALMVILLE_VIDEO_URL = "https://drive.google.com/file/d/1kAgEETfTCE-DDOCOSdFxErsNEu4Dx4a_/preview";
  var PALMVILLE_FALLBACK_URL = "https://drive.google.com/file/d/1zGzwy_Dkox6goaIhzOSafCYTVoFScWxa/view";
  var PIXEL_ID = "1013826654975546";
  var REQUEST_TIMEOUT_MS = 12000;

  document.documentElement.classList.add("pv-js");

  function trackEvent(name, params) {
    try {
      if (typeof window.fbq === "function") {
        window.fbq("track", name, params || {});
      }
    } catch (_err) {
      // Ignore pixel errors if blocked by browser or CSP.
    }
  }

  function initMetaPixel() {
    var host = window.location.hostname;
    // Root 9jawealth.com enforces script-src 'self'; only load Facebook Pixel on standalone hosts.
    if (host === "www.9jawealth.com" || host === "9jawealth.com") return;

    var loaded = false;
    function loadPixel() {
      if (loaded) return;
      loaded = true;
      try {
        if (!window.fbq) {
          var n = function () {
            if (n.callMethod) n.callMethod.apply(n, arguments);
            else n.queue.push(arguments);
          };
          window.fbq = n;
          if (!window._fbq) window._fbq = n;
          n.push = n;
          n.loaded = true;
          n.version = "2.0";
          n.queue = [];
          var script = document.createElement("script");
          script.async = true;
          script.src = "https://connect.facebook.net/en_US/fbevents.js";
          var firstScript = document.getElementsByTagName("script")[0];
          if (firstScript && firstScript.parentNode) {
            firstScript.parentNode.insertBefore(script, firstScript);
          } else {
            document.head.appendChild(script);
          }
        }
        window.fbq("init", PIXEL_ID);
        window.fbq("track", "PageView");
      } catch (_err) {
        // Fail silently when external analytics is blocked.
      }
    }

    function schedulePixel() {
      ["pointerdown", "keydown", "scroll", "touchstart"].forEach(function (evt) {
        window.addEventListener(evt, loadPixel, { once: true, passive: true });
      });
      window.setTimeout(loadPixel, 8000);
    }

    if (document.readyState === "complete") {
      schedulePixel();
    } else {
      window.addEventListener("load", schedulePixel, { once: true });
    }
  }

  function initMobileNav() {
    var toggleBtn = document.getElementById("nav-toggle");
    var drawer = document.getElementById("mobile-drawer");
    var backdrop = document.getElementById("mobile-drawer-backdrop");
    var closeBtn = document.getElementById("nav-close");
    if (!toggleBtn || !drawer || !backdrop || !closeBtn) return;

    var drawerLinks = Array.prototype.slice.call(drawer.querySelectorAll("a"));

    function getFocusable() {
      return Array.prototype.slice.call(
        drawer.querySelectorAll(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      );
    }

    function openDrawer() {
      drawer.hidden = false;
      backdrop.hidden = false;
      toggleBtn.setAttribute("aria-expanded", "true");
      document.body.style.overflow = "hidden";
      window.requestAnimationFrame(function () {
        drawer.classList.add("is-open");
        backdrop.classList.add("is-open");
        closeBtn.focus();
      });
    }

    function closeDrawer(restoreFocus) {
      if (drawer.hidden) return;
      drawer.classList.remove("is-open");
      backdrop.classList.remove("is-open");
      drawer.hidden = true;
      backdrop.hidden = true;
      toggleBtn.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
      if (restoreFocus) {
        toggleBtn.focus();
      }
    }

    toggleBtn.addEventListener("click", function () {
      if (drawer.hidden) openDrawer();
      else closeDrawer(true);
    });

    closeBtn.addEventListener("click", function () {
      closeDrawer(true);
    });

    backdrop.addEventListener("click", function () {
      closeDrawer(true);
    });

    drawerLinks.forEach(function (link) {
      link.addEventListener("click", function () {
        closeDrawer(false);
      });
    });

    document.addEventListener("keydown", function (event) {
      if (drawer.hidden) return;
      if (event.key === "Escape") {
        event.preventDefault();
        closeDrawer(true);
        return;
      }
      if (event.key === "Tab") {
        var focusable = getFocusable();
        if (focusable.length === 0) return;
        var first = focusable[0];
        var last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 860 && !drawer.hidden) {
        closeDrawer(false);
      }
    });
  }

  function normalizeVideoSource(rawUrl) {
    var raw = (rawUrl || "").trim();
    if (!raw) return null;
    var parsed;
    try {
      parsed = new URL(raw, window.location.href);
    } catch (_err) {
      return null;
    }
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return null;

    var host = parsed.hostname.toLowerCase();
    var path = parsed.pathname;

    if (/\.(mp4|webm|m4v|ogg)$/i.test(path)) {
      return { type: "video", embedUrl: parsed.href };
    }

    if (host === "drive.google.com" || host.endsWith(".drive.google.com")) {
      var driveMatch = path.match(/\/d\/([a-zA-Z0-9_-]+)/);
      var driveId = (driveMatch && driveMatch[1]) || parsed.searchParams.get("id");
      if (driveId) {
        return {
          type: "iframe",
          embedUrl: "https://drive.google.com/file/d/" + encodeURIComponent(driveId) + "/preview",
        };
      }
    }

    if (
      host === "youtu.be" ||
      host === "youtube.com" ||
      host.endsWith(".youtube.com") ||
      host === "www.youtube-nocookie.com"
    ) {
      var ytId = "";
      if (host === "youtu.be") {
        ytId = path.replace(/^\/+/, "").split("/")[0];
      } else if (parsed.searchParams.get("v")) {
        ytId = parsed.searchParams.get("v");
      } else {
        var ytMatch = path.match(/^\/(?:shorts|embed|live)\/([a-zA-Z0-9_-]+)/);
        if (ytMatch && ytMatch[1]) ytId = ytMatch[1];
      }
      if (ytId) {
        return {
          type: "iframe",
          embedUrl: "https://www.youtube.com/embed/" + encodeURIComponent(ytId) + "?rel=0",
        };
      }
    }

    if (host === "vimeo.com" || host.endsWith(".vimeo.com")) {
      var vimeoMatch = path.match(/\/(?:video\/)?(\d+)(?:\/([a-zA-Z0-9]+))?/);
      if (vimeoMatch && vimeoMatch[1]) {
        var vimeoUrl = "https://player.vimeo.com/video/" + encodeURIComponent(vimeoMatch[1]);
        var hash = vimeoMatch[2] || parsed.searchParams.get("h");
        if (hash) vimeoUrl += "?h=" + encodeURIComponent(hash);
        return { type: "iframe", embedUrl: vimeoUrl };
      }
    }

    return { type: "iframe", embedUrl: parsed.href };
  }

  function mountVideo(rawUrl, rawFallbackUrl) {
    var resolved = normalizeVideoSource(rawUrl);
    if (!resolved) return;

    var container = document.querySelector(".video-wrap");
    var placeholder = document.getElementById("palmville-video-placeholder");
    var videoEl = document.getElementById("palmville-video");
    var autoplayNote = document.getElementById("palmville-video-autoplay-note");
    var fallbackLink = document.getElementById("palmville-video-fallback-link");
    if (!container) return;

    if (fallbackLink && typeof rawFallbackUrl === "string" && rawFallbackUrl.trim()) {
      fallbackLink.href = rawFallbackUrl.trim();
    }

    if (resolved.type === "iframe") {
      var iframe = document.createElement("iframe");
      iframe.src = resolved.embedUrl;
      iframe.title = "PalmVille plantation walkthrough video";
      iframe.setAttribute(
        "allow",
        "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
      );
      if (placeholder) placeholder.hidden = true;
      if (videoEl) videoEl.remove();
      container.classList.add("is-video-active");
      container.insertBefore(iframe, container.firstChild);
      if (autoplayNote) autoplayNote.hidden = false;
    } else if (videoEl) {
      videoEl.src = resolved.embedUrl;
      videoEl.hidden = false;
      if (placeholder) placeholder.hidden = true;
      container.classList.add("is-video-active");
      if (autoplayNote) autoplayNote.hidden = false;
    }
  }

  function initVideoConfig() {
    if (window.fetch) {
      fetch("./video-config.json", { cache: "no-store" })
        .then(function (res) {
          return res.ok ? res.json() : null;
        })
        .then(function (cfg) {
          var url = cfg && typeof cfg.videoUrl === "string" ? cfg.videoUrl.trim() : "";
          var fb = cfg && typeof cfg.fallbackUrl === "string" ? cfg.fallbackUrl.trim() : "";
          mountVideo(url || PALMVILLE_VIDEO_URL, fb || PALMVILLE_FALLBACK_URL);
        })
        .catch(function () {
          mountVideo(PALMVILLE_VIDEO_URL, PALMVILLE_FALLBACK_URL);
        });
    } else {
      mountVideo(PALMVILLE_VIDEO_URL, PALMVILLE_FALLBACK_URL);
    }
  }

  function initFaqAccordion() {
    var items = Array.prototype.slice.call(document.querySelectorAll(".faq-item"));
    if (items.length === 0) return;

    items.forEach(function (item) {
      var q = item.querySelector(".faq-q");
      var a = item.querySelector(".faq-a");
      if (!q || !a) return;

      q.addEventListener("click", function () {
        var isOpen = item.classList.contains("open");
        items.forEach(function (other) {
          if (other !== item && other.classList.contains("open")) {
            other.classList.remove("open");
            var oq = other.querySelector(".faq-q");
            var oa = other.querySelector(".faq-a");
            if (oq) oq.setAttribute("aria-expanded", "false");
            if (oa) oa.style.maxHeight = "";
          }
        });
        if (isOpen) {
          item.classList.remove("open");
          q.setAttribute("aria-expanded", "false");
          a.style.maxHeight = "";
        } else {
          item.classList.add("open");
          q.setAttribute("aria-expanded", "true");
          a.style.maxHeight = a.scrollHeight + "px";
        }
      });
    });

    window.addEventListener("resize", function () {
      items.forEach(function (item) {
        if (item.classList.contains("open")) {
          var a = item.querySelector(".faq-a");
          if (a) a.style.maxHeight = a.scrollHeight + "px";
        }
      });
    });
  }

  function initScrollReveal() {
    var revealEls = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
    if (revealEls.length === 0) return;

    var reduceMotion =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion || typeof IntersectionObserver !== "function") {
      revealEls.forEach(function (el) {
        el.classList.add("in");
      });
      return;
    }

    function markVisible(el) {
      el.classList.add("in");
    }

    var thresholdY = window.innerHeight * 0.96;
    revealEls.forEach(function (el) {
      if (el.getBoundingClientRect().top <= thresholdY) {
        markVisible(el);
      }
    });

    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            markVisible(entry.target);
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -24px 0px" }
    );

    revealEls.forEach(function (el) {
      if (!el.classList.contains("in")) io.observe(el);
    });

    window.setTimeout(function () {
      revealEls.forEach(markVisible);
      io.disconnect();
    }, 2000);
  }

  function getAttribution() {
    var attribution = {};
    try {
      var qs = new URLSearchParams(window.location.search);
      ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"].forEach(function (k) {
        var v = qs.get(k);
        if (v) attribution[k] = v;
      });
      if (document.referrer) attribution.referrer = document.referrer;
      attribution.landing_page = window.location.href;
    } catch (_err) {
      // Ignore URL parsing issues.
    }
    return attribution;
  }

  function fetchWithTimeout(url, init, timeoutMs) {
    var controller = typeof AbortController === "function" ? new AbortController() : null;
    var timer = controller
      ? window.setTimeout(function () {
          controller.abort();
        }, timeoutMs)
      : null;

    var reqInit = Object.assign({}, init || {});
    if (controller) reqInit.signal = controller.signal;

    return fetch(url, reqInit).finally(function () {
      if (timer !== null) window.clearTimeout(timer);
    });
  }

  function renderFormStatus(msgEl, state, prefixText, waLinkLabel, suffixText) {
    if (!msgEl) return;
    msgEl.dataset.state = state;
    msgEl.replaceChildren();
    msgEl.appendChild(document.createTextNode(prefixText));
    if (waLinkLabel) {
      var waLink = document.createElement("a");
      waLink.href = PALMVILLE_WA_URL;
      waLink.target = "_blank";
      waLink.rel = "noopener noreferrer";
      waLink.textContent = waLinkLabel;
      msgEl.appendChild(waLink);
    }
    if (suffixText) {
      msgEl.appendChild(document.createTextNode(suffixText));
    }
  }

  function initPlanPreselect() {
    var planSelect = document.getElementById("planpref");
    if (!planSelect) return;
    document.querySelectorAll("[data-select-plan]").forEach(function (trigger) {
      trigger.addEventListener("click", function () {
        var targetPlan = trigger.getAttribute("data-select-plan");
        if (!targetPlan) return;
        for (var i = 0; i < planSelect.options.length; i += 1) {
          if (planSelect.options[i].value === targetPlan || planSelect.options[i].text === targetPlan) {
            planSelect.selectedIndex = i;
            break;
          }
        }
      });
    });
  }

  function initReservationForm(attribution) {
    var form = document.getElementById("pv-form");
    var msg = document.getElementById("pv-form-msg");
    if (!form || !window.fetch) return;

    var host = window.location.hostname;
    var crmEndpoint =
      host === "www.9jawealth.com" || host === "9jawealth.com"
        ? "/api/send-report"
        : "https://www.9jawealth.com/api/send-report";

    form.addEventListener("submit", async function (event) {
      event.preventDefault();
      var button = form.querySelector('button[type="submit"]');
      if (!button || button.disabled) return;

      var originalLabel = button.textContent;
      var fields = Object.fromEntries(new FormData(form).entries());
      fields._replyto = fields["Email Address"];
      Object.assign(fields, attribution);

      var phoneValue = String(fields["Phone Number"] || "").trim();
      if (phoneValue && phoneValue.replace(/\D/g, "").length < 7) {
        renderFormStatus(
          msg,
          "error",
          "Please enter a valid Nigerian or international phone number (at least 7 digits), or ",
          "Chat on WhatsApp",
          "."
        );
        var phoneInput = document.getElementById("phone");
        if (phoneInput) phoneInput.focus();
        return;
      }

      var crmPayload = Object.assign(
        {
          type: "property-enquiry",
          source: "PalmVille",
        },
        fields
      );

      button.disabled = true;
      button.textContent = "Sending reservation…";
      renderFormStatus(msg, "sending", "Submitting your plot reservation…", "", "");

      try {
        var accepted = false;
        try {
          var crmRes = await fetchWithTimeout(
            crmEndpoint,
            {
              method: "POST",
              headers: { "Content-Type": "application/json", Accept: "application/json" },
              body: JSON.stringify(crmPayload),
            },
            REQUEST_TIMEOUT_MS
          );
          var crmJson = await crmRes.json().catch(function () {
            return {};
          });
          if (crmRes.ok && (crmJson.ok === true || crmJson.success === true)) {
            accepted = true;
          }
        } catch (_crmErr) {
          // Fall through cleanly to FormSubmit with a fresh AbortController timeout.
        }

        if (!accepted) {
          var response = await fetchWithTimeout(
            form.action.replace("formsubmit.co/", "formsubmit.co/ajax/"),
            {
              method: "POST",
              headers: { "Content-Type": "application/json", Accept: "application/json" },
              body: JSON.stringify(fields),
            },
            REQUEST_TIMEOUT_MS
          );
          var result = await response.json().catch(function () {
            return {};
          });
          if (!response.ok || !(result.success === true || result.success === "true")) {
            throw new Error("Reservation not accepted");
          }
        }

        trackEvent("Lead", {
          content_name: fields["Preferred Land Size"] || "PalmVille Plot Reservation",
        });
        renderFormStatus(
          msg,
          "success",
          "Reservation received! Check your email for confirmation, or ",
          "Chat on WhatsApp",
          "."
        );
        form.reset();
      } catch (_err) {
        renderFormStatus(
          msg,
          "error",
          "Could not submit right now. Please try again or ",
          "Chat on WhatsApp",
          "."
        );
      } finally {
        button.disabled = false;
        button.textContent = originalLabel;
      }
    });
  }

  function initWhatsAppTracking() {
    document.querySelectorAll('a[href*="wa.link"], a[href*="wa.me"]').forEach(function (a) {
      a.addEventListener("click", function () {
        trackEvent("Contact", {
          content_name: a.textContent.trim().slice(0, 80) || "WhatsApp",
        });
      });
    });
  }

  function init() {
    var attribution = getAttribution();
    initMetaPixel();
    initMobileNav();
    initVideoConfig();
    initFaqAccordion();
    initScrollReveal();
    initPlanPreselect();
    initWhatsAppTracking();
    initReservationForm(attribution);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
