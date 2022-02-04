import React, { createContext, useEffect, useState } from "react";
import { ethers } from "ethers";

import { contractABI, contractAddress } from "../utils/constants";

const TransactionContext = createContext("");
export default TransactionContext;

const { ethereum } = window;

const getEthereumContract = () => {
  const provider = new ethers.providers.Web3Provider(ethereum);
  const signer = provider.getSigner();
  const transationContract = new ethers.Contract(
    contractAddress,
    contractABI,
    signer
  );
  return transationContract;
};

export const TransactionProvider = ({ children }) => {
  let [currentAccount, setCurrentAccount] = useState("");

  let [formData, setFormData] = useState({
    addressTo: "",
    amount: "",
    keyword: "",
    message: "",
  });

  let [isLoading, setIsLoading] = useState(false);

  let [transactionCount, setTransactionCount] = useState(
    localStorage.getItem("transactionCount")
  );

  let [transactions, setTransactions] = useState([]);

  let handleChange = (e, name) => {
    setFormData((prevState) => ({ ...prevState, [name]: e.target.value }));
  };

  const getAllTransactions = async () => {
    try {
      if (!ethereum) return alert("Please install metamask");

      const transactionContract = getEthereumContract();
      console.log(
        "transactionContract in getAllTransactions",
        transactionContract
      );
      const availableTransactions =
        await transactionContract.getAllTransactions();

      console.log("availableTransactions", availableTransactions);

      const structuredTransactions = availableTransactions.map(
        (transaction) => ({
          addressTo: transaction.receiver,
          addressFrom: transaction.sender,
          timestamp: new Date(
            transaction.timestamp.toNumber() * 1000
          ).toLocaleString(),
          message: transaction.message,
          keyword: transaction.keyword,
          amount: parseInt(transaction.amount._hex) / 10 ** 18,
        })
      );

      setTransactions(structuredTransactions);
    } catch (error) {
      console.log(error);
    }
  };

  const checkIfWalletIsConnected = async () => {
    try {
      if (!ethereum) return alert("Please install metamask");

      const accounts = await ethereum.request({ method: "eth_accounts" });

      if (accounts.length) {
        setCurrentAccount(accounts[0]);
        console.log(accounts);

        getAllTransactions();
      } else {
        console.log("No accounts found");
      }
    } catch (error) {
      console.log(error);
      // throw new Error("No ethereum object");
    }
  };

  const checkIfTransactionsExist = async () => {
    try {
      const transactionContract = getEthereumContract();
      console.log(
        "transactionContract in checkIfTransactionsExist",
        transactionContract
      );
      const currentTransactionCount =
        await transactionContract.getTransactionCount();
      console.log("currentTransactionCount", currentTransactionCount);
      window.localStorage.setItem("transactionCount", currentTransactionCount);
    } catch (error) {
      console.log(error);
      // throw new Error("No ethereum object");
    }
  };

  let connectWallet = async () => {
    try {
      if (!ethereum) return alert("Please install metamask");

      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
      // throw new Error("No ethereum object");
    }
  };

  let sendTransaction = async () => {
    try {
      if (!ethereum) return alert("Please install metamask");

      const { addressTo, amount, keyword, message } = formData;
      const transactionContract = getEthereumContract();
      const parsedAmount = ethers.utils.parseEther(amount);

      await ethereum.request({
        method: "eth_sendTransaction",
        params: [
          {
            from: currentAccount,
            to: addressTo,
            gas: "0x5208", //21000 GWEI
            value: parsedAmount._hex,
          },
        ],
      });

      console.log("after request method..........");

      const transactionHash = await transactionContract.addToBlockchain(
        addressTo,
        parsedAmount,
        message,
        keyword
      );

      console.log("after addToBlockchain method..........");

      setIsLoading(true);
      console.log(`Loading - ${transactionHash.hash}`);
      await transactionHash.wait();
      console.log(`Success - ${transactionHash.hash}`);
      setIsLoading(false);

      const transactionCount = await transactionContract.getTransactionCount();
      setTransactionCount(transactionCount.toNumber());

      window.location.reload();
    } catch (error) {
      console.log(error);

      // throw new Error("No ethereum object");
    }
  };

  let contextData = {
    transactionCount: transactionCount,
    connectWallet: connectWallet,
    transactions: transactions,
    currentAccount: currentAccount,
    isLoading: isLoading,
    sendTransaction: sendTransaction,
    handleChange: handleChange,
    formData: formData,
  };

  useEffect(() => {
    checkIfWalletIsConnected();
    checkIfTransactionsExist();
  }, [transactionCount]);

  return (
    <TransactionContext.Provider value={contextData}>
      {children}
    </TransactionContext.Provider>
  );
};
