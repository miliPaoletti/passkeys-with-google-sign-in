"use client";
import { startRegistration } from "@simplewebauthn/browser";
import { StartRegistrationOpts } from "@simplewebauthn/browser/dist/types/methods/startRegistration";
import {
  Base64URLString,
  RegistrationResponseJSON,
} from "@simplewebauthn/typescript-types";
import { signIn, useSession, signOut } from "next-auth/react";
import Image from "next/image";

export default function Home() {
  const { data: session, status } = useSession();

  async function registerWebauthn() {
    const optionsResponse = await fetch("/api/auth/webauthn/register");

    if (!optionsResponse.ok) {
      throw new Error("Failed to get registration options");
    }

    const opt = await optionsResponse.json();

    try {
      const lucho: StartRegistrationOpts = {
        optionsJSON: opt,
        // useAutoRegister?: boolean;
      };

      const credential = await startRegistration(lucho);

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
      console.log("errrrrr", err);
      alert(`Registration failed. ${(err as Error).message}`);
    }
  }
  return (
    <div className="flex items-center justify-center w-full h-dvh">
      {/* {status === "authenticated" ? ( */}
      {session?.user ? (
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <Image
              src={session.user?.image ?? ""}
              alt="avatar"
              width={24}
              height={24}
              className="rounded-full"
            />
            <p className="font-bold text-xl">{session.user?.name}</p>
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
          onClick={() => {
            signIn("google");
          }}
        >
          Log in with google
        </button>
      )}
      {/* ) : (
        <>Loading</>
      )} */}
    </div>
  );
}
