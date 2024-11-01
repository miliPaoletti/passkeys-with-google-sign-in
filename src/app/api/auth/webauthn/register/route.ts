import { NextApiRequest, NextApiResponse } from "next";
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
} from "@simplewebauthn/server";
import { getServerSession } from "next-auth";
import { db } from "../../../../lib/db";
import { AuthenticatorTransportFuture } from "@simplewebauthn/typescript-types";
import { RegistrationResponseJSON } from "@simplewebauthn/typescript-types";

import {
  // DbCredential,
  getChallenge,
  saveChallenge,
  saveCredentials,
} from "@/pages/api/webauthn";
// import { NextRequest } from "next/server";

const domain = process.env.APP_DOMAIN!;
const origin = process.env.APP_ORIGIN!;
const appName = process.env.APP_NAME!;
// const dbName = process.env.WEBAUTHN_DBNAME!;

/**
 * handles GET /api/auth/webauthn/register.
 *
 * This function generates and returns registration options.
 */

async function handlePreRegister() {
  const session = await getServerSession();
  const email = session?.user?.email;

  if (!email) {
    return new Response(
      JSON.stringify({ message: "Authentication is required" }),
      { status: 401 }
    );
  }

  const credentials = await db.credential.findMany({
    where: { userID: email },
  });

  const options = await generateRegistrationOptions({
    rpID: domain,
    rpName: appName,
    userID: new TextEncoder().encode(email),
    userName: email,
    attestationType: "none",
    authenticatorSelection: {
      userVerification: "preferred",
      requireResidentKey: true,
    },
  });

  options.excludeCredentials = credentials.map((c) => ({
    id: c.credentialID,
    type: "public-key",
    transports: [c.transports] as AuthenticatorTransportFuture[],
  }));

  try {
    await saveChallenge({ userID: email, challenge: options.challenge });

    // return Response.json(options);
    return new Response(JSON.stringify(options), { status: 200 });
  } catch (err) {
    console.log(err);
    return new Response(
      JSON.stringify({ message: "Could not set up challenge." }),
      { status: 500 }
    );
  }
}
/**
 * handles POST /api/auth/webauthn/register.
 *
 * This function verifies and stores user's public key.
 */
async function handleRegister(req: Request) {
  const session = await getServerSession();
  const email = session?.user?.email;
  if (!email) {
    return new Response(
      JSON.stringify({ success: false, message: "You are not connected." }),
      { status: 401 }
    );
  }
  const challenge = await getChallenge(email);
  if (!challenge) {
    return new Response(
      JSON.stringify({
        success: false,
        message: "Pre-registration is required.",
      }),
      { status: 401 }
    );
  }
  const credential: RegistrationResponseJSON = await req.json();
  
  const { verified, registrationInfo: info } = await verifyRegistrationResponse(
    {
      response: credential,
      expectedRPID: domain,
      expectedOrigin: origin,
      expectedChallenge: challenge,
    }
  );

  if (!verified || !info) {
    return new Response(
      JSON.stringify({ success: false, message: "Something went wrong" }),
      { status: 500 }
    );
  }

  try {
    await saveCredentials({
      credentialID: credential.id,
      transports: credential.response.transports ?? ["internal"],
      userID: email,
      key: Buffer.from(info.credential.publicKey),
      counter: info.credential.counter,
    });

    return new Response(JSON.stringify({ success: true }), { status: 201 });
  } catch (err) {
    console.log(err);
    return new Response(
      JSON.stringify({
        success: false,
        message: "Could not register the credential.",
      }),
      { status: 500 }
    );
  }
}

// API route handling based on request method
export async function GET() {
  return handlePreRegister();
}

export async function POST(req: Request) {
  return handleRegister(req);
}

// export default async function WebauthnRegister(
//   req: NextApiRequest,
//   res: NextApiResponse
// ) {
//   if (req.method === "GET") {
//     return handlePreRegister(req, res);
//   }
//   if (req.method === "POST") {
//     return handleRegister(req, res);
//   }
//   return res.status(404).json({ message: "The method is forbidden." });
// }
