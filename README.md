
```
*** DEVELOPMENT IN PROGRESS ***
*** Please contact me for bugs ***
```

# Next / React Ethereum Auth Hook

### Implements metamask functions:
1. connect wallet
2. get address
3. change network

### Implements web3-auth function from library
1. get signed token


<br>

## Install

    npm i @marcotommoro/react-ethereum-auth-hook

<br>

## Add to project
1. add **EthereumContextProvider** to `_app.tsx`:
   | param | type | default
   | :---: | :---: | :---: |
   | `autoCheckCorrectNetwork` <br> auto check that the network is always the same as the one specified in the .env (or 0x1 by default) | boolean | true|
   |  |  |


   ```javascript
    import { EthereumContextProvider } from "@marcotommoro/react-ethereum-auth-hook";


    function MyApp({ Component, pageProps }: AppProps) {
        return (
            <EthereumContextProvider autoCheckCorrectNetwork={true}>
              ...
              <Component {...pageProps} />
              ...
            </EthereumContextProvider>
        );
    }

   ```
2. **useEthereum** in a react/next component:
   ```javascript
    const {
        address,
        currentNetwork,
        isMetamaskInstalled,
        isNetworkCorrect,
        connect,
        correctNetwork,
        getToken,
    } = useEthereum();

   ```

3. (optional) set env `NEXT_PUBLIC_NETWORK_ID` with your testnet id. Default Ethereum mainnet `0x1`.<br>
[Check networks id on Metamask documentation](https://docs.metamask.io/guide/ethereum-provider.html#chain-ids)

<br>

## Instructions

| key | value |
|:---: | :---: |
| address | Current metamask address selected. |
| currentNetwork | Current network selected. |
| isMetamaskInstalled | Check if ```window.ehtereum``` is present. |
| isNetworkCorrect | Check if is the correct network. If ```process.env.NEXT_PUBLIC_NETWORK_ID``` is not present, the default network is Ethereum mainnet ('`0x1`') |
| connect | Ask user to connect your beautiful react app with metamask extension. |
| correctNetwork | Ask user permission to switch to the right network. |
| getToken | Ask user to sign a transaction and get a signed token to use in a backend server to validate the user is really him/her/it.|
