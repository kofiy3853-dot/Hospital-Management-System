# 🛠️ Developer Documentation - HMS Pro

## 📁 Project Structure

### Backend
- `/src/config`: Database and environment configuration.
- `/src/controllers`: Business logic for each module.
- `/src/middleware`: Security and RBAC filters.
- `/src/models`: Mongoose schemas and data validation.
- `/src/routes`: Express API endpoint definitions.
- `/src/tests`: Jest integration tests.

### Frontend
- `/src/api`: Axios client and API services.
- `/src/components`: Reusable UI components (Navbar, Cards, etc.).
- `/src/hooks`: Custom React hooks (AuthContext).
- `/src/pages`: Main view components (Dashboard, Patients).
- `/src/styles`: Design system and component-specific CSS.

## 🔐 Role-Based Access Control (RBAC)
The system uses a custom `authorize()` middleware in the backend. 
Example usage:
```javascript
router.get('/', protect, authorize('admin', 'doctor'), getRecords);
```

## 🧪 Testing Strategy
We use **Jest** and **Supertest**. 
- Integration tests focus on the API layer.
- Database models are mocked for speed and reliability.
- Environment variables are required via `app.js` to ensure the test environment matches production.

## 📦 Deployment
1. Build the frontend: `npm run build` from `/frontend`.
2. Configure environment variables in production.
3. Use a process manager like PM2: `pm2 start ecosystem.config.cjs`.
