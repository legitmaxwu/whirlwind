import { atom } from "jotai";
import { splitAtom } from "jotai/utils";
import { Constants } from "../lib/constants";

export const controllerAccountsAtom = atom(Constants.ControllerAccounts);
export const controllerAccountAtomsAtom = splitAtom(controllerAccountsAtom);

export const totalBalancesAtom = atom((get) => {
  // Merge all controller accounts balances into a single array
  const controllerAccounts = get(controllerAccountsAtom);
  const totalBalances = controllerAccounts
    .map((controllerAccount) => controllerAccount.balances)
    .flat();

  // Merge all objects with the same denom. Add up the quantity
  const result = totalBalances.reduce(
    (acc, balance) => ({
      ...acc,
      [balance.denom]: (acc[balance.denom] || 0) + balance.quantity,
    }),
    {} as Record<string, number>
  );

  return Object.entries(result).map(([denom, quantity]) => ({
    denom,
    quantity,
  }));
});
