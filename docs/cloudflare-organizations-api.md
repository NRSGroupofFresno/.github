# Cloudflare Organizations API Reference

## Overview

This document provides a comprehensive reference for the Cloudflare Organizations API. These endpoints allow you to manage organizations, organization members, organization accounts, and organization profiles.

**Important:** All Organizations API endpoints are currently in **Closed Beta**. See [Cloudflare Organizations Documentation](https://developers.cloudflare.com/fundamentals/organizations/) for more information.

## Authentication

The Cloudflare API supports two authentication methods:

1. **API Token** (Recommended)
   - Header: `Authorization: Bearer <token>`
   - Create tokens at: https://dash.cloudflare.com/profile/api-tokens

2. **API Email + API Key** (Legacy)
   - Headers:
     - `X-Auth-Email: user@example.com`
     - `X-Auth-Key: <your-global-api-key>`

## Base URL

All API endpoints use the base URL: `https://api.cloudflare.com/client/v4`

---

## Organizations

### Create Organization

Create a new organization for a user.

**Endpoint:** `POST /organizations`

**Authentication:** API Email + API Key

**Required Permissions:** User Details Write

**Body Parameters:**

| Parameter | Type | Description | Required |
|-----------|------|-------------|----------|
| `name` | string | Organization name | Yes |
| `parent` | object | Parent organization details (`{ id, name }`) | No |
| `profile` | object | Organization profile (AccountProfile object) | No |

**Request Example:**

```json
{
  "name": "My Organization",
  "parent": {
    "id": "organization-parent-id",
    "name": "Parent Organization"
  },
  "profile": {
    "business_name": "My Business",
    "business_email": "contact@mybusiness.com",
    "business_address": "123 Main St, San Francisco, CA 94102"
  }
}
```

**Response:**

```json
{
  "success": true,
  "errors": [],
  "messages": [],
  "result": {
    "id": "string",
    "name": "string",
    "create_time": "2026-01-12T00:00:00Z",
    "meta": {}
  }
}
```

---

### Modify Organization

Modify an existing organization.

**Endpoint:** `PUT /organizations/{organization_id}`

**Path Parameters:**

| Parameter | Type | Description | Required |
|-----------|------|-------------|----------|
| `organization_id` | string | Organization identifier | Yes |

**Body Parameters:**

| Parameter | Type | Description | Required |
|-----------|------|-------------|----------|
| `name` | string | Organization name | No |
| `parent` | object | Parent organization details (`{ id, name }`) | No |
| `profile` | object | Organization profile | No |

**Response:** Returns the updated `Organization` object.

---

### Delete Organization

Delete an organization. The organization **MUST** be empty before deleting. It must not contain any sub-organizations, accounts, members, or users.

**Endpoint:** `DELETE /organizations/{organization_id}`

**Path Parameters:**

| Parameter | Type | Description | Required |
|-----------|------|-------------|----------|
| `organization_id` | string | Organization identifier | Yes |

**Response:**

```json
{
  "success": true,
  "errors": [],
  "messages": [],
  "result": {
    "id": "string"
  }
}
```

**Important Notes:**
- The organization must be completely empty before deletion
- All sub-organizations, accounts, members, and users must be removed first
- This is a permanent operation and cannot be undone

---

## Organization Members

### List Organization Members

List all memberships for an organization.

**Endpoint:** `GET /organizations/{organization_id}/members`

**Path Parameters:**

| Parameter | Type | Description | Required |
|-----------|------|-------------|----------|
| `organization_id` | string | Organization identifier | Yes |

**Response:**

```json
{
  "success": true,
  "errors": [],
  "messages": [],
  "result": [
    {
      "id": "string",
      "create_time": "2026-01-12T00:00:00Z",
      "meta": {},
      "user": {
        "id": "string",
        "email": "user@example.com"
      },
      "roles": []
    }
  ]
}
```

---

### Get Organization Member

Retrieve a single membership from an organization.

**Endpoint:** `GET /organizations/{organization_id}/members/{member_id}`

**Path Parameters:**

| Parameter | Type | Description | Required |
|-----------|------|-------------|----------|
| `organization_id` | string | Organization identifier | Yes |
| `member_id` | string | Member identifier | Yes |

**Response:**

```json
{
  "success": true,
  "errors": [],
  "messages": [],
  "result": {
    "id": "string",
    "create_time": "2026-01-12T00:00:00Z",
    "meta": {},
    "user": {
      "id": "string",
      "email": "user@example.com"
    },
    "roles": []
  }
}
```

---

### Create Organization Member

Create a membership that grants access to a specific organization.

**Endpoint:** `POST /organizations/{organization_id}/members`

**Path Parameters:**

| Parameter | Type | Description | Required |
|-----------|------|-------------|----------|
| `organization_id` | string | Organization identifier | Yes |

**Body Parameters:**

| Parameter | Type | Description | Required |
|-----------|------|-------------|----------|
| `email` | string | Email address of the user to add | Yes |
| `roles` | array | Array of role IDs to assign to the member | Yes |

**Request Example:**

```json
{
  "email": "newmember@example.com",
  "roles": ["role-id-1", "role-id-2"]
}
```

**Response:**

```json
{
  "success": true,
  "errors": [],
  "messages": [],
  "result": {
    "id": "string",
    "create_time": "2026-01-12T00:00:00Z",
    "meta": {},
    "user": {
      "id": "string",
      "email": "newmember@example.com"
    },
    "roles": ["role-id-1", "role-id-2"]
  }
}
```

---

### Delete Organization Member

Delete a membership from a particular organization.

**Endpoint:** `DELETE /organizations/{organization_id}/members/{member_id}`

**Path Parameters:**

| Parameter | Type | Description | Required |
|-----------|------|-------------|----------|
| `organization_id` | string | Organization identifier | Yes |
| `member_id` | string | Member identifier | Yes |

**Response:**

```json
{
  "success": true,
  "errors": [],
  "messages": []
}
```

---

## Organization Accounts

### Get Organization Accounts

Retrieve a list of accounts that belong to a specific organization.

**Endpoint:** `GET /organizations/{organization_id}/accounts`

**Path Parameters:**

| Parameter | Type | Description | Required |
|-----------|------|-------------|----------|
| `organization_id` | string | Organization identifier | Yes |

**Response:**

```json
{
  "success": true,
  "errors": [],
  "messages": [],
  "result": [
    {
      "id": "string",
      "name": "string",
      "type": "string",
      "created_on": "2026-01-12T00:00:00Z"
    }
  ]
}
```

**Response Fields:**

- `id`: Account identifier
- `name`: Account name
- `type`: Account type
- `created_on`: Timestamp when the account was created

---

## Organization Profile

### Get Organization Profile

Get an organization's profile if it exists.

**Endpoint:** `GET /organizations/{organization_id}/profile`

**Path Parameters:**

| Parameter | Type | Description | Required |
|-----------|------|-------------|----------|
| `organization_id` | string | Organization identifier | Yes |

**Response:**

```json
{
  "success": true,
  "errors": [],
  "messages": [],
  "result": {
    "business_address": "string",
    "business_email": "string",
    "business_name": "string"
  }
}
```

---

### Modify Organization Profile

Modify an organization's profile.

**Endpoint:** `PUT /organizations/{organization_id}/profile`

**Path Parameters:**

| Parameter | Type | Description | Required |
|-----------|------|-------------|----------|
| `organization_id` | string | Organization identifier | Yes |

**Body Parameters:**

| Parameter | Type | Description | Required |
|-----------|------|-------------|----------|
| `business_address` | string | Business address | No |
| `business_email` | string | Business email | No |
| `business_name` | string | Business name | No |

**Request Example:**

```json
{
  "business_name": "Updated Business Name",
  "business_email": "updated@example.com",
  "business_address": "456 New St, San Francisco, CA 94103"
}
```

**Response:**

```json
{
  "success": true,
  "errors": [],
  "messages": [],
  "result": {
    "business_address": "456 New St, San Francisco, CA 94103",
    "business_email": "updated@example.com",
    "business_name": "Updated Business Name"
  }
}
```

---

## Data Types

### Organization

```json
{
  "id": "string",
  "name": "string",
  "create_time": "2026-01-12T00:00:00Z",
  "meta": {},
  "parent": {
    "id": "string",
    "name": "string"
  },
  "profile": {
    "business_address": "string",
    "business_email": "string",
    "business_name": "string"
  }
}
```

**Fields:**
- `id`: Unique identifier for the organization
- `name`: Organization name
- `create_time`: Timestamp when the organization was created
- `meta`: Additional metadata
- `parent`: Parent organization reference (optional)
- `profile`: Organization profile information (optional)

---

### OrganizationMember

```json
{
  "id": "string",
  "create_time": "2026-01-12T00:00:00Z",
  "meta": {},
  "user": {
    "id": "string",
    "email": "string"
  },
  "roles": []
}
```

**Fields:**
- `id`: Unique identifier for the membership
- `create_time`: Timestamp when the membership was created
- `meta`: Additional metadata
- `user`: User information (id and email)
- `roles`: Array of role IDs assigned to the member

---

### OrganizationAccounts

```json
{
  "id": "string",
  "name": "string",
  "type": "string",
  "created_on": "2026-01-12T00:00:00Z"
}
```

**Fields:**
- `id`: Account identifier
- `name`: Account name
- `type`: Account type
- `created_on`: Timestamp when the account was created

---

### OrganizationProfile

```json
{
  "business_address": "string",
  "business_email": "string",
  "business_name": "string"
}
```

**Fields:**
- `business_address`: Physical business address
- `business_email`: Primary business email contact
- `business_name`: Legal business name

---

## Organization Hierarchy

Organizations in Cloudflare support hierarchical structures:

- **Parent Organizations**: Can contain child organizations and accounts
- **Child Organizations**: Belong to a parent organization
- **Accounts**: Can belong to an organization

### Hierarchy Example

```
Root Organization
├── Child Organization A
│   ├── Account 1
│   └── Account 2
└── Child Organization B
    ├── Account 3
    └── Sub-Organization C
        └── Account 4
```

### Important Hierarchy Rules

1. Organizations can have a parent organization
2. Organizations can contain accounts
3. Organizations can contain sub-organizations
4. An organization must be empty before deletion (no accounts, sub-organizations, members, or users)
5. Moving accounts between organizations is supported (see Account API documentation)

---

## Common Response Structure

All API responses follow a standard structure:

```json
{
  "success": true,
  "errors": [],
  "messages": [],
  "result": {}
}
```

**Fields:**

- `success` (boolean): Whether the API call was successful
- `errors` (array): Array of error objects if the request failed
- `messages` (array): Array of informational messages
- `result` (object|array): The requested data or operation result

### Error Response

```json
{
  "success": false,
  "errors": [
    {
      "code": 1000,
      "message": "Error description",
      "documentation_url": "https://api.cloudflare.com/#error-1000"
    }
  ],
  "messages": [],
  "result": null
}
```

---

## Common Error Scenarios

### Organization Not Empty

When attempting to delete an organization that still contains resources:

```json
{
  "success": false,
  "errors": [
    {
      "code": 10001,
      "message": "Organization must be empty before deletion"
    }
  ]
}
```

**Solution:** Remove all sub-organizations, accounts, members, and users before deleting.

### Insufficient Permissions

When attempting an operation without proper permissions:

```json
{
  "success": false,
  "errors": [
    {
      "code": 10000,
      "message": "Insufficient permissions"
    }
  ]
}
```

**Solution:** Ensure your API token or user has the required permissions (e.g., User Details Write).

### Organization Not Found

```json
{
  "success": false,
  "errors": [
    {
      "code": 10002,
      "message": "Organization not found"
    }
  ]
}
```

**Solution:** Verify the organization ID is correct and that you have access to it.

---

## Best Practices

### 1. Organization Structure

- **Plan your hierarchy**: Design your organization structure before creating organizations
- **Use meaningful names**: Give organizations clear, descriptive names
- **Document relationships**: Keep track of parent-child relationships

### 2. Member Management

- **Principle of least privilege**: Assign only the permissions members need
- **Regular audits**: Periodically review organization memberships
- **Timely removal**: Remove members who no longer need access

### 3. Account Organization

- **Group by function**: Organize accounts by department, project, or environment
- **Consistent naming**: Use a consistent naming convention for accounts
- **Regular reviews**: Audit account assignments regularly

### 4. Deletion Workflow

When deleting an organization, follow this order:

1. Remove all organization members
2. Move or delete all accounts under the organization
3. Delete all sub-organizations (recursively)
4. Delete the organization itself

### 5. API Usage

- **Use API Tokens**: Prefer API tokens over global API keys
- **Implement error handling**: Always handle API errors gracefully
- **Respect rate limits**: Implement exponential backoff for rate limiting
- **Cache when possible**: Cache organization data to reduce API calls

### 6. Beta Considerations

Since Organizations API is in Closed Beta:

- **Test thoroughly**: Test all operations in a non-production environment
- **Monitor for changes**: API endpoints may change during beta
- **Provide feedback**: Report issues or suggestions to Cloudflare
- **Have fallbacks**: Prepare alternative workflows if needed

---

## Integration Examples

### Example 1: Creating an Organization Hierarchy

```bash
# Create parent organization
curl -X POST "https://api.cloudflare.com/client/v4/organizations" \
  -H "X-Auth-Email: user@example.com" \
  -H "X-Auth-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Parent Organization",
    "profile": {
      "business_name": "Parent Corp",
      "business_email": "contact@parent.com"
    }
  }'

# Create child organization
curl -X POST "https://api.cloudflare.com/client/v4/organizations" \
  -H "X-Auth-Email: user@example.com" \
  -H "X-Auth-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Child Organization",
    "parent": {
      "id": "parent-org-id",
      "name": "Parent Organization"
    }
  }'
```

### Example 2: Adding a Member to an Organization

```bash
curl -X POST "https://api.cloudflare.com/client/v4/organizations/{org-id}/members" \
  -H "Authorization: Bearer your-api-token" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newmember@example.com",
    "roles": ["role-id-1"]
  }'
```

### Example 3: Listing Organization Accounts

```bash
curl -X GET "https://api.cloudflare.com/client/v4/organizations/{org-id}/accounts" \
  -H "Authorization: Bearer your-api-token"
```

---

## Related Documentation

- [Cloudflare Account API Documentation](./cloudflare-account-api.md)
- [Cloudflare Organizations Documentation](https://developers.cloudflare.com/fundamentals/organizations/)
- [Cloudflare API Documentation](https://developers.cloudflare.com/api/)
- [Cloudflare Dashboard](https://dash.cloudflare.com/)

---

## Beta Access

To request access to the Organizations API beta:

1. Visit [Cloudflare Organizations Documentation](https://developers.cloudflare.com/fundamentals/organizations/)
2. Follow the beta access request process
3. Wait for confirmation from Cloudflare
4. Review any beta-specific documentation provided

---

## Support

For Organizations API support:
- Visit the [Cloudflare Community](https://community.cloudflare.com/)
- Check the [Developer Documentation](https://developers.cloudflare.com/fundamentals/organizations/)
- Contact Cloudflare Support through your dashboard
- Report beta issues through the designated feedback channel

---

## Changelog

### Current Version (Beta)
- Initial beta release of Organizations API
- Support for hierarchical organization structures
- Member and account management
- Organization profiles

---

**Status:** Closed Beta
**Last Updated:** January 2026
**API Version:** v4
