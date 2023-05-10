import { defineStore } from "pinia";
import { Contract, toAe, Encoded, Tag } from "@aeternity/aepp-sdk";
import { Ref, ref } from "vue";
import { useSdkStore } from "./sdkStore";
import {
  argsStringToArgs,
  defaultCallOptions,
  exampleContractCode,
  getContract,
  persistContract,
  Result,
} from "../utils/utils";
import "../utils/toJsonExtensions";

export const useContractStore = defineStore("contract", () => {
  const compileData: Ref<{ contractCode: string }> = ref({
    contractCode: structuredClone(exampleContractCode),
  });
  const compileResult: Ref<Result<{ aci: string; byteCode?: string }>> = ref(
    new Result()
  );

  const deployData: Ref<{
    args: string;
    options: {
      amount: number;
      callData: string;
      fee: null;
      gas: null;
      gasPrice: number;
    };
  }> = ref({
    args: "",
    options: structuredClone(defaultCallOptions),
  });
  const deployResult: Ref<Result<string>> = ref(new Result());

  const callStaticData: Ref<{ args: string; func: string; gas: number }> = ref({
    func: "example",
    gas: 1000000,
    args: "",
  });
  const callStaticResult: Ref<Result<string>> = ref(new Result());

  const callData: Ref<{
    args: string;
    func: string;
    options: {
      amount: number;
      callData: string;
      fee: null;
      gas: null;
      gasPrice: number;
    };
  }> = ref({
    func: "example",
    args: "",
    options: structuredClone(defaultCallOptions),
  });
  const callResult: Ref<Result<string>> = ref(new Result());

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let contractInstance: Contract<any> | undefined = undefined;

  const sdkStore = useSdkStore();

  async function compileContractFromSource() {
    compileResult.value.setInfo("Compiling contract source");
    resetDeployAndCallData();

    await sdkStore.aeSdk?.compilerApi
      .compileBySourceCode(compileData.value.contractCode)
      .then((result) => {
        compileResult.value.setFinal("Compiled from source", {
          aci: JSON.stringify(result?.aci, null, 2),
          byteCode: result.bytecode,
        });

        persistContract(
          compileData.value.contractCode,
          compileResult.value.data?.aci || "",
          deployResult.value.data
        );
      })
      .catch((error) => {
        if (error instanceof Error)
          compileResult.value.setError(
            error.message.replaceAll("compile error:\n", "")
          );
        return undefined;
      });
  }

  async function initializeContractFromAci(
    contractAddress: string,
    aci: string
  ) {
    resetDeployAndCallData();
    deployResult.value.setInfo("Instantiating Contract at address ...");

    await sdkStore.aeSdk
      ?.initializeContract({
        ...{ aci: JSON.parse(aci) },
        address: contractAddress as Encoded.ContractAddress,
      })
      .then((instance) => {
        contractInstance = instance;
        compileResult.value.setFinal(`Initialized from ACI`, {
          aci,
          byteCode: "calling at address doesn't need bytecode",
        });
        deployResult.value.setFinal(
          `Instantiated Contract at address: ${contractAddress}`,
          contractAddress
        );
        persistContract(
          compileData.value.contractCode,
          compileResult.value.data?.aci || "",
          deployResult.value.data
        );
      })
      .catch((error) => {
        if (error instanceof Error) deployResult.value.setError(error.message);
        return undefined;
      });
  }

  async function deployContract() {
    resetDeployAndCallData(false);
    deployResult.value.setInfo("Deploying Contract ...");
    const args = argsStringToArgs(deployData.value.args);

    contractInstance = await sdkStore.aeSdk?.initializeContract({
      sourceCode: compileData.value.contractCode,
    });

    const options = Object.fromEntries(
      Object.entries(deployData.value.options).filter(([, v]) => v != null)
    );

    contractInstance
      ?.$deploy(args, options)
      .then((deployed) => {
        deployResult.value.setFinal(
          `Deployed, and mined at this address: ${deployed.result?.contractId}`,
          deployed.result?.contractId
        );
        persistContract(
          compileData.value.contractCode,
          compileResult.value.data?.aci || "",
          deployed?.result?.contractId
        );
      })
      .catch((error) => {
        if (error instanceof Error) deployResult.value.setError(error.message);
      });
  }

  async function callContractStatic() {
    callStaticResult.value.setInfo("Dry-Running ...");
    const args = argsStringToArgs(callStaticData.value.args);
    const options = { callStatic: true, gas: callStaticData.value.gas };

    contractInstance
      ?.$call(callStaticData.value.func, args, options)
      .then((result) => {
        if (result.tx.tag !== Tag.ContractCallTx) throw new Error('Unexpected transaction');
        callStaticResult.value.setFinal(
          `Dry-Run Gas Estimate: ${
            result?.result?.gasUsed
          }, Fee Estimate: ${toAe(result.tx.fee)} ae (${result.tx.fee} aetto)`,
          JSON.stringify(result?.decodedResult)
        );
      })
      .catch((error) => {
        if (error instanceof Error)
          callStaticResult.value.setError(error.message);
      });
  }

  async function callContract() {
    callResult.value.setInfo("Calling Contract ...");
    const args = argsStringToArgs(callData.value.args);
    const options = Object.fromEntries(
      Object.entries(callData.value.options).filter(([, v]) => v != null)
    );

    contractInstance
      ?.$call(callData.value.func, args, options)
      .then((result) => {
        if (
          result.tx.tag !== Tag.SignedTx || result.tx.encodedTx.tag !== Tag.ContractCallTx
        ) throw new Error('Unexpected transaction');
        const { fee } = result.tx.encodedTx;
        callResult.value.setFinal(
          `Gas Used: ${result?.result?.gasUsed}, Fee: ${toAe(fee)} ae (${fee} aetto)`,
          JSON.stringify(result?.decodedResult)
        );
      })
      .catch((error) => {
        if (error instanceof Error) callResult.value.setError(error.message);
      });
  }

  async function initContractState() {
    const persistedContract = getContract();
    compileData.value.contractCode =
      persistedContract.contractCode || structuredClone(exampleContractCode);
    if (persistedContract.aci && persistedContract.contractAddress)
      await initializeContractFromAci(
        persistedContract.contractAddress,
        persistedContract.aci
      );
  }

  function resetDeployAndCallData(includeDeployData = true) {
    if (includeDeployData) {
      deployData.value = {
        args: "",
        options: structuredClone(defaultCallOptions),
      };
      deployResult.value = new Result();
    }

    callStaticData.value = {
      func: "example",
      gas: 1000000,
      args: "",
    };
    callStaticResult.value = new Result();

    callData.value = {
      func: "example",
      args: "",
      options: structuredClone(defaultCallOptions),
    };
    callResult.value = new Result();
  }

  async function resetContractState() {
    contractInstance = undefined;
    compileData.value.contractCode = structuredClone(exampleContractCode);
    compileResult.value = new Result();
    deployResult.value = new Result();

    resetDeployAndCallData();
    await persistContract(
      compileData.value.contractCode,
      compileResult.value.data?.aci || "",
      deployResult.value.data
    );
  }

  return {
    initContractState,
    resetContractState,

    compileData,
    compileResult,
    compileContractFromSource,

    deployData,
    deployResult,
    deployContract,
    initializeContractFromAci,

    callStaticData,
    callStaticResult,
    callContractStatic,

    callData,
    callResult,
    callContract,
  };
});
