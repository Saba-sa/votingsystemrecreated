"use client";
import { useEffect, useState } from "react";
import { useVotingIntegrationstore } from "@/store/Dvotingstore";
import { useRouter } from "next/navigation";
import Loader from "../loader/Page";
export default function page() {
  const [candidateName, setCandidateName] = useState("");
  const [allAdded, setAllAdded] = useState(false);
  const [loadershow, setloadershow] = useState(true);
  const {
    isOwner,
    contract,
    contractWallet,
    isAllCandidatesAdded,
    setisAllCandidatesAdded,
  } = useVotingIntegrationstore();
  const router = useRouter();
  console.log("is all candidate added", isAllCandidatesAdded);

  useEffect(() => {
    if (isAllCandidatesAdded) {
      setloadershow(false);
    } else if (!isOwner) {
      router.push("/castvote");
    }
  }, [isAllCandidatesAdded, isOwner, router]);

  useEffect(() => {
    if (isOwner) {
      setloadershow(false);
    }
  }, [isOwner, contractWallet, contract]);

  const handleAddCandidate = async (event) => {
    event.preventDefault();
    if (contract) {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const accounts = await window.ethereum.request({
        method: "eth_accounts",
      });
      const selectedAddress = accounts[0];
      await contractWallet.methods
        .addCandidate(candidateName.trim())
        .send({ from: selectedAddress, gas: 3000000 });

      setCandidateName("");

      if (allAdded) {
        await contractWallet.methods
          .setAllCandidatesAdded()
          .send({ from: window.ethereum.selectedAddress, gas: 3000000 });

        const allcandidates = await contract.methods
          .allCandidatesadded()
          .call();
        console.log(
          "candidate in candidate addition all setted",
          allcandidates
        );

        setisAllCandidatesAdded(allcandidates);
        router.push("/castvote");
      }
    }
  };

  return (
    <div className="container mx-auto p-6 bg-gray-800 text-white shadow-lg rounded-lg my-8">
      {loadershow ? (
        <Loader />
      ) : (
        <>
          {" "}
          <h1 className="text-3xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-blue-800">
            Add Candidates
          </h1>
          <form onSubmit={handleAddCandidate} className="space-y-6">
            <div>
              <label
                htmlFor="candidate-name"
                className="block text-lg font-medium mb-2 text-green-600"
              >
                Candidate Name
              </label>
              <input
                id="candidate-name"
                type="text"
                value={candidateName}
                onChange={(e) => setCandidateName(e.target.value)}
                className="border border-gray-600 p-2 w-full rounded-lg text-gray-900"
                placeholder="Enter candidate name"
                required
              />
            </div>

            <div className="flex items-center">
              <input
                id="all-added"
                type="checkbox"
                checked={allAdded}
                onChange={(e) => setAllAdded(e.target.checked)}
                className="mr-2 accent-green-800"
              />
              <label htmlFor="all-added" className="text-lg text-blue-600">
                All candidates added
              </label>
            </div>

            <button
              type="submit"
              className="bg-green-400 hover:bg-green-600 text-gray-900 font-semibold py-2 px-4 rounded-lg shadow-md transition duration-300 ease-in-out"
            >
              Add Candidate
            </button>
          </form>
        </>
      )}
    </div>
  );
}
