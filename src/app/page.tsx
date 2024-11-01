"use client";
import { startRegistration } from "@simplewebauthn/browser";
import { StartRegistrationOpts } from "@simplewebauthn/browser/dist/types/methods/startRegistration";
import { signIn, useSession, signOut } from "next-auth/react";
import { PublicKeyCredentialRequestOptionsJSON } from "@simplewebauthn/typescript-types";
import { startAuthentication } from "@simplewebauthn/browser";
import { StartAuthenticationOpts } from "@simplewebauthn/browser/dist/types/methods/startAuthentication";
import { useEffect, useState } from "react";

export default function Home() {
  const { data: session } = useSession();

  async function registerWebauthn() {
    const registerOptions = await fetch("/api/auth/webauthn/register");

    if (!registerOptions.ok) {
      throw new Error("Failed to get registration options");
    }

    const opt = await registerOptions.json();

    try {
      const registrationOpts: StartRegistrationOpts = {
        optionsJSON: opt,
      };

      const credential = await startRegistration(registrationOpts);

      const response = await fetch("/api/auth/webauthn/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credential),
        credentials: "include",
      });
      if (response.status != 201) {
        alert("Could not register webauthn credentials.");
      } else {
        alert("Your webauthn credentials have been registered.");
      }
    } catch (err) {
      alert(`Registration failed. ${(err as Error).message}`);
    }
  }

  async function signInWithWebauthn() {
    try {
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
    } catch (e) {
      console.log(e);
    }
  }

  const [supportsPasskeys, setSupportsPasskeys] = useState(false);

  useEffect(() => {
    async function checkPasskeySupport() {
      if (window.PublicKeyCredential?.isConditionalMediationAvailable) {
        const isAvailable =
          await window.PublicKeyCredential.isConditionalMediationAvailable();

        setSupportsPasskeys(isAvailable);
      }
    }
    checkPasskeySupport();
  }, []);

  return (
    <div className="flex items-center justify-center w-full h-dvh">
      {session?.user ? (
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <p className="font-bold text-xl">Welcome {session.user?.email}!</p>
          </div>
          <button onClick={registerWebauthn}>CREATE PASSKEY</button>
          <button
            className="bg-emerald-900 p-3 text-white font-bold rounded w-full"
            onClick={() => {
              signOut();
            }}
          >
            Log out
          </button>
        </div>
      ) : (
        <button
          className="bg-emerald-100 p-3 text-black font-bold rounded"
          onClick={async () => {
            signIn("google");
          }}
        >
          Sign in with google
        </button>
      )}

      <div>
        {supportsPasskeys ? (
          // Show passkey-enabled UI
          <button
            className="bg-emerald-500 p-3 text-black font-bold rounded ml-2"
            onClick={signInWithWebauthn}
          >
            Sign in with Passkey
          </button>
        ) : (
          // Fallback to traditional methods
          <button onClick={() => signIn("google")}>Sign in with Google</button>
        )}
      </div>
      {/* ) : (
        <>Loading</>
      )} */}
    </div>
  );
}
