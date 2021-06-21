var lastUrl;
let urlToRedirectTo;

let oldRedirectUrl;

let loginRedirects;
let globalEnabled;
chrome.storage.sync.get(["globalEnabled", "loginRedirects"], (params) => {
  loginRedirects = params.loginRedirects;
  globalEnabled = params.globalEnabled;
});

chrome.storage.onChanged.addListener(function (changes, area) {
  if (
    changes.options.containsKey("loginRedirects") ||
    changes.containsKey("globalEnabled")
  ) {
    loginRedirects = changes?.options?.loginRedirects ?? loginRedirects;
    globalEnabled = changes?.options?.globalEnabled ?? globalEnabled;

    console.log(loginRedirects);
  }
});

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (!globalEnabled) return;
  
  if (changeInfo.url) {
    const currentUrl = changeInfo.url;

    for (var loginRedirect of loginRedirects ?? []) {
      if (loginRedirect.loginUrl == currentUrl) {
        console.log(`login page found, storing ${lastUrl} to redirect to`);
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
