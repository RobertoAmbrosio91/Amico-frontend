import { useEffect } from "react";
import io from "socket.io-client";
import { EventType, PostType, Memorytype } from "../../types";
const useEventMemoriesSocket = (setEventData: any, eventId: any) => {
  useEffect(() => {
    if (eventId) {
      const socket = io("https://socket.noosk.co");
      // const socket = io("https://4e05-154-27-22-81.ngrok-free.app");
      socket.emit("user_joined_events", eventId);

      socket.on("new_memory", (memory: Memorytype) => {
        setEventData((prevData: any) => {
          const shouldResetMemories =
            prevData.memories[0] && !prevData.memories[0]._id;
          const newMemory = {
            ...memory,
            reactions_summary: {},
            my_reaction: null,
          };
          return {
            ...prevData,
            memories: shouldResetMemories
              ? [newMemory]
              : [...prevData.memories, newMemory],
          };
        });
      });
      socket.on("memory_deleted", (memory_ids: string[]) => {
        setEventData((prevData: any) => ({
          ...prevData,
          memories: [
            ...prevData.memories.filter(
              (memory: Memorytype) => !memory_ids.includes(memory._id)
            ),
          ],
        }));
      });

      socket.on("new_reaction", (data) => {
        const reactionType = `total_${data.type}_reaction`;
        setEventData((prevData: any) => {
          if (prevData.memories) {
            return {
              ...prevData,
              memories: prevData.memories.map((memory: any) => {
                if (memory._id === data.memory_id) {
                  if (!memory.reactions_summary) {
                    memory.reactions_summary = {};
                  }
                  // Check if the specific reaction type exists, if not, initialize it to 0
                  if (!memory.reactions_summary[reactionType]) {
                    memory.reactions_summary[reactionType] = 0;
                  }
                  // Increment the reaction count
                  memory.reactions_summary[reactionType] += 1;

                  return {
                    ...memory,
                    reactions_summary: memory.reactions_summary,
                    // my_reaction: data.type,
                  };
                }

                return memory;
              }),
            };
          } else {
            return prevData;
          }
        });
      });
      socket.on("reaction_removed", (data) => {
        const reactionType = `total_${data.type}_reaction`;
        setEventData((prevData: any) => {
          if (prevData.memories) {
            return {
              ...prevData,
              memories: prevData.memories.map((memory: any) => {
                if (memory._id === data.memory_id) {
                  memory.reactions_summary[reactionType] -= 1;

                  return {
                    ...memory,
                    reactions_summary: memory.reactions_summary,
                    // my_reaction: null,
                  };
                }

                return memory;
              }),
            };
          } else {
            return prevData;
          }
        });
      });
      socket.on("reaction_updated", (data) => {
        const reactionType = `total_${data.type}_reaction`;
        const prevReactionType = `total_${data.previousType}_reaction`;
        setEventData((prevData: any) => {
          if (prevData.memories) {
            return {
              ...prevData,
              memories: prevData.memories.map((memory: any) => {
                if (memory._id === data.memory_id) {
                  if (!memory.reactions_summary) {
                    memory.reactions_summary = {};
                  }
                  // Check if the specific reaction type exists, if not, initialize it to 0
                  if (!memory.reactions_summary[reactionType]) {
                    memory.reactions_summary[reactionType] = 0;
                  }
                  // Increment the reaction count
                  memory.reactions_summary[reactionType] += 1;
                  memory.reactions_summary[prevReactionType] -= 1;

                  return {
                    ...memory,
                    reactions_summary: memory.reactions_summary,
                    // my_reaction: data.type,
                  };
                }

                return memory;
              }),
            };
          } else {
            return prevData;
          }
        });
      });
      socket.on("new_memory_prompt", (data) => {
        console.log("new memory prompt", data);
        setEventData((prevData: any) => {
          const promptIndex = prevData.prompts.findIndex(
            (p: any) => p.name === data.prompt_name
          );
          const updatedPrompts = [
            ...prevData.prompts,
            (prevData.prompts[promptIndex] = prevData.prompts[
              promptIndex
            ].memories_id.push(data.memory_id)),
          ];
          return {
            ...prevData,
            prompts: updatedPrompts,
          };
        });
      });
      socket.on("new_prompt", (prompt) => {
        console.log("new prompt", prompt);
        setEventData((prevData: any) => {
          if (!prevData.prompts) {
            prevData.prompts = [];
          }

          return {
            ...prevData,
            prompts: [...prevData.prompts, prompt],
          };
        });
      });
      return () => {
        socket.disconnect();
      };
    }
  }, [eventId]);
};

export default useEventMemoriesSocket;
