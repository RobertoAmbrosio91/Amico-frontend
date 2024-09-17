import React, { createContext, useContext, useState } from "react";

const ParticipantsContext = createContext<{
  participants: string[];
  addParticipant: (id: string) => void;
  removeParticipant: (id: string) => void;
} | null>(null);

export const useParticipants = () => useContext(ParticipantsContext);

export const ParticipantsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [participants, setParticipants] = useState<string[]>([]);

  const addParticipant = (id: string) => {
    if (!participants.includes(id)) {
      setParticipants([...participants, id]);
    }
  };

  const removeParticipant = (id: string) => {
    setParticipants(
      participants.filter((participantId) => participantId !== id)
    );
  };

  const value = {
    participants,
    addParticipant,
    removeParticipant,
  };

  return (
    <ParticipantsContext.Provider value={value}>
      {children}
    </ParticipantsContext.Provider>
  );
};
