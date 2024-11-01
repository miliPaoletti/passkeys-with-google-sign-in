"use client";

import { signIn, useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { registerWebauthn } from "./lib/register-webauthn";
import { signInWithWebauthn } from "./lib/sign-in-with-webauthn";

export default function Home() {
  const { data: session } = useSession();

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
      {session?.user && (
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <p className="font-bold text-xl">Welcome {session.user?.email}!</p>
          </div>
          <button
            className="bg-emerald-100 p-3 text-black font-bold rounded w-full"
            onClick={registerWebauthn}
          >
            CREATE PASSKEY
          </button>
          <button
            className="bg-emerald-900 p-3 text-white font-bold rounded w-full"
            onClick={() => {
              signOut();
            }}
          >
            Log out
          </button>
        </div>
      )}

      {!session && (
        <div>
          <button
            className="bg-emerald-100 p-3 text-black font-bold rounded ml-2"
            onClick={() => signIn("google")}
          >
            Sign in with Google
          </button>
          {supportsPasskeys ? (
            // Show passkey-enabled UI
            <button
              className="bg-emerald-500 p-3 text-black font-bold rounded ml-2"
              onClick={async () => {
                try {
                  await signInWithWebauthn();
                } catch (e) {
                  console.log(e);
                  signIn("google");
                }
              }}
            >
              Sign in with Passkey
            </button>
          ) : (
            // Fallback to traditional methods
            <button onClick={() => signIn("google")}>
              Sign in with Google
            </button>
          )}
        </div>
      )}
    </div>
  );
}
