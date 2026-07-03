# Backend Scripts

This directory contains utility scripts for database initialization and maintenance.

## Platform Admin Initialization

### Purpose
Creates the first Platform Admin (superadmin) account if one doesn't already exist.

### Usage

**Basic usage (with default credentials):**
```bash
node scripts/initPlatformAdmin.js
```

**Default credentials:**
- Email: `admin@tomato.com`
- Password: `Admin@123456`
- Name: `Platform Administrator`

### Custom Credentials

Set environment variables before running to customize credentials:

```bash
# Windows (PowerShell)
$env:PLATFORM_ADMIN_EMAIL="myemail@example.com"; $env:PLATFORM_ADMIN_PASSWORD="MySecurePass123"; $env:PLATFORM_ADMIN_NAME="My Name"; node scripts/initPlatformAdmin.js

# Linux/Mac (bash)
PLATFORM_ADMIN_EMAIL=myemail@example.com PLATFORM_ADMIN_PASSWORD=MySecurePass123 PLATFORM_ADMIN_NAME="My Name" node scripts/initPlatformAdmin.js
```

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `MONGODB_URI` | ✅ Yes | - | MongoDB connection string (from `.env`) |
| `PLATFORM_ADMIN_EMAIL` | No | `admin@tomato.com` | Platform Admin email |
| `PLATFORM_ADMIN_PASSWORD` | No | `Admin@123456` | Platform Admin password (min 8 chars) |
| `PLATFORM_ADMIN_NAME` | No | `Platform Administrator` | Platform Admin display name |

### Safety Features

- **Idempotent**: Safe to run multiple times. If a superadmin already exists, the script reports the existing account and exits without making changes.
- **Password hashing**: Uses bcrypt with salt (same mechanism as the registration endpoint).
- **Validation**: Checks password length (minimum 8 characters) and required environment variables.
- **Exit codes**: Returns `0` on success or when admin already exists, `1` on error.

### Sample Output

**First run (creates admin):**
```
✓ Connected to MongoDB

✓ Platform Admin created successfully!
  Email: admin@tomato.com
  Name: Platform Administrator
  Role: superadmin
  ID: 65f8a2b3c4d5e6f7a8b9c0d1

⚠️  IMPORTANT: Save these credentials securely!
  Login Email: admin@tomato.com
  Login Password: Admin@123456

  You can now log in to the Admin dashboard with these credentials.

✓ Disconnected from MongoDB
```

**Subsequent runs (admin already exists):**
```
✓ Connected to MongoDB
✓ Platform Admin already exists:
  Email: admin@tomato.com
  Name: Platform Administrator
  Created: 2024-03-15T10:30:45.123Z

No action taken. Script is idempotent.
```

### Security Best Practices

1. **Change the default password immediately** after first login through the Admin dashboard.
2. **Never commit credentials** to version control.
3. **Use strong passwords** in production (combination of uppercase, lowercase, numbers, and special characters).
4. **Run this script only once** per environment (development, staging, production).
5. **Keep credentials secure** - store them in a password manager.

### When to Use

- **Initial setup**: Run once when setting up a new environment.
- **Fresh database**: Run after dropping/recreating the database.
- **Recovery**: Run if the Platform Admin account is accidentally deleted.

### Troubleshooting

**Error: "MONGODB_URI environment variable is required"**
- Ensure `.env` file exists in the backend directory with `MONGODB_URI` set.

**Error: "Password must be at least 8 characters long"**
- Use a password with at least 8 characters when setting `PLATFORM_ADMIN_PASSWORD`.

**Connection errors:**
- Verify MongoDB Atlas connection string is correct.
- Check network connectivity and firewall settings.
- Ensure IP whitelist includes your current IP (MongoDB Atlas).
