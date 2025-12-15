import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/lib/store";
import { messagesAPI, matchesAPI } from "@/lib/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Send, Phone, Video, MoreVertical, Search, MessageCircle, Loader2, Heart, Image, Smile, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import EmojiPicker from "emoji-picker-react";

export default function Messages() {
  const { currentUser } = useAuth();
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  if (!currentUser) return null;

  // Fetch all conversations (users we've chatted with)
  const { data: conversations = [], isLoading: conversationsLoading } = useQuery({
    queryKey: ["conversations"],
    queryFn: () => messagesAPI.getConversations(),
    enabled: !!currentUser,
  });

  // Fetch matches (mutual likes)
  const { data: matches = [], isLoading: matchesLoading } = useQuery({
    queryKey: ["matches"],
    queryFn: () => matchesAPI.getMatches(),
    enabled: !!currentUser,
  });

  // Fetch messages for selected conversation
  const { data: messages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ["messages", selectedChatId],
    queryFn: () => messagesAPI.getConversation(selectedChatId!),
    enabled: !!selectedChatId,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: messagesAPI.sendMessage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages", selectedChatId] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      setMessageInput("");
    },
  });

  // Send image message mutation
  const sendImageMutation = useMutation({
    mutationFn: ({ receiverId, imageFile, caption }: { receiverId: string; imageFile: File; caption?: string }) =>
      messagesAPI.sendImageMessage(receiverId, imageFile, caption),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages", selectedChatId] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      setSelectedImage(null);
      setImagePreview(null);
      setMessageInput("");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send image",
        variant: "destructive",
      });
    },
  });

  // Send emoji message mutation
  const sendEmojiMutation = useMutation({
    mutationFn: ({ receiverId, emoji }: { receiverId: string; emoji: string }) =>
      messagesAPI.sendEmojiMessage(receiverId, emoji),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages", selectedChatId] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });

  const selectedUser = [...matches, ...conversations].find(u => u.id === selectedChatId);

  // Handle image selection
  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle emoji selection
  const handleEmojiClick = (emojiData: any) => {
    setMessageInput(prev => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  // Handle sending messages
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() && !selectedImage) return;
    if (!selectedChatId) return;

    if (selectedImage) {
      // Send image message
      sendImageMutation.mutate({
        receiverId: selectedChatId,
        imageFile: selectedImage,
        caption: messageInput.trim() || undefined,
      });
    } else {
      // Send text message
      sendMessageMutation.mutate({
        receiverId: selectedChatId,
        text: messageInput,
        type: 'text',
      });
    }
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
              data-testid="input-search-conversations"
            />
          </div>
        </div>

        <Tabs defaultValue="matches" className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-2 mx-3 mb-2">
            <TabsTrigger value="matches" className="rounded-lg">Matches</TabsTrigger>
            <TabsTrigger value="messages" className="rounded-lg">Messages</TabsTrigger>
          </TabsList>

          <TabsContent value="matches" className="flex-1 m-0">
            <ScrollArea className="flex-1 px-3">
              {matchesLoading ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : matches.length === 0 ? (
                <div className="text-center py-10 px-4">
                  <Heart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground">No matches yet. Keep liking profiles!</p>
                </div>
              ) : (
                <div className="space-y-1 pb-4">
                  {matches.map(user => (
                    <button
                      key={user.id}
                      onClick={() => setSelectedChatId(user.id)}
                      className={cn(
                        "w-full p-3 flex items-center gap-3 rounded-xl transition-all duration-200 hover:bg-white hover:shadow-sm text-left group",
                        selectedChatId === user.id ? "bg-white shadow-md" : "transparent"
                      )}
                      data-testid={`button-match-${user.id}`}
                    >
                      <div className="relative">
                        {user.avatar ? (
                          <img src={user.avatar} alt={user.name} className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm" />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold border-2 border-white shadow-sm">
                            {user.name[0]}
                          </div>
                        )}
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-pink-500 rounded-full border-2 border-white flex items-center justify-center">
                          <Heart className="w-2.5 h-2.5 text-white fill-current" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className={cn("font-medium text-gray-900", selectedChatId === user.id && "text-primary")} data-testid={`text-match-name-${user.id}`}>
                            {user.name}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 truncate group-hover:text-gray-700 transition-colors">
                          You matched! Say hello
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="messages" className="flex-1 m-0">
            <ScrollArea className="flex-1 px-3">
              {conversationsLoading ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : conversations.length === 0 ? (
                <div className="text-center py-10 px-4">
                  <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground">No conversations yet. Start chatting with your matches!</p>
                </div>
              ) : (
                <div className="space-y-1 pb-4">
                  {conversations.map(user => (
                    <button
                      key={user.id}
                      onClick={() => setSelectedChatId(user.id)}
                      className={cn(
                        "w-full p-3 flex items-center gap-3 rounded-xl transition-all duration-200 hover:bg-white hover:shadow-sm text-left group",
                        selectedChatId === user.id ? "bg-white shadow-md" : "transparent"
                      )}
                      data-testid={`button-conversation-${user.id}`}
                    >
                      <div className="relative">
                        {user.avatar ? (
                          <img src={user.avatar} alt={user.name} className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm" />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold border-2 border-white shadow-sm">
                            {user.name[0]}
                          </div>
                        )}
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className={cn("font-medium text-gray-900", selectedChatId === user.id && "text-primary")} data-testid={`text-conversation-name-${user.id}`}>
                            {user.name}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 truncate group-hover:text-gray-700 transition-colors">
                          Start a conversation
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
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
                   data-testid="button-back-to-conversations"
                 >
                   <ArrowLeft className="w-5 h-5" />
                 </Button>
                 
                 <div className="flex items-center gap-3">
                   {selectedUser.avatar ? (
                     <img src={selectedUser.avatar} alt={selectedUser.name} className="w-10 h-10 rounded-full object-cover" />
                   ) : (
                     <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                       {selectedUser.name[0]}
                     </div>
                   )}
                   <div>
                     <h2 className="font-serif font-bold text-gray-900" data-testid="text-selected-user-name">{selectedUser.name}</h2>
                     <p className="text-xs text-green-600 font-medium flex items-center gap-1">
                       <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                       Online now
                     </p>
                   </div>
                 </div>
               </div>
               
               <div className="flex items-center gap-1">
                 <Button variant="ghost" size="icon" className="text-gray-400 hover:text-primary rounded-full" data-testid="button-call">
                   <Phone className="w-5 h-5" />
                 </Button>
                 <Button variant="ghost" size="icon" className="text-gray-400 hover:text-primary rounded-full" data-testid="button-video">
                   <Video className="w-5 h-5" />
                 </Button>
                 <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-600 rounded-full" data-testid="button-more">
                   <MoreVertical className="w-5 h-5" />
                 </Button>
               </div>
            </header>

            {/* Messages Area */}
            <ScrollArea className="flex-1 p-6 bg-[#FAFAFA]">
              {messagesLoading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : (
                <div className="space-y-6 flex flex-col">
                  <div className="text-center text-xs text-gray-400 my-4 uppercase tracking-widest font-medium">Today</div>
                  
                  {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center opacity-50">
                      {selectedUser.avatar ? (
                        <img src={selectedUser.avatar} className="w-20 h-20 rounded-full mb-4 grayscale" alt={selectedUser.name} />
                      ) : (
                        <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center text-2xl font-semibold text-gray-400 mb-4">
                          {selectedUser.name[0]}
                        </div>
                      )}
                      <p className="text-sm">You matched with {selectedUser.name}!</p>
                      <p className="text-sm">Say hello to break the ice.</p>
                    </div>
                  ) : (
                    messages.map(msg => {
                      const isMe = msg.senderId === currentUser.id;
                      return (
                        <div 
                          key={msg.id} 
                          className={cn(
                            "flex max-w-[80%]",
                            isMe ? "self-end flex-row-reverse" : "self-start"
                          )}
                          data-testid={`message-${msg.id}`}
                        >
                          <div className={cn(
                            "px-5 py-3 rounded-2xl shadow-sm text-sm leading-relaxed max-w-full",
                            isMe 
                              ? "bg-primary text-white rounded-tr-none" 
                              : "bg-white text-gray-800 rounded-tl-none border border-gray-100"
                          )}>
                            {msg.type === 'image' && msg.imageUrl ? (
                              <div className="space-y-2">
                                <img 
                                  src={msg.imageUrl} 
                                  alt="Shared image" 
                                  className="rounded-lg max-w-full h-auto max-h-64 object-cover cursor-pointer"
                                  onClick={() => window.open(msg.imageUrl, '_blank')}
                                />
                                {msg.text && <p className="text-sm">{msg.text}</p>}
                              </div>
                            ) : msg.type === 'emoji' ? (
                              <span className="text-2xl">{msg.text}</span>
                            ) : (
                              <p>{msg.text}</p>
                            )}
                          </div>
                          <span className="text-[10px] text-gray-400 self-end mx-2 mb-1">
                             {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </ScrollArea>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-gray-100 shrink-0">
              {/* Image Preview */}
              {imagePreview && (
                <div className="mb-3 flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <img src={imagePreview} alt="Preview" className="w-16 h-16 object-cover rounded-lg" />
                  <div className="flex-1">
                    <Input
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      placeholder="Add a caption..."
                      className="border-0 bg-transparent p-0 h-auto focus-visible:ring-0 text-sm"
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setSelectedImage(null);
                      setImagePreview(null);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}

              <form onSubmit={handleSendMessage} className="flex items-center gap-3 max-w-4xl mx-auto">
                <div className="flex items-center gap-2">
                  {/* Image Upload Button */}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-gray-400 hover:text-primary rounded-full"
                    disabled={sendMessageMutation.isPending || sendImageMutation.isPending}
                  >
                    <Image className="w-5 h-5" />
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />

                  {/* Emoji Picker Button */}
                  <div className="relative">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className="text-gray-400 hover:text-primary rounded-full"
                      disabled={sendMessageMutation.isPending || sendImageMutation.isPending}
                    >
                      <Smile className="w-5 h-5" />
                    </Button>
                    {showEmojiPicker && (
                      <div className="absolute bottom-12 left-0 z-50">
                        <EmojiPicker onEmojiClick={handleEmojiClick} />
                      </div>
                    )}
                  </div>
                </div>

                <Input 
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder={selectedImage ? "Add a caption..." : `Message ${selectedUser.name}...`}
                  className="rounded-full bg-gray-50 border-transparent focus:bg-white focus:border-primary/20 transition-all py-6 pl-6 flex-1"
                  disabled={sendMessageMutation.isPending || sendImageMutation.isPending}
                  data-testid="input-message"
                />
                <Button 
                  type="submit" 
                  disabled={(!messageInput.trim() && !selectedImage) || sendMessageMutation.isPending || sendImageMutation.isPending}
                  className="rounded-full w-12 h-12 shrink-0 bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25"
                  data-testid="button-send-message"
                >
                  {(sendMessageMutation.isPending || sendImageMutation.isPending) ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5 ml-0.5" />
                  )}
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
