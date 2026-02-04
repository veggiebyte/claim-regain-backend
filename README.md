# Claim & Regain - Backend API

Backend API for the Claim & Regain lost and found management system.

**Frontend Repository:** https://github.com/veggiebyte/claim-regain-frontend

**Deployed API:** https://claimandregain-3cfcf8ae2dcd.herokuapp.com/

## Technologies

- Node.js
- Express
- MongoDB
- Mongoose
- JWT Authentication
- bcrypt

## API Routes

### Public Routes
- `GET /founditems` - Browse found items (public view)
- `GET /founditems/:id` - View item details

### Authentication Routes
- `POST /users/signup` - Create account
- `POST /users/signin` - Login

### Protected Routes (Authenticated)
- `POST /claims` - File a claim
- `GET /claims` - View claims (role-based)
- `PUT /claims/:id` - Update claim
- `POST /founditems` - Add found item (staff only)
- `PUT /founditems/:id` - Update item (staff only)
- `DELETE /founditems/:id` - Delete item (staff only)
