import { Component, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';

interface ChatMessage {
  role: 'user' | 'bot';
  text: string;
  time: Date;
}

@Component({
  selector: 'app-customer-chat',
  templateUrl: './customer-chat.component.html',
})
export class CustomerChatComponent implements AfterViewChecked {
  @ViewChild('chatBody') chatBody!: ElementRef;
  messages: ChatMessage[] = [
    { role: 'bot', text: "Hi! I'm your FoodQR assistant. How can I help you today? Type 'help' to see what I can do.", time: new Date() },
  ];
  input = '';
  loading = false;

  constructor(private api: ApiService) {}

  ngAfterViewChecked(): void {
    this.scrollBottom();
  }

  send(): void {
    const text = this.input.trim();
    if (!text || this.loading) return;
    this.messages.push({ role: 'user', text, time: new Date() });
    this.input = '';
    this.loading = true;

    this.api.post<{ reply: string }>('messaging/chatbot', { message: text }).subscribe({
      next: (res) => {
        this.messages.push({ role: 'bot', text: res.reply, time: new Date() });
        this.loading = false;
      },
      error: () => {
        this.messages.push({ role: 'bot', text: 'Sorry, I ran into an issue. Please try again.', time: new Date() });
        this.loading = false;
      },
    });
  }

  onKey(e: KeyboardEvent): void {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); this.send(); }
  }

  private scrollBottom(): void {
    try { this.chatBody.nativeElement.scrollTop = this.chatBody.nativeElement.scrollHeight; } catch {}
  }
}
