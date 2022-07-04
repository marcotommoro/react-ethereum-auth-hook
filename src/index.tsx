import { providers } from 'ethers';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { toast } from 'react-toastify';
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
  connect: () => Promise<void>;
  getToken: () => Promise<string | undefined>;
  correctNetwork: () => Promise<void>;
};

const EthereumContext = createContext<InitialValues>({
  address: '',
  isMetamaskInstalled: false,
  isNetworkCorrect: false,
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
  useDefaultToastAlert: boolean;
};

declare let window: any;

export const EthereumContextProvider = ({
  children,
  useDefaultToastAlert = false,
}: Props) => {
  const [ethereum, setEthereum] = useState<any>(null);
  const [address, setAddress] = useState<string>('');
  const [isNetworkCorrect, setIsNetworkCorrect] = useState<boolean>(false);
  const [isMetamaskInstalled, setIsMetamaskInstalled] = useState<boolean>(
    false
  );

  const connect = useCallback(async () => {
    try {
      if (!isMetamaskInstalled) return;

      const addr = await connectMetamask(ethereum);
      await changeNetworkIfNeeded(ethereum);
      setAddress(addr);
      setIsNetworkCorrect(true);
    } catch (error) {
      console.log(error);
    }
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
    try {
      await changeNetworkIfNeeded(ethereum);
    } catch (error) {}
  }, [ethereum]);

  useEffect(() => {
    if (!window.ethereum) return;

    setIsMetamaskInstalled(true);
    setEthereum(window.ethereum);

    window.ethereum.on('accountsChanged', (accounts: any) => {
      if (useDefaultToastAlert && accounts.length !== 0 && address.length !== 0)
        toast.warn('Changed Account!', { toastId: 'changed-account' });
      setAddress(accounts[0]);
    });

    window.ethereum.on('chainChanged', async (chainId: any) => {
      try {
        const isCorrect = checkNetwork(chainId);
        setIsNetworkCorrect(isCorrect);

        if (useDefaultToastAlert && !isCorrect)
          toast.warn('Changed network!', { toastId: 'changed-network' });
      } catch (error) {
        setAddress('');
        setIsNetworkCorrect(false);
      }
    });

    window.ethereum.on('disconnect', async (error: any) => {
      setAddress('');
      setIsNetworkCorrect(false);
      console.log('disconnect', error);
    });
  }, [ethereum]);

  const contextValues = useMemo(
    () => ({
      address,
      isMetamaskInstalled,
      isNetworkCorrect,
      connect,
      getToken,
      correctNetwork,
    }),
    [
      address,
      isMetamaskInstalled,
      connect,
      isNetworkCorrect,
      getToken,
      correctNetwork,
    ]
  );

  return (
    <EthereumContext.Provider value={contextValues}>
      {children}
    </EthereumContext.Provider>
  );
};

export const useEthereum = () => useContext(EthereumContext);
