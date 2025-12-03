# LibreChat Localhost Setup Guide

This guide will help you set up LibreChat on your local machine.

## Prerequisites

✅ Node.js 20.x or higher (you have v22.19.0)
✅ Docker and Docker Compose (you have Docker 28.4.0 and Docker Compose v2.39.4)

## Quick Start with Docker Compose (Recommended)

This is the easiest way to run LibreChat locally. All services (MongoDB, Meilisearch, PostgreSQL, RAG API) will run in Docker containers.

### Step 1: Start the Services

```bash
cd /Users/monomaly/Desktop/LibreChat-main
docker compose up -d
```

This will start:
- MongoDB (database)
- Meilisearch (search engine)
- PostgreSQL with pgvector (vector database)
- RAG API (retrieval-augmented generation)
- LibreChat API

### Step 2: Access LibreChat

Once the containers are running, open your browser and navigate to:
- **Frontend**: http://localhost:3080

### Step 3: Create Your First User

You'll need to create a user account. You can do this via the registration page or using the command line:

```bash
npm run create-user
```

Follow the prompts to create your admin user.

### Step 4: Configure AI Providers (Optional)

To use AI models, you'll need to add API keys to your `.env` file:

1. Open `.env` file
2. Uncomment and add your API keys:
   - `OPENAI_API_KEY=your-key-here` (for OpenAI models)
   - `ANTHROPIC_API_KEY=your-key-here` (for Claude models)
   - `GOOGLE_API_KEY=your-key-here` (for Google models)

3. Restart the containers:
   ```bash
   docker compose restart api
   ```

## Alternative: Local Development Setup

If you prefer to run LibreChat without Docker (for development):

### Step 1: Install Dependencies

```bash
npm ci
```

### Step 2: Build Packages

```bash
npm run build:data-provider
npm run build:data-schemas
npm run build:api
npm run build:client-package
```

### Step 3: Set Up Services Locally

You'll need to install and run:
- MongoDB (locally or use Docker for just MongoDB)
- Meilisearch (locally or use Docker)
- PostgreSQL with pgvector

### Step 4: Update .env

Update the connection strings in `.env` to point to your local services:
- `MONGO_URI=mongodb://localhost:27017/LibreChat`
- `MEILI_HOST=http://localhost:7700`

### Step 5: Start Backend

```bash
npm run backend:dev
```

### Step 6: Start Frontend (in another terminal)

```bash
npm run frontend:dev
```

## Useful Commands

### Docker Compose Commands

- **Start services**: `docker compose up -d`
- **Stop services**: `docker compose down`
- **View logs**: `docker compose logs -f`
- **Restart API**: `docker compose restart api`
- **View running containers**: `docker compose ps`

### User Management

- **Create user**: `npm run create-user`
- **List users**: `npm run list-users`
- **Reset password**: `npm run reset-password`
- **Ban user**: `npm run ban-user`

### Development

- **Update dependencies**: `npm run update:local`
- **Run tests**: `npm run test:api` or `npm run test:client`
- **Lint code**: `npm run lint`

## Configuration

### Environment Variables (.env)

The `.env` file contains all configuration. Key variables:
- `PORT`: Server port (default: 3080)
- `DOMAIN_SERVER`: Your server URL
- `CREDS_KEY` & `CREDS_IV`: Encryption keys (already generated)
- `JWT_SECRET` & `JWT_REFRESH_SECRET`: JWT tokens (already generated)
- `MEILI_MASTER_KEY`: Meilisearch master key (already generated)

### LibreChat Configuration (librechat.yaml)

The `librechat.yaml` file contains advanced configuration:
- Endpoint configurations
- Model settings
- UI customization
- Feature toggles

See `librechat.example.yaml` for all available options.

## Troubleshooting

### Port Already in Use

If port 3080 is already in use, change it in `.env`:
```
PORT=3081
```

Then update `DOMAIN_SERVER` accordingly and restart.

### Docker Issues

- **Permission denied**: Make sure Docker is running and you have permissions
- **Port conflicts**: Check if MongoDB (27017) or Meilisearch (7700) ports are in use
- **Container won't start**: Check logs with `docker compose logs api`

### Database Connection Issues

- Verify MongoDB is running: `docker compose ps`
- Check MongoDB logs: `docker compose logs mongodb`
- Verify connection string in `.env`

## Next Steps

1. **Add AI Provider Keys**: Add your OpenAI, Anthropic, or other API keys to `.env`
2. **Customize Configuration**: Edit `librechat.yaml` to customize features
3. **Create Users**: Use `npm run create-user` to create admin users
4. **Explore Features**: Check out the LibreChat documentation at https://docs.librechat.ai

## Documentation

- **Official Docs**: https://docs.librechat.ai
- **GitHub**: https://github.com/danny-avila/LibreChat
- **Discord**: https://discord.librechat.ai

## Support

If you encounter issues:
1. Check the logs: `docker compose logs -f`
2. Review the documentation
3. Check GitHub issues
4. Join the Discord community

