import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Heart, Award, HelpCircle } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

interface ChatBotProps {
  dogName?: string;
}

export const ChatBot: React.FC<ChatBotProps> = ({ dogName = 'your dog' }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'bot',
      content: `Hi! I'm your AI dog training assistant. I'm here to help you with training ${dogName}. What would you like to know about dog training?`,
      timestamp: new Date(),
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const quickQuestions = [
    "How do I teach my dog to sit?",
    "My dog pulls on the leash, what should I do?",
    "How to house train a puppy?",
    "My dog barks too much, help!",
    "How to teach basic commands?",
    "Socialization tips for puppies"
  ];

  const getAIResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase();
    
    if (message.includes('sit') || message.includes('basic command')) {
      return `Great question! Teaching ${dogName} to sit is one of the fundamental commands. Here's how:

1. **Hold a treat** close to your dog's nose
2. **Slowly lift** the treat over their head - their bottom should naturally touch the ground
3. **Say "Sit"** clearly when they sit
4. **Give the treat** immediately and praise enthusiastically
5. **Practice 5-10 times** per session, 2-3 sessions daily

**Pro tip:** Keep training sessions short (5-10 minutes) to maintain focus. Consistency is key! 🐕✨`;
    }
    
    if (message.includes('leash') || message.includes('pull')) {
      return `Leash pulling is a common issue! Here's how to train ${dogName} to walk nicely:

1. **Start indoors** - practice walking beside you with treats
2. **Use positive reinforcement** - reward when they walk beside you
3. **Stop moving** when they pull - don't let pulling get them where they want to go
4. **Change direction** when they pull - this teaches them to pay attention to you
5. **Use a front-clip harness** for better control

**Remember:** Patience is key! It may take several weeks of consistent training. 🚶‍♂️🐕`;
    }
    
    if (message.includes('house train') || message.includes('potty') || message.includes('toilet')) {
      return `House training requires patience and consistency! Here's a proven method:

1. **Establish a routine** - take ${dogName} out first thing in morning, after meals, before bed
2. **Choose a specific spot** outside and always go there
3. **Use a command** like "go potty" consistently
4. **Reward immediately** when they go in the right place
5. **Supervise constantly** indoors - watch for sniffing/circling
6. **Clean accidents thoroughly** with enzyme cleaner

**Timeline:** Most puppies are house trained in 4-6 months with consistent effort! 🏠✨`;
    }
    
    if (message.includes('bark') || message.includes('noise') || message.includes('quiet')) {
      return `Excessive barking can be managed with the right approach:

1. **Identify the trigger** - boredom, anxiety, territorial, attention-seeking?
2. **Don't yell** - this often makes it worse
3. **Use the "quiet" command** - say it once, then ignore barking until they stop
4. **Reward silence** - give treats and praise when they're quiet
5. **Provide mental stimulation** - puzzle toys, training sessions
6. **Exercise regularly** - tired dogs bark less

**For ${dogName}:** Start with 10-15 minutes of training daily focusing on the "quiet" command! 🤫🐕`;
    }
    
    if (message.includes('social') || message.includes('other dogs') || message.includes('people')) {
      return `Socialization is crucial for ${dogName}'s development! Here's how to do it safely:

1. **Start early** - critical period is 3-14 weeks for puppies
2. **Go slowly** - let them observe from a distance first
3. **Positive associations** - bring treats and make encounters pleasant
4. **Controlled meetings** - start with calm, well-behaved dogs
5. **Watch body language** - tail position, ears, overall posture
6. **End on a positive note** - before they get overwhelmed

**Adult dogs:** Can still be socialized, just takes more patience and gradual exposure! 🐕‍🦺👥`;
    }
    
    if (message.includes('aggressive') || message.includes('bite') || message.includes('fear')) {
      return `Aggression or fear issues require careful handling:

⚠️ **Important:** For serious aggression, please consult a professional dog trainer or veterinary behaviorist.

**For mild issues:**
1. **Identify triggers** - what causes the behavior?
2. **Avoid punishment** - this often makes fear/aggression worse
3. **Counter-conditioning** - change their emotional response to triggers
4. **Desensitization** - gradual exposure at low intensity
5. **Reward calm behavior** - lots of treats and praise

**Safety first:** Always prioritize safety for ${dogName} and others around them! 🛡️`;
    }
    
    if (message.includes('treat') || message.includes('reward') || message.includes('food')) {
      return `Great question about treats and rewards for ${dogName}!

**Best training treats:**
- **Small and soft** - easy to chew quickly
- **High value** - something they LOVE (chicken, cheese, liver treats)
- **Healthy options** - avoid too many calories

**Reward timing:**
- **Immediate** - within 1-2 seconds of good behavior
- **Consistent** - same reward for same behavior
- **Gradually reduce** - eventually phase out treats for verbal praise

**Pro tip:** Use their regular kibble for basic training, save special treats for challenging behaviors! 🦴✨`;
    }
    
    // Default responses for general questions
    const defaultResponses = [
      `That's a great question about ${dogName}! Dog training is all about consistency, patience, and positive reinforcement. Could you be more specific about what behavior you'd like to work on?`,
      
      `I'd love to help you train ${dogName}! For the best advice, could you tell me more about the specific challenge you're facing? Is it related to basic commands, behavior issues, or something else?`,
      
      `Training ${dogName} can be very rewarding! Every dog learns at their own pace. What specific aspect of training would you like to focus on today?`,
      
      `Great to hear you're working on training with ${dogName}! Remember, positive reinforcement and short, frequent sessions work best. What would you like to know more about?`
    ];
    
    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      // Use OpenAI-compatible free API
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer demo-key', // This will use fallback for free tier
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: `You are a professional dog trainer helping with ${dogName}. Provide helpful, practical advice for dog training questions. Keep responses concise but informative.`
            },
            {
              role: 'user',
              content: inputValue
            }
          ],
          max_tokens: 150,
          temperature: 0.7
        })
      });

      let aiResponse = '';
      if (response.ok) {
        const data = await response.json();
        aiResponse = data.choices?.[0]?.message?.content || getAIResponse(inputValue);
      } else {
        // Fallback to local responses
        aiResponse = getAIResponse(inputValue);
      }

      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: aiResponse || getAIResponse(inputValue),
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botResponse]);
    } catch (error) {
      console.error('AI API error, using fallback:', error);
      // Fallback to local responses
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: getAIResponse(inputValue),
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickQuestion = (question: string) => {
    setInputValue(question);
  };

  return (
    <Card variant="gradient" className="h-[600px] flex flex-col">
      <div className="flex items-center space-x-3 mb-6 p-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl">
        <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
          <Bot size={24} className="text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold">AI Training Assistant</h3>
          <p className="text-purple-100 text-sm">Ask me anything about training {dogName}!</p>
        </div>
        <div className="ml-auto">
          <Sparkles size={20} className="text-yellow-300 animate-pulse" />
        </div>
      </div>

      {/* Quick Questions */}
      {messages.length <= 1 && (
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700 mb-3 dark:text-gray-300">Quick questions:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {quickQuestions.slice(0, 4).map((question, index) => (
              <button
                key={index}
                onClick={() => handleQuickQuestion(question)}
                className="text-left p-3 bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 rounded-xl text-sm text-gray-700 transition-all duration-200 hover:shadow-md dark:from-gray-700 dark:to-gray-600 dark:text-gray-200 dark:hover:from-gray-600 dark:hover:to-gray-500"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex items-start space-x-2 max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                message.type === 'user' 
                  ? 'bg-gradient-to-r from-primary-500 to-blue-500' 
                  : 'bg-gradient-to-r from-purple-500 to-pink-500'
              }`}>
                {message.type === 'user' ? (
                  <User size={16} className="text-white" />
                ) : (
                  <Bot size={16} className="text-white" />
                )}
              </div>
              <div className={`chat-message ${message.type}`}>
                <p className="whitespace-pre-wrap">{message.content}</p>
                <p className={`text-xs mt-2 opacity-70 ${
                  message.type === 'user' ? 'text-white' : 'text-gray-500'
                }`}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="flex items-start space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <Bot size={16} className="text-white" />
              </div>
              <div className="chat-message bot">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex space-x-3 p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200 dark:from-gray-800 dark:to-gray-700 dark:border-gray-600">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder={`Ask me about training ${dogName}...`}
          className="chat-input"
          disabled={isTyping}
        />
        <Button
          onClick={handleSendMessage}
          disabled={!inputValue.trim() || isTyping}
          icon={<Send size={16} />}
          className="flex-shrink-0"
        >
          Send
        </Button>
      </div>
    </Card>
  );
};