import { startRegistration } from "@simplewebauthn/browser";
import { StartRegistrationOpts } from "@simplewebauthn/browser/dist/types/methods/startRegistration";

export async function registerWebauthn() {
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
