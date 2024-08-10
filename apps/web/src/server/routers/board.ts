// server/routers/board.ts
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../trpc";
import prisma from "@/lib/prisma";
import { sendSSEUpdate } from "@/utils/sse";

const ChangeSchema = z.object({
  type: z.enum([
    "ADD_LIST",
    "DELETE_LIST",
    "UPDATE_LIST_TITLE",
    "REORDER_LIST",
    "ADD_CARD",
    "DELETE_CARD",
    "UPDATE_CARD_CONTENT",
    "MOVE_CARD",
  ]),
  payload: z.any(),
});

export const boardRouter = router({
  listBoards: protectedProcedure.query(async ({ ctx }) => {
    // We don't need to pass userId as input since we're using the authenticated user's id
    const userId = ctx.session.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        boards: {
          select: {
            id: true,
            name: true,
            actionCounter: true,
            createdAt: true,
            updatedAt: true,
          },
          orderBy: {
            updatedAt: "desc",
          },
        },
      },
    });

    if (!user) {
      throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
    }

    return user.boards;
  }),
  getBoard: protectedProcedure
    .input(
      z.object({
        boardId: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      const userId = ctx.session.user.id;

      const board = await prisma.board.findFirst({
        where: {
          id: input.boardId,
          userId: userId,
        },
      });

      if (!board) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Board not found or you do not have access to it",
        });
      }

      return board;
    }),
  addBoard: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(50),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.session.user.id;

      try {
        const newBoard = await prisma.board.create({
          data: {
            name: input.name,
            user: {
              connect: { id: userId },
            },
            actionCounter: 0, // Initialize action counter
          },
        });

        return newBoard;
      } catch (error) {
        // Handle potential errors
        if (error instanceof Error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `Failed to create board: ${error.message}`,
          });
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "An unexpected error occurred",
        });
      }
    }),
  updateBoard: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).max(50),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.session.user.id;

      try {
        const updatedBoard = await prisma.board.updateMany({
          where: {
            id: input.id,
            userId: userId,
          },
          data: {
            name: input.name,
          },
        });

        if (updatedBoard.count === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message:
              "Board not found or you do not have permission to update it",
          });
        }

        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "An unexpected error occurred while updating the board",
        });
      }
    }),

  deleteBoard: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.session.user.id;

      try {
        const deletedBoard = await prisma.board.deleteMany({
          where: {
            id: input.id,
            userId: userId,
          },
        });

        if (deletedBoard.count === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message:
              "Board not found or you do not have permission to delete it",
          });
        }

        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "An unexpected error occurred while deleting the board",
        });
      }
    }),
  getLists: protectedProcedure
    .input(
      z.object({
        boardId: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      const userId = ctx.session.user.id;

      // First, check if the board belongs to the user
      const board = await prisma.board.findFirst({
        where: {
          id: input.boardId,
          userId: userId,
        },
      });

      if (!board) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Board not found or you do not have access to it",
        });
      }

      // Fetch lists with their cards
      const lists = await prisma.list.findMany({
        where: {
          boardId: input.boardId,
        },
        include: {
          cards: {
            orderBy: {
              order: "asc",
            },
          },
        },
        orderBy: {
          order: "asc",
        },
      });

      return lists;
    }),
  applyChanges: protectedProcedure
    .input(
      z.object({
        boardId: z.string(),
        tabId: z.string(),
        changes: z.array(ChangeSchema),
        currentActionCounter: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.session.user.id;

      // Verify board ownership and action counter
      const board = await prisma.board.findFirst({
        where: {
          id: input.boardId,
          userId: userId,
        },
      });

      if (!board) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Board not found or you do not have permission to modify it",
        });
      }

      if (board.actionCounter !== input.currentActionCounter) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Board has been modified. Please refresh and try again.",
        });
      }

      // Apply changes in a transaction
      try {
        const result = await prisma.$transaction(async (prisma) => {
          for (const change of input.changes) {
            switch (change.type) {
              case "ADD_LIST":
                await prisma.list.create({
                  data: {
                    title: change.payload.title,
                    boardId: input.boardId,
                    order: await prisma.list.count({
                      where: { boardId: input.boardId },
                    }),
                  },
                });
                break;
              case "DELETE_LIST":
                await prisma.list.delete({
                  where: { id: change.payload.listId },
                });
                // Optionally, you might want to reorder the remaining lists
                const remainingLists = await prisma.list.findMany({
                  where: { boardId: input.boardId },
                  orderBy: { order: "asc" },
                });
                await Promise.all(
                  remainingLists.map((list, index) =>
                    prisma.list.update({
                      where: { id: list.id },
                      data: { order: index },
                    })
                  )
                );
                break;

              case "UPDATE_LIST_TITLE":
                await prisma.list.update({
                  where: { id: change.payload.listId },
                  data: { title: change.payload.newTitle },
                });
                break;
              case "REORDER_LIST":
                {
                  const { sourceIndex, destinationIndex } = change.payload;
                  const lists = await prisma.list.findMany({
                    where: { boardId: input.boardId },
                    orderBy: { order: "asc" },
                  });

                  if (sourceIndex === destinationIndex) break; // No change needed

                  const [movedList] = lists.splice(sourceIndex, 1);
                  lists.splice(destinationIndex, 0, movedList);

                  // Update the order of all affected lists
                  const updatePromises = lists.map((list, index) =>
                    prisma.list.update({
                      where: { id: list.id },
                      data: { order: index },
                    })
                  );

                  await Promise.all(updatePromises);
                }
                break;
              case "ADD_CARD":
                await prisma.card.create({
                  data: {
                    content: change.payload.content,
                    listId: change.payload.listId,
                    order: await prisma.card.count({
                      where: { listId: change.payload.listId },
                    }),
                  },
                });
                break;
              case "UPDATE_CARD_CONTENT":
                await prisma.card.update({
                  where: { id: change.payload.cardId },
                  data: { content: change.payload.newContent },
                });
                break;

              case "DELETE_CARD":
                await prisma.card.delete({
                  where: { id: change.payload.cardId },
                });
                // Optionally, you might want to reorder the remaining cards
                const remainingCards = await prisma.card.findMany({
                  where: { listId: change.payload.listId },
                  orderBy: { order: "asc" },
                });
                await Promise.all(
                  remainingCards.map((card, index) =>
                    prisma.card.update({
                      where: { id: card.id },
                      data: { order: index },
                    })
                  )
                );
                break;
              case "MOVE_CARD":
                {
                  const {
                    sourceListId,
                    destinationListId,
                    sourceIndex,
                    destinationIndex,
                    cardId,
                  } = change.payload;

                  // Get the current order of the moved card
                  const movedCard = await prisma.card.findUnique({
                    where: { id: cardId },
                  });
                  if (!movedCard) throw new Error("Card not found");

                  // Update the order of cards in the source list
                  await prisma.card.updateMany({
                    where: {
                      listId: sourceListId,
                      order: { gt: sourceIndex },
                    },
                    data: { order: { decrement: 1 } },
                  });

                  // If moving to a different list, update the order of cards in the destination list
                  if (sourceListId !== destinationListId) {
                    await prisma.card.updateMany({
                      where: {
                        listId: destinationListId,
                        order: { gte: destinationIndex },
                      },
                      data: { order: { increment: 1 } },
                    });
                  } else {
                    // If moving within the same list
                    if (sourceIndex < destinationIndex) {
                      await prisma.card.updateMany({
                        where: {
                          listId: sourceListId,
                          order: { gt: sourceIndex, lte: destinationIndex },
                        },
                        data: { order: { decrement: 1 } },
                      });
                    } else if (sourceIndex > destinationIndex) {
                      await prisma.card.updateMany({
                        where: {
                          listId: sourceListId,
                          order: { gte: destinationIndex, lt: sourceIndex },
                        },
                        data: { order: { increment: 1 } },
                      });
                    }
                  }

                  // Update the moved card
                  await prisma.card.update({
                    where: { id: cardId },
                    data: {
                      listId: destinationListId,
                      order: destinationIndex,
                    },
                  });
                }
                break;
              default:
                throw new Error(`Unsupported change type: ${change.type}`);
            }
          }

          // Update action counter
          const updatedBoard = await prisma.board.update({
            where: { id: input.boardId },
            data: { actionCounter: { increment: 1 } },
          });

          return updatedBoard.actionCounter;
        });
        if (result) {
          console.log("sending sse update:", input);
          sendSSEUpdate(input.boardId, input.tabId, {
            type: "BOARD_UPDATED",
            board: result,
          });
        }

        return {
          success: true,
          newActionCounter: result,
        };
      } catch (error) {
        console.error("Error applying changes:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to apply changes. Please try again.",
        });
      }
    }),
});
