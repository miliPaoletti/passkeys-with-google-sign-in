import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "../../../lib/db";
import { getChallenge, saveChallenge } from "@/pages/api/webauthn";
import { verifyAuthenticationResponse } from "@simplewebauthn/server";
import { base64URLStringToBuffer } from "@simplewebauthn/browser";
import { Base64URLString } from "@simplewebauthn/typescript-types";

const domain = process.env.APP_DOMAIN!;
const origin = process.env.APP_ORIGIN!;

interface authProps {
  id: Base64URLString;
  rawId: Base64URLString;
  clientExtensionResults: AuthenticationExtensionsClientOutputs;
  type: PublicKeyCredentialType;
  clientDataJSON: Base64URLString;
  authenticatorData: Base64URLString;
  signature: Base64URLString;
  userHandle?: Base64URLString;
  challenge: Base64URLString;
}

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      //   is this enough for the refresh token ?
      // https://next-auth.js.org/providers/google
      //   or should we handle it in the database ?
      // https://www.youtube.com/watch?app=desktop&v=-XYwEWKkgG0&ab_channel=WebDevCody
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
    // AppleProvider({
    //   clientId: process.env.APPLE_ID,
    //   clientSecret: process.env.APPLE_SECRET,
    // }),
    CredentialsProvider({
      name: "webauthn",
      credentials: {},
      async authorize(_, req) {
        const {
          id,
          rawId,
          type,
          clientDataJSON,
          authenticatorData,
          signature,
          userHandle,
          clientExtensionResults,
          challenge,
        } = req.body as authProps;

        await saveChallenge({ userID: id, challenge: challenge });
        const credential = {
          id,
          rawId,
          type,
          response: {
            clientDataJSON,
            authenticatorData,
            signature,
            userHandle,
          },
          clientExtensionResults,
        };

        const authenticator = await db.credential.findUnique({
          where: {
            credentialID: credential.id,
          },
        });

        if (!authenticator) {
          return null;
        }

        const currentChallenge = await getChallenge(authenticator.credentialID);

        if (!challenge) {
          return null;
        }

        try {
          const { verified, authenticationInfo: info } =
            await verifyAuthenticationResponse({
              expectedChallenge: currentChallenge,
              expectedOrigin: origin,
              expectedRPID: domain,
              credential: {
                publicKey: new Uint8Array(authenticator.credentialPublicKey),
                id: authenticator.credentialID,
                counter: authenticator.counter,
              },
              response: credential,
            });

          if (!verified || !info) {
            return null;
          }
          await db.credential.update({
            where: {
              id: authenticator.id, // Note: using 'id' instead of '_id'
            },
            data: {
              counter: info.newCounter,
            },
          });
        } catch (err) {
          console.log(err);
          return null;
        }
        return {
          id: authenticator.userID,
          email: authenticator.userID,
        };
      },
    }),
  ],
});

export { handler as GET, handler as POST };
