import { db } from "@/db";
import { agents } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { agentInsertSchema } from "../schemas";
import z from "zod";
import { eq } from "drizzle-orm";

export const agentsRouter = createTRPCRouter({
    getOne: protectedProcedure.input(z.object({ id: z.string() })).query(async ({ input }) => {
        const [existingAgent] = await db
            .select()
            .from(agents)
            .where(eq(agents.id, input.id))
        return existingAgent;
    }),
    getMany: protectedProcedure.query(async ({ ctx }) => {
        const data = await db
            .select()
            .from(agents)
            .where(eq(agents.userId, ctx.auth.user.id));
        return data;
    }),
    create: protectedProcedure
        .input(agentInsertSchema)
        .mutation(async ({ input, ctx }) => {
            const [createdAgent] = await db
                .insert(agents)
                .values({
                    ...input,
                    userId: ctx.auth.user.id,
                })
                .returning();
            return createdAgent;
        })

})