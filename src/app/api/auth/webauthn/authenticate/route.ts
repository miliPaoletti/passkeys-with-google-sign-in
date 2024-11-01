import { generateAuthenticationOptions } from "@simplewebauthn/server";
import { db } from "../../../../lib/db";

interface authProps {
  id: string;
  credentialID: string;
  transports: string;
  userID: string;
  credentialPublicKey: Buffer;
  counter: number;
}
/**
 * handles GET /api/auth/webauthn/authenticate.
 *
 * It generates and returns authentication options.
 */
async function WebauthnAuthenticate() {
  try {
    // get the credentaials available
    const authenticators = await db.credential.findMany();

    const options = await generateAuthenticationOptions({
      rpID: process.env.APP_DOMAIN!,
      allowCredentials: authenticators.map((auth: authProps) => ({
        id: auth.credentialID,
        type: "public-key",
      })),
      userVerification: "preferred",
    });

    return new Response(JSON.stringify(options), { status: 200 });
  } catch (err) {
    console.log(err);
    return new Response(
      JSON.stringify({
        success: false,
        message: "Could not set up challenge.",
      }),
      { status: 500 }
    );
  }
}

export async function GET() {
  return WebauthnAuthenticate();
}
