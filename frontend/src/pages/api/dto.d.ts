export type createUserDto = {
    wallet: string;
    refererWallet: string;
    sig: string;
}

export type findUserDto = {
    wallet?: string;
    id?: number;
}