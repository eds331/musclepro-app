import React, { useState } from "react";

const AIChat: React.FC = () => {
  const [messages, setMessages] = useState<
    { role: "user" | "assistant"; content: string }[]
  >([]);
  const [input, setInput] = useState("");
  const [disabled] = useState(true); // IA desactivada por seguridad

  const sendMessage = async () => {
    if (!input.trim()) return;

    // Agrega mensaje del usuario
    setMessages((prev) => [
      ...prev,
      { role: "user", content: input },
      {
        role: "assistant",
        content:
          "🤖 IA temporalmente desactivada.\nPróximamente entrenamientos y nutrición inteligente.",
      },
    ]);

    setInput("");
  };

  return (
    <div className="w-full h-full flex flex-col bg-black text-white
