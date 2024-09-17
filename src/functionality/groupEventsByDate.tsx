import { EventType } from "@/types";


function groupEvents(events: EventType[]) {
  const currentDate = new Date();
  const groupedEvents = events.reduce(
    (acc, event) => {
      const startDate = new Date(event.start_date);
      const endDate = new Date(event.end_date);

      if (currentDate >= startDate && currentDate <= endDate) {
        acc.live.push(event);
      } else if (currentDate < startDate) {
        acc.upcoming.push(event);
      }else{
        acc.past.push(event);
      }

      return acc;
    },
    { live: [] as EventType[], upcoming: [] as EventType[],past:[]as EventType[] }
  );
  return groupedEvents;
}

export { groupEvents };
