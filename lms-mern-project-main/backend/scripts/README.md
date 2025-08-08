# Admin Account Creation Scripts

This directory contains scripts for creating admin accounts in the LMS system.

## Available Scripts

### 1. `create-admin-account.js` (Recommended)
A comprehensive admin account creation script with multiple modes.

**Features:**
- Three creation modes: Quick, Custom, and Bulk
- Email validation
- Password strength validation
- Random password generation
- Duplicate account checking
- Interactive prompts
- Error handling

**Usage:**
```bash
# Navigate to backend directory
cd backend

# Run the script
node scripts/create-admin-account.js
```

**Modes:**
1. **Quick Admin** - Creates a default admin account with predefined credentials
2. **Custom Admin** - Interactive mode to create a custom admin account
3. **Bulk Admin** - Create multiple admin accounts at once

### 2. `create-admin.js`
Creates a default admin account with hardcoded credentials.

**Default Credentials:**
- Email: `admin@lms.com`
- Username: `admin`
- Password: `admin123456`

**Usage:**
```bash
node scripts/create-admin.js
```

### 3. `create-custom-admin.js`
Interactive script to create a custom admin account.

**Usage:**
```bash
node scripts/create-custom-admin.js
```

### 4. `create-admin-user.js`
Alternative admin creation script.

**Usage:**
```bash
node scripts/create-admin-user.js
```

## Prerequisites

1. **Database Connection**: Ensure your database is running and accessible
2. **Environment Variables**: Make sure your `.env` file is properly configured with:
   - `DB_TYPE` (atlas, compass, or community)
   - `MONGO_URI_ATLAS` (if using Atlas)
   - `MONGO_URI_COMPASS` (if using Compass)
   - `MONGO_URI_COMMUNITY` (if using Community)

3. **Dependencies**: Ensure all required packages are installed:
   ```bash
   npm install
   ```

## Example .env Configuration

```env
DB_TYPE=atlas
MONGO_URI_ATLAS=mongodb+srv://username:password@cluster.mongodb.net/lms
MONGO_URI_COMPASS=mongodb://localhost:27017/lms
MONGO_URI_COMMUNITY=mongodb://localhost:27017/lms
```

## Quick Start

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Run the recommended script:**
   ```bash
   node scripts/create-admin-account.js
   ```

3. **Choose your preferred mode:**
   - For quick setup: Choose mode 1 (Quick Admin)
   - For custom admin: Choose mode 2 (Custom Admin)
   - For multiple admins: Choose mode 3 (Bulk Admin)

4. **Follow the prompts** and create your admin account(s)

5. **Login to the system** using the created credentials at `http://localhost:5173/login`

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Check if your database server is running
   - Verify your connection string in `.env`
   - Ensure network connectivity

2. **"Admin account already exists"**
   - The script checks for existing accounts
   - Use different credentials or delete existing account

3. **Invalid email format**
   - Ensure email follows standard format (user@domain.com)
   - Check for typos

4. **Password validation errors**
   - Password must be at least 6 characters
   - Should contain uppercase, lowercase, and numbers
   - You can continue with weak passwords if needed

### Error Messages

- **"No connection string found"**: Check your `.env` file and `DB_TYPE` setting
- **"Unknown database type"**: Set `DB_TYPE` to one of: atlas, compass, community
- **"All fields are required"**: Fill in all required fields
- **"Invalid email format"**: Use a valid email address

## Security Notes

- **Change default passwords** after first login
- **Use strong passwords** in production environments
- **Limit admin access** to trusted users only
- **Regular password updates** are recommended

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Verify your database connection
3. Review your `.env` configuration
4. Check the console output for specific error messages
