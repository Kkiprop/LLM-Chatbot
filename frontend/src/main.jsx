import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import axios from 'axios'; // Import Axios for making API requests
import botImg from '/logo.svg';
import userImg from '/user.svg';
import '/index.css';

const App = () => {
  const [chat, setChat] = useState([
    {
      role: { system: null },
      content: "I'll help you build the best trading portfolio"
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatBoxRef = useRef(null);

  const formatDate = (date) => {
    const h = '0' + date.getHours();
    const m = '0' + date.getMinutes();
    return `${h.slice(-2)}:${m.slice(-2)}`;
  };

  const fetchCryptoData = async (message) => {
    const apiKey = 'GvzUgX7fwzUrcdwtCu'; // Replace with your API key
    const baseUrl = 'https://api.coingecko.com/api/v3';

    // Extract crypto-related keywords from the message
    const cryptoKeywords = ['bitcoin', 'ethereum', 'crypto', 'btc', 'eth'];

    // Check if the message contains any of the keywords
    if (cryptoKeywords.some(keyword => message.toLowerCase().includes(keyword))) {
      try {
        // Example: Fetch Bitcoin price in USD from CoinGecko API
        const response = await axios.get(`${baseUrl}/simple/price`, {
          params: {
            ids: 'bitcoin,ethereum', // You can add more coins here
            vs_currencies: 'usd'
          },
          headers: {
            'Authorization': `Bearer ${apiKey}` // Include your API key in the request header if necessary
          }
        });

        const btcPrice = response.data.bitcoin.usd;
        const ethPrice = response.data.ethereum.usd;

        return `Current prices: Bitcoin (BTC) - $${btcPrice}, Ethereum (ETH) - $${ethPrice}`;
      } catch (error) {
        console.error("Error fetching crypto data:", error);
        return "Sorry, I couldn't fetch the crypto market data right now.";
      }
    }
    return null;
  };

  const askAgent = async (messages) => {
    try {
      const userMessage = messages[messages.length - 1].content;
      
      // First, check if the query is crypto-related and fetch data if necessary
      const cryptoResponse = await fetchCryptoData(userMessage);
      if (cryptoResponse) {
        setChat((prevChat) => {
          const newChat = [...prevChat];
          newChat.pop(); // Remove the 'Thinking ...' message
          newChat.push({ role: { system: null }, content: cryptoResponse });
          return newChat;
        });
      } else {
        // Otherwise, process the query through the backend (LLM)
        const response = await backend.chat(messages);
        setChat((prevChat) => {
          const newChat = [...prevChat];
          newChat.pop(); // Remove the 'Thinking ...' message
          newChat.push({ role: { system: null }, content: response });
          return newChat;
        });
      }
    } catch (e) {
      console.log(e);
      setChat((prevChat) => {
        const newChat = [...prevChat];
        newChat.pop();
        return newChat;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage = {
      role: { user: null },
      content: inputValue
    };
    const thinkingMessage = {
      role: { system: null },
      content: 'Thinking ...'
    };
    setChat((prevChat) => [...prevChat, userMessage, thinkingMessage]);
    setInputValue('');
    setIsLoading(true);
    const messagesToSend = chat.slice(1).concat(userMessage);
    askAgent(messagesToSend);
  };

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [chat]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="flex h-[80vh] w-full max-w-2xl flex-col rounded-lg bg-white shadow-lg">
        {/* Flex Cards Above the Chat Box */}
        <div className="flex space-x-4 p-4">
          <div className="flex-1 bg-blue-100 rounded-lg p-4 shadow-lg">
            <h3 className="font-bold text-lg">Market Gap Analysis</h3>
            <p>Crypto Trends and Predictions</p>
          </div>
          <div className="flex-1 bg-green-100 rounded-lg p-4 shadow-lg">
            <h3 className="font-bold text-lg">Discounts Hunting</h3>
            <p>Amazing Low Prices</p>
          </div>
          <div className="flex-1 bg-yellow-100 rounded-lg p-4 shadow-lg">
            <h3 className="font-bold text-lg">Investment Tips</h3>
            <p>Portfolio Tips</p>
          </div>
        </div>

        {/* Chat Container */}
        <div className="flex-1 overflow-y-auto rounded-t-lg bg-gray-100 p-4" ref={chatBoxRef}>
          {chat.map((message, index) => {
            const isUser = 'user' in message.role;
            const img = isUser ? userImg : botImg;
            const name = isUser ? 'User' : 'System';
            const text = message.content;

            return (
              <div key={index} className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
                {!isUser && (
                  <div
                    className="mr-2 h-10 w-10 rounded-full"
                    style={{ backgroundImage: `url(${img})`, backgroundSize: 'cover' }}
                  ></div>
                )}
                <div className={`max-w-[70%] rounded-lg p-3 ${isUser ? 'bg-blue-500 text-white' : 'bg-white shadow'}`}>
                  <div
                    className={`mb-1 flex items-center justify-between text-sm ${isUser ? 'text-white' : 'text-gray-500'}`}
                  >
                    <div>{name}</div>
                    <div className="mx-2">{formatDate(new Date())}</div>
                  </div>
                  <div>{text}</div>
                </div>
                {isUser && (
                  <div
                    className="ml-2 h-10 w-10 rounded-full"
                    style={{ backgroundImage: `url(${img})`, backgroundSize: 'cover' }}
                  ></div>
                )}
              </div>
            );
          })}
        </div>

        {/* Input Box */}
        <form className="flex rounded-b-lg border-t bg-white p-4" onSubmit={handleSubmit}>
          <input
            type="text"
            className="flex-1 rounded-l border p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ask anything ..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isLoading}
          />
          <button
            type="submit"
            className="rounded-r bg-blue-500 p-2 text-white hover:bg-blue-600 disabled:bg-blue-300"
            disabled={isLoading}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default App;

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
