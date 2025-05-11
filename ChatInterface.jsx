import { useState, useRef, useEffect } from "react";
import { SendHorizontal } from "lucide-react";
import MessageBubble from "./message-bubble";
import { motion } from "framer-motion";
import KnowledgeButton from "./KnowledgeButton";
import WelcomeScreen from "./welcomeScreen";

export default function ChatInterface({
  messages,
  setMessages,
  onSendMessage,
  onOpenKnowledgeBase,
  onOptionChange,
  selectedOption,
  userRole,
  chatHistory,
  onChatSelect,
  handleNewChat,
  fetchChatHistoryTitle,
  onDelete,
  renameChatTitle,
  chatHistoryNextPage,
  chatHistoryPreviousPage,
  onLoadMoreMessages
}) {
  const [inputValue, setInputValue] = useState("");
  const scrollRef = useRef(null);
  const pageRef = useRef(1);
  const isFetchingRef = useRef(false);

  const handleScroll = async () => {
  
    const container = scrollRef.current;
    console.log("ScrollTop:", container.scrollTop);
    if (!container || isFetchingRef.current) return;

    if (container.scrollTop === 0) {
      isFetchingRef.current = true;
      const nextPage = pageRef.current + 1;

      const scrollHeightBefore = container.scrollHeight;
      const moreMessages = await onLoadMoreMessages(nextPage);
  console.log(moreMessages)
      if (moreMessages && moreMessages.length > 0) {
        setMessages((prev) => [...moreMessages, ...prev]);
        pageRef.current = nextPage;

        setTimeout(() => {
          const scrollHeightAfter = container.scrollHeight;
          container.scrollTop = scrollHeightAfter - scrollHeightBefore;
        }, 0);
      }

      isFetchingRef.current = false;
    }
  };

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onSendMessage(inputValue);
      setInputValue("");
    }
  };

  return (
    <div
      className={`flex flex-col h-[95vh] ${selectedOption === 'IT Ticket Generation'
        ? 'bg-gradient-to-t from-[rgba(255,240,200,0.3)] via-[rgba(200,222,255,0.3)] to-[rgba(200,255,242,0.3)]'
        : 'bg-gradient-to-t from-[#FF4200]/10 via-[#EF5794]/10 to-[#646EE9]/20'
        }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5">
        <div className="flex items-center gap-2">
          <div className="relative h-20 w-48 overflow-hidden right-12">
            <img
              src="/assets/Group-avatar.png"
              alt="Profile"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
        <KnowledgeButton
          onDelete={onDelete}
          userRole={userRole}
          onOpenKnowledgeBase={onOpenKnowledgeBase}
          onOptionChange={onOptionChange}
          chatHistory={chatHistory}
          onChatSelect={onChatSelect}
          handleNewChat={handleNewChat}
          fetchChatHistoryTitle={fetchChatHistoryTitle}
          chatHistoryNextPage={chatHistoryNextPage}
          renameChatTitle={renameChatTitle}
          selectedOption={selectedOption}
          chatHistoryPreviousPage={chatHistoryPreviousPage}
        />
      </div>

      {/* Messages */}
      {messages.length === 0 ? (
        <WelcomeScreen selectedOption={selectedOption} />
      ) : (
        <div
          ref={scrollRef}
          className="flex-1 p-4 overflow-y-auto max-h-[75vh] scrollbar-thin scrollbar-thumb-orange-300 scrollbar-track-orange-100"
          style={{ scrollbarWidth: "thin", overflowX: "hidden" }}
        >
          <div className="space-y-4">
            {messages.map((msg, idx) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                index={idx}
                selectedOption={selectedOption}
              />
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-6">
        <form onSubmit={handleSubmit} className="relative flex items-center">
          <div className="absolute left-3 w-7 h-7 rounded-full">
            {selectedOption === "IT Ticket Generation" ? (
              <img src="/assets/laptopicon.png" className="w-auto h-auto" />
            ) : (
              <img src="/assets/bot-send.png" className="w-auto h-auto" />
            )}
          </div>
          <input
            type="text"
            className="w-full pl-10 pr-12 py-3 rounded-full bg-white shadow-sm border-0 outline-none"
            placeholder={
              selectedOption === "IT Ticket Generation"
                ? "Facing issues with your IT equipment? Just ask"
                : "Got IT in your Mind? Ask Anything"
            }
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          <motion.button
            type="submit"
            className={`absolute right-1 rounded-full w-10 h-10 flex items-center justify-center text-white ${selectedOption === "IT Ticket Generation" ? "bg-orange-400" : "bg-active-bg"
              }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={!inputValue.trim()}
          >
            <SendHorizontal size={18} />
          </motion.button>
        </form>
      </div>
    </div>
  );
}