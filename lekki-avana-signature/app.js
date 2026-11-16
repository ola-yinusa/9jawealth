/**
 * Client interactions for Lekki Avana Signature.
 * Kept external so strict Content-Security-Policy (no 'unsafe-inline' scripts) applies cleanly.
 */
(function () {
  "use strict";

  var SIGNATURE_WA_URL = "https://wa.link/6fjyon";
  var PIXEL_ID = "1806933857388333";
  var REQUEST_TIMEOUT_MS = 12000;

  document.documentElement.classList.add("las-js");

  function trackEvent(name, params) {
    try {
      if (typeof window.fbq === "function") {
        window.fbq("track", name, params || {});
      }
    } catch (_err) {
      // Ignore analytics failures when blocked.
    }
  }

  function initMetaPixel() {
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
        // Fail silently when external pixel script cannot load.
      }
    }

    function schedulePixel() {
      window.addEventListener("pointerdown", loadPixel, { once: true, passive: true });
      window.addEventListener("keydown", loadPixel, { once: true });
      window.setTimeout(loadPixel, 8000);
    }

    if (document.readyState === "complete") schedulePixel();
    else window.addEventListener("load", schedulePixel, { once: true });
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
      if (restoreFocus) toggleBtn.focus();
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
      if (window.innerWidth > 960 && !drawer.hidden) {
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
      return { type: "video", embedUrl: parsed.href, openUrl: parsed.href };
    }

    if (host === "drive.google.com" || host.endsWith(".drive.google.com")) {
      var driveMatch = path.match(/\/d\/([a-zA-Z0-9_-]+)/);
      var driveId = (driveMatch && driveMatch[1]) || parsed.searchParams.get("id");
      if (driveId) {
        return {
          type: "iframe",
          embedUrl: "https://drive.google.com/file/d/" + encodeURIComponent(driveId) + "/preview",
          openUrl: "https://drive.google.com/file/d/" + encodeURIComponent(driveId) + "/view",
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
          openUrl: "https://www.youtube.com/watch?v=" + encodeURIComponent(ytId),
        };
      }
    }

    if (host === "vimeo.com" || host.endsWith(".vimeo.com")) {
      var vimeoMatch = path.match(/\/(?:video\/)?(\d+)(?:\/([a-zA-Z0-9]+))?/);
      if (vimeoMatch && vimeoMatch[1]) {
        var vimeoUrl = "https://player.vimeo.com/video/" + encodeURIComponent(vimeoMatch[1]);
        var hash = vimeoMatch[2] || parsed.searchParams.get("h");
        if (hash) vimeoUrl += "?h=" + encodeURIComponent(hash);
        return {
          type: "iframe",
          embedUrl: vimeoUrl,
          openUrl:
            "https://vimeo.com/" +
            encodeURIComponent(vimeoMatch[1]) +
            (hash ? "/" + encodeURIComponent(hash) : ""),
        };
      }
    }

    return { type: "iframe", embedUrl: parsed.href, openUrl: parsed.href };
  }

  function initHeroVideo() {
    var heroMedia = document.getElementById("las-hero-media");
    var heroPoster = document.querySelector("#las-hero-media .video-poster");
    var heroIframe = document.querySelector("#las-hero-media iframe");
    var heroVideo = document.getElementById("las-hero-video");
    var heroBadge = document.querySelector("#las-hero-media .video-badge");
    var heroFallback = document.querySelector("#las-hero-media .video-fallback");
    var fallbackDataSrc = heroIframe ? heroIframe.dataset.src || "" : "";
    var activeMedia = normalizeVideoSource(fallbackDataSrc);

    function applyHeroVideoConfig(config) {
      var rawUrl =
        (config && typeof config.videoUrl === "string" && config.videoUrl.trim()) || fallbackDataSrc;
      var resolved = normalizeVideoSource(rawUrl);
      if (resolved) {
        activeMedia = resolved;
        if (heroIframe) {
          if (resolved.type === "iframe") heroIframe.dataset.src = resolved.embedUrl;
          else heroIframe.removeAttribute("data-src");
        }
        if (heroFallback) heroFallback.href = resolved.openUrl;
      }
      if (heroBadge && config && typeof config.label === "string" && config.label.trim()) {
        heroBadge.textContent = config.label.trim();
      }
    }

    var heroConfigPromise = window.fetch
      ? fetch("./video-config.json", { cache: "no-store" })
          .then(function (res) {
            return res.ok ? res.json() : null;
          })
          .then(function (cfg) {
            if (cfg) applyHeroVideoConfig(cfg);
          })
          .catch(function () {
            // Retain static fallback video configuration.
          })
      : Promise.resolve();

    if (!heroPoster) return;

    heroPoster.addEventListener("click", async function () {
      await heroConfigPromise;
      if (!activeMedia) return;
      if (heroMedia) heroMedia.classList.add("is-playing");
      heroPoster.hidden = true;
      if (activeMedia.type === "video" && heroVideo) {
        if (heroIframe) {
          heroIframe.hidden = true;
          heroIframe.removeAttribute("src");
        }
        heroVideo.src = activeMedia.embedUrl;
        heroVideo.hidden = false;
        heroVideo.play().catch(function () {});
        heroVideo.focus();
      } else if (heroIframe) {
        if (heroVideo) {
          heroVideo.hidden = true;
          heroVideo.removeAttribute("src");
        }
        var playSrc = activeMedia.embedUrl;
        if (
          playSrc.indexOf("youtube.com/embed/") !== -1 ||
          playSrc.indexOf("player.vimeo.com/video/") !== -1
        ) {
          playSrc += (playSrc.indexOf("?") === -1 ? "?" : "&") + "autoplay=1";
        }
        heroIframe.src = playSrc;
        heroIframe.hidden = false;
        heroIframe.setAttribute("tabindex", "-1");
        heroIframe.focus();
      }
      trackEvent("ViewContent", { content_name: "Site overview video" });
    });
  }

  function initCarousel() {
    var track = document.getElementById("las-track");
    var dotsWrap = document.getElementById("las-carousel-dots");
    if (!track) return;

    var slideEls = Array.prototype.slice.call(track.children);
    var slides = slideEls.length;
    var index = 0;
    var autoplayTimer = null;
    var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    var isPaused = reducedMotion.matches;
    var autoplayButton = document.getElementById("las-toggle-autoplay");

    function updateAutoplayButton() {
      if (!autoplayButton) return;
      autoplayButton.textContent = isPaused ? "Play slideshow" : "Pause slideshow";
      autoplayButton.setAttribute("aria-label", autoplayButton.textContent);
    }

    function perView() {
      return window.innerWidth <= 820 ? 1 : 2;
    }

    function maxIndex() {
      return Math.max(0, slides - perView());
    }

    function renderDots() {
      if (!dotsWrap) return;
      var count = maxIndex() + 1;
      if (dotsWrap.children.length !== count) {
        dotsWrap.replaceChildren();
        for (var i = 0; i < count; i += 1) {
          var d = document.createElement("button");
          d.type = "button";
          d.setAttribute("aria-label", "Go to site photo " + (i + 1));
          (function (pos) {
            d.addEventListener("click", function () {
              goTo(pos);
              pauseAutoplay();
            });
          })(i);
          dotsWrap.appendChild(d);
        }
      }
      Array.prototype.forEach.call(dotsWrap.children, function (d, i) {
        d.classList.toggle("is-active", i === index);
        if (i === index) d.setAttribute("aria-current", "true");
        else d.removeAttribute("aria-current");
      });
    }

    function update() {
      if (!slides) return;
      var mi = maxIndex();
      if (index > mi) index = mi;
      var slideEl = track.children[0];
      var slideWidth = slideEl.getBoundingClientRect().width + 24;
      track.style.transform = "translateX(-" + index * slideWidth + "px)";
      var pv = perView();
      slideEls.forEach(function (s, i) {
        s.classList.toggle("is-active", i >= index && i < index + pv);
      });
      renderDots();
    }

    function goTo(i) {
      index = Math.max(0, Math.min(i, maxIndex()));
      update();
    }

    function next() {
      var mi = maxIndex();
      index = index >= mi ? 0 : index + 1;
      update();
    }

    function prev() {
      var mi = maxIndex();
      index = index <= 0 ? mi : index - 1;
      update();
    }

    function startAutoplay() {
      if (slides <= perView() || isPaused || autoplayTimer || document.hidden) return;
      autoplayTimer = window.setInterval(next, 4500);
    }

    function stopAutoplay() {
      if (autoplayTimer) {
        window.clearInterval(autoplayTimer);
        autoplayTimer = null;
      }
    }

    function pauseAutoplay() {
      isPaused = true;
      stopAutoplay();
      updateAutoplayButton();
    }

    var nextBtn = document.getElementById("las-next");
    var prevBtn = document.getElementById("las-prev");
    if (nextBtn) {
      nextBtn.addEventListener("click", function () {
        next();
        pauseAutoplay();
      });
    }
    if (prevBtn) {
      prevBtn.addEventListener("click", function () {
        prev();
        pauseAutoplay();
      });
    }
    if (autoplayButton) {
      autoplayButton.addEventListener("click", function () {
        isPaused = !isPaused;
        updateAutoplayButton();
        if (isPaused) stopAutoplay();
        else startAutoplay();
      });
    }

    window.addEventListener("resize", update);
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) stopAutoplay();
      else startAutoplay();
    });
    if (typeof reducedMotion.addEventListener === "function") {
      reducedMotion.addEventListener("change", function (event) {
        if (event.matches) pauseAutoplay();
      });
    }

    update();
    updateAutoplayButton();
    startAutoplay();

    var carouselEl = document.getElementById("las-carousel");
    if (carouselEl) {
      carouselEl.addEventListener("mouseenter", stopAutoplay);
      carouselEl.addEventListener("mouseleave", startAutoplay);
      carouselEl.addEventListener("touchstart", stopAutoplay, { passive: true });
      carouselEl.addEventListener("focusin", stopAutoplay);
      carouselEl.addEventListener("focusout", startAutoplay);
    }
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
      // Ignore attribution parsing issues.
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
      waLink.href = SIGNATURE_WA_URL;
      waLink.target = "_blank";
      waLink.rel = "noopener noreferrer";
      waLink.textContent = waLinkLabel;
      msgEl.appendChild(waLink);
    }
    if (suffixText) {
      msgEl.appendChild(document.createTextNode(suffixText));
    }
  }

  function initEnquiryForm(attribution) {
    var form = document.getElementById("las-form");
    var msg = document.getElementById("las-form-msg");
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
      fields._replyto = fields.Email;
      Object.assign(fields, attribution);

      var phoneValue = String(fields.Phone || "").trim();
      if (phoneValue && phoneValue.replace(/\D/g, "").length < 7) {
        renderFormStatus(
          msg,
          "error",
          "Please enter a valid Nigerian or international phone number (at least 7 digits), or ",
          "Chat on WhatsApp",
          "."
        );
        var phoneInput = document.getElementById("las-phone");
        if (phoneInput) phoneInput.focus();
        return;
      }

      var crmPayload = Object.assign(
        {
          type: "property-enquiry",
          source: "Lekki Avana Signature",
        },
        fields
      );

      button.disabled = true;
      button.textContent = "Sending enquiry…";
      renderFormStatus(msg, "sending", "Sending your enquiry…", "", "");

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
          // Proceed to FormSubmit fallback with its own independent AbortController timeout.
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
            throw new Error("Enquiry not accepted");
          }
        }

        trackEvent("Lead", { content_name: fields["Plot Size"] || "Plot enquiry" });
        renderFormStatus(
          msg,
          "success",
          "Enquiry received! Check your email for confirmation, or ",
          "Chat on WhatsApp",
          " for an immediate response."
        );
        form.reset();
      } catch (_err) {
        renderFormStatus(
          msg,
          "error",
          "We couldn’t submit your enquiry right now. Please try again or ",
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
    initHeroVideo();
    initWhatsAppTracking();
    initCarousel();
    initEnquiryForm(attribution);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
