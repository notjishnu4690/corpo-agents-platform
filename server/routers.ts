import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { invokeLLM } from "./_core/llm";
import { z } from "zod";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  agents: router({
    chat: protectedProcedure
      .input(z.object({
        agentId: z.enum(["ceo", "finance", "hr", "reporter"]),
        message: z.string().min(1),
      }))
      .mutation(async ({ input }) => {
        const agentPrompts: Record<string, string> = {
          ceo: "You are the CEO Advisor, a strategic AI agent for CorpoAgents. Provide executive-level insights and recommendations. Be concise and focused on business impact. You help leadership make data-driven decisions.",
          finance: "You are the Finance Copilot, an expert financial AI agent for CorpoAgents. Analyze spending, identify risks, and flag unusual financial movements. Provide actionable financial insights and recommendations.",
          hr: "You are the HR Copilot, a human resources AI agent for CorpoAgents. Help with personnel data, compliance, access management, and team organization. Provide HR-focused recommendations and insights.",
          reporter: "You are the Reporter Agent, a telemetry and operations specialist for CorpoAgents. Analyze system health, performance metrics, and operational status. Provide clear operational insights and recommendations.",
        };

        const systemPrompt = agentPrompts[input.agentId];

        try {
          const response = await invokeLLM({
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: input.message },
            ],
          });

          const content = response.choices[0]?.message?.content || "Unable to process request.";
          return { response: content };
        } catch (error) {
          console.error("LLM error:", error);
          throw new Error("Agent connection failed. Please try again.");
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;
