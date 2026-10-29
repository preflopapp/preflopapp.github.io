/* The one place the primary call to action is configured. Every
   <a data-cta> slot on every /next/ page reads this, so they change together.

   mode "testflight"  - slots link to testflightUrl (the public beta).
   mode "coming-soon" - slots become a non-link "Coming soon" badge. Use this
                        if the beta closes or the link breaks, so the site
                        never ships a dead link.

   Without JS a slot keeps the link and text written in its HTML.
   scripts/check-site.py fails any page whose a[data-cta] href differs from
   testflightUrl or whose text differs from label, so after changing either,
   update the HTML too (the checker lists every slot). At launch the App
   Store URL replaces testflightUrl the same way. */
window.PreflopConfig = Object.freeze({
  cta: Object.freeze({
    mode: "testflight",
    testflightUrl: "https://testflight.apple.com/join/ayujQfvg",
    label: "Join the beta"
  })
});
