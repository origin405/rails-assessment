import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/options"  

export async function createContext(opts: { req: Request; res: Response }) {
  const session = await getServerSession(authOptions);

  return {
    session,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;