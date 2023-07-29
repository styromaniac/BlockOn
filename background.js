let allowedNetworks = [
    {name: "ZeroNet", pattern: "(http|ws)://(127\\.0\\.0\\.1|localhost):43110/.*"},
    {name: "Yggdrasil", pattern: "http://\\[.*:.*:.*:.*:.*:.*:.*:.*\\].*"},
    {name: "IPFS", pattern: "http://.*\\.(ipfs|ipns)\\.localhost:8080/.*"},
    {name: "Tor", pattern: "https?://.*\\.onion.*"},
    {name: "Lokinet", pattern: "https?://.*\\.loki/.*"},
    {name: "Freenet", pattern: "http://(127\\.0\\.0\\.1|localhost):8888/.*"},
    {name: "Tahoe-LAFS", pattern: "http://localhost:3456/uri/.*"},
    {name: "GNUnet", pattern: "http://localhost:7776/.*"},
    {name: "I2P", pattern: "http://.*\\.i2p/.*"},
    {name: "Clearnet", pattern: ".*"}
];

// Initially, no network is blocked
let blockedNetworks = [];

// Load blocked networks from storage
function loadBlockedNetworks() {
  browser.storage.local.get('blockedNetworks').then(data => {
    if (data.blockedNetworks) {
      blockedNetworks = data.blockedNetworks.map(n => allowedNetworks.find(an => an.name === n));
    }
  });
}

// Save blocked networks to storage
function saveBlockedNetworks() {
  browser.storage.local.set({ blockedNetworks: blockedNetworks.map(n => n.name) });
}

function checkURL(url) {
    let matchedNetworks = [];

    for (let network of allowedNetworks) {
        let regex = new RegExp(network.pattern);
        if (regex.test(url)) {
            matchedNetworks.push(network);
        }
    }

    // If URL matches multiple networks, Clearnet should not be considered
    if (matchedNetworks.length > 1 && matchedNetworks.some(n => n.name === "Clearnet")) {
        matchedNetworks = matchedNetworks.filter(n => n.name !== "Clearnet");
    }

    // If the URL matches a blocked network, block it
    if (matchedNetworks.some(network => blockedNetworks.includes(network))) {
        return true;
    }

    return false;
}

browser.webRequest.onBeforeRequest.addListener(
    (details) => {
        if (checkURL(details.url)) {
            return {cancel: true};
        }
    },
    {urls: ["<all_urls>"]},
    ["blocking"]
);

browser.runtime.onMessage.addListener((message) => {
    if (message.command === "block") {
        blockedNetworks.push(allowedNetworks.find(n => n.name === message.network));
    } else if (message.command === "unblock") {
        blockedNetworks = blockedNetworks.filter(n => n.name !== message.network);
    }
    // Save blocked networks to storage whenever it changes
    saveBlockedNetworks();
});

// Load blocked networks from storage when the extension starts
loadBlockedNetworks();
