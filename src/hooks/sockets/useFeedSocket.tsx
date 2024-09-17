import { useEffect } from "react";
import io from "socket.io-client";
import { EventType, PostType, Memorytype } from "../../types";
const useFeedSocket = (
  setEvents: any
  // setEventPosts: any
) => {
  useEffect(() => {
    const socket = io("https://socket.noosk.co");
    // const socket = io("https://b2c4-154-27-22-81.ngrok-free.app");
    socket.emit("join_feed");
    socket.on("new_memory_feed", (memory: Memorytype) => {
      setEvents((currentEvents: EventType[]) => {
        return currentEvents.map((event: EventType) => {
          if (event._id !== memory.event_id) {
            return event;
          }
          const updatedEvent = { ...event };
          if (!updatedEvent.memories) {
            updatedEvent.memories = [memory];
          } else {
            updatedEvent.memories.push(memory);
          }

          return updatedEvent;
        });
      });
    });

    socket.on("new_event_with_memory", (eventWithMemories: any) => {
      setEvents((currentEvents: any[]) => {
        const newEvent = eventWithMemories.eventWithMemories[0];
        if (newEvent.memories && newEvent.memories.length > 1) {
          newEvent.memories = [newEvent.memories[0]];
        }
        return [newEvent, ...currentEvents];
      });
    });

    socket.on("memory_deleted", (eventId: string, memoryId: string[]) => {
      setEvents((currentEvents: EventType[]) => {
        return currentEvents.map((event) => {
          if (event._id !== eventId) {
            return event;
          }
          const updatedMemories = event.memories.filter(
            (memory) => !memoryId.includes(memory._id)
          );

          return { ...event, memories: updatedMemories };
        });
      });
    });

    socket.on("event_deleted", (eventId: string) => {
      setEvents((currentEvents: EventType[]) => {
        return currentEvents.filter(
          (event: EventType) => event._id !== eventId
        );
      });
    });

    // socket.on("new_post", (post: PostType) => {
    //   setEventPosts((currentPosts: PostType[]) => [post, ...currentPosts]);
    // });

    // socket.on("post_deleted", (postId: string) => {
    //   setEventPosts((currentPosts: PostType[]) =>
    //     currentPosts.filter((post) => post._id !== postId)
    //   );
    // });

    // socket.on("like_removed", (postId: string) => {
    //   setEventPosts((currentPosts: PostType[]) => {
    //     return currentPosts.map((post) => {
    //       if (post._id === postId) {
    //         return {
    //           ...post,
    //           total_likes: post.total_likes - 1,
    //         };
    //       }
    //       return post;
    //     });
    //   });
    // });

    // socket.on("like_added", (postId: string) => {
    //   setEventPosts((currentPosts: PostType[]) => {
    //     return currentPosts.map((post) => {
    //       if (post._id === postId) {
    //         return {
    //           ...post,
    //           total_likes: post.total_likes + 1,
    //         };
    //       }
    //       return post;
    //     });
    //   });
    // });

    return () => {
      socket.off("new_memory_feed");
      socket.off("memory_deleted");
      socket.off("event_deleted");
      // socket.off("new_post");
      // socket.off("post_deleted");
      // socket.off("like_removed");
      // socket.off("like_added");
      socket.off("new_event_with_memory");
    };
  }, []);
};

export default useFeedSocket;
