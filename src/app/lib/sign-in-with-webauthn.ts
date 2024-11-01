import { PublicKeyCredentialRequestOptionsJSON } from "@simplewebauthn/typescript-types";
import { startAuthentication } from "@simplewebauthn/browser";
import { StartAuthenticationOpts } from "@simplewebauthn/browser/dist/types/methods/startAuthentication";
import { signIn } from "next-auth/react";
export async function signInWithWebauthn() {
  const optionsResponse = await fetch("/api/auth/webauthn/authenticate");

  if (optionsResponse.status !== 200) {
    throw new Error("Could not get authentication options from server");
  }

  const opt: PublicKeyCredentialRequestOptionsJSON =
    await optionsResponse.json();

  const authOptions: StartAuthenticationOpts = {
    optionsJSON: opt,
  };

  if (!opt.allowCredentials || opt.allowCredentials.length === 0) {
    throw new Error("There is no registered credential.");
  }

  const credential = await startAuthentication(authOptions);

  await signIn("credentials", {
    id: credential.id,
    rawId: credential.rawId,
    type: credential.type,
    clientDataJSON: credential.response.clientDataJSON,
    authenticatorData: credential.response.authenticatorData,
    signature: credential.response.signature,
    userHandle: credential.response.userHandle,
    clientExtensionResults: credential.clientExtensionResults,
    challenge: opt.challenge,
  });
}
