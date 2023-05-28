export type CryptoBalance = {
  id: string;
  denom: string;
  quantity: number;
};

export enum ProposalStatus {
  Pending = "Pending",
  Executed = "Executed",
  Rejected = "Rejected",
}

export type Proposal = {
  id: string;
  status: ProposalStatus;
  title: string;
  createdAt: Date;
};
