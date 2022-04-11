export interface register {
  name: string;
  val: string;
  mem: string;
}

export interface memory {
  addr: number;
  ascii: string;
  bytes: string[];
}
