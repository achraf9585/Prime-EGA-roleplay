import NextAuth from "next-auth";
import DiscordProvider from "next-auth/providers/discord";

export const authOptions = {
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "identify email guilds",
        },
      },
    }),
  ],
  callbacks: {
    async session({ session, token }: any) {
      // Add Discord user info to session
      if (token) {
        session.user.id = token.sub;
        session.user.discordId = token.sub;
        session.user.discriminator = token.discriminator;
      }
      return session;
    },
    async jwt({ token, account, profile }: any) {
      // Add Discord info to JWT token
      if (account && profile) {
        token.discordId = profile.id;
        token.discriminator = profile.discriminator;
      }
      return token;
    },
  },
  pages: {
    signIn: "/", // Redirect to home page after sign in
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
