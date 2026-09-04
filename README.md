# 🚀 SwiftChat – Chat Application 

A scalable, production-ready chat backend built with **Node.js, Express, TypeScript, and MongoDB**, designed using clean architecture principles and industry-standard messaging patterns.

This README documents **all the work completed so far**, the **design decisions**, and **flow diagrams** to clearly explain how the system works.


## 📌 Features Implemented (So Far)

✅ JWT-based Authentication (protected routes)

✅ Conversations

* 1:1 (DM) conversations
* Group conversations
* Group admins support

✅ Messages

* Send messages
* Fetch messages with pagination
* Conversation-level lastMessage tracking

✅ Unread Message System (Industry Standard)

* Per-user read tracking
* Unread count per conversation
* Works for DM and Group chats
* Pagination-safe


## 🧱 Core Data Models

### 1️⃣ User

Stores basic user details (name, avatar, etc.).


### 2️⃣ Conversation

Represents a chat (DM or Group).

**Key Fields:**

* `type`: `dm | group`
* `participants`: User IDs
* `admins`: User IDs (group only)
* `lastMessage`: Message ID


### 3️⃣ Message

Represents a single chat message.

**Key Fields:**

* `conversationId`
* `sender`
* `content`
* `type` (text / image / file)
* `createdAt`

Messages are **immutable**.


### 4️⃣ ConversationRead (MOST IMPORTANT)

Tracks read state **per user per conversation**.

**Meaning:**

> For a given user and conversation, what is the **last message the user has read**?

**Key Fields:**

* `conversationId`
* `userId`
* `lastReadMessageId`

This model enables scalable unread message logic.


## 🧠 Core Design Principle (Unread Messages)

❌ Messages are NOT individually marked as read

✅ Each user maintains a **read pointer** (bookmark) per conversation

A message is considered **read** if:

```
message._id <= lastReadMessageId
```

Unread messages are **derived**, not stored.


## 🔁 Flow Diagrams

### 1️⃣ Send Message Flow

```
User
  │
  ▼
Auth Middleware
  │
  ▼
sendMessageService
  │
  ├─ Validate conversation
  ├─ Validate participant
  │
  ▼
Create Message
  │
  ▼
Update Conversation.lastMessage
  │
  ▼
Return message
```

📌 Note:

* No unread state updated here
* Message writes stay fast


### 2️⃣ Fetch Messages (Mark as Read Flow)

```
User opens chat
  │
  ▼
GET /messages/:conversationId
  │
  ▼
fetchMessagesService
  │
  ├─ Validate conversation & participant
  │
  ▼
Fetch messages (paginated)
  │
  ▼
Find ConversationRead
  │   ├─ If not exists → create
  │
  ▼
Update lastReadMessageId (latest message)
  │
  ▼
Return messages
```

📌 This is the **only place** where messages are marked as read.


### 3️⃣ Fetch Conversations (Unread Count Flow)

```
User opens chat list
  │
  ▼
GET /conversations
  │
  ▼
getConversationsService
  │
  ▼
Fetch all user conversations
  │
  ▼
For each conversation:
  │
  ├─ Get ConversationRead
  ├─ Build unread query
  │     ├─ Same conversation
  │     ├─ Sender != user
  │     └─ Message > lastReadMessageId
  │
  ▼
Count unread messages
  │
  ▼
Attach unreadCount
  │
  ▼
Return conversation list
```


## 🧩 Data Relationship Diagram

```
User
  │
  ▼
Conversation
  │
  ▼
Message
  ▲
  │
ConversationRead
```

* `Conversation` is shared
* `Message` is immutable
* `ConversationRead` is user-specific


## 📊 Unread Count Formula

```
Unread Messages =
  Messages where:
    - conversationId matches
    - sender != current user
    - message._id > lastReadMessageId
```

If `lastReadMessageId` is `null` → all messages from others are unread.


## 🧪 Example Timeline

```
A sends m1
B sends m2
B sends m3
A opens chat → lastRead = m3
B sends m4
```

Unread count for A:

```
1 (m4)
```

Unread count for B:

```
0
```


---

## ⚡ Real-Time Messaging Architecture (Socket.IO)

### Design Rules
- REST APIs **create data**
- Socket.IO **delivers events**
- Clients never send messages via socket
- Server emits socket events **after DB persistence**

---

### 🏠 Socket Room Strategy

#### Conversation Room
```
conversation:<conversationId>
```
Used for:
- Real-time messages
- Typing indicators (future)
- Read receipts (future)

Joined when:
- User opens a conversation

Left when:
- User switches conversation

---

#### User Room
Used for:
- Notifications
- Unread updates
- Presence (future)

Joined on:
- Socket connection

---

### 🔁 Real-Time Message Flow

#### Sender
```
Send message → REST API
→ DB save
→ REST response
→ Sender UI updates immediately
```

#### Receiver
```
socket.on("message:new")
→ append message to state
→ UI updates instantly
```
## ⚙️ Technical Highlights

* Pagination-safe unread logic
* No per-message read flags
* One DB write per chat open
* Works for DM & Group chats
* Real-time messaging using Socket.IO


## 🔜 Next Planned Steps

* Real-time unread updates
* Aggregation-based unread optimization
* Read receipts ("Seen by X")
* Group admin permissions


## 🏁 Conclusion

This backend implements an **industry-grade chat architecture** similar to WhatsApp / Slack:

* Clean separation of concerns
* Scalable unread message design
* With real-time features


## 🎨 Frontend – Work Completed So Far

### 🔐 Authentication UI


### 🔗 Frontend ↔ Backend Integration

Frontend does **not** access refresh tokens directly.


### 🧠 Frontend Architecture


## ⚙️ Technical Highlights



## 🔜 Next Planned Steps

### Backend
- Socket.IO real-time messaging
- Redis-backed unread optimization
- Read receipts (“Seen by”)
- Group permission enforcement

### Frontend


## 🏁 Conclusion

SwiftChat implements an **industry-grade chat architecture** with:



👨‍💻 Built as part of the **SwiftChat Project**
