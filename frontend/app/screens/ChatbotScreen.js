import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { chatbotService } from '../services/api';

export default function ChatbotScreen() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      id: '1',
      text: 'Hello! I\'m My CA App\'s AI assistant. I can help you with:\n\n• Tax calculations\n• Tax saving tips (80C, 80D, HRA)\n• Form 16 queries\n• ITR filing guidance\n• PAN card information\n• Tax slab explanations\n\nHow can I help you today?',
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef(null);

  useEffect(() => {
    loadSuggestions();
    loadChatHistory();
  }, []);

  const loadSuggestions = async () => {
    try {
      const res = await chatbotService.getQuickActions();
      if (res.data.actions) {
        setSuggestions(res.data.actions.map((a) => ({
          id: a.id,
          text: a.title,
          icon: getIcon(a.icon),
        })));
      }
    } catch (error) {
      setSuggestions([
        { id: '1', text: 'Tax Slabs', icon: 'bar-chart' },
        { id: '2', text: 'Section 80C', icon: 'cash' },
        { id: '3', text: 'Form 16 Help', icon: 'document-text' },
        { id: '4', text: 'ITR Filing', icon: 'filing' },
      ]);
    }
  };

  const loadChatHistory = async () => {
    try {
      const history = await AsyncStorage.getItem('chatHistory');
      if (history) {
        const parsedHistory = JSON.parse(history);
        if (parsedHistory.length > 0) {
          setMessages(prev => [...prev, ...parsedHistory]);
        }
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  };

  const saveChatHistory = async (newMessages) => {
    try {
      const historyToSave = newMessages.slice(1).slice(-20);
      await AsyncStorage.setItem('chatHistory', JSON.stringify(historyToSave));
    } catch (error) {
      console.error('Error saving chat history:', error);
    }
  };

  const getIcon = (iconName) => {
    const iconMap = {
      calculator: 'calculator',
      document: 'document-text',
      info: 'information-circle',
      savings: 'wallet',
      help: 'help-circle',
      calendar: 'calendar',
    };
    return iconMap[iconName] || 'chatbubbles';
  };

  const sendMessage = async (text = message) => {
    if (!text.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      text: text.trim(),
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setMessage('');
    setIsTyping(true);

    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);

    try {
      const history = messages.map((m) => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text,
      }));

      const res = await chatbotService.query(text.trim(), history);
      
      const botMessage = {
        id: (Date.now() + 1).toString(),
        text: res.data.response || 'Sorry, I could not understand that. Please try again.',
        sender: 'bot',
        timestamp: new Date(),
      };

      setMessages(prev => {
        const newMessages = [...prev, botMessage];
        saveChatHistory(newMessages);
        return newMessages;
      });
    } catch (error) {
      console.error('Chatbot error:', error);
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, I encountered an error. Please check your internet connection and try again.',
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: '1',
        text: 'Chat cleared! How can I help you with your taxes today?',
        sender: 'bot',
        timestamp: new Date(),
      },
    ]);
    AsyncStorage.removeItem('chatHistory');
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderMessage = ({ item }) => (
    <View style={[styles.messageContainer, item.sender === 'user' && styles.userMessageContainer]}>
      {item.sender === 'bot' && (
        <View style={styles.botAvatar}>
          <Ionicons name="chatbubbles" size={18} color="#fff" />
        </View>
      )}
      <View style={[styles.messageBubble, item.sender === 'user' && styles.userMessageBubble]}>
        <Text style={[styles.messageText, item.sender === 'user' && styles.userMessageText]}>
          {item.text}
        </Text>
        <Text style={[styles.timestamp, item.sender === 'user' && styles.userTimestamp]}>
          {formatTime(item.timestamp)}
        </Text>
      </View>
    </View>
  );

  const renderSuggestion = ({ item }) => (
    <TouchableOpacity style={styles.suggestionChip} onPress={() => sendMessage(item.text)}>
      <Ionicons name={item.icon} size={14} color="#3498db" />
      <Text style={styles.suggestionText}>{item.text}</Text>
    </TouchableOpacity>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerIcon}>
            <Ionicons name="chatbubbles" size={24} color="#fff" />
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>My CA Assistant</Text>
            <Text style={styles.headerSubtitle}>AI-Powered Tax Help</Text>
          </View>
        </View>
        <TouchableOpacity onPress={clearChat} style={styles.clearBtn}>
          <Ionicons name="trash-outline" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {isTyping && (
        <View style={styles.typingIndicator}>
          <View style={styles.typingDot}></View>
          <View style={[styles.typingDot, styles.typingDot2]}></View>
          <View style={[styles.typingDot, styles.typingDot3]}></View>
        </View>
      )}

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        ListHeaderComponent={
          <View style={styles.suggestionsContainer}>
            <Text style={styles.suggestionsLabel}>Quick Actions:</Text>
            <FlatList
              data={suggestions}
              renderItem={renderSuggestion}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
            />
          </View>
        }
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={message}
          onChangeText={setMessage}
          placeholder="Ask about taxes..."
          placeholderTextColor="#bdc3c7"
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[styles.sendButton, !message.trim() && styles.sendButtonDisabled]}
          onPress={() => sendMessage()}
          disabled={!message.trim() || loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons name="send" size={22} color="#fff" />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#2c3e50',
    padding: 15,
    paddingTop: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#3498db',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#bdc3c7',
    marginTop: 2,
  },
  clearBtn: {
    padding: 8,
  },
  typingIndicator: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3498db',
    marginRight: 4,
    opacity: 0.6,
  },
  typingDot2: {
    opacity: 0.8,
  },
  typingDot3: {
    opacity: 1,
  },
  suggestionsContainer: {
    paddingVertical: 12,
  },
  suggestionsLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginLeft: 15,
    marginBottom: 8,
  },
  suggestionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f4fd',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    marginRight: 10,
    marginLeft: 15,
  },
  suggestionText: {
    marginLeft: 6,
    fontSize: 13,
    color: '#3498db',
  },
  messagesList: {
    paddingHorizontal: 15,
    paddingBottom: 10,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-end',
  },
  userMessageContainer: {
    flexDirection: 'row-reverse',
  },
  botAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#3498db',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  messageBubble: {
    maxWidth: '78%',
    backgroundColor: '#fff',
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  userMessageBubble: {
    backgroundColor: '#3498db',
    borderRadius: 18,
    borderBottomRightRadius: 4,
  },
  messageText: {
    fontSize: 15,
    color: '#2c3e50',
    lineHeight: 22,
  },
  userMessageText: {
    color: '#fff',
  },
  timestamp: {
    fontSize: 10,
    color: '#bdc3c7',
    marginTop: 5,
    alignSelf: 'flex-end',
  },
  userTimestamp: {
    color: 'rgba(255,255,255,0.7)',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#fff',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#ecf0f1',
  },
  input: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    maxHeight: 100,
    fontSize: 15,
    color: '#2c3e50',
  },
  sendButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#3498db',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  sendButtonDisabled: {
    backgroundColor: '#bdc3c7',
  },
});
