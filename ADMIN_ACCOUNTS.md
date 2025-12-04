# Admin Account Credentials

## Three Admin Accounts Created

Here are your 3 admin accounts with complex passwords:

### Account 1
- **Email:** admin1@hulyas.org
- **Username:** admin1
- **Password:** `SJ&w&CB!%IH447d0`
- **Name:** Admin User 1

### Account 2
- **Email:** admin2@hulyas.org
- **Username:** admin2
- **Password:** `l@Ot%NLIz$3MQaYk`
- **Name:** Admin User 2

### Account 3
- **Email:** admin3@hulyas.org
- **Username:** admin3
- **Password:** `$c6Hw#LXYAu38pz!`
- **Name:** Admin User 3

## To Create These Accounts on Railway

Run these commands on Railway (via Railway CLI or Railway dashboard shell):

```bash
# Account 1
railway run npm run create-user admin1@hulyas.org "Admin User 1" admin1 --email-verified=true
# When prompted for password, enter: SJ&w&CB!%IH447d0

# Account 2
railway run npm run create-user admin2@hulyas.org "Admin User 2" admin2 --email-verified=true
# When prompted for password, enter: l@Ot%NLIz$3MQaYk

# Account 3
railway run npm run create-user admin3@hulyas.org "Admin User 3" admin3 --email-verified=true
# When prompted for password, enter: $c6Hw#LXYAu38pz!
```

## Or Use This Script on Railway

Create a file `create-admins-railway.js` and run it:

```bash
railway run node create-admins-railway.js
```

## Login URL

https://hulyas-ai-production.up.railway.app/

## Important Notes

- These passwords are complex and secure (16 characters with uppercase, lowercase, numbers, and symbols)
- Save these credentials securely
- After creating the accounts, you may need to manually set their role to ADMIN if they're not the first user
- Email verification is set to true, so you can login immediately

