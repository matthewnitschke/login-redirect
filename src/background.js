// the list of login redirects, holds what the user configured loginUrls and redirectedUrls
let loginRedirects;

// the user configured setting for whether or not to apply any login redirects
let globalEnabled;

// always updated last url that was loaded. Used to know what the original url (before login redirect) is 
// so we can redirect back to it after website redirect
var lastUrl;

// holds the website to redirect to. When populated, on the next url change, this url will be redirected to.
// When set, this variable variable will be cleared in 3 minutes if the `oldRedirectUrl` is not navigated to.
let urlToRedirectTo;

// holds the url that the website is redirecting us to, but we don't want to actually go to. When the current url
// equals this one, and 'urlToRedirectTo' is not empty, we perform a redirect event
let oldRedirectUrl;


function updateSettings() {
  chrome.storage.sync.get(["globalEnabled", "loginRedirects"], (params) => {
    globalEnabled = params.globalEnabled;

    // only persist the enabled loginRedirects
    loginRedirects = params.loginRedirects.filter(({ enabled }) => enabled);
  });
}
chrome.storage.onChanged.addListener(updateSettings);

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (!globalEnabled) return;
  
  if (changeInfo.url) {
    const currentUrl = changeInfo.url;

    for (var loginRedirect of loginRedirects ?? []) {
      if (loginRedirect.loginUrl == currentUrl) {
        urlToRedirectTo = lastUrl;
        oldRedirectUrl = loginRedirect.redirectedUrl;
        
        setTimeout(() => {
          urlToRedirectTo = null;
        }, 180000); // 3 minutes
      }
    }

    if (currentUrl == oldRedirectUrl && urlToRedirectTo != null) {
      console.log(`Redirecting to ${urlToRedirectTo}`);
      chrome.tabs.update({ url: urlToRedirectTo });
      urlToRedirectTo = null;
    }

    lastUrl = changeInfo.url;
  }
});


// initial settings load
updateSettings();