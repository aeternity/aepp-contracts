export function argsStringToArgs(argsString: string) {
  return argsString.trim() === ""
    ? []
    : argsString.split(",").map((arg) => {
        return arg.trim();
      });
}

export const exampleContractCode = `@compiler >= 4

contract Example =
  entrypoint example(x : int) = x`;

export const defaultCallOptions = {
  gasPrice: 1000000000,
  amount: 0,
  fee: null, // sdk will automatically select this
  gas: null, // sdk will automatically select this
  callData: "",
};

export class Result<T> {
  error?: string;
  info?: string;
  final = false;
  data?: T;

  setError(error: string) {
    this.error = error;
    this.info = undefined;
    this.final = false;
    this.data = undefined;
  }
  setInfo(info: string) {
    this.info = info;
    this.error = undefined;
    this.final = false;
    this.data = undefined;
  }

  setFinal(info: string, data?: T) {
    this.info = info;
    this.error = undefined;
    this.final = true;
    this.data = data;
  }
}

export function persistSecretKey(secretKey: string) {
  window.localStorage.setItem("secret-key", secretKey);
}
export function getSecretKey() {
  return window.localStorage.getItem("secret-key");
}

export function persistContract(
  contractCode: string,
  aci: string,
  contractAddress?: string,
  bytecode?: string,
) {
  window.localStorage.setItem("contract-code", contractCode);
  window.localStorage.setItem("aci", aci);

  bytecode
    ? window.localStorage.setItem("bytecode", bytecode)
    : window.localStorage.removeItem("bytecode");

  contractAddress
    ? window.localStorage.setItem("contract-address", contractAddress)
    : window.localStorage.removeItem("contract-address");
}

export function getContract() {
  const contractCode = window.localStorage.getItem("contract-code");
  const aci = window.localStorage.getItem("aci");
  const contractAddress = window.localStorage.getItem("contract-address");
  const bytecode = window.localStorage.getItem("bytecode");

  return { contractCode, aci, bytecode, contractAddress };
}
