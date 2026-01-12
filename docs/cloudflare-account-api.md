# Cloudflare Account & User Management API Reference

## Overview

This document provides a comprehensive reference for the Cloudflare Account & User Management API. These endpoints allow you to manage accounts, members, roles, subscriptions, tokens, and related resources.

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

## Accounts

### List Accounts

List all accounts you have ownership or verified access to.

**Endpoint:** `GET /accounts`

**Authentication:** API Email + API Key

**Query Parameters:**

| Parameter | Type | Description | Required |
|-----------|------|-------------|----------|
| `direction` | string | Direction to order results (`asc` or `desc`) | No |
| `name` | string | Name of the account | No |
| `page` | number | Page number of paginated results (minimum: 1, default: 1) | No |
| `per_page` | number | Maximum number of results per page (maximum: 50, minimum: 5, default: 20) | No |

**Response Fields:**

```json
{
  "success": true,
  "errors": [],
  "messages": [],
  "result": [
    {
      "id": "string",
      "name": "string",
      "type": "string"
    }
  ],
  "result_info": {
    "count": 0,
    "page": 1,
    "per_page": 20,
    "total_count": 0
  }
}
```

---

### Account Details

Get information about a specific account that you are a member of.

**Endpoint:** `GET /accounts/{account_id}`

**Path Parameters:**

| Parameter | Type | Description | Required |
|-----------|------|-------------|----------|
| `account_id` | string | Account identifier tag (32 characters) | Yes |

**Response:** Returns an `Account` object containing account details.

---

### Create an Account

Create an account (only available for tenant admins at this time).

**Endpoint:** `POST /accounts`

**Body Parameters:**

| Parameter | Type | Description | Required |
|-----------|------|-------------|----------|
| `name` | string | Account name | Yes |
| `type` | string | Account type | No |

**Response:** Returns the created `Account` object.

---

### Update Account

Update an existing account.

**Endpoint:** `PUT /accounts/{account_id}`

**Path Parameters:**

| Parameter | Type | Description | Required |
|-----------|------|-------------|----------|
| `account_id` | string | Account identifier tag (32 characters) | Yes |

**Body Parameters:**

| Parameter | Type | Description | Required |
|-----------|------|-------------|----------|
| `name` | string | Account name | No |
| `type` | string | Account type | No |

**Response:** Returns the updated `Account` object.

---

### Delete a Specific Account

Delete a specific account (only available for tenant admins at this time). This is a permanent operation that will delete any zones or other resources under the account.

**Endpoint:** `DELETE /accounts/{account_id}`

**Path Parameters:**

| Parameter | Type | Description | Required |
|-----------|------|-------------|----------|
| `account_id` | string | Account identifier tag (32 characters) | Yes |

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

---

## Account Organizations

### Move Account

Move an account within an organization hierarchy or an account outside an organization. (Currently in Closed Beta - see https://developers.cloudflare.com/fundamentals/organizations/)

**Endpoint:** `POST /accounts/{account_id}/move`

**Path Parameters:**

| Parameter | Type | Description | Required |
|-----------|------|-------------|----------|
| `account_id` | string | Account identifier tag (32 characters) | Yes |

**Response:**

```json
{
  "success": true,
  "errors": [],
  "messages": [],
  "result": {
    "account_id": "string",
    "destination_organization_id": "string",
    "source_organization_id": "string"
  }
}
```

---

## Account Profile

### Get Account Profile

Get account profile information.

**Endpoint:** `GET /accounts/{account_id}/profile`

**Path Parameters:**

| Parameter | Type | Description | Required |
|-----------|------|-------------|----------|
| `account_id` | string | Account identifier tag (32 characters) | Yes |

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

### Modify Account Profile

Modify account profile information.

**Endpoint:** `PUT /accounts/{account_id}/profile`

**Path Parameters:**

| Parameter | Type | Description | Required |
|-----------|------|-------------|----------|
| `account_id` | string | Account identifier tag (32 characters) | Yes |

**Body Parameters:**

| Parameter | Type | Description | Required |
|-----------|------|-------------|----------|
| `business_address` | string | Business address | No |
| `business_email` | string | Business email | No |
| `business_name` | string | Business name | No |

---

## Logs

### Get Account Audit Logs (Version 2 Beta)

Gets a list of audit logs for an account.

**Endpoint:** `GET /accounts/{account_id}/logs/audit`

**Path Parameters:**

| Parameter | Type | Description | Required |
|-----------|------|-------------|----------|
| `account_id` | string | Account identifier tag (32 characters) | Yes |

**Important Notes:**
- This is the beta release of Audit Logs Version 2
- Audit logs are available only for the past 30 days
- Error handling is not yet implemented
- There may be gaps or missing entries in the available audit logs

**Response:**

```json
{
  "success": true,
  "errors": [],
  "messages": [],
  "result": [
    {
      "id": "string",
      "account": {},
      "action": "string"
    }
  ]
}
```

---

## Members

### List Members

List all members of an account.

**Endpoint:** `GET /accounts/{account_id}/members`

**Path Parameters:**

| Parameter | Type | Description | Required |
|-----------|------|-------------|----------|
| `account_id` | string | Account identifier tag (32 characters) | Yes |

**Response:** Returns a paginated array of `Member` objects.

---

### Member Details

Get information about a specific member of an account.

**Endpoint:** `GET /accounts/{account_id}/members/{member_id}`

**Path Parameters:**

| Parameter | Type | Description | Required |
|-----------|------|-------------|----------|
| `account_id` | string | Account identifier tag (32 characters) | Yes |
| `member_id` | string | Member identifier | Yes |

**Response:** Returns a `Member` object.

---

### Add Member

Add a user to the list of members for this account.

**Endpoint:** `POST /accounts/{account_id}/members`

**Path Parameters:**

| Parameter | Type | Description | Required |
|-----------|------|-------------|----------|
| `account_id` | string | Account identifier tag (32 characters) | Yes |

**Body Parameters:**

| Parameter | Type | Description | Required |
|-----------|------|-------------|----------|
| `email` | string | Member email address | Yes |
| `roles` | array | Array of role IDs to assign to the member | Yes |

**Response:** Returns the created `Member` object.

---

### Update Member

Modify an account member.

**Endpoint:** `PUT /accounts/{account_id}/members/{member_id}`

**Path Parameters:**

| Parameter | Type | Description | Required |
|-----------|------|-------------|----------|
| `account_id` | string | Account identifier tag (32 characters) | Yes |
| `member_id` | string | Member identifier | Yes |

**Body Parameters:**

| Parameter | Type | Description | Required |
|-----------|------|-------------|----------|
| `roles` | array | Array of role IDs to assign to the member | No |

**Response:** Returns the updated `Member` object.

---

### Remove Member

Remove a member from an account.

**Endpoint:** `DELETE /accounts/{account_id}/members/{member_id}`

**Path Parameters:**

| Parameter | Type | Description | Required |
|-----------|------|-------------|----------|
| `account_id` | string | Account identifier tag (32 characters) | Yes |
| `member_id` | string | Member identifier | Yes |

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

---

## Roles

### List Roles

Get all available roles for an account.

**Endpoint:** `GET /accounts/{account_id}/roles`

**Path Parameters:**

| Parameter | Type | Description | Required |
|-----------|------|-------------|----------|
| `account_id` | string | Account identifier tag (32 characters) | Yes |

**Response:** Returns a paginated array of `Role` objects.

---

### Role Details

Get information about a specific role for an account.

**Endpoint:** `GET /accounts/{account_id}/roles/{role_id}`

**Path Parameters:**

| Parameter | Type | Description | Required |
|-----------|------|-------------|----------|
| `account_id` | string | Account identifier tag (32 characters) | Yes |
| `role_id` | string | Role identifier | Yes |

**Response:** Returns a `Role` object.

---

## Subscriptions

### List Subscriptions

Lists all of an account's subscriptions.

**Endpoint:** `GET /accounts/{account_id}/subscriptions`

**Path Parameters:**

| Parameter | Type | Description | Required |
|-----------|------|-------------|----------|
| `account_id` | string | Account identifier tag (32 characters) | Yes |

**Response:** Returns an array of `Subscription` objects.

---

### Create Subscription

Creates an account subscription.

**Endpoint:** `POST /accounts/{account_id}/subscriptions`

**Path Parameters:**

| Parameter | Type | Description | Required |
|-----------|------|-------------|----------|
| `account_id` | string | Account identifier tag (32 characters) | Yes |

**Response:** Returns the created `Subscription` object.

---

### Update Subscription

Updates an account subscription.

**Endpoint:** `PUT /accounts/{account_id}/subscriptions/{subscription_identifier}`

**Path Parameters:**

| Parameter | Type | Description | Required |
|-----------|------|-------------|----------|
| `account_id` | string | Account identifier tag (32 characters) | Yes |
| `subscription_identifier` | string | Subscription identifier | Yes |

**Response:** Returns the updated `Subscription` object.

---

### Delete Subscription

Deletes an account's subscription.

**Endpoint:** `DELETE /accounts/{account_id}/subscriptions/{subscription_identifier}`

**Path Parameters:**

| Parameter | Type | Description | Required |
|-----------|------|-------------|----------|
| `account_id` | string | Account identifier tag (32 characters) | Yes |
| `subscription_identifier` | string | Subscription identifier | Yes |

**Response:**

```json
{
  "success": true,
  "errors": [],
  "messages": [],
  "result": {
    "subscription_id": "string"
  }
}
```

---

## Tokens

### List Tokens

List all Account Owned API tokens created for this account.

**Endpoint:** `GET /accounts/{account_id}/tokens`

**Path Parameters:**

| Parameter | Type | Description | Required |
|-----------|------|-------------|----------|
| `account_id` | string | Account identifier tag (32 characters) | Yes |

**Response:** Returns a paginated array of `Token` objects.

---

### Token Details

Get information about a specific Account Owned API token.

**Endpoint:** `GET /accounts/{account_id}/tokens/{token_id}`

**Path Parameters:**

| Parameter | Type | Description | Required |
|-----------|------|-------------|----------|
| `account_id` | string | Account identifier tag (32 characters) | Yes |
| `token_id` | string | Token identifier | Yes |

**Response:** Returns a `Token` object.

---

### Create Token

Create a new Account Owned API token.

**Endpoint:** `POST /accounts/{account_id}/tokens`

**Authentication:** API Token (requires Account API Tokens Write permission)

**Path Parameters:**

| Parameter | Type | Description | Required |
|-----------|------|-------------|----------|
| `account_id` | string | Account identifier tag (32 characters, minLength: 32, maxLength: 32) | Yes |

**Body Parameters:**

| Parameter | Type | Description | Required |
|-----------|------|-------------|----------|
| `name` | string | Token name (maxLength: 120) | Yes |
| `policies` | array | List of access policies assigned to the token | Yes |
| `condition` | object | Conditional access settings (e.g., request_ip) | No |
| `expires_on` | string | The expiration time (ISO 8601 format: date-time) | No |
| `not_before` | string | The time before which the token must not be accepted (ISO 8601 format: date-time) | No |

**Response:**

```json
{
  "success": true,
  "errors": [],
  "messages": [],
  "result": {
    "id": "string",
    "name": "string",
    "policies": [],
    "condition": {},
    "expires_on": "2026-01-12T00:00:00Z",
    "not_before": "2026-01-12T00:00:00Z",
    "status": "active"
  }
}
```

---

### Update Token

Update an existing token.

**Endpoint:** `PUT /accounts/{account_id}/tokens/{token_id}`

**Path Parameters:**

| Parameter | Type | Description | Required |
|-----------|------|-------------|----------|
| `account_id` | string | Account identifier tag (32 characters) | Yes |
| `token_id` | string | Token identifier | Yes |

**Body Parameters:**

| Parameter | Type | Description | Required |
|-----------|------|-------------|----------|
| `name` | string | Token name | No |
| `policies` | array | List of access policies assigned to the token | No |
| `condition` | object | Conditional access settings | No |
| `expires_on` | string | The expiration time (ISO 8601 format) | No |
| `not_before` | string | The time before which the token must not be accepted (ISO 8601 format) | No |

**Response:** Returns the updated `Token` object.

---

### Delete Token

Destroy an Account Owned API token.

**Endpoint:** `DELETE /accounts/{account_id}/tokens/{token_id}`

**Path Parameters:**

| Parameter | Type | Description | Required |
|-----------|------|-------------|----------|
| `account_id` | string | Account identifier tag (32 characters) | Yes |
| `token_id` | string | Token identifier | Yes |

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

---

### Verify Token

Test whether a token works.

**Endpoint:** `GET /accounts/{account_id}/tokens/verify`

**Path Parameters:**

| Parameter | Type | Description | Required |
|-----------|------|-------------|----------|
| `account_id` | string | Account identifier tag (32 characters) | Yes |

**Response:**

```json
{
  "success": true,
  "errors": [],
  "messages": [],
  "result": {
    "id": "string",
    "status": "active",
    "expires_on": "2026-01-12T00:00:00Z"
  }
}
```

---

### List Permission Groups

Find all available permission groups for Account Owned API Tokens.

**Endpoint:** `GET /accounts/{account_id}/tokens/permission_groups`

**Path Parameters:**

| Parameter | Type | Description | Required |
|-----------|------|-------------|----------|
| `account_id` | string | Account identifier tag (32 characters) | Yes |

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
      "scopes": []
    }
  ]
}
```

---

### Roll Token

Roll the Account Owned API token secret.

**Endpoint:** `PUT /accounts/{account_id}/tokens/{token_id}/value`

**Path Parameters:**

| Parameter | Type | Description | Required |
|-----------|------|-------------|----------|
| `account_id` | string | Account identifier tag (32 characters) | Yes |
| `token_id` | string | Token identifier | Yes |

**Response:** Returns a `TokenValue` object containing the new token value.

---

## Data Types

### Account

```json
{
  "id": "string",
  "name": "string",
  "type": "string"
}
```

### AccountProfile

```json
{
  "business_address": "string",
  "business_email": "string",
  "business_name": "string"
}
```

### Member

```json
{
  "id": "string",
  "email": "string",
  "status": "member" | "invited",
  "roles": []
}
```

**Status Values:**
- `member`: User is a member of the organization
- `invited`: User has an invitation pending

### Role

```json
{
  "id": "string",
  "name": "string",
  "description": "string",
  "permissions": []
}
```

### Token

```json
{
  "id": "string",
  "name": "string",
  "status": "string",
  "policies": [],
  "condition": {},
  "expires_on": "string",
  "not_before": "string"
}
```

### TokenPolicy

```json
{
  "effect": "allow" | "deny",
  "resources": {},
  "permission_groups": []
}
```

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

## Pagination

Endpoints that return lists support pagination with the following parameters:

- `page`: Page number (default: 1, minimum: 1)
- `per_page`: Results per page (default: 20, minimum: 5, maximum: 50)
- `direction`: Sort direction (`asc` or `desc`)

**Pagination Response:**

```json
{
  "result_info": {
    "count": 20,
    "page": 1,
    "per_page": 20,
    "total_count": 100
  }
}
```

---

## Rate Limits

The Cloudflare API has rate limits to prevent abuse. When you exceed the rate limit, you'll receive a `429 Too Many Requests` response.

**Headers to monitor:**
- `X-RateLimit-Limit`: Maximum requests allowed in the time window
- `X-RateLimit-Remaining`: Remaining requests in the current time window
- `X-RateLimit-Reset`: Time when the rate limit resets (Unix timestamp)

---

## Best Practices

1. **Use API Tokens** instead of Global API Keys for better security and granular permissions
2. **Implement error handling** for all API calls
3. **Respect rate limits** by implementing exponential backoff
4. **Use pagination** for large result sets
5. **Cache responses** when appropriate to reduce API calls
6. **Validate input** before making API requests
7. **Monitor token expiration** and rotate tokens regularly
8. **Use specific permissions** when creating tokens (principle of least privilege)

---

## Additional Resources

- [Cloudflare API Documentation](https://developers.cloudflare.com/api/)
- [Cloudflare Dashboard](https://dash.cloudflare.com/)
- [API Token Management](https://dash.cloudflare.com/profile/api-tokens)
- [Cloudflare Community](https://community.cloudflare.com/)
- [Organizations Documentation](https://developers.cloudflare.com/fundamentals/organizations/)

---

## Support

For API support and questions:
- Visit the [Cloudflare Community](https://community.cloudflare.com/)
- Check the [Developer Documentation](https://developers.cloudflare.com/)
- Contact Cloudflare Support through your dashboard

---

**Last Updated:** January 2026
