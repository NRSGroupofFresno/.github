# Cloudflare WAF Custom Rules API Reference

## Overview

This document provides a comprehensive guide for creating and managing Cloudflare Web Application Firewall (WAF) custom rules using the Rulesets API. Custom rules allow you to define security policies that block, challenge, or allow traffic based on specific conditions.

**Important:** Custom rules must be deployed to the `http_request_firewall_custom` phase entry point ruleset at the zone level.

## Prerequisites

- Cloudflare account with WAF enabled
- API Token with appropriate permissions
- Zone ID for the target zone
- Understanding of Cloudflare's Ruleset Engine

## Authentication

Use API Token authentication (recommended):

```bash
Authorization: Bearer $CLOUDFLARE_API_TOKEN
```

## Base URL

All API endpoints use the base URL: `https://api.cloudflare.com/client/v4`

---

## Understanding Rulesets and Phases

### Phase Entry Points

Cloudflare uses **phases** to organize rules. Custom rules are deployed to the `http_request_firewall_custom` phase, which evaluates rules for incoming HTTP requests.

### Ruleset Structure

- **Entry Point Ruleset**: The main ruleset for a specific phase
- **Rules**: Individual security rules within a ruleset
- **Actions**: What happens when a rule matches (block, challenge, allow, etc.)
- **Expressions**: Conditions that determine when a rule matches

---

## Creating a Custom Rule

### Workflow Overview

1. **Check if entry point ruleset exists** for the `http_request_firewall_custom` phase
2. **If ruleset exists**: Add rules to the existing ruleset
3. **If ruleset doesn't exist**: Create the ruleset and add rules

### Step 1: Check if Entry Point Ruleset Exists

Use the Get a zone entry point ruleset operation to check if the ruleset exists.

**Endpoint:** `GET /zones/{zone_id}/rulesets/phases/http_request_firewall_custom/entrypoint`

**Request:**

```bash
curl "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/rulesets/phases/http_request_firewall_custom/entrypoint" \
  --header "Authorization: Bearer $CLOUDFLARE_API_TOKEN"
```

**Possible Responses:**

- **200 OK**: Ruleset exists (note the `ruleset_id` from the response)
- **404 Not Found**: Ruleset doesn't exist (proceed to create it)

---

### Step 2A: Add Rule to Existing Ruleset

If the entry point ruleset already exists, add a new rule to it.

**Endpoint:** `POST /zones/{zone_id}/rulesets/{ruleset_id}/rules`

**Request Parameters:**

| Parameter | Type | Description | Required |
|-----------|------|-------------|----------|
| `zone_id` | string | Zone identifier | Yes |
| `ruleset_id` | string | Ruleset identifier (from Step 1) | Yes |

**Request Body:**

| Field | Type | Description | Required |
|-------|------|-------------|----------|
| `description` | string | Rule description | No |
| `expression` | string | Rule matching expression | Yes |
| `action` | string | Action to take when rule matches | Yes |
| `action_parameters` | object | Additional parameters for the action | No |
| `position` | object | Position of the rule in the ruleset | No |

---

## Example A: Challenge Rule with Attack Score

This example creates a rule that challenges requests from the UK or France with an attack score lower than 20.

**Request:**

```bash
curl "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/rulesets/$RULESET_ID/rules" \
  --request POST \
  --header "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  --json '{
    "description": "My custom rule",
    "expression": "(ip.src.country eq \"GB\" or ip.src.country eq \"FR\") and cf.waf.score lt 20",
    "action": "challenge"
  }'
```

**Response:**

```json
{
  "success": true,
  "errors": [],
  "messages": [],
  "result": {
    "id": "rule-id",
    "version": "1",
    "action": "challenge",
    "expression": "(ip.src.country eq \"GB\" or ip.src.country eq \"FR\") and cf.waf.score lt 20",
    "description": "My custom rule",
    "last_updated": "2026-01-12T00:00:00Z",
    "ref": "rule-ref",
    "enabled": true
  }
}
```

**Expression Breakdown:**

- `ip.src.country eq "GB"`: Source IP is from United Kingdom
- `ip.src.country eq "FR"`: Source IP is from France
- `cf.waf.score lt 20`: Cloudflare WAF attack score is less than 20
- Logical operator: `or` for countries, `and` for score condition

---

## Example B: Block Rule with Custom Response

This example creates a rule that blocks requests with a custom plain-text response.

**Request:**

```bash
curl "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/rulesets/$RULESET_ID/rules" \
  --request POST \
  --header "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  --json '{
    "description": "My custom rule with plain text response",
    "expression": "(ip.src.country eq \"GB\" or ip.src.country eq \"FR\") and cf.waf.score lt 20",
    "action": "block",
    "action_parameters": {
      "response": {
        "status_code": 403,
        "content": "Your request was blocked.",
        "content_type": "text/plain"
      }
    }
  }'
```

**Response:**

```json
{
  "success": true,
  "errors": [],
  "messages": [],
  "result": {
    "id": "rule-id",
    "version": "1",
    "action": "block",
    "action_parameters": {
      "response": {
        "status_code": 403,
        "content": "Your request was blocked.",
        "content_type": "text/plain"
      }
    },
    "expression": "(ip.src.country eq \"GB\" or ip.src.country eq \"FR\") and cf.waf.score lt 20",
    "description": "My custom rule with plain text response",
    "last_updated": "2026-01-12T00:00:00Z",
    "enabled": true
  }
}
```

**Custom Response Parameters:**

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `status_code` | integer | HTTP status code (400-599) | 403 |
| `content` | string | Response body content | "Your request was blocked." |
| `content_type` | string | Content-Type header | "text/plain", "text/html", "application/json" |

---

### Step 2B: Create Ruleset with Initial Rules

If the entry point ruleset doesn't exist (404 response in Step 1), create it with initial rules.

**Endpoint:** `POST /zones/{zone_id}/rulesets`

**Request:**

```bash
curl "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/rulesets" \
  --request POST \
  --header "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  --json '{
    "name": "Custom WAF Rules",
    "description": "Custom firewall rules for zone",
    "kind": "zone",
    "phase": "http_request_firewall_custom",
    "rules": [
      {
        "description": "My first custom rule",
        "expression": "(ip.src.country eq \"CN\") and cf.waf.score lt 20",
        "action": "block"
      }
    ]
  }'
```

---

## Rule Actions

Custom rules support the following actions:

| Action | Description | Use Case |
|--------|-------------|----------|
| `block` | Block the request | High-risk traffic |
| `challenge` | Present a CAPTCHA challenge | Suspicious traffic |
| `js_challenge` | Present a JavaScript challenge | Bot detection |
| `managed_challenge` | Cloudflare's smart challenge | Automated bot protection |
| `allow` | Allow the request (skip other rules) | Whitelist trusted traffic |
| `log` | Log the request without taking action | Monitoring and testing |
| `skip` | Skip specific security features | Bypass certain checks |

---

## Rule Expressions

### Common Expression Fields

| Field | Description | Example |
|-------|-------------|---------|
| `ip.src` | Source IP address | `ip.src eq 192.168.1.1` |
| `ip.src.country` | Source country code (ISO 3166-1 alpha-2) | `ip.src.country eq "US"` |
| `http.host` | HTTP Host header | `http.host eq "example.com"` |
| `http.request.uri.path` | Request URI path | `http.request.uri.path contains "/admin"` |
| `http.request.method` | HTTP method | `http.request.method eq "POST"` |
| `http.user_agent` | User-Agent header | `http.user_agent contains "bot"` |
| `cf.waf.score` | Cloudflare WAF attack score (0-100) | `cf.waf.score gt 50` |
| `cf.threat_score` | Cloudflare threat score (0-100) | `cf.threat_score gt 30` |
| `cf.bot_management.score` | Bot Management score (1-99) | `cf.bot_management.score lt 30` |

### Operators

| Operator | Description | Example |
|----------|-------------|---------|
| `eq` | Equal | `ip.src.country eq "US"` |
| `ne` | Not equal | `http.request.method ne "GET"` |
| `lt` | Less than | `cf.waf.score lt 20` |
| `le` | Less than or equal | `cf.threat_score le 50` |
| `gt` | Greater than | `cf.waf.score gt 80` |
| `ge` | Greater than or equal | `cf.bot_management.score ge 70` |
| `contains` | Contains substring | `http.user_agent contains "bot"` |
| `matches` | Matches regex | `http.request.uri.path matches "^/api/"` |
| `in` | In list | `ip.src.country in {"CN" "RU"}` |

### Logical Operators

| Operator | Description | Example |
|----------|-------------|---------|
| `and` | Logical AND | `(condition1) and (condition2)` |
| `or` | Logical OR | `(condition1) or (condition2)` |
| `not` | Logical NOT | `not (condition)` |

### Expression Examples

```javascript
// Block traffic from specific countries
ip.src.country in {"CN" "RU" "KP"}

// Block requests with high attack score
cf.waf.score gt 50

// Challenge suspicious user agents
http.user_agent contains "bot" or http.user_agent contains "crawler"

// Block SQL injection attempts in query strings
http.request.uri.query contains "union select"

// Allow trusted IPs
ip.src in {192.168.1.0/24 10.0.0.0/8}

// Block specific paths for non-GET requests
http.request.method ne "GET" and http.request.uri.path contains "/admin"

// Complex rule combining multiple conditions
(ip.src.country eq "US" or ip.src.country eq "CA") and
cf.waf.score lt 30 and
http.request.method eq "POST"
```

---

## Positioning Rules

By default, new rules are added to the end of the ruleset. To specify a position, include a `position` object.

### Position Object

| Field | Type | Description |
|-------|------|-------------|
| `before` | string | Insert rule before this rule ID |
| `after` | string | Insert rule after this rule ID |
| `index` | integer | Insert rule at this position (0-based) |

### Position Examples

**Insert at the beginning:**

```json
{
  "description": "First rule",
  "expression": "...",
  "action": "block",
  "position": {
    "index": 0
  }
}
```

**Insert after a specific rule:**

```json
{
  "description": "New rule",
  "expression": "...",
  "action": "challenge",
  "position": {
    "after": "existing-rule-id"
  }
}
```

**Insert before a specific rule:**

```json
{
  "description": "New rule",
  "expression": "...",
  "action": "block",
  "position": {
    "before": "existing-rule-id"
  }
}
```

---

## Managing Custom Rules

### List All Rules

Get all rules in the entry point ruleset.

**Endpoint:** `GET /zones/{zone_id}/rulesets/phases/http_request_firewall_custom/entrypoint`

**Request:**

```bash
curl "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/rulesets/phases/http_request_firewall_custom/entrypoint" \
  --header "Authorization: Bearer $CLOUDFLARE_API_TOKEN"
```

**Response:**

```json
{
  "success": true,
  "errors": [],
  "messages": [],
  "result": {
    "id": "ruleset-id",
    "name": "Custom WAF Rules",
    "description": "Zone-level custom firewall rules",
    "kind": "zone",
    "version": "3",
    "rules": [
      {
        "id": "rule-id-1",
        "version": "1",
        "action": "block",
        "expression": "...",
        "description": "Rule 1",
        "enabled": true
      },
      {
        "id": "rule-id-2",
        "version": "1",
        "action": "challenge",
        "expression": "...",
        "description": "Rule 2",
        "enabled": true
      }
    ],
    "last_updated": "2026-01-12T00:00:00Z",
    "phase": "http_request_firewall_custom"
  }
}
```

---

### Update a Rule

Modify an existing rule in the ruleset.

**Endpoint:** `PATCH /zones/{zone_id}/rulesets/{ruleset_id}/rules/{rule_id}`

**Request:**

```bash
curl "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/rulesets/$RULESET_ID/rules/$RULE_ID" \
  --request PATCH \
  --header "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  --json '{
    "description": "Updated rule description",
    "expression": "ip.src.country eq \"CN\" and cf.waf.score lt 30",
    "action": "block"
  }'
```

**Response:** Returns the updated rule object.

**Note:** You need the ruleset ID and rule ID. Obtain these from the List All Rules operation.

---

### Delete a Rule

Remove a rule from the ruleset.

**Endpoint:** `DELETE /zones/{zone_id}/rulesets/{ruleset_id}/rules/{rule_id}`

**Request:**

```bash
curl "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/rulesets/$RULESET_ID/rules/$RULE_ID" \
  --request DELETE \
  --header "Authorization: Bearer $CLOUDFLARE_API_TOKEN"
```

**Response:**

```json
{
  "success": true,
  "errors": [],
  "messages": [],
  "result": {
    "id": "ruleset-id",
    "version": "4",
    "rules": [
      // Remaining rules
    ]
  }
}
```

---

### Enable/Disable a Rule

Toggle a rule's enabled state without deleting it.

**Request:**

```bash
curl "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/rulesets/$RULESET_ID/rules/$RULE_ID" \
  --request PATCH \
  --header "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  --json '{
    "enabled": false
  }'
```

---

## Common Tasks Reference

| Task | Method | Endpoint |
|------|--------|----------|
| List all rules | GET | `/zones/{zone_id}/rulesets/phases/http_request_firewall_custom/entrypoint` |
| Create rule | POST | `/zones/{zone_id}/rulesets/{ruleset_id}/rules` |
| Update rule | PATCH | `/zones/{zone_id}/rulesets/{ruleset_id}/rules/{rule_id}` |
| Delete rule | DELETE | `/zones/{zone_id}/rulesets/{ruleset_id}/rules/{rule_id}` |
| Create ruleset | POST | `/zones/{zone_id}/rulesets` |

---

## Best Practices

### 1. Rule Design

- **Be specific**: Use precise expressions to avoid false positives
- **Test first**: Use `log` action to test rules before blocking
- **Use comments**: Add descriptive names and descriptions
- **Order matters**: Place more specific rules before general ones
- **Combine conditions**: Use logical operators efficiently

### 2. Expression Writing

- **Use parentheses**: Group conditions clearly
- **Avoid overly broad rules**: Don't block legitimate traffic
- **Consider performance**: Simpler expressions evaluate faster
- **Use field references**: Leverage Cloudflare's rich field set
- **Test expressions**: Validate expressions before deployment

### 3. Security

- **Principle of least privilege**: Block only what's necessary
- **Layer security**: Use multiple rules for defense in depth
- **Monitor continuously**: Review rule effectiveness regularly
- **Update regularly**: Adjust rules based on threat landscape
- **Document changes**: Keep track of rule modifications

### 4. Custom Responses

- **Be informative**: Provide clear error messages (without exposing internals)
- **Use appropriate status codes**: 403 for blocked, 429 for rate limited
- **Consider user experience**: Make messages user-friendly
- **Maintain consistency**: Use consistent response formats
- **Avoid exposing security details**: Don't reveal why a request was blocked

### 5. Performance

- **Minimize rule count**: Combine similar rules when possible
- **Optimize expressions**: Use efficient operators
- **Use rule positioning**: Place frequently matched rules first
- **Disable unused rules**: Don't delete, just disable for easy re-enabling
- **Monitor rule impact**: Check for performance degradation

### 6. Testing and Deployment

- **Test in staging**: Validate rules in non-production environments
- **Use log action first**: Monitor rule matches before enforcing
- **Deploy incrementally**: Add rules gradually
- **Monitor after deployment**: Watch for false positives
- **Have a rollback plan**: Be ready to disable problematic rules quickly

---

## Common Use Cases

### 1. Country Blocking

Block traffic from specific countries:

```json
{
  "description": "Block high-risk countries",
  "expression": "ip.src.country in {\"CN\" \"RU\" \"KP\"}",
  "action": "block"
}
```

### 2. Rate Limiting by Geography

Challenge requests from specific regions with suspicious activity:

```json
{
  "description": "Challenge APAC traffic with low score",
  "expression": "ip.src.country in {\"CN\" \"IN\" \"VN\"} and cf.waf.score lt 30",
  "action": "challenge"
}
```

### 3. Admin Path Protection

Protect administrative paths:

```json
{
  "description": "Protect admin panel",
  "expression": "http.request.uri.path contains \"/admin\" and ip.src not in {192.168.1.0/24}",
  "action": "block"
}
```

### 4. Bot Protection

Block known bot user agents:

```json
{
  "description": "Block common bots",
  "expression": "http.user_agent contains \"bot\" or http.user_agent contains \"crawler\"",
  "action": "block"
}
```

### 5. SQL Injection Protection

Block potential SQL injection attempts:

```json
{
  "description": "Block SQL injection",
  "expression": "http.request.uri.query contains \"union select\" or http.request.uri.query contains \"drop table\"",
  "action": "block",
  "action_parameters": {
    "response": {
      "status_code": 403,
      "content": "Malicious request detected",
      "content_type": "text/plain"
    }
  }
}
```

### 6. API Endpoint Protection

Protect API endpoints with attack score:

```json
{
  "description": "Protect API with high attack score",
  "expression": "http.request.uri.path matches \"^/api/\" and cf.waf.score gt 50",
  "action": "block"
}
```

### 7. Whitelist Trusted IPs

Allow specific IPs to bypass security:

```json
{
  "description": "Whitelist office IPs",
  "expression": "ip.src in {192.168.1.0/24 10.0.0.0/16}",
  "action": "skip",
  "action_parameters": {
    "ruleset": "current"
  }
}
```

---

## Error Handling

### Common Errors

**Invalid Expression:**

```json
{
  "success": false,
  "errors": [
    {
      "code": 10001,
      "message": "Invalid rule expression"
    }
  ]
}
```

**Ruleset Not Found:**

```json
{
  "success": false,
  "errors": [
    {
      "code": 10000,
      "message": "Ruleset not found"
    }
  ]
}
```

**Rule Not Found:**

```json
{
  "success": false,
  "errors": [
    {
      "code": 10002,
      "message": "Rule not found"
    }
  ]
}
```

**Invalid Action:**

```json
{
  "success": false,
  "errors": [
    {
      "code": 10003,
      "message": "Invalid action specified"
    }
  ]
}
```

---

## Account-Level Custom Rules

For deploying custom rules at the account level (affecting multiple zones), refer to the Create a custom ruleset using the API documentation.

**Key Differences:**

- Use `/accounts/{account_id}/rulesets` instead of `/zones/{zone_id}/rulesets`
- Account-level rules apply to all zones under the account
- Requires different API permissions

---

## Terraform Integration

For managing WAF custom rules using Terraform, refer to the WAF custom rules configuration using Terraform documentation.

**Benefits of Terraform:**

- Infrastructure as code
- Version control for rules
- Easier multi-zone management
- Automated deployments

---

## Related Documentation

- [Cloudflare Ruleset Engine Documentation](https://developers.cloudflare.com/ruleset-engine/)
- [Cloudflare WAF Documentation](https://developers.cloudflare.com/waf/)
- [Cloudflare API Documentation](https://developers.cloudflare.com/api/)
- [Cloudflare Expression Language](https://developers.cloudflare.com/ruleset-engine/rules-language/)

---

## Additional Resources

- [Cloudflare Dashboard WAF](https://dash.cloudflare.com/)
- [Cloudflare Community](https://community.cloudflare.com/)
- [WAF Best Practices](https://developers.cloudflare.com/waf/best-practices/)
- [Security Analytics](https://developers.cloudflare.com/waf/analytics/)

---

## Support

For WAF custom rules support:
- Visit the [Cloudflare Community](https://community.cloudflare.com/)
- Check the [WAF Documentation](https://developers.cloudflare.com/waf/)
- Contact Cloudflare Support through your dashboard
- Review [Security Center](https://dash.cloudflare.com/?to=/:account/security-center)

---

**Last Updated:** January 2026
**API Version:** v4
**Product:** Cloudflare WAF (Web Application Firewall)
