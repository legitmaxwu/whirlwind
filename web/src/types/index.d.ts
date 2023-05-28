export type CryptoBalance = {
  id: string;
  denom: string;
  quantity: number;
};

export enum PropositionStatus {
  Pending = "Pending",
  Executed = "Executed",
  Rejected = "Rejected",
}
export type Proposition = {
  id: string;
  status: PropositionStatus;
  title: string;
  createdAt: Date;
};
