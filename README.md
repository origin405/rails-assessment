# Trello-like Task Board Application
A full-stack web application that mimics Trello's task board functionality, built with TypeScript, tRPC, React, and NextJS.

## Table of Contents
- Key Features
- Technologies Used
- Getting Started
- Usage
- Project Structure and Monorepo Setup
- Project Architecture
- Known Issues and Areas for Improvement
- Learning Experience
-  Reflections and Future Improvements
- Conclusion

## Key Features

1. Drag and Drop
- Implemented using react-beautiful-dnd.
- Supports reordering of task lists and moving items across lists within boards.
- Changes are applied optimistically, providing an instant UI update and syncing with the server.

2. Optimistic Updates
- The UI responds immediately to user actions, creating a smooth and responsive experience.
- Updates are batched and sent to the server, ensuring efficient data synchronization.
- If a conflict arises, the UI automatically rolls back to the last consistent state, with users notified via toast notifications.

3. Real-time Collaboration
- Utilizes Server-Sent Events (SSE) to deliver real-time updates to all connected clients.
- Each client is assigned a unique tabId to prevent self-updates and ensure accurate data reflection.
- The SSE connection includes a reconnection mechanism to handle network disruptions seamlessly.

4. Error Handling and User Feedback

- Errors and conflicts are managed with comprehensive feedback, including toast notifications and automatic UI refreshes to maintain data consistency.
- A sync check mechanism ensures that the data remains consistent across all sessions, with automatic refreshes triggered when necessary.

5. User Authentication and Persistence

- Secure user authentication is implemented, ensuring that all data is associated with the correct user.
- The application maintains persistent state across browser sessions, so users can seamlessly continue their work.

6. Responsive Design
-The user interface is designed to be responsive, providing an optimal experience across various devices and screen sizes.

## Technologies Used
- Frontend: React, NextJS
- Backend: NextJS API Routes
- API Layer: tRPC
- Database: PostgreSQL
- ORM: Prisma
- State Management: Jotai
- Authentication: Custom tRPC Auth + NextAuth
- Monorepo Management: PNPM Workspaces
- Containerization: Docker
- CI/CD: GitHub Actions
- Deployment: Vercel, Vercel Postgres
- Testing: Jest


## Getting Started
### Prerequisites

- Node.js (v14 or later)
- PNPM
- PostgreSQL

### Installation

1. **Clone the repository:**
``` bash
mkdir trello-like-app
cd trello-like-app
git clone https://github.com/origin405/rails-assessment
```
2. **Install dependencies:**
```bash 
pnpm install
```

### Environment Setup

This project uses a monorepo structure with two package.json files and one shared pnpm-lock.yaml and workspace.yaml. You'll need to configure two environment files: one at the root for the database and one for the Next.js app in apps/web.

Root .env File
Create a .env file in the root directory with the following content:

```env
DATABASE_URL=your_postgres_database_url
```
- DATABASE_URL: Replace your_postgres_database_url with the connection string for your local PostgreSQL database.

*apps/web/.env.local File*
Create a .env.local file inside the apps/web directory with the following content:

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<your-nextauth-secret>
JWT_SECRET=<your-jwt-secret>
```

- NEXTAUTH_URL: Keep this set to http://localhost:3000 for local development.

- NEXTAUTH_SECRET and JWT_SECRET: Generate unique, random hex strings of 32(Next) and 64(JWT) characters each. You can use a secure random string generator or a command like:

```bash
openssl rand -hex 32
```

### Running the Development Server
Navigate to the apps/web directory and start the development server:

```bash
cd apps/web
pnpm dev
```

You can now access the application at http://localhost:3000 in your web browser.

### Deployment
The application is deployed on Vercel with a Vercel Postgres database. You can visit the live application at:
https://rails-assessment-2wvkri3ck-lee-hong-yus-projects.vercel.app/

Note: The Server-Sent Events (SSE) functionality is currently not working properly in the production environment due to Vercel's serverless architecture. This is a known issue that will be addressed in future updates.

## Project Structure and Monorepo Setup
This project utilizes a monorepo structure managed with pnpm workspaces. The monorepo setup allows us to manage multiple packages within a single repository, sharing dependencies and configurations across different parts of the application.

***Monorepo Structure***
/
├── apps/
│   └── web/             # Next.js application
│       ├── package.json # Web app-specific dependencies
│       └── ...
├── packages/
│   └── prisma/          # Shared Prisma schema and dependencies
│       ├── package.json
│       └── schema.prisma
├── package.json         # Root package.json
├── pnpm-workspace.yaml  # pnpm workspace configuration
└── pnpm-lock.yaml       # Lock file for dependency versions

### Key Points
- Prisma dependencies and schema are shared across the monorepo.
- Next.js web app dependencies are installed in the web app package.
- This structure allows for easy expansion, e.g., adding a mobile app that shares the same database schema.

### Using pnpm for Monorepo Management
Key pnpm commands for this setup:

```node
pnpm install             # Install dependencies for all packages
pnpm run dev --filter web  # Run the dev script for the web package
```

# Add a dependency to the web app
pnpm add -D -w react-hot-toast --filter ./apps/web

**Note**: Always run pnpm install from the root directory to ensure the pnpm-lock.yaml file is properly updated.

This monorepo structure facilitates shared database schema management while keeping app-specific dependencies separate.

## Project Architecture

### Assessment Requirements
The project was built to meet the following core requirements:
- Full-stack web application using TypeScript, tRPC, React, and NextJS
- Display a list of lists (similar to Trello's task board)
- Allow users to add items to a list, move items across lists, and create/delete entire lists
- Persist state across browser sessions using a backend service and PostgreSQL database
- Implement user authentication

### Architectural Decisions
1. Database: Vercel Postgres was chosen for its seamless integration with Vercel deployment and ease of setup in a CI/CD pipeline.

2. Authentication: NextAuth was implemented for a deep dive into NextJS authentication, despite prior experience with Clerk. The  authentication flow was custom-built to work with tRPC:
- The backend handles authentication and creates a signed JWT custom token.
- The client passes this token to a NextAuth API route for decoding, verification, and session creation.
- A session provider wraps the entire application.
- NextAuth middleware protects restricted routes.
- A protected tRPC router ensures authenticated access to certain procedures.


3. State Persistence:
- Board IDs are stored in the URL for easy access and sharing.
- Backend validation ensures that only authorized users can view and modify boards.

4. Routing:
- /app/board serves as the entry point, displaying a welcome page.
- A layout component wraps the content with a header and sidebar.
- The sidebar fetches and displays the list of boards, allowing for board creation.
- Selecting or creating a board routes to /board/[boardid].


5. State Management:
- Board data (name, ID, action counter) is managed in the BoardContent component and its associated boardstate hook to optimize rendering and state management.
- Shared state, such as the selected board name, user data, and sidebar visibility, is managed using Jotai atoms across multiple components.

### Core Components

1. **BoardContent (React Component)**
Main component for rendering the board interface
Utilizes react-beautiful-dnd for drag-and-drop functionality
Manages the UI state for adding lists and cards

2. **boardState (Custom Hook)**
Manages the board's state using Jotai for global state management
Handles optimistic updates and change queuing
Communicates with the backend via tRPC


3. **useSSE (Custom Hook)**
Manages Server-Sent Events (SSE) connection for real-time updates
Handles reconnection logic and error states



### Data Flow and State Management

1. **Initialization**
- BoardContent component fetches initial board data and lists using tRPC queries
- Once data is available, it calls initializeBoard from the boardState hook


2. **User Interactions**
- User actions (e.g., adding a card, moving a list) trigger local state updates
- These changes are applied optimistically to the UI
- Changes are queued using the applyChange function from boardState


3. **Change Processing**
- Changes are batched and sent to the server after a short delay (500ms)
- This batching prevents rapid changes and potential abuse scenarios
- If a conflict occurs (e.g., another user modified the board), the UI is rolled back to the last known good state

4. **Real-time Updates**
- The SSE connection listens for board updates from other clients
- When an update is received, the board data is refetched to ensure consistency


### Server-Sent Events (SSE) Implementation

1. **Client-side (useSSE hook)**
- Establishes and manages the SSE connection
- Handles reconnection logic and error states
- Parses incoming messages and updates the local state

2. **Server-side (API Route)**
- Creates a ReadableStream for each connected client
- Adds clients to a map, keyed by boardId and tabId
- Removes clients when the connection is closed

3. **Update Distribution**
- When changes are successfully applied on the server, an SSE update is sent
- Updates are sent to all clients connected to the same board, except the originating client
- This prevents unnecessary updates and potential loops

### Security and Performance Considerations

1. **Authentication**
- All routes and tRPC procedures are protected, ensuring only authorized users can access and modify boards

2. **Rate Limiting**
- Change batching inherently provides a form of rate limiting
- Additional rate limiting could be implemented at the API level for extra protection

3. **Data Validation**
- All user inputs are validated both on the client and server side

4. **Optimistic Updates with Rollback**
- Provides a responsive UI while ensuring data consistency
- Conflicts are handled gracefully, with clear user feedback

This architecture provides a robust, real-time collaborative experience while maintaining data consistency and responsiveness. The use of optimistic updates, change batching, and SSE allows for a smooth user experience even in multi-user scenarios.

## Known Issues and Areas for Improvement
### Server-Sent Events (SSE) Issues
One of the significant challenges I faced during this project was with the Server-Sent Events (SSE) functionality. SSE was initially set up to handle real-time updates, but I encountered two critical issues:

1. SSE Compatibility with Vercel's Serverless Environment: Vercel’s serverless architecture does not fully support long-running SSE connections, leading to instability in the production environment. To resolve this, I plan to transition from SSE to WebSockets, which are better suited for real-time communication in serverless environments. This approach will also enhance the performance and reliability of the application during deployment.

2. Infinite SSE Updates: During development, I spent around three hours debugging an issue where the frontend was receiving infinite updates from the SSE, despite the backend only sending a single event. After thorough investigation, I realized that the problem was not with the SSE setup but with the frontend flow and initialization logic. This led me to redesign the component structure, resulting in a much cleaner and more maintainable codebase.

### Drag-and-Drop (DND) Functionality
Another area that consumed a significant amount of debugging time was the drag-and-drop (DND) functionality. Initially, the DND feature was not working correctly, and I spent approximately three hours troubleshooting this issue. It turned out that React's Strict Mode was causing the problem by double-invoking certain lifecycle methods, which interfered with the DND logic. Disabling Strict Mode during development resolved the issue, allowing the DND feature to function as expected.

### Understanding tRPC Behavior
While working with tRPC for the first time, I encountered challenges related to its automatic fetching behavior. Specifically, I was unaware that tRPC automatically refetches data when the component mounts or when its dependencies change. This behavior led to unexpected re-renders and data fetching, which could have been avoided with a better initial understanding of tRPC’s workings. I realized that investing more time upfront to study tRPC could have saved me several hours of debugging.

## Learning Experience
Throughout this project, I had the opportunity to learn and work with several new technologies, including:

- tRPC: Seamlessly integrating frontend and backend communication.
- TypeScript: Improving code quality and reducing runtime errors through static type checking.
- PNPM with Monorepo Structure: Managing multiple packages within a single repository.
- Next.js and NextAuth: Implementing server-side rendering, routing, and authentication.
- PostgreSQL and Prisma: Handling data persistence and ORM with PostgreSQL.
- CI/CD and Docker: Setting up automated testing and deployment pipelines.

Although I had some prior experience with monorepos and authentication using Clerk, working with NextAuth and custom JWT-based authentication presented new challenges. Additionally, TypeScript forced me to be more disciplined with types, resulting in cleaner and more reliable code.

## Reflections and Future Improvements
Looking back, I recognize that I could have opted for simpler solutions, such as using Express.js with Clerk for authentication. However, I chose to work with Next.js, NextAuth, and custom PostgreSQL JWT authentication as a learning opportunity. This decision aligns with my goal to gain experience with the tech stack used by On-Rails, the startup I’m aiming to join.

One area of regret is the lack of extensive testing. Due to time constraints, I only managed to implement a "Hello World" test within the CI/CD pipeline. While this was a successful first step, I realize the importance of comprehensive testing and plan to prioritize it in future projects.

## Conclusion
This assessment was a comprehensive and rewarding experience that covered all aspects of full-stack development, from frontend design to backend implementation, and even touched on deployment and testing. The inclusion of bonus points, such as setting up a monorepo, implementing user authentication, and configuring CI/CD pipelines, provided valuable opportunities to delve deeper into the software development lifecycle.

As a take-home test, I initially aimed to complete the project within three days, but it ended up taking almost four days, with a total of around 33 hours of work. Throughout this time, I took the initiative to tackle nearly all the bonus points, which required learning and applying several new technologies, such as tRPC, Next.js, NextAuth, and Docker, many for the first time.

I hope that my dedication to going beyond the basic requirements, and my effort to explore and integrate these new technologies, reflect the value I place on continuous learning and the desire to produce high-quality work.

