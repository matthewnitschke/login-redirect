const iconPath = "../../icons"

var app = new Vue({
    el: '#app',
    data: {
        globalEnabled: true,
        loginRedirects: []
    },
    mounted: function() {
        this.load();
    },
    watch: {
        globalEnabled: function(isEnabled) {
            const iconText = isEnabled ? 'enabled' : 'disabled';
            chrome.browserAction.setIcon({ 
                path: {
                    "16": `${iconPath}/16-${iconText}.png`,
                    "48": `${iconPath}/48-${iconText}.png`,
                   "128": `${iconPath}/128-${iconText}.png` 
                } 
            })
        }
    },
    methods: {
        addLoginRedirect: function() {
            this.loginRedirects.push({
                enabled: true,
            });
            
            this.save();
        },
        removeLoginRedirect: function(item) {
            let index = this.loginRedirects.indexOf(item)
            this.loginRedirects.splice(index, 1)

            this.save();
        },
        save: function() {
            chrome.storage.sync.set({
                globalEnabled: this.globalEnabled,
                loginRedirects: this.loginRedirects
            });
        },
        load: function() {
            chrome.storage.sync.get(['globalEnabled', 'loginRedirects'], ({globalEnabled, loginRedirects}) => {
                this.globalEnabled = globalEnabled ?? this.globalEnabled;
                this.loginRedirects = loginRedirects ?? this.loginRedirects;
            });            
        } 
    }
})