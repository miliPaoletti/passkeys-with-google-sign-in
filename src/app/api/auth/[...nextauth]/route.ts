import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

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
  ],
});

export { handler as GET, handler as POST };
