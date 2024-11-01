import { NextApiRequest } from "next";
import { generateAuthenticationOptions } from "@simplewebauthn/server";
import { db } from "../../../../lib/db";

/**
 * handles GET /api/auth/webauthn/authenticate.
 *
 * It generates and returns authentication options.
 */
async function WebauthnAuthenticate(req: NextApiRequest) {
  if (req.method === "GET") {
    try {
      // get the credentaials available
      const authenticators = await db.credential.findMany();

      const options = await generateAuthenticationOptions({
        rpID: process.env.APP_DOMAIN!,
        allowCredentials: authenticators.map((auth) => ({
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
  return new Response(
    JSON.stringify({ success: false, message: "The method is forbidden." }),
    { status: 404 }
  );
}

export async function GET(req: NextApiRequest) {
  return WebauthnAuthenticate(req);
}
