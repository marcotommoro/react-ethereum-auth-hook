import { providers } from 'ethers';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { sign } from 'web3-token';
import {
  changeNetworkIfNeeded,
  checkNetwork,
  connectMetamask,
  getTokenFromLocalStorage,
  setTokenInLocalStorage,
} from './utils';

type InitialValues = {
  address: string;
  isMetamaskInstalled: boolean;
  isNetworkCorrect: boolean;
  currentNetwork: string;
  connect: () => Promise<void>;
  getToken: () => Promise<string | undefined>;
  correctNetwork: () => Promise<void>;
};

const EthereumContext = createContext<InitialValues>({
  address: '',
  isMetamaskInstalled: false,
  isNetworkCorrect: false,
  currentNetwork: '',
  connect(): Promise<void> {
    throw new Error('connectMetamask is not implemented');
  },
  getToken(): Promise<string | undefined> {
    throw new Error('getToken is not implemented');
  },
  correctNetwork(): Promise<void> {
    throw new Error('correctNetwork is not implemented');
  },
});

type Props = {
  children: React.ReactNode;
  autoCheckCorrectNetwork?: boolean;
};

declare let window: any;

export const EthereumContextProvider = ({
  children,
  autoCheckCorrectNetwork = true,
}: Props) => {
  const [ethereum, setEthereum] = useState<any>(null);
  const [address, setAddress] = useState<string>('');
  const [isNetworkCorrect, setIsNetworkCorrect] = useState<boolean>(false);
  const [isMetamaskInstalled, setIsMetamaskInstalled] = useState<boolean>(
    false
  );
  const [currentNetwork, setCurrentNetwork] = useState<string>('');

  const connect = useCallback(async () => {
    if (!isMetamaskInstalled) return;

    const addr = await connectMetamask(ethereum);
    await changeNetworkIfNeeded(ethereum);
    setAddress(addr);
    setIsNetworkCorrect(true);
  }, [ethereum, isMetamaskInstalled]);

  const getToken = useCallback(async () => {
    if (!ethereum) {
      return;
    }

    const _token = getTokenFromLocalStorage();
    if (_token) return _token;

    const provider = new providers.Web3Provider(ethereum);
    const signer = provider.getSigner();

    const token = await sign(async msg => await signer.signMessage(msg), '1d');

    setTokenInLocalStorage(token);

    return token;
  }, [ethereum]);

  const correctNetwork = useCallback(async () => {
    await changeNetworkIfNeeded(ethereum);
  }, [ethereum]);

  useEffect(() => {
    try {
      if (!window.ethereum) return;

      setIsMetamaskInstalled(true);
      setEthereum(window.ethereum);

      window.ethereum.on('accountsChanged', (accounts: any) => {
        setAddress(accounts[0]);
      });

      window.ethereum.on('chainChanged', async (chainId: any) => {
        setCurrentNetwork(chainId);
        if (!autoCheckCorrectNetwork) return;

        try {
          const isCorrect = checkNetwork(chainId);
          setIsNetworkCorrect(isCorrect);
          setCurrentNetwork(chainId);
        } catch (error) {
          setAddress('');
          setIsNetworkCorrect(false);
          setCurrentNetwork(chainId);
        }
      });

      window.ethereum.on('disconnect', async (_: any) => {
        setAddress('');
        setIsNetworkCorrect(false);
        setCurrentNetwork('');
      });
    } catch (error) {
      console.log(error);
    }
  }, [ethereum]);

  const contextValues = useMemo(
    () => ({
      address,
      isMetamaskInstalled,
      isNetworkCorrect,
      connect,
      getToken,
      correctNetwork,
      currentNetwork,
    }),
    [
      address,
      isMetamaskInstalled,
      connect,
      isNetworkCorrect,
      getToken,
      correctNetwork,
      currentNetwork,
    ]
  );

  return (
    <EthereumContext.Provider value={contextValues}>
      {children}
    </EthereumContext.Provider>
  );
};

export const useEthereum = () => useContext(EthereumContext);
