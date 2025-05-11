import { AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { useChatbotApi } from "../../hooks/useChatBot";
import ChatInterface from "./chat-interface";
import KnowledgeBaseModal from "./knowledge-base";

export default function ITinfomate() {
  const [showWelcome, setShowWelcome] = useState(true);
  const [messages, setMessages] = useState([]);
  const [showKnowledgeBase, setShowKnowledgeBase] = useState(false);
  const [userRole, setUserRole] = useState(false)

  const { sendMessage, fetchChatHistoryTitle, chatHistory, fetchChatHistory, deleteHistory, renameChatTitle, selectedOption, setSelectedOption, chatHistoryNextPage, chatHistoryPreviousPage } = useChatbotApi();

  useEffect(() => {
    const role = localStorage.getItem("role");
    setUserRole(role)
  }, [])

  const handleLoadMoreMessages = async (pageNum) => {
    const sessionId = localStorage.getItem("sessionId");
    if (!sessionId) return [];

    const messages = await fetchChatHistory(sessionId, pageNum);
    return messages;
  };


  useEffect(() => {
    const role = localStorage.getItem("role");
    setUserRole(role);

    if (role === "admin") {
      setSelectedOption("IT Info Mate");
      localStorage.removeItem("selectedOption");
    } else {
      const storedOption = localStorage.getItem("selectedOption");
      if (storedOption) {
        setSelectedOption(storedOption);
      }
    }
  }, []);

  const handleOptionChange = (option) => {
    setMessages([])
    localStorage.removeItem('sessionId')
    setSelectedOption(option);
    localStorage.setItem("selectedOption", option);
    // setOpenDropdown(false);
  };


  const handleSendMessage = async (message) => {
    const now = new Date();
    const timestamp = ${now.getHours()}:${now.getMinutes().toString().padStart(2, "0")} PM;

    const newMessage = {
      id: Date.now().toString(),
      content: message,
      sender: "user",
      timestamp,
    };
    setMessages((prev) => [...prev, newMessage]);


    const loadingMessage = {
      id: (Date.now() + 1).toString(),
      content: "",
      sender: "bot",
      timestamp,
      isLoading: true,
    };
    setMessages((prev) => [...prev, loadingMessage]);

    const data = await sendMessage(message);

    // Helper function to convert hex to base64
    const hexToBase64 = (hexString) => {
      // Convert hex to binary (ArrayBuffer)
      const bytes = new Uint8Array(hexString.length / 2);
      for (let i = 0; i < hexString.length; i += 2) {
        bytes[i / 2] = parseInt(hexString.substr(i, 2), 16);
      }
      // Convert binary to base64
      const binaryString = String.fromCharCode.apply(null, bytes);
      return btoa(binaryString);
    };

    if (data) {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === loadingMessage.id
            ? {
              ...msg,
              content: data.content || data.message || "Bot response here...",
              isLoading: false,
              formUrl: data.form
                ? data:application/pdf;base64,${hexToBase64(data.form.data)}
                : null,
            }
            : msg
        )
      );
    } else {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === loadingMessage.id
            ? { ...msg, content: "Sorry, something went wrong!", isLoading: false }
            : msg
        )
      );
    }
  };

  const toggleKnowledgeBase = () => {
    setShowKnowledgeBase((prev) => !prev);
  };


  const handleSelectChat = async (sessionId) => {
    if (!sessionId) return;
    try {
      localStorage.setItem("sessionId", sessionId)

      const fetchedMessages = await fetchChatHistory(sessionId);
      if (fetchedMessages.length > 0) {
        setMessages(fetchedMessages);
      }
      console.log(fetchedMessages);
    } catch (error) {
      console.log(error);
    }

  };


  const handleNewChat = () => {
    localStorage.removeItem("sessionId")
    setMessages([])

  }


  const handleDelete = async (id) => {
    try {

      await deleteHistory(id)
      const sessionId = localStorage.getItem("sessionId")
      console.log(sessionId, id)
      if (sessionId === id) {
        console.log("conditionTrue")
        setMessages([])
        localStorage.removeItem("sessionId");
      }

    } catch (error) {
      console.log(error)
    }
  }
  return (
    <main className="flex max-h-screen flex-col items-center justify-center font-sans ml-16 p-2 ">
      <div className="w-full max-w-xl h-full bg-white rounded-xl overflow-hidden shadow-2xl relative border border-orange-100">

        <ChatInterface
          handleNewChat={handleNewChat}
          chatHistory={chatHistory}
          onChatSelect={handleSelectChat}
          messages={messages} onSendMessage={handleSendMessage}
          onOpenKnowledgeBase={userRole === "admin" ? toggleKnowledgeBase : null}
          userRole={userRole}
          onOptionChange={handleOptionChange}
          selectedOption={selectedOption}
          chatHistoryPreviousPage={chatHistoryPreviousPage}
          onDelete={handleDelete}
          renameChatTitle={renameChatTitle}
          chatHistoryNextPage={chatHistoryNextPage}
          fetchChatHistoryTitle={fetchChatHistoryTitle}
          onLoadMoreMessages={handleLoadMoreMessages}
          setMessages={setMessages}
         
        />

        <AnimatePresence>
          {showKnowledgeBase && userRole === "admin" && <KnowledgeBaseModal onClose={toggleKnowledgeBase} />}

          {/* {showKnowledgeBase && <KnowledgeBaseModal onClose={toggleKnowledgeBase} />} */}
        </AnimatePresence>
      </div>
    </main>
  );
}