/* The one place the primary call to action is configured. Every
   <a data-cta> slot on every /next/ page reads this, so they change together.

   mode "testflight"  - slots link to testflightUrl (the public beta).
   mode "coming-soon" - slots become a non-link "Coming soon" badge. Use this
                        if the beta closes or the link breaks, so the site
                        never ships a dead link.

   Without JS a slot keeps the link written in its HTML. scripts/check-site.py
   fails any /next/ page whose data-cta href differs from testflightUrl, so
   after changing the URL, update those hrefs too (the checker lists them).
   At launch the App Store URL replaces testflightUrl the same way. */
window.PreflopConfig = Object.freeze({
  cta: Object.freeze({
    mode: "testflight",
    testflightUrl: "https://testflight.apple.com/join/ayujQfvg"
  })
});
