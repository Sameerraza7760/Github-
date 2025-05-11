import { useState } from "react";
import axios from "axios";
import { showErrorToast, showSuccessToast } from "../utills/toast";
import { ENDPOINTS } from "../utills/Endpoints";

const BASE_URL = "http://192.168.1.208:7000/";

export function useChatbotApi() {

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [chatHistoryNextPage, setChatHistoryNextPage] = useState(null);
  const [selectedOption, setSelectedOption] = useState("IT Info Mate");
  const [chatHistoryPreviousPage, setChatHistoryPreviousPage] = useState(null);
  const [currentChat, setCurrentChat] = useState(
    () => localStorage.getItem('sessionId') || ''
  );
  const getAuthToken = () => {
    return localStorage.getItem("access") || "";
  };

  const sendMessage = async (message) => {
    setLoading(true);
    setError(null);

    try {
      const requestBody = { message };
      const headers = {
        Authorization: Bearer ${getAuthToken()},
      };


      const sessionId = localStorage.getItem("sessionId")
      if (sessionId) {
        requestBody.session_id = sessionId;
      }
      const endpoint = selectedOption === "IT Info Mate"
        ? ENDPOINTS.CHAT_MESSAGES
        : ${ENDPOINTS.CHAT_MESSAGES}agent/

      const response = await axios.post(endpoint, requestBody, { headers });
      if (!sessionId && response.data && response.data.session_id) {
        localStorage.setItem("sessionId", response.data.session_id);
      }
      setLoading(false);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || "Something went wrong!";
      setError(errorMessage);
      showErrorToast(errorMessage);
      setLoading(false);
      return null;
    }
  };

  const addToKnowledgeBase = async (content) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        ENDPOINTS.KNOWLEDGE_BASE,
        // ${BASE_URL}api/v1/chatbot/knowledge/create/,
        content,
        {
          headers: {
            Authorization: Bearer ${getAuthToken()},
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setLoading(false);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.detail || "Failed to update knowledge base!";
      setError(errorMessage);
      showErrorToast(errorMessage);
      setLoading(false);
      return null;
    }
  };

  const fetchChatHistoryTitle = async (url = ENDPOINTS.CHAT_HISTORY, append = false) => {
    try {
      const response = await axios.get(url, {
        headers: {
          Authorization: Bearer ${localStorage.getItem("access")},
        },
        params: {
          agent_type: selectedOption === 'IT Info Mate' ? "chatbot" : "agent"
        }
      });


      if (response?.data?.results) {
        setChatHistory(response?.data?.results);
        setChatHistoryNextPage(response.data.next);
        setChatHistoryPreviousPage(response.data.previous);
      }
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };
   const fetchChatHistory = async (sessionId, page = 1) => {
    try {
      const response = await axios.get(${ENDPOINTS.CHAT_HISTORY}${sessionId}/messages, {
        headers: {
          Authorization: Bearer ${localStorage.getItem("access")},
        },
        params: {
          page: page,
          agent_type: selectedOption === 'IT Info Mate' ? "chatbot" : "agent"
        }
      });

      return response?.data?.results;
    } catch (err) {
      setError(err.message);
      showErrorToast(err.message);
      setLoading(false);
      return [];
    }
  };

  const deleteHistory = async (sessionId) => {
    if (!sessionId) return;

    setLoading(true);
    setError(null);

    try {
      await axios.delete(
        ${ENDPOINTS.CHAT_HISTORY}${sessionId}/,
        {
          headers: {
            Authorization: Bearer ${localStorage.getItem("access")},
          }
        }
      );
      console.log(chatHistory)

      setChatHistory(prev =>
        prev.filter(item => item.id
          !== sessionId)
      );



      // setChatHistory([]);
      setLoading(false);
      // showSuccessToast("Chat history deleted.");
      return true;
    } catch (err) {
      const msg = err.response?.data?.detail || err.message;
      setError(msg);
      showErrorToast(Failed to delete history: ${msg});
      setLoading(false);
      return false;
    }
  };
  const renameChatTitle = async (sessionId, newTitle) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.patch(
        ${ENDPOINTS.CHAT_HISTORY}${sessionId}/,
        { title: newTitle },
        {
          headers: {
            Authorization: Bearer ${getAuthToken()},
            'Content-Type': 'application/json'
          }
        }
      );

      setChatHistory(prev =>
        prev.map(chat =>
          chat.id === sessionId ? { ...chat, title: newTitle } : chat
        )
      );

      setLoading(false);

      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.detail || "Failed to rename chat";
      setError(errorMessage);
      showErrorToast(errorMessage);
      setLoading(false);
      return null;
    }
  };

  return { sendMessage, addToKnowledgeBase, loading, error, fetchChatHistory, fetchChatHistoryTitle, chatHistory, deleteHistory, currentChat, setCurrentChat, renameChatTitle, selectedOption, setSelectedOption, setChatHistoryNextPage, chatHistoryNextPage, chatHistoryPreviousPage };
}