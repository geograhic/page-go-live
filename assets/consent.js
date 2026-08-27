/* ============================================================
   Endril Cookie Consent + AdSense loader
   - Shows a consent banner on first visit.
   - Loads Google AdSense (auto ads) ONLY after the user accepts.
   - Stores the choice in localStorage so it is remembered.
   - Provides a floating "Cookie 设置" button to change the choice.
   Publisher ID is defined in ONE place below.
   ============================================================ */
(function () {
  "use strict";

  var PUB_ID = "ca-pub-1315465752673932";
  var STORAGE_KEY = "endril_consent_v1";
  var ADS_SRC =
    "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=" +
    PUB_ID;

  function getConsent() {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch (e) {
      return null;
    }
  }

  function setConsent(value) {
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch (e) {}
  }

  var consent = getConsent(); // "accepted" | "rejected" | null

  function loadAds() {
    if (window.__endrilAdsLoaded) return;
    window.__endrilAdsLoaded = true;

    var s = document.createElement("script");
    s.async = true;
    s.crossOrigin = "anonymous";
    s.src = ADS_SRC;
    s.onload = function () {
      // Enable page-level (auto) ads.
      (window.adsbygoogle = window.adsbygoogle || []).push({
        google_ad_client: PUB_ID,
        enable_page_level_ads: true,
      });
      // Activate any manual ad units that have a real slot configured.
      var units = document.querySelectorAll("ins.adsbygoogle");
      for (var i = 0; i < units.length; i++) {
        var el = units[i];
        var slot = el.getAttribute("data-ad-slot");
        if (slot && slot !== "YOUR_SLOT_ID" && !el.dataset.pushed) {
          el.dataset.pushed = "1";
          (window.adsbygoogle = window.adsbygoogle || []).push({});
        }
      }
    };
    document.head.appendChild(s);
  }

  function removeBanner() {
    var b = document.getElementById("endril-consent");
    if (b) b.parentNode.removeChild(b);
  }

  function showBanner() {
    if (document.getElementById("endril-consent")) return;

    var b = document.createElement("div");
    b.id = "endril-consent";
    b.className = "endril-consent";
    b.setAttribute("role", "dialog");
    b.setAttribute("aria-label", "Cookie 与广告同意");
    b.innerHTML =
      '<div class="ec-text">我们使用 Cookie 与 Google AdSense 为您展示相关广告并分析流量。' +
      '点击「接受」即表示您同意我们按<a href="https://html.endril.com/privacy.html" target="_blank" rel="noopener">隐私政策</a>使用 Cookie 与个性化广告。' +
      "您随时可点击右下角「Cookie 设置」更改选择。</div>" +
      '<div class="ec-actions">' +
      '<button class="ec-more" type="button" data-act="more">了解更多</button>' +
      '<button class="ec-reject" type="button" data-act="reject">拒绝</button>' +
      '<button class="ec-accept" type="button" data-act="accept">接受</button>' +
      "</div>";

    document.body.appendChild(b);

    b.querySelector('[data-act="accept"]').addEventListener(
      "click",
      function () {
        setConsent("accepted");
        removeBanner();
        loadAds();
      }
    );
    b.querySelector('[data-act="reject"]').addEventListener(
      "click",
      function () {
        setConsent("rejected");
        removeBanner();
      }
    );
    b.querySelector('[data-act="more"]').addEventListener("click", function () {
      window.open(
        "https://html.endril.com/privacy.html",
        "_blank",
        "noopener"
      );
    });
  }

  function showSettingsButton() {
    if (document.getElementById("endril-consent-settings")) return;
    var s = document.createElement("button");
    s.id = "endril-consent-settings";
    s.className = "endril-consent-settings";
    s.type = "button";
    s.textContent = "🍪 Cookie 设置";
    s.addEventListener("click", function () {
      setConsent(null);
      removeBanner();
      showBanner();
    });
    document.body.appendChild(s);
  }

  function init() {
    if (consent === "accepted") {
      loadAds();
    } else if (consent === "rejected") {
      // Do not load any ad script.
    } else {
      showBanner();
    }
    // Always allow the user to revisit their choice.
    showSettingsButton();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
