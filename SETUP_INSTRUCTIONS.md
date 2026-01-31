# Database Setup Instructions

## System Administrator Account

The system is pre-configured with one system administrator:

**Login Credentials:**
- Employee ID: `ADMIN01`
- Password: `admin123`

## Database Schema Updates

The following tables have been updated/created:

### 1. Users Table
- Added `role_id` foreign key referencing roles table
- Maintains `role` column for system-level roles (admin/user)

### 2. Roles Table
New table for admin-defined roles with module permissions:
- `role_name`: Unique role identifier
- Permission columns: `can_view_documents`, `can_upload_documents`, `can_edit_documents`, `can_delete_documents`, `can_manage_groups`, `can_manage_users`, `can_view_reports`, `can_export_data`

### 3. Registration Requests Table
- Updated `status` column with values: `PENDING`, `USER_FOUND`, `USER_NOT_FOUND`, `ACCOUNT_CREATED`

### 4. OTP Codes Table
- Added `employee_id` column for better user mapping

## Default Roles

The system includes four default roles:
1. **Administrator** - All permissions
2. **Manager** - Most permissions except user management
3. **Employee** - Basic document viewing and uploading
4. **Viewer** - Read-only access

## API Endpoints

### Authentication
- `POST /auth/login` - User login
- `POST /auth/register-request` - Submit registration request
- `POST /auth/change-first-password` - First-time password change
- `POST /auth/forgot-password` - Request OTP for password reset
- `POST /auth/reset-password` - Reset password with OTP

### Admin Management
- `GET /admin/registration-requests` - List registration requests
- `POST /admin/check-presence` - Verify user in mockData
- `POST /admin/create-account` - Create user account
- `PUT /admin/registration-requests/:id/status` - Update request status

### Role Management
- `GET /admin/roles` - List all roles
- `POST /admin/roles` - Create new role
- `PUT /admin/roles/:id` - Update role
- `DELETE /admin/roles/:id` - Delete role

### User Management
- `GET /admin/users` - List all users with roles
- `GET /admin/users/:id` - Get user details
- `PUT /admin/users/:id/role` - Update user role
- `DELETE /admin/users/:id` - Delete user

### Permissions
- `GET /permissions/permissions` - Get user permissions and available modules
- `POST /permissions/check-permission` - Check specific permission

## Password Requirements

Passwords must meet the following criteria:
- Minimum 8 characters, maximum 128 characters
- At least one uppercase letter
- At least one lowercase letter  
- At least one number
- At least one special character
- No common patterns (password, 123456, etc.)
- No sequential characters (abc, 123)
- No repeated characters (aaa, 111)

## User Registration Flow

1. User submits registration request
2. Admin reviews requests in management section
3. Admin clicks "Check User Presence" to verify against mockData
4. If verified, admin creates account with role assignment
5. User receives email with one-time password
6. User logs in with employee ID and OTP
7. User changes password on first login

## Role-Based Access Control

- System admins have access to all modules
- Regular users see only modules their assigned role permits
- Dashboard navigation is filtered based on role permissions
- API endpoints enforce permission checks

## Email Integration

Email sending is mocked in the console. To implement real email:
1. Configure email service in `backend/utils/emailService.js`
2. Update SMTP settings
3. Replace mock console.log with actual email sending
