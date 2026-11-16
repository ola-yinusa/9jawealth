/**
 * Client interactions for the 9jawealth Nigeria Real Estate Investment Guide.
 * Kept external so strict Content-Security-Policy (script-src 'self') applies cleanly.
 */
(function () {
  "use strict";

  function prefersReducedMotion() {
    return (
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
  }

  function initRevealAnimations() {
    var targets = Array.prototype.slice.call(document.querySelectorAll(".fade-up"));
    if (targets.length === 0) return;

    if (prefersReducedMotion() || typeof IntersectionObserver !== "function") {
      targets.forEach(function (el) {
        el.classList.add("visible");
      });
      return;
    }

    document.documentElement.classList.add("js-motion");

    function revealElement(el) {
      el.classList.add("visible");
    }

    function revealVisibleInViewport() {
      var thresholdY = window.innerHeight * 0.96;
      targets.forEach(function (el) {
        if (el.classList.contains("visible")) return;
        var rect = el.getBoundingClientRect();
        if (rect.top <= thresholdY) {
          revealElement(el);
        }
      });
    }

    revealVisibleInViewport();

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            revealElement(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -24px 0px" }
    );

    targets.forEach(function (el) {
      if (!el.classList.contains("visible")) {
        observer.observe(el);
      }
    });

    // Safety fallback so nothing can remain stuck at opacity: 0 on edge viewports.
    window.setTimeout(function () {
      targets.forEach(revealElement);
      observer.disconnect();
    }, 2000);
  }

  function initMobileNav() {
    var toggleBtn = document.getElementById("nav-toggle");
    var drawer = document.getElementById("mobile-drawer");
    var backdrop = document.getElementById("mobile-drawer-backdrop");
    var closeBtn = document.getElementById("nav-close");

    if (!toggleBtn || !drawer || !backdrop || !closeBtn) return;

    var drawerLinks = Array.prototype.slice.call(drawer.querySelectorAll("a"));

    function getFocusableElements() {
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
      if (drawer.hidden) {
        openDrawer();
      } else {
        closeDrawer(true);
      }
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
        var focusable = getFocusableElements();
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
      if (window.innerWidth > 900 && !drawer.hidden) {
        closeDrawer(false);
      }
    });
  }

  function normalizeBracketLabel(raw) {
    if (typeof raw !== "string") return "";
    var trimmed = raw.trim().replace(/\s+/g, " ").slice(0, 60);
    if (!trimmed) return "";

    var lower = trimmed.toLowerCase();
    if (lower === "good shape") return "Good shape";
    if (lower === "on the right track") return "On the right track";
    if (lower === "weak pulse") return "Weak pulse";
    if (lower === "needs attention") return "Needs attention";
    return trimmed;
  }

  function deriveBracketFromQuizAnswers(answers) {
    if (!answers || typeof answers !== "object") return "";
    var gapCount = 0;
    Object.keys(answers).forEach(function (key) {
      var id = Number.parseInt(key, 10);
      var val = answers[key];
      if (id >= 1 && id <= 26 && (val === "NO" || val === "I DON'T KNOW")) {
        gapCount += 1;
      }
    });
    if (gapCount <= 4) return "Good shape";
    if (gapCount <= 10) return "On the right track";
    if (gapCount <= 17) return "Weak pulse";
    return "Needs attention";
  }

  function readStoredQuizContext() {
    var result = { bracket: "", goal: "", recommendedPathId: "" };

    try {
      var rawResult = window.localStorage.getItem("9jawealth-quiz-result-v1");
      if (rawResult) {
        var parsedResult = null;
        try {
          parsedResult = JSON.parse(rawResult);
        } catch (_parseErr) {
          parsedResult = rawResult;
        }
        if (typeof parsedResult === "string") {
          result.bracket = normalizeBracketLabel(parsedResult);
        } else if (parsedResult && typeof parsedResult === "object") {
          if (typeof parsedResult.bracket === "string") {
            result.bracket = normalizeBracketLabel(parsedResult.bracket);
          }
          var rawGoal =
            typeof parsedResult.goal === "string"
              ? parsedResult.goal
              : typeof parsedResult.focusGoal === "string"
                ? parsedResult.focusGoal
                : typeof parsedResult.interest === "string"
                  ? parsedResult.interest
                  : "";
          if (rawGoal && rawGoal.trim().toLowerCase() !== result.bracket.toLowerCase()) {
            result.goal = rawGoal.trim().slice(0, 80);
          }
          if (typeof parsedResult.recommendedPathId === "string") {
            result.recommendedPathId = parsedResult.recommendedPathId.trim().toLowerCase();
          }
        }
      }
    } catch (_storageErr) {
      // Storage blocked or unavailable; continue safely.
    }

    if (!result.bracket && !result.goal) {
      try {
        var rawQuiz = window.localStorage.getItem("9jawealth-quiz-v1");
        if (rawQuiz) {
          var parsedQuiz = JSON.parse(rawQuiz);
          if (
            parsedQuiz &&
            typeof parsedQuiz === "object" &&
            parsedQuiz.isFinished === true &&
            parsedQuiz.answers &&
            typeof parsedQuiz.answers === "object"
          ) {
            result.bracket = deriveBracketFromQuizAnswers(parsedQuiz.answers);
            if (typeof parsedQuiz.answers["31"] === "string") {
              result.goal = parsedQuiz.answers["31"].trim().slice(0, 80);
            }
          }
        }
      } catch (_quizStorageErr) {
        // Ignore unavailable or malformed localStorage data.
      }
    }

    return result;
  }

  function readQuizContext() {
    var stored = readStoredQuizContext();
    var bracket = stored.bracket;
    var goal = stored.goal;
    var recommendedPathId = stored.recommendedPathId || "";

    try {
      var params = new URLSearchParams(window.location.search);
      var paramBracket = params.get("bracket");
      var paramGoal = params.get("goal");
      if (paramBracket && paramBracket.trim()) {
        bracket = normalizeBracketLabel(paramBracket);
      }
      if (paramGoal && paramGoal.trim()) {
        goal = paramGoal.trim().slice(0, 80);
        recommendedPathId = "";
      }
    } catch (_urlErr) {
      // Ignore URL parsing issues.
    }

    return {
      bracket: bracket,
      goal: goal,
      recommendedPathId: recommendedPathId,
    };
  }

  function resolveGoalTarget(goal, recommendedPathId) {
    if (goal) {
      var lower = goal.toLowerCase();

      if (lower.indexOf("agro") !== -1 || lower.indexOf("palm") !== -1) {
        return { card: "palmville", strategy: "PalmVille Agro Real Estate" };
      }
      if (lower.indexOf("land banking") !== -1) {
        return { card: "signature", strategy: "Land Banking" };
      }
      if (lower.indexOf("buy to build") !== -1 || lower.indexOf("build") !== -1) {
        return { card: "signature", strategy: "Buy to Build" };
      }
      if (lower.indexOf("off-plan") !== -1 || lower.indexOf("off plan") !== -1) {
        return { card: "", strategy: "Off-Plan Properties" };
      }
      if (
        lower.indexOf("real estate") !== -1 ||
        lower.indexOf("signature") !== -1 ||
        lower.indexOf("lekki") !== -1
      ) {
        return { card: "signature", strategy: "Lekki Avana Signature" };
      }
    }

    if (recommendedPathId === "palmville") {
      return { card: "palmville", strategy: "PalmVille Agro Real Estate" };
    }
    if (recommendedPathId === "signature") {
      return { card: "signature", strategy: "Lekki Avana Signature" };
    }

    return { card: "", strategy: "" };
  }

  function getBracketAdvice(bracket, goalTarget) {
    var lower = bracket.toLowerCase();
    var isCautiousBracket = lower === "weak pulse" || lower === "needs attention";

    if (lower === "weak pulse") {
      return {
        advice:
          "Your assessment points to cashflow or emergency-reserve pressure. Before stretching for ₦18M+ residential commitments, tighten your 6-month buffer and monthly tracking, or start with a 1-on-1 clarity consultation and lower-commitment entry options.",
        ctaLabel: "Plan a Safe Starting Sequence",
      };
    }

    if (lower === "needs attention") {
      return {
        advice:
          "Several foundational money systems need steadying before locking large sums into multi-million Naira real estate installments. Prioritise rebuilding core savings habits first, then use a 1-on-1 consultation to map a realistic timeline.",
        ctaLabel: "Book a Readiness Consultation",
      };
    }

    if (lower === "on the right track") {
      return {
        advice:
          "You have a working base with room to sharpen follow-through. Match your installment plan (3 to 6 months on PalmVille from ₦2.0M, or 6 to 12 months on Lekki Avana Signature from ₦18M) to comfortable monthly surplus, and verify title and separate infrastructure fees upfront.",
        ctaLabel: "Review Options With Olanrewaju",
      };
    }

    if (lower === "good shape") {
      return {
        advice:
          "Your core financial structure looks steady. Compare Lekki Avana Signature (₦18M to ₦70M residential corridor plots with ₦5M physical allocation) against PalmVille Agro Real Estate (₦2.0M+ per plot, Year 4 to 5 fruiting and Year 6+ projected harvest income) to pick the horizon that suits your portfolio.",
        ctaLabel:
          goalTarget.strategy ? "Discuss " + goalTarget.strategy : "Compare With Olanrewaju",
      };
    }

    return {
      advice:
        "Use your recent assessment perspective alongside the side-by-side matrix below to match entry pricing, title structure, and holding horizon before committing capital.",
      ctaLabel: "Discuss Your Next Step",
    };
  }

  function selectStrategyOption(strategySelect, strategyValue) {
    if (!strategySelect || !strategyValue) return;
    for (var i = 0; i < strategySelect.options.length; i += 1) {
      if (strategySelect.options[i].value === strategyValue) {
        strategySelect.value = strategyValue;
        break;
      }
    }
  }

  function initQuizBridge() {
    var context = readQuizContext();
    var banner = document.getElementById("quiz-context-banner");
    var titleEl = document.getElementById("quiz-context-title");
    var adviceEl = document.getElementById("quiz-context-advice");
    var goalEl = document.getElementById("quiz-context-goal");
    var ctaEl = document.getElementById("quiz-context-cta");
    var bookBanner = document.getElementById("book-quiz-banner");
    var bookSummaryEl = document.getElementById("book-quiz-summary");
    var strategySelect = document.getElementById("consult-strategy");

    var goalTarget = resolveGoalTarget(context.goal, context.recommendedPathId);
    var hasContext = Boolean(context.bracket || goalTarget.card || goalTarget.strategy);

    if (!hasContext) {
      if (banner) banner.hidden = true;
      if (bookBanner) bookBanner.hidden = true;
      return;
    }

    var adviceData = getBracketAdvice(context.bracket, goalTarget);

    if (banner && titleEl && adviceEl) {
      titleEl.textContent = context.bracket
        ? "Assessment Readiness: " + context.bracket
        : "Your Selected Focus: " + (goalTarget.strategy || context.goal);
      adviceEl.textContent = adviceData.advice;

      if (goalEl) {
        if (context.goal && context.goal.toLowerCase() !== context.bracket.toLowerCase()) {
          goalEl.textContent = "30-day focus from your assessment: " + context.goal;
          goalEl.hidden = false;
        } else {
          goalEl.hidden = true;
        }
      }

      if (ctaEl) {
        ctaEl.textContent = adviceData.ctaLabel;
        if (goalTarget.strategy) {
          ctaEl.setAttribute("data-strategy", goalTarget.strategy);
        }
      }

      banner.hidden = false;
    }

    if (bookBanner && bookSummaryEl) {
      var summaryParts = [];
      if (context.bracket) summaryParts.push("Assessment result: " + context.bracket);
      if (context.goal) summaryParts.push("Focus: " + context.goal);
      bookSummaryEl.textContent =
        summaryParts.join(" · ") + ". We will tailor the call to where you stand today.";
      bookBanner.hidden = false;
    }

    var grid = document.getElementById("offerings-grid");
    var sigCard = document.getElementById("offering-signature");
    var sigBadge = document.getElementById("offering-signature-badge");
    var palmCard = document.getElementById("offering-palmville");
    var palmBadge = document.getElementById("offering-palmville-badge");

    if (goalTarget.card === "palmville" && grid && palmCard) {
      if (palmCard.parentNode === grid && grid.firstElementChild !== palmCard) {
        grid.insertBefore(palmCard, grid.firstElementChild);
      }
      palmCard.classList.add("is-highlighted");
      if (palmBadge) palmBadge.hidden = false;
      if (sigCard) sigCard.classList.remove("is-highlighted");
      if (sigBadge) sigBadge.hidden = true;
    } else if (goalTarget.card === "signature" && grid && sigCard) {
      if (sigCard.parentNode === grid && grid.firstElementChild !== sigCard) {
        grid.insertBefore(sigCard, grid.firstElementChild);
      }
      sigCard.classList.add("is-highlighted");
      if (sigBadge) sigBadge.hidden = false;
      if (palmCard) palmCard.classList.remove("is-highlighted");
      if (palmBadge) palmBadge.hidden = true;
    }

    if (goalTarget.strategy && strategySelect) {
      selectStrategyOption(strategySelect, goalTarget.strategy);
    }
  }

  function initStrategyLinks() {
    var strategySelect = document.getElementById("consult-strategy");
    var form = document.getElementById("consult-form");
    var successPanel = document.getElementById("consult-success");
    if (!strategySelect) return;

    var triggers = document.querySelectorAll("[data-strategy]");
    triggers.forEach(function (trigger) {
      trigger.addEventListener("click", function () {
        var strategy = trigger.getAttribute("data-strategy");
        if (!strategy) return;

        selectStrategyOption(strategySelect, strategy);

        if (form && successPanel && !successPanel.hidden) {
          successPanel.hidden = true;
          form.hidden = false;
        }
      });
    });
  }

  function getTrafficSource() {
    try {
      var params = new URLSearchParams(window.location.search);
      var parts = [];
      ["utm_source", "utm_medium", "utm_campaign", "ref"].forEach(function (key) {
        var val = params.get(key);
        if (val) parts.push(key + "=" + val);
      });
      if (parts.length > 0) {
        return (window.location.pathname + "?" + parts.join("&")).slice(0, 240);
      }
      if (document.referrer) {
        return (window.location.pathname + " | ref:" + document.referrer).slice(0, 240);
      }
      return window.location.pathname || "/education";
    } catch (_err) {
      return "/education";
    }
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
  }

  function focusSafely(target) {
    if (!target || typeof target.focus !== "function") return;
    try {
      target.focus({ preventScroll: true });
    } catch (_err) {
      target.focus();
    }
  }

  function scrollErrorIntoViewOnMobile(errorBox) {
    if (!errorBox || typeof errorBox.scrollIntoView !== "function") return;
    var rect = errorBox.getBoundingClientRect();
    var isOutOfView = rect.top < 80 || rect.bottom > window.innerHeight - 16;
    if (window.innerWidth <= 900 || isOutOfView) {
      errorBox.scrollIntoView({
        behavior: prefersReducedMotion() ? "auto" : "smooth",
        block: "nearest",
      });
    }
  }

  function initConsultationForm() {
    var form = document.getElementById("consult-form");
    if (!form) return;

    var nameInput = document.getElementById("consult-name");
    var emailInput = document.getElementById("consult-email");
    var phoneInput = document.getElementById("consult-phone");
    var strategySelect = document.getElementById("consult-strategy");
    var timeSelect = document.getElementById("consult-time");
    var notesInput = document.getElementById("consult-notes");
    var honeyInput = document.getElementById("consult-honey");

    var errorBox = document.getElementById("consult-error");
    var errorText = document.getElementById("consult-error-text");
    var submitBtn = document.getElementById("consult-submit");
    var submitLabel = document.getElementById("consult-submit-label");
    var successPanel = document.getElementById("consult-success");
    var successName = document.getElementById("consult-success-name");
    var successStrategy = document.getElementById("consult-success-strategy");
    var successTime = document.getElementById("consult-success-time");
    var successRef = document.getElementById("consult-success-ref");
    var resetBtn = document.getElementById("consult-reset");

    var defaultLabel = submitLabel ? submitLabel.textContent : "Request 1-on-1 Consultation";

    function showError(message, focusTarget) {
      if (errorText) {
        errorText.textContent = message;
      }
      if (errorBox) {
        errorBox.hidden = false;
        scrollErrorIntoViewOnMobile(errorBox);
      }
      focusSafely(focusTarget);
    }

    function clearError() {
      if (errorBox) {
        errorBox.hidden = true;
      }
      if (errorText) {
        errorText.textContent = "";
      }
    }

    function setLoading(isLoading) {
      if (!submitBtn) return;
      submitBtn.disabled = isLoading;
      submitBtn.setAttribute("aria-busy", isLoading ? "true" : "false");
      if (submitLabel) {
        submitLabel.textContent = isLoading ? "Sending Request..." : defaultLabel;
      }
    }

    function showSuccess(name, strategy, preferredTime, reference) {
      if (successName) successName.textContent = name;
      if (successStrategy) successStrategy.textContent = strategy || "General Real Estate Strategy";
      if (successTime) successTime.textContent = preferredTime || "Flexible WAT window";
      if (successRef) {
        successRef.textContent = reference || "Confirmed";
      }
      form.hidden = true;
      if (successPanel) {
        successPanel.hidden = false;
        successPanel.focus();
      }
    }

    form.addEventListener("submit", async function (event) {
      event.preventDefault();
      clearError();

      var name = nameInput ? nameInput.value.trim().replace(/\s+/g, " ") : "";
      var email = emailInput ? emailInput.value.trim().toLowerCase() : "";
      var phone = phoneInput ? phoneInput.value.trim() : "";
      var strategy = strategySelect ? strategySelect.value.trim() : "";
      var preferredTime = timeSelect ? timeSelect.value.trim() : "";
      var notes = notesInput ? notesInput.value.trim() : "";
      var honey = honeyInput ? honeyInput.value.trim() : "";

      if (honey !== "") {
        showSuccess(name || "Guest", strategy, preferredTime, "RECEIVED");
        return;
      }

      if (name.length < 2) {
        showError(
          "Please enter your full name (at least 2 characters).",
          nameInput
        );
        return;
      }

      if (!isValidEmail(email)) {
        showError(
          "Please enter a valid email address so we can send your confirmation.",
          emailInput
        );
        return;
      }

      if (phone) {
        var digits = phone.replace(/\D/g, "");
        if (digits.length < 7) {
          showError(
            "Please enter a valid WhatsApp or phone number (at least 7 digits), or leave it blank.",
            phoneInput
          );
          return;
        }
      }

      setLoading(true);

      var controller = typeof AbortController === "function" ? new AbortController() : null;
      var timeoutId = controller
        ? window.setTimeout(function () {
            controller.abort();
          }, 15000)
        : null;

      try {
        var fetchOptions = {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            type: "consultation-booking",
            source: "Investment Guide Consultation",
            name: name,
            email: email,
            phone: phone,
            plotSize: strategy || "General Real Estate Strategy",
            preferredTime: preferredTime,
            message: notes,
            trafficSource: getTrafficSource(),
            _honey: honey,
          }),
        };

        if (controller) {
          fetchOptions.signal = controller.signal;
        }

        var response = await fetch("/api/send-report", fetchOptions);

        var data = await response.json().catch(function () {
          return {};
        });

        if (!response.ok || (data && data.ok === false)) {
          var serverMsg =
            (data && typeof data.error === "string" && data.error) ||
            "Unable to submit your request right now. Please try again or use WhatsApp below.";
          showError(serverMsg);
          return;
        }

        form.reset();
        showSuccess(
          name,
          strategy,
          preferredTime,
          data && data.reference ? String(data.reference) : ""
        );
      } catch (err) {
        if (err && err.name === "AbortError") {
          showError(
            "Your request timed out after 15 seconds. Please try again or continue directly on WhatsApp below."
          );
        } else {
          showError(
            "Network error while submitting your request. Please check your connection or message Olanrewaju on WhatsApp below."
          );
        }
      } finally {
        if (timeoutId !== null) {
          window.clearTimeout(timeoutId);
        }
        setLoading(false);
      }
    });

    if (resetBtn) {
      resetBtn.addEventListener("click", function () {
        clearError();
        if (successPanel) successPanel.hidden = true;
        form.hidden = false;
        if (nameInput) nameInput.focus();
      });
    }
  }

  function isValidBookingCalendarUrl(value) {
    if (typeof value !== "string") return false;
    var trimmed = value.trim();
    if (!trimmed) return false;

    try {
      var parsed = new URL(trimmed);
      if (parsed.protocol !== "https:") return false;

      var host = parsed.hostname.toLowerCase();
      var normalizedPath = parsed.pathname.replace(/\/+$/, "");

      if (host === "calendar.app.google") {
        return /^\/[A-Za-z0-9_-]+$/.test(normalizedPath);
      }

      if (host === "calendar.larksuite.com" || host === "applink.larksuite.com" || host.endsWith(".larksuite.com") || host === "larksuite.com") {
        return normalizedPath.length > 1;
      }

      if (host !== "calendar.google.com") return false;
      if (!normalizedPath || normalizedPath === "/") return false;

      // Reject bare Google Calendar appointments placeholder paths
      if (/\/appointments\/schedules$/i.test(normalizedPath)) return false;
      if (/\/appointments$/i.test(normalizedPath)) return false;

      // Must contain a specific schedule path segment or selfsched query params
      if (/\/appointments\/schedules\/[^/]+/i.test(normalizedPath)) return true;
      if (normalizedPath.indexOf("/calendar/") === 0 && parsed.search.length > 1) return true;

      return false;
    } catch (_err) {
      return false;
    }
  }

  function initOptionalBookingCalendar() {
    var calendarBtn = document.getElementById("calendar-slot-btn");
    if (!calendarBtn) return;

    fetch("/media-config.json", {
      method: "GET",
      cache: "no-store",
      headers: { Accept: "application/json" },
    })
      .then(function (response) {
        if (!response.ok) return null;
        return response.json();
      })
      .then(function (config) {
        if (!config || typeof config !== "object") return;
        if (isValidBookingCalendarUrl(config.bookingCalendarUrl)) {
          var targetUrl = config.bookingCalendarUrl.trim();
          calendarBtn.href = targetUrl;
          if (targetUrl.indexOf("larksuite.com") !== -1 || targetUrl.indexOf("lark.com") !== -1) {
            calendarBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> Book Instant Slot on Lark Calendar';
          }
          calendarBtn.hidden = false;
        }
      })
      .catch(function () {
        // media-config.json is optional; fail silently when absent or invalid.
      });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initRevealAnimations();
    initMobileNav();
    initQuizBridge();
    initStrategyLinks();
    initConsultationForm();
    initOptionalBookingCalendar();
  });
})();
