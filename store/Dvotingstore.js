"use client";
import React, { useEffect, useState, createContext, useContext } from "react";
import Web3 from "web3";
import HandleVote from "../out/VotingSystem.sol/HandleVote.json";

const VotingIntegrationstore = createContext();

const Votestore = ({ children }) => {
  const [contract, setContract] = useState(null);
  const [contractWallet, setcontractWallet] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [connectedWallet, setconnectedWallet] = useState("");

  useEffect(() => {
    const reconnectWallet = async () => {
      if (typeof window !== "undefined" && window.ethereum) {
        const accounts = await window.ethereum.request({
          method: "eth_accounts",
        });
        if (accounts.length > 0) {
          setconnectedWallet(accounts[0]);
        }
      }
    };

    reconnectWallet();
  }, []);

  useEffect(() => {
    if (connectedWallet) {
      getContractDetails();
    }
  }, [connectedWallet]);

  const getContractDetails = async () => {
    if (connectedWallet) {
      try {
        const web3Instance = new Web3(window.ethereum);
        const web3InstanceALchemy = new Web3(
          "https://eth-sepolia.g.alchemy.com/v2/CB6IJpmJWTUzOlLA-w5CTTVg6AYdE-dJ"
        );
        // const web3Wallet = new Web3(window.ethereum);
        const { abi, networks } = HandleVote;
        // const networkData = networks["local"];
        const networkData = networks["11155111"];
        const contractAddress = networkData?.address;
        if (contractAddress) {
          const contractInstance = new web3InstanceALchemy.eth.Contract(
            abi,
            contractAddress
          );
          const contractInstance2 = new web3Instance.eth.Contract(
            abi,
            contractAddress
          );
          setcontractWallet(contractInstance2);
          setContract(contractInstance);

          console.log("before");
          const ownerAddress = await contractInstance.methods.owner().call();
          console.log("owner address", ownerAddress);
          const accounts = await web3Instance.eth.getAccounts();
          const currentAccount = accounts[0];

          setIsOwner(
            currentAccount.toLowerCase() === ownerAddress.toLowerCase()
          );
        }
      } catch (error) {
        console.error("Error initializing contract:", error);
      }
    }
  };

  return (
    <VotingIntegrationstore.Provider
      value={{
        contract,
        setContract,
        isOwner,
        setIsOwner,
        connectedWallet,
        setconnectedWallet,
        contractWallet,
        setcontractWallet,
      }}
    >
      {children}
    </VotingIntegrationstore.Provider>
  );
};

const useVotingIntegrationstore = () => {
  return useContext(VotingIntegrationstore);
};

export { Votestore, useVotingIntegrationstore };
