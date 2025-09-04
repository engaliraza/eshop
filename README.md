# eShop - Modern E-commerce Application

A modern e-commerce application built with **Node.js** backend and **React.js** frontend, demonstrating best practices for full-stack JavaScript development.

## 🚀 Technology Stack

### Backend (Node.js)
- **Node.js** with Express.js framework
- **Sequelize** ORM for database operations
- **SQLite** database (development)
- RESTful API architecture
- JWT authentication
- Input validation and security middleware

### Frontend (React.js)
- **React.js** with functional components and hooks
- Modern ES6+ JavaScript
- Responsive design
- Component-based architecture
- API integration with fetch

## 📁 Project Structure

eShop/
├── client/                 # React.js frontend
│   ├── src/
│   │   ├── components/     # Reusable React components
│   │   ├── pages/          # Page components
│   │   ├── context/        # React context providers
│   │   └── App.js          # Main App component
│   ├── public/             # Static assets
│   └── package.json        # Frontend dependencies
├── src/                    # Node.js backend
│   ├── controllers/        # Route controllers
│   ├── models/             # Database models
│   ├── routes/             # API routes
│   ├── middleware/         # Custom middleware
│   ├── migrations/         # Database migrations
│   └── config/             # Configuration files
├── package.json            # Backend dependencies
└── server.js               # Main server file

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn package manager

### Backend Setup

1. **Install backend dependencies:**

   npm install


2. **Set up environment variables:**

   cp .env.example .env
   # Edit .env with your configuration


3. **Run database migrations:**

   npm run migrate


4. **Seed the database with sample data:**

   npm run seed


5. **Start the backend server:**

   npm start
   # or for development with auto-reload
   npm run dev


The backend server will start on `http://localhost:3000`

### Frontend Setup

1. **Navigate to client directory:**

   cd client


2. **Install frontend dependencies:**

   npm install


3. **Start the React development server:**

   npm start


The frontend will start on `http://localhost:3001`

## 🚀 Running the Application

### Development Mode

1. **Start the backend server:**

   npm run dev


2. **In a new terminal, start the frontend:**

   cd client
   npm start


3. **Access the application:**
   - Frontend: `http://localhost:3001`
   - Backend API: `http://localhost:3000`

### Production Mode

1. **Build the React frontend:**

   cd client
   npm run build


2. **Start the production server:**

   npm run start:prod


## 📚 API Documentation

### Base URL

http://localhost:3000/api/v1


### Endpoints

#### Catalog
- `GET /catalog/items` - Get all catalog items
- `GET /catalog/items/:id` - Get catalog item by ID
- `POST /catalog/items` - Create new catalog item (Admin)
- `PUT /catalog/items/:id` - Update catalog item (Admin)
- `DELETE /catalog/items/:id` - Delete catalog item (Admin)

#### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout

#### Basket
- `GET /basket` - Get user's basket
- `POST /basket/items` - Add item to basket
- `PUT /basket/items/:id` - Update basket item
- `DELETE /basket/items/:id` - Remove item from basket

#### Orders
- `GET /orders` - Get user's orders
- `POST /orders` - Create new order
- `GET /orders/:id` - Get order details

## 🧪 Testing

### Backend Tests

npm test


### Frontend Tests

cd client
npm test


## 🐳 Docker Support

### Using Docker Compose

docker-compose up --build


This will start both the backend and frontend services.

## 🔧 Environment Variables

Create a `.env` file in the root directory:

# Database
DATABASE_URL=sqlite:./dev.sqlite
NODE_ENV=development

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h

# Server
PORT=3000
CLIENT_URL=http://localhost:3001

# Email (optional)
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🎯 Features

- ✅ Product catalog browsing
- ✅ Shopping cart functionality
- ✅ User authentication & registration
- ✅ Order management
- ✅ Admin panel for product management
- ✅ Responsive design
- ✅ RESTful API
- ✅ Database migrations
- ✅ Input validation
- ✅ Error handling
- ✅ Security middleware

## 🚧 Roadmap

- [ ] Payment integration
- [ ] Product reviews and ratings
- [ ] Wishlist functionality
- [ ] Email notifications
- [ ] Advanced search and filtering
- [ ] Product recommendations
- [ ] Multi-language support
- [ ] Performance optimization

## 📞 Support

If you have any questions or need help, please open an issue on GitHub.

---

**Built with ❤️ using Node.js and React.js**