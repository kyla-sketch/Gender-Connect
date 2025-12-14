import { useState } from "react";
import { useAuth } from "@/lib/store";
import { MOCK_USERS, MOCK_MESSAGES, Message, User } from "@/lib/mockData";
import { Send, Phone, Video, MoreVertical, Search, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function Messages() {
  const { currentUser } = useAuth();
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState("");
  
  // Local state for messages to allow "sending"
  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES);

  if (!currentUser) return null;

  // 1. Get all unique users who have exchanged messages with current user
  // For demo, we'll also just add all opposite gender users as "potential" chats to make it look populated
  const potentialChatUsers = MOCK_USERS.filter(u => 
    (currentUser.gender === 'male' && u.gender === 'female') ||
    (currentUser.gender === 'female' && u.gender === 'male')
  );

  const selectedUser = potentialChatUsers.find(u => u.id === selectedChatId);

  // Filter messages for the selected conversation
  const currentChatMessages = messages.filter(m => 
    (m.senderId === currentUser.id && m.receiverId === selectedChatId) ||
    (m.senderId === selectedChatId && m.receiverId === currentUser.id)
  ).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !selectedChatId) return;

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      senderId: currentUser.id,
      receiverId: selectedChatId,
      text: messageInput,
      timestamp: new Date().toISOString()
    };

    setMessages([...messages, newMessage]);
    setMessageInput("");
  };

  return (
    <div className="h-[calc(100vh-theme(spacing.0))] md:h-screen flex flex-col md:flex-row overflow-hidden bg-white">
      {/* Chat List Sidebar */}
      <div className={cn(
        "w-full md:w-96 border-r border-gray-100 flex flex-col bg-gray-50/50",
        selectedChatId ? "hidden md:flex" : "flex"
      )}>
        <div className="p-6 pb-2">
          <h1 className="text-2xl font-serif font-bold text-gray-900 mb-6">Messages</h1>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input 
              placeholder="Search matches..." 
              className="pl-9 bg-white border-gray-200 rounded-xl focus-visible:ring-primary/20" 
            />
          </div>
        </div>

        <ScrollArea className="flex-1 px-3">
          <div className="space-y-1 pb-4">
            {potentialChatUsers.map(user => {
              // Find last message
              const lastMsg = messages
                .filter(m => (m.senderId === user.id && m.receiverId === currentUser.id) || (m.senderId === currentUser.id && m.receiverId === user.id))
                .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];

              return (
                <button
                  key={user.id}
                  onClick={() => setSelectedChatId(user.id)}
                  className={cn(
                    "w-full p-3 flex items-center gap-3 rounded-xl transition-all duration-200 hover:bg-white hover:shadow-sm text-left group",
                    selectedChatId === user.id ? "bg-white shadow-md" : "transparent"
                  )}
                >
                  <div className="relative">
                    <img src={user.avatar} alt={user.name} className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm" />
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className={cn("font-medium text-gray-900", selectedChatId === user.id && "text-primary")}>
                        {user.name}
                      </span>
                      {lastMsg && (
                        <span className="text-xs text-gray-400">
                          {new Date(lastMsg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 truncate group-hover:text-gray-700 transition-colors">
                      {lastMsg ? lastMsg.text : "Start a conversation"}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </ScrollArea>
      </div>

      {/* Chat Window */}
      <div className={cn(
        "flex-1 flex flex-col bg-white",
        !selectedChatId ? "hidden md:flex" : "flex"
      )}>
        {selectedUser ? (
          <>
            {/* Header */}
            <header className="h-20 border-b border-gray-100 flex items-center justify-between px-6 bg-white shrink-0">
               <div className="flex items-center gap-4">
                 <Button 
                   variant="ghost" 
                   size="icon" 
                   className="md:hidden -ml-2"
                   onClick={() => setSelectedChatId(null)}
                 >
                   <ArrowLeft className="w-5 h-5" />
                 </Button>
                 
                 <div className="flex items-center gap-3">
                   <img src={selectedUser.avatar} alt={selectedUser.name} className="w-10 h-10 rounded-full object-cover" />
                   <div>
                     <h2 className="font-serif font-bold text-gray-900">{selectedUser.name}</h2>
                     <p className="text-xs text-green-600 font-medium flex items-center gap-1">
                       <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                       Online now
                     </p>
                   </div>
                 </div>
               </div>
               
               <div className="flex items-center gap-1">
                 <Button variant="ghost" size="icon" className="text-gray-400 hover:text-primary rounded-full">
                   <Phone className="w-5 h-5" />
                 </Button>
                 <Button variant="ghost" size="icon" className="text-gray-400 hover:text-primary rounded-full">
                   <Video className="w-5 h-5" />
                 </Button>
                 <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-600 rounded-full">
                   <MoreVertical className="w-5 h-5" />
                 </Button>
               </div>
            </header>

            {/* Messages Area */}
            <ScrollArea className="flex-1 p-6 bg-[#FAFAFA]">
              <div className="space-y-6 flex flex-col">
                <div className="text-center text-xs text-gray-400 my-4 uppercase tracking-widest font-medium">Today</div>
                
                {currentChatMessages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center opacity-50">
                    <img src={selectedUser.avatar} className="w-20 h-20 rounded-full mb-4 grayscale" />
                    <p className="text-sm">You matched with {selectedUser.name}!</p>
                    <p className="text-sm">Say hello to break the ice.</p>
                  </div>
                ) : (
                  currentChatMessages.map(msg => {
                    const isMe = msg.senderId === currentUser.id;
                    return (
                      <div 
                        key={msg.id} 
                        className={cn(
                          "flex max-w-[80%]",
                          isMe ? "self-end flex-row-reverse" : "self-start"
                        )}
                      >
                        <div className={cn(
                          "px-5 py-3 rounded-2xl shadow-sm text-sm leading-relaxed",
                          isMe 
                            ? "bg-primary text-white rounded-tr-none" 
                            : "bg-white text-gray-800 rounded-tl-none border border-gray-100"
                        )}>
                          {msg.text}
                        </div>
                        <span className="text-[10px] text-gray-400 self-end mx-2 mb-1">
                           {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-gray-100 shrink-0">
              <form onSubmit={handleSendMessage} className="flex items-center gap-3 max-w-4xl mx-auto">
                <Input 
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder={`Message ${selectedUser.name}...`}
                  className="rounded-full bg-gray-50 border-transparent focus:bg-white focus:border-primary/20 transition-all py-6 pl-6"
                />
                <Button 
                  type="submit" 
                  disabled={!messageInput.trim()}
                  className="rounded-full w-12 h-12 shrink-0 bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25"
                >
                  <Send className="w-5 h-5 ml-0.5" />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 text-center p-8">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-sm mb-6">
              <MessageCircle className="w-10 h-10 text-gray-300" />
            </div>
            <h2 className="text-2xl font-serif font-bold text-gray-900 mb-2">Your Conversations</h2>
            <p className="text-gray-500 max-w-sm">Select a match from the sidebar to start chatting or head to the Discover page to find new people.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ArrowLeft({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="m12 19-7-7 7-7"/>
      <path d="M19 12H5"/>
    </svg>
  );
}
