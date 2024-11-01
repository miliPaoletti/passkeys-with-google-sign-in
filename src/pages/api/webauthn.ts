import { AuthenticatorTransportFuture } from "@simplewebauthn/typescript-types";
import { db } from "../../app/lib/db";

export interface DbCredential {
  credentialID: string;
  userID: string;
  transports: AuthenticatorTransport[];
  credentialPublicKey: Buffer;
  counter: number;
}

export async function saveChallenge({
  userID,
  challenge,
}: {
  challenge: string;
  userID: string;
}) {
  await db.challenge.upsert({
    where: {
      userID: userID,
    },
    update: {
      value: challenge,
    },
    create: {
      userID: userID,
      value: challenge,
    },
  });
}

export async function getChallenge(userID: string) {
  const challengeObj = await db.challenge.delete({
    where: {
      userID: userID,
    },
    select: {
      value: true,
    },
  });
  return challengeObj.value;
}

/**
 * saveCredentials stores the user's public key in the database.
 * @param cred user's public key
 */
export async function saveCredentials(cred: {
  transports: AuthenticatorTransport[] | AuthenticatorTransportFuture[];
  credentialID: string;
  counter: number;
  userID: string;
  key: Buffer;
}) {
  await db.credential.create({
    data: {
      credentialID: cred.credentialID,
      transports: JSON.stringify(cred.transports),
      userID: cred.userID,
      credentialPublicKey: cred.key,
      counter: cred.counter,
    },
  });
}
