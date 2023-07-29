document.addEventListener("DOMContentLoaded", () => {
  let allowedNetworks = [
    "ZeroNet", "Yggdrasil", "IPFS", "Tor", 
    "Lokinet", "Freenet", "Tahoe-LAFS", "GNUnet", "I2P", "Clearnet"
  ];
  let form = document.getElementById("network-form");

  // Load and apply checkbox states from storage
  function loadCheckboxStates() {
    browser.storage.local.get('blockedNetworks').then(data => {
      allowedNetworks.forEach(network => {
        let checkbox = document.getElementById(network);
        if (data.blockedNetworks) {
          checkbox.checked = !data.blockedNetworks.includes(network);
        } else {
          checkbox.checked = true;
        }
      });
    });
  }

  allowedNetworks.forEach((network) => {
    let checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.name = network;
    checkbox.value = network;
    checkbox.id = network;

    let label = document.createElement("label");
    label.htmlFor = network;
    label.appendChild(document.createTextNode(network));

    form.appendChild(checkbox);
    form.appendChild(label);
    form.appendChild(document.createElement("br"));

    checkbox.addEventListener("change", (event) => {
      if (event.currentTarget.checked) {
        browser.runtime.sendMessage({command: "unblock", network: network});
      } else {
        browser.runtime.sendMessage({command: "block", network: network});
      }
    });
  });

  // Load checkbox states when the popup opens
  loadCheckboxStates();
});
